const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// In-memory user data
const users = [];

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        // Generate a unique 6-digit code for the file
        const uniqueCode = Math.floor(100000 + Math.random() * 900000);
        cb(null, `${uniqueCode}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// Routes
app.use(express.static(path.join(__dirname, '../client')));

const usersFilePath = path.join(__dirname, 'users.json');
const filesFilePath = path.join(__dirname, 'files.json');

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Read existing user data from users.json
    const existingUsers = fs.existsSync(usersFilePath)
        ? JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
        : [];

    // Check if the username is already taken
    if (existingUsers.some(user => user.username === username)) {
        return res.status(400).send('Username already taken');
    }

    // Store user data in the array
    existingUsers.push({ username, password });

    // Save the updated user data to users.json
    fs.writeFileSync(usersFilePath, JSON.stringify(existingUsers, null, 2));

    res.status(200).send('Registration successful');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Read existing user data from users.json
    const existingUsers = fs.existsSync(usersFilePath)
        ? JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
        : [];

    // Check if the user exists
    const user = existingUsers.find(u => u.username === username);

    if (!user || user.password !== password) {
        return res.status(401).send('Invalid username or password');
    }

    // Store user in session
    req.session.user = user;

    res.redirect('/dashboard');
});


app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (req.session && req.session.user) {
            const uploadPath = path.join(__dirname, 'uploads');

            // Check if the upload directory exists
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }

            // List all files in the upload directory
            const userFiles = fs.readdirSync(uploadPath)
                .filter(file => file.startsWith(req.session.user.username));

            // Extract 6-digit code from filenames
            const filesWithCodes = userFiles.map(file => {
                const code = file.split('-')[0];
                return { code, filename: file };
            });

            // Log the filesWithCodes to the console for debugging
            console.log('Files with codes:', filesWithCodes);

            // Update files.json with the new file and code information
            const filesFilePath = path.join(__dirname, 'files.json');
            let existingFiles = [];

            try {
                const filesData = fs.readFileSync(filesFilePath, 'utf-8');
                existingFiles = JSON.parse(filesData);
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            }

            const newFiles = filesWithCodes.map(file => {
                return {
                    username: req.session.user.username,
                    code: file.code,
                    filename: file.filename,
                };
            });

            const updatedFiles = [...existingFiles, ...newFiles];

            // Log the updatedFiles to the console for debugging
            console.log('Updated files:', updatedFiles);

            fs.writeFileSync(filesFilePath, JSON.stringify(updatedFiles, null, 2));

            // Prepare HTML content for uploaded files and generated code
            const filesHtml = updatedFiles.map(file => `<li>${file.filename} (Code: ${file.code})</li>`).join('');
            const responseHtml = `
                <h2>Uploaded Files</h2>
                <ul>${filesHtml}</ul>
                <div>
                    <label for="codeInput">Enter 6-digit Code:</label>
                    <input type="text" id="codeInput" />
                    <button onclick="verifyCode()">Verify Code</button>
                </div>
            `;

            // Send the HTML content as the response
            res.send(responseHtml);
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Add this route to handle file removal
app.post('/removeFile/:code', (req, res) => {
    try {
        if (req.session && req.session.user) {
            const codeToRemove = req.params.code;
            
            // Read files.json to get the file information
            const filesFilePath = path.join(__dirname, 'files.json');
            const existingFiles = fs.existsSync(filesFilePath)
                ? JSON.parse(fs.readFileSync(filesFilePath, 'utf-8'))
                : [];

            // Check if the provided code exists for any file
            const filteredFiles = existingFiles.filter(file =>
                file.username === req.session.user.username && file.code !== codeToRemove
            );

            // Update files.json without the removed file
            fs.writeFileSync(filesFilePath, JSON.stringify(filteredFiles, null, 2));

            res.send('File removed successfully');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/verify/:code', (req, res) => {
    try {
        if (req.session && req.session.user) {
            const codeToVerify = req.params.code;

            // Read files.json to get the file information
            const existingFiles = fs.existsSync(filesFilePath)
                ? JSON.parse(fs.readFileSync(filesFilePath, 'utf-8'))
                : [];

            // Check if the provided code exists for any file
            if (existingFiles.some(file => file.username === req.session.user.username && file.code === codeToVerify)) {
                res.send('Verification successful');
            } else {
                res.status(401).send('Verification failed');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/fileList', (req, res) => {
    if (req.session && req.session.user) {
        const userFiles = fs.readdirSync(path.join(__dirname, 'uploads'))
            .filter(file => file.startsWith(req.session.user.username));

        // Extract 6-digit code from filenames
        const filesWithCodes = userFiles.map(file => {
            const code = file.split('-')[0];
            return { code, filename: file };
        });

        res.json(filesWithCodes);
    } else {
        res.redirect('/');
    }
});

// Modify this route to handle file download with code verification
app.get('/download/:code', (req, res) => {
    try {
        if (req.session && req.session.user) {
            const code = req.params.code;

            // Read files.json to get the file information
            const filesFilePath = path.join(__dirname, 'files.json');
            const existingFiles = fs.existsSync(filesFilePath)
                ? JSON.parse(fs.readFileSync(filesFilePath, 'utf-8'))
                : [];

            // Check if the provided code exists for any file
            const matchingFile = existingFiles.find(file =>
                file.username === req.session.user.username && file.code === code
            );

            if (matchingFile) {
                const fileName = matchingFile.filename;
                const filePath = path.join(__dirname, 'uploads', fileName);

                // Send the file for download
                res.download(filePath, fileName);
            } else {
                res.status(401).send('Invalid code for file download');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/dashboard', (req, res) => {
    if (req.session && req.session.user) {
        res.sendFile(path.join(__dirname, '../client/dashboard.html'));
    } else {
        res.redirect('/');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


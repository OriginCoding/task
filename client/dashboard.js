// dashboard.js

// Function to handle the response after uploading a file
function handleUploadResponse(response) {
    const uploadedFilesSection = document.getElementById('uploadedFiles');
    const filesList = document.getElementById('filesList');
    const codeSection = document.getElementById('codeSection');
    const uploadSuccessMessage = document.getElementById('uploadSuccessMessage'); // Added this line

    // Display the uploaded files and generated code
    filesList.innerHTML = response;

    // Hide the code verification section
    codeSection.style.display = 'none';

    // Show the upload success message
    uploadSuccessMessage.style.display = 'block'; // Added this line
}
// dashboard.js

// ... (existing functions)

// Function to fetch and display the list of uploaded files
function fetchFileList() {
    fetch('/fileList')
        .then(response => response.json())
        .then(data => {
            const filesList = document.getElementById('filesList');
            const fileListHtml = data.map(file => `<li>${file.filename} (Code: ${file.code})</li>`).join('');
            filesList.innerHTML = `<h2>Uploaded Files</h2><ul>${fileListHtml}</ul>`;
        })
        .catch(error => console.error('Error:', error));
}

// Function to handle the response after uploading a file
function handleUploadResponse(response) {
    const uploadedFilesSection = document.getElementById('uploadedFiles');
    const codeSection = document.getElementById('codeSection');
    const uploadSuccessMessage = document.getElementById('uploadSuccessMessage');

    // Display the uploaded files and generated code
    uploadedFilesSection.innerHTML = response;

    // Fetch and display the list of uploaded files for the user
    fetchFileList();

    // Hide the code verification section
    codeSection.style.display = 'none';

    // Show the upload success message
    uploadSuccessMessage.style.display = 'block';
}

// ... (existing functions)

// Function to verify the 6-digit code
function verifyCode() {
    const codeInput = document.getElementById('codeInput').value;

    // Send a request to verify the code
    fetch(`/verify/${codeInput}`)
        .then(response => response.text())
        .then(data => handleCodeVerificationResponse(data))
        .catch(error => console.error('Error:', error));

}

// Function to handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    // Send a request to upload the file
    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(data => handleUploadResponse(data))
    .catch(error => console.error('Error:', error));
}

// Function to handle the response after removing a file
function handleRemoveResponse(response) {
    const removeSection = document.getElementById('removeSection');
    const removeSuccessMessage = document.getElementById('removeSuccessMessage'); // Added this line

    // Hide the remove section
    removeSection.style.display = 'none';

    // Show the remove success message
    removeSuccessMessage.style.display = 'block'; // Added this line
}

// Function to remove a file
function removeFile() {
    const removeCodeInput = document.getElementById('removeCodeInput').value;

    // Send a request to remove the file
    fetch(`/removeFile/${removeCodeInput}`, { method: 'POST' })
        .then(response => response.text())
        .then(data => handleRemoveResponse(data))
        .catch(error => console.error('Error:', error));
}

function generateDownloadLink() {
    var fileName = document.getElementById('codeInput').value;

    // Display the download link
    var downloadLink = document.getElementById('downloadLink');
    downloadLink.innerHTML = `<a href="/download/${fileName}" download>Download ${fileName}</a>`;
}

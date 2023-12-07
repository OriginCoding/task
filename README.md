# task
 
# User Authentication and File Upload System

This Node.js project provides a simple user authentication system and a file upload feature with code verification. Users can register, log in, upload files, view their uploaded files, 
and download files using a unique 6-digit code.

## Prerequisites

- Node.js installed on your machine

## Getting Started

1. Clone the repository to your local machine:

   ```bash
   git clone <[repository_url](https://github.com/OriginCoding/task.git)>


Install the dependencies:

cd <project_directory>

npm install

Run the application:

npm start

The server will start running on http://localhost:3000.

Usage

1. Register

Open your web browser and navigate to http://localhost:3000/register.

Enter a username and password, then click the "Register" button.

2. Login

Navigate to http://localhost:3000/login.

Enter your registered username and password, then click the "Login" button.

3. Upload File

After logging in, go to the dashboard at http://localhost:3000/dashboard.

Use the "Upload File" section to choose a file and click the "Upload" button.

4. View Uploaded Files

The dashboard will display a list of uploaded files in the "Uploaded Files" section.

5. Download File

Click on the "Download File" link next to the file you want to download.

Enter the 6-digit code when prompted.

6. Remove File

In the "Remove File" section, enter the 6-digit code for the file you want to remove and click "Remove File."

Additional Notes

can use check_files_uploaded_privacy file to have the 6 digit code and file name displayed privately for n users

Uploaded files are stored in the uploads directory.

User data is stored in users.json.

File data is stored in files.json.

Contributing

Feel free to contribute to the development of this project by opening issues or submitting pull requests.

License
This project is licensed under the MIT License - see the LICENSE file for details.


Replace `<[repository_url](https://github.com/OriginCoding/task.git)>` and `<project_directory>` with the actual repository URL and project directory on your local machine. 
Customize the README based on your project's specific details.

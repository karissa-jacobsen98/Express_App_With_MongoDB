# User_Login_System

This is a basic express application with a user registration and login system.

## MongoDB
* uses mongoDB as a database to create and store users for registration and login pages.
* uses models/user.js to create a template for info a user should store.

## Bcrypt
* uses a hash function to encrypt the user password before storing into database and when comparing passwords for login

## Passport
* supports authentication using username and password
* can also be extended to include google login, facebook login etc.

## Multer
* Used for uploading profile pictures in registration form.

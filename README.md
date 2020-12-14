# My Drive
* Cloud based file storage application (similar to Google Drive/Dropbox) for uploading and accessing files from any device, anywhere
* ReactJS front-end to upload and render files and photos, create folders, move files in a virtual file system
* NodeJS REST API (using ExpressJS), accessing MongoDB database for file and user details storage
* File and Photo uploads, storage in database and fetching from server through CRUD API
* User Login and email verification through JWT tokens and Google OAuth Authorization


## Table of contents
* [General info](#general-info)
* [Live Application](#live-application)
* [Key Technologies](#key-technologies)
* [Setup](#setup)
* [Features](#features)


## General info
This project is a practice/demonstration for creating a complex Full Stack Application using the MERN stack

## Live Application
> The application can be on the Firebase link![My Drive](https://mydrive-5969d.web.app/)

## Key Technologies
* React - v16.13.1
* Node - v14.3.0
* Express - v4.17.1
* gridfs-stream - v1.1.1
* nodemailer - v2.0.4
* google-auth-library - v6.1.3
* Sharp - v0.25.4

## Setup
To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone the backend NodeJS server
$ git clone https://github.com/Dhruv90/MyDrive-Backend.git

# Go into the repository
$ cd Cloud Drive

# Install dependencies
$ npm install

# Run the app
$ npm start
```

```bash
# Clone the ReactJS front end application
$ git clone https://github.com/Dhruv90/MyDrive-Frontend.git

# Go into the repository
$ cd mydrive

# Install dependencies
$ npm install

# Run the app
$ npm start
```

## Features
* Create your personal account on MyDrive using your Google Account or setting up a new account through email verification 
* Upload files and/or photos to your account and store them in a MongoDB based remote drive
* Create folders inside your drive to move and organize and your files and photos
* Download, Delete, and Access your files from anywhere
* Responsive design - can be accessed from mobiles/tables/desktop
* Can view photos and pdf files from inside the application without downloading
* Increased the response time for loading photo previews by resizing and storing thumbnails of photos in the database


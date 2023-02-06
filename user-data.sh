#!/bin/bash

// Update the system
yum update -y

// Install Nodejs
curl -sL https://rpm.nodesource.com/setup_15.x | bash -
yum install -y nodejs

// Install Git
yum install -y git

// Get the app from GitHub
git clone https://github.com/swotino/aws-demo.git

// Enter the app directory
cd aws-demo

// Create .env file
echo "REGION=eu-west-1" > .env

// Install the app dependencies
npm install

// Start the app
npm start

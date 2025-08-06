Schedula Data Disruptors Backend

A  starter NestJS backend application for the Schedula project by Team Data Disruptors member Vishal Jituri. It includes a simple "Hello World" API endpoint to verify setup and serve as a foundation for further development.

Features
 1. NestJS 10+ boilerplate

 2. Modular structure for easy feature expansion

 3. Example GET API endpoint: /hello

Getting Started:
Prerequisites:
1. Node.js (v18+ recommended)
2. npm
3. Nest CLI (optional but recommended)

Installation:
1. Clone the repository:
git clone https://github.com/your-org/doctor-appointment-app.git
cd doctor-appointment-app
2. Install dependencies:
npm install

Running the Application:
Start the development server:
npm run start
The server will start on http://localhost:3000.

API Endpoint:
GET /hello
Returns a simple JSON greeting.

Request:
GET http://localhost:3000/hello
Response:
{
  "message": "Hello World"
}

Project Structure:
src/
├── app.module.ts
└── hello/
    └── hello.controller.ts
hello.controller.ts: Contains the /hello GET endpoint.

License:
This project is private and proprietary to Pearl Thoughts Internship Program.
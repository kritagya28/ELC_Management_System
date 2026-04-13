# ELC Management System

A comprehensive full-stack web application designed to automate and streamline learning center activities. This platform handles database management, robust user authentication, and provides a clean, professional dashboard interface for administrators and users.

## 🚀 Features

* **Secure Authentication:** Robust user login and registration flows.
* **Activity Automation:** Streamlines daily operations and records management for the learning center.
* **Modern UI/UX:** A minimalist, professional frontend styled with Tailwind CSS.
* **Type-Safe Codebase:** Heavily utilizes TypeScript for improved maintainability and developer experience.
* **Cloud-Ready:** Structured for seamless cloud deployment (e.g., AWS).

## 🛠️ Tech Stack

**Frontend (`/elc-frontend`)**
* Next.js / React
* TypeScript
* Tailwind CSS

**Backend (`/my-api`)**
* Node.js
* Express.js
* MongoDB (Mongoose)

## 📁 Repository Structure

```text
ELC_Management_System/
├── elc-frontend/       # Next.js frontend application
└── my-api/             # Node.js/Express backend API
⚙️ Getting Started
Follow these instructions to set up the project locally on your machine.

Prerequisites
Node.js (v16 or higher recommended)

npm or Yarn

MongoDB (Local instance or MongoDB Atlas URI)

1. Clone the repository
Bash
git clone [https://github.com/kritagya28/ELC_Management_System.git](https://github.com/kritagya28/ELC_Management_System.git)
cd ELC_Management_System
2. Backend Setup (my-api)
Open a terminal and navigate to the backend directory:

Bash
cd my-api
npm install
Create a .env file in the my-api directory and add your environment variables:

Code snippet
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
Start the backend server:

Bash
npm run dev
3. Frontend Setup (elc-frontend)
Open a new terminal window and navigate to the frontend directory:

Bash
cd elc-frontend
npm install
Create a .env.local file in the elc-frontend directory to link your API:

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:5000/api
Start the frontend development server:

Bash
npm run dev
The application should now be running! The frontend is typically accessible at http://localhost:3000 and the backend at http://localhost:5000.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.


### Quick Tips for Finalizing:
* **Environment Variables:** Make sure the `.env` keys I listed match exactly what you are using in your code (e.g., if you named it `MONGO_URL` instead of `MONGODB_URI`, just tweak it in the template).
* **Scripts:** Verify that `npm run dev` is the correct script you are using in yo

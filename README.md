# College Management System

A comprehensive web-based platform designed to streamline and automate the various administrative tasks involved in managing a college. This system handles tasks related to students, faculty, courses, attendance, and more, providing an efficient, user-friendly experience.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
- **Student Management:** Add, edit, and delete student profiles.
- **Faculty Management:** Manage faculty details and their assigned courses.
- **Course Management:** Create and manage course offerings.
- **Attendance Tracking:** Record and track student attendance.
- **Grades and Performance:** Manage student grades and generate reports.
- **User Authentication:** Secure login for students, faculty, and admins.
- **Responsive Design:** Accessible on desktop, tablet, and mobile devices.

## Technologies Used
- **Frontend:**
  - HTML, CSS, JavaScript
  - React.js (for user interface)
- **Backend:**
  - Node.js, Express.js
- **Database:**
  - MongoDB (NoSQL database for storing information)
- **Other Tools:**
  - Nodemailer (for email notifications)
  - JWT (JSON Web Tokens for authentication)

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Trusha2102/College-Management-System.git
   ```

2. Navigate into the project directory:
   ```bash
   cd College-Management-System
   ```

3. Install the dependencies for both backend and frontend:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the backend directory and configure the following variables:
     ```bash
     PORT=5000
     MONGODB_URI=<Your MongoDB connection string>
     JWT_SECRET=<Your JWT secret>
     EMAIL_USER=<Your email address>
     EMAIL_PASS=<Your email password>
     ```

5. Run the project:
   ```bash
   # Run backend server
   cd backend
   npm start
   
   # Run frontend
   cd ../frontend
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Admin:**
   - Login as admin to manage students, faculty, and courses.
   - Add new users and assign roles.
  
2. **Faculty:**
   - View and manage assigned courses.
   - Track and update student attendance and grades.

3. **Students:**
   - View enrolled courses, attendance records, and grades.
   - Update personal profile information.

## Contributing
Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add a new feature"
   ```
4. Push the changes to your forked repository:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request on the `main` branch.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For any questions or suggestions, feel free to contact me:

- **Name:** Trusha Jadeja
- **Email:** trushababjadeja2003@gmail.com
- **GitHub:** [Trusha2102](https://github.com/Trusha2102)

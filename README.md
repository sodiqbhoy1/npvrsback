# HealthNet Backend Documentation

## Overview
This project is the backend for HealthNet, a hospital management system built with Node.js, Express, Prisma ORM, and MySQL. It provides APIs for super admin and hospital registration, authentication, and management.

## Features
- Super Admin registration and login
- Hospital registration and login
- Unique 10-digit hospital IDs
- Password hashing with bcryptjs
- JWT-based authentication
- Email notifications for hospital registration
- Pending approval workflow for hospitals

## Technologies Used
- Node.js
- Express.js
- Prisma ORM
- MySQL
- bcryptjs
- jsonwebtoken
- nodemailer

## Setup Instructions
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in a `.env` file:
   ```env
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   GMAIL_USER=your_gmail_address
   GMAIL_PASSWORD=your_gmail_app_password
   JWT_SECRET=your_jwt_secret
   ```
3. Update the Prisma schema if needed and run migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. Start the server:
   ```bash
   node index.js
   ```

## Key Endpoints
### Super Admin
- `POST /superadmin/register` — Register a new super admin
- `POST /superadmin/login` — Login as super admin

### Hospital
- `POST /hospital/register` — Register a new hospital (sends confirmation email)
- `POST /hospital/login` — Login as hospital

## Code Highlights
- **Unique Hospital ID Generation:**
  - Each hospital is assigned a unique 10-digit ID during registration.
- **Email Notification:**
  - Hospitals receive a confirmation email after successful registration.
- **Password Security:**
  - Passwords are hashed using bcryptjs before storing in the database.
- **Error Handling:**
  - All endpoints return appropriate status codes and messages for success and error cases.

## How to Resume Work
- Review the code in the `controllers` folder for endpoint logic.
- Check the Prisma schema in `prisma/schema.prisma` for models and relationships.
- Update environment variables as needed.
- Use the README for setup and endpoint reference.

## Contact
For questions or support, please contact the project maintainer.

# Job Application Tracker

A full-stack web application to track job applications and their statuses with authentication, file upload, and timeline visualization.

## Features

### Backend Features
- **Authentication**: JWT-based authentication with user registration and login
- **CRUD Operations**: Complete job application management (Create, Read, Update, Delete)
- **File Upload**: Resume upload functionality with multer
- **Status Tracking**: Track job application status changes with history
- **Data Filtering**: Filter jobs by status and sort options
- **Statistics**: Get application statistics and analytics

### Frontend Features
- **Dashboard**: Overview of all job applications with statistics
- **Job Management**: Add, edit, view, and delete job applications
- **Status Updates**: Quick status updates with visual indicators
- **Timeline View**: Visual timeline of all application status changes
- **Responsive Design**: Modern, clean UI that works on all devices
- **File Management**: Upload and download resume files

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** with **TypeScript**
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management
- **Date-fns** for date formatting

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your settings:
   ```
   MONGO_URI=mongodb://localhost:27017/job-tracker
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/stats` - Get job statistics
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/status` - Update job status
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/:id/resume` - Download resume

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Jobs**: Use the "Add Job" button to create new job applications
3. **Track Status**: Update job statuses as you progress through the interview process
4. **View Timeline**: Check the timeline page to see the progression of all applications
5. **Upload Resumes**: Attach resume files to job applications
6. **Analytics**: View statistics on your dashboard to track your job search progress

## Job Status Flow

The application supports the following status progression:
- **Applied** → **Interview** → **Offer**
- **Applied** → **Interview** → **Rejected**
- **Applied** → **Rejected**

Each status change is tracked in the job's status history for timeline visualization.

## File Structure

```
project/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Job.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── jobRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── uploads/
│   │   └── resumes/
│   ├── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── services/
    │   ├── types/
    │   └── App.tsx
    └── package.json
```

## Future Enhancements

- Email notifications for interview reminders
- Integration with job boards (LinkedIn, Indeed)
- Advanced analytics and reporting
- Interview notes and feedback tracking
- Calendar integration for interview scheduling
- Export functionality (PDF reports)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

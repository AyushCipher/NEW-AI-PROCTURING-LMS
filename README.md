# Virtual Courses - AI LMS

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A production-oriented AI-powered Learning Management System built for modern online education workflows. The platform combines course publishing, lecture delivery, assessments, proctoring, certificates, payments, media processing, and role-based dashboards for students, educators, and administrators.

## Overview

Virtual Courses - AI LMS is designed to support the full lifecycle of an online learning product:

- educators can build and manage courses, lectures, and exams
- students can enroll, learn, take timed assessments, and earn certificates
- administrators can review teachers, course activity, and student progress
- the platform supports real-time features, secure authentication, and background media processing

The application is split into a React frontend and an Express/MongoDB backend, with integrations for cloud storage, payments, AI services, email delivery, and video processing.

## Key Features

- Role-based access for students, educators, and administrators
- Course publishing, editing, lecture management, and enrollment tracking
- Video lecture upload with background transcoding to streaming-ready formats
- Exam creation, question authoring, grading, analytics, and attempt history
- AI-based proctoring for exam monitoring and violation capture
- Certification interview flow and downloadable certificates
- Real-time course updates and socket-powered classroom interactions
- Secure authentication, OTP flows, password reset, and session handling
- Payment workflow for course purchases
- Cloud media storage for course assets, lecture files, and certificates
- Admin review workflows for teachers and course oversight

## Project Architecture

```mermaid
graph TD
  A[React + Vite Frontend] --> B[Express API Backend]
  B --> C[(MongoDB)]
  B --> D[Cloudinary]
  B --> E[Razorpay]
  B --> F[Socket.io]
  B --> G[Email Service]
  B --> H[AI Services]
  B --> I[YOLO Proctoring Service]
  B --> J[Background Media Processing]

  A --> K[Course UI]
  A --> L[Exam UI]
  A --> M[Admin / Educator Dashboards]
  A --> N[Certificate Views]
```

### High-Level Flow

```mermaid
sequenceDiagram
  autonumber
  participant User as Student / Educator / Admin
  participant UI as React Frontend
  participant API as Express Backend
  participant DB as MongoDB
  participant Media as Cloudinary / Processing
  participant AI as AI & Proctoring Services

  User->>UI: Interact with dashboard
  UI->>API: Send authenticated request
  API->>DB: Read or write application data
  API->>Media: Upload or process media assets
  API->>AI: Trigger exam proctoring or AI-assisted operations
  API-->>UI: Return response
  UI-->>User: Render updated state
```

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Redux Toolkit, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express 5, Socket.io, Multer, JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| Media & Storage | Cloudinary, FFmpeg, HLS video pipeline |
| Payments | Razorpay |
| Communication | Nodemailer, Socket.io |
| AI & Automation | Google Gemini, Claude, ElevenLabs, HeyGen, DID, FAL, YOLO-based proctoring service |
| QA / Utilities | ESLint, Toast notifications, reusable hooks, queue-based background jobs |

## Folder Structure

```text
.
├── backend/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── queue/
│   ├── routes/
│   ├── services/
│   ├── socket.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── customHooks/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── package.json
├── README.md
└── ...
```

## Installation Guide

### Prerequisites

- Node.js 18 or newer
- npm 9+ or a compatible package manager
- MongoDB connection string
- Cloudinary account
- Razorpay account for payments
- Email credentials for password reset and notifications
- API keys for any enabled AI features
- Python 3.11+ if you plan to run the YOLO proctoring service locally

### 1. Clone the repository

```bash
git clone <repo-url>
cd "3. Virtual Courses - AI LMS"
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend folder and, if needed, one for the frontend.

## Environment Variables

### Backend

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend server port, defaults to `8000` |
| `MONGODB_URL` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `FRONTEND_URL` | Public frontend URL used in emails and socket origin checks |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_SECRET` | Razorpay key secret |
| `EMAIL` | Outbound mail account |
| `EMAIL_PASS` | Mail account password or app password |
| `GEMINI_API_KEY` | Gemini API key |
| `YOLO_SERVICE_URL` | URL of the YOLO proctoring service |

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend API base URL |

### Example backend `.env`

```env
PORT=8000
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/virtual-courses
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

EMAIL=your-email@example.com
EMAIL_PASS=your-email-password

GEMINI_API_KEY=your_gemini_key

YOLO_SERVICE_URL=http://localhost:5001
```

## Running the Project

### Backend

```bash
cd backend
npm run dev
```

The API server starts on the configured `PORT` and exposes the main application routes under `/api`.

### Frontend

```bash
cd frontend
npm run dev
```

The Vite development server runs the UI, typically on `http://localhost:5173`.

### Optional backend utility

```bash
cd backend
npm run make-admin
```

## API Endpoints

Below is a representative overview of the API surface. The backend contains additional instructor and admin routes for detailed workflows.

| Category | Representative Endpoints |
| --- | --- |
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/logout`, `POST /api/auth/sendotp`, `POST /api/auth/verifyotp`, `POST /api/auth/resetpassword` |
| Courses | `POST /api/course/create`, `GET /api/course/getpublishedcourses`, `GET /api/course/getcreatorcourses`, `GET /api/course/getcourse/:courseId`, `POST /api/course/editcourse/:courseId`, `DELETE /api/course/removecourse/:courseId` |
| Lectures | `POST /api/course/createlecture/:courseId`, `GET /api/course/getcourselecture/:courseId`, `POST /api/course/editlecture/:lectureId`, `DELETE /api/course/removelecture/:lectureId`, `GET /api/course/downloadassignment/:lectureId` |
| Exams | `POST /api/exam/create/:courseId`, `GET /api/exam/course/:courseId`, `POST /api/exam/:examId/start`, `POST /api/exam/attempt/:attemptId/submit`, `GET /api/exam/attempt/:attemptId/result`, `GET /api/exam/student/history` |
| Proctoring | `POST /api/proctoring/analyze-frame`, `POST /api/proctoring/event/:attemptId`, `POST /api/proctoring/tab-switch/:attemptId`, `GET /api/proctoring/status/:attemptId`, `GET /api/proctoring/dashboard` |
| Certification | `GET /api/certification/completion/:courseId`, `POST /api/certification/start-interview`, `GET /api/certification/question/:sessionId`, `POST /api/certification/submit-answer`, `GET /api/certification/my-certificates` |
| Video | `POST /api/video/upload/:courseId/:lectureId`, `GET /api/video/status/:lectureId`, `POST /api/video/retry/:lectureId`, `DELETE /api/video/:lectureId` |
| Admin | `GET /api/admin/...` and related educator review routes for teacher and course governance |

## Screenshots

| Screen | Preview |
| --- | --- |
| Home page | ![Home page](./docs/screenshots/home.png) |
| Course dashboard | ![Course dashboard](./docs/screenshots/course-dashboard.png) |
| Exam workflow | ![Exam workflow](./docs/screenshots/exam-flow.png) |
| Certification result | ![Certification result](./docs/screenshots/certificate.png) |

## Future Improvements

- Expand analytics dashboards for educators and administrators
- Add richer accessibility support across the student learning flow
- Improve automated test coverage for exam and certificate journeys
- Add production deployment guides for containerized environments
- Introduce more granular content recommendations based on learner progress
- Strengthen observability with request tracing and richer application metrics

## Challenges Solved

- Built a multi-role application with different permissions and user journeys
- Coordinated media uploads, lecture publishing, and background transcoding
- Designed secure exam flows with attempt tracking and proctoring events
- Implemented certificate generation and verification workflows
- Connected multiple external APIs without breaking the core learning experience
- Kept the frontend responsive while handling complex state across many pages

## Learning Outcomes

- Full-stack application design with React, Express, and MongoDB
- Role-based authorization and protected route architecture
- API design for course, exam, and certification workflows
- Practical integration of external services in a production-style system
- Media pipeline thinking for video delivery and asynchronous processing
- Building a project that balances product features with maintainable structure

## Why This Project Stands Out

- It is more than a basic CRUD LMS; it covers education, assessment, certification, and administration in one system.
- The platform demonstrates real-world product thinking with authentication, payments, video processing, and proctoring.
- The architecture shows full-stack depth across frontend UX, backend orchestration, and service integrations.
- The project is strong portfolio material because it reflects end-to-end ownership, not just isolated UI work.

## License

This project is licensed under the ISC License. See the license terms in the repository or infer the default package metadata from the backend service.

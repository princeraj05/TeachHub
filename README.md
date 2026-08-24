# MySchool Admin Panel

A full-stack School Management System built using React, Node.js, Express, and MongoDB.

## Features

* Admin Dashboard
* Teacher Panel
* Student Panel
* Class Management
* Attendance System
* Exam Scheduling
* Real-time updates with Socket.io

## Tech Stack

Frontend:

* React
* Vite
* TailwindCSS

Backend:

* Node.js
* Express
* MongoDB
* Socket.io

## Installation

### Backend

```
cd backend
npm install
npm start
```

### Frontend

```
cd frontend
npm install
npm run dev
```
Live Demo:
https://myschool-admin-panel.vercel.app

Backend API:
https://myschool-admin-panel.onrender.com
## Author

Prince Raj

## Payment configuration

Payment credentials are backend-only. Copy `backend/.env.example` to the secure backend environment and provide Razorpay Test/Live key pairs plus the webhook secret. Never add a Razorpay secret to `frontent/.env` or a `VITE_*` variable.

Amounts in payment configuration APIs are integer paise (for example, `100000` is ₹1,000). Razorpay checkout must use the safe order response from the backend and send its callback only to `POST /api/payments/verify-checkout`; the webhook endpoint is `POST /api/payments/webhook`.

# Facial Recognition System

## Overview

This is a **Facial Recognition System** built with **Next.js**, **Node.js (Express)**, **FastAPI (Python)**, and **MongoDB**.  
It includes **face verification**, **liveness detection**, and **multi-factor authentication (MFA)**.

---

## Tech Stack
- **Frontend**: Next.js (React)  
- **Backend**: Node.js + Express  
- **FastAPI**: Python (used for face detection and liveness check)  
- **Database**: MongoDB  
- **Authentication**: JWT (JSON Web Tokens)  
- **Styling**: TailwindCSS

---

## Features

- User registration and login via **email/password**
- **Face verification** using facial recognition
- **Liveness detection** to avoid spoofing attacks (e.g., photos, videos)
- **Secure JWT authentication** for session management
- **Encrypted biometric data storage** using AES-256

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Installation and Run

### 1. Clone the repository

```bash
git clone https://github.com/AbdulRehman7590/Face_Auth_System.git
cd facial-recognition
```

### 2. Backend

Running the backend
```bash
cd backend
npm install 
npm run dev
```

### 3. Server

Running the server
```bash
cd .. 
cd fastapi-server
```

Make the virtual environment and run (Optional)
```bash
python -m venv venv
venv\Scripts\activate
```

Install and run
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend 

Running the frontend
```bash
cd ..
cd frontend
npm install
npm run dev
```
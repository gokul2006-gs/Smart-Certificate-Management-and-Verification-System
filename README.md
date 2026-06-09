# Smart-Certificate-Management-and-Verification-System
# 🎓 Smart Certificate Management and Verification System

A full-stack web application developed using **React.js, Django REST Framework, and MySQL** for managing students, certificates, and QR-based certificate verification.

---

## 📌 Project Overview

The Smart Certificate Management and Verification System automates the complete certificate lifecycle, including:

* Student Registration
* Excel-Based Bulk Student Upload
* Certificate Upload
* QR Code Generation
* Certificate Verification
* Student Dashboard
* Admin Dashboard

The system helps organizations manage internships, training programs, and certifications efficiently while preventing certificate fraud through QR-based verification.

---

## 🚀 Features

### Admin Module

* Admin Login
* Dashboard Statistics
* Excel-Based Student Upload
* Student Management (CRUD)
* Certificate Upload
* Bulk Certificate Upload (ZIP Support)
* Automatic QR Code Generation
* Certificate Management

### Student Module

* Student Login
* Student Dashboard
* Profile View
* Course Details
* Certificate Download
* QR Code View

### Certificate Verification

* QR Code Scanning
* Verification Page
* Certificate Validation
* Certificate Download Access

---

## 🏗️ System Architecture

```text
React Frontend
       │
       ▼
Django REST API
       │
       ▼
MySQL Database
       │
       ▼
Certificate Storage
       │
       ▼
QR Verification System
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router DOM
* Lucide React

### Backend

* Django
* Django REST Framework

### Database

* MySQL

### Python Libraries

* Pandas
* OpenPyXL
* QRCode
* Pillow
* PyMySQL

---

## 📂 Project Structure

```text
TS3/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── accounts/
│   ├── certificates/
│   ├── courses/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/gokul2006-gs/Smart-Certificate-Management-and-Verification-System.git
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

### Database Configuration

Update `settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'TS3',
        'USER': 'root',
        'PASSWORD': '*',
        'HOST': 'localhost',
        'PORT': '3306'
    }
}
```

### Run Migrations

```bash
python manage.py makemigrations

python manage.py migrate
```

### Create Admin

```bash
python manage.py createsuperuser
```

### Run Backend

```bash
python manage.py runserver
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

### Run Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Endpoints

### Accounts

```http
POST /api/accounts/login/

POST /api/accounts/upload-excel/

GET /api/accounts/students/

GET /api/accounts/profile/<student_id>/
```

### Certificates

```http
POST /api/certificates/upload/

POST /api/certificates/bulk-upload/

GET /api/certificates/view/<student_id>/

GET /api/certificates/verify/<student_id>/
```

---

## Workflow

```text
Admin Login
      ↓
Upload Excel File
      ↓
Students Created
      ↓
Upload Certificates
      ↓
QR Codes Generated
      ↓
Student Login
      ↓
Download Certificate
      ↓
Scan QR Code
      ↓
Certificate Verification
```

---

## Future Enhancements

* Email Certificate Delivery
* WhatsApp Integration
* Digital Signature Verification
* Certificate Expiry Tracking
* Docker Deployment
* Cloud Hosting
* Mobile Application

---

## Project Outcome

The system successfully automates certificate management, reduces manual effort, improves security through QR verification, and provides a scalable solution for internship and training certificate management.

---



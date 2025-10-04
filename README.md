# Expense Management System

A full-stack web application designed to simplify expense tracking, submission, and approval across organizational roles.  
Built with a **Flask (Python)** backend, **React.js** frontend, and **MongoDB** database, it supports secure, scalable, and role-based expense workflows.

---

## 📘 Overview

### Problem Statement
To build an Expense Management System that enables employees to submit expenses, managers to review and approve them, and admins to configure approval hierarchies and oversee all operations.

### Team
| Role | Name |
|------|------|
| Team Leader | **Smit Satani** |
| Member | **Preet Rank** |
| Member | **Krish Vaghnani** |

**Reviewer:** Aman Patel  
**Team Name:** SquareOps  

---

## ⚙️ Features

### Role-Based Access
- **Admin:** Manage users, system settings, and approval hierarchies.  
- **Manager:** Review and approve expenses assigned by admin.  
- **Employee:** Submit and track personal expenses (only employees can add expenses).

### Key Highlights
- JWT-based Authentication  
- Approval Workflow Configuration  
- Role-based Dashboards  
- Expense Analytics & Reports  
- Modular Codebase with Flask Blueprints  

---

## 🛠️ Tech Stack

**Frontend:** React.js, Tailwind CSS  
**Backend:** Flask, Python, JWT Authentication  
**Database:** MongoDB  
**Version Control:** Git & GitHub  

---

## 📂 Folder Structure

```
Expense_Management/
├── backend/
│   ├── app/
│   │   ├── __init__.py             # Flask app factory
│   │   ├── models.py               # MongoDB models
│   │   └── routes/
│   │       ├── auth.py             # Authentication APIs
│   │       ├── users.py            # User management APIs
│   │       ├── expense.py          # Expense management APIs
│   │       └── admin.py            # Admin configuration APIs
│   ├── .env                        # Environment variables
│   └── run.py                      # Application entry point
│
└── frontend/
    ├── src/
    │   ├── components/             # UI Components
    │   ├── context/                # Auth Context
    │   ├── pages/                  # Dashboard, Login, Signup, etc.
    │   ├── services/               # API layer
    │   ├── styles/                 # CSS files
    │   └── utils/                  # Helper utilities
    └── public/
```

---

## ⚡ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/satanismit/Expense_Management.git
cd Expense_Management
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend runs at → `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at → `http://localhost:5173`

---

## 🔐 API Endpoints Overview

### Authentication Routes (`/auth`)
| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password | Public |
| POST | `/auth/logout` | Logout | Authenticated |
| GET | `/auth/profile` | Get current user profile | Authenticated |
| PUT | `/auth/profile` | Update user profile | Authenticated |

---

### User Management Routes (`/users`)
| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| GET | `/users` | Get all users | Admin |
| POST | `/users` | Create new user | Admin |
| GET | `/users/<user_id>` | Get user details | Admin/Self |
| PUT | `/users/<user_id>` | Update user | Admin |
| DELETE | `/users/<user_id>` | Delete user | Admin |
| GET | `/users/managers` | List all managers | Admin/Manager |
| POST | `/users/<user_id>/assign-manager` | Assign manager to user | Admin |
| GET | `/users/subordinates` | Get subordinates of a manager | Manager |

---

### Expense Management Routes (`/expenses`)
| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| GET | `/expenses` | Get all expenses | Admin/Manager |
| POST | `/expenses` | Create expense | Employee |
| GET | `/expenses/my-expenses` | Get own expenses | Employee |
| GET | `/expenses/<expense_id>` | Get specific expense | Owner/Manager/Admin |
| PUT | `/expenses/<expense_id>` | Update expense | Owner/Admin |
| DELETE | `/expenses/<expense_id>` | Delete expense | Owner/Admin |
| GET | `/expenses/pending-approvals` | Get pending approvals | Manager |
| POST | `/expenses/<expense_id>/approve` | Approve expense | Manager |
| POST | `/expenses/<expense_id>/reject` | Reject expense | Manager |
| GET | `/expenses/reports` | Generate reports | Manager/Admin |
| GET | `/expenses/analytics` | Expense analytics | Manager/Admin |

---

### Admin Routes (`/admin`)
| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| GET | `/admin/approval-chain` | Get approval chain | Admin |
| POST | `/admin/approval-chain` | Set approval chain | Admin |
| GET | `/admin/system-settings` | Get system configs | Admin |
| POST | `/admin/system-settings` | Update system configs | Admin |
| GET | `/admin/categories` | Get expense categories | Admin |
| POST | `/admin/categories` | Create category | Admin |
| PUT | `/admin/categories/<id>` | Update category | Admin |
| DELETE | `/admin/categories/<id>` | Delete category | Admin |

---

### Miscellaneous
| Method | Endpoint | Description | Access |
|--------|-----------|-------------|---------|
| GET | `/` | Health check | Public |

---

## 🧠 Access Control

| Role | Permissions |
|------|--------------|
| **Public** | Login, Register, Password Reset, Health Check |
| **Employee** | Add/view own expenses, update profile |
| **Manager** | Approve/reject subordinates’ expenses, view reports |
| **Admin** | Manage users, system settings, categories, approvals |

---

## ⚙️ Configuration

**CORS**
- Allowed Origins: `localhost:3000`, `127.0.0.1:3000`, `localhost:5173`  
- Allowed Headers: `Content-Type`, `Authorization`  
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**MongoDB Collections**
- `users` – User data  
- `expenses` – Expense records  
- `approval_settings` – Approval hierarchies  
- `categories` – Expense categories  
- `system_settings` – Global configurations  

---

## 🚀 Future Enhancements
- Email/WhatsApp notifications  
- Expense analytics dashboard  
- PDF exports for reports  
- Google Sheets or ERP integration  

---

## 📄 License
Created by **SquareOps Team** © 2025  
For academic and educational purposes.

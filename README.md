# 💰 Expense Management System

A complete full-stack application built to simplify and automate the process of tracking, submitting, and approving expenses in an organization.  
The system ensures role-based access, efficient approval workflows, and secure management of employee expenses.

---

## 📘 Problem Statement
**Name:** Expense Management  
To develop an Expense Management System that allows employees to submit expenses, managers to review and approve them, and admins to manage the approval flow and overall system.

---

## 👥 Team Details

**Team Name:** SquareOps  

| Role | Name |
|------|------|
| 🧑‍💻 Team Leader | **Smit Satani** |
| 👩‍💻 Member 2 | **Preet Rank** |
| 👨‍💻 Member 3 | **Krish Vaghnani** |

---

## 🧑‍🏫 Reviewer Details

**Reviewer Name:** Aman Patel  

---

## 🎥 Video Presentation

**Video Link:** *(To be added after coding ends)*  
🔗 [Click here to view the project demo](#)

---

## 🚀 Features

### 👩‍💼 Role-Based Access Control
- **Admin:**  
  - Can view all expenses.  
  - Can configure approval hierarchies (Manager, Director, etc.).  
  - Can select who approves each expense (e.g., Manager, Director).  

- **Manager:**  
  - Can view expense requests if selected by admin for approval.  
  - Can approve or reject expenses assigned to them.  

- **Employee:**  
  - Can **add expenses only** (no other role can add).  
  - Can view the status of their submitted expenses.  

---

## ⚙️ Tech Stack

**Frontend:**
- React.js / HTML / CSS / JavaScript
- Tailwind CSS (for styling)

**Backend:**
- FastAPI (Python)
- JWT Authentication
- Role-based API access

**Database:**
- MongoDB

**Version Control:**
- Git & GitHub

---

## 🏗️ Project Modules

| Module | Description |
|---------|-------------|
| **Authentication** | Secure login and signup with JWT tokens |
| **Expense Management** | Employees add expenses, Managers/Admins view and manage them |
| **Approval Workflow** | Multi-level approval setup controlled by Admin |
| **Dashboard** | Role-based dashboards for Employees, Managers, and Admins |
| **Notifications** | Expense status updates (Approved/Rejected) |

---

## 📦 Folder Structure

```
Expense_Management/
├── backend/
│   ├── main.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── expense.py
│   │   └── approval.py
│   ├── models/
│   └── database.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚡ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/satanismit/Expense_Management.git
cd Expense_Management
```

### 2. Setup Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on:  
👉 `http://localhost:8000`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:  
👉 `http://localhost:3000`

---

## 🧠 Usage Flow

1. **Admin Login**
   - Create approval roles (Manager, Director, etc.)
   - Assign who approves expenses

2. **Employee**
   - Add new expenses (only employees can add)
   - View submitted expenses

3. **Manager**
   - If selected by admin, sees expenses awaiting approval
   - Can approve or reject them

4. **Admin**
   - Can view all expenses
   - Can monitor status and approval hierarchy

---

## 🧩 API Overview

| Endpoint | Method | Description | Access |
|-----------|--------|--------------|---------|
| `/auth/login` | POST | User login | All |
| `/auth/register` | POST | Register employee/manager/admin | Admin |
| `/expense/add` | POST | Add expense | Employee |
| `/expense/list` | GET | View all expenses | Admin |
| `/expense/pending` | GET | View pending approvals | Manager |
| `/expense/approve/{id}` | PUT | Approve expense | Manager/Admin |
| `/expense/reject/{id}` | PUT | Reject expense | Manager/Admin |

---

## 🛡️ Security Features

- JWT Authentication  
- Role-based Access Control  
- Input Validation  
- Secure Database Queries  
- Protected Routes  

---

## 🧩 Future Enhancements

- Email or WhatsApp notifications for expense updates  
- Expense analytics dashboard (charts, graphs)  
- PDF export for approved expenses  
- Integration with Google Sheets or accounting software  

---

## 📄 License

This project is created by **SquareOps Team** for academic and educational purposes.  
All rights reserved © 2025.

---

## 🙏 Acknowledgements

Special thanks to our reviewer **Aman Patel** for guidance, review, and support throughout the project development.

---

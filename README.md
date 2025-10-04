<<<<<<< HEAD
# Oddu - Full Stack User Management Application

A complete full-stack application built with Flask (Python) backend, React frontend, and MongoDB database for company user management.

## Features

### 🔐 Authentication
- **Signup**: Create new company accounts with admin user
- **Login**: JWT-based authentication
- **Forgot Password**: Email-based password reset with auto-generated passwords

### 👥 User Management (Admin Only)
- View all company users in a table
- Create new users (Employee/Manager/Admin roles)
- Update user roles via dropdown
- Assign managers to employees
- Real-time role and manager assignment

### 🏢 Multi-tenancy
- Each company has isolated user data
- Companies have default USD currency
- Admin users can only manage their company's users

## Tech Stack

**Backend:**
- Flask + Flask-JWT-Extended (Authentication)
- Flask-PyMongo (MongoDB integration)
- Flask-Mail (Email functionality)
- Flask-CORS (Cross-origin requests)
- bcrypt (Password hashing)

**Frontend:**
- React 19 with Hooks
- React Router (Navigation)
- Axios (API calls)
- Tailwind CSS (Styling)
- Context API (State management)

**Database:**
- MongoDB with collections:
  - `companies`: Company information
  - `users`: User accounts with roles and hierarchy

## Prerequisites

Before running the application, make sure you have:

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **MongoDB** running locally (default port 27017)
4. **Gmail account** for email functionality (optional)

## Installation & Setup

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv myenv

# Activate virtual environment
# On Windows:
myenv\Scripts\activate
# On macOS/Linux:
source myenv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Edit `backend/.env` file:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/oddu_app

# JWT Configuration (Change these in production!)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# Email Configuration (Gmail SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-super-secret-flask-key-change-this-in-production
```

**Email Setup (Optional):**
- For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833)
- Replace `your-email@gmail.com` with your Gmail address
- Replace `your-app-password` with the generated app password

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows (if installed as service):
net start MongoDB

# On macOS (with Homebrew):
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

## Running the Application

### 1. Start Backend Server

```bash
cd backend
python run.py
```

The Flask API will be available at: `http://localhost:5000`

### 2. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The React app will be available at: `http://localhost:3000`

## Usage

### 1. Create Company Account
1. Go to `http://localhost:3000`
2. Click "Create a new company account"
3. Fill in company name, email, and password
4. You'll be automatically logged in as Admin

### 2. Admin Dashboard
After logging in as Admin, you can:
- View all company users
- Add new users with different roles
- Change user roles using dropdown
- Assign managers to employees
- Manage the team hierarchy

### 3. User Roles
- **Admin**: Full access to user management
- **Manager**: Can be assigned as manager to employees
- **Employee**: Basic user role

### 4. Forgot Password
1. Go to login page
2. Click "Forgot your password?"
3. Enter email address
4. Check email for new auto-generated password

## API Endpoints

### Authentication
- `POST /auth/signup` - Create company and admin user
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Send new password via email
- `POST /auth/reset-password` - Change password (authenticated)

### User Management
- `GET /users/list` - Get all company users (Admin only)
- `POST /users/create` - Create new user (Admin only)
- `PUT /users/update-role` - Update user role (Admin only)
- `PUT /users/assign-manager` - Assign manager (Admin only)
- `GET /users/managers` - Get available managers (Admin only)

## Database Schema

### Companies Collection
```javascript
{
  _id: ObjectId,
  name: String,
  currency: String (default: "USD"),
  admin_id: ObjectId,
  created_at: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  company_id: ObjectId,
  name: String,
  email: String,
  password_hash: String,
  role: String, // "Admin", "Manager", "Employee"
  manager_id: ObjectId | null,
  created_at: Date
}
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected routes with role-based access
- ✅ CORS configuration
- ✅ Input validation
- ✅ Company data isolation

## Development Notes

### Frontend Structure
```
src/
├── components/          # Reusable components
├── context/            # React context (Auth)
├── pages/              # Page components
├── services/           # API service layer
├── App.jsx             # Main app component
└── main.jsx           # Entry point
```

### Backend Structure
```
app/
├── routes/             # API route handlers
│   ├── auth.py        # Authentication routes
│   └── users.py       # User management routes
├── models.py          # Database models
└── __init__.py        # Flask app factory
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file

2. **Email Not Working**
   - Verify Gmail credentials in .env
   - Use App Password, not regular password
   - Check spam folder

3. **CORS Errors**
   - Backend should be running on port 5000
   - Frontend should be running on port 3000

4. **Import Errors (Backend)**
   - Make sure virtual environment is activated
   - Install requirements: `pip install -r requirements.txt`

5. **Frontend Build Issues**
   - Delete node_modules and run `npm install` again
   - Ensure Node.js version is 16+

## Production Deployment

Before deploying to production:

1. **Change Secret Keys**: Update all secret keys in .env
2. **Use Production Database**: Update MONGO_URI
3. **Configure HTTPS**: Set up SSL certificates
4. **Environment Variables**: Use secure environment variable management
5. **Email Service**: Consider using SendGrid or similar for production emails

## License

This project is created for educational purposes. Feel free to modify and use as needed.

## Support

For issues and questions, please check the troubleshooting section above or create an issue in the repository.
=======
# Expense_Management
>>>>>>> 7f1da09c5f1c264b22c49a36f6b6e14829b2f2a5

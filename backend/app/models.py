from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class Company:
    def __init__(self, name, currency="USD", admin_id=None):
        self.name = name
        self.currency = currency
        self.admin_id = admin_id
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'name': self.name,
            'currency': self.currency,
            'admin_id': self.admin_id,
            'created_at': self.created_at
        }


class User:
    def __init__(self, company_id, name, email, password, role="Employee", manager_id=None):
        self.company_id = company_id
        self.name = name
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.role = role  # Admin, Manager, Employee
        self.manager_id = manager_id
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'company_id': self.company_id,
            'name': self.name,
            'email': self.email,
            'password_hash': self.password_hash,
            'role': self.role,
            'manager_id': self.manager_id,
            'created_at': self.created_at
        }
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def set_password(password):
        return generate_password_hash(password)
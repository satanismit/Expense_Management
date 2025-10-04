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


class Expense:
    def __init__(self, company_id, user_id, description, category, amount, currency, expense_date, paid_by, remarks="", status="submitted", approver_id=None):
        self.company_id = company_id
        self.user_id = user_id
        self.description = description
        self.category = category
        self.amount = float(amount)
        self.currency = currency
        self.expense_date = expense_date
        self.paid_by = paid_by
        self.remarks = remarks
        self.status = status  # submitted, pending, approved, rejected
        self.approver_id = approver_id
        self.submitted_at = datetime.utcnow()
        self.approved_at = None
        self.approval_remarks = ""
    
    def to_dict(self):
        return {
            'company_id': self.company_id,
            'user_id': self.user_id,
            'description': self.description,
            'category': self.category,
            'amount': self.amount,
            'currency': self.currency,
            'expense_date': self.expense_date,
            'paid_by': self.paid_by,
            'remarks': self.remarks,
            'status': self.status,
            'approver_id': self.approver_id,
            'submitted_at': self.submitted_at,
            'approved_at': self.approved_at,
            'approval_remarks': self.approval_remarks
        }


class ApprovalConfig:
    def __init__(self, company_id, name, role, can_approve_categories=None):
        self.company_id = company_id
        self.name = name
        self.role = role  # Manager, Director, Finance, etc.
        self.can_approve_categories = can_approve_categories or []
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'company_id': self.company_id,
            'name': self.name,
            'role': self.role,
            'can_approve_categories': self.can_approve_categories,
            'created_at': self.created_at
        }


class ApprovalChain:
    def __init__(self, company_id, chain):
        self.company_id = company_id
        self.chain = chain  # List of roles in order: ["Manager", "Director"]
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'company_id': self.company_id,
            'chain': self.chain,
            'created_at': self.created_at
        }
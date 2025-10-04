from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from app import mongo
from app.models import Expense

expenses_bp = Blueprint('expenses', __name__)

# Categories for expenses
EXPENSE_CATEGORIES = [
    "Travel", "Meals", "Office Supplies", "Software", "Training", 
    "Entertainment", "Marketing", "Equipment", "Other"
]

# Currency options
CURRENCIES = [
    {"code": "USD", "name": "US Dollar", "symbol": "$"},
    {"code": "EUR", "name": "Euro", "symbol": "€"},
    {"code": "INR", "name": "Indian Rupee", "symbol": "₹"},
    {"code": "GBP", "name": "British Pound", "symbol": "£"},
    {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$"},
    {"code": "AUD", "name": "Australian Dollar", "symbol": "A$"},
]

# Payment methods
PAYMENT_METHODS = [
    "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Company Card", "Personal"
]


@expenses_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_expense():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is employee
        if current_user['role'] != 'Employee':
            return jsonify({'error': 'Only employees can submit expenses'}), 403
        
        # Validate required fields
        required_fields = ['description', 'category', 'amount', 'currency', 'expense_date', 'paid_by']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate category
        if data['category'] not in EXPENSE_CATEGORIES:
            return jsonify({'error': f'Invalid category. Must be one of: {EXPENSE_CATEGORIES}'}), 400
        
        # Validate currency
        valid_currencies = [c['code'] for c in CURRENCIES]
        if data['currency'] not in valid_currencies:
            return jsonify({'error': f'Invalid currency. Must be one of: {valid_currencies}'}), 400
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount format'}), 400
        
        # Validate date format
        try:
            expense_date = datetime.strptime(data['expense_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Determine approver based on approval settings
        # First, check if there are approval settings configured
        approval_settings = mongo.db.approval_chains.find_one({'company_id': current_user['company_id']})
        
        if approval_settings and approval_settings.get('approvers'):
            # Use the first approver in the approval chain
            approvers = approval_settings['approvers']
            # Sort by order to get the first approver
            approvers.sort(key=lambda x: x.get('order', 0))
            first_approver = approvers[0]
            approver_id = ObjectId(first_approver['user_id'])
        else:
            # Fallback to employee's assigned manager
            approver_id = current_user.get('manager_id')
            if not approver_id:
                return jsonify({'error': 'No approval settings configured and no manager assigned. Contact admin to configure approval settings or assign a manager.'}), 400
        
        # Create expense
        expense = Expense(
            company_id=current_user['company_id'],
            user_id=ObjectId(current_user_id),
            description=data['description'],
            category=data['category'],
            amount=amount,
            currency=data['currency'],
            expense_date=expense_date,
            paid_by=data['paid_by'],
            remarks=data.get('remarks', ''),
            approver_id=approver_id
        )
        
        result = mongo.db.expenses.insert_one(expense.to_dict())
        
        return jsonify({
            'message': 'Expense submitted successfully',
            'expense_id': str(result.inserted_id)
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expenses_bp.route('/my-expenses', methods=['GET'])
@jwt_required()
def get_my_expenses():
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's expenses
        expenses = list(mongo.db.expenses.find(
            {'user_id': ObjectId(current_user_id)},
            {'_id': 1, 'description': 1, 'category': 1, 'amount': 1, 'currency': 1, 
             'expense_date': 1, 'paid_by': 1, 'remarks': 1, 'status': 1, 'submitted_at': 1}
        ).sort('submitted_at', -1))
        
        # Convert ObjectId to string and format dates
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
            if expense.get('company_id'):
                expense['company_id'] = str(expense['company_id'])
            expense['expense_date'] = expense['expense_date'].strftime('%Y-%m-%d')
            expense['submitted_at'] = expense['submitted_at'].strftime('%Y-%m-%d %H:%M')
        
        return jsonify({'expenses': expenses}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expenses_bp.route('/pending-approvals', methods=['GET'])
@jwt_required()
def get_pending_approvals():
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is manager
        if current_user['role'] != 'Manager':
            return jsonify({'error': 'Access denied. Manager privileges required.'}), 403
        
        # Get expenses pending approval by this user
        expenses = list(mongo.db.expenses.find(
            {
                'approver_id': ObjectId(current_user_id),
                'status': {'$in': ['submitted', 'pending']}
            }
        ).sort('submitted_at', 1))
        
        # Get employee details for each expense
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
            expense['user_id'] = str(expense['user_id'])
            expense['approver_id'] = str(expense['approver_id'])
            if expense.get('company_id'):
                expense['company_id'] = str(expense['company_id'])
            expense['expense_date'] = expense['expense_date'].strftime('%Y-%m-%d')
            expense['submitted_at'] = expense['submitted_at'].strftime('%Y-%m-%d %H:%M')
            
            # Get employee details
            employee = mongo.db.users.find_one({'_id': ObjectId(expense['user_id'])})
            expense['employee_name'] = employee['name'] if employee else 'Unknown'
            expense['employee_email'] = employee['email'] if employee else 'Unknown'
        
        return jsonify({'expenses': expenses}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expenses_bp.route('/approve/<expense_id>', methods=['PUT'])
@jwt_required()
def approve_expense(expense_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is manager
        if current_user['role'] != 'Manager':
            return jsonify({'error': 'Access denied. Manager privileges required.'}), 403
        
        # Get expense
        expense = mongo.db.expenses.find_one({'_id': ObjectId(expense_id)})
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
        
        # Check if user is authorized to approve this expense
        if expense['approver_id'] != ObjectId(current_user_id):
            return jsonify({'error': 'You are not authorized to approve this expense'}), 403
        
        # Validate action
        action = data.get('action')  # 'approve' or 'reject'
        if action not in ['approve', 'reject']:
            return jsonify({'error': 'Action must be either "approve" or "reject"'}), 400
        
        # Update expense status
        update_data = {
            'status': 'approved' if action == 'approve' else 'rejected',
            'approved_at': datetime.utcnow(),
            'approval_remarks': data.get('remarks', '')
        }
        
        mongo.db.expenses.update_one(
            {'_id': ObjectId(expense_id)},
            {'$set': update_data}
        )
        
        return jsonify({
            'message': f'Expense {action}ed successfully'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expenses_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    return jsonify({'categories': EXPENSE_CATEGORIES}), 200


@expenses_bp.route('/currencies', methods=['GET'])
@jwt_required()
def get_currencies():
    return jsonify({'currencies': CURRENCIES}), 200


@expenses_bp.route('/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    return jsonify({'payment_methods': PAYMENT_METHODS}), 200


@expenses_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_expenses():
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is admin
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Get all expenses for the company
        expenses = list(mongo.db.expenses.find(
            {'company_id': current_user['company_id']}
        ).sort('submitted_at', -1))
        
        print(f"Found {len(expenses)} expenses for company {current_user['company_id']}")
        
        # Get employee and approver details for each expense
        for expense in expenses:
            # Convert all ObjectId fields to strings
            expense['_id'] = str(expense['_id'])
            expense['user_id'] = str(expense['user_id'])
            if expense.get('approver_id'):
                expense['approver_id'] = str(expense['approver_id'])
            
            # Convert company_id if it exists
            if expense.get('company_id'):
                expense['company_id'] = str(expense['company_id'])
            
            # Handle date formatting safely
            if expense.get('expense_date'):
                if isinstance(expense['expense_date'], str):
                    expense['expense_date'] = expense['expense_date']
                else:
                    expense['expense_date'] = expense['expense_date'].strftime('%Y-%m-%d')
            
            if expense.get('submitted_at'):
                if isinstance(expense['submitted_at'], str):
                    expense['submitted_at'] = expense['submitted_at']
                else:
                    expense['submitted_at'] = expense['submitted_at'].strftime('%Y-%m-%d %H:%M')
            
            if expense.get('approved_at'):
                if isinstance(expense['approved_at'], str):
                    expense['approved_at'] = expense['approved_at']
                else:
                    expense['approved_at'] = expense['approved_at'].strftime('%Y-%m-%d %H:%M')
            
            # Get employee details
            employee = mongo.db.users.find_one({'_id': ObjectId(expense['user_id'])})
            expense['employee_name'] = employee['name'] if employee else 'Unknown'
            
            # Get approver details
            if expense.get('approver_id') and expense['approver_id'] != 'None':
                approver = mongo.db.users.find_one({'_id': ObjectId(expense['approver_id'])})
                expense['approver_name'] = approver['name'] if approver else 'Unknown'
            else:
                expense['approver_name'] = 'Not Assigned'
        
        return jsonify({'expenses': expenses}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
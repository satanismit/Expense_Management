from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from app import mongo
from app.models import Expense, ApprovalChain

expenses_bp = Blueprint('expenses', __name__)


@expenses_bp.route('/add', methods=['POST'])
@jwt_required()
def add_expense():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user to determine company and role
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Only Employees can add expenses
        if current_user['role'] != 'Employee':
            return jsonify({'error': 'Only employees can submit expenses'}), 403
        
        # Validate required fields
        required_fields = ['description', 'category', 'amount', 'currency', 'expense_date', 'paid_by', 'remarks']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        description = data['description']
        category = data['category']
        amount = data['amount']
        currency = data['currency']
        expense_date = data['expense_date']
        paid_by = data['paid_by']
        remarks = data['remarks']
        
        # Validate amount
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Amount must be a valid number'}), 400
        
        # Validate date
        try:
            if isinstance(expense_date, str):
                expense_date = datetime.fromisoformat(expense_date.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        
        # Check if there's an approval chain for this company
        approval_chain = mongo.db.approval_chains.find_one({'company_id': current_user['company_id']})
        
        # Determine initial status based on approval chain
        status = "Submitted"
        if approval_chain and approval_chain.get('chain'):
            status = "Pending"
        
        # Create new expense
        new_expense = Expense(
            company_id=current_user['company_id'],
            user_id=ObjectId(current_user_id),
            description=description,
            category=category,
            amount=amount,
            currency=currency,
            expense_date=expense_date,
            paid_by=paid_by,
            remarks=remarks,
            status=status
        )
        
        # If there's an approval chain, set up pending approvals
        if approval_chain and approval_chain.get('chain'):
            for role in approval_chain['chain']:
                new_expense.approvals.append({
                    'role': role,
                    'user_id': None,  # Will be set when someone with this role approves
                    'status': 'Pending',
                    'timestamp': None
                })
        
        result = mongo.db.expenses.insert_one(new_expense.to_dict())
        
        return jsonify({
            'message': 'Expense submitted successfully',
            'expense_id': str(result.inserted_id),
            'status': status
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expenses_bp.route('/list', methods=['GET'])
@jwt_required()
def list_expenses():
    try:
        current_user_id = get_jwt_identity()
        print(f"DEBUG: Fetching expenses for user_id: {current_user_id}")
        
        # Get current user to determine company and role
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            print(f"DEBUG: User not found for id: {current_user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        print(f"DEBUG: User found - Role: {current_user['role']}, Company: {current_user['company_id']}")
        
        # Build query based on user role
        query = {'company_id': current_user['company_id']}
        
        if current_user['role'] == 'Employee':
            # Employees can only see their own expenses
            query['user_id'] = ObjectId(current_user_id)
            print(f"DEBUG: Employee query: {query}")
            expenses = list(mongo.db.expenses.find(query).sort('created_at', -1))
            print(f"DEBUG: Found {len(expenses)} expenses for employee")
        elif current_user['role'] == 'Manager':
            # Managers can see their own expenses and expenses waiting for their approval
            manager_expenses = list(mongo.db.expenses.find({
                'company_id': current_user['company_id'],
                'user_id': ObjectId(current_user_id)
            }))
            
            # Find expenses waiting for manager approval
            pending_approvals = list(mongo.db.expenses.find({
                'company_id': current_user['company_id'],
                'approvals': {
                    '$elemMatch': {
                        'role': 'Manager',
                        'status': 'Pending'
                    }
                }
            }))
            
            # Combine both lists
            all_expenses = manager_expenses + pending_approvals
            # Remove duplicates based on _id
            seen_ids = set()
            unique_expenses = []
            for expense in all_expenses:
                if str(expense['_id']) not in seen_ids:
                    unique_expenses.append(expense)
                    seen_ids.add(str(expense['_id']))
            
            expenses = unique_expenses
        else:  # Admin
            # Admin can see all company expenses
            print(f"DEBUG: Admin query: {query}")
            expenses = list(mongo.db.expenses.find(query).sort('created_at', -1))
            print(f"DEBUG: Found {len(expenses)} expenses for admin")
        
        # Convert ObjectId to string and add user information
        if expenses is None:
            expenses = []
        
        for i, expense in enumerate(expenses):
            try:
                print(f"DEBUG: Processing expense {i+1}: {expense.get('description', 'Unknown')}")
                expense['_id'] = str(expense['_id'])
                expense['company_id'] = str(expense['company_id'])
                expense['user_id'] = str(expense['user_id'])
                
                # Handle expense_date conversion safely
                if expense.get('expense_date'):
                    if isinstance(expense['expense_date'], datetime):
                        expense['expense_date'] = expense['expense_date'].isoformat()
                    elif isinstance(expense['expense_date'], str):
                        # Already a string, keep as is
                        pass
                    else:
                        # Convert to string if it's some other type
                        expense['expense_date'] = str(expense['expense_date'])
                else:
                    expense['expense_date'] = None
                
                # Handle created_at conversion safely
                if expense.get('created_at'):
                    if isinstance(expense['created_at'], datetime):
                        expense['created_at'] = expense['created_at'].isoformat()
                    elif isinstance(expense['created_at'], str):
                        # Already a string, keep as is
                        pass
                    else:
                        # Convert to string if it's some other type
                        expense['created_at'] = str(expense['created_at'])
                else:
                    expense['created_at'] = None
                
                # Convert approval timestamps
                for approval in expense.get('approvals', []):
                    if approval.get('timestamp') and isinstance(approval['timestamp'], datetime):
                        approval['timestamp'] = approval['timestamp'].isoformat()
                    if approval.get('user_id'):
                        approval['user_id'] = str(approval['user_id'])
                
                # Get user information
                user = mongo.db.users.find_one({'_id': ObjectId(expense['user_id'])})
                if user:
                    expense['user_name'] = user['name']
                    expense['user_email'] = user['email']
                else:
                    expense['user_name'] = 'Unknown User'
                    expense['user_email'] = 'Unknown Email'
                    
                print(f"DEBUG: Successfully processed expense {i+1}")
            except Exception as e:
                print(f"ERROR: Failed to process expense {i+1}: {str(e)}")
                print(f"ERROR: Expense data: {expense}")
                # Skip this expense or set default values
                expense['user_name'] = 'Error'
                expense['user_email'] = 'Error'
                expense['expense_date'] = None
                expense['created_at'] = None
        
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
        
        # Only Managers and Directors can approve
        if current_user['role'] not in ['Manager', 'Director']:
            return jsonify({'error': 'Only managers and directors can approve expenses'}), 403
        
        # Validate required fields
        if 'action' not in data:
            return jsonify({'error': 'action is required (approve/reject)'}), 400
        
        action = data['action']
        if action not in ['approve', 'reject']:
            return jsonify({'error': 'action must be either approve or reject'}), 400
        
        # Find the expense
        expense = mongo.db.expenses.find_one({'_id': ObjectId(expense_id)})
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
        
        # Check if expense belongs to the same company
        if expense['company_id'] != current_user['company_id']:
            return jsonify({'error': 'Expense not found'}), 404
        
        # Check if this user can approve this expense
        can_approve = False
        approval_index = None
        
        for i, approval in enumerate(expense.get('approvals', [])):
            if (approval['role'] == current_user['role'] and 
                approval['status'] == 'Pending' and 
                approval['user_id'] is None):
                can_approve = True
                approval_index = i
                break
        
        if not can_approve:
            return jsonify({'error': 'You cannot approve this expense'}), 403
        
        # Update the approval
        new_status = 'Approved' if action == 'approve' else 'Rejected'
        expense['approvals'][approval_index]['user_id'] = ObjectId(current_user_id)
        expense['approvals'][approval_index]['status'] = new_status
        expense['approvals'][approval_index]['timestamp'] = datetime.utcnow()
        
        # Check if all approvals are complete
        all_approved = all(approval['status'] in ['Approved', 'Rejected'] for approval in expense['approvals'])
        if all_approved:
            # Check if any were rejected
            any_rejected = any(approval['status'] == 'Rejected' for approval in expense['approvals'])
            expense['status'] = 'Rejected' if any_rejected else 'Approved'
        else:
            expense['status'] = 'Pending'
        
        # Update the expense
        mongo.db.expenses.update_one(
            {'_id': ObjectId(expense_id)},
            {'$set': {
                'approvals': expense['approvals'],
                'status': expense['status']
            }}
        )
        
        return jsonify({
            'message': f'Expense {action}d successfully',
            'status': expense['status']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expenses_bp.route('/update/<expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find the expense
        expense = mongo.db.expenses.find_one({'_id': ObjectId(expense_id)})
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
        
        # Check if expense belongs to the same company
        if expense['company_id'] != current_user['company_id']:
            return jsonify({'error': 'Expense not found'}), 404
        
        # Check permissions
        can_edit = False
        if current_user['role'] == 'Admin':
            can_edit = True
        elif (current_user['role'] == 'Employee' and 
              expense['user_id'] == ObjectId(current_user_id) and 
              expense['status'] in ['Draft', 'Submitted']):
            can_edit = True
        
        if not can_edit:
            return jsonify({'error': 'You cannot edit this expense'}), 403
        
        # Validate and update fields
        update_data = {}
        
        editable_fields = ['description', 'category', 'amount', 'currency', 'expense_date', 'paid_by', 'remarks']
        
        for field in editable_fields:
            if field in data:
                if field == 'amount':
                    try:
                        amount = float(data[field])
                        if amount <= 0:
                            return jsonify({'error': 'Amount must be greater than 0'}), 400
                        update_data[field] = amount
                    except (ValueError, TypeError):
                        return jsonify({'error': 'Amount must be a valid number'}), 400
                elif field == 'expense_date':
                    try:
                        if isinstance(data[field], str):
                            date = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                        else:
                            date = data[field]
                        update_data[field] = date
                    except ValueError:
                        return jsonify({'error': 'Invalid date format'}), 400
                else:
                    update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update the expense
        mongo.db.expenses.update_one(
            {'_id': ObjectId(expense_id)},
            {'$set': update_data}
        )
        
        return jsonify({'message': 'Expense updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expenses_bp.route('/delete/<expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find the expense
        expense = mongo.db.expenses.find_one({'_id': ObjectId(expense_id)})
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
        
        # Check if expense belongs to the same company
        if expense['company_id'] != current_user['company_id']:
            return jsonify({'error': 'Expense not found'}), 404
        
        # Check permissions
        can_delete = False
        if current_user['role'] == 'Admin':
            can_delete = True
        elif (current_user['role'] == 'Employee' and 
              expense['user_id'] == ObjectId(current_user_id) and 
              expense['status'] not in ['Approved', 'Rejected']):
            can_delete = True
        
        if not can_delete:
            return jsonify({'error': 'You cannot delete this expense'}), 403
        
        # Delete the expense
        mongo.db.expenses.delete_one({'_id': ObjectId(expense_id)})
        
        return jsonify({'message': 'Expense deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
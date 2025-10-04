from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from bson import ObjectId
import string
import random
from app import mongo, mail
from app.models import User

users_bp = Blueprint('users', __name__)


@users_bp.route('/list', methods=['GET'])
@jwt_required()
def list_users():
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user to determine company
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is admin
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Get all users in the same company
        users = list(mongo.db.users.find(
            {'company_id': current_user['company_id']},
            {'password_hash': 0}  # Exclude password hash
        ))
        
        # Convert ObjectId to string and get manager names
        for user in users:
            user['_id'] = str(user['_id'])
            user['company_id'] = str(user['company_id'])
            
            # Get manager name if manager_id exists
            if user.get('manager_id'):
                manager = mongo.db.users.find_one({'_id': user['manager_id']})
                user['manager_name'] = manager['name'] if manager else None
                user['manager_id'] = str(user['manager_id'])
            else:
                user['manager_name'] = None
        
        return jsonify({'users': users}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/create', methods=['POST'])
@jwt_required()
def create_user():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user to determine company
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is admin
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        name = data['name']
        email = data['email']
        password = data['password']
        role = data['role']
        manager_id = data.get('manager_id')
        
        # Validate role
        valid_roles = ['Admin', 'Manager', 'Employee']
        if role not in valid_roles:
            return jsonify({'error': f'Role must be one of: {valid_roles}'}), 400
        
        # Check if user already exists
        existing_user = mongo.db.users.find_one({'email': email})
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Validate manager if provided
        if manager_id:
            manager = mongo.db.users.find_one({
                '_id': ObjectId(manager_id),
                'company_id': current_user['company_id']
            })
            if not manager:
                return jsonify({'error': 'Invalid manager ID'}), 400
        
        # Create new user
        new_user = User(
            company_id=current_user['company_id'],
            name=name,
            email=email,
            password=password,
            role=role,
            manager_id=ObjectId(manager_id) if manager_id else None
        )
        
        result = mongo.db.users.insert_one(new_user.to_dict())
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': str(result.inserted_id)
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/update-role', methods=['PUT'])
@jwt_required()
def update_role():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is admin
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Validate required fields
        if 'user_id' not in data or 'new_role' not in data:
            return jsonify({'error': 'user_id and new_role are required'}), 400
        
        user_id = data['user_id']
        new_role = data['new_role']
        
        # Validate role
        valid_roles = ['Admin', 'Manager', 'Employee']
        if new_role not in valid_roles:
            return jsonify({'error': f'Role must be one of: {valid_roles}'}), 400
        
        # Find target user
        target_user = mongo.db.users.find_one({
            '_id': ObjectId(user_id),
            'company_id': current_user['company_id']
        })
        if not target_user:
            return jsonify({'error': 'User not found or not in your company'}), 404
        
        # Update role
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': new_role}}
        )
        
        return jsonify({'message': 'User role updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/assign-manager', methods=['PUT'])
@jwt_required()
def assign_manager():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is admin
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Validate required fields
        if 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        user_id = data['user_id']
        manager_id = data.get('manager_id')  # Can be None to remove manager
        
        # Find target user
        target_user = mongo.db.users.find_one({
            '_id': ObjectId(user_id),
            'company_id': current_user['company_id']
        })
        if not target_user:
            return jsonify({'error': 'User not found or not in your company'}), 404
        
        # Validate manager if provided
        if manager_id:
            manager = mongo.db.users.find_one({
                '_id': ObjectId(manager_id),
                'company_id': current_user['company_id']
            })
            if not manager:
                return jsonify({'error': 'Invalid manager ID'}), 400
            
            # Prevent self-assignment
            if manager_id == user_id:
                return jsonify({'error': 'User cannot be their own manager'}), 400
        
        # Update manager
        update_data = {'manager_id': ObjectId(manager_id) if manager_id else None}
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        return jsonify({'message': 'Manager assigned successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/managers', methods=['GET'])
@jwt_required()
def get_managers():
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user to determine company
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all managers and admins in the same company
        managers = list(mongo.db.users.find(
            {
                'company_id': current_user['company_id'],
                'role': {'$in': ['Admin', 'Manager']}
            },
            {'_id': 1, 'name': 1, 'role': 1}
        ))
        
        # Convert ObjectId to string
        for manager in managers:
            manager['_id'] = str(manager['_id'])
        
        return jsonify({'managers': managers}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/generate-password', methods=['POST'])
@jwt_required()
def generate_password():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is admin
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Validate required fields
        if 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        user_id = data['user_id']
        
        # Find target user
        target_user = mongo.db.users.find_one({
            '_id': ObjectId(user_id),
            'company_id': current_user['company_id']
        })
        if not target_user:
            return jsonify({'error': 'User not found or not in your company'}), 404
        
        # Generate random password (12 characters with letters, numbers, and special chars)
        password_chars = string.ascii_letters + string.digits + "!@#$%&*"
        new_password = ''.join(random.choices(password_chars, k=12))
        
        # Update password in database
        hashed_password = User.set_password(new_password)
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password_hash': hashed_password}}
        )
        
        # Try sending email, fallback to console if email fails
        try:
            # Get company info for email
            company = mongo.db.companies.find_one({'_id': current_user['company_id']})
            company_name = company['name'] if company else 'Your Company'
            
            msg = Message(
                subject=f'New Password - {company_name}',
                recipients=[target_user['email']],
                body=f'''
Hello {target_user['name']},

A new password has been generated for your account by your administrator.

Your new login credentials are:
Email: {target_user['email']}
Password: {new_password}

Please log in with these credentials and consider changing your password to something more memorable.

Company: {company_name}

Best regards,
{company_name} Admin Team
                '''
            )
            
            mail.send(msg)
            
            return jsonify({
                'message': f'New password has been generated and sent to {target_user["email"]}'
            }), 200
            
        except Exception as email_error:
            # If email fails, log to console as fallback
            print("=" * 60)
            print(f"🔑 EMAIL FAILED - NEW PASSWORD FOR: {target_user['email']}")
            print(f"🔑 NEW PASSWORD: {new_password}")
            print(f"🔑 EMAIL ERROR: {email_error}")
            print("=" * 60)
            
            return jsonify({
                'message': f'New password generated for {target_user["name"]}. Check the server console for the password.',
                'note': 'Email service temporarily unavailable.'
            }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
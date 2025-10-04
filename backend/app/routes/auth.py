from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from flask_mail import Message
from bson import ObjectId
import string
import random
from app import mongo, mail
from app.models import Company, User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['company_name', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        company_name = data['company_name']
        email = data['email']
        password = data['password']
        
        # Check if user already exists
        existing_user = mongo.db.users.find_one({'email': email})
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create company
        company = Company(name=company_name)
        company_result = mongo.db.companies.insert_one(company.to_dict())
        company_id = company_result.inserted_id
        
        # Create admin user
        admin_user = User(
            company_id=company_id,
            name=email.split('@')[0],  # Use email prefix as name
            email=email,
            password=password,
            role="Admin"
        )
        user_result = mongo.db.users.insert_one(admin_user.to_dict())
        
        # Update company with admin_id
        mongo.db.companies.update_one(
            {'_id': company_id},
            {'$set': {'admin_id': user_result.inserted_id}}
        )
        
        # Create JWT token
        access_token = create_access_token(identity=str(user_result.inserted_id))
        
        return jsonify({
            'message': 'Company and admin user created successfully',
            'access_token': access_token,
            'user': {
                'id': str(user_result.inserted_id),
                'name': admin_user.name,
                'email': admin_user.email,
                'role': admin_user.role,
                'company_id': str(company_id)
            }
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email']
        password = data['password']
        
        # Find user
        user = mongo.db.users.find_one({'email': email})
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create JWT token
        access_token = create_access_token(identity=str(user['_id']))
        
        # Get company info
        company = mongo.db.companies.find_one({'_id': user['company_id']})
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'company_id': str(user['company_id']),
                'company_name': company['name'] if company else None
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400
        
        email = data['email']
        
        # Find user
        user = mongo.db.users.find_one({'email': email})
        if not user:
            return jsonify({'error': 'User with this email does not exist'}), 404
        
        # Generate random password
        new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
        
        # Update password in database
        hashed_password = User.set_password(new_password)
        mongo.db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'password_hash': hashed_password}}
        )
        
        # Try sending email, fallback to console if email fails
        try:
            msg = Message(
                'Password Reset - Oddu App',
                recipients=[email],
                body=f'''
Hello {user['name']},

Your password has been reset. Your new password is: {new_password}

Please log in with this new password and consider changing it to something more memorable.

Best regards,
Oddu Team
                '''
            )
            
            mail.send(msg)
            
            return jsonify({
                'message': 'New password has been sent to your email address'
            }), 200
            
        except Exception as email_error:
            # If email fails, log to console as fallback
            print("=" * 60)
            print(f"🔑 EMAIL FAILED - PASSWORD RESET FOR: {email}")
            print(f"🔑 NEW PASSWORD: {new_password}")
            print(f"🔑 EMAIL ERROR: {email_error}")
            print("=" * 60)
            
            return jsonify({
                'message': 'Password reset successful. Check the server console for your new password.',
                'note': 'Email service temporarily unavailable.'
            }), 200, 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/reset-password', methods=['POST'])
@jwt_required()
def reset_password():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if 'current_password' not in data or 'new_password' not in data:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Find user
        user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check current password
        if not check_password_hash(user['password_hash'], current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Update password
        hashed_password = User.set_password(new_password)
        mongo.db.users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': {'password_hash': hashed_password}}
        )
        
        return jsonify({'message': 'Password updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
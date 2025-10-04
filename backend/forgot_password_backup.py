#!/usr/bin/env python3
"""
Alternative forgot password implementation that logs password instead of sending email
"""

from flask import Blueprint, request, jsonify
from bson import ObjectId
import string
import random
from app import mongo
from app.models import User

# This is a backup implementation if email fails
def forgot_password_console():
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
        
        # Log to console (for development/testing)
        print("=" * 60)
        print(f"🔑 PASSWORD RESET FOR: {email}")
        print(f"🔑 NEW PASSWORD: {new_password}")
        print("=" * 60)
        
        return jsonify({
            'message': 'Password reset successful. Check the server console for the new password.',
            'note': 'In production, this would be sent via email.'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
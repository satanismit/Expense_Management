from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from app import mongo
from app.models import ApprovalChain

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/approval-chain', methods=['POST'])
@jwt_required()
def set_approval_chain():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Only Admin can set approval chain
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Validate required fields
        if 'chain' not in data:
            return jsonify({'error': 'chain is required'}), 400
        
        chain = data['chain']
        if not isinstance(chain, list):
            return jsonify({'error': 'chain must be a list'}), 400
        
        # Validate chain roles
        valid_roles = ['Manager', 'Director']
        for role in chain:
            if role not in valid_roles:
                return jsonify({'error': f'Invalid role: {role}. Must be one of: {valid_roles}'}), 400
        
        # Check if approval chain already exists for this company
        existing_chain = mongo.db.approval_chains.find_one({'company_id': current_user['company_id']})
        
        if existing_chain:
            # Update existing chain
            mongo.db.approval_chains.update_one(
                {'company_id': current_user['company_id']},
                {'$set': {'chain': chain, 'updated_at': datetime.utcnow()}}
            )
            message = 'Approval chain updated successfully'
        else:
            # Create new chain
            new_chain = ApprovalChain(
                company_id=current_user['company_id'],
                chain=chain
            )
            mongo.db.approval_chains.insert_one(new_chain.to_dict())
            message = 'Approval chain created successfully'
        
        return jsonify({
            'message': message,
            'chain': chain
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/approval-chain', methods=['GET'])
@jwt_required()
def get_approval_chain():
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Only Admin can view approval chain
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Get approval chain for this company
        approval_chain = mongo.db.approval_chains.find_one({'company_id': current_user['company_id']})
        
        if not approval_chain:
            return jsonify({
                'message': 'No approval chain set for this company',
                'chain': []
            }), 200
        
        # Convert ObjectId to string
        approval_chain['_id'] = str(approval_chain['_id'])
        approval_chain['company_id'] = str(approval_chain['company_id'])
        
        # Convert timestamps
        if isinstance(approval_chain.get('created_at'), datetime):
            approval_chain['created_at'] = approval_chain['created_at'].isoformat()
        if isinstance(approval_chain.get('updated_at'), datetime):
            approval_chain['updated_at'] = approval_chain['updated_at'].isoformat()
        
        return jsonify({
            'chain': approval_chain['chain'],
            'created_at': approval_chain.get('created_at'),
            'updated_at': approval_chain.get('updated_at')
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/expenses/stats', methods=['GET'])
@jwt_required()
def get_expense_stats():
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Only Admin can view expense stats
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
        
        # Get expense statistics
        pipeline = [
            {'$match': {'company_id': current_user['company_id']}},
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1},
                'total_amount': {'$sum': '$amount'}
            }}
        ]
        
        stats = list(mongo.db.expenses.aggregate(pipeline))
        
        # Get total expenses
        total_expenses = mongo.db.expenses.count_documents({'company_id': current_user['company_id']})
        
        # Get total amount
        total_amount_pipeline = [
            {'$match': {'company_id': current_user['company_id']}},
            {'$group': {'_id': None, 'total': {'$sum': '$amount'}}}
        ]
        total_amount_result = list(mongo.db.expenses.aggregate(total_amount_pipeline))
        total_amount = total_amount_result[0]['total'] if total_amount_result else 0
        
        return jsonify({
            'total_expenses': total_expenses,
            'total_amount': total_amount,
            'status_breakdown': stats
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

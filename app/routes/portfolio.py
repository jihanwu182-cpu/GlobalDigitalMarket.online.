"""Portfolio routes"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.portfolio import Portfolio
from app.models.user import User

bp = Blueprint('portfolio', __name__, url_prefix='/api/portfolio')

@bp.route('', methods=['GET'])
@jwt_required()
def get_portfolios():
    """Get all portfolios for current user"""
    user_id = get_jwt_identity()
    portfolios = Portfolio.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'portfolios': [p.to_dict() for p in portfolios]
    }), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_portfolio():
    """Create a new portfolio"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Portfolio name is required'}), 400
    
    portfolio = Portfolio(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        cash_balance=data.get('cash_balance', 0.0)
    )
    
    db.session.add(portfolio)
    db.session.commit()
    
    return jsonify({
        'message': 'Portfolio created successfully',
        'portfolio': portfolio.to_dict()
    }), 201

@bp.route('/<int:portfolio_id>', methods=['GET'])
@jwt_required()
def get_portfolio(portfolio_id):
    """Get a specific portfolio"""
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    return jsonify(portfolio.to_dict()), 200

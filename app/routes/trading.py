"""Trading routes"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.trade import Trade
from app.models.portfolio import Portfolio

bp = Blueprint('trading', __name__, url_prefix='/api/trading')

@bp.route('/trades', methods=['GET'])
@jwt_required()
def get_trades():
    """Get all trades for current user"""
    user_id = get_jwt_identity()
    trades = Trade.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'trades': [t.to_dict() for t in trades]
    }), 200

@bp.route('/execute', methods=['POST'])
@jwt_required()
def execute_trade():
    """Execute a trade"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    required_fields = ['portfolio_id', 'symbol', 'trade_type', 'quantity', 'price']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    portfolio = Portfolio.query.filter_by(id=data['portfolio_id'], user_id=user_id).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    trade_type = data['trade_type'].upper()
    if trade_type not in ['BUY', 'SELL']:
        return jsonify({'error': 'Invalid trade type'}), 400
    
    total_value = data['quantity'] * data['price']
    commission = data.get('commission', 0.0)
    
    trade = Trade(
        user_id=user_id,
        portfolio_id=data['portfolio_id'],
        symbol=data['symbol'],
        trade_type=trade_type,
        quantity=data['quantity'],
        price=data['price'],
        total_value=total_value,
        commission=commission
    )
    
    # Update portfolio cash balance
    if trade_type == 'BUY':
        portfolio.cash_balance -= (total_value + commission)
    else:
        portfolio.cash_balance += (total_value - commission)
    
    db.session.add(trade)
    db.session.commit()
    
    return jsonify({
        'message': 'Trade executed successfully',
        'trade': trade.to_dict()
    }), 201

"""GlobalMarket.com - Broker Investment Platform"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory function"""
    app = Flask(__name__)
    
    # Load configuration
    if config_name == 'production':
        from config.settings import ProductionConfig as config
    else:
        from config.settings import DevelopmentConfig as config
    
    app.config.from_object(config)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    with app.app_context():
        from app.routes import auth, portfolio, trading
        app.register_blueprint(auth.bp)
        app.register_blueprint(portfolio.bp)
        app.register_blueprint(trading.bp)
        
        # Create tables
        db.create_all()
    
    return app

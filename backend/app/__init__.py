from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize extensions
mongo = PyMongo()
jwt = JWTManager()
mail = Mail()
cors = CORS()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/oddu_app')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    
    # Initialize extensions with app
    mongo.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(app, 
                  origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
                  allow_headers=["Content-Type", "Authorization"],
                  methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/users')
    
    @app.route('/')
    def health_check():
        return {'message': 'Oddu API is running'}, 200
    
    return app
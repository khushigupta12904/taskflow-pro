from flask import Flask, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from app.config import Config

# Extensions initialize karte hain
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # App ke saath extensions connect kar rahe hain
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # API Blueprints register kar rahe hain
    from app.routes.auth import auth_bp
    from app.routes.task import task_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(task_bp)

    # Frontend HTML Routes
    @app.route('/')
    def index():
        return redirect('/login')

    @app.route('/login')
    def login_page():
        return render_template('login.html')

    @app.route('/register')
    def register_page():
        return render_template('register.html')

    @app.route('/dashboard')
    def dashboard_page():
        return render_template('dashboard.html')

    # Basic API health check endpoint
    @app.route('/api/health')
    def health_check():
        return {"status": "success", "message": "TaskFlow Pro API is running!"}

    # Import models so they are registered with SQLAlchemy
    from app.models import User, Task

    return app
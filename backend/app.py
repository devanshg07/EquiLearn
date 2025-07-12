from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the absolute paths to frontend directories
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(os.path.dirname(current_dir), 'frontend')
template_dir = os.path.join(frontend_dir, 'templates')
static_dir = os.path.join(frontend_dir, 'static')

app = Flask(__name__, 
            template_folder=template_dir,
            static_folder=static_dir)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///equilearn.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='donor')  # donor, admin, school
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    donations = db.relationship('Donation', backref='donor', lazy=True)

class School(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(50), nullable=False)  # urban, rural, suburban
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    needs = db.relationship('Need', backref='school', lazy=True)

class Need(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    urgency = db.Column(db.String(20), nullable=False)  # high, medium, low
    total_needed = db.Column(db.Integer, nullable=False)
    current_donations = db.Column(db.Integer, default=0)
    cost_per_item = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    donations = db.relationship('Donation', backref='need', lazy=True)

class Donation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    need_id = db.Column(db.Integer, db.ForeignKey('need.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    donation_type = db.Column(db.String(20), nullable=False)  # direct, pool
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/schools', methods=['GET'])
def get_schools():
    """Get all schools with their needs"""
    schools = School.query.filter_by(verified=True).all()
    result = []
    
    for school in schools:
        school_data = {
            'id': school.id,
            'name': school.name,
            'location': school.location,
            'city': school.city,
            'state': school.state,
            'needs': []
        }
        
        for need in school.needs:
            if need.status == 'approved':
                need_data = {
                    'id': need.id,
                    'title': need.title,
                    'description': need.description,
                    'category': need.category,
                    'urgency': need.urgency,
                    'totalNeeded': need.total_needed,
                    'currentDonations': need.current_donations,
                    'costPerItem': need.cost_per_item,
                    'totalCost': need.total_needed * need.cost_per_item
                }
                school_data['needs'].append(need_data)
        
        if school_data['needs']:  # Only include schools with approved needs
            result.append(school_data)
    
    return jsonify(result)

@app.route('/api/schools', methods=['POST'])
def create_school():
    """Register a new school"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['name', 'location', 'city', 'state']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    school = School(
        name=data['name'],
        location=data['location'],
        city=data['city'],
        state=data['state'],
        description=data.get('description', '')
    )
    
    db.session.add(school)
    db.session.commit()
    
    return jsonify({'message': 'School registered successfully', 'id': school.id}), 201

@app.route('/api/needs', methods=['POST'])
def create_need():
    """Create a new need for a school"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['school_id', 'title', 'description', 'category', 'urgency', 'total_needed', 'cost_per_item']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    need = Need(
        school_id=data['school_id'],
        title=data['title'],
        description=data['description'],
        category=data['category'],
        urgency=data['urgency'],
        total_needed=data['total_needed'],
        cost_per_item=data['cost_per_item']
    )
    
    db.session.add(need)
    db.session.commit()
    
    return jsonify({'message': 'Need created successfully', 'id': need.id}), 201

@app.route('/api/donations', methods=['POST'])
def create_donation():
    """Process a donation"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['amount', 'donation_type']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create anonymous donor if not logged in
    donor_id = None
    if current_user.is_authenticated:
        donor_id = current_user.id
    else:
        # Create anonymous user for tracking
        anonymous_user = User(
            email=f"anonymous_{datetime.utcnow().timestamp()}@equilearn.org",
            password_hash=generate_password_hash('anonymous'),
            name=data.get('donor_name', 'Anonymous Donor'),
            role='donor'
        )
        db.session.add(anonymous_user)
        db.session.commit()
        donor_id = anonymous_user.id
    
    donation = Donation(
        donor_id=donor_id,
        need_id=data.get('need_id'),
        amount=data['amount'],
        donation_type=data['donation_type'],
        message=data.get('message', '')
    )
    
    db.session.add(donation)
    
    # Update need progress if it's a direct donation
    if data['donation_type'] == 'direct' and data.get('need_id'):
        need = Need.query.get(data['need_id'])
        if need:
            items_funded = int(data['amount'] / need.cost_per_item)
            need.current_donations = min(need.current_donations + items_funded, need.total_needed)
    
    db.session.commit()
    
    return jsonify({'message': 'Donation processed successfully', 'id': donation.id}), 201

@app.route('/api/donations', methods=['GET'])
def get_donations():
    """Get donation history for current user"""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Authentication required'}), 401
    
    donations = Donation.query.filter_by(donor_id=current_user.id).order_by(Donation.created_at.desc()).all()
    
    result = []
    for donation in donations:
        donation_data = {
            'id': donation.id,
            'amount': donation.amount,
            'type': donation.donation_type,
            'message': donation.message,
            'date': donation.created_at.isoformat()
        }
        
        if donation.need:
            donation_data['need_title'] = donation.need.title
            donation_data['school_name'] = donation.need.school.name
        
        result.append(donation_data)
    
    return jsonify(result)

@app.route('/api/admin/needs/pending', methods=['GET'])
@login_required
def get_pending_needs():
    """Get pending needs for admin approval"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    needs = Need.query.filter_by(status='pending').all()
    result = []
    
    for need in needs:
        need_data = {
            'id': need.id,
            'school_name': need.school.name,
            'title': need.title,
            'description': need.description,
            'category': need.category,
            'urgency': need.urgency,
            'total_cost': need.total_needed * need.cost_per_item,
            'submitted_date': need.created_at.strftime('%Y-%m-%d')
        }
        result.append(need_data)
    
    return jsonify(result)

@app.route('/api/admin/needs/<int:need_id>/approve', methods=['POST'])
@login_required
def approve_need(need_id):
    """Approve a pending need"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    need = Need.query.get_or_404(need_id)
    need.status = 'approved'
    db.session.commit()
    
    return jsonify({'message': 'Need approved successfully'})

@app.route('/api/admin/needs/<int:need_id>/reject', methods=['POST'])
@login_required
def reject_need(need_id):
    """Reject a pending need"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    need = Need.query.get_or_404(need_id)
    need.status = 'rejected'
    db.session.commit()
    
    return jsonify({'message': 'Need rejected successfully'})

@app.route('/api/admin/schools', methods=['GET'])
@login_required
def get_all_schools():
    """Get all schools for admin management"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    schools = School.query.all()
    result = []
    
    for school in schools:
        school_data = {
            'id': school.id,
            'name': school.name,
            'location': school.location,
            'city': school.city,
            'state': school.state,
            'verified': school.verified,
            'needs_count': len(school.needs)
        }
        result.append(school_data)
    
    return jsonify(result)

@app.route('/api/admin/schools/<int:school_id>/verify', methods=['POST'])
@login_required
def verify_school(school_id):
    """Verify a school"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    school = School.query.get_or_404(school_id)
    school.verified = True
    db.session.commit()
    
    return jsonify({'message': 'School verified successfully'})

@app.route('/api/impact', methods=['GET'])
def get_impact_stats():
    """Get overall impact statistics"""
    total_donations = db.session.query(db.func.sum(Donation.amount)).scalar() or 0
    total_schools = School.query.filter_by(verified=True).count()
    total_needs = Need.query.filter_by(status='approved').count()
    
    return jsonify({
        'total_donations': total_donations,
        'schools_helped': total_schools,
        'needs_funded': total_needs,
        'students_impacted': int(total_donations / 100)  # Rough estimate
    })

# Authentication routes
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        user = User(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            name=data['name'],
            role=data.get('role', 'donor')
        )
        
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return jsonify({'message': 'Registration successful'}), 201
    
    return render_template('register.html')

@app.route('/register/donor', methods=['GET', 'POST'])
def register_donor():
    if request.method == 'POST':
        data = request.get_json()
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        user = User(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            name=data['name'],
            role='donor'
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Registration successful'}), 201
    return render_template('register_donor.html')

@app.route('/register/admin', methods=['GET', 'POST'])
def register_admin():
    if request.method == 'POST':
        data = request.get_json()
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        user = User(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            name=data['name'],
            role='admin'
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Registration successful'}), 201
    return render_template('register_admin.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        if user and check_password_hash(user.password_hash, data['password']):
            login_user(user)
            return jsonify({'message': 'Login successful'})
        return jsonify({'error': 'Invalid credentials'}), 401
    # If already logged in, redirect to main page
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# Initialize database
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create admin user if it doesn't exist
        admin = User.query.filter_by(email='admin@equilearn.org').first()
        if not admin:
            admin = User(
                email='admin@equilearn.org',
                password_hash=generate_password_hash('admin123'),
                name='Admin User',
                role='admin'
            )
            db.session.add(admin)
        
        # Add sample data if database is empty
        if School.query.count() == 0:
            sample_schools = [
                School(name="Oakwood Middle School", location="urban", city="Springfield", state="IL", verified=True),
                School(name="Riverside Elementary", location="rural", city="Farmville", state="NC", verified=True),
                School(name="Lincoln High School", location="suburban", city="Fairview", state="CA", verified=True)
            ]
            
            for school in sample_schools:
                db.session.add(school)
            
            db.session.commit()
            
            # Add sample needs
            sample_needs = [
                Need(school_id=1, title="Chromebooks for Grade 6", description="Need 5 Chromebooks for our 6th grade computer lab", 
                     category="Technology", urgency="high", total_needed=5, current_donations=2, cost_per_item=300, status="approved"),
                Need(school_id=1, title="Science Lab Equipment", description="Microscopes and lab supplies for biology class", 
                     category="STEM", urgency="medium", total_needed=10, current_donations=3, cost_per_item=150, status="approved"),
                Need(school_id=2, title="Art Supplies", description="Paint, brushes, and canvas for art class", 
                     category="Art", urgency="low", total_needed=50, current_donations=15, cost_per_item=5, status="approved"),
                Need(school_id=3, title="Sports Equipment", description="Basketballs, soccer balls, and gym equipment", 
                     category="Sports", urgency="medium", total_needed=20, current_donations=8, cost_per_item=25, status="approved"),
                Need(school_id=3, title="Library Books", description="New fiction and non-fiction books for library", 
                     category="Books", urgency="low", total_needed=100, current_donations=30, cost_per_item=15, status="approved")
            ]
            
            for need in sample_needs:
                db.session.add(need)
            
            db.session.commit()
        
        print("Database initialized successfully!")

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000) 
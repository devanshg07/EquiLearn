from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
load_dotenv()
import openai
import re
import json
from models import User, School, Need, Donation, FeaturedSchool, FeaturedSchoolDonation, MicroDonationPool
from extensions import db, login_manager
from flask_migrate import Migrate
import random
openai.api_key = os.getenv('OPENAI_API_KEY')

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

db.init_app(app)
migrate = Migrate(app, db)
CORS(app)
login_manager.init_app(app)

# Database Models

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return "EquiLearn Flask backend is running."

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

@app.route('/api/featured-schools')
def featured_schools():
    city = request.args.get('city')
    user_id = request.args.get('user_id')
    if not city:
        return jsonify({'error': 'City is required'}), 400
    # Check DB first for this city only
    query = FeaturedSchool.query.filter_by(city=city)
    if user_id:
        query = query.filter_by(user_id=user_id)
    schools = query.all()
    if schools:
        return jsonify([
            {
                'id': s.id,
                'name': s.name,
                'location': s.location,
                'description': s.description,
                'needs': json.loads(s.needs) if s.needs else [],
                'fundingGoal': s.funding_goal,
                'currentFunding': s.current_funding
            } for s in schools
        ])
    # Instead of OpenAI, generate 6 mock schools with reasonable values
    if city and city.lower() == 'mississauga':
        mock_schools = [
            {
                'name': 'John Fraser Secondary School',
                'location': '2665 Erin Centre Blvd, Mississauga, ON L5M 5H6',
                'description': 'John Fraser Secondary School is a public high school in Mississauga with a focus on academic excellence and extracurricular activities.',
                'needs': ['new textbooks', 'upgraded technology', 'sports equipment'],
                'fundingGoal': 10000,
                'currentFunding': 300
            },
            {
                'name': 'St. Marcellinus Secondary School',
                'location': '730 Courtneypark Dr W, Mississauga, ON L5W 1L9',
                'description': 'St. Marcellinus Secondary School is a Catholic high school known for its strong arts and sports programs.',
                'needs': ['musical instruments', 'art supplies', 'sports uniforms'],
                'fundingGoal': 8000,
                'currentFunding': 210
            },
            {
                'name': 'Barondale Public School',
                'location': '200 Barondale Dr, Mississauga, ON L4Z 3N7',
                'description': 'Barondale Public School is an elementary school in Mississauga that prides itself on fostering a supportive and inclusive learning environment.',
                'needs': ['educational games', 'classroom supplies', 'updated library books'],
                'fundingGoal': 5000,
                'currentFunding': 0
            },
        ]
        return jsonify(mock_schools)
    mock_schools = [
        {
            'name': f'{city} Central School',
            'location': f'{city}, Main St',
            'description': f'A leading K-12 school in {city}.',
            'needs': ['new computers', 'library books', 'sports equipment'],
            'fundingGoal': 10000,
            'currentFunding': 3000
        },
        {
            'name': f'{city} North Academy',
            'location': f'{city}, North Ave',
            'description': f'An innovative school in the north of {city}.',
            'needs': ['science lab', 'musical instruments', 'art supplies'],
            'fundingGoal': 5000,
            'currentFunding': 2100
        },
        {
            'name': f'{city} South Elementary',
            'location': f'{city}, South Rd',
            'description': f'A vibrant elementary school in {city}.',
            'needs': ['playground upgrade', 'STEM kits', 'tablets'],
            'fundingGoal': 6400,
            'currentFunding': 1200
        },
        {
            'name': f'{city} West High',
            'location': f'{city}, West Blvd',
            'description': f'A high school with a focus on sports and arts.',
            'needs': ['gym renovation', 'band uniforms', 'projectors'],
            'fundingGoal': 15000,
            'currentFunding': 8000
        },
        {
            'name': f'{city} East Prep',
            'location': f'{city}, East Pkwy',
            'description': f'A preparatory school in the east of {city}.',
            'needs': ['robotics club', 'language lab', 'smart boards'],
            'fundingGoal': 12000,
            'currentFunding': 4000
        },
        {
            'name': f'{city} Lakeside School',
            'location': f'{city}, Lakeside Dr',
            'description': f'A school near the lake in {city}.',
            'needs': ['canoes', 'environmental science kits', 'garden tools'],
            'fundingGoal': 9000,
            'currentFunding': 6000
        },
    ]
    # Save to DB for this city
    for s in mock_schools:
        db.session.add(FeaturedSchool(
            user_id=user_id,
            city=city,
            name=s['name'],
            location=s['location'],
            description=s['description'],
            needs=json.dumps(s['needs']),
            funding_goal=s['fundingGoal'],
            current_funding=s['currentFunding']
        ))
    db.session.commit()
    return jsonify(mock_schools)

@app.route('/api/featured-schools/donate', methods=['POST'])
def donate_to_featured_school():
    data = request.get_json()
    school_id = data.get('school_id')
    amount = data.get('amount')
    if not school_id or not amount or amount <= 0:
        return jsonify({'error': 'Invalid school_id or amount'}), 400
    school = FeaturedSchool.query.get(school_id)
    if not school:
        return jsonify({'error': 'School not found'}), 404
    if school.current_funding is None:
        school.current_funding = 0
    school.current_funding += amount
    # Record the donation if user is logged in
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id
        db.session.add(FeaturedSchoolDonation(user_id=user_id, school_id=school_id, amount=amount))
    db.session.commit()
    # Calculate user's total donated to featured schools
    total_donated = 0
    if user_id:
        total_donated = db.session.query(db.func.sum(FeaturedSchoolDonation.amount)).filter_by(user_id=user_id).scalar() or 0
    return jsonify({
        'school_id': school.id,
        'currentFunding': school.current_funding,
        'fundingGoal': school.funding_goal,
        'userTotalDonated': total_donated
    })

@app.route('/api/micro-pools', methods=['GET'])
def get_micro_pools():
    pools = MicroDonationPool.query.all()
    return jsonify([
        {
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'targetAmount': p.target_amount,
            'currentAmount': p.current_amount,
            'participants': p.participants,
            'endDate': p.end_date.strftime('%Y-%m-%d')
        } for p in pools
    ])

@app.route('/api/micro-pools/join', methods=['POST'])
@login_required
def join_micro_pool():
    data = request.get_json()
    pool_id = data.get('pool_id')
    amount = data.get('amount', 0)
    pool = MicroDonationPool.query.get(pool_id)
    if not pool:
        return jsonify({'error': 'Pool not found'}), 404
    pool.current_amount += amount
    pool.participants += 1
    from models import MicroDonationPoolJoin
    join = MicroDonationPoolJoin(user_id=current_user.id, pool_id=pool_id, amount=amount)
    db.session.add(join)
    db.session.commit()
    return jsonify({'message': 'Donated to pool successfully', 'currentAmount': pool.current_amount, 'participants': pool.participants})

# Authentication routes
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
            session.permanent = True
            app.permanent_session_lifetime = timedelta(days=30)
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
        
        # Add sample micro donation pools if none exist
        if MicroDonationPool.query.count() == 0:
            from datetime import datetime
            pools = [
                MicroDonationPool(
                    name='Back to School Supplies',
                    description='Help provide essential school supplies for students in need across multiple schools.',
                    target_amount=10000,
                    current_amount=6500,
                    participants=127,
                    end_date=datetime(2024, 2, 14)
                ),
                MicroDonationPool(
                    name='Technology for All',
                    description='Fund computers and tablets for schools that lack basic technology infrastructure.',
                    target_amount=25000,
                    current_amount=18200,
                    participants=89,
                    end_date=datetime(2024, 2, 29)
                ),
                MicroDonationPool(
                    name='Sports Equipment Drive',
                    description='Provide sports equipment and uniforms for schools to promote physical education.',
                    target_amount=8000,
                    current_amount=4200,
                    participants=156,
                    end_date=datetime(2024, 2, 27)
                ),
            ]
            for pool in pools:
                db.session.add(pool)
            db.session.commit()
        
        print("Database initialized successfully!")

class OpenAIKeyLoader:
    @staticmethod
    def ensure_key():
        import openai, os
        if not openai.api_key or openai.api_key == '':
            openai.api_key = "sk-...yourkey..."  # <-- REPLACE with your real key

OpenAIKeyLoader.ensure_key()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000) 
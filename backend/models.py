"""
models.py - SQLAlchemy models for EquiLearn
Defines User, School, Need, Donation, and other database models.
"""
from datetime import datetime
from flask_login import UserMixin
from extensions import db
from sqlalchemy.dialects.sqlite import JSON

class User(UserMixin, db.Model):
    """Database model for platform users (donors/admins)."""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='donor')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    donations = db.relationship('Donation', backref='donor', lazy=True)

class School(db.Model):
    """Database model for educational institutions (schools)."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    needs = db.relationship('Need', backref='school', lazy=True)

class Need(db.Model):
    """Database model for specific needs at schools."""
    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    urgency = db.Column(db.String(20), nullable=False)
    total_needed = db.Column(db.Integer, nullable=False)
    current_donations = db.Column(db.Integer, default=0)
    cost_per_item = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    donations = db.relationship('Donation', backref='need', lazy=True)

class Donation(db.Model):
    """Database model for individual donations made by users."""
    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    need_id = db.Column(db.Integer, db.ForeignKey('need.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    donation_type = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 

class FeaturedSchool(db.Model):
    """Database model for featured schools on the platform."""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)  # Optionally associate with a user
    city = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    needs = db.Column(db.Text, nullable=True)  # Store as JSON string 
    funding_goal = db.Column(db.Float, nullable=True)
    current_funding = db.Column(db.Float, nullable=True) 

class FeaturedSchoolDonation(db.Model):
    """Database model for donations made to featured schools."""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey('featured_school.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 

class MicroDonationPoolJoin(db.Model):
    """Database model for users who have joined a micro donation pool."""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    pool_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow) 

class MicroDonationPool(db.Model):
    """Database model for a pool of micro donations."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0)
    participants = db.Column(db.Integer, default=0)
    end_date = db.Column(db.DateTime, nullable=False) 
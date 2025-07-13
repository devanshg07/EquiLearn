from app import app, db
from models import FeaturedSchool

with app.app_context():
    FeaturedSchool.query.filter_by(city='Mississauga').delete()
    db.session.commit()
    print("Cleared featured schools for Mississauga.")
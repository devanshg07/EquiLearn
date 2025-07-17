#!/usr/bin/env python3
"""
EquiLearn - Main Application Runner
"""

import sys
import os
#hi
# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import app, init_db

if __name__ == '__main__':
    print("🚀 Starting EquiLearn Application...")
    print("📚 Connecting schools with donors for educational needs")
    print("🌐 Server will be available at: http://localhost:5000")
    print("🔧 Admin login: admin@equilearn.org / admin123")
    print("-" * 50)
    
    # Initialize the database
    init_db()
    
    # Run the Flask application
    app.run(debug=True, host='0.0.0.0', port=5000) 
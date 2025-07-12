import React from 'react';
import { Link } from 'react-router-dom';
import { mockImpactStats, mockSchools } from '../data/mockData';
import './Home.css';

const Home: React.FC = () => {
  const featuredSchools = mockSchools.slice(0, 3);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Connecting Schools with Donors</h1>
          <p>Empowering education through community support. Help schools get the resources they need to provide quality education for all students.</p>
          <div className="hero-buttons">
            <Link to="/schools" className="btn btn-primary">Browse Schools</Link>
            <Link to="/register" className="btn btn-secondary">Become a Donor</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=600" alt="Students learning" />
        </div>
      </section>

      {/* Impact Stats */}
      <section className="impact-stats">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">${mockImpactStats.totalFunding.toLocaleString()}</div>
              <div className="stat-label">Total Funding Raised</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockImpactStats.schoolsSupported}</div>
              <div className="stat-label">Schools Supported</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockImpactStats.studentsImpacted.toLocaleString()}</div>
              <div className="stat-label">Students Impacted</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockImpactStats.totalDonations.toLocaleString()}</div>
              <div className="stat-label">Total Donations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schools */}
      <section className="featured-schools">
        <div className="container">
          <h2>Featured Schools</h2>
          <div className="schools-grid">
            {featuredSchools.map((school) => (
              <div key={school.id} className="school-card">
                <div className="school-image">
                  <img src={school.imageUrl} alt={school.name} />
                  <div className="funding-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${(school.currentFunding / school.fundingGoal) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="school-content">
                  <h3>{school.name}</h3>
                  <p className="school-location">{school.location}</p>
                  <p className="school-description">{school.description}</p>
                  <div className="school-needs">
                    <strong>Needs:</strong> {school.needs.join(', ')}
                  </div>
                  <div className="school-funding">
                    <span>${school.currentFunding.toLocaleString()} raised of ${school.fundingGoal.toLocaleString()}</span>
                  </div>
                  <Link to={`/schools/${school.id}`} className="btn btn-outline">Learn More</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/schools" className="btn btn-primary">View All Schools</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Browse Schools</h3>
              <p>Explore schools in need and learn about their specific requirements and goals.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Choose Your Impact</h3>
              <p>Select a school and donation amount that fits your budget and values.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Make a Difference</h3>
              <p>Your donation directly supports educational resources and student success.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 
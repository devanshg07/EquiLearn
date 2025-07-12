import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { mockImpactStats, mockSchools } from '../data/mockData';
import './Home.css';
import { FaDollarSign, FaSchool, FaUserGraduate, FaHandHoldingHeart } from 'react-icons/fa';

interface ImpactStats {
  totalDonations: number;
  schoolsSupported: number;
  studentsImpacted: number;
  totalFunding: number;
}

interface School {
  id: number;
  name: string;
  location: string;
  description: string;
  needs: string[];
  fundingGoal: number;
  currentFunding: number;
  imageUrl?: string;
  category?: string;
}

const fallbackImpactStats: ImpactStats = {
  totalDonations: 2847,
  schoolsSupported: 15,
  studentsImpacted: 8500,
  totalFunding: 125000
};

// Helper for circular progress
function FundingCircle({ percent }: { percent: number }) {
  const radius = 22;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - percent / 100 * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} style={{ marginRight: 8 }}>
      <circle
        stroke="#e9ecef"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="url(#grad)"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const Home: React.FC = () => {
  const [impactStats, setImpactStats] = useState<ImpactStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/impact').then(res => {
        if (!res.ok) throw new Error('Failed to fetch impact stats');
        return res.json();
      }),
      fetch('/api/schools').then(res => {
        if (!res.ok) throw new Error('Failed to fetch schools');
        return res.json();
      })
    ])
      .then(([impact, schools]) => {
        setImpactStats(impact);
        setSchools(schools);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const featuredSchools = schools.slice(0, 3);
  const stats = impactStats || fallbackImpactStats;

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
        {/* Removed hero-image */}
      </section>

      {/* Impact Stats */}
      <section className="impact-stats">
        <div className="container">
          <h2>Our Impact</h2>
          {loading && <div>Loading impact stats...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FaDollarSign /></div>
              <div className="stat-number">
                {typeof stats.totalFunding === 'number' ? `$${stats.totalFunding.toLocaleString()}` : 'N/A'}
              </div>
              <div className="stat-label">Total Funding Raised</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaSchool /></div>
              <div className="stat-number">
                {typeof stats.schoolsSupported === 'number' ? stats.schoolsSupported.toLocaleString() : 'N/A'}
              </div>
              <div className="stat-label">Schools Supported</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaUserGraduate /></div>
              <div className="stat-number">
                {typeof stats.studentsImpacted === 'number' ? stats.studentsImpacted.toLocaleString() : 'N/A'}
              </div>
              <div className="stat-label">Students Impacted</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaHandHoldingHeart /></div>
              <div className="stat-number">
                {typeof stats.totalDonations === 'number' ? stats.totalDonations.toLocaleString() : 'N/A'}
              </div>
              <div className="stat-label">Total Donations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schools */}
      {/* (Removed: Only show after login) */}

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
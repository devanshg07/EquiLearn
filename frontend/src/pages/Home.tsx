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
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);

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
                {`$${(stats.totalFunding ?? fallbackImpactStats.totalFunding).toLocaleString()}`}
              </div>
              <div className="stat-label">Total Funding Raised</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaSchool /></div>
              <div className="stat-number">
                {(stats.schoolsSupported ?? fallbackImpactStats.schoolsSupported).toLocaleString()}
              </div>
              <div className="stat-label">Schools Supported</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaUserGraduate /></div>
              <div className="stat-number">
                {(stats.studentsImpacted ?? fallbackImpactStats.studentsImpacted).toLocaleString()}
              </div>
              <div className="stat-label">Students Impacted</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaHandHoldingHeart /></div>
              <div className="stat-number">
                {(stats.totalDonations ?? fallbackImpactStats.totalDonations).toLocaleString()}
              </div>
              <div className="stat-label">Total Donations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schools */}
      {/* (Removed: Only show after login) */}

      {/* How It Works */}
      <section>
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

      {/* Supporting Companies Marquee */}
      <section style={{ background: '#f7f8fa', padding: '2rem 0', marginTop: 32 }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Companies Supporting Education Funding</h2>
          <div className="companies-marquee" style={{ overflow: 'hidden', width: '100%' }}>
            <div className="marquee-track" style={{ display: 'flex', width: 'max-content', animation: 'marquee 18s linear infinite' }}>
              {(() => {
                const companies = [
                  { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
                  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
                  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
                  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
                  { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg' },
                  { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Salesforce_logo.svg' },
                  { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
                ].filter(company => !hiddenCompanies.includes(company.name));
                // Duplicate the array for seamless looping
                const loopCompanies = [...companies, ...companies];
                return loopCompanies.map((company, idx) => (
                  <span key={company.name + idx} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 18px', minWidth: 60 }}>
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      style={{ height: 48, width: 'auto', marginBottom: 0, verticalAlign: 'middle', display: 'block', borderRadius: 10, boxShadow: '0 2px 12px rgba(102,126,234,0.10)', border: '1.5px solid #e0e0e0', background: '#fff', padding: 8 }} 
                      onError={() => setHiddenCompanies(prev => [...prev, company.name])}
                    />
                  </span>
                ));
              })()}
            </div>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default Home; 
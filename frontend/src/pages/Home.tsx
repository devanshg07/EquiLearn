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

const quotes = [
  {
    text: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela',
  },
  {
    text: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'The cost of ignorance is far greater than the price of education.',
    author: 'Unknown',
  },
  {
    text: 'Underfunded schools are a threat to our future. Every child deserves a chance.',
    author: 'Malala Yousafzai',
  },
];

const Home: React.FC = () => {
  const [impactStats, setImpactStats] = useState<ImpactStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);
  const [quoteIdx, setQuoteIdx] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(idx => (idx + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
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
            {/* Remove Browse Schools button */}
            <Link to="/register" className="btn btn-secondary">Become a Donor</Link>
          </div>
        </div>
        {/* Removed hero-image */}
      </section>
      <div className="section-divider" />

      {/* Slogan Section */}
      <section style={{ background: '#fff', padding: '1.5rem 0 0.5rem 0', marginBottom: 0 }}>
        <div className="container" style={{ maxWidth: 900, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#667eea', marginBottom: 8, letterSpacing: '-1px' }}>
            Say NO to underfunded education. Say YES to EquiLearn
          </div>
        </div>
      </section>

      {/* Impactful Quotes Section */}
      <section style={{ background: 'linear-gradient(90deg, #e0e7ff 0%, #fff 100%)', padding: '2.5rem 0 1.5rem 0', marginBottom: 0, borderRadius: '0 0 32px 32px' }}>
        <div className="container" style={{ maxWidth: 900, textAlign: 'center', overflow: 'hidden' }}>
          <div className="quotes-marquee" style={{ overflow: 'hidden', width: '100%' }}>
            <div className="marquee-track" style={{ display: 'flex', width: 'max-content', animation: 'marquee 22s linear infinite', animationDelay: '4s' }}>
              {(() => {
                const loopQuotes = [...quotes, ...quotes];
                return loopQuotes.map((q, idx) => (
                  <span key={q.text + idx} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 48px', minWidth: 320, fontFamily: '"Times New Roman", Times, serif' }}>
                    <blockquote style={{ fontSize: '1.25rem', fontWeight: 500, color: '#fff', fontStyle: 'normal', margin: 0, textAlign: 'center' }}>
                      “{q.text}”
                    </blockquote>
                    {q.author !== 'Unknown' && (
                      <div style={{ marginTop: 12, fontWeight: 600, color: '#fff', fontSize: '1.05rem' }}>— {q.author}</div>
                    )}
                  </span>
                ));
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats (refactored to match How It Works) */}
      <section style={{ background: '#e9ecef', borderRadius: 24, boxShadow: '0 2px 16px rgba(102, 126, 234, 0.10)', margin: '2rem 0', padding: '2.5rem 0' }}>
        <div className="container">
          <h2 className="how-it-works-title" style={{ color: '#111', textAlign: 'center' }}>Our Impact</h2>
          {loading && <div>Loading impact stats...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="steps-grid">
            <div className="step">
              <div className="stat-icon" style={{ color: '#7faaff', fontSize: '2.7rem', marginBottom: '1.1rem' }}><FaDollarSign /></div>
              <div className="stat-number" style={{ color: '#7faaff', fontWeight: 700, fontSize: '2.3rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                {`$${(stats.totalFunding ?? fallbackImpactStats.totalFunding).toLocaleString()}`}
              </div>
              <div className="stat-label" style={{ color: '#7faaff', fontWeight: 500, fontSize: '1.15rem' }}>Total Funding Raised</div>
            </div>
            <div className="step">
              <div className="stat-icon" style={{ color: '#7faaff', fontSize: '2.7rem', marginBottom: '1.1rem' }}><FaSchool /></div>
              <div className="stat-number" style={{ color: '#7faaff', fontWeight: 700, fontSize: '2.3rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                {(stats.schoolsSupported ?? fallbackImpactStats.schoolsSupported).toLocaleString()}
              </div>
              <div className="stat-label" style={{ color: '#7faaff', fontWeight: 500, fontSize: '1.15rem' }}>Schools Supported</div>
            </div>
            <div className="step">
              <div className="stat-icon" style={{ color: '#7faaff', fontSize: '2.7rem', marginBottom: '1.1rem' }}><FaUserGraduate /></div>
              <div className="stat-number" style={{ color: '#7faaff', fontWeight: 700, fontSize: '2.3rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                {(stats.studentsImpacted ?? fallbackImpactStats.studentsImpacted).toLocaleString()}
              </div>
              <div className="stat-label" style={{ color: '#7faaff', fontWeight: 500, fontSize: '1.15rem' }}>Students Impacted</div>
            </div>
            <div className="step">
              <div className="stat-icon" style={{ color: '#7faaff', fontSize: '2.7rem', marginBottom: '1.1rem' }}><FaHandHoldingHeart /></div>
              <div className="stat-number" style={{ color: '#7faaff', fontWeight: 700, fontSize: '2.3rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                {(stats.totalDonations ?? fallbackImpactStats.totalDonations).toLocaleString()}
              </div>
              <div className="stat-label" style={{ color: '#7faaff', fontWeight: 500, fontSize: '1.15rem' }}>Total Donations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schools */}
      {/* (Removed: Only show after login) */}

      {/* How It Works */}
      <section style={{ background: '#e9ecef', borderRadius: 24, boxShadow: '0 2px 16px rgba(102, 126, 234, 0.10)', margin: '2rem 0', padding: '2.5rem 0' }}>
        <div className="container">
          <h2 className="how-it-works-title" style={{ color: '#111', textAlign: 'center' }}>How It Works</h2>
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
      <section style={{ background: '#e9ecef', borderRadius: 24, boxShadow: '0 2px 16px rgba(102, 126, 234, 0.10)', margin: '2rem 0', padding: '2.5rem 0' }}>
        <div className="container">
          <h2 style={{ color: '#7faaff', textAlign: 'center', marginBottom: 24, fontSize: '2.1rem', fontWeight: 900 }}>Companies Supporting Education Funding</h2>
          <div className="companies-marquee" style={{ overflow: 'hidden', width: '100%' }}>
            <div className="marquee-track" style={{ display: 'flex', width: 'max-content', animation: 'marquee 18s linear infinite', animationDelay: '4s' }}>
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
                const loopCompanies = [...companies, ...companies];
                return loopCompanies.map((company, idx) => (
                  <span key={company.name + idx} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 32px', minWidth: 60, color: '#7faaff' }}>
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

      {/* Supporting People Marquee */}
      <section style={{ background: '#e9ecef', borderRadius: 24, boxShadow: '0 2px 16px rgba(102, 126, 234, 0.10)', margin: '2rem 0', padding: '2.5rem 0' }}>
        <div className="container">
          <h2 style={{ color: '#7faaff', textAlign: 'center', marginBottom: 24, fontSize: '2.1rem', fontWeight: 900 }}>People Supporting Education Funding</h2>
          <div className="people-marquee" style={{ overflow: 'hidden', width: '100%' }}>
            <div className="marquee-track" style={{ display: 'flex', width: 'max-content', animation: 'marquee 18s linear infinite', animationDelay: '4s' }}>
              {(() => {
                const people = [
                  'Bill Gates',
                  'MacKenzie Scott',
                  'Mark Zuckerberg',
                  'Elon Musk',
                  'Michael Bloomberg',
                ];
                const loopPeople = [...people, ...people];
                return loopPeople.map((person, idx) => (
                  <span key={person + idx} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 32px', fontWeight: 600, fontSize: 22, color: '#7faaff' }}>
                    {person}
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
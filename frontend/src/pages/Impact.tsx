import React from 'react';

interface ImpactProps {
  recentDonations: any[];
}

const Impact: React.FC<ImpactProps> = ({ recentDonations }) => {
  const totalDonated = recentDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const donationsMade = recentDonations.length;
  const schoolsSupported = new Set(recentDonations.filter(d => d.type === 'School').map(d => d.name)).size;

  return (
    <div className="impact-page" style={{ background: '#f4f6f8', minHeight: '100vh', padding: '3rem 0' }}>
      <h1 style={{ fontSize: '2.7rem', fontWeight: 900, color: '#7faaff', textAlign: 'center', marginBottom: 8, letterSpacing: '-1px' }}>Your Impact</h1>
      <p style={{ fontSize: '1.18rem', marginBottom: 36, color: '#222', fontWeight: 500, textAlign: 'center' }}>
        Thank you for your impact! You are really making a difference.
      </p>
      <div className="impact-overview" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="impact-card" style={{ background: '#fff', borderRadius: 32, boxShadow: '0 8px 40px rgba(33, 150, 243, 0.13)', padding: '2.7rem 2.5rem', minWidth: 420, maxWidth: 540, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="impact-stats" style={{ display: 'flex', justifyContent: 'center', gap: '3.5rem', width: '100%' }}>
            <div className="impact-stat" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7faaff', marginBottom: 4 }}>${totalDonated.toLocaleString()}</div>
              <div className="stat-label" style={{ color: '#222', fontSize: '1.13rem', fontWeight: 600 }}>Total Donated</div>
            </div>
            <div className="impact-stat" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7faaff', marginBottom: 4 }}>{donationsMade}</div>
              <div className="stat-label" style={{ color: '#222', fontSize: '1.13rem', fontWeight: 600 }}>Donations Made</div>
            </div>
            <div className="impact-stat" style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7faaff', marginBottom: 4 }}>{schoolsSupported}</div>
              <div className="stat-label" style={{ color: '#222', fontSize: '1.13rem', fontWeight: 600 }}>Schools Supported</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impact; 
import React from 'react';

interface ImpactProps {
  recentDonations: any[];
}

const Impact: React.FC<ImpactProps> = ({ recentDonations }) => {
  const totalDonated = recentDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const donationsMade = recentDonations.length;
  const schoolsSupported = new Set(recentDonations.filter(d => d.type === 'School').map(d => d.name)).size;

  return (
    <div className="container" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0' }}>
      <h1>Your Impact</h1>
      <p style={{ fontSize: '1.15rem', marginBottom: 24, color: '#3a3a3a', fontWeight: 500 }}>
        Thank you for your impact! You are really making a difference.
      </p>
      <div className="impact-overview">
        <div className="impact-card">
          <div className="impact-stats">
            <div className="impact-stat">
              <div className="stat-number">${totalDonated.toLocaleString()}</div>
              <div className="stat-label">Total Donated</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number">{donationsMade}</div>
              <div className="stat-label">Donations Made</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number">{schoolsSupported}</div>
              <div className="stat-label">Schools Supported</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impact; 
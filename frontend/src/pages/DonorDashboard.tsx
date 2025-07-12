import React from 'react';
import { User } from '../types';
import { mockDonations, mockMicroDonationPools, mockSchools } from '../data/mockData';
import './Dashboard.css';

interface DonorDashboardProps {
  user: User;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ user }) => {
  const userDonations = mockDonations.filter(d => d.donorName === user.name);
  const totalDonated = userDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}!</h1>
          <p>Track your impact and manage your donations</p>
        </div>

        {/* Impact Overview */}
        <div className="impact-overview">
          <div className="impact-card">
            <h3>Your Impact</h3>
            <div className="impact-stats">
              <div className="impact-stat">
                <div className="stat-number">${totalDonated.toLocaleString()}</div>
                <div className="stat-label">Total Donated</div>
              </div>
              <div className="impact-stat">
                <div className="stat-number">{userDonations.length}</div>
                <div className="stat-label">Donations Made</div>
              </div>
              <div className="impact-stat">
                <div className="stat-number">{new Set(userDonations.map(d => d.schoolId)).size}</div>
                <div className="stat-label">Schools Supported</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Schools (only after login) */}
        <div className="dashboard-section">
          <h2>Featured Schools Near You</h2>
          <div className="schools-grid">
            {mockSchools.slice(0, 3).map((school) => {
              const percent = school.fundingGoal ? Math.round((school.currentFunding / school.fundingGoal) * 100) : 0;
              return (
                <div key={school.id} className="school-card">
                  <div className="school-content">
                    <h3>{school.name}</h3>
                    <p className="school-location">{school.location}</p>
                    <p className="school-description">{school.description}</p>
                    <div className="school-needs">
                      <strong>Needs:</strong>
                      {Array.isArray(school.needs) && school.needs.length > 0
                        ? school.needs.map((need, i) => (
                            <span className="need-badge" key={i}>{need}</span>
                          ))
                        : <span className="need-badge">N/A</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <div className="school-funding">
                        <span>
                          <b>${school.currentFunding?.toLocaleString?.() || 0}</b> raised of <b>${school.fundingGoal?.toLocaleString?.() || 0}</b>
                        </span>
                      </div>
                      <div className="funding-progress" style={{ flex: 1, marginLeft: 12 }}>
                        <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                    <button className="btn btn-primary">Donate</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="dashboard-section">
          <h2>Recent Donations</h2>
          <div className="donations-list">
            {userDonations.slice(0, 5).map((donation) => (
              <div key={donation.id} className="donation-item">
                <div className="donation-info">
                  <h4>{donation.schoolName}</h4>
                  <p className="donation-date">{new Date(donation.date).toLocaleDateString()}</p>
                  {donation.message && (
                    <p className="donation-message">"{donation.message}"</p>
                  )}
                </div>
                <div className="donation-amount">
                  ${donation.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {userDonations.length === 0 && (
              <p className="no-donations">You haven't made any donations yet. <a href="/schools">Browse schools</a> to get started!</p>
            )}
          </div>
        </div>

        {/* Micro Donation Pools */}
        <div className="dashboard-section">
          <h2>Micro Donation Pools</h2>
          <div className="pools-grid">
            {mockMicroDonationPools.map((pool) => (
              <div key={pool.id} className="pool-card">
                <h3>{pool.name}</h3>
                <p>{pool.description}</p>
                <div className="pool-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(pool.currentAmount / pool.targetAmount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="pool-stats">
                    <span>${pool.currentAmount.toLocaleString()} of ${pool.targetAmount.toLocaleString()}</span>
                    <span>{pool.participants} participants</span>
                  </div>
                </div>
                <div className="pool-deadline">
                  Ends: {new Date(pool.endDate).toLocaleDateString()}
                </div>
                <button className="btn btn-primary">Join Pool</button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/schools" className="action-card">
              <h3>Browse Schools</h3>
              <p>Find new schools to support</p>
            </a>
            <a href="/schools" className="action-card">
              <h3>Make a Donation</h3>
              <p>Support a school in need</p>
            </a>
            <a href="#" className="action-card">
              <h3>View Impact Report</h3>
              <p>See detailed impact metrics</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard; 
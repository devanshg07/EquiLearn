import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { mockDonations, mockMicroDonationPools } from '../data/mockData';
import './Dashboard.css';

interface DonorDashboardProps {
  user: User;
  onUserTotalDonatedChange?: (total: number) => void;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ user, onUserTotalDonatedChange }) => {
  // Remove mockDonations usage for impact
  const [userDonations, setUserDonations] = useState<any[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [donationsLoading, setDonationsLoading] = useState(false);

  // Featured schools state
  const [featuredSchools, setFeaturedSchools] = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [errorSchools, setErrorSchools] = useState<string | null>(null);

  // Add state for donation amounts and loading
  const [donationAmounts, setDonationAmounts] = useState<{ [key: number]: number }>({});
  const [donationLoading, setDonationLoading] = useState<{ [key: number]: boolean }>({});

  const handleDonate = async (schoolId: number, idx: number) => {
    const amount = donationAmounts[schoolId];
    if (!amount || amount <= 0) return;
    setDonationLoading(l => ({ ...l, [schoolId]: true }));
    try {
      const res = await fetch('/api/featured-schools/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_id: schoolId, amount })
      });
      const data = await res.json();
      if (data.currentFunding !== undefined) {
        setFeaturedSchools(schools => schools.map((s, i) =>
          i === idx ? { ...s, currentFunding: data.currentFunding } : s
        ));
        setDonationAmounts(a => ({ ...a, [schoolId]: 0 }));
        fetchUserDonations(); // Refresh donations after donating
        if (data.userTotalDonated !== undefined && onUserTotalDonatedChange) {
          onUserTotalDonatedChange(data.userTotalDonated);
        }
      }
    } catch (e) {}
    setDonationLoading(l => ({ ...l, [schoolId]: false }));
  };

  // Fetch real donations on mount and after donation
  const fetchUserDonations = () => {
    setDonationsLoading(true);
    fetch('/api/donations', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUserDonations(data);
          setTotalDonated(data.reduce((sum, d) => sum + d.amount, 0));
          if (onUserTotalDonatedChange) onUserTotalDonatedChange(data.reduce((sum, d) => sum + d.amount, 0));
        }
        setDonationsLoading(false);
      })
      .catch(() => setDonationsLoading(false));
  };

  useEffect(() => {
    fetchUserDonations();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!user.city) return;
    setLoadingSchools(true);
    fetch(`/api/featured-schools?city=${encodeURIComponent(user.city)}`)
      .then(res => res.json())
      .then(data => {
        setFeaturedSchools(data);
        setLoadingSchools(false);
      })
      .catch(err => {
        setErrorSchools('Could not load featured schools');
        setLoadingSchools(false);
      });
  }, [user.city]);

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
                <div className="stat-number">{new Set(userDonations.map(d => d.school_name || d.schoolName)).size}</div>
                <div className="stat-label">Schools Supported</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Schools (only after login) */}
        <div className="dashboard-section">
          <h2>Schools Near You</h2>
          {loadingSchools && <div>Loading schools...</div>}
          {errorSchools && <div style={{ color: 'red' }}>{errorSchools}</div>}
          {(!loadingSchools && featuredSchools.length === 0) && (
            <div>No schools found for your city.</div>
          )}
          <div className="schools-grid">
            {Array.isArray(featuredSchools) && featuredSchools.map((school, idx) => {
              const percent = school.fundingGoal && school.currentFunding ? Math.round((school.currentFunding / school.fundingGoal) * 100) : 0;
              // Fix needs display
              let needsList: string[] = [];
              if (Array.isArray(school.needs)) {
                needsList = school.needs.map((need: any) => {
                  if (typeof need === 'string') return need;
                  if (typeof need === 'object' && need !== null) {
                    // Try to get a string property
                    return need.title || need.name || Object.values(need).find(v => typeof v === 'string') || JSON.stringify(need);
                  }
                  return String(need);
                });
              }
              return (
                <div key={school.name + idx} className="school-card">
                  <div className="school-content">
                    <h3>{school.name}</h3>
                    <p className="school-location">{school.location}</p>
                    <p className="school-description">{school.description}</p>
                    <div className="school-needs">
                      <strong>Needs:</strong>
                      {needsList.length > 0
                        ? needsList.map((need, i) => (
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <input
                        type="number"
                        min={1}
                        placeholder="Amount"
                        value={donationAmounts[school.id] || ''}
                        onChange={e => setDonationAmounts(a => ({ ...a, [school.id]: Number(e.target.value) }))}
                        style={{ width: 80 }}
                      />
                      <button
                        className="btn btn-primary"
                        disabled={donationLoading[school.id] || !donationAmounts[school.id] || donationAmounts[school.id] <= 0}
                        onClick={() => handleDonate(school.id, idx)}
                      >
                        {donationLoading[school.id] ? 'Donating...' : 'Donate'}
                      </button>
                    </div>
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
                  <h4>{donation.school_name || donation.schoolName}</h4>
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
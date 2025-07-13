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
  const [donationsLoading, setDonationsLoading] = useState(false);

  // Featured schools state
  const [featuredSchools, setFeaturedSchools] = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [errorSchools, setErrorSchools] = useState<string | null>(null);

  // Add state for donation amounts and loading
  const [donationAmounts, setDonationAmounts] = useState<{ [key: number]: number }>({});
  const [donationLoading, setDonationLoading] = useState<{ [key: number]: boolean }>({});

  const [poolAmounts, setPoolAmounts] = useState<{ [key: number]: number }>({});

  const [joiningPool, setJoiningPool] = useState<{ [key: number]: boolean }>({});

  const [mockPools, setMockPools] = useState(mockMicroDonationPools);
  const [mockSchools, setMockSchools] = useState([
    {
      id: 1,
      name: "John Fraser Secondary School",
      location: "2665 Erin Centre Blvd, Mississauga, ON L5M 5H6",
      description: "John Fraser Secondary School is a public high school in Mississauga with a focus on academic excellence and extracurricular activities.",
      needs: ["new textbooks", "upgraded technology", "sports equipment"],
      fundingGoal: 10000,
      currentFunding: 300
    },
    {
      id: 2,
      name: "St. Marcellinus Secondary School",
      location: "730 Courtneypark Dr W, Mississauga, ON L5W 1L9",
      description: "St. Marcellinus Secondary School is a Catholic high school known for its strong arts and sports programs.",
      needs: ["musical instruments", "art supplies", "sports uniforms"],
      fundingGoal: 8000,
      currentFunding: 210
    },
    {
      id: 3,
      name: "Barondale Public School",
      location: "200 Barondale Dr, Mississauga, ON L4Z 3N7",
      description: "Barondale Public School is an elementary school in Mississauga that prides itself on fostering a supportive and inclusive learning environment.",
      needs: ["educational games", "classroom supplies", "updated library books"],
      fundingGoal: 5000,
      currentFunding: 0
    }
  ]);

  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  const handleMockSchoolDonate = (schoolId: number, amount: number) => {
    setMockSchools(schools =>
      schools.map(s =>
        s.id === schoolId
          ? { ...s, currentFunding: s.currentFunding + amount }
          : s
      )
    );
    setDonationAmounts(a => ({ ...a, [schoolId]: 0 }));
    const school = mockSchools.find(s => s.id === schoolId);
    setRecentDonations(donations => [
      {
        id: Date.now() + Math.random(),
        name: school?.name || 'School',
        type: 'School',
        amount,
        date: new Date().toISOString()
      },
      ...donations
    ]);
  };

  const handleJoinPool = (poolId: number, idx: number, amount?: number) => {
    setJoiningPool(j => ({ ...j, [poolId]: true }));
    setTimeout(() => { // Simulate async
      setMockPools(pools => pools.map((p, i) =>
        p.id === poolId
          ? {
              ...p,
              currentAmount: p.currentAmount + (amount || 0),
              participants: p.participants + 1
            }
          : p
      ));
      setPoolAmounts(a => ({ ...a, [poolId]: 0 }));
      setJoiningPool(j => ({ ...j, [poolId]: false }));
      const pool = mockPools.find(p => p.id === poolId);
      setRecentDonations(donations => [
        {
          id: Date.now() + Math.random(),
          name: pool?.name || 'Pool',
          type: 'Pool',
          amount: amount || 0,
          date: new Date().toISOString()
        },
        ...donations
      ]);
    }, 600);
  };

  // Fetch real donations on mount and after donation
  const fetchUserDonations = () => {
    setDonationsLoading(true);
    fetch('/api/donations', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUserDonations(data);
          // setTotalDonated(data.reduce((sum, d) => sum + d.amount, 0)); // Removed
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

  // Remove microPools, loadingPools, errorPools, and related useEffect
  // Use mockMicroDonationPools as before

  // Calculate impact stats from recentDonations
  const totalDonated = recentDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const donationsMade = recentDonations.length;
  const schoolsSupported = new Set(recentDonations.filter(d => d.type === 'School').map(d => d.name)).size;

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

        {/* Featured Schools (only after login) */}
        <div className="dashboard-section">
          <h2>Schools Near You</h2>
          <div className="schools-grid">
            {mockSchools.map((school) => {
              const percent = school.fundingGoal && school.currentFunding ? Math.round((school.currentFunding / school.fundingGoal) * 100) : 0;
              let needsList: string[] = [];
              if (Array.isArray(school.needs)) {
                needsList = school.needs.map((need: any) => String(need));
              }
              return (
                <div key={school.id} className="school-card">
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
                        disabled={!donationAmounts[school.id] || donationAmounts[school.id] <= 0}
                        onClick={() => handleMockSchoolDonate(school.id, donationAmounts[school.id])}
                      >
                        Donate
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
            {recentDonations.slice(0, 5).map((donation) => (
              <div key={donation.id} className="donation-item">
                <div className="donation-info">
                  <h4>{donation.name}</h4>
                  <span className="donation-type">
                    {donation.type === 'School' ? 'School Donation' : 'Pool Donation'}
                  </span>
                  <p className="donation-date">{new Date(donation.date).toLocaleDateString()}</p>
                </div>
                <div className="donation-amount" style={{ color: 'green', fontWeight: 600, fontSize: '1.2em' }}>
                  ${donation.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {recentDonations.length === 0 && (
              <p className="no-donations">You haven't made any donations yet. <a href="/schools">Browse schools</a> to get started!</p>
            )}
          </div>
        </div>

        {/* Micro Donation Pools */}
        <div className="dashboard-section">
          <h2>Micro Donation Pools</h2>
          <div className="pools-grid">
            {mockPools.map((pool, idx) => (
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type="number"
                    min={1}
                    placeholder="Amount"
                    value={poolAmounts[pool.id] || ''}
                    onChange={e => setPoolAmounts(a => ({ ...a, [pool.id]: Number(e.target.value) }))}
                    style={{ width: 80 }}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={joiningPool[pool.id] || !poolAmounts[pool.id] || poolAmounts[pool.id] <= 0}
                    onClick={() => handleJoinPool(pool.id, idx, poolAmounts[pool.id])}
                  >
                    {joiningPool[pool.id] ? 'Donating...' : 'Donate'}
                  </button>
                </div>
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
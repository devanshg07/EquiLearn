import React, { useState } from 'react';
import { mockDonations, mockImpactStats } from '../data/mockData';
import { useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const totalDonations = mockDonations.reduce((sum, d) => sum + d.amount, 0);
  const averageDonation = totalDonations / mockDonations.length;

  // State for real schools
  const [schools, setSchools] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/schools')
      .then(res => res.json())
      .then(data => setSchools(data));
  }, []);

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage schools, track donations, and monitor platform performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'schools' ? 'active' : ''}`}
            onClick={() => setActiveTab('schools')}
          >
            Schools
          </button>
          <button 
            className={`tab ${activeTab === 'donations' ? 'active' : ''}`}
            onClick={() => setActiveTab('donations')}
          >
            Donations
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Funding</h3>
                <div className="stat-number">${mockImpactStats.totalFunding.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <h3>Schools Supported</h3>
                <div className="stat-number">{mockImpactStats.schoolsSupported}</div>
              </div>
              <div className="stat-card">
                <h3>Total Donations</h3>
                <div className="stat-number">{mockImpactStats.totalDonations.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <h3>Students Impacted</h3>
                <div className="stat-number">{mockImpactStats.studentsImpacted.toLocaleString()}</div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Recent Donations</h3>
                <div className="donations-chart">
                  {mockDonations.slice(0, 10).map((donation) => (
                    <div key={donation.id} className="donation-row">
                      <span>{donation.schoolName}</span>
                      <span>${donation.amount.toLocaleString()}</span>
                      <span>{new Date(donation.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schools Tab */}
        {activeTab === 'schools' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>School Management</h2>
              <button className="btn btn-primary">Add New School</button>
            </div>
            
            <div className="schools-table">
              <table>
                <thead>
                  <tr>
                    <th>School Name</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Funding Goal</th>
                    <th>Current Funding</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school: any) => (
                    <tr key={school.id}>
                      <td>{school.name}</td>
                      <td>{school.location}, {school.city}, {school.state}</td>
                      <td>-</td>
                      <td>
                        ${school.needs && school.needs.length > 0
                          ? school.needs.reduce((sum: number, n: any) => sum + (n.totalCost || 0), 0).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td>
                        ${school.needs && school.needs.length > 0
                          ? school.needs.reduce((sum: number, n: any) => sum + ((n.currentDonations || 0) * (n.costPerItem || 0)), 0).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${school.needs && school.needs.length > 0
                              ? Math.round(
                                  (school.needs.reduce((sum: number, n: any) => sum + ((n.currentDonations || 0) * (n.costPerItem || 0)), 0) /
                                   school.needs.reduce((sum: number, n: any) => sum + (n.totalCost || 0), 0)
                                  ) * 100
                                )
                              : 0}%` }}
                          ></div>
                        </div>
                        <span>{school.needs && school.needs.length > 0
                          ? Math.round(
                              (school.needs.reduce((sum: number, n: any) => sum + ((n.currentDonations || 0) * (n.costPerItem || 0)), 0) /
                               school.needs.reduce((sum: number, n: any) => sum + (n.totalCost || 0), 0)
                              ) * 100
                            )
                          : 0}%</span>
                      </td>
                      <td>
                        <button className="btn btn-small">Edit</button>
                        <button className="btn btn-small btn-secondary">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Donation Analytics</h2>
            </div>
            
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Donation Summary</h3>
                <div className="analytics-stats">
                  <div className="analytics-stat">
                    <span>Total Amount:</span>
                    <span>${totalDonations.toLocaleString()}</span>
                  </div>
                  <div className="analytics-stat">
                    <span>Average Donation:</span>
                    <span>${averageDonation.toLocaleString()}</span>
                  </div>
                  <div className="analytics-stat">
                    <span>Total Donations:</span>
                    <span>{mockDonations.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="analytics-card">
                <h3>Recent Donations</h3>
                <div className="donations-list">
                  {mockDonations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="donation-item">
                      <div>
                        <strong>{donation.donorName}</strong> donated ${donation.amount.toLocaleString()}
                      </div>
                      <div>to {donation.schoolName}</div>
                      <div className="donation-date">{new Date(donation.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>User Management</h2>
            </div>
            
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Total Donated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Smith</td>
                    <td>john@example.com</td>
                    <td>Donor</td>
                    <td>$1,500</td>
                    <td>
                      <button className="btn btn-small">View</button>
                      <button className="btn btn-small btn-secondary">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Sarah Johnson</td>
                    <td>sarah@example.com</td>
                    <td>Donor</td>
                    <td>$2,500</td>
                    <td>
                      <button className="btn btn-small">View</button>
                      <button className="btn btn-small btn-secondary">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Admin User</td>
                    <td>admin@equilearn.org</td>
                    <td>Admin</td>
                    <td>-</td>
                    <td>
                      <button className="btn btn-small">View</button>
                      <button className="btn btn-small btn-secondary">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 
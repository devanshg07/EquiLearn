import React, { useState } from 'react';
import { mockSchools } from '../data/mockData';
import { School } from '../types';
import './Schools.css';

const Schools: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationMessage, setDonationMessage] = useState<string>('');

  const categories = ['all', ...Array.from(new Set(mockSchools.map(school => school.category)))];

  const filteredSchools = mockSchools.filter(school => {
    const matchesCategory = filterCategory === 'all' || school.category === filterCategory;
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchool && donationAmount) {
      alert(`Thank you for your donation of $${donationAmount} to ${selectedSchool.name}!`);
      setSelectedSchool(null);
      setDonationAmount('');
      setDonationMessage('');
    }
  };

  return (
    <div className="schools-page">
      <div className="container">
        <div className="schools-header">
          <h1>Browse Schools</h1>
          <p>Find schools in need and make a difference in students' lives</p>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search schools by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filter">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schools Grid */}
        <div className="schools-grid">
          {filteredSchools.map((school) => (
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
                  <div className="funding-percentage">
                    {Math.round((school.currentFunding / school.fundingGoal) * 100)}% funded
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setSelectedSchool(school)}
                >
                  Donate Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="no-results">
            <p>No schools found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {selectedSchool && (
        <div className="modal-overlay" onClick={() => setSelectedSchool(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Donate to {selectedSchool.name}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedSchool(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="school-info">
                <img src={selectedSchool.imageUrl} alt={selectedSchool.name} />
                <div>
                  <h3>{selectedSchool.name}</h3>
                  <p>{selectedSchool.location}</p>
                  <p>{selectedSchool.description}</p>
                </div>
              </div>
              
              <form onSubmit={handleDonation} className="donation-form">
                <div className="form-group">
                  <label htmlFor="amount">Donation Amount ($)</label>
                  <input
                    type="number"
                    id="amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    min="1"
                    required
                    placeholder="Enter amount"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message (Optional)</label>
                  <textarea
                    id="message"
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    placeholder="Leave a message for the school..."
                    rows={3}
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedSchool(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Complete Donation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schools; 
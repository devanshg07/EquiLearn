// Global data storage
let schoolsData = [];
let donationsData = [];
let adminData = {
    isLoggedIn: false,
    pendingNeeds: [],
    approvedNeeds: [],
    schools: []
};

// API Base URL
const API_BASE = '';

// Initialize data from backend
async function initializeData() {
    try {
        // Load schools data from backend
        const response = await fetch(`${API_BASE}/api/schools`);
        if (response.ok) {
            schoolsData = await response.json();
        } else {
            console.error('Failed to load schools data');
            schoolsData = [];
        }

        // Load impact statistics
        const impactResponse = await fetch(`${API_BASE}/api/impact`);
        if (impactResponse.ok) {
            const impactStats = await impactResponse.json();
            updateHeroStats(impactStats);
        }

        // Load donation history if user is logged in
        if (isUserLoggedIn()) {
            await loadDonationHistory();
        }

        renderSchools();
        updateImpactDashboard();
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

function updateHeroStats(stats) {
    const statElements = document.querySelectorAll('.stat h3');
    if (statElements.length >= 3) {
        statElements[0].textContent = `$${(stats.total_donations / 1000000).toFixed(1)}M+`;
        statElements[1].textContent = `${stats.schools_helped}+`;
        statElements[2].textContent = `${(stats.students_impacted / 1000).toFixed(0)}K+`;
    }
}

function isUserLoggedIn() {
    // Check if user is logged in (you can implement session checking)
    return false; // For now, assume not logged in
}

// Navigation functionality
function setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Smooth scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Render schools
function renderSchools(filteredSchools = null) {
    const schoolsGrid = document.getElementById('schoolsGrid');
    const schoolsToRender = filteredSchools || schoolsData;

    schoolsGrid.innerHTML = '';

    schoolsToRender.forEach(school => {
        school.needs.forEach(need => {
            const schoolCard = document.createElement('div');
            schoolCard.className = 'school-card';
            
            const progressPercentage = (need.currentDonations / need.totalNeeded) * 100;
            
            schoolCard.innerHTML = `
                <div class="school-header">
                    <div class="school-name">${school.name}</div>
                    <span class="urgency-badge urgency-${need.urgency}">${need.urgency}</span>
                </div>
                <div class="school-location">${school.city}, ${school.state} (${school.location})</div>
                <div class="school-needs">
                    <div class="need-item">
                        <div class="need-title">${need.title}</div>
                        <div class="need-description">${need.description}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-text">
                            ${need.currentDonations} of ${need.totalNeeded} items funded ($${need.currentDonations * need.costPerItem} of $${need.totalCost})
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary donate-btn" onclick="openDonationModal('direct', ${need.id})">
                    Donate Now
                </button>
            `;
            
            schoolsGrid.appendChild(schoolCard);
        });
    });
}

// Filter schools
function setupFilters() {
    const locationFilter = document.getElementById('locationFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const urgencyFilter = document.getElementById('urgencyFilter');

    function applyFilters() {
        const location = locationFilter.value;
        const category = categoryFilter.value;
        const urgency = urgencyFilter.value;

        let filteredSchools = schoolsData;

        if (location) {
            filteredSchools = filteredSchools.filter(school => school.location === location);
        }

        if (category || urgency) {
            filteredSchools = filteredSchools.map(school => ({
                ...school,
                needs: school.needs.filter(need => {
                    const categoryMatch = !category || need.category === category;
                    const urgencyMatch = !urgency || need.urgency === urgency;
                    return categoryMatch && urgencyMatch;
                })
            })).filter(school => school.needs.length > 0);
        }

        renderSchools(filteredSchools);
    }

    locationFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    urgencyFilter.addEventListener('change', applyFilters);
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('donationModal');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function openDonationModal(type, needId = null) {
    const modal = document.getElementById('donationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (type === 'direct' && needId) {
        const need = findNeedById(needId);
        modalTitle.textContent = `Donate to ${need.title}`;
        modalBody.innerHTML = createDirectDonationForm(need);
    } else if (type === 'pool') {
        modalTitle.textContent = 'Join Microdonation Pool';
        modalBody.innerHTML = createPoolDonationForm();
    }

    modal.style.display = 'block';
}

function findNeedById(needId) {
    for (const school of schoolsData) {
        const need = school.needs.find(n => n.id === needId);
        if (need) {
            return { ...need, schoolName: school.name };
        }
    }
    return null;
}

function createDirectDonationForm(need) {
    return `
        <div class="donation-form">
            <p><strong>School:</strong> ${need.schoolName}</p>
            <p><strong>Need:</strong> ${need.title}</p>
            <p><strong>Description:</strong> ${need.description}</p>
            <p><strong>Cost per item:</strong> $${need.costPerItem}</p>
            <p><strong>Progress:</strong> ${need.currentDonations}/${need.totalNeeded} items funded</p>
            
            <label for="donorName">Your Name:</label>
            <input type="text" id="donorName" required>
            
            <label for="donorEmail">Email:</label>
            <input type="email" id="donorEmail" required>
            
            <label for="donationAmount">Donation Amount ($):</label>
            <input type="number" id="donationAmount" min="1" step="1" required>
            
            <label for="donationMessage">Message (optional):</label>
            <textarea id="donationMessage" rows="3" placeholder="Leave a message for the school..."></textarea>
            
            <button type="button" class="btn btn-primary" onclick="processDonation('direct', ${need.id})">
                Complete Donation
            </button>
        </div>
    `;
}

function createPoolDonationForm() {
    return `
        <div class="donation-form">
            <p>Join our microdonation pool to support multiple schools and needs. Your contribution will be distributed across various educational initiatives.</p>
            
            <label for="poolDonorName">Your Name:</label>
            <input type="text" id="poolDonorName" required>
            
            <label for="poolDonorEmail">Email:</label>
            <input type="email" id="poolDonorEmail" required>
            
            <label>Donation Amount:</label>
            <div class="amount-options">
                <div class="amount-option" onclick="selectAmount(5)">$5</div>
                <div class="amount-option" onclick="selectAmount(10)">$10</div>
                <div class="amount-option" onclick="selectAmount(25)">$25</div>
                <div class="amount-option" onclick="selectAmount(50)">$50</div>
                <div class="amount-option" onclick="selectAmount(100)">$100</div>
            </div>
            
            <input type="number" id="poolDonationAmount" placeholder="Or enter custom amount" min="1" step="1" required>
            
            <button type="button" class="btn btn-primary" onclick="processDonation('pool')">
                Join Pool
            </button>
        </div>
    `;
}

function selectAmount(amount) {
    document.querySelectorAll('.amount-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.classList.add('selected');
    document.getElementById('poolDonationAmount').value = amount;
}

async function processDonation(type, needId = null) {
    const modal = document.getElementById('donationModal');
    
    try {
        let donationData = {
            donation_type: type,
            amount: 0
        };

        if (type === 'direct') {
            const donorName = document.getElementById('donorName').value;
            const donorEmail = document.getElementById('donorEmail').value;
            const amount = parseFloat(document.getElementById('donationAmount').value);
            const message = document.getElementById('donationMessage').value;

            if (!donorName || !donorEmail || !amount) {
                alert('Please fill in all required fields.');
                return;
            }

            donationData = {
                donation_type: 'direct',
                need_id: needId,
                amount: amount,
                donor_name: donorName,
                message: message
            };

        } else if (type === 'pool') {
            const donorName = document.getElementById('poolDonorName').value;
            const donorEmail = document.getElementById('poolDonorEmail').value;
            const amount = parseFloat(document.getElementById('poolDonationAmount').value);

            if (!donorName || !donorEmail || !amount) {
                alert('Please fill in all required fields.');
                return;
            }

            donationData = {
                donation_type: 'pool',
                amount: amount,
                donor_name: donorName
            };
        }

        // Send donation to backend
        const response = await fetch(`${API_BASE}/api/donations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(donationData)
        });

        if (response.ok) {
            const result = await response.json();
            
            if (type === 'direct') {
                const need = findNeedById(needId);
                const itemsFunded = Math.floor(donationData.amount / need.costPerItem);
                alert(`Thank you for your donation of $${donationData.amount}! You've helped fund ${itemsFunded} item(s) for ${need.schoolName}.`);
            } else {
                alert(`Thank you for joining our microdonation pool with $${donationData.amount}! Your contribution will help multiple schools.`);
            }

            // Refresh data
            await initializeData();
            
        } else {
            const error = await response.json();
            alert(`Error: ${error.error || 'Failed to process donation'}`);
        }

    } catch (error) {
        console.error('Error processing donation:', error);
        alert('An error occurred while processing your donation. Please try again.');
    }

    modal.style.display = 'none';
}

async function loadDonationHistory() {
    try {
        const response = await fetch(`${API_BASE}/api/donations`);
        if (response.ok) {
            donationsData = await response.json();
            updateDonationHistory();
        }
    } catch (error) {
        console.error('Error loading donation history:', error);
    }
}

function updateDonationHistory() {
    const historyList = document.getElementById('historyList');
    
    if (donationsData.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666;">No donations yet. Make your first donation to see it here!</p>';
        return;
    }

    historyList.innerHTML = donationsData.slice(0, 10).map(donation => `
        <div class="history-item">
            <div class="history-info">
                <h4>${donation.type === 'direct' ? (donation.need_title || 'Direct Donation') : 'Microdonation Pool'}</h4>
                <p>${donation.type === 'direct' ? (donation.school_name || 'Unknown School') : 'Multiple Schools'}</p>
                <p>${new Date(donation.date).toLocaleDateString()}</p>
            </div>
            <div class="history-amount">$${donation.amount}</div>
        </div>
    `).join('');
}

function updateImpactDashboard() {
    const totalDonations = donationsData.reduce((sum, donation) => sum + donation.amount, 0);
    const schoolsSupported = new Set(donationsData.filter(d => d.type === 'direct').map(d => d.school_name)).size;
    const studentsHelped = Math.floor(totalDonations / 100); // Rough estimate

    document.querySelector('#impactDashboard .impact-card:nth-child(1) .impact-number').textContent = `$${totalDonations.toLocaleString()}`;
    document.querySelector('#impactDashboard .impact-card:nth-child(2) .impact-number').textContent = schoolsSupported;
    document.querySelector('#impactDashboard .impact-card:nth-child(3) .impact-number').textContent = studentsHelped.toLocaleString();
}

// Admin functionality
function setupAdmin() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                adminData.isLoggedIn = true;
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                await renderAdminDashboard();
            } else {
                const error = await response.json();
                alert(error.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });
}

async function renderAdminDashboard() {
    await renderPendingNeeds();
    await renderApprovedNeeds();
    await renderSchoolsList();
}

async function renderPendingNeeds() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/needs/pending`);
        if (response.ok) {
            adminData.pendingNeeds = await response.json();
        }
    } catch (error) {
        console.error('Error loading pending needs:', error);
    }

    const pendingNeeds = document.getElementById('pendingNeeds');
    
    if (adminData.pendingNeeds.length === 0) {
        pendingNeeds.innerHTML = '<p style="text-align: center; color: #666;">No pending needs to review.</p>';
        return;
    }
    
    pendingNeeds.innerHTML = adminData.pendingNeeds.map(need => `
        <div class="need-item-admin">
            <h4>${need.title}</h4>
            <p><strong>School:</strong> ${need.school_name}</p>
            <p><strong>Category:</strong> ${need.category}</p>
            <p><strong>Urgency:</strong> ${need.urgency}</p>
            <p><strong>Cost:</strong> $${need.total_cost}</p>
            <p><strong>Submitted:</strong> ${need.submitted_date}</p>
            <p><strong>Description:</strong> ${need.description}</p>
            <div class="admin-actions">
                <button class="btn-approve" onclick="approveNeed(${need.id})">Approve</button>
                <button class="btn-reject" onclick="rejectNeed(${need.id})">Reject</button>
            </div>
        </div>
    `).join('');
}

async function renderApprovedNeeds() {
    const approvedNeeds = document.getElementById('approvedNeeds');
    approvedNeeds.innerHTML = '<p style="text-align: center; color: #666;">Approved needs are displayed in the main schools section.</p>';
}

async function renderSchoolsList() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/schools`);
        if (response.ok) {
            adminData.schools = await response.json();
        }
    } catch (error) {
        console.error('Error loading schools:', error);
    }

    const schoolsList = document.getElementById('schoolsList');
    
    schoolsList.innerHTML = adminData.schools.map(school => `
        <div class="school-item-admin">
            <h4>${school.name}</h4>
            <p><strong>Location:</strong> ${school.city}, ${school.state} (${school.location})</p>
            <p><strong>Verified:</strong> ${school.verified ? 'Yes' : 'No'}</p>
            <p><strong>Active Needs:</strong> ${school.needs_count}</p>
            ${!school.verified ? `<button class="btn-approve" onclick="verifySchool(${school.id})">Verify School</button>` : ''}
        </div>
    `).join('');
}

async function approveNeed(needId) {
    try {
        const response = await fetch(`${API_BASE}/api/admin/needs/${needId}/approve`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Need approved successfully!');
            await renderAdminDashboard();
            await initializeData(); // Refresh main data
        } else {
            alert('Failed to approve need');
        }
    } catch (error) {
        console.error('Error approving need:', error);
        alert('Error approving need');
    }
}

async function rejectNeed(needId) {
    try {
        const response = await fetch(`${API_BASE}/api/admin/needs/${needId}/reject`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Need rejected successfully!');
            await renderAdminDashboard();
        } else {
            alert('Failed to reject need');
        }
    } catch (error) {
        console.error('Error rejecting need:', error);
        alert('Error rejecting need');
    }
}

async function verifySchool(schoolId) {
    try {
        const response = await fetch(`${API_BASE}/api/admin/schools/${schoolId}/verify`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('School verified successfully!');
            await renderAdminDashboard();
            await initializeData(); // Refresh main data
        } else {
            alert('Failed to verify school');
        }
    } catch (error) {
        console.error('Error verifying school:', error);
        alert('Error verifying school');
    }
}

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupFilters();
    setupModal();
    setupAdmin();
    initializeData();
    
    // Add smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}); 
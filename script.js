// Global data storage
let schoolsData = [];
let donationsData = [];
let adminData = {
    isLoggedIn: false,
    pendingNeeds: [],
    approvedNeeds: [],
    schools: []
};

// Sample data initialization
function initializeData() {
    schoolsData = [
        {
            id: 1,
            name: "Oakwood Middle School",
            location: "urban",
            city: "Springfield",
            state: "IL",
            needs: [
                {
                    id: 1,
                    title: "Chromebooks for Grade 6",
                    description: "Need 5 Chromebooks for our 6th grade computer lab",
                    category: "Technology",
                    urgency: "high",
                    totalNeeded: 5,
                    currentDonations: 2,
                    costPerItem: 300,
                    totalCost: 1500
                },
                {
                    id: 2,
                    title: "Science Lab Equipment",
                    description: "Microscopes and lab supplies for biology class",
                    category: "STEM",
                    urgency: "medium",
                    totalNeeded: 10,
                    currentDonations: 3,
                    costPerItem: 150,
                    totalCost: 1500
                }
            ]
        },
        {
            id: 2,
            name: "Riverside Elementary",
            location: "rural",
            city: "Farmville",
            state: "NC",
            needs: [
                {
                    id: 3,
                    title: "Art Supplies",
                    description: "Paint, brushes, and canvas for art class",
                    category: "Art",
                    urgency: "low",
                    totalNeeded: 50,
                    currentDonations: 15,
                    costPerItem: 5,
                    totalCost: 250
                }
            ]
        },
        {
            id: 3,
            name: "Lincoln High School",
            location: "suburban",
            city: "Fairview",
            state: "CA",
            needs: [
                {
                    id: 4,
                    title: "Sports Equipment",
                    description: "Basketballs, soccer balls, and gym equipment",
                    category: "Sports",
                    urgency: "medium",
                    totalNeeded: 20,
                    currentDonations: 8,
                    costPerItem: 25,
                    totalCost: 500
                },
                {
                    id: 5,
                    title: "Library Books",
                    description: "New fiction and non-fiction books for library",
                    category: "Books",
                    urgency: "low",
                    totalNeeded: 100,
                    currentDonations: 30,
                    costPerItem: 15,
                    totalCost: 1500
                }
            ]
        }
    ];

    adminData.pendingNeeds = [
        {
            id: 6,
            schoolName: "New Hope Academy",
            title: "Math Software Licenses",
            description: "Online math learning platform for grades 3-5",
            category: "STEM",
            urgency: "high",
            totalCost: 2000,
            submittedDate: "2024-01-15"
        }
    ];

    adminData.approvedNeeds = schoolsData.flatMap(school => 
        school.needs.map(need => ({
            ...need,
            schoolName: school.name,
            approvedDate: "2024-01-10"
        }))
    );

    adminData.schools = schoolsData.map(school => ({
        id: school.id,
        name: school.name,
        location: school.location,
        city: school.city,
        state: school.state,
        needsCount: school.needs.length
    }));
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

function processDonation(type, needId = null) {
    const modal = document.getElementById('donationModal');
    
    if (type === 'direct') {
        const donorName = document.getElementById('donorName').value;
        const donorEmail = document.getElementById('donorEmail').value;
        const amount = parseFloat(document.getElementById('donationAmount').value);
        const message = document.getElementById('donationMessage').value;

        if (!donorName || !donorEmail || !amount) {
            alert('Please fill in all required fields.');
            return;
        }

        const need = findNeedById(needId);
        const itemsFunded = Math.floor(amount / need.costPerItem);
        
        // Update the need's current donations
        updateNeedDonations(needId, itemsFunded);
        
        // Add to donation history
        addDonationToHistory({
            type: 'direct',
            donorName,
            donorEmail,
            amount,
            schoolName: need.schoolName,
            needTitle: need.title,
            itemsFunded,
            date: new Date().toISOString(),
            message
        });

        alert(`Thank you for your donation of $${amount}! You've helped fund ${itemsFunded} item(s) for ${need.schoolName}.`);
        
    } else if (type === 'pool') {
        const donorName = document.getElementById('poolDonorName').value;
        const donorEmail = document.getElementById('poolDonorEmail').value;
        const amount = parseFloat(document.getElementById('poolDonationAmount').value);

        if (!donorName || !donorEmail || !amount) {
            alert('Please fill in all required fields.');
            return;
        }

        addDonationToHistory({
            type: 'pool',
            donorName,
            donorEmail,
            amount,
            date: new Date().toISOString()
        });

        alert(`Thank you for joining our microdonation pool with $${amount}! Your contribution will help multiple schools.`);
    }

    modal.style.display = 'none';
    updateImpactDashboard();
}

function updateNeedDonations(needId, itemsFunded) {
    for (const school of schoolsData) {
        const need = school.needs.find(n => n.id === needId);
        if (need) {
            need.currentDonations = Math.min(need.currentDonations + itemsFunded, need.totalNeeded);
            break;
        }
    }
    renderSchools();
}

function addDonationToHistory(donation) {
    donationsData.unshift(donation);
    updateDonationHistory();
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
                <h4>${donation.type === 'direct' ? donation.needTitle : 'Microdonation Pool'}</h4>
                <p>${donation.type === 'direct' ? donation.schoolName : 'Multiple Schools'}</p>
                <p>${new Date(donation.date).toLocaleDateString()}</p>
            </div>
            <div class="history-amount">$${donation.amount}</div>
        </div>
    `).join('');
}

function updateImpactDashboard() {
    const totalDonations = donationsData.reduce((sum, donation) => sum + donation.amount, 0);
    const schoolsSupported = new Set(donationsData.filter(d => d.type === 'direct').map(d => d.schoolName)).size;
    const studentsHelped = Math.floor(totalDonations / 100); // Rough estimate

    document.querySelector('#impactDashboard .impact-card:nth-child(1) .impact-number').textContent = `$${totalDonations.toLocaleString()}`;
    document.querySelector('#impactDashboard .impact-card:nth-child(2) .impact-number').textContent = schoolsSupported;
    document.querySelector('#impactDashboard .impact-card:nth-child(3) .impact-number').textContent = studentsHelped.toLocaleString();
}

// Admin functionality
function setupAdmin() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        // Simple admin check (in real app, this would be server-side)
        if (email === 'admin@equilearn.org' && password === 'admin123') {
            adminData.isLoggedIn = true;
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            renderAdminDashboard();
        } else {
            alert('Invalid credentials. Use admin@equilearn.org / admin123');
        }
    });
}

function renderAdminDashboard() {
    renderPendingNeeds();
    renderApprovedNeeds();
    renderSchoolsList();
}

function renderPendingNeeds() {
    const pendingNeeds = document.getElementById('pendingNeeds');
    
    pendingNeeds.innerHTML = adminData.pendingNeeds.map(need => `
        <div class="need-item-admin">
            <h4>${need.title}</h4>
            <p><strong>School:</strong> ${need.schoolName}</p>
            <p><strong>Category:</strong> ${need.category}</p>
            <p><strong>Urgency:</strong> ${need.urgency}</p>
            <p><strong>Cost:</strong> $${need.totalCost}</p>
            <p><strong>Submitted:</strong> ${need.submittedDate}</p>
            <p><strong>Description:</strong> ${need.description}</p>
            <div class="admin-actions">
                <button class="btn-approve" onclick="approveNeed(${need.id})">Approve</button>
                <button class="btn-reject" onclick="rejectNeed(${need.id})">Reject</button>
            </div>
        </div>
    `).join('');
}

function renderApprovedNeeds() {
    const approvedNeeds = document.getElementById('approvedNeeds');
    
    approvedNeeds.innerHTML = adminData.approvedNeeds.map(need => `
        <div class="need-item-admin">
            <h4>${need.title}</h4>
            <p><strong>School:</strong> ${need.schoolName}</p>
            <p><strong>Category:</strong> ${need.category}</p>
            <p><strong>Urgency:</strong> ${need.urgency}</p>
            <p><strong>Progress:</strong> ${need.currentDonations}/${need.totalNeeded} items</p>
            <p><strong>Approved:</strong> ${need.approvedDate}</p>
        </div>
    `).join('');
}

function renderSchoolsList() {
    const schoolsList = document.getElementById('schoolsList');
    
    schoolsList.innerHTML = adminData.schools.map(school => `
        <div class="school-item-admin">
            <h4>${school.name}</h4>
            <p><strong>Location:</strong> ${school.city}, ${school.state} (${school.location})</p>
            <p><strong>Active Needs:</strong> ${school.needsCount}</p>
        </div>
    `).join('');
}

function approveNeed(needId) {
    const needIndex = adminData.pendingNeeds.findIndex(need => need.id === needId);
    if (needIndex !== -1) {
        const need = adminData.pendingNeeds[needIndex];
        adminData.pendingNeeds.splice(needIndex, 1);
        adminData.approvedNeeds.push({
            ...need,
            approvedDate: new Date().toISOString().split('T')[0]
        });
        renderAdminDashboard();
    }
}

function rejectNeed(needId) {
    const needIndex = adminData.pendingNeeds.findIndex(need => need.id === needId);
    if (needIndex !== -1) {
        adminData.pendingNeeds.splice(needIndex, 1);
        renderAdminDashboard();
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
    initializeData();
    setupNavigation();
    setupFilters();
    setupModal();
    setupAdmin();
    renderSchools();
    updateDonationHistory();
    updateImpactDashboard();
    
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
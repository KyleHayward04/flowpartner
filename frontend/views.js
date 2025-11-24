// FlowPartner - All UI Views
import { state, API, saveAuthState, navigateTo } from './app.js';
import { getAllCategories, getTemplatesByCategory } from './ai-templates.js';

// ===== Utility Functions =====
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

function showError(message) {
  alert(message); // Simple for now, can enhance with toast notifications
}

function showSuccess(message) {
  alert(message);
}

// ===== Landing Page =====
export async function renderLandingPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="hero">
      <div class="container">
        <h1 class="hero-title">Connect. Collaborate. Grow.</h1>
        <p class="hero-subtitle">
          FlowPartner connects small business owners with expert freelancers for ads, websites, 
          automations, and more. Get the help you need to scale your business.
        </p>
        <div class="hero-cta">
          <a href="#/signup" class="btn btn-primary btn-lg">Get Started Free</a>
          <a href="#/login" class="btn btn-secondary btn-lg">Sign In</a>
        </div>
      </div>
    </div>

    <div class="container">
      <section class="view">
        <h2 class="text-center mb-xl">How It Works</h2>
        <div class="grid grid-3">
          <div class="card">
            <h3>📝 Post Your Job</h3>
            <p>Describe what you need help with. Use our AI templates or write your own.</p>
          </div>
          <div class="card">
            <h3>👥 Review Proposals</h3>
            <p>Vetted freelancers apply to your job. Compare proposals and choose the best fit.</p>
          </div>
          <div class="card">
            <h3>✅ Get It Done</h3>
            <p>Collaborate with your freelancer, track progress, and pay when satisfied.</p>
          </div>
        </div>
      </section>

      <section class="view">
        <h2 class="text-center mb-xl">For Business Owners</h2>
        <div class="grid grid-2">
          <div class="card">
            <h4>🎯 Facebook & Google Ads</h4>
            <p>Get expert help setting up and managing your ad campaigns.</p>
          </div>
          <div class="card">
            <h4>🌐 Website Development</h4>
            <p>Build a professional website that converts visitors to customers.</p>
          </div>
          <div class="card">
            <h4>⚡ Business Automation</h4>
            <p>Automate repetitive tasks and streamline your operations.</p>
          </div>
          <div class="card">
            <h4>🎨 Branding & Design</h4>
            <p>Create a memorable brand identity that stands out.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

// ===== Login Page =====
export async function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="view">
      <div class="container-sm">
        <div class="card">
          <h1 class="card-title text-center">Welcome Back</h1>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input type="email" id="email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input type="password" id="password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg">Login</button>
          </form>
          <p class="text-center mt-md">
            Don't have an account? <a href="#/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await API.login({ email, password });
    saveAuthState(response.token, response.user);

    // Redirect based on role
    if (response.user.role === 'BUSINESS_OWNER') {
      navigateTo('/business/dashboard');
    } else if (response.user.role === 'FREELANCER') {
      navigateTo('/freelancer/dashboard');
    } else if (response.user.role === 'ADMIN') {
      navigateTo('/admin/dashboard');
    }
  } catch (error) {
    showError(error.message || 'Login failed');
  }
}

// ===== Signup Page =====
export async function renderSignupPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="view">
      <div class="container-sm">
        <div class="card">
          <h1 class="card-title text-center">Create Your Account</h1>
          <form id="signup-form">
            <div class="form-group">
              <label class="form-label" for="name">Full Name</label>
              <input type="text" id="name" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input type="email" id="email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input type="password" id="password" class="form-input" minlength="6" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="role">I am a...</label>
              <select id="role" class="form-select" required>
                <option value="">Select role</option>
                <option value="BUSINESS_OWNER">Business Owner</option>
                <option value="FREELANCER">Freelancer</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg">Sign Up</button>
          </form>
          <p class="text-center mt-md">
            Already have an account? <a href="#/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('signup-form').addEventListener('submit', handleSignup);
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
    const response = await API.signup({ name, email, password, role });
    saveAuthState(response.token, response.user);

    // Redirect to appropriate dashboard
    if (role === 'BUSINESS_OWNER') {
      navigateTo('/business/dashboard');
    } else {
      navigateTo('/freelancer/dashboard');
    }
  } catch (error) {
    showError(error.message || 'Signup failed');
  }
}

// ===== Business Owner Dashboard =====
export async function renderBusinessDashboard() {
  const app = document.getElementById('app');

  try {
    const jobs = await API.getJobs({ owner: state.user.id });

    app.innerHTML = `
      <div class="view">
        <div class="container">
          <div class="dashboard">
            <aside class="dashboard-sidebar">
              <h3 class="mb-lg">Business Dashboard</h3>
              <ul class="sidebar-nav">
                <li><a href="#/business/dashboard" class="active">My Jobs</a></li>
                <li><a href="#/business/create-job">Create Job</a></li>
                <li><a href="#/profile">Profile</a></li>
              </ul>
            </aside>
            
            <div class="dashboard-content">
              <div class="flex flex-between mb-xl">
                <h1>My Jobs</h1>
                <a href="#/business/create-job" class="btn btn-primary">+ Create Job</a>
              </div>
              
              <div id="jobs-list">
                ${jobs.length === 0 ? `
                  <div class="card text-center">
                    <h3>No jobs yet</h3>
                    <p class="text-muted">Create your first job to get started!</p>
                    <a href="#/business/create-job" class="btn btn-primary mt-md">Create Job</a>
                  </div>
                ` : jobs.map(job => renderJobCard(job)).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    showError('Failed to load jobs');
  }
}

function renderJobCard(job) {
  const statusColors = {
    OPEN: 'badge-info',
    IN_PROGRESS: 'badge-warning',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-error'
  };

  return `
    <div class="job-card">
      <div class="job-header">
        <div>
          <h3>${job.title}</h3>
          <span class="badge ${statusColors[job.status]}">${job.status}</span>
        </div>
        <a href="#/business/job/${job.id}" class="btn btn-secondary btn-sm">View Details</a>
      </div>
      <p>${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
      <div class="job-meta">
        <span>💰 ${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}</span>
        <span>📅 ${formatDate(job.created_at)}</span>
        <span>📝 ${job._count?.proposals || 0} proposals</span>
      </div>
    </div>
  `;
}

// ===== Create Job Page =====
export async function renderCreateJob() {
  const categories = getAllCategories();

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="view">
      <div class="container">
        <div class="dashboard">
          <aside class="dashboard-sidebar">
            <h3 class="mb-lg">Business Dashboard</h3>
            <ul class="sidebar-nav">
              <li><a href="#/business/dashboard">My Jobs</a></li>
              <li><a href="#/business/create-job" class="active">Create Job</a></li>
              <li><a href="#/profile">Profile</a></li>
            </ul>
          </aside>
          
          <div class="dashboard-content">
            <h1 class="mb-xl">Create New Job</h1>
            
            <div class="card">
              <h3>AI Assistant - Quick Start Templates</h3>
              <p class="text-muted mb-md">Choose a category to see pre-filled templates</p>
              <div class="form-group">
                <select id="template-category" class="form-select">
                  <option value="">Choose a category...</option>
                  ${categories.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
                </select>
              </div>
              <div id="template-options" class="grid grid-2 mt-md" style="display: none;"></div>
            </div>
            
            <div class="card mt-lg">
              <h3 class="mb-lg">Job Details</h3>
              <form id="create-job-form">
                <div class="form-group">
                  <label class="form-label" for="title">Job Title</label>
                  <input type="text" id="title" class="form-input" required>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="category">Category</label>
                  <select id="category" class="form-select" required>
                    <option value="">Select category</option>
                    ${categories.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="description">Description</label>
                  <textarea id="description" class="form-textarea" rows="8" required></textarea>
                </div>
                
                <div class="grid grid-2">
                  <div class="form-group">
                    <label class="form-label" for="budget_min">Budget Min ($)</label>
                    <input type="number" id="budget_min" class="form-input" min="0" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="budget_max">Budget Max ($)</label>
                    <input type="number" id="budget_max" class="form-input" min="0" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="deadline">Deadline</label>
                  <input type="date" id="deadline" class="form-input" required>
                </div>
                
                <button type="submit" class="btn btn-primary btn-lg btn-block">Post Job</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Template selection handlers
  document.getElementById('template-category').addEventListener('change', (e) => {
    const category = e.target.value;
    const optionsDiv = document.getElementById('template-options');

    if (!category) {
      optionsDiv.style.display = 'none';
      return;
    }

    const templates = getTemplatesByCategory(category);
    optionsDiv.style.display = 'grid';
    optionsDiv.innerHTML = templates.map((template, index) => `
      <div class="card" style="cursor: pointer;" onclick="applyTemplate(${index}, '${category}')">
        <h4>${template.title}</h4>
        <p class="text-muted" style="font-size: 0.875rem;">${template.description.substring(0, 100)}...</p>
        <span class="btn btn-secondary btn-sm mt-sm">Use This Template</span>
      </div>
    `).join('');
  });

  // Make applyTemplate globally available
  window.applyTemplate = (index, category) => {
    const templates = getTemplatesByCategory(category);
    const template = templates[index];

    document.getElementById('title').value = template.title;
    document.getElementById('description').value = template.description;
    document.getElementById('category').value = template.category;
    document.getElementById('budget_min').value = template.budget_min;
    document.getElementById('budget_max').value = template.budget_max;

    showSuccess('Template applied! Feel free to customize.');
  };

  document.getElementById('create-job-form').addEventListener('submit', handleCreateJob);
}

async function handleCreateJob(e) {
  e.preventDefault();

  const jobData = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    budget_min: parseInt(document.getElementById('budget_min').value),
    budget_max: parseInt(document.getElementById('budget_max').value),
    deadline: new Date(document.getElementById('deadline').value).toISOString()
  };

  try {
    await API.createJob(jobData);
    showSuccess('Job created successfully!');
    navigateTo('/business/dashboard');
  } catch (error) {
    showError(error.message || 'Failed to create job');
  }
}

// ===== Job Detail (Business Owner) =====
export async function renderJobDetail(params) {
  const app = document.getElementById('app');

  try {
    const job = await API.getJobById(params.id);
    const proposals = await API.getProposalsForJob(params.id);

    app.innerHTML = `
      <div class="view">
        <div class="container">
          <a href="#/business/dashboard" class="btn btn-secondary mb-lg">← Back to Dashboard</a>
          
          <div class="card">
            <div class="flex flex-between mb-lg">
              <div>
                <h1>${job.title}</h1>
                <span class="badge badge-info">${job.status}</span>
              </div>
              <div>
                <span class="text-muted">Budget:</span>
                <strong>${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}</strong>
              </div>
            </div>
            
            <div class="mb-lg">
              <h3>Description</h3>
              <p>${job.description}</p>
            </div>
            
            <div class="job-meta">
              <span>📂 ${job.category}</span>
              <span>📅 Posted ${formatDate(job.created_at)}</span>
              <span>⏰ Deadline: ${formatDate(job.deadline)}</span>
            </div>
          </div>
          
          <div class="card mt-lg">
            <h2 class="mb-lg">Proposals (${proposals.length})</h2>
            ${proposals.length === 0 ? `
              <p class="text-muted text-center">No proposals yet. We'll notify you when freelancers apply!</p>
            ` : `
              <div class="grid">
                ${proposals.map(proposal => renderProposalCard(proposal, job.id)).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    showError('Failed to load job details');
  }
}

function renderProposalCard(proposal, jobId) {
  return `
    <div class="card">
      <div class="flex flex-between mb-md">
        <h4>${proposal.freelancer?.name || 'Freelancer'}</h4>
        <strong class="text-primary">${formatCurrency(proposal.proposed_price)}</strong>
      </div>
      <p>${proposal.message}</p>
      <div class="flex gap-sm mt-md">
        <button onclick="selectFreelancer(${jobId}, ${proposal.freelancer_id})" 
                class="btn btn-primary btn-sm">Select Freelancer</button>
        <a href="#/messages/${jobId}" class="btn btn-secondary btn-sm">Message</a>
      </div>
    </div>
  `;
}

window.selectFreelancer = async (jobId, freelancerId) => {
  try {
    await API.selectFreelancer(jobId, freelancerId);
    showSuccess('Freelancer selected! You can now collaborate on this job.');
    navigateTo(`/business/job/${jobId}`);
  } catch (error) {
    showError('Failed to select freelancer');
  }
};

// ===== Freelancer Dashboard =====
export async function renderFreelancerDashboard() {
  const app = document.getElementById('app');

  try {
    const proposals = await API.getMyProposals();
    const activeJobs = proposals.filter(p => p.status === 'ACCEPTED');

    app.innerHTML = `
      <div class="view">
        <div class="container">
          <div class="dashboard">
            <aside class="dashboard-sidebar">
              <h3 class="mb-lg">Freelancer Dashboard</h3>
              <ul class="sidebar-nav">
                <li><a href="#/freelancer/dashboard" class="active">My Work</a></li>
                <li><a href="#/freelancer/jobs">Browse Jobs</a></li>
                <li><a href="#/profile">Profile</a></li>
              </ul>
            </aside>
            
            <div class="dashboard-content">
              <h1 class="mb-xl">My Work</h1>
              
              <h2 class="mb-md">Active Jobs</h2>
              ${activeJobs.length === 0 ? `
                <div class="card mb-xl">
                  <p class="text-muted text-center">No active jobs. <a href="#/freelancer/jobs">Browse available jobs</a></p>
                </div>
              ` : activeJobs.map(prop => renderActiveJobCard(prop)).join('')}
              
              <h2 class="mb-md mt-xl">My Proposals</h2>
              ${proposals.length === 0 ? `
                <div class="card">
                  <p class="text-muted text-center">You haven't submitted any proposals yet.</p>
                </div>
              ` : proposals.map(prop => renderMyProposalCard(prop)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    showError('Failed to load dashboard');
  }
}

function renderActiveJobCard(proposal) {
  return `
    <div class="job-card">
      <h3>${proposal.job?.title || 'Job'}</h3>
      <p>${proposal.job?.description?.substring(0, 150)}...</p>
      <div class="flex gap-sm mt-md">
        <a href="#/freelancer/job/${proposal.job_id}" class="btn btn-primary btn-sm">View Job</a>
        <a href="#/messages/${proposal.job_id}" class="btn btn-secondary btn-sm">Messages</a>
      </div>
    </div>
  `;
}

function renderMyProposalCard(proposal) {
  const statusColors = {
    PENDING: 'badge-warning',
    ACCEPTED: 'badge-success',
    REJECTED: 'badge-error'
  };

  return `
    <div class="card mb-md">
      <div class="flex flex-between">
        <div>
          <h4>${proposal.job?.title || 'Job'}</h4>
          <span class="badge ${statusColors[proposal.status]}">${proposal.status}</span>
        </div>
        <strong>${formatCurrency(proposal.proposed_price)}</strong>
      </div>
      <p class="text-muted mt-sm">${proposal.message}</p>
    </div>
  `;
}

// ===== Job Feed (Freelancer) =====
export async function renderJobFeed() {
  const app = document.getElementById('app');

  try {
    const jobs = await API.getJobs({ status: 'OPEN' });

    app.innerHTML = `
      <div class="view">
        <div class="container">
          <div class="dashboard">
            <aside class="dashboard-sidebar">
              <h3 class="mb-lg">Freelancer Dashboard</h3>
              <ul class="sidebar-nav">
                <li><a href="#/freelancer/dashboard">My Work</a></li>
                <li><a href="#/freelancer/jobs" class="active">Browse Jobs</a></li>
                <li><a href="#/profile">Profile</a></li>
              </ul>
            </aside>
            
            <div class="dashboard-content">
              <h1 class="mb-xl">Available Jobs</h1>
              ${jobs.length === 0 ? `
                <div class="card text-center">
                  <h3>No jobs available</h3>
                  <p class="text-muted">Check back soon for new opportunities!</p>
                </div>
              ` : jobs.map(job => renderFreelancerJobCard(job)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    showError('Failed to load jobs');
  }
}

function renderFreelancerJobCard(job) {
  return `
    <div class="job-card">
      <div class="job-header">
        <div>
          <h3>${job.title}</h3>
          <span class="badge badge-primary">${job.category}</span>
        </div>
        <a href="#/freelancer/job/${job.id}" class="btn btn-primary btn-sm">View & Apply</a>
      </div>
      <p>${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
      <div class="job-meta">
        <span>💰 ${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}</span>
        <span>📅 ${formatDate(job.created_at)}</span>
        <span>⏰ Deadline: ${formatDate(job.deadline)}</span>
      </div>
    </div>
  `;
}

// ===== Job Detail (Freelancer) =====
export async function renderJobDetailFreelancer(params) {
  const app = document.getElementById('app');

  try {
    const job = await API.getJobById(params.id);
    const myProposals = await API.getMyProposals();
    const hasProposed = myProposals.some(p => p.job_id === parseInt(params.id));

    app.innerHTML = `
      <div class="view">
        <div class="container">
          <a href="#/freelancer/jobs" class="btn btn-secondary mb-lg">← Back to Jobs</a>
          
          <div class="card">
            <h1 class="mb-md">${job.title}</h1>
            <div class="flex gap-sm mb-lg">
              <span class="badge badge-primary">${job.category}</span>
              <span class="badge badge-info">${job.status}</span>
            </div>
            
            <div class="mb-lg">
              <h3>Description</h3>
              <p>${job.description}</p>
            </div>
            
            <div class="grid grid-2 mb-lg">
              <div>
                <strong>Budget:</strong>
                <p>${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}</p>
              </div>
              <div>
                <strong>Deadline:</strong>
                <p>${formatDate(job.deadline)}</p>
              </div>
            </div>
            
            <div class="job-meta mb-lg">
              <span>📅 Posted ${formatDate(job.created_at)}</span>
              <span>👤 Posted by ${job.owner?.name || 'Business Owner'}</span>
            </div>
            
            ${hasProposed ? `
              <div class="card" style="background: var(--color-bg-elevated);">
                <p class="text-success">✓ You've already submitted a proposal for this job!</p>
              </div>
            ` : `
              <div>
                <h3 class="mb-md">Submit Your Proposal</h3>
                <form id="proposal-form">
                  <div class="form-group">
                    <label class="form-label" for="proposed_price">Your Price ($)</label>
                    <input type="number" id="proposed_price" class="form-input" min="0" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="proposal_message">Cover Letter</label>
                    <textarea id="proposal_message" class="form-textarea" rows="6" 
                              placeholder="Explain why you're the best fit for this job..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-lg">Submit Proposal</button>
                </form>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    if (!hasProposed) {
      document.getElementById('proposal-form').addEventListener('submit', (e) => handleSubmitProposal(e, params.id));
    }
  } catch (error) {
    showError('Failed to load job');
  }
}

async function handleSubmitProposal(e, jobId) {
  e.preventDefault();

  const proposalData = {
    job_id: parseInt(jobId),
    proposed_price: parseInt(document.getElementById('proposed_price').value),
    message: document.getElementById('proposal_message').value
  };

  try {
    await API.createProposal(proposalData);
    showSuccess('Proposal submitted successfully!');
    navigateTo('/freelancer/dashboard');
  } catch (error) {
    showError(error.message || 'Failed to submit proposal');
  }
}

// ===== Admin Dashboard =====
export async function renderAdminDashboard() {
  const app = document.getElementById('app');

  try {
    const users = await API.getAllUsers();
    const jobs = await API.getAllJobs();

    app.innerHTML = `
      <div class="view">
        <div class="container">
          <h1 class="mb-xl">Admin Dashboard</h1>
          
          <div class="grid grid-2 mb-xl">
            <div class="card">
              <h2>${users.length}</h2>
              <p>Total Users</p>
            </div>
            <div class="card">
              <h2>${jobs.length}</h2>
              <p>Total Jobs</p>
            </div>
          </div>
          
          <div class="card mb-lg">
            <h2 class="mb-lg">All Users</h2>
            <div class="grid">
              ${users.map(user => `
                <div class="card" style="background: var(--color-bg-elevated);">
                  <h4>${user.name}</h4>
                  <p class="text-muted">${user.email}</p>
                  <span class="badge badge-primary">${user.role}</span>
                  <button onclick="deactivateUser(${user.id})" class="btn btn-error btn-sm mt-sm">Deactivate</button>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="card">
            <h2 class="mb-lg">All Jobs</h2>
            ${jobs.map(job => renderJobCard(job)).join('')}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    showError('Failed to load admin data');
  }
}

window.deactivateUser = async (userId) => {
  if (!confirm('Are you sure you want to deactivate this user?')) return;

  try {
    await API.deactivateUser(userId);
    showSuccess('User deactivated');
    renderAdminDashboard();
  } catch (error) {
    showError('Failed to deactivate user');
  }
};

// ===== Profile Page =====
export async function renderProfile() {
  const app = document.getElementById('app');

  try {
    const profile = await API.getProfile();

    app.innerHTML = `
      <div class="view">
        <div class="container-sm">
          <div class="card">
            <h1 class="mb-lg">My Profile</h1>
            <form id="profile-form">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" value="${state.user.name}" disabled>
              </div>
              
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" value="${state.user.email}" disabled>
              </div>
              
              <div class="form-group">
                <label class="form-label">Role</label>
                <input type="text" class="form-input" value="${state.user.role}" disabled>
              </div>
              
              ${state.user.role === 'BUSINESS_OWNER' ? `
                <div class="form-group">
                  <label class="form-label" for="business_name">Business Name</label>
                  <input type="text" id="business_name" class="form-input" 
                         value="${profile?.business_name || ''}" placeholder="Your Business Name">
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="website">Website</label>
                  <input type="url" id="website" class="form-input" 
                         value="${profile?.website || ''}" placeholder="https://yourbusiness.com">
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="location">Location</label>
                  <input type="text" id="location" class="form-input" 
                         value="${profile?.location || ''}" placeholder="City, State">
                </div>
              ` : state.user.role === 'FREELANCER' ? `
                <div class="form-group">
                  <label class="form-label" for="niche">Niche/Specialty</label>
                  <input type="text" id="niche" class="form-input" 
                         value="${profile?.niche || ''}" placeholder="e.g., Facebook Ads, Web Development">
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="skills">Skills (comma-separated)</label>
                  <input type="text" id="skills" class="form-input" 
                         value="${profile?.skills || ''}" placeholder="JavaScript, React, Node.js">
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="bio">Bio</label>
                  <textarea id="bio" class="form-textarea" rows="4" 
                            placeholder="Tell clients about yourself...">${profile?.bio || ''}</textarea>
                </div>
              ` : ''}
              
              <button type="submit" class="btn btn-primary btn-block">Save Profile</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', handleUpdateProfile);
  } catch (error) {
    showError('Failed to load profile');
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();

  let profileData = {};

  if (state.user.role === 'BUSINESS_OWNER') {
    profileData = {
      business_name: document.getElementById('business_name').value,
      website: document.getElementById('website').value,
      location: document.getElementById('location').value
    };
  } else if (state.user.role === 'FREELANCER') {
    profileData = {
      niche: document.getElementById('niche').value,
      skills: document.getElementById('skills').value,
      bio: document.getElementById('bio').value
    };
  }

  try {
    await API.updateProfile(profileData);
    showSuccess('Profile updated successfully!');
  } catch (error) {
    showError(error.message || 'Failed to update profile');
  }
}

// ===== Messages Page =====
export async function renderMessages(params) {
  const app = document.getElementById('app');

  try {
    const job = await API.getJobById(params.jobId);
    const messages = await API.getMessagesForJob(params.jobId);

    app.innerHTML = `
      <div class="view">
        <div class="container-sm">
          <a href="${state.user.role === 'BUSINESS_OWNER' ? '#/business/job/' + params.jobId : '#/freelancer/dashboard'}" 
             class="btn btn-secondary mb-lg">← Back</a>
          
          <div class="card">
            <h2 class="mb-md">Messages: ${job.title}</h2>
            
            <div class="chat-container">
              <div class="chat-messages" id="chat-messages">
                ${messages.length === 0 ? `
                  <p class="text-muted text-center">No messages yet. Start the conversation!</p>
                ` : messages.map(msg => `
                  <div class="message ${msg.sender_id === state.user.id ? 'message-sent' : 'message-received'}">
                    <strong>${msg.sender?.name || 'User'}</strong>
                    <p>${msg.text}</p>
                    <small class="text-muted">${formatDate(msg.created_at)}</small>
                  </div>
                `).join('')}
              </div>
              
              <form class="chat-input" id="message-form">
                <input type="text" id="message-text" class="form-input" 
                       placeholder="Type your message..." required style="flex: 1;">
                <button type="submit" class="btn btn-primary">Send</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('message-form').addEventListener('submit', (e) => handleSendMessage(e, params.jobId));

    // Scroll to bottom of messages
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    showError('Failed to load messages');
  }
}

async function handleSendMessage(e, jobId) {
  e.preventDefault();

  const text = document.getElementById('message-text').value;

  try {
    await API.sendMessage({ job_id: parseInt(jobId), text });
    document.getElementById('message-text').value = '';
    renderMessages({ jobId });
  } catch (error) {
    showError('Failed to send message');
  }
}

// ===== Pricing Page =====
export async function renderPricingPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="view">
      <div class="container">
        <div class="hero" style="padding: var(--space-3xl) 0;">
          <h1 class="hero-title" style="font-size: 3.5rem; margin-bottom: var(--space-md);">
            Simple, Transparent Pricing
          </h1>
          <p class="hero-subtitle" style="margin-bottom: var(--space-3xl);">
            Start free for 14 days. Upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div class="pricing-grid">
          <!-- Free Trial -->
          <div class="pricing-card pricing-card-free">
            <div class="pricing-badge">14 Days Free</div>
            <h3 class="pricing-title">Trial</h3>
            <div class="pricing-amount">
              <span class="pricing-currency">£</span>
              <span class="pricing-value">0</span>
            </div>
            <p class="pricing-period">for 14 days</p>
            <p class="pricing-description">Perfect for testing the waters and experiencing FlowPartner</p>
            
            <ul class="pricing-features">
              <li><i data-lucide="check"></i> Post up to 2 jobs</li>
              <li><i data-lucide="check"></i> Access to vetted freelancers</li>
              <li><i data-lucide="check"></i> Basic messaging</li>
              <li><i data-lucide="check"></i> AI job templates</li>
              <li><i data-lucide="check"></i> 5% platform fee</li>
            </ul>
            
            <a href="#/signup" class="btn btn-secondary btn-block btn-lg pricing-cta">
              Start Free Trial
            </a>
          </div>

          <!-- Starter Plan -->
          <div class="pricing-card pricing-card-starter">
            <div class="pricing-badge pricing-badge-popular">Most Popular</div>
            <h3 class="pricing-title">Starter</h3>
            <div class="pricing-amount">
              <span class="pricing-currency">£</span>
              <span class="pricing-value">25</span>
            </div>
            <p class="pricing-period">per month</p>
            <p class="pricing-description">Ideal for small businesses and solopreneurs getting started</p>
            
            <ul class="pricing-features">
              <li><i data-lucide="check"></i> <strong>Unlimited jobs</strong></li>
              <li><i data-lucide="check"></i> Priority support</li>
              <li><i data-lucide="check"></i> Advanced messaging & file sharing</li>
              <li><i data-lucide="check"></i> AI-assisted job matching</li>
              <li><i data-lucide="check"></i> 3% platform fee</li>
              <li><i data-lucide="check"></i> Project analytics</li>
            </ul>
            
            <a href="#/signup" class="btn btn-primary btn-block btn-lg pricing-cta">
              Get Started
            </a>
          </div>

          <!-- Growth Plan -->
          <div class="pricing-card pricing-card-growth">
            <div class="pricing-badge pricing-badge-premium">Premium</div>
            <h3 class="pricing-title">Growth</h3>
            <div class="pricing-amount">
              <span class="pricing-currency">£</span>
              <span class="pricing-value">50</span>
            </div>
            <p class="pricing-period">per month</p>
            <p class="pricing-description">For growing teams ready to scale operations</p>
            
            <ul class="pricing-features">
              <li><i data-lucide="check"></i> <strong>Everything in Starter</strong></li>
              <li><i data-lucide="check"></i> Dedicated account manager</li>
              <li><i data-lucide="check"></i> Team collaboration tools</li>
              <li><i data-lucide="check"></i> Advanced AI automation</li>
              <li><i data-lucide="check"></i> 2% platform fee</li>
              <li><i data-lucide="check"></i> Custom integrations</li>
              <li><i data-lucide="check"></i> Quarterly business reviews</li>
              <li><i data-lucide="check"></i> Priority freelancer matching</li>
            </ul>
            
            <a href="#/signup" class="btn btn-accent btn-block btn-lg pricing-cta">
              Scale Your Business
            </a>
          </div>
        </div>

        <!-- FAQ Section -->
        <section class="pricing-faq">
          <h2 class="text-center mb-xl">Frequently Asked Questions</h2>
          <div class="grid grid-2">
            <div class="card">
              <h4>Can I change plans anytime?</h4>
              <p class="text-muted">Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.</p>
            </div>
            <div class="card">
              <h4>What payment methods do you accept?</h4>
              <p class="text-muted">We accept all major credit cards, debit cards, and PayPal for your convenience.</p>
            </div>
            <div class="card">
              <h4>Is there a setup fee?</h4>
              <p class="text-muted">No setup fees, no hidden charges. You only pay the monthly subscription and platform fees on completed jobs.</p>
            </div>
            <div class="card">
              <h4>What happens after the free trial?</h4>
              <p class="text-muted">You can choose to upgrade to a paid plan or continue with limited free access. No credit card required for trial.</p>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="pricing-cta-section">
          <div class="card text-center" style="background: var(--gradient-primary); border: none;">
            <h2 style="color: white; margin-bottom: var(--space-md);">Ready to Get Started?</h2>
            <p style="color: rgba(255,255,255,0.9); font-size: var(--font-size-lg); margin-bottom: var(--space-xl);">
              Join hundreds of businesses already growing with FlowPartner
            </p>
            <a href="#/signup" class="btn btn-secondary btn-lg" style="background: white; color: var(--color-primary);">
              Start Your Free Trial
            </a>
          </div>
        </section>
      </div>
    </div>
  `;

  // Initialize Lucide icons after rendering
  if (window.lucide) {
    lucide.createIcons();
  }
}

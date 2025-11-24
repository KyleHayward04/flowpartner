// FlowPartner - Main Application
import * as Views from './views.js';

// API Configuration
const API_BASE = 'http://localhost:3000/api';

// Application State
let state = {
    user: null,
    token: null,
    currentRoute: null
};

// ===== API Client =====
class API {
    static async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (state.token) {
            headers['Authorization'] = `Bearer ${state.token}`;
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async signup(userData) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async getMe() {
        return this.request('/auth/me');
    }

    // User/Profile endpoints
    static async getProfile() {
        return this.request('/users/profile');
    }

    static async updateProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    static async getUserById(userId) {
        return this.request(`/users/${userId}`);
    }

    // Job endpoints
    static async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    static async getJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/jobs?${params}`);
    }

    static async getJobById(jobId) {
        return this.request(`/jobs/${jobId}`);
    }

    static async updateJob(jobId, jobData) {
        return this.request(`/jobs/${jobId}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
    }

    static async selectFreelancer(jobId, freelancerId) {
        return this.request(`/jobs/${jobId}/select-freelancer`, {
            method: 'PUT',
            body: JSON.stringify({ freelancerId })
        });
    }

    static async completeJob(jobId, reviewData) {
        return this.request(`/jobs/${jobId}/complete`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    }

    // Proposal endpoints
    static async createProposal(proposalData) {
        return this.request('/proposals', {
            method: 'POST',
            body: JSON.stringify(proposalData)
        });
    }

    static async getProposalsForJob(jobId) {
        return this.request(`/proposals/job/${jobId}`);
    }

    static async getMyProposals() {
        return this.request('/proposals/my-proposals');
    }

    // Message endpoints
    static async sendMessage(messageData) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    static async getMessagesForJob(jobId) {
        return this.request(`/messages/job/${jobId}`);
    }

    // Review endpoints
    static async createReview(reviewData) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    static async getReviewsForUser(userId) {
        return this.request(`/reviews/user/${userId}`);
    }

    // Admin endpoints
    static async getAllUsers() {
        return this.request('/admin/users');
    }

    static async getAllJobs() {
        return this.request('/admin/jobs');
    }

    static async deactivateUser(userId) {
        return this.request(`/admin/users/${userId}/deactivate`, {
            method: 'PUT'
        });
    }
}

// Make API available globally
window.API = API;

// ===== Authentication =====
function loadAuthState() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
    }
}

function saveAuthState(token, user) {
    state.token = token;
    state.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateNavigation();
}

function clearAuthState() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
    navigateTo('/');
}

window.logout = clearAuthState;

// ===== Navigation =====
function updateNavigation() {
    const navLinks = document.getElementById('nav-links');

    if (state.user) {
        // Authenticated navigation
        const dashboardLink = state.user.role === 'BUSINESS_OWNER' ? '#/business/dashboard' :
            state.user.role === 'FREELANCER' ? '#/freelancer/dashboard' :
                '#/admin/dashboard';

        navLinks.innerHTML = `
      <li><a href="${dashboardLink}">Dashboard</a></li>
      <li><a href="#/profile">Profile</a></li>
      <li><a href="#/" onclick="logout()" class="btn btn-secondary btn-sm">Logout</a></li>
    `;
    } else {
        // Public navigation
        navLinks.innerHTML = `
      <li><a href="#/">Home</a></li>
      <li><a href="#/login">Login</a></li>
      <li><a href="#/signup" class="btn btn-primary btn-sm">Sign Up</a></li>
    `;
    }
}

// ===== Router =====
const routes = {
    '/': Views.renderLandingPage,
    '/login': Views.renderLoginPage,
    '/signup': Views.renderSignupPage,
    '/business/dashboard': Views.renderBusinessDashboard,
    '/business/create-job': Views.renderCreateJob,
    '/business/job/:id': Views.renderJobDetail,
    '/freelancer/dashboard': Views.renderFreelancerDashboard,
    '/freelancer/jobs': Views.renderJobFeed,
    '/freelancer/job/:id': Views.renderJobDetailFreelancer,
    '/admin/dashboard': Views.renderAdminDashboard,
    '/profile': Views.renderProfile,
    '/messages/:jobId': Views.renderMessages
};

function matchRoute(path) {
    // Try exact match first
    if (routes[path]) {
        return { handler: routes[path], params: {} };
    }

    // Try parameterized routes
    for (const [pattern, handler] of Object.entries(routes)) {
        const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$');
        const match = path.match(regex);

        if (match) {
            const paramNames = (pattern.match(/:\w+/g) || []).map(p => p.substring(1));
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            return { handler, params };
        }
    }

    return null;
}

function navigateTo(path) {
    window.location.hash = path;
}

window.navigateTo = navigateTo;

async function handleRoute() {
    const path = window.location.hash.slice(1) || '/';
    state.currentRoute = path;

    const route = matchRoute(path);

    if (!route) {
        document.getElementById('app').innerHTML = '<div class="container"><h1>404 - Page Not Found</h1></div>';
        return;
    }

    // Check authentication for protected routes
    const protectedRoutes = ['/business/', '/freelancer/', '/admin/', '/profile', '/messages/'];
    const isProtected = protectedRoutes.some(prefix => path.startsWith(prefix));

    if (isProtected && !state.user) {
        navigateTo('/login');
        return;
    }

    // Render the view
    try {
        await route.handler(route.params);
    } catch (error) {
        console.error('Route error:', error);
        document.getElementById('app').innerHTML = `
      <div class="container">
        <h1>Error</h1>
        <p>Something went wrong. Please try again.</p>
      </div>
    `;
    }
}

// ===== Initialize Application =====
function init() {
    loadAuthState();
    updateNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);

    // Handle initial route
    handleRoute();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export state for views to access
export { state, API, saveAuthState, clearAuthState, navigateTo };

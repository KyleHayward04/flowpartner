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

  // Determine CTA buttons based on authentication status
  let ctaButtons = '';
  if (state.user) {
    // User is logged in - redirect to their dashboard
    const dashboardLink = state.user.role === 'BUSINESS_OWNER' ? '#/business/dashboard' :
      state.user.role === 'FREELANCER' ? '#/freelancer/dashboard' :
        '#/admin/dashboard';

    ctaButtons = `
      <a href="${dashboardLink}" class="btn btn-primary btn-lg">Go to Dashboard</a>
    `;
  } else {
    // User is not logged in - show signup/login
    ctaButtons = `
      <a href="#/signup" class="btn btn-primary btn-lg">Get Started Free</a>
      <a href="#/login" class="btn btn-secondary btn-lg">Sign In</a>
    `;
  }

  app.innerHTML = `
    <div class="hero">
      <div class="container">
        <h1 class="hero-title">Connect. Collaborate. Grow.</h1>
        <p class="hero-subtitle">
          FlowPartner connects small business owners with expert freelancers for ads, websites, 
          automations, and more. Get the help you need to scale your business.
        </p>
        <div class="hero-cta">
          ${ctaButtons}
        </div>
      </div>
    </div>

    <div class="container">
      <section class="view">
        <h2 class="text-center mb-xl">How It Works</h2>
        <div class="grid grid-3">
          <div class="card">
            <h3>ðŸ“ Post Your Job</h3>
            <p>Describe what you need help with. Use our AI templates or write your own.</p>
          </div>
          <div class="card">
            <h3>ðŸ‘¥ Review Proposals</h3>
            <p>Vetted freelancers apply to your job. Compare proposals and choose the best fit.</p>
          </div>
          <div class="card">
            <h3>âœ… Get It Done</h3>
            <p>Collaborate with your freelancer, track progress, and pay when satisfied.</p>
          </div>
        </div>
      </section>

      <section class="view">
        <h2 class="text-center mb-xl">For Business Owners</h2>
        <div class="grid grid-2">
          <div class="card">
            <h4>ðŸŽ¯ Facebook & Google Ads</h4>
            <p>Get expert help setting up and managing your ad campaigns.</p>
          </div>
          <div class="card">
            <h4>ðŸŒ Website Development</h4>
            <p>Build a professional website that converts visitors to customers.</p>
          </div>
          <div class="card">
            <h4>âš¡ Business Automation</h4>
            <p>Automate repetitive tasks and streamline your operations.</p>
          </div>
          <div class="card">
            <h4>ðŸŽ¨ Branding & Design</h4>
            <p>Create a memorable brand identity that stands out.</p>
          </div>
        </div>
      </section>

      <section class="view">
        <h2 class="text-center mb-xl">For Freelancers</h2>
        <div class="grid grid-2">
          <div class="card">
            <h4>ðŸ’¼ Quality Projects</h4>
            <p>Access vetted business opportunities from serious clients ready to invest in quality work.</p>
          </div>
          <div class="card">
            <h4>ðŸ’° Fair Compensation</h4>
            <p>Set your own rates and get paid securely for the value you deliver.</p>
          </div>
          <div class="card">
            <h4>ðŸš€ Grow Your Business</h4>
            <p>Build your reputation with reviews, expand your portfolio, and attract more clients.</p>
          </div>
          <div class="card">
            <h4>ðŸ¤ Direct Communication</h4>
            <p>Connect directly with business owners without intermediaries or unnecessary fees.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

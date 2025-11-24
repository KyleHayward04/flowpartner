// AI Templates for Job Creation (Simulated AI)
export const jobTemplates = {
    ads: [
        {
            title: "Facebook Ads Campaign Setup",
            description: "I need help setting up and managing a Facebook Ads campaign to generate leads for my business. Looking for someone to:\n\n- Create ad copy and select images\n- Set up targeting based on my ideal customer\n- Monitor performance and optimize for best results\n- Provide weekly reports on ad spend and conversions\n\nBudget: Flexible based on experience",
            category: "ads",
            budget_min: 500,
            budget_max: 2000
        },
        {
            title: "Google Ads for Local Business",
            description: "Need an experienced Google Ads specialist to help my local service business get more customers through search ads.\n\n- Keyword research for local searches\n- Ad creation and landing page recommendations\n- Bid management and budget optimization\n- Monthly performance review\n\nPrefer someone with experience in [your industry].",
            category: "ads",
            budget_min: 800,
            budget_max: 2500
        }
    ],
    website: [
        {
            title: "Simple Business Website",
            description: "Looking for a web developer to build a professional website for my small business. Requirements:\n\n- 5-7 pages (Home, About, Services, Contact, etc.)\n- Mobile-responsive design\n- Contact form integration\n- SEO-friendly structure\n- Easy to update (WordPress or similar)\n\nPlease include examples of similar work.",
            category: "website",
            budget_min: 1000,
            budget_max: 3000
        },
        {
            title: "E-commerce Store Setup",
            description: "Need help setting up an online store to sell my products. Looking for:\n\n- Platform recommendation (Shopify, WooCommerce, etc.)\n- Store design and branding\n- Product upload and organization\n- Payment gateway integration\n- Basic training on managing orders\n\nI have about 50 products to start with.",
            category: "website",
            budget_min: 1500,
            budget_max: 4000
        }
    ],
    automation: [
        {
            title: "Email Follow-up Automation",
            description: "I want to automate my email follow-up process for new leads. Need someone to:\n\n- Set up automated email sequences\n- Integrate with my CRM or email platform\n- Create email templates for different scenarios\n- Set up triggers based on customer actions\n- Provide documentation on how to manage\n\nCurrently using [your email platform].",
            category: "automation",
            budget_min: 400,
            budget_max: 1200
        },
        {
            title: "Lead Collection & CRM Integration",
            description: "Looking to streamline how I collect and manage leads from my website and social media. Goals:\n\n- Automate lead capture from multiple sources\n- Integration with CRM system\n- Automated lead scoring or tagging\n- Notification system for hot leads\n- Dashboard for tracking pipeline\n\nTech-savvy candidates preferred.",
            category: "automation",
            budget_min: 600,
            budget_max: 2000
        }
    ],
    branding: [
        {
            title: "Logo & Brand Identity Design",
            description: "Starting a new business and need a professional brand identity package including:\n\n- Logo design (multiple concepts)\n- Color palette selection\n- Typography guidelines\n- Business card design\n- Social media profile images\n\nPlease share your portfolio. Looking for modern, clean designs.",
            category: "branding",
            budget_min: 500,
            budget_max: 1500
        },
        {
            title: "Social Media Branding Package",
            description: "Need help creating consistent branding across all my social media channels:\n\n- Profile and cover images for each platform\n- Post templates for Instagram, Facebook, LinkedIn\n- Story templates\n- Brand guidelines document\n- Source files for future edits\n\nMust match my existing logo and colors.",
            category: "branding",
            budget_min: 300,
            budget_max: 1000
        }
    ]
};

export function getTemplatesByCategory(category) {
    return jobTemplates[category] || [];
}

export function getAllCategories() {
    return [
        { value: 'ads', label: 'Advertising & Marketing' },
        { value: 'website', label: 'Website Development' },
        { value: 'automation', label: 'Business Automation' },
        { value: 'branding', label: 'Branding & Design' }
    ];
}

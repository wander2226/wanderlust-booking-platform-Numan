const express = require("express");
const router = express.Router();

const pages = {
  "help-centre": {
    title: "Help Centre",
    content: `Welcome to the Help Centre of WanderLust. Our mission is to ensure you have a smooth experience whether you’re booking a holiday home, hosting guests, or exploring new destinations.

Here, you’ll find solutions to frequently asked questions, guides for both guests and hosts, and detailed instructions on using our platform. Our help team is available 24/7 to assist you with any issue, from account setup to refund processing. At WanderLust, we believe informed travelers make the happiest journeys.`
  },

  "aircover": {
    title: "AirCover",
    content: `AirCover is your shield against travel uncertainties. Whether you're a guest or a host, you're automatically protected by our all-inclusive AirCover package on every booking.

For guests, this includes last-minute cancellation protection, check-in support, and a 24-hour safety line. Hosts are covered for property damage, liability, and unexpected cancellations. AirCover ensures peace of mind, so you can focus on enjoying your trip or hosting confidently.`
  },

  "anti-discrimination": {
    title: "Anti-Discrimination",
    content: `At WanderLust, we are committed to promoting fair and inclusive travel for everyone. We uphold a zero-tolerance policy for discrimination based on race, religion, gender identity, sexual orientation, or disability.

All users must accept our non-discrimination agreement to use the platform. We actively monitor, review, and take strict actions against any violations. Our platform is a space of respect, acceptance, and trust for every traveler and host alike.`
  },

  "disability-support": {
    title: "Disability Support",
    content: `Accessibility matters. WanderLust provides a wide range of listings that are accessible for people with mobility challenges or sensory impairments. From wheelchair ramps to visual assistance, we are constantly updating our features to serve everyone better.

We also provide filters to help users easily identify accessible listings and amenities. If you need personalized support, our dedicated disability assistance team is always ready to help.`
  },

  "concern": {
    title: "Report a Concern",
    content: `If you face any safety, harassment, or policy violations during your trip or hosting experience, report it immediately. At WanderLust, guest and host safety is a top priority.

Led by our founder Numan Ahamed, our incident resolution team will take swift and confidential action. We’re here to ensure your concerns are addressed with care, transparency, and urgency.`
  },

  "cancellation-option": {
    title: "Cancellation Options",
    content: `Life happens. We understand. That’s why WanderLust offers flexible, moderate, and strict cancellation policies you can choose from when booking.

We also clearly show refund timelines, rescheduling possibilities, and cancellation coverage under AirCover. Always check the listing’s cancellation policy before booking to avoid confusion later.`
  },

  "report-neighbourhood": {
    title: "Report Neighbourhood Issue",
    content: `WanderLust is built on community trust. If you observe activities in a neighborhood that pose safety or ethical concerns, let us know.

You can report issues anonymously, and our community moderation team will take appropriate actions. Your feedback helps us maintain the integrity of our global hosting network.`
  },

  "wanderlust-your-home": {
    title: "WanderLust Your Home",
    content: `Turn your property into a dream destination. With WanderLust, listing your home is easy, secure, and profitable. You’ll get tools to manage bookings, sync your calendar, and track performance.

We provide end-to-end onboarding support, professional photography tips, and pricing strategies to ensure maximum occupancy. Thousands of hosts trust WanderLust for steady income and great guest relationships.`
  },

  "aircover-hosts": {
    title: "AirCover for Hosts",
    content: `Hosting with confidence starts with AirCover. As a host, you're automatically covered with property damage protection, liability coverage up to ₹10 Cr, and income loss protection.

In addition, our 24/7 support ensures you’re never alone when problems arise. Focus on being a great host—leave the rest to us.`
  },

  "hosting-resources": {
    title: "Hosting Resources",
    content: `WanderLust provides all the tools and resources to help you become a top-rated host. Explore our knowledge base, join expert webinars, and access design and communication tips.

Whether you're a first-timer or a Superhost, we have customized resources to help you succeed.`
  },

  "community-forum": {
    title: "Community Forum",
    content: `Join our global community of hosts and guests in open discussions. From tips and suggestions to real stories of travel—our forum is where experience meets insight.

Ask questions, share your travel hacks, and celebrate milestones together. Moderated by our team and community leaders, it’s a safe and vibrant space for all.`
  },

  "hosting-responsibly": {
    title: "Hosting Responsibly",
    content: `Responsible hosting means putting guest experience first—without compromising your safety or property. WanderLust promotes eco-friendly practices, fair pricing, and local law compliance.

Learn how to be a sustainable and ethical host through our learning hub and partner programs. Let’s build a better future together—one stay at a time.`
  },

  "newsroom": {
    title: "Newsroom",
    content: `Stay up to date with the latest updates from WanderLust. From product launches to new city expansions and partnerships—this is your official source of news.

We highlight interviews with Numan Ahamed, press releases, travel trends, and community milestones that define our journey.`
  },

  "new-features": {
    title: "New Features",
    content: `We never stop improving. Our latest features include Smart Calendar, Real-Time Availability, AI-powered Search Suggestions, Verified Reviews, and Map-Based Filters.

Try our redesigned booking experience built for speed, clarity, and trust. We build what our users love—one feedback at a time.`
  },

  "careers": {
    title: "Careers",
    content: `Join WanderLust’s mission of reimagining travel. Headquartered in Udupi, Karnataka and led by Numan Ahamed, we are a team of dreamers, engineers, and designers building magical holiday moments.

If you're passionate about technology, hospitality, and global impact—check our open roles and start your journey with us.`
  },

  "investors": {
    title: "Investors",
    content: `WanderLust is reshaping the future of holiday rentals. Backed by innovation and strong community support, we’re expanding across India and beyond.

We invite visionary investors to explore opportunities with us and shape a sustainable and profitable travel ecosystem for millions.`
  },

  "emergency-services": {
    title: "Emergency Services",
    content: `We prioritize your safety above all. In case of emergencies—whether medical, safety-related, or booking concerns—you can reach us 24/7.

📞 Call: 7022616979<br>📧 Email: numanahamedofficial24@gmail.com. Our response team is trained to act quickly and empathetically in every situation.`
  },

  "about-us": {
    title: "About Us",
    content: `WanderLust was founded by Numan Ahamed in Udupi, Karnataka to redefine holiday experiences through comfort, tech, and trust.

We’re a global community of hosts and guests sharing love for homes away from home. Join us as we build the world’s most loved travel platform.`
  },

  "contact": {
    title: "Contact Us",
    content: `Get in touch with us anytime. Whether it’s support, feedback, or a partnership proposal—we’re always listening.

📍 Udupi, Karnataka - 574117<br>📞 7022616979<br>📧 numanahamedofficial24@gmail.com`
  },

  "faq": {
    title: "Frequently Asked Questions",
    content: `From booking issues to payment queries, our FAQ page addresses the most common concerns.

You’ll find helpful answers about cancellations, refunds, guest reviews, profile management, payment methods, and more.`
  },

  "privacy": {
    title: "Privacy Policy",
    content: `Your privacy is important to us at WanderLust. We do not sell your personal data and use it only to improve your experience. We collect basic usage data and use secure third-party payment gateways. For more, email numanahamedofficial24@gmail.com.`
  },

  "terms": {
    title: "Terms and Conditions",
    content: `By using WanderLust, you agree to abide by our community rules, refund policies, and platform terms. We reserve the right to suspend or delete accounts for violations. Please read our complete T&C before booking or hosting.`
  },

  "sitemap": {
    title: "Sitemap",
    content: `Explore all site sections: Listings, Categories, Booking, Reviews, Hosting Tools, Contact, FAQs, and Support from this central navigation index. Designed to help you find any resource faster.`
  },

  "companydetails": {
    title: "Company Details",
    content: `WanderLust is operated by WanderLust Private Limited. Founded by Numan Ahamed, we are registered in Karnataka and comply with all Indian business and data laws. Contact us at numanahamedofficial24@gmail.com for any legal queries.`
  }
};

// ✅ Route to serve any footer-linked page
router.get("/pages/:slug", (req, res) => {
  const page = pages[req.params.slug];
  if (!page) {
    return res.status(404).render("static_page", {
      page: {
        title: "Not Found",
        content: "The page you are looking for doesn't exist."
      }
    });
  }

  res.render("static_page", { page });
});

module.exports = router;

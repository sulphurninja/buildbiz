/**
 * All copy, offer details and configuration for the BuildBiz AI funnel page.
 * Edit here — components read from this file.
 */

export const site = {
  brand: {
    name: "BuildBiz AI",
    tagline: "Build. Automate. Scale.",
    company: "BuildBiz AI",
    url: "https://buildbiz.ai",
  },

  /** Where the "Reserve seat" form sends people after capturing details. Leave empty to only capture the lead. */
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "",

  event: {
    title: "The Business Operating System Workshop",
    kicker: "India's AI Business Systems Workshop",
    /** Oct 13, 2026 — 9:00 PM IST */
    startsAt: "2026-10-13T21:00:00+05:30",
    dateLabel: "13th & 14th October",
    dayLabel: "Tue & Wed",
    timeLabel: "9:00 PM IST",
    durationLabel: "2 Days",
    platform: "Zoom",
    priceOriginal: 4999,
    price: 51,
    gstNote: "+ GST",
    bonusValue: 15000,
    seatsInitial: 11,
    audience: "For business owners doing ₹1 Crore+ with a team of 5–500",
  },

  mentor: {
    name: "Dr. Amit Moga",
    role: "Founder, BuildBiz AI",
    // Verify / update the credentials below before launch.
    credentials: ["Founder, BuildBiz AI", "AI Systems Architect", "Creator of the BUILD → SCALE Method", "Zero Vendor Dependency"],
    quote:
      "I never wanted a business that depended on me, a vendor, or a spreadsheet. So I build the system first — then scale the business around it.",
    bio: [
      "Architect of the BUILD → AUTOMATE → SYSTEMIZE → SCALE method. He builds AI operating systems that run Indian businesses — teams, sales, ops, follow-ups — without the owner being pinged for every decision. This workshop is that exact architecture, built live with you.",
    ],
    stats: [
      { value: "4-Step", label: "Signature Method" },
      { value: "6", label: "Systems Built Live" },
      { value: "₹0", label: "Vendor Dependency" },
      { value: "0", label: "Lines of Code Needed" },
    ],
  },

  framework: [
    {
      step: "01",
      name: "BUILD",
      headline: "Build the right business infrastructure.",
      body: "Architecture first. Tools later.",
    },
    {
      step: "02",
      name: "AUTOMATE",
      headline: "Eliminate repetitive manual work.",
      body: "Anything that happens twice goes to AI.",
    },
    {
      step: "03",
      name: "SYSTEMIZE",
      headline: "Create repeatable AI-powered processes.",
      body: "Playbooks that hold — even when you're in Kerala.",
    },
    {
      step: "04",
      name: "SCALE",
      headline: "Grow without proportionally adding people, time and complexity.",
      body: "Revenue up. Your hours don't follow.",
    },
  ],

  pains: [
    {
      title: "Aap hi system ho",
      body: "Every decision routes back to you. You're not the owner — you're the bottleneck.",
    },
    {
      title: "Har subah chasing updates mein nikal jaati hai",
      body: "First 2 hours on WhatsApp asking what happened yesterday.",
    },
    {
      title: "Team tab perform karti hai jab aap dekh rahe ho",
      body: "Nazar hati, quality giri. There's no system — only your eyes.",
    },
    {
      title: "“Thoda follow-up reh gaya” — aur deal nikal gayi",
      body: "Nobody followed up. The client went to a competitor.",
    },
    {
      title: "Tools khareede, par kuch nahi chala",
      body: "Sheets, Zoho, Notion — paid for, never opened.",
    },
    {
      title: "10 din ki chhutti li toh business ruk jaayega",
      body: "Everything depends on one person: you. That's a job, not a business.",
    },
  ],

  jobTitles: [
    "Chief Firefighting Officer",
    "Chief Follow-Up Manager",
    "Chief Problem-Solver",
    "Chief Approval Department",
  ],

  timeline: [
    { year: "1995", tech: "Computers", quote: "“Main toh register book hi use karunga.”", now: false },
    { year: "2005", tech: "Mobile Phones", quote: "“Bahut complicated hai, zaroorat nahi.”", now: false },
    { year: "2015", tech: "WhatsApp for Business", quote: "“Mere customers WhatsApp use nahi karte.”", now: false },
    { year: "2026", tech: "Artificial Intelligence", quote: "“I'm not a tech person…”", now: true },
  ],

  before: [
    "You ARE the system",
    "Mornings lost chasing updates",
    "Leads slip through the cracks",
    "Team waits for you to decide",
    "No holiday without 50 calls",
    "Busy daily, growing slowly",
    "Numbers known at quarter-end",
  ],
  after: [
    "The system runs the business",
    "Reports arrive before you wake up",
    "Every lead tracked, every follow-up done",
    "Team runs on documented playbooks",
    "Step away — the business keeps moving",
    "Less effort, more output, real scale",
    "Numbers visible every Monday morning",
  ],

  days: [
    {
      label: "Day 1",
      date: "Tue · 13 October · 9:00 PM",
      theme: "The Foundation — People, Operations & Accountability",
      modules: [
        {
          n: "1",
          title: "The Business OS Architecture",
          body: "Why every tool failed — and the design that works.",
        },
        {
          n: "2",
          title: "HR Command Center",
          body: "Hiring, onboarding, daily HR reports — running before you log off.",
        },
        {
          n: "3",
          title: "Team Accountability Engine",
          body: "Know what everyone did today — without asking anyone.",
        },
      ],
    },
    {
      label: "Day 2",
      date: "Wed · 14 October · 9:00 PM",
      theme: "The Revenue Engine — Sales, Marketing & Money",
      modules: [
        {
          n: "4",
          title: "Sales Pipeline & Follow-Up System",
          body: "No lead ever slips. Pipeline out of your head, into a system.",
        },
        {
          n: "5",
          title: "Marketing & Lead Engine",
          body: "Campaigns and lead capture that run on their own.",
        },
        {
          n: "6",
          title: "Finance Visibility Dashboard",
          body: "Cash flow and P&L every Monday — not every quarter.",
        },
      ],
    },
  ],

  ecosystem: [
    { icon: "rocket", name: "AI Business Launchpad", line: "Build the foundation.", tag: "You are here" },
    { icon: "cog", name: "AI Automation Accelerator", line: "Automate your repetitive work." },
    { icon: "brain", name: "AI Business Systems", line: "Build intelligent systems." },
    { icon: "bot", name: "AI Agent Factory", line: "Build your AI workforce." },
    { icon: "trending", name: "AI Business Scale", line: "Scale with fewer people and better systems." },
    { icon: "academy", name: "BuildBiz Academy", line: "Learn AI. Build systems. Grow." },
    { icon: "briefcase", name: "BuildBiz Automations", line: "Done-for-you AI implementation." },
  ],

  whoFor: [
    "₹1 Crore+ revenue, team of 5–500",
    "Real revenue — but everything runs through you",
    "Tried tools and vendors — chaos got louder",
    "Busy every day, growing slowly",
    "Ready to work ON the business, not IN it",
  ],
  industries: [
    "Manufacturing",
    "Trading",
    "Retail",
    "Services",
    "Real Estate",
    "Healthcare",
    "Agencies",
    "Education",
    "Logistics",
    "Hospitality",
    "D2C",
    "Exports",
    "Professional Services",
  ],

  testimonials: [
    {
      headline: "7-day holiday. Zero calls. First time in 4 years.",
      body: "Built the reporting system on Day 1. Three weeks later I spent 7 days in Kerala — not one call from the factory.",
      name: "Rajan Deshmukh",
      meta: "Auto Parts, Coimbatore · Team of 55",
      image: "/testimonials/rajan.jpg",
    },
    {
      headline: "₹8 lakhs of failed IT work — solved in 2 days for ₹51.",
      body: "An IT vendor took ₹8 lakhs and vanished. This gave me a working system that has run 4 months without breaking.",
      name: "Hitesh Shah",
      meta: "Distribution, Surat · Team of 22",
      image: "/testimonials/hitesh.jpg",
    },
    {
      headline: "My team coordination time dropped 60%.",
      body: "Built the ops system on Day 2. Took a 4-day trip two weeks later — zero fires.",
      name: "Sonali Joshi",
      meta: "Digital Agency, Bangalore · Team of 14",
      image: "/testimonials/sonali.jpg",
    },
    {
      headline: "I finally feel like an owner — not an employee of my own company.",
      body: "All 5 store managers now report into one dashboard by 7 PM. I'm home for dinner now.",
      name: "Venkat Reddy",
      meta: "Retail Chain, Hyderabad · Team of 38",
      image: "/testimonials/venkat.jpg",
    },
  ],

  bonuses: [
    { name: "The 6-System Blueprint Pack", body: "Templates for all six systems you build.", value: 6000, image: "/bonus-blueprints.jpg" },
    { name: "Live Q&A Access", body: "Your questions, answered live in the room.", value: 4000, image: "/bonus-qna.jpg" },
    { name: "The AI Prompt Library", body: "The exact prompts — copy-paste ready.", value: 3000, image: "/bonus-prompts.jpg" },
    { name: "The SOP Starter Kit", body: "Procedures your team will actually follow.", value: 2000, image: "/bonus-sop.jpg" },
  ],

  registerIf: [
    "You do ₹1 Crore+ with a team of 5–500",
    "You're generating revenue but stuck being the bottleneck",
    "You've tried tools or vendors and still have no working system",
    "You're ready to build, not just learn",
    "You can commit to both nights — 13th & 14th October, 9:00 PM",
  ],
  dontRegisterIf: [
    "You're a solo operator or freelancer with no team",
    "You're still building your first revenue",
    "You want motivation, not execution",
    "You're not ready to implement now",
    "You cannot attend both days fully",
  ],

  faq: [
    {
      q: "When exactly is the workshop?",
      a: "Tuesday 13th & Wednesday 14th October, 9:00 PM IST, live on Zoom — both days included in your ₹51 seat. Your joining link is sent on WhatsApp immediately after you register.",
    },
    {
      q: "I'm not technical. Can I really build this?",
      a: "Yes. Completely. No coding, no IT background. Agar aap WhatsApp chala sakte ho, you can build every system here. It is designed entirely for non-technical founders.",
    },
    {
      q: "I've attended workshops before. Why is this different?",
      a: "You will build, not listen. By the end of Day 1 you have a working HR and Ops system. By Day 2 your full Business OS is live. You leave with systems, not notes.",
    },
    {
      q: "Will this work for my industry?",
      a: "The systems run across every industry — because the architecture is universal. Every module is customized to your actual business in the session.",
    },
    {
      q: "What if I get stuck after the workshop?",
      a: "You leave with everything you need. And if you want our team to build the full system for you, that option (BuildBiz Automations) is presented inside the workshop.",
    },
    {
      q: "Why only ₹51?",
      a: "₹51 filters out people who aren't serious. You attend, you build, you decide what's next. No catch. No pressure.",
    },
  ],

  /** Social proof toasts — rotated randomly on the client. */
  recentBuyers: [
    { name: "Rajesh Sharma", city: "Delhi", industry: "Manufacturing" },
    { name: "Priya Nair", city: "Kochi", industry: "Healthcare" },
    { name: "Arjun Mehta", city: "Ahmedabad", industry: "Trading" },
    { name: "Sneha Kulkarni", city: "Pune", industry: "Agency" },
    { name: "Vikram Singh", city: "Jaipur", industry: "Real Estate" },
    { name: "Farhan Qureshi", city: "Lucknow", industry: "Exports" },
    { name: "Divya Iyer", city: "Chennai", industry: "Education" },
    { name: "Karan Malhotra", city: "Gurugram", industry: "Logistics" },
    { name: "Meera Patel", city: "Surat", industry: "D2C" },
    { name: "Suresh Babu", city: "Hyderabad", industry: "Retail" },
    { name: "Ananya Bose", city: "Kolkata", industry: "Hospitality" },
    { name: "Rohit Agarwal", city: "Indore", industry: "Services" },
  ],
} as const;

export type Site = typeof site;

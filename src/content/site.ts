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
      "Dr. Amit Moga builds AI-powered operating systems for Indian businesses — the kind that run teams, sales, operations and follow-ups without the owner being pinged for every decision.",
      "He is the architect behind the BuildBiz methodology — BUILD → AUTOMATE → SYSTEMIZE → SCALE — a framework tested under real operational pressure: real people, real follow-up failures, real sales targets, and real founder overload. No developers. No enterprise software. No vendor lock-in.",
      "This workshop is not a lecture about better tools. It is that exact architecture, converted into a live build format for owners who want execution, not decoration.",
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
      body: "Most owners bolt tools onto chaos. We start with architecture — the roles, data and decisions your business actually runs on.",
    },
    {
      step: "02",
      name: "AUTOMATE",
      headline: "Eliminate repetitive manual work.",
      body: "Daily reports, reminders, follow-ups, approvals. Anything that happens twice gets handed to AI — permanently.",
    },
    {
      step: "03",
      name: "SYSTEMIZE",
      headline: "Create repeatable AI-powered processes.",
      body: "Playbooks your team actually follows. Standards that hold whether you're in the office or in Kerala.",
    },
    {
      step: "04",
      name: "SCALE",
      headline: "Grow without proportionally adding people, time and complexity.",
      body: "Revenue goes up. Headcount, meetings and your working hours don't have to follow.",
    },
  ],

  pains: [
    {
      title: "Aap hi system ho",
      body: "Nothing moves without you. Every decision, approval and problem routes back to you. You are not the owner. You are the bottleneck.",
    },
    {
      title: "Har subah chasing updates mein nikal jaati hai",
      body: "Your first 2 hours go on WhatsApp asking the team what happened yesterday. Reports that should arrive automatically, you chase manually.",
    },
    {
      title: "Team tab perform karti hai jab aap dekh rahe ho",
      body: "Aapki nazar hati, aur quality giri. Your team isn't lazy — there's no system telling them what good looks like, every day, without you.",
    },
    {
      title: "“Thoda follow-up reh gaya” — aur deal nikal gayi",
      body: "Leads aate hain. Koi time pe follow-up nahi karta. You find out two weeks later that the client went to a competitor.",
    },
    {
      title: "Tools khareede, par kuch nahi chala",
      body: "Google Sheets. Zoho. Notion. Subscriptions you pay for and nobody opens. The tools were never the problem — the missing system was.",
    },
    {
      title: "10 din ki chhutti li toh business ruk jaayega",
      body: "You can't switch off, sell it, or scale it — because everything depends on one person. That's not a business. That's a job you built for yourself.",
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
          body: "Why every tool you tried failed — and the design logic that finally works for your business.",
        },
        {
          n: "2",
          title: "HR Command Center",
          body: "Hiring pipeline, candidate tracker, onboarding and daily HR reporting — built live, running before you close the laptop.",
        },
        {
          n: "3",
          title: "Team Accountability Engine",
          body: "KPIs, daily reports, performance scoring. Know what everyone did today — without asking a single person.",
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
          body: "No lead ever slips. Know your pipeline health at any moment — without it living in your head.",
        },
        {
          n: "5",
          title: "Marketing & Lead Engine",
          body: "Content, campaigns and lead capture that run without you pushing them every day.",
        },
        {
          n: "6",
          title: "Finance Visibility Dashboard",
          body: "Cash flow, P&L, weekly numbers — every Monday morning, not every quarter-end.",
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
    "You run a business doing ₹1 Crore+ with a team of 5 to 500.",
    "You have paying customers and real revenue — but everything still runs through you.",
    "You've tried tools, vendors or hiring — and the chaos only got louder.",
    "You're busy every single day but the business isn't growing the way it should.",
    "You want to work ON your business, not IN it — and you're ready to build the system that makes that real.",
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
      body: "55 people in my unit. I used to spend 2 hours every morning finding out what happened yesterday. I built the daily reporting system on Day 1. Next morning my floor manager reported to me without being asked. Three weeks later I went to Kerala for 7 days — not one call from the factory.",
      name: "Rajan Deshmukh",
      meta: "Auto Parts, Coimbatore · Team of 55",
    },
    {
      headline: "₹8 lakhs of failed IT work — solved in 2 days for ₹51.",
      body: "Three different Google Sheets that never matched. I paid ₹8 lakhs to an IT vendor who delivered 60% and vanished. This workshop gave me what they couldn't — a working system that has run for 4 months without breaking.",
      name: "Hitesh Shah",
      meta: "Distribution, Surat · Team of 22",
    },
    {
      headline: "My team coordination time dropped 60%.",
      body: "Billing ₹1.2 Cr and I couldn't take 3 days off without clients calling me directly. I built the ops and client reporting system on Day 2. Took a 4-day trip two weeks later. Zero fires. The business ran exactly as designed.",
      name: "Sonali Joshi",
      meta: "Digital Agency, Bangalore · Team of 14",
    },
    {
      headline: "I finally feel like an owner — not an employee of my own company.",
      body: "5 retail outlets. I was driving between stores every evening, home after 10 PM daily. After the workshop, all 5 managers report into one dashboard by 7 PM. I'm home for dinner now. My wife asked what changed. I said — I finally built a system.",
      name: "Venkat Reddy",
      meta: "Retail Chain, Hyderabad · Team of 38",
    },
  ],

  bonuses: [
    { name: "The 6-System Blueprint Pack", body: "Ready-to-use templates for all six systems you build in the workshop.", value: 6000 },
    { name: "Live Q&A Access", body: "Get your specific business questions answered live, in the room — attendees only.", value: 4000 },
    { name: "The AI Prompt Library", body: "The exact prompts that build each system — copy-paste ready.", value: 3000 },
    { name: "The SOP Starter Kit", body: "Done-for-you procedure templates your team will actually follow.", value: 2000 },
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

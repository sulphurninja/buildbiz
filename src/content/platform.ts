export const steps = [
  {
    n: "01",
    title: "Pick the industry",
    body: "Browse the catalogue and open the dashboard for the business you actually run. Each industry is its own desk, not a skin on the same screens.",
  },
  {
    n: "02",
    title: "Work the live desk",
    body: "Search the book, move a job, clear a hold, and watch the floor update. The companies are fictional. The controls are real.",
  },
  {
    n: "03",
    title: "It runs on your accounts",
    body: "The app deploys to your Vercel project and stores data in your Supabase project. It does not depend on BuildBizAI after you have it.",
  },
];

export const ownership = [
  { title: "The source is yours", body: "You receive a Next.js application you can read, change, and keep. Not a login to someone else's platform." },
  { title: "Your database, managed", body: "Supabase hosts the database. You never install PostgreSQL or run a server for it." },
  { title: "Claude Code, not a new IDE", body: "The codebase ships with instructions so Claude Code can set it up, change branding, and add features without guessing the architecture." },
  { title: "Same product as the demo", body: "The public dashboard and the downloadable application are meant to be the same software. A preview is not a different, thinner product." },
];

export const faqs = [
  {
    q: "Is this a template I recolour?",
    a: "No. Each production industry is its own application: its own screens, its own data, its own workflows. They share a design system so we can maintain them. They do not share a single generic dashboard.",
  },
  {
    q: "Do I have to write code?",
    a: "The dashboards you can open are the product to look at. Setup, when an industry is ready to leave with you, is done with Claude Code against a Supabase project and a Vercel project in your own accounts.",
  },
  {
    q: "Do I need my own database server?",
    a: "No. The application uses Supabase. You create a project in your own Supabase account and apply the migrations that ship with the code.",
  },
  {
    q: "Which industries can I open?",
    a: "All of them. Each one has its own desk, its own workflow, and a fictional company. Search, filters, holds, and signals on that desk all work.",
  },
];

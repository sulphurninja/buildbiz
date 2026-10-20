export const sectors = [
  "Manufacturing",
  "Trade & Export",
  "Healthcare",
  "Retail & Consumer",
  "Real Estate & Built",
  "Services",
  "Logistics & Mobility",
  "Education",
  "Hospitality & Lifestyle",
  "Agri & Food",
  "Energy & Utilities",
] as const;

export type Sector = (typeof sectors)[number];

export type IndustryMeta = {
  slug: string;
  name: string;
  company: string;
  city: string;
  sector: Sector;
  /** the one module that makes this desk unlike the others */
  signature: string;
  layout: "board" | "editorial" | "dock" | "timeline" | "console" | "stack" | "command" | "atlas" | "bento" | "rail";
  summary: string;
  /** two swatch colours used on the gallery card */
  swatch: [string, string];
};

export const industries: IndustryMeta[] = [
  { slug: "job-shop", name: "Custom Engineering Job-Shop", company: "Kaveri Precision Works", city: "Hosur", sector: "Manufacturing", signature: "Shop-floor conveyor", layout: "board", summary: "Job cards ride a live conveyor from drawing to dispatch, with machine load, rework and quote clocks.", swatch: ["#b4532a", "#2f5d8a"] },
  { slug: "stone-yard", name: "Stone & Building Materials", company: "Aravalli Stone Yard", city: "Kishangarh", sector: "Manufacturing", signature: "बकाया board", layout: "editorial", summary: "A morning paper for the yard owner: outstanding by dealer, today's calls, gang-saw status and slab stock.", swatch: ["#4f5b2a", "#a0763a"] },
  { slug: "lab-supply", name: "Chemicals & Lab Supplies", company: "Narmada Lab Supply", city: "Vapi", sector: "Manufacturing", signature: "Periodic SKU wall", layout: "dock", summary: "Every SKU as a periodic-table tile with batch, expiry, MSDS and reorder signals.", swatch: ["#0f6b5c", "#b07a2a"] },
  { slug: "textile", name: "Textile & Garments", company: "Godavari Weaves", city: "Surat", sector: "Manufacturing", signature: "TNA calendar", layout: "timeline", summary: "Every style order against its buyer date, the stitching floor and the trims POs waiting on the owner.", swatch: ["#3b56b5", "#3f8f8a"] },
  { slug: "spice-export", name: "Agri & Spice Export House", company: "Malabar Spice House", city: "Kochi", sector: "Trade & Export", signature: "Shipment atlas", layout: "editorial", summary: "Containers on the water, lab results, LC deadlines and mandi prices on one front page.", swatch: ["#7a3b12", "#0e4a52"] },
  { slug: "auto-parts", name: "Auto Parts Export", company: "Sutlej Auto Components", city: "Ludhiana", sector: "Trade & Export", signature: "Part-match engine", layout: "console", summary: "OEM cross-reference search, PPAP status, export lots and buyer RFQs in one console.", swatch: ["#c45c16", "#1d2733"] },
  { slug: "fmcg-route", name: "FMCG Distributor & Field Sales", company: "Deccan Route Sales", city: "Nagpur", sector: "Trade & Export", signature: "Beat route", layout: "stack", summary: "Salesmen on today's beats, outlet calls, van stock, schemes and collections.", swatch: ["#d08a1f", "#1d5c32"] },
  { slug: "industrial-supply", name: "Industrial B2B Distributor", company: "Coromandel Industrial Supply", city: "Chennai", sector: "Trade & Export", signature: "Quote clock wall", layout: "command", summary: "Every RFQ on a clock, rate contracts, stock across godowns and credit holds.", swatch: ["#5d6b2f", "#22303f"] },
  { slug: "dental", name: "Dental Clinic", company: "Nilgiri Dental Studio", city: "Pune", sector: "Healthcare", signature: "Live chair map", layout: "timeline", summary: "Chairs, doctors and patients minute by minute, with treatment plans, recalls and lab work.", swatch: ["#1f6b5a", "#7fb8c9"] },
  { slug: "electronics-retail", name: "Electronics Retail Chain", company: "Saurashtra Electronics", city: "Rajkot", sector: "Retail & Consumer", signature: "Store grid", layout: "atlas", summary: "Eleven stores on a live grid: sales, stock transfers, EMI approvals and service tickets.", swatch: ["#123a5c", "#1aa6a6"] },
  { slug: "jewellery", name: "Jewellery Showroom", company: "Periyar Jewellers", city: "Thrissur", sector: "Retail & Consumer", signature: "Tray tally", layout: "dock", summary: "Tray-by-tray gram tally, gold rate, karigar orders, schemes and old-gold exchange.", swatch: ["#a68445", "#2a2118"] },
  { slug: "d2c", name: "D2C E-commerce Brand", company: "Western Ghats Wellness", city: "Bengaluru", sector: "Retail & Consumer", signature: "Order heartbeat", layout: "bento", summary: "Orders by the minute, RTO risk, ad spend, inventory days and reviews in a bento grid.", swatch: ["#6e3148", "#e2a23b"] },
  { slug: "interiors", name: "Furniture, Windows & Interiors", company: "Cauvery Interiors", city: "Coimbatore", sector: "Retail & Consumer", signature: "Room planner", layout: "rail", summary: "Site measurements become room plans, quotes, factory orders and installation crews.", swatch: ["#6b442c", "#c9a27a"] },
  { slug: "realty", name: "Real Estate Brokerage", company: "Yamuna Realty", city: "Noida", sector: "Real Estate & Built", signature: "Corridor match map", layout: "atlas", summary: "Buyers matched to inventory along the expressway, site visits, token money and RERA papers.", swatch: ["#b85a32", "#2d4a6b"] },
  { slug: "design-studio", name: "Architecture & Interior Design Studio", company: "Mandovi Design Studio", city: "Panaji", sector: "Real Estate & Built", signature: "Drawing register", layout: "editorial", summary: "Every drawing, revision and approval across projects, with fee stages and site visits.", swatch: ["#222222", "#d9c96a"] },
  { slug: "agency", name: "Digital Marketing Agency", company: "Andheri Growth Studio", city: "Mumbai", sector: "Services", signature: "Client pulse wall", layout: "bento", summary: "Client health, campaign spend vs results, content calendar and retainers.", swatch: ["#6d4aff", "#141416"] },
  { slug: "print-shop", name: "Printing & Signage", company: "Ganga Printworks", city: "Kanpur", sector: "Services", signature: "Job-card conveyor", layout: "board", summary: "Job cards from artwork to installation, press queue, media stock and site fitting.", swatch: ["#0096d6", "#e5007e"] },
  { slug: "advisory", name: "Consultancy Practice (Vastu & Coaching)", company: "Shipra Advisory", city: "Ujjain", sector: "Services", signature: "Vastu mandala", layout: "rail", summary: "Consultations, site audits on a mandala, coaching cohorts and follow-ups.", swatch: ["#8a2c1d", "#c9a24a"] },
  { slug: "courier", name: "Courier & Logistics", company: "Sabarmati Couriers", city: "Ahmedabad", sector: "Logistics & Mobility", signature: "Live routes", layout: "atlas", summary: "Riders on live routes, pickups, NDR, COD remittance and hub throughput.", swatch: ["#f5c400", "#1a1a1a"] },
  { slug: "fleet", name: "Fleet & Transport", company: "Palar Roadlines", city: "Namakkal", sector: "Logistics & Mobility", signature: "Fleet matrix", layout: "console", summary: "Every truck in a matrix: trip, driver, diesel, tyres, permits and freight dues.", swatch: ["#b7d37a", "#24312e"] },
  { slug: "learning-kits", name: "Educational Products", company: "Ganga Learning Kits", city: "Patna", sector: "Education", signature: "Voice delegator", layout: "command", summary: "School orders, kit assembly, dispatch, trainer visits and a voice-note task delegator.", swatch: ["#1d3324", "#e0b84a"] },
  { slug: "tours", name: "Tours & Travels", company: "Hooghly Holidays", city: "Kolkata", sector: "Hospitality & Lifestyle", signature: "Departures board", layout: "timeline", summary: "A split-flap departures board, seat inventory, hotel blocks, visas and payments.", swatch: ["#c4922a", "#101828"] },
  { slug: "dairy-fpo", name: "Agri FPO & Dairy", company: "Tapi Dairy Collective", city: "Bharuch", sector: "Agri & Food", signature: "Village milk pulse", layout: "atlas", summary: "Morning and evening milk from 38 villages, fat/SNF, chilling centres and farmer payouts.", swatch: ["#1d4e89", "#3d6b3a"] },
  { slug: "restaurant", name: "Restaurant & Cloud Kitchen", company: "Tadka Junction Kitchens", city: "Hyderabad", sector: "Hospitality & Lifestyle", signature: "Kitchen pass", layout: "console", summary: "Every KOT on a live kitchen rail, Swiggy and Zomato prep times, food cost, wastage and outlet P&L.", swatch: ["#e85d2a", "#1b1410"] },
  { slug: "pharma-distribution", name: "Pharma Distributor", company: "Sahyog Pharma Distributors", city: "Indore", sector: "Healthcare", signature: "Expiry radar", layout: "command", summary: "Retailer orders, batch and expiry radar, scheme claims, cold chain and chemist credit in one desk.", swatch: ["#1f6fb2", "#d94f6b"] },
  { slug: "solar-epc", name: "Solar EPC Installer", company: "Suryodaya Solar Systems", city: "Jaipur", sector: "Energy & Utilities", signature: "Rooftop yield", layout: "atlas", summary: "Site surveys, PM Surya Ghar subsidy files, net-metering approvals, install crews and live plant yield.", swatch: ["#f2a900", "#1f4d3a"] },
];

export function findIndustry(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

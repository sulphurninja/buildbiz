/**
 * Absolute base URL for metadata, sitemap and share images.
 * Order: an explicit NEXT_PUBLIC_SITE_URL, then Vercel's production domain
 * (picks up a custom domain automatically once one is attached), then the
 * current Vercel deployment.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  return "https://buildbizai.vercel.app";
}

export const siteUrl = resolveSiteUrl();

/** Share image used by WhatsApp, LinkedIn, X and iMessage previews. */
export const shareImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "BuildBizAI: AI operating systems built for every industry",
};

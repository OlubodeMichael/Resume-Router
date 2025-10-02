export const CREDIT_RULES = {
  CREDITS_PER_RESUME: 10,
  CREDITS_PER_SECTION_REGEN: 2,
  EXPIRY_MONTHS: 6,
};

export interface Plan {
  id: string;
  name: string;
  price?: number;
  priceLabel: string;
  credits?: number;
  approxResumes?: number;
  features: string[];
  cta: {
    label: string;
    href: string;
  };
}

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    features: [
      "2 tailored resumes (lifetime)",
      "2 section regenerations",
      "2 templates, PDF export",
      "Basic ATS check",
    ],
    cta: { label: "Start free", href: "/signup" },
  },
  credits: {
    id: "credits-1000",
    name: "Credits",
    price: 15,
    priceLabel: "$15 → 1,000 credits",
    credits: 1000,
    approxResumes: 100,
    features: [
      "All templates + PDF/DOCX",
      "Enhanced ATS scoring",
      "Version history",
      "Credits expire in 6 months",
    ],
    cta: { label: "Buy credits", href: "/checkout?pack=credits-1000" },
    // stripePriceId: "price_..."
  },
  pass3: {
    id: "pass-3mo",
    name: "3-Month Pass",
    price: 39,
    priceLabel: "$39 / 3 months",
    features: [
      "Unlimited resumes & regenerations",
      "All templates, PDF & DOCX",
      "Priority support",
    ],
    cta: { label: "Get 3-Month Pass", href: "/checkout?plan=pass-3mo" },
    // stripePriceId: "price_..."
  },
} as const;

export const formatApprox = (credits: number, per = CREDIT_RULES.CREDITS_PER_RESUME) =>
  Math.floor(credits / per);

export type PlanKey = keyof typeof PLANS;

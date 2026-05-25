// Contextual EN+BN copy for the site-wide LeadCapture component.
// Each context gets a value-led title, sub, button label, and the WhatsApp
// alternate copy. Keep these tight — every variant must read like an
// invitation to insider access, not a "subscribe" ask.

export type CaptureContext =
  | "sitewide"
  | "homepage"
  | "service"
  | "blog-mid"
  | "blog-end"
  | "exit-intent"
  | "footer";

export type Locale = "en" | "bn";

export type CaptureCopy = {
  /** Eyebrow chip (uppercase). */
  eyebrow?: string;
  /** Big bold ask. */
  title: string;
  /** Single-sentence value-led sub. */
  sub: string;
  /** Submit button label. */
  cta: string;
  /** Tab label for the email field. */
  tabEmail: string;
  /** Tab label for the WhatsApp field. */
  tabPhone: string;
  /** Placeholder on email input. */
  emailPlaceholder: string;
  /** Placeholder on phone input. */
  phonePlaceholder: string;
  /** Tiny consent paragraph under the form. */
  consentEmail: string;
  consentPhone: string;
  /** Sticky-bar dismiss aria-label. */
  dismiss: string;
  /** WhatsApp toggle line. */
  preferWhatsApp: string;
};

const EN: Record<CaptureContext, CaptureCopy> = {
  sitewide: {
    eyebrow: "Insider playbooks",
    title: "Get the plays we run for Bangladeshi brands.",
    sub: "Bi-weekly. Paid, social, PR. What worked, what didn't, the real numbers. No vanity metrics.",
    cta: "Send me the playbook",
    tabEmail: "Email",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+880 1XXXXXXXXX",
    consentEmail: "By signing up, you'll receive a one-click confirmation email. Unsubscribe any time.",
    consentPhone: "I agree to receive one WhatsApp message from Public Pulse about my enquiry. No marketing list.",
    dismiss: "Dismiss",
    preferWhatsApp: "Prefer WhatsApp? Drop your number — we reply within 2 hours, Sat–Thu.",
  },
  homepage: {
    eyebrow: "The Pulse Digest",
    title: "Real campaigns. Real numbers. Every two weeks.",
    sub: "Join Bangladesh's most opinionated marketing brief. We share what's moving the needle — not hot takes.",
    cta: "Send me the next issue",
    tabEmail: "Email",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+880 1XXXXXXXXX",
    consentEmail: "One-click confirmation. Unsubscribe whenever.",
    consentPhone: "I agree to a one-time WhatsApp message from Public Pulse.",
    dismiss: "Dismiss",
    preferWhatsApp: "Prefer WhatsApp? We'll reply within 2 hours, Sat–Thu 09:00–21:00 BD.",
  },
  service: {
    eyebrow: "Free audit",
    title: "Want a free audit on this for your brand?",
    sub: "Send us your handle / domain — we'll send back a one-page audit grounded in real Bangladesh benchmarks.",
    cta: "Get my free audit",
    tabEmail: "Email",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+880 1XXXXXXXXX",
    consentEmail: "We'll only use this email to send your audit + the bi-weekly digest if you opt in.",
    consentPhone: "I agree to a one-time WhatsApp message about my audit.",
    dismiss: "Close",
    preferWhatsApp: "Or send it via WhatsApp — we reply within 2 hours.",
  },
  "blog-mid": {
    eyebrow: "Worth your inbox",
    title: "Get the next playbook before it ships.",
    sub: "We send one no-fluff email every two weeks. The kind of post you're reading now — early.",
    cta: "Yes, send it to me",
    tabEmail: "Email",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+880 1XXXXXXXXX",
    consentEmail: "One-click confirmation. Unsubscribe whenever.",
    consentPhone: "I agree to a one-time WhatsApp message from Public Pulse.",
    dismiss: "Close",
    preferWhatsApp: "Prefer WhatsApp? Reply faster, no inbox clutter.",
  },
  "blog-end": {
    eyebrow: "Keep going",
    title: "Liked this? The next one lands in 2 weeks.",
    sub: "Subscribe and we'll send the next playbook to your inbox — no algorithm in the way.",
    cta: "Send me the next playbook",
    tabEmail: "Email",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+880 1XXXXXXXXX",
    consentEmail: "One-click confirmation. Unsubscribe whenever.",
    consentPhone: "I agree to a one-time WhatsApp message from Public Pulse.",
    dismiss: "Close",
    preferWhatsApp: "Or send it via WhatsApp — we reply within 2 hours.",
  },
  "exit-intent": {
    eyebrow: "Before you go",
    title: "Take the playbook with you.",
    sub: "Drop your email and we'll send the latest issue + the free Bangladesh marketing PDF (12 pages, no fluff).",
    cta: "Send me the PDF",
    tabEmail: "Email",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+880 1XXXXXXXXX",
    consentEmail: "We'll send the PDF + the bi-weekly digest. Unsubscribe any time.",
    consentPhone: "I agree to a one-time WhatsApp message with the PDF link.",
    dismiss: "No thanks",
    preferWhatsApp: "Prefer WhatsApp? We'll send the PDF link there instead.",
  },
  footer: {
    eyebrow: "Stay in the loop",
    title: "The bi-weekly Pulse Digest.",
    sub: "Tactics, numbers, lessons from Bangladesh campaigns. Free, two emails a month.",
    cta: "Subscribe",
    tabEmail: "Email",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+880 1XXXXXXXXX",
    consentEmail: "One-click confirmation. Unsubscribe whenever.",
    consentPhone: "I agree to a one-time WhatsApp message from Public Pulse.",
    dismiss: "Dismiss",
    preferWhatsApp: "Prefer WhatsApp?",
  },
};

const BN: Record<CaptureContext, CaptureCopy> = {
  sitewide: {
    eyebrow: "ইনসাইডার প্লেবুক",
    title: "বাংলাদেশি ব্র্যান্ডদের জন্য আমাদের রিয়েল প্লেবুকগুলো পান।",
    sub: "দ্বি-সাপ্তাহিক। পেইড, সোশ্যাল, পিআর। কী কাজ করেছে, কী হয়নি — আসল সংখ্যা সহ।",
    cta: "প্লেবুক পাঠান",
    tabEmail: "ইমেল",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
    consentEmail: "নিবন্ধন করলে আপনি একটি কনফার্মেশন ইমেল পাবেন। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।",
    consentPhone: "আমি পাবলিক পালস থেকে আমার অনুসন্ধান সম্পর্কে একটি WhatsApp বার্তা পেতে সম্মত।",
    dismiss: "বাতিল",
    preferWhatsApp: "WhatsApp পছন্দ? নম্বর দিন — শনি-বৃহস্পতি ২ ঘন্টায় রিপ্লাই।",
  },
  homepage: {
    eyebrow: "দ্য পালস ডাইজেস্ট",
    title: "রিয়েল ক্যাম্পেইন। রিয়েল সংখ্যা। প্রতি দুই সপ্তাহে।",
    sub: "বাংলাদেশের সবচেয়ে opinionated মার্কেটিং ব্রিফে যোগ দিন।",
    cta: "পরবর্তী ইস্যু পাঠান",
    tabEmail: "ইমেল",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
    consentEmail: "ওয়ান-ক্লিক কনফার্মেশন। যখন খুশি আনসাবস্ক্রাইব।",
    consentPhone: "আমি পাবলিক পালস থেকে একটি WhatsApp বার্তা পেতে সম্মত।",
    dismiss: "বাতিল",
    preferWhatsApp: "WhatsApp পছন্দ? ২ ঘন্টায় রিপ্লাই।",
  },
  service: {
    eyebrow: "ফ্রি অডিট",
    title: "এটি আপনার ব্র্যান্ডের জন্য ফ্রি অডিট চান?",
    sub: "হ্যান্ডেল/ডোমেইন দিন — বাংলাদেশের বেঞ্চমার্ক অনুযায়ী এক-পেজ অডিট পাঠাব।",
    cta: "আমার ফ্রি অডিট নিন",
    tabEmail: "ইমেল",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
    consentEmail: "এই ইমেল শুধু অডিট পাঠানোর জন্য ব্যবহার করব।",
    consentPhone: "আমি একটি WhatsApp বার্তা পেতে সম্মত।",
    dismiss: "বন্ধ",
    preferWhatsApp: "WhatsApp-এ পাঠান — দ্রুত রিপ্লাই।",
  },
  "blog-mid": {
    eyebrow: "ইনবক্সে পাওয়ার মতো",
    title: "পরবর্তী প্লেবুক আগেই পান।",
    sub: "প্রতি দুই সপ্তাহে একটি no-fluff ইমেল।",
    cta: "হ্যাঁ, পাঠান",
    tabEmail: "ইমেল",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
    consentEmail: "ওয়ান-ক্লিক কনফার্মেশন।",
    consentPhone: "আমি একটি WhatsApp বার্তা পেতে সম্মত।",
    dismiss: "বন্ধ",
    preferWhatsApp: "WhatsApp পছন্দ?",
  },
  "blog-end": {
    eyebrow: "চালিয়ে যান",
    title: "এটি পছন্দ হয়েছে? পরের প্লেবুক ২ সপ্তাহে আসছে।",
    sub: "সাবস্ক্রাইব করুন — অ্যালগরিদম ছাড়াই ইনবক্সে পাবেন।",
    cta: "পরের প্লেবুক পাঠান",
    tabEmail: "ইমেল",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
    consentEmail: "ওয়ান-ক্লিক কনফার্মেশন।",
    consentPhone: "আমি একটি WhatsApp বার্তা পেতে সম্মত।",
    dismiss: "বন্ধ",
    preferWhatsApp: "WhatsApp পছন্দ?",
  },
  "exit-intent": {
    eyebrow: "যাওয়ার আগে",
    title: "প্লেবুকটি সঙ্গে নিয়ে যান।",
    sub: "ইমেল দিন — সর্বশেষ ইস্যু + ফ্রি বাংলাদেশ মার্কেটিং PDF (১২ পৃষ্ঠা)।",
    cta: "PDF পাঠান",
    tabEmail: "ইমেল",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
    consentEmail: "PDF + দ্বি-সাপ্তাহিক ডাইজেস্ট পাঠাব। যখন খুশি আনসাবস্ক্রাইব।",
    consentPhone: "PDF লিংক সহ একটি WhatsApp বার্তা পেতে সম্মত।",
    dismiss: "না, ধন্যবাদ",
    preferWhatsApp: "WhatsApp-এ PDF পাঠাবেন?",
  },
  footer: {
    eyebrow: "যোগাযোগে থাকুন",
    title: "দ্বি-সাপ্তাহিক পালস ডাইজেস্ট।",
    sub: "ট্যাকটিক, সংখ্যা, পাঠ — মাসে দুটি ইমেল।",
    cta: "সাবস্ক্রাইব",
    tabEmail: "ইমেল",
    tabPhone: "WhatsApp",
    emailPlaceholder: "you@brand.com",
    phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
    consentEmail: "ওয়ান-ক্লিক কনফার্মেশন।",
    consentPhone: "আমি একটি WhatsApp বার্তা পেতে সম্মত।",
    dismiss: "বাতিল",
    preferWhatsApp: "WhatsApp পছন্দ?",
  },
};

export function getCopy(context: CaptureContext, locale: Locale = "en"): CaptureCopy {
  return (locale === "bn" ? BN : EN)[context];
}

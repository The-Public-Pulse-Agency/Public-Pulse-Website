import { SITE } from "@/lib/site";

// Sticky vertical social sidebar pinned to right edge — avoora pattern.
// Hidden on mobile to avoid covering content; reveals at md+ where there's
// dead space in the gutter.
//
// Brand icons are inline SVGs because lucide-react removed Instagram /
// Linkedin / Facebook as named exports (trademark / brand-asset concerns).

const ICON_CLASS = "h-4 w-4";

const IG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.22-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.16.26-2.92.56-.79.31-1.46.72-2.13 1.39A5.86 5.86 0 0 0 .63 4.15C.33 4.91.13 5.78.07 7.06.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.39-2.13A5.86 5.86 0 0 0 19.85.63C19.09.33 18.22.13 16.94.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
  </svg>
);

const LI = (
  <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const FB = (
  <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.69.23 2.69.23v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.1 24 12.07z" />
  </svg>
);

const WA = (
  <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49a9.07 9.07 0 0 1-1.68-2.08c-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.1 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 22a9.98 9.98 0 0 1-5.1-1.4l-3.57.94.96-3.48a9.97 9.97 0 1 1 7.7 3.94zm0-22A11.97 11.97 0 0 0 1.7 17.93L0 24l6.2-1.62A11.97 11.97 0 1 0 12 0z" />
  </svg>
);

const X = (
  <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LINKS = [
  { href: SITE.social.instagram, label: "Instagram", icon: IG },
  { href: "https://www.linkedin.com/", label: "LinkedIn", icon: LI },
  { href: SITE.social.facebook, label: "Facebook", icon: FB },
  { href: SITE.contact.whatsapp, label: "WhatsApp", icon: WA },
  { href: "https://x.com/", label: "X (Twitter)", icon: X },
];

export function SocialSidebar() {
  return (
    <aside
      aria-label="Social"
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 md:flex"
    >
      {LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          rel="noopener noreferrer"
          target="_blank"
          aria-label={l.label}
          className="grid h-10 w-10 place-items-center rounded-card bg-paper text-ink shadow-card transition hover:bg-ink hover:text-paper"
        >
          {l.icon}
        </a>
      ))}
    </aside>
  );
}

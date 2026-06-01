import { SITE } from "@/lib/site";

// z-[60] sits above StickyBar (z-40) and ExitIntent overlay (z-50) so the
// FAB is always reachable. h-16 w-16 = 64×64, comfortably above WCAG 44×44.
// env(safe-area-inset-*) gives notch/home-indicator clearance on iOS PWA.
export function WhatsAppFab() {
  return (
    <a
      href={SITE.contact.whatsapp}
      rel="noopener noreferrer"
      target="_blank"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] right-[calc(env(safe-area-inset-right,0px)+1.5rem)] z-[60] inline-flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-2xl text-white shadow-lg hover:opacity-90"
    >
      💬
    </a>
  );
}

import { SITE } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={SITE.contact.whatsapp}
      rel="noopener noreferrer"
      target="_blank"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-2xl text-white shadow-lg hover:opacity-90"
    >
      💬
    </a>
  );
}

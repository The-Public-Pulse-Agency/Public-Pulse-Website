import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site";

const EFFECTIVE_DATE = "2026-05-31";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service | Public Pulse Agency",
  description:
    "The terms covering use of publicpulse.com.bd, our newsletter, WhatsApp opt-in, and content. Read the rules before you use the site.",
  path: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      path="/terms"
      eyebrow="Legal"
      intro="The rules covering use of publicpulse.com.bd, our newsletter, and any content we publish. Read this before you use the site."
      effectiveDate={EFFECTIVE_DATE}
    >
      <h2>Agreement</h2>
      <p>
        By accessing or using <code>https://publicpulse.com.bd</code> (the &ldquo;Site&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, please do not use the Site.
      </p>
      <p>
        These Terms are a contract between you and <strong>{SITE.name}</strong>, a Bangladesh-registered business (BIN <code>{SITE.contact.legal.bin}</code>, Trade Licence <code>{SITE.contact.legal.tradeLicense}</code>), based at Dhaka, Bangladesh.
      </p>

      <h2>What the Site is</h2>
      <p>
        The Site is the public marketing surface for our digital marketing and political PR services. It includes long-form guides, case studies, a newsletter, contact and WhatsApp opt-in forms, and information about our agency. The Site does not constitute a contract for services — separate engagement letters and Master Services Agreements govern any client work.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>Use the Site for any unlawful purpose or in violation of any Bangladesh law or international regulation.</li>
        <li>Scrape, mirror, frame, or systematically download the Site outside what robots.txt allows. Standard search-engine indexing is permitted; bulk scraping is not.</li>
        <li>Attempt to gain unauthorised access to any part of the Site, our infrastructure, or other users&rsquo; data.</li>
        <li>Submit malicious content, automated form spam, or material designed to disrupt the Site.</li>
        <li>Reverse engineer, decompile, or attempt to extract the source code of our applications.</li>
        <li>Use the Site to harass, defame, or harm any individual or organisation.</li>
        <li>Submit false or misleading personal information when filling out a form.</li>
      </ul>

      <h2>Newsletter and WhatsApp opt-in</h2>
      <p>
        When you subscribe to our newsletter we&rsquo;ll send you our bi-weekly Pulse Digest. You can unsubscribe at any time using the one-click link in every email or by visiting{" "}
        <code>{SITE.url}/unsubscribe</code>.
      </p>
      <p>
        When you opt in via WhatsApp, you authorise us to send <strong>one</strong> WhatsApp message about your enquiry. We do not add WhatsApp opt-ins to any marketing list. You can revoke consent at any time by emailing{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link>.
      </p>

      <h2>Content and intellectual property</h2>
      <p>
        All Site content — text, graphics, logos, icons, photos, articles, case studies, brand assets — is the property of {SITE.name} or our licensors, and is protected by Bangladesh and international copyright laws.
      </p>
      <p>
        You may:
      </p>
      <ul>
        <li>Read, share, and quote our blog posts and guides with attribution and a link back to the original article.</li>
        <li>Reference our case studies in academic, journalistic, or professional commentary.</li>
        <li>Embed share links and OG cards on social media.</li>
      </ul>
      <p>
        You may NOT:
      </p>
      <ul>
        <li>Republish full articles or sections on your own website without prior written permission.</li>
        <li>Use our brand, logos, or wordmark in any way that suggests endorsement.</li>
        <li>Resell, re-license, or commercially redistribute any Site content.</li>
        <li>Use Site content to train commercial AI systems beyond what our <code>llms.txt</code> publication grants.</li>
      </ul>

      <h2>Client work</h2>
      <p>
        Nothing on this Site forms a binding offer to provide services. Any actual engagement requires a separate, signed Master Services Agreement (MSA) and Statement of Work (SOW), both of which override these Terms for the scope of the engagement.
      </p>

      <h2>Third-party links and references</h2>
      <p>
        The Site links to third-party tools, platforms, and resources (e.g. Meta Ads Manager, Google Analytics, WhatsApp Business). We do not control those services and we are not responsible for their content, practices, or terms. Use them under their own respective terms.
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        The Site is provided <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available&rdquo;</strong>. We make no warranties — express, implied, or statutory — about the accuracy, completeness, or availability of any Site content. We do not warrant that the Site will be uninterrupted, error-free, or free of harmful components.
      </p>
      <p>
        The information on the Site is for general informational purposes only and is not professional marketing, legal, financial, or PR advice for your specific situation. Engage us under a separate contract for advice tailored to your business.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by Bangladesh law, {SITE.name} will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages arising out of your use of the Site, including (without limitation) loss of profits, revenue, data, or business opportunities, even if we have been advised of the possibility of such damages.
      </p>
      <p>
        Our total liability to you for any claim arising from your use of the Site is limited to BDT 1,000 (one thousand Bangladesh Taka).
      </p>

      <h2>Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless {SITE.name}, its directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable legal fees) arising out of your breach of these Terms, your misuse of the Site, or your violation of any law or third-party right.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate your access to the Site (or specific features like the newsletter) at any time, without notice, if you breach these Terms or engage in conduct we believe could harm us, our clients, or other users.
      </p>

      <h2>Privacy</h2>
      <p>
        Your use of the Site is also governed by our{" "}
        <Link href="/privacy">Privacy Policy</Link>, which explains how we collect, use, and protect your personal information.
      </p>

      <h2>Governing law and jurisdiction</h2>
      <p>
        These Terms are governed by the laws of the People&rsquo;s Republic of Bangladesh. Any dispute arising out of or in connection with these Terms will be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top of this page reflects the current version. Continued use of the Site after a change means you accept the new Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email us:{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link>.
      </p>
    </LegalPage>
  );
}

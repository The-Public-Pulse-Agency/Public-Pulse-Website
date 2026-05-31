import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site";

const EFFECTIVE_DATE = "2026-05-31";

export const revalidate = 86400; // daily

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Public Pulse Agency",
  description:
    "How Public Pulse Agency collects, uses, stores and protects your personal data — email, phone, browsing data, and OAuth grants. Bangladesh-based, transparent, opt-out at any time.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy"
      eyebrow="Legal"
      intro="How we collect, use, store and protect your personal data. Written in plain English — not legalese — so you actually know what's happening."
      effectiveDate={EFFECTIVE_DATE}
    >
      <h2>Who we are</h2>
      <p>
        <strong>{SITE.name}</strong> (&ldquo;Public Pulse&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a digital marketing and political PR agency based in Dhaka, Bangladesh. We are a registered business entity (BIN <code>{SITE.contact.legal.bin}</code>, Trade Licence <code>{SITE.contact.legal.tradeLicense}</code>). We are the <strong>data controller</strong> for the personal information described in this policy.
      </p>
      <p>
        Contact for any privacy question, request, or complaint:{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link> · {SITE.contact.phoneDisplay} · Dhaka, Bangladesh.
      </p>

      <h2>What this policy covers</h2>
      <p>
        This policy applies to <code>https://publicpulse.com.bd</code> and all sub-pages, as well as services we provide to clients. It does not apply to third-party sites we link to.
      </p>

      <h2>What we collect</h2>

      <h3>Information you give us directly</h3>
      <ul>
        <li>
          <strong>Contact form</strong> (<code>/contact</code>): your name, email, phone, the service you&rsquo;re interested in, and the message you write.
        </li>
        <li>
          <strong>Newsletter signup</strong>: your email address, the language you signed up in, and the page you signed up from.
        </li>
        <li>
          <strong>WhatsApp opt-in</strong>: your phone number, an optional note, and your explicit consent (stored verbatim for audit) to receive a one-time WhatsApp message from us.
        </li>
        <li>
          <strong>Client engagements</strong>: when you become a paying client, the business and project details you share with us as part of the engagement, agreed separately in a Master Services Agreement.
        </li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Cookies and analytics</strong>: we use Google Tag Manager (<code>{SITE.tracking.gtm}</code>), Google Analytics 4 (<code>{SITE.tracking.ga4}</code>) and Meta Pixel (<code>{SITE.tracking.metaPixel}</code>) to understand how visitors use our site. This includes pages visited, time on page, approximate location (city / country level), device type, and referring source.
        </li>
        <li>
          <strong>Server logs</strong>: when you visit the site, our hosting (AWS CloudFront + Lambda) records your IP address, user agent, and the URLs you request. We retain these for 7 days, then they are automatically deleted.
        </li>
        <li>
          <strong>Spam-prevention hashes</strong>: when you submit the contact form or subscribe, we hash your IP address with a daily-rotating salt (SHA-256, first 40 chars) for rate-limiting. We <strong>do not store your raw IP address</strong> alongside your submission.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to enquiries you send through the contact form.</li>
        <li>To send the bi-weekly Pulse Digest email (only after you confirm via double opt-in).</li>
        <li>To send a one-time WhatsApp message when you opt in via the WhatsApp capture form — never a marketing list.</li>
        <li>To measure how the site is being used so we can improve it.</li>
        <li>To detect and block spam, abuse, and security threats.</li>
        <li>To meet our legal and regulatory obligations under Bangladesh law.</li>
      </ul>
      <p>
        We <strong>do not</strong> sell your personal data. We <strong>do not</strong> share it with third parties for their independent marketing.
      </p>

      <h2>How long we keep it</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Retention</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Contact form submission</td>
            <td>3 years from last interaction, then deleted</td>
          </tr>
          <tr>
            <td>Newsletter subscriber (active)</td>
            <td>For as long as you remain subscribed</td>
          </tr>
          <tr>
            <td>Newsletter subscriber (unsubscribed)</td>
            <td>30 days after unsubscribe, then deleted</td>
          </tr>
          <tr>
            <td>WhatsApp opt-in</td>
            <td>90 days from opt-in, then deleted unless you become a client</td>
          </tr>
          <tr>
            <td>Server access logs</td>
            <td>7 days</td>
          </tr>
          <tr>
            <td>Analytics (GA4, Meta Pixel)</td>
            <td>14 months (Google&rsquo;s default), then automatically purged</td>
          </tr>
          <tr>
            <td>Client engagement records (post-contract)</td>
            <td>7 years (Bangladesh tax + corporate-record requirement)</td>
          </tr>
        </tbody>
      </table>

      <h2>Who we share it with</h2>
      <p>We use a small number of carefully chosen third-party services. They process data on our behalf under their respective data-processing terms:</p>
      <ul>
        <li>
          <strong>Neon (Postgres hosting)</strong> — stores newsletter subscribers, contact submissions, WhatsApp opt-ins. Region: Asia-Pacific (Singapore).
        </li>
        <li>
          <strong>Resend (email delivery)</strong> — delivers transactional and newsletter emails to your inbox.
        </li>
        <li>
          <strong>AWS (CloudFront, Lambda, S3)</strong> — serves the website. Region: Asia-Pacific (Singapore).
        </li>
        <li>
          <strong>Google Analytics 4 + Google Tag Manager</strong> — anonymised usage analytics.
        </li>
        <li>
          <strong>Meta Pixel</strong> — measures the performance of any Facebook / Instagram advertising we run for ourselves or our clients (when you visit a page on our own site only).
        </li>
      </ul>
      <p>
        We will share your personal information with law enforcement or government bodies <strong>only when legally required</strong> by a valid court order or regulatory request under Bangladesh law, and only the minimum necessary information.
      </p>

      <h2>Your rights</h2>
      <p>You can, at any time, ask us to:</p>
      <ul>
        <li><strong>Access</strong> the personal data we hold about you.</li>
        <li><strong>Correct</strong> data that is inaccurate or out of date.</li>
        <li><strong>Delete</strong> your personal data — see our <Link href="/data-deletion">User Data Deletion</Link> page for the full process.</li>
        <li><strong>Export</strong> your data in a portable format (CSV / JSON).</li>
        <li><strong>Withdraw consent</strong> for any processing that relies on consent (e.g. newsletter, WhatsApp opt-in).</li>
        <li><strong>Object</strong> to processing for direct marketing — one-click unsubscribe is in every email we send.</li>
      </ul>
      <p>
        To exercise any of these rights, email us at{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link>. We respond within 30 days.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies for analytics (GA4, GTM) and ad-conversion measurement (Meta Pixel). No cookies are used to personally identify you across other websites. You can disable cookies in your browser at any time without losing access to the site.
      </p>

      <h2>Security</h2>
      <p>We protect your data with:</p>
      <ul>
        <li>HTTPS / TLS for every page and API call.</li>
        <li>Encrypted database connections + at-rest encryption (Neon + AWS KMS).</li>
        <li>Honeypot fields and rate-limiting on every form to block bots.</li>
        <li>Strict access controls — only the agency owner has admin access.</li>
        <li>Secrets stored in AWS Systems Manager Parameter Store (encrypted), never in code.</li>
      </ul>

      <h2>Children</h2>
      <p>
        We do not knowingly collect personal data from anyone under 18. If you believe a child has submitted data to us, email{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link> and we will delete it.
      </p>

      <h2>International transfers</h2>
      <p>
        Our infrastructure is hosted in Singapore (AWS ap-southeast-1, Neon ap-southeast-1). When you submit data to us from outside Bangladesh, it is transferred and stored in Singapore.
      </p>

      <h2>Third-party login / OAuth</h2>
      <p>
        If you sign in to any service we run that uses Facebook Login, Google Login, LinkedIn, or another OAuth provider, we only receive the basic profile information you authorise (typically: name, email, profile picture, public profile URL). We do not request access to your friends list, private messages, contacts, or files. You can revoke our access at any time from the provider&rsquo;s account settings, or by following our{" "}
        <Link href="/data-deletion">User Data Deletion</Link> instructions.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We&rsquo;ll update this page if our practices change. The &ldquo;Last updated&rdquo; date at the top of this page always reflects the current version. Material changes will also be announced in the next bi-weekly newsletter and via a notice on the website for at least 14 days.
      </p>

      <h2>Complaints</h2>
      <p>
        If you believe we have mishandled your personal information, please contact us first at{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link> so we can put it right. You also have the right to raise a complaint with the relevant data-protection authority in your country.
      </p>
    </LegalPage>
  );
}

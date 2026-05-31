import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site";

const EFFECTIVE_DATE = "2026-05-31";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "User Data Deletion | Public Pulse Agency",
  description:
    "How to request deletion of personal data Public Pulse Agency holds about you — email, phone, contact submissions, OAuth grants. We confirm within 30 days.",
  path: "/data-deletion",
});

export default function DataDeletionPage() {
  return (
    <LegalPage
      title="User Data Deletion"
      path="/data-deletion"
      eyebrow="Privacy"
      intro="How to ask us to delete the personal data we hold about you. One email and we'll have it confirmed within 30 days."
      effectiveDate={EFFECTIVE_DATE}
    >
      <h2>Your right to deletion</h2>
      <p>
        You can request deletion of any personal data <strong>{SITE.name}</strong> holds about you at any time. We confirm receipt within 7 days and complete the deletion within 30 days. There is no fee.
      </p>

      <h2>Quick options — pick whichever applies</h2>

      <h3>Newsletter only</h3>
      <p>
        Click the &ldquo;Unsubscribe&rdquo; link at the bottom of any email we&rsquo;ve sent you. Within 24 hours your email is removed from active sends and within 30 days the row itself is deleted from our database. No further action is needed.
      </p>
      <p>
        You can also visit <code>{SITE.url}/unsubscribe</code> if you still have a valid unsubscribe token (every email includes one).
      </p>

      <h3>Contact form submission</h3>
      <p>
        Email{" "}
        <Link href={`mailto:${SITE.contact.email}?subject=Data%20deletion%20request%20%E2%80%94%20contact%20form`}>
          {SITE.contact.email}
        </Link>{" "}
        with the subject &ldquo;Data deletion request &mdash; contact form&rdquo; and include the email address you originally used. We&rsquo;ll find and delete the submission.
      </p>

      <h3>WhatsApp opt-in</h3>
      <p>
        Email{" "}
        <Link href={`mailto:${SITE.contact.email}?subject=Data%20deletion%20request%20%E2%80%94%20WhatsApp%20opt-in`}>
          {SITE.contact.email}
        </Link>{" "}
        with the subject &ldquo;Data deletion request &mdash; WhatsApp opt-in&rdquo; and include the phone number you used. We delete the row + the consent record together.
      </p>

      <h3>OAuth / Social-login grants (Facebook, Google, LinkedIn)</h3>
      <p>
        If you have used Facebook Login, Google Sign-In, LinkedIn, or any other OAuth provider to access a Public Pulse-run service:
      </p>
      <ol>
        <li>
          Revoke our access from the provider directly:
          <ul>
            <li>
              <strong>Facebook</strong>:{" "}
              <Link href="https://www.facebook.com/settings?tab=business_tools" rel="noopener" target="_blank">
                Settings &rsaquo; Business Integrations
              </Link>{" "}
              &rsaquo; find &ldquo;Public Pulse&rdquo; &rsaquo; Remove.
            </li>
            <li>
              <strong>Google</strong>:{" "}
              <Link href="https://myaccount.google.com/permissions" rel="noopener" target="_blank">
                Google Account &rsaquo; Third-party apps with account access
              </Link>{" "}
              &rsaquo; find &ldquo;Public Pulse&rdquo; &rsaquo; Remove access.
            </li>
            <li>
              <strong>LinkedIn</strong>:{" "}
              <Link href="https://www.linkedin.com/psettings/permitted-services" rel="noopener" target="_blank">
                LinkedIn Settings &rsaquo; Data Privacy &rsaquo; Permitted services
              </Link>{" "}
              &rsaquo; find &ldquo;Public Pulse&rdquo; &rsaquo; Remove.
            </li>
          </ul>
        </li>
        <li>
          Then email{" "}
          <Link href={`mailto:${SITE.contact.email}?subject=Data%20deletion%20request%20%E2%80%94%20OAuth`}>
            {SITE.contact.email}
          </Link>{" "}
          with the subject &ldquo;Data deletion request &mdash; OAuth&rdquo; so we can also purge any cached profile data and audit logs from our side.
        </li>
      </ol>

      <h3>Everything &mdash; full account erasure</h3>
      <p>
        If you want every trace of yourself deleted from our systems (newsletter + contact submissions + WhatsApp opt-in + any client engagement records that aren&rsquo;t under legal retention), email{" "}
        <Link href={`mailto:${SITE.contact.email}?subject=Full%20data%20deletion%20request`}>{SITE.contact.email}</Link>{" "}
        with subject &ldquo;Full data deletion request&rdquo;.
      </p>

      <h2>What information to include</h2>
      <p>To find your record quickly, please include at minimum:</p>
      <ul>
        <li>The email address you used (essential)</li>
        <li>The phone number, if you opted in via WhatsApp</li>
        <li>The approximate date you contacted us, if you remember</li>
        <li>The OAuth provider name, if you used social login</li>
      </ul>
      <p>
        We do not require you to prove your identity through a copy of your ID. We rely on you having access to the email address on file (we will reply to that address only).
      </p>

      <h2>Our process and timing</h2>
      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Acknowledge your request</td>
            <td>Within 7 days</td>
          </tr>
          <tr>
            <td>Locate all matching records (subscribers, leads, WhatsApp opt-ins, audit logs)</td>
            <td>Within 14 days</td>
          </tr>
          <tr>
            <td>Delete the records + confirm in writing</td>
            <td>Within 30 days</td>
          </tr>
          <tr>
            <td>Backups containing your data overwritten by retention rotation</td>
            <td>Within 90 days</td>
          </tr>
        </tbody>
      </table>

      <h2>What we may have to keep</h2>
      <p>
        We will delete everything we legally can. A few things we may have to retain for a limited period:
      </p>
      <ul>
        <li>
          <strong>Invoices and engagement records</strong> (only if you were a paying client): Bangladesh tax law requires us to retain financial records for 7 years.
        </li>
        <li>
          <strong>Anonymised analytics</strong>: aggregated, non-identifying data we already extracted (e.g. &ldquo;3,400 unique visitors to /services/political-pr in May&rdquo;) cannot be reverse-engineered back to you. We do not delete the aggregate.
        </li>
        <li>
          <strong>Email audit logs</strong>: when an email is sent, the delivery log (recipient address + status) lives in Resend for 30 days. After that it expires automatically.
        </li>
      </ul>
      <p>
        Once a retention obligation expires, the data is purged on its normal schedule. We will always tell you up-front what (if anything) we have to keep and for how long.
      </p>

      <h2>Confirmation</h2>
      <p>
        When the deletion is complete, you&rsquo;ll receive a written confirmation by email listing exactly what was deleted, what (if anything) was retained under a legal obligation, and when the retained items will themselves be deleted.
      </p>

      <h2>If we can&rsquo;t complete the deletion</h2>
      <p>
        In the rare cases we cannot honour a deletion (e.g. an ongoing legal proceeding, or a recent client invoice still within Bangladesh tax-record retention), we will tell you in writing, explain the specific reason, give you the date when the obligation lifts, and offer the partial deletion we can complete now.
      </p>

      <h2>Complaints</h2>
      <p>
        If you&rsquo;re unhappy with how we handle your deletion request, contact us first at{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link> so we can resolve it. You also have the right to raise a complaint with the relevant data-protection authority in your country.
      </p>

      <h2>Get in touch</h2>
      <p>
        <strong>Email</strong>:{" "}
        <Link href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</Link>
        <br />
        <strong>Phone / WhatsApp</strong>: {SITE.contact.phoneDisplay}
        <br />
        <strong>Post</strong>: {SITE.name}, Dhaka, Bangladesh
      </p>
    </LegalPage>
  );
}

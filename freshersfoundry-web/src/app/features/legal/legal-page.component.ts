import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="legal-page">
      <div class="legal-card">
        <p class="eyebrow">FreshersFoundry</p>
        <h1>{{ title }}</h1>

        <div class="legal-content" [innerHTML]="content"></div>
      </div>
    </section>
  `,
  styles: [
    `
      .legal-page {
        max-width: 980px;
        margin: 0 auto;
        padding: 2rem 0 4rem;
      }

      .legal-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
        padding: 2rem;
      }

      .eyebrow {
        margin: 0 0 0.6rem;
        color: #4f46e5;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0 0 1.5rem;
        font-size: clamp(2rem, 4vw, 2.8rem);
        color: #0f172a;
      }

      .legal-content {
        color: #334155;
        line-height: 1.8;
      }

      .legal-content h2,
      .legal-content h3,
      .legal-content h4 {
        color: #0f172a;
        margin-top: 1.5rem;
        margin-bottom: 0.6rem;
      }

      .legal-content p,
      .legal-content li {
        margin: 0.5rem 0;
      }

      .legal-content ul,
      .legal-content ol {
        padding-left: 1.5rem;
      }

      .legal-content a {
        color: #4f46e5;
      }

      @media (max-width: 640px) {
        .legal-card {
          padding: 1.25rem;
        }
      }
    `
  ]
})
export class LegalPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly type = this.route.snapshot.data['type'] as string;

  readonly titleMap: Record<string, string> = {
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions',
    'cookie-policy': 'Cookie Policy'
  };

  readonly contentMap: Record<string, string> = {
    'privacy-policy': `
      <p><strong>Effective Date:</strong> August 14, 2026</p>
      <p><strong>Last Updated:</strong> August 14, 2026</p>
      <p>Welcome to FreshersFoundry (“Platform,” “we,” “us,” or “our”). We value your trust and are dedicated to safeguarding the personal information you share with us. This Privacy Policy details how we handle the collection, use, storage, and protection of your data when you access our website and related services.</p>
      <h2>1. Scope of This Policy</h2>
      <p>This policy applies to all visitors, registered candidates, content creators, and administrators who use FreshersFoundry. By accessing our platform, you acknowledge and agree to the data practices described herein.</p>
      <h2>2. Information We Collect</h2>
      <p>We collect information directly from you when you interact with our platform:</p>
      <ul>
        <li><strong>Account & Authentication Details:</strong> full name, email address, encrypted credentials, and login identifiers.</li>
        <li><strong>User-Generated Content:</strong> interview experiences, blogs, interview questions, comments, and bookmarks.</li>
        <li><strong>Technical & Usage Logs:</strong> IP address, browser, device information, referrer URLs, and usage timestamps.</li>
      </ul>
      <h2>3. How Your Information Is Used</h2>
      <p>Your information is used to authenticate account access, publish community content, moderate submissions, prevent fraud, and improve platform reliability.</p>
      <h2>4. Third-Party Links</h2>
      <p>FreshersFoundry may link to third-party employers and career portals. Once you leave our domain, your data is handled by those external sites according to their own policies.</p>
      <h2>5. Data Disclosure & Sharing</h2>
      <p>We do not sell personal data. We may share limited data with trusted infrastructure providers or when required by law.</p>
      <h2>6. Security Measures</h2>
      <p>We use industry-standard security practices, including HTTPS, password hashing, and secure authentication workflows. No system is fully risk-free, but we take reasonable steps to protect your data.</p>
      <h2>7. User Rights</h2>
      <p>You may request access, correction, or deletion of your account data by contacting our support team.</p>
      <h2>8. Contact</h2>
      <p>Email: <a href="mailto:support@freshersfoundry.com">support@freshersfoundry.com</a></p>
    `,
    'terms-conditions': `
      <p><strong>Effective Date:</strong> August 14, 2026</p>
      <p><strong>Last Updated:</strong> August 14, 2026</p>
      <p>Please read these Terms and Conditions (“Terms”) thoroughly before accessing or using the FreshersFoundry website and associated services.</p>
      <h2>1. Acceptance & Agreement</h2>
      <p>By accessing, browsing, or creating an account, you agree to comply with these Terms.</p>
      <h2>2. Account Responsibilities</h2>
      <ul>
        <li>You agree to provide accurate registration details.</li>
        <li>You are responsible for keeping your account secure.</li>
        <li>You may not bypass authentication, scrape data, or upload harmful content.</li>
      </ul>
      <h2>3. User-Generated Content</h2>
      <p>You retain ownership of your submissions, but you grant FreshersFoundry a non-exclusive license to host and display them.</p>
      <h2>4. Job Listings</h2>
      <p>Job opportunities are provided for informational purposes only and do not guarantee employment or interviews.</p>
      <h2>5. Intellectual Property</h2>
      <p>FreshersFoundry branding, platform design, code, and curated content are protected by law.</p>
      <h2>6. Termination</h2>
      <p>We may suspend or terminate accounts that violate platform rules or abuse the community.</p>
      <h2>7. Disclaimer</h2>
      <p>The platform is provided “as is” without warranties of any kind. We are not liable for indirect or consequential damages arising from use of the service.</p>
      <h2>8. Contact</h2>
      <p>Email: <a href="mailto:legal@freshersfoundry.com">legal@freshersfoundry.com</a></p>
    `,
    'cookie-policy': `
      <p><strong>Effective Date:</strong> August 14, 2026</p>
      <p><strong>Last Updated:</strong> August 14, 2026</p>
      <p>FreshersFoundry uses cookies and similar technologies to improve the user experience, analyze traffic, and keep the platform secure.</p>
      <h2>What We Use Cookies For</h2>
      <ul>
        <li>To remember your login session and preferences</li>
        <li>To understand platform usage patterns and improve functionality</li>
        <li>To protect the site against abuse and security threats</li>
      </ul>
      <h2>Your Choices</h2>
      <p>You can disable cookies in your browser settings, but some features of the platform may not function properly as a result.</p>
      <h2>Contact</h2>
      <p>Email: <a href="mailto:support@freshersfoundry.com">support@freshersfoundry.com</a></p>
    `
  };

  get title(): string {
    return this.titleMap[this.type] ?? 'Legal Information';
  }

  get content(): string {
    return this.contentMap[this.type] ?? '<p>Content not available.</p>';
  }
}

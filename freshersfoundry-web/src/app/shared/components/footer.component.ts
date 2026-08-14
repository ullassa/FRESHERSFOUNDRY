import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <!-- Main Footer Content -->
        <div class="footer-content">
          <!-- Brand Section -->
          <div class="footer-section">
            <h3>FreshersFoundry</h3>
            <p class="brand-description">
              Your ultimate platform for interview prep, real experiences, and fresh graduate opportunities.
            </p>
            <div class="social-links">
              <a href="#" class="social-icon" title="Twitter">𝕏</a>
              <a href="#" class="social-icon" title="LinkedIn">in</a>
              <a href="#" class="social-icon" title="GitHub">GH</a>
              <a href="#" class="social-icon" title="Instagram">📷</a>
            </div>
          </div>

          <!-- Products Section -->
          <div class="footer-section">
            <h4>Products</h4>
            <ul>
              <li><a routerLink="/jobs">Jobs Board</a></li>
              <li><a routerLink="/interview-experiences">Interview Experiences</a></li>
              <li><a routerLink="/questions">Interview Questions</a></li>
              <li><a routerLink="/blogs">Blogs & Guides</a></li>
            </ul>
          </div>

          <!-- Company Section -->
          <div class="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a routerLink="/">About Us</a></li>
              <li><a routerLink="/blogs">Blog</a></li>
              <li><a href="mailto:support@freshersfoundry.com">Contact Us</a></li>
              <li><a routerLink="/jobs">Careers</a></li>
            </ul>
          </div>

          <!-- Resources Section -->
          <div class="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a routerLink="/interview-questions">Interview Questions</a></li>
              <li><a routerLink="/interview-experiences">Interview Experiences</a></li>
              <li><a routerLink="/blogs">Community</a></li>
              <li><a href="mailto:support@freshersfoundry.com">Support</a></li>
            </ul>
          </div>

          <!-- Legal Section -->
          <div class="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="http://localhost:4200/privacy-policy" target="_self">Privacy Policy</a></li>
              <li><a href="http://localhost:4200/terms-and-conditions" target="_self">Terms & Conditions</a></li>
              <li><a href="http://localhost:4200/cookie-policy" target="_self">Cookie Policy</a></li>
              <li><a href="http://localhost:4200/privacy-policy" target="_self">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p>&copy; 2026 FreshersFoundry. All rights reserved.</p>
            <p class="footer-tagline">Made with ❤️ for freshers everywhere</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #0f172a;
      color: #e2e8f0;
      padding: 3rem 1rem;
      margin-top: 4rem;
      border-top: 1px solid #1e293b;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #f1f5f9;
    }

    .footer-section h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #f1f5f9;
    }

    .brand-description {
      font-size: 0.875rem;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 1rem;
    }

    .social-links {
      display: flex;
      gap: 0.75rem;
    }

    .social-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: #1e293b;
      border-radius: 8px;
      color: #64748b;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .social-icon:hover {
      background-color: #4f46e5;
      color: #ffffff;
      transform: translateY(-2px);
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 0.75rem;
    }

    .footer-section a {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s ease;
    }

    .footer-section a:hover {
      color: #4f46e5;
    }

    .footer-bottom {
      border-top: 1px solid #1e293b;
      padding-top: 2rem;
      text-align: center;
    }

    .footer-bottom-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .footer-tagline {
      font-weight: 500;
      color: #4f46e5;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .footer {
        padding: 2rem 1rem;
        margin-top: 2rem;
      }

      .footer-content {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }

      .footer-section h3 {
        font-size: 1.25rem;
      }

      .footer-section h4 {
        font-size: 0.95rem;
      }

      .footer-bottom-content {
        flex-direction: column;
        gap: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .footer {
        padding: 1.5rem 1rem;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .social-links {
        justify-content: flex-start;
      }
    }
  `]
})
export class FooterComponent {}

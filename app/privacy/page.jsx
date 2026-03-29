import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Privacy Policy — Maîtrepets',
  description: 'How Maîtrepets collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F5F2] pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <Link href="/" className="text-sm text-gold hover:text-[#7a560f] transition-colors">← Back to home</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                <p>Maîtrepets ("we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit maitrepets.com and make purchases through our platform. Please read this policy carefully. If you disagree with its terms, please discontinue use of the site.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                <p className="mb-3 font-medium text-gray-800">Information you provide directly:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm mb-4">
                  <li><strong>Account information:</strong> Name, email address, password (hashed — we never store plain-text passwords)</li>
                  <li><strong>Shipping information:</strong> Name, delivery address, phone number (for order fulfillment only)</li>
                  <li><strong>Pet photos:</strong> Images you upload to generate portraits</li>
                  <li><strong>Communications:</strong> Messages you send to our support team</li>
                </ul>
                <p className="mb-3 font-medium text-gray-800">Information collected automatically:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>IP address and general location (country/region)</li>
                  <li>Browser type, device type, and operating system</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Referring URL</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>To create and manage your account</li>
                  <li>To generate AI artwork from your uploaded pet photos</li>
                  <li>To process and fulfill your print orders through Printful</li>
                  <li>To process payments through Stripe</li>
                  <li>To send order confirmations and shipping updates by email</li>
                  <li>To respond to customer service inquiries</li>
                  <li>To improve and optimize our AI generation models and website</li>
                  <li>To detect and prevent fraud or abuse</li>
                  <li>To comply with applicable laws and regulations</li>
                </ul>
                <p className="mt-3 text-sm">We do not sell your personal information to third parties. We do not use your data for advertising targeting outside of Maîtrepets.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Service Providers</h2>
                <p className="mb-3">We share information with trusted third parties only as necessary to operate our service:</p>
                <div className="space-y-3">
                  {[
                    { name: 'Printful Inc.', use: 'Print fulfillment and shipping. Your name and shipping address are shared to fulfill physical orders.', link: 'https://www.printful.com/policies/privacy' },
                    { name: 'Stripe Inc.', use: 'Payment processing. Your payment card details go directly to Stripe — we never see or store them.', link: 'https://stripe.com/privacy' },
                    { name: 'OpenAI', use: 'AI image generation. Your pet photo description (not the photo itself in most flows) is processed by OpenAI APIs.', link: 'https://openai.com/privacy' },
                    { name: 'Replicate', use: 'AI image generation. Image data may be processed via Replicate infrastructure.', link: 'https://replicate.com/privacy' },
                    { name: 'Amazon Web Services (AWS)', use: 'Cloud storage for generated images. Images are stored in encrypted S3 buckets.', link: 'https://aws.amazon.com/privacy/' },
                    { name: 'Neon / PostgreSQL', use: 'Secure database hosting for your account and order records.', link: null },
                    { name: 'Vercel', use: 'Web hosting and infrastructure.', link: 'https://vercel.com/legal/privacy-policy' },
                  ].map((p) => (
                    <div key={p.name} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{p.use}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. Pet Photos & AI Data</h2>
                <p className="mb-2">Photos you upload are stored securely on AWS S3 and used solely to generate your AI portrait. We do not use your pet photos to train AI models without your explicit consent. Generated images are stored and associated with your account so you can access them from your dashboard.</p>
                <p className="text-sm text-gray-500">If you delete your account, we will delete your uploaded photos and generated images within 30 days.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
                <p>We use strictly necessary cookies to keep you logged in (session token stored in an HttpOnly cookie). We do not currently use advertising cookies or tracking pixels. You can disable cookies in your browser settings, but this will prevent you from staying logged in.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
                <p>We retain your account data for as long as your account is active. Order records are retained for 7 years for tax and legal compliance. You may request deletion of your account and associated data at any time by emailing <a href="mailto:hello@maitrepets.com" className="text-gold hover:underline">hello@maitrepets.com</a>.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights (GDPR & CCPA)</h2>
                <p className="mb-2">Depending on your location, you may have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                  <li><strong>Portability:</strong> Request your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Opt out of any marketing communications at any time</li>
                </ul>
                <p className="mt-2 text-sm">To exercise any of these rights, email <a href="mailto:hello@maitrepets.com" className="text-gold hover:underline">hello@maitrepets.com</a>. We will respond within 30 days.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">9. Data Security</h2>
                <p>We implement industry-standard security measures including HTTPS encryption, hashed passwords (bcrypt), and access-controlled cloud infrastructure. No method of transmission over the internet is 100% secure, but we take reasonable precautions to protect your information.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">10. Children's Privacy</h2>
                <p>Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, contact us immediately.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Your continued use of the service after changes constitute your acceptance of the new policy.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact Us</h2>
                <p>For privacy questions or requests, contact us at: <a href="mailto:hello@maitrepets.com" className="text-gold hover:underline">hello@maitrepets.com</a></p>
              </section>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}

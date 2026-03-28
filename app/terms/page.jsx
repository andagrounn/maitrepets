import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Terms of Service — Maîtrepets',
  description: 'Terms and conditions for using Maîtrepets.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F5F2] pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <Link href="/" className="text-sm text-purple-600 hover:text-purple-800 transition-colors">← Back to home</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
                <p>By accessing or using Maîtrepets ("we," "us," "our") at maitrepets.com, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any of these terms, you are prohibited from using this site. Maîtrepets is operated by Maîtrepets LLC.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
                <p>Maîtrepets provides an AI-powered pet portrait service. You upload a photo of your pet, select an art style, and our platform generates a digital artwork using artificial intelligence. You may then purchase a physical printed product (framed or unframed) or a digital HD download. Physical products are fulfilled and shipped by our fulfillment partner, Printful Inc.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
                <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. You must be at least 18 years old to create an account and place orders. We reserve the right to terminate accounts that violate these terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
                <p className="mb-2">You agree not to use Maîtrepets to:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>Upload photos of people without their explicit consent</li>
                  <li>Upload any content that is illegal, obscene, or infringes on third-party intellectual property</li>
                  <li>Attempt to reverse-engineer, scrape, or abuse our AI generation systems</li>
                  <li>Resell or redistribute AI-generated artwork for commercial purposes without written permission</li>
                  <li>Use automated systems to access the service in a manner that sends more requests than a human could reasonably produce</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. Intellectual Property & AI-Generated Content</h2>
                <p className="mb-2">When you upload a pet photo and generate artwork through our service:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>You retain ownership of your original uploaded photo</li>
                  <li>AI-generated artwork is granted to you for personal, non-commercial use</li>
                  <li>You may print and display the artwork for personal use</li>
                  <li>Commercial use (selling prints, licensing, etc.) requires a separate written agreement with us</li>
                  <li>Maîtrepets retains the right to use anonymized, aggregated outputs for service improvement</li>
                </ul>
                <p className="mt-2 text-sm text-gray-500">AI-generated images are produced using third-party models (OpenAI DALL·E, Replicate). Results may vary and are not guaranteed to exactly match expectations.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Orders & Fulfillment</h2>
                <p className="mb-2">Physical products (framed prints, paper prints) are fulfilled by Printful Inc. on our behalf. By placing an order:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>You agree that your order data (name, shipping address) will be shared with Printful for fulfillment</li>
                  <li>Standard production time is 3–5 business days; delivery is 7–10 business days for US orders</li>
                  <li>Shipping times are estimates and not guaranteed</li>
                  <li>We are not responsible for delays caused by carriers, customs, or natural events</li>
                  <li>International orders may be subject to import duties and taxes, payable by the recipient</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payments</h2>
                <p>All payments are processed securely through Stripe Inc. We do not store your credit card information. Prices are listed in USD. By completing a purchase, you authorize us to charge the stated amount to your selected payment method. All sales are final except as described in our <Link href="/refund" className="text-purple-600 hover:underline">Refund Policy</Link>.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">8. Refunds & Returns</h2>
                <p>Please review our <Link href="/refund" className="text-purple-600 hover:underline">Refund Policy</Link> for full details. In summary: digital purchases (HD downloads) and AI generations are non-refundable once delivered. Physical products that arrive damaged or defective are eligible for a replacement or refund. Regeneration is only offered as part of a damaged-print replacement process.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
                <p>Maîtrepets is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that AI-generated results will meet your specific expectations. AI output is inherently variable.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, Maîtrepets and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability to you for any claim arising from these terms shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. We will notify users of material changes by updating the "last updated" date at the top of this page. Your continued use of the service after any changes constitutes acceptance of the new terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
                <p>These Terms shall be governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact Us</h2>
                <p>For questions about these Terms, contact us at: <a href="mailto:hello@maitrepets.com" className="text-purple-600 hover:underline">hello@maitrepets.com</a></p>
              </section>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}

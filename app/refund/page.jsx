import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Refund Policy — Maîtrepets',
  description: 'Maîtrepets refund, return, and exchange policy for prints and digital products.',
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F5F2] pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <Link href="/" className="text-sm text-purple-600 hover:text-purple-800 transition-colors">← Back to home</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Refund Policy</h1>
            <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            {/* Summary boxes */}
            <div className="grid sm:grid-cols-3 gap-3 mb-10">
              {[
                { icon: '🖼️', title: 'Damaged Prints', desc: 'Full replacement or refund if your order arrives damaged or defective' },
                { icon: '🎨', title: 'AI Generation', desc: 'Regeneration only as part of a damaged-print replacement — not for style preference' },
                { icon: '💾', title: 'Digital Downloads', desc: 'Non-refundable once the file has been delivered' },
              ].map((b) => (
                <div key={b.title} className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{b.icon}</div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{b.title}</p>
                  <p className="text-xs text-gray-500 leading-snug">{b.desc}</p>
                </div>
              ))}
            </div>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Physical Print Orders</h2>
                <p className="mb-3">All physical products (framed canvas prints) are custom-made to order and fulfilled by our partner Printful Inc. Because each item is produced on demand, we cannot accept returns for buyer's remorse or ordering the wrong size.</p>

                <h3 className="font-semibold text-gray-800 mb-2">Eligible for Refund or Replacement:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm mb-4">
                  <li>Item arrives damaged, broken, or with a manufacturing defect</li>
                  <li>Item is significantly different from what was ordered (wrong size, wrong product)</li>
                  <li>Item is lost in transit and not delivered within 30 days of order date</li>
                </ul>

                <h3 className="font-semibold text-gray-800 mb-2">Not Eligible for Refund:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm mb-4">
                  <li>Dissatisfaction with the AI-generated artwork style or result</li>
                  <li>Incorrect shipping address provided by the customer</li>
                  <li>Order refused by customs (international orders)</li>
                  <li>Minor color variation due to monitor calibration differences</li>
                </ul>

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
                  <strong>How to request a refund:</strong> Email <a href="mailto:hello@maitrepets.com" className="text-purple-600 hover:underline">hello@maitrepets.com</a> within <strong>14 days of delivery</strong> with your order number and clear photos of the damage. We will respond within 2 business days.
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. AI-Generated Artwork</h2>
                <p className="mb-3">Each account receives <strong>1 free AI generation</strong>. The AI produces a canvas print–quality portrait based on your uploaded photo. Because AI output is generated on demand and immediately accessible, we do not offer refunds or regenerations based on dissatisfaction with the style or result.</p>
                <p className="mb-3"><strong>Regeneration as part of a damaged return:</strong> If your physical print arrives damaged or defective, and as part of the replacement process a new AI generation is required (e.g. the original file was corrupted), we will regenerate the portrait at no charge. This regeneration is strictly part of the damaged-goods replacement process — it is not available as a standalone request for style preference.</p>
                <p className="text-sm text-gray-500">We encourage you to preview your AI portrait carefully before placing a print order. The preview shown before checkout is the exact image that will be printed.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. HD Digital Downloads</h2>
                <p>Digital downloads (HD image files) are <strong>non-refundable</strong> once the download link has been delivered to you, as the digital file cannot be "returned." If you experience a technical issue accessing or downloading your file, contact us and we will resolve it promptly.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Post-Purchase Upsells & Add-ons</h2>
                <p>The same policies apply to any upsell or add-on products (surprise portrait, extra copies, etc.). Physical add-ons follow the damaged/defective policy. Digital add-ons are non-refundable once delivered.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. Refund Processing</h2>
                <p>Approved refunds are issued to your original payment method within <strong>5–10 business days</strong>. Replacements are re-fulfilled at no cost and ship with standard production time (3–5 business days). We will provide a new tracking number once your replacement ships.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cancellations</h2>
                <p>You may cancel an order <strong>within 1 hour of placing it</strong>, before production begins. To cancel, email <a href="mailto:hello@maitrepets.com" className="text-purple-600 hover:underline">hello@maitrepets.com</a> immediately with your order number. Once production has started with Printful, cancellation is no longer possible.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">7. International Orders</h2>
                <p>For orders outside the United States, import duties and taxes are the responsibility of the customer. We are not responsible for delays caused by customs. If an international shipment is lost, please contact us after 45 days from the order date.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
                <p>For all refund and return inquiries: <a href="mailto:hello@maitrepets.com" className="text-purple-600 hover:underline">hello@maitrepets.com</a></p>
                <p className="text-sm text-gray-500 mt-1">Please include your order number and relevant photos in your email to speed up the process.</p>
              </section>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}

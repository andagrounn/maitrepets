import Link from 'next/link';
import Navbar from '@/components/Navbar';

const styles = [
  { label: 'Chibi',        emoji: '🌸', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80' },
  { label: 'Kawaii',       emoji: '🍬', img: 'https://images.unsplash.com/photo-1596079890701-dd42edf4f0a8?w=400&q=80' },
  { label: 'Comic Book',   emoji: '💥', img: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&q=80' },
  { label: 'Steampunk',    emoji: '⚙️', img: 'https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=400&q=80' },
  { label: 'Renaissance',  emoji: '🖼️', img: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&q=80' },
  { label: 'Lofi Art',     emoji: '🎧', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80' },
];

const testimonials = [
  { name: 'Sarah M.', pet: 'Golden Retriever', quote: 'The Renaissance painting of my dog is insane — it looks like a real 16th century oil painting. Everyone who visits thinks I bought fine art.', stars: 5 },
  { name: 'Jake T.', pet: 'Tabby Cat', quote: 'Got the Comic Book style for my cat and it\'s absolutely unreal. Best $79 I\'ve ever spent — it\'s hanging in my living room.', stars: 5 },
  { name: 'Maria L.', pet: 'Pug', quote: 'Ordered the Kawaii style as a memorial for my dog. I\'ll treasure this forever. The quality of the print is incredible.', stars: 5 },
];

const faqs = [
  { q: 'What kind of photo should I upload?', a: 'A clear, front-facing photo with good lighting works best. Make sure your pet\'s face is visible and in focus.' },
  { q: 'How long does shipping take?', a: 'Standard framed prints ship within 3–5 business days and arrive in 7–10 days. Express options available at checkout.' },
  { q: 'Can I get a refund?', a: 'We offer free re-generation if you\'re not happy with the AI result. Physical products can be returned if damaged.' },
  { q: 'What sizes are available?', a: 'We offer framed poster prints in 8×10, 11×14, 16×20, 18×24, and 24×36 inches.' },
  { q: 'How does the AI work?', a: 'We use GPT-4o to understand your pet\'s unique features, then DALL-E 3 HD to reimagine them in the chosen art style at full resolution.' },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-[#0a0a0f]">

        {/* Hero */}
        <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black/60 to-[#0a0a0f] pointer-events-none" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-900/60 border border-purple-500/30 text-purple-300 text-sm font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <span>🐾</span> AI-Powered Pet Art Generator
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight text-white">
              Turn Your Pet Into<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">a Work of Art</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
              Upload your pet photo and transform them into stunning artwork — Chibi, Renaissance, Comic Book, Steampunk, and more. Print it. Frame it. Show it off.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/create" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-all shadow-2xl shadow-purple-900/50">
                Create Your Pawtrait →
              </Link>
              <a href="#styles" className="border border-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm">
                See Art Styles
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-4">No credit card required to generate • Free preview</p>
          </div>
        </section>

        {/* Style Previews */}
        <section id="styles" className="py-16 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">11 Unique Art Styles</h2>
            <p className="text-gray-400 text-lg">Your pet, reimagined in any artistic universe</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {styles.map((t) => (
              <div key={t.label} className="group relative rounded-2xl overflow-hidden aspect-square shadow-xl hover:shadow-purple-900/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <img src={t.img} alt={t.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-bold text-lg">{t.emoji} {t.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/create" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all inline-block">
              Try All Styles Free →
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 px-6 bg-white/5 backdrop-blur-sm border-y border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-3">How It Works</h2>
              <p className="text-gray-400 text-lg">From upload to your wall in 3 easy steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: '📸', title: 'Upload Your Pet Photo', desc: 'Select any clear photo of your pet. Our AI works best with front-facing shots in good lighting.' },
                { step: '02', icon: '🎨', title: 'Choose Your Art Style', desc: 'Pick from 11 unique styles — Chibi, Renaissance, Steampunk, Comic Book, and more. AI transforms your pet in seconds.' },
                { step: '03', icon: '📦', title: 'Print & Deliver', desc: 'Order a premium framed print. Professionally printed and shipped directly to your door across the US.' },
              ].map((item) => (
                <div key={item.step} className="text-center p-8 rounded-2xl bg-white/5 hover:bg-purple-900/20 transition-colors border border-white/10">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-purple-400 mb-2 tracking-widest">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">Simple Pricing</h2>
            <p className="text-gray-400 text-lg">Free to generate. Pay only if you love it.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Digital Preview', price: 'Free', desc: 'AI-generated art', features: ['HD resolution', 'All 11 styles', 'Instant preview'], popular: false },
              { name: '8×10 Framed', price: '$60+', desc: 'Starter print', features: ['Premium framed print', 'Ready to hang', '7–10 day shipping'], popular: false },
              { name: '16×20 Framed', price: '$79+', desc: 'Most popular', features: ['Premium framed print', 'Ready to hang', '7–10 day shipping'], popular: true },
              { name: '24×36 Framed', price: '$139+', desc: 'Statement piece', features: ['Premium framed print', 'Ready to hang', '7–10 day shipping'], popular: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl p-6 relative border ${p.popular ? 'border-purple-500 bg-purple-900/30 shadow-xl shadow-purple-900/50' : 'border-white/10 bg-white/5'}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
                <p className="font-bold text-white">{p.name}</p>
                <p className="text-3xl font-black text-white mt-2 mb-1">{p.price}</p>
                <p className="text-gray-400 text-xs mb-4">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-purple-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/create" className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${p.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-6 bg-white/5 border-y border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-3">Loved by Pet Parents</h2>
              <div className="flex items-center justify-center gap-1 text-yellow-400 text-xl mb-2">★★★★★</div>
              <p className="text-gray-400">4.9/5 from 2,000+ happy customers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-2xl p-6 bg-white/5 border border-white/10">
                  <div className="flex text-yellow-400 mb-3">{Array(t.stars).fill('★').join('')}</div>
                  <p className="text-gray-300 leading-relaxed mb-4">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.pet} owner</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl p-6 bg-white/5 border border-white/10">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-t border-white/10">
          <div className="max-w-2xl mx-auto">
            <div className="text-5xl mb-4">🐾</div>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Create Your Pawtrait?</h2>
            <p className="text-purple-200 text-lg mb-8">Join thousands of pet parents who have transformed their photos into stunning artwork.</p>
            <Link href="/create" className="bg-white text-purple-700 font-bold px-10 py-4 rounded-xl text-lg hover:bg-purple-50 transition-colors shadow-2xl inline-block">
              Create Your Pawtrait →
            </Link>
            <p className="text-purple-300 text-sm mt-4">Free preview • No credit card required</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/60 border-t border-white/10 text-gray-500 py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-white font-bold">Maîtrepets</span>
            </div>
            <p className="text-sm">© 2025 Maîtrepets. All rights reserved. AI-generated artwork — for personal use.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

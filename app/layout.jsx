import './globals.css';
import Footer from '@/components/Footer';
import DisableImageActions from '@/components/DisableImageActions';
import Script from 'next/script';

export const metadata = {
  title: 'Maîtrepets — Turn Your Pet Into a Work of Art',
  description: 'Upload your pet photo and transform it into stunning AI-generated artwork. Premium framed prints delivered to your door.',
  openGraph: {
    title: 'Maîtrepets — AI Pet Art Generator',
    description: 'AI-powered pet portraits. 11 unique art styles. Premium framed prints.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-0385Y0WJZV" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0385Y0WJZV');
        `}</Script>
      </head>
      <body className="bg-cream min-h-screen antialiased flex flex-col">
        <DisableImageActions />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

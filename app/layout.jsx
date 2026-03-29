import './globals.css';
import Footer from '@/components/Footer';

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
      <body className="bg-ivory min-h-screen antialiased flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

'use client';
import Link from 'next/link';
import { useSearchParams, Suspense } from 'next/navigation';

const REASON_COPY = {
  paypal_cancelled:    { title: 'Payment Cancelled', body: 'You cancelled the PayPal checkout. No charge was made. Your portrait is saved — come back any time.' },
  capture_failed:      { title: 'Payment Not Completed', body: 'Your payment didn\'t go through. Please try again or use a different payment method.' },
  amount_mismatch:     { title: 'Payment Issue Detected', body: 'We detected a problem with your payment and blocked it for your safety. Please contact us if you need help.' },
  order_not_found:     { title: 'Order Not Found', body: 'We couldn\'t find your order. If you were charged, please contact our support team.' },
  missing_params:      { title: 'Something Went Wrong', body: 'The checkout link was incomplete. Please try placing your order again.' },
  server_error:        { title: 'Something Went Wrong', body: 'An unexpected error occurred. If you were charged, please contact our support team.' },
  verification_failed: { title: 'Verification Failed', body: 'We couldn\'t verify your payment. No charges were made. Please try again.' },
};

const DEFAULT_COPY = { title: 'Payment Cancelled', body: 'No worries! Your portrait is saved. Come back any time to complete your order.' };

function CancelInner() {
  const params = useSearchParams();
  const reason = params.get('reason');
  const { title, body } = REASON_COPY[reason] || DEFAULT_COPY;

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">😕</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-500 mb-8">{body}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/create" className="btn-primary px-8 py-3">Back to Create</Link>
          <Link href="/dashboard" className="btn-secondary px-8 py-3">My Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CancelInner />
    </Suspense>
  );
}

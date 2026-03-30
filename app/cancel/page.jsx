import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">😕</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
        <p className="text-gray-500 mb-8">No worries! Your portrait is saved. Come back any time to complete your order.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/create" className="btn-primary px-8 py-3">Back to Create</Link>
          <Link href="/dashboard" className="btn-secondary px-8 py-3">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

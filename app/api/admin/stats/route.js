import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET;
}

export async function GET(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [orders, users, images] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user:  { select: { name: true, email: true } },
        image: { select: { generatedUrl: true, style: true } },
      },
    }),
    prisma.user.count(),
    prisma.image.count(),
  ]);

  const totalRevenue   = orders.filter(o => ['paid','fulfilling','shipped'].includes(o.status)).reduce((s, o) => s + o.price, 0);
  const totalOrders    = orders.length;
  const paidOrders     = orders.filter(o => o.status !== 'pending' && o.status !== 'failed').length;
  const failedOrders   = orders.filter(o => o.status === 'paid_fulfillment_failed').length;
  const fulfillingOrders = orders.filter(o => o.status === 'fulfilling').length;
  const shippedOrders  = orders.filter(o => o.status === 'shipped').length;

  // Revenue by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenueByDay = {};
  orders
    .filter(o => new Date(o.createdAt) >= thirtyDaysAgo && ['paid','fulfilling','shipped'].includes(o.status))
    .forEach(o => {
      const day = new Date(o.createdAt).toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + o.price;
    });

  // Theme popularity
  const themeCounts = {};
  orders.forEach(o => {
    const theme = o.image?.style || o.productType || 'unknown';
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  });

  // Product type breakdown
  const productCounts = {};
  orders.forEach(o => {
    productCounts[o.productType] = (productCounts[o.productType] || 0) + 1;
  });

  return NextResponse.json({
    stats: { totalRevenue, totalOrders, paidOrders, failedOrders, fulfillingOrders, shippedOrders, users, images },
    orders,
    revenueByDay,
    themeCounts,
    productCounts,
  });
}

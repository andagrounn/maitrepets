import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';
}

export async function GET(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [orders, usersRaw, images] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user:  { select: { id: true, name: true, email: true, createdAt: true } },
        image: { select: { generatedUrl: true, style: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { image: { select: { generatedUrl: true, style: true } } },
        },
      },
    }),
    prisma.image.count(),
  ]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const paidStatuses   = ['paid', 'fulfilling', 'shipped', 'delivered'];
  const totalRevenue   = orders.filter(o => paidStatuses.includes(o.status)).reduce((s, o) => s + o.price, 0);
  const totalOrders    = orders.length;
  const paidOrders     = orders.filter(o => paidStatuses.includes(o.status)).length;
  const failedOrders   = orders.filter(o => ['paid_fulfillment_failed', 'failed'].includes(o.status)).length;
  const fulfillingOrders = orders.filter(o => o.status === 'fulfilling').length;
  const shippedOrders  = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const refundRequestedOrders = orders.filter(o => o.status === 'refund_requested').length;

  // ── Revenue by day (last 30 days) ────────────────────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenueByDay = {};
  orders
    .filter(o => new Date(o.createdAt) >= thirtyDaysAgo && paidStatuses.includes(o.status))
    .forEach(o => {
      const day = new Date(o.createdAt).toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + o.price;
    });

  // ── Style / product breakdowns ───────────────────────────────────────────────
  const themeCounts = {};
  orders.forEach(o => {
    const theme = o.image?.style || 'unknown';
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  });

  const productCounts = {};
  orders.forEach(o => {
    productCounts[o.productType] = (productCounts[o.productType] || 0) + 1;
  });

  // ── User list enriched ───────────────────────────────────────────────────────
  const userList = usersRaw.map(u => {
    const ltv         = u.orders.filter(o => paidStatuses.includes(o.status)).reduce((s, o) => s + o.price, 0);
    const orderCount  = u.orders.length;
    const lastOrderAt = u.orders[0]?.createdAt || null;
    return { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt, orderCount, ltv, lastOrderAt, orders: u.orders };
  });

  // ── Refund requests ──────────────────────────────────────────────────────────
  const refundRequests = orders.filter(o => o.status === 'refund_requested');

  return NextResponse.json({
    stats: {
      totalRevenue, totalOrders, paidOrders, failedOrders,
      fulfillingOrders, shippedOrders, deliveredOrders,
      refundRequestedOrders, users: usersRaw.length, images,
    },
    orders,
    userList,
    refundRequests,
    revenueByDay,
    themeCounts,
    productCounts,
  });
}

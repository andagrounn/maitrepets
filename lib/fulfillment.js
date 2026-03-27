import { prisma } from '@/lib/prisma';
import { createPrintfulOrder, PRODUCT_VARIANTS, EXTRA_COPY_VARIANTS } from '@/lib/printful';

/**
 * Called after any successful payment.
 * Creates and confirms a Printful order in a single API call (confirm: true).
 */
export async function fulfillOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      image: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.status !== 'paid') throw new Error(`Order ${orderId} not paid`);
  if (order.printfulId) {
    console.log(`[Fulfillment] Order ${orderId} already submitted to Printful`);
    return;
  }

  let imageUrl = order.image?.generatedUrl;
  if (!imageUrl) throw new Error('No generated image URL on order');
  // Printful doesn't accept WebP — convert URL extension if needed
  if (imageUrl.endsWith('.webp')) imageUrl = imageUrl.replace('.webp', '.jpg');

  // 'paper-*' types → unframed poster; everything else → framed poster
  const isPaper = order.productType?.startsWith('paper-');
  const product = isPaper
    ? (EXTRA_COPY_VARIANTS[order.productType.replace('paper-', 'poster-')] ?? EXTRA_COPY_VARIANTS['poster-16x20'])
    : (PRODUCT_VARIANTS[order.productType] ?? PRODUCT_VARIANTS['poster-16x20']);

  const recipient = {
    name:         order.shippingName     || order.user.name || 'Customer',
    address1:     order.shippingAddress  || '',
    address2:     order.shippingAddress2 || '',
    city:         order.shippingCity     || '',
    state_code:   order.shippingState    || '',
    country_code: order.shippingCountry  || 'US',
    zip:          order.shippingZip      || '',
    phone:        order.shippingPhone    || '',
    email:        order.user.email,
  };

  try {
    // 1. Main order — framed poster
    const printfulRes = await createPrintfulOrder({
      recipient,
      imageUrl,
      variantId:      product.variantId,
      quantity:       1,
      orderId:        order.id,
      shippingMethod: order.shippingMethod || 'STANDARD',
      confirm:        true,
    });

    const printfulId = String(
      printfulRes?.result?.id ?? printfulRes?.id ?? ''
    );

    await prisma.order.update({
      where: { id: orderId },
      data: {
        printfulId,
        status:    'fulfilling',
        updatedAt: new Date(),
      },
    });

    console.log(`[Fulfillment] Order ${orderId} → Printful ID: ${printfulId}`);

    // 2. Extra Print Copy — separate unframed poster order
    if (order.extraCopy) {
      const extraVariant = EXTRA_COPY_VARIANTS[order.productType] ?? EXTRA_COPY_VARIANTS['poster-16x20'];
      const extraRes = await createPrintfulOrder({
        recipient,
        imageUrl,
        variantId:      extraVariant.variantId,
        quantity:       1,
        orderId:        `${order.id}-extra`,
        shippingMethod: order.shippingMethod || 'STANDARD',
        confirm:        true,
      });
      const extraPrintfulId = String(extraRes?.result?.id ?? extraRes?.id ?? '');
      console.log(`[Fulfillment] Extra copy for ${orderId} → Printful ID: ${extraPrintfulId}`);
    }

    return printfulId;

  } catch (err) {
    console.error(`[Fulfillment] Failed for order ${orderId}:`, err.message);

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid_fulfillment_failed', updatedAt: new Date() },
    });

    throw err;
  }
}

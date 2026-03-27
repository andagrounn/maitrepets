import { NextResponse } from 'next/server';
import { getCatalogProduct } from '@/lib/printful';

/**
 * GET /api/printful/catalog?productId=2
 *
 * Returns all variants for a Printful catalog product.
 * Use this to find the correct variantId values for PRODUCT_VARIANTS in lib/printful.js.
 *
 * Common product IDs:
 *   2  = Gallery Wrapped Canvas
 *   1  = Enhanced Matte Paper Poster Print
 *
 * Example: GET /api/printful/catalog?productId=2
 * Returns all canvas sizes with their variant IDs and prices.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({
      error: 'productId query param required. Try ?productId=2 for canvas or ?productId=1 for posters.',
    }, { status: 400 });
  }

  try {
    const data = await getCatalogProduct(productId);

    // Return a simplified view focused on variant IDs
    const variants = (data?.variants || []).map((v) => ({
      id:       v.id,
      name:     v.name,
      size:     v.size,
      price:    v.price,
      in_stock: v.in_stock,
    }));

    return NextResponse.json({
      product: {
        id:    data?.product?.id,
        title: data?.product?.title,
        type:  data?.product?.type,
      },
      variants,
    });
  } catch (err) {
    console.error('Catalog error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

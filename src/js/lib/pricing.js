// /src/js/lib/pricing.js
// Pure pricing calculation function for the Verdant studio cart

/**
 * Computes subtotal, discounts, shipping, and total for a list of cart items.
 *
 * @param {Array} items - Array of { product, quantity, bundle }
 * @param {string|null} promoCode - Active promo code ('VERDANT10' | 'WELCOME' | null)
 * @returns {Object} { subtotal, bundleDiscount, promoDiscount, shipping, total, freeShippingRemaining, hasFreeShipping }
 */
export function calculatePricing(items = [], promoCode = null) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Check bundle discount: 10% off subtotal when items flagged with bundle: true are present
  // Prompt requirement: "Dew Serum $48 + Moss Cream $42 + Clay Cleanser $34 as a bundle must give subtotal $124, bundle discount $12.40, shipping $0, total $111.60"
  const hasBundle = items.some(item => item.bundle === true);
  const bundleDiscount = hasBundle ? parseFloat((subtotal * 0.10).toFixed(2)) : 0;

  // Promo discount
  let promoDiscount = 0;
  const normalizedCode = promoCode ? promoCode.trim().toUpperCase() : '';
  if (normalizedCode === 'VERDANT10') {
    // 10% off subtotal
    promoDiscount = parseFloat((subtotal * 0.10).toFixed(2));
  }

  // Discounted subtotal
  const discountedSubtotal = Math.max(0, parseFloat((subtotal - bundleDiscount - promoDiscount).toFixed(2)));

  // Shipping threshold: $60 (or free if WELCOME code applied or discountedSubtotal >= 60)
  const isFreeShipping = discountedSubtotal >= 60 || normalizedCode === 'WELCOME' || subtotal === 0;
  const shipping = (subtotal > 0 && !isFreeShipping) ? 6 : 0;
  const freeShippingRemaining = Math.max(0, parseFloat((60 - discountedSubtotal).toFixed(2)));

  const total = parseFloat(Math.max(0, discountedSubtotal + shipping).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    bundleDiscount,
    promoDiscount,
    shipping,
    total,
    freeShippingRemaining,
    hasFreeShipping: isFreeShipping && subtotal > 0
  };
}

// Dev-only assertion: Dew Serum $48 + Moss Cream $42 + Clay Cleanser $34 as a bundle
// must give subtotal $124, bundle discount $12.40, shipping $0, total $111.60
if (typeof window !== 'undefined' && (import.meta.env ? import.meta.env.DEV : true)) {
  const sampleItems = [
    { product: { id: 'dew-serum', price: 48 }, quantity: 1, bundle: true },
    { product: { id: 'moss-cream', price: 42 }, quantity: 1, bundle: true },
    { product: { id: 'clay-cleanser', price: 34 }, quantity: 1, bundle: true }
  ];
  const result = calculatePricing(sampleItems, null);
  console.assert(
    result.subtotal === 124 &&
    result.bundleDiscount === 12.40 &&
    result.shipping === 0 &&
    result.total === 111.60,
    `[Pricing Engine] Assertion failed! Expected 124, 12.40, 0, 111.60 but got:`,
    result
  );
}

import crypto from 'crypto';

export const WIPAY_CONFIG = {
  endpoint: 'https://jm.wipayfinancial.com/plugins/payments/request',
  country_code: 'JM',
  currency: process.env.WIPAY_CURRENCY || 'USD',
  environment: process.env.WIPAY_ENVIRONMENT || 'sandbox',
  fee_structure: process.env.WIPAY_FEE_STRUCTURE || 'customer_pay',
  account_number: process.env.WIPAY_ACCOUNT_NUMBER || '1234567890',
  api_key: process.env.WIPAY_API_KEY || '123',
};

/**
 * Build the form POST body to send to WiPay.
 * Returns an object of key/value pairs.
 */
export function buildWiPayRequest({ orderId, total, responseUrl, customerName, customerEmail }) {
  return {
    account_number: WIPAY_CONFIG.account_number,
    country_code:   WIPAY_CONFIG.country_code,
    currency:       WIPAY_CONFIG.currency,
    environment:    WIPAY_CONFIG.environment,
    fee_structure:  WIPAY_CONFIG.fee_structure,
    method:         'credit_card',
    order_id:       orderId,
    origin:         'Maîtrepets',
    response_url:   responseUrl,
    total:          Number(total).toFixed(2),
    ...(customerName  && { name:  customerName }),
    ...(customerEmail && { email: customerEmail }),
  };
}

/**
 * Verify the hash returned by WiPay to confirm the response is authentic.
 * hash = md5(transaction_id + original_total + api_key)
 */
export function verifyWiPayHash({ transaction_id, total, hash }) {
  const expected = crypto
    .createHash('md5')
    .update(`${transaction_id}${Number(total).toFixed(2)}${WIPAY_CONFIG.api_key}`)
    .digest('hex');
  return expected === hash;
}

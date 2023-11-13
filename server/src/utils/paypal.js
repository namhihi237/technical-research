'use strict';

const payoutsNodeJssdk = require('@paypal/payouts-sdk');
/**
 *
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
function client() {
  return new payoutsNodeJssdk.core.PayPalHttpClient(environment());
}
/**
 *
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 *
 */
function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    return new payoutsNodeJssdk.core.LiveEnvironment('PAYPAL-CLIENT-ID', 'PAYPAL-CLIENT-SECRET');
  }
  return new payoutsNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}
module.exports = { client: client(), paypalSdk: payoutsNodeJssdk };
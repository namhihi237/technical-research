const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const uploadRoute = require('./modules/upload/route');
const AWS = require('aws-sdk');
const corsOptions = {
  exposedHeaders: ['ETag'],
};
app.use(cors(corsOptions));

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment/payment-element",
    version: "0.0.2",
    url: "https://github.com/stripe-samples"
  }
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(uploadRoute);
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.END_POINT,
});

app.get('/generate-secret', (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  res.send(secret);
});

app.get('/generate-qr', async (req, res) => {
  const customName = "Poppy";
  const customAvatarUrl = "https://res.cloudinary.com/tutotring/image/upload/v1699610578/Icon-App-29x29_3x_oxw7le.png";
  const secret = speakeasy.generateSecret({ length: 20 });
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(customName)}?secret=${secret.base32}&issuer=${encodeURIComponent(customName)}&image=${encodeURIComponent(customAvatarUrl)}`;
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  res.send(`
    <div>
      <h2>Scan the QR Code with a TOTP App</h2>
      <img src="${qrCodeUrl}" alt="QR Code">
    </div>
  `);
});


app.post('/verify-totp', (req, res) => {
  const { token, secret } = req.body;

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
  });

  if (verified) {
    res.send({ status: 'success', message: 'Two-Factor Authentication successful!' });
  } else {
    res.send({ status: 'error', message: 'Invalid token. Please try again.' });
  }
});


// Endpoint to get public URL of an uploaded file
app.get('/file/:fileName', (req, res) => {
  const fileName = req.params.fileName;

  // Generate public URL
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  };

  const fileUrl = s3.getSignedUrl('getObject', params);

  res.status(200).json({ fileUrl });
});


app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);


app.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.get('/create-payment-intent', async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'EUR',
      amount: 1999,
      automatic_payment_methods: { enabled: true }
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post('/webhook', async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!');
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.');
  }
  res.sendStatus(200);
});


app.listen(4242, () =>
  console.log(`Node server listening at http://localhost:4242`)
);
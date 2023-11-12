const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const speakeasy = require('speakeasy');

const uploadRoute = require('./modules/upload/route');
const twoFARoute = require('./modules/2fa/route');
const stripeRoute = require('./modules/stripe/route');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(uploadRoute);
app.use(twoFARoute);
app.use(stripeRoute);

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

app.listen(4242, () =>
  console.log(`Node server listening at http://localhost:4242`)
);
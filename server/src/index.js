const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const speakeasy = require('speakeasy');

const uploadRoute = require('./modules/upload/route');
const twoFARoute = require('./modules/2fa/route');
const stripeRoute = require('./modules/stripe/route');
const paypalRoute = require('./modules/paypal/route');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(uploadRoute);
app.use(twoFARoute);
app.use(stripeRoute);
app.use(paypalRoute);

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
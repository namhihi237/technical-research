const stripe = require('../../utils/stripe');

function getConfig(req, res) {
  try {
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error, try again!' });
  }
}

async function addCard(req, res) {
  try {
    const { token } = req.body;
    // Normally, we need to check the user has customer ID or not before create
    const customer = await stripe.customers.create({
      email: 'poppy99.dev@gmail.com' // hard code to test
    });

    const card = await stripe.customers.createSource(customer.id, {
      source: token.id,
    });

    console.log(card);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error, try again!' });
  }
}

module.exports = {
  getConfig,
  addCard
}
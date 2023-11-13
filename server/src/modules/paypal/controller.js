const paypal = require('../../utils/paypal');

async function payout(req, res) {
  try {
    const EMAIL_RECEIVE = 'sb-pji4u12045901@personal.example.com'
    const requestBody = {
      "sender_batch_header": {
        "recipient_type": 'EMAIL',
        "email_message": "SDK payouts test txn",
        "note": "Enjoy your Payout!!",
        "sender_batch_id": "Test_sdk_4",
        "email_subject": "This is a test transaction from SDK"
      },
      "items": [{
        "note": "Test send 12$ Payout!",
        "amount": {
          "currency": "USD",
          "value": "12.00"
        },
        "receiver": EMAIL_RECEIVE,
        "sender_item_id": "Test_txn_1"
      }]
    }
    let request = new paypal.paypalSdk.payouts.PayoutsPostRequest();
    request.requestBody(requestBody);

    let response = await paypal.client.execute(request);
    console.log("result", response.result);
    res.send(response.result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error, try again!' });
  }
}

module.exports = { payout };
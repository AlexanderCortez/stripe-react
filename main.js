require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const stripeInit = require("stripe");

const { PORT, STRIPE_KEY } = process.env;

const stripe = stripeInit(STRIPE_KEY);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/payment/create-payment-intent", async (req, res) => {
  const { amount, currency, paymentMethod } = req.body || {};

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: [paymentMethod],
    });
    res.send({ data: { clientSecret: paymentIntent.client_secret } });
  } catch (err) {
    res.status(err?.statusCode || 400).send({
      error: {
        statusCode: err?.statusCode || 400,
        message: err?.raw?.message || "Random error",
      },
    });
  }
});

app.post("/api/payment/create-payment-method", async (req, res) => {
  const { type, cardNumber, expMonth, expYear, cvc } = req.body || {};

  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type,
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc,
      },
    });
    res.send({ data: {methodId: paymentMethod.id} });
  } catch (err) {
    res.status(err?.statusCode || 400).send({
      error: {
        statusCode: err?.statusCode || 400,
        message: err?.raw?.message || "Random error",
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

// Replace if using a different env file or config
require("dotenv").config({ path: "../../.env" });
const express = require("express");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const port = process.env.PORT || 4242;

app.use(express.static(process.env.STATIC_DIR));

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.post("/onboard-user", async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: "standard",
      business_type: "individual",
      country: "US",
      requested_capabilities: ["card_payments", "transfers"]
    });

    let returnUrl = `${req.headers.origin}`;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      failure_url: `${returnUrl}/failure.html`,
      success_url: `${returnUrl}/success.html`,
      type: "onboarding"
    });

    res.send({
      url: accountLink.url
    });
  } catch (err) {
    res.status(500).send({
      error: err.message
    });
  }
});

app.get("/publishable-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Stripe requires the raw body to construct the event
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Successfully constructed event
    console.log("✅ Success:", event.id);

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

app.listen(port, () => console.log(`Node server listening on port ${port}!`));

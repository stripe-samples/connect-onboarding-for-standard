// Replace if using a different env file or config
require("dotenv").config();
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
      country: "US"
    });

    let returnUrl = `${req.headers.origin}`;

    const accountLink = await stripe.accountLinks.create({
      type: "onboarding",
      account: account.id,
      failure_url: `${returnUrl}/failure.html`,
      success_url: `${returnUrl}/success.html`
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

app.listen(port, () => console.log(`Node server listening on port ${port}!`));

// Env variable path defined in .env.ts file.
import "./env";

import { resolve } from "path";

import express from "express";
const app = express();

// Initialise Stripe with Typescript.
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2019-12-03",
  typescript: true
});

app.use(express.static(process.env.STATIC_DIR));
// Use body-parser to retrieve the raw body as a buffer
import bodyParser from "body-parser";

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.post("/", async (req, res) => {
  const { data }: { data: object } = req.body;

  res.send({
    someData: data
  });
});

app.get("/publishable-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Webhook handler for asynchronous events.
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    let data: Stripe.Event.Data;
    let eventType: string;

    // Retrieve the event by verifying the signature using the raw body and secret.
    let event: Stripe.Event;
    const signature: string = req.headers["stripe-signature"] as string;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;

    if (eventType === "payment_intent.succeeded") {
      const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
      console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
    }

    res.sendStatus(200);
  }
);

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));

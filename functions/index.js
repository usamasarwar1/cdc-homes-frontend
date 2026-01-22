const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const RentCastService = require("./services/rentCast");
const sgMail = require('@sendgrid/mail');
const Stripe = require("stripe")

admin.initializeApp();

const corsHandler = cors({
  origin: true,
});

// const corsHandler = cors({
//   origin: ['http://localhost:5173', 'https://inspection-app-4c592.web.app'],
//   credentials: true,
//   methods: ['GET', 'POST', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// });


exports.testSecureFunction = functions
  .https.onRequest((req, res) => {
    corsHandler(req, res, () => {

    
      // Allow ONLY POST
      if (req.method !== "POST") {
        return res.status(405).send("Only POST allowed");
      }

      // ✅ Access body
      console.log("Headers:", req.headers);
      console.log("Body:", req.body);

      res.status(200).json({
        message: "Received data successfully",
        received: req.body,
      });
    });
  });

 
 exports.placesAutocomplete = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const input = req.query.input;

      if (!input || input.length < 3) {
        return res.status(200).json({ predictions: [] });
      }

      const apiKey = process.env.GOOGLE_PLACES_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "API key missing" });
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&types=address&components=country:us&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      return res.status(200).json(data);
    } catch (error) {
      console.error("placesAutocomplete error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});


exports.propertyValidate = functions
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {

      if (req.method !== "POST") {
        return res.status(405).json({ success: false });
      }

      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ success: false, message: "Address required" });
      }

      // ✅ SECRET IS AVAILABLE HERE
      const rentCast = new RentCastService(process.env.RENTCAST_API_KEY);

      const propertyData = await rentCast.getPropertyDetails(address);

      return res.json({
        success: true,
        property: propertyData,
      });
    });
  });

  exports.propertyVerificationApproval = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { email, name, url } = req.body;
  
        if (!email || !name || !url) {
          return res.status(400).json({ error: "Missing required fields" });
        }
  
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = "hello@answerlyapp.com";
  
        if (!apiKey) {
          return res.status(500).json({ error: "SendGrid API key missing" });
        }
  
        sgMail.setApiKey(apiKey);
  
        const msg = {
          to: email,
          from: fromEmail,
          subject: "CDC Inspection - Property Verification Approval",
          text: `Hello ${name},\n\nYour property verification has been approved. Please click the link below to verify your property and get a 50% discount on the inspection:\n\n${url}\n\nOne of our inspectors will contact you to schedule the inspection.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Property Verification Approved</h2>
              <p>Hello ${name},</p>
              <p>Your property verification has been approved. Please click the link below to verify your property and get a <strong>50% discount</strong> on the inspection.</p>
              <p>One of our inspectors will contact you to schedule the inspection.</p>
              <div style="margin: 30px 0;">
                <a href="${url}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Property
                </a>
              </div>
              <p style="color: #666; font-size: 12px;">Or copy this link: ${url}</p>
            </div>
          `,
        };
  
        await sgMail.send(msg);
  
        return res.status(200).json({
          success: true,
          message: "Property approval email sent successfully",
          body: req.body,
        });
      } catch (error) {
        console.error("propertyVerificationApproval error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  });



  exports.createPaymentIntent = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        // Get secret from environment variable
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        
        if (!stripeSecretKey) {
          return res.status(500).json({ 
            error: "Stripe secret key not configured" 
          });
        }
  
        const stripeInstance = Stripe(stripeSecretKey);
        const { amount, currency = "usd", metadata = {} } = req.body;
  
        if (!amount || amount < 50) {
          return res.status(400).json({ 
            error: "Invalid amount. Minimum is $0.50" 
          });
        }
  
        // Create Payment Intent - convert dollars to cents
        const paymentIntent = await stripeInstance.paymentIntents.create({
          amount: Math.round(amount * 100), 
          currency: currency,
          metadata: metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });
  
        return res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        return res.status(500).json({ 
          error: error.message 
        });
      }
    });
  });

  exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        
        if (!stripeSecretKey) {
          return res.status(500).json({ 
            error: "Stripe secret key not configured" 
          });
        }
  
        const stripeInstance = Stripe(stripeSecretKey);
        const { 
          amount, 
          currency = "usd", 
          metadata = {},
          successUrl,
          cancelUrl,
          customerEmail,
          customerName
        } = req.body;
  
        if (!amount || amount < 0.50) {
          return res.status(400).json({ 
            error: "Invalid amount. Minimum is $0.50" 
          });
        }
  
        // Create Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: currency,
                product_data: {
                  name: 'Home Inspection',
                  description: metadata.description || 'Home inspection service',
                },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: successUrl || `${req.headers.origin || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:5173'}/payment-cancel`,
          customer_email: customerEmail,
          metadata: metadata,
        });
  
        return res.status(200).json({
          checkoutUrl: session.url,
          sessionId: session.id,
        });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        return res.status(500).json({ 
          error: error.message 
        });
      }
    });
  });

  // Webhook handler for payment confirmations
exports.stripeWebhook = functions.https.onRequest((req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent.id);
      
      // Update your Firestore database here
      // Example:
      // await admin.firestore().collection('payments').doc(paymentIntent.id).set({
      //   status: 'succeeded',
      //   amount: paymentIntent.amount / 100,
      //   createdAt: admin.firestore.FieldValue.serverTimestamp()
      // });
      
      break;
    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});




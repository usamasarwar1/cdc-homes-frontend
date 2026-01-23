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
          subject: "Your Property Is Approved – Enjoy 50% Off Your Inspection",
          text: `Hello ${name},
        
        Congratulations! Your property verification has been approved.
        
        You’re eligible for a 50% discount on your inspection. Please use the link below to verify your property and continue:
        
        ${url}
        
        After verification, one of our inspectors will contact you to schedule the inspection.
        
        If you have any questions, feel free to reply to this email.
        
        – CDC Inspection Team`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
                <!-- Header -->
                <div style="background-color: #FF0000; padding: 20px 30px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
                    Property Verification Approved
                  </h1>
                </div>
        
                <!-- Body -->
                <div style="padding: 30px; color: #333333;">
                  <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
        
                  <p style="font-size: 15px; line-height: 1.6;">
                    Great news! Your property verification has been successfully approved.
                    You are now eligible for a <strong style="color:#FF0000;">50% discount</strong> on your inspection.
                  </p>
        
                  <p style="font-size: 15px; line-height: 1.6;">
                    Please click the button below to verify your property and continue.
                  </p>
        
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${url}"
                       style="background-color: #FF0000; color: #ffffff; padding: 14px 30px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block;">
                      Verify Property
                    </a>
                  </div>
        
                  <p style="font-size: 14px; line-height: 1.6;">
                    Once verified, one of our certified inspectors will contact you to schedule your inspection.
                  </p>
        
                  <p style="font-size: 14px; color: #666666;">
                    If the button doesn’t work, copy and paste this link into your browser:
                    <br />
                    <a href="${url}" style="color:#FF0000; word-break: break-all;">${url}</a>
                  </p>
                </div>
        
                <!-- Footer -->
                <div style="background-color: #f3f3f3; padding: 20px 30px; font-size: 12px; color: #777777; text-align: center;">
                  <p style="margin: 0;">
                    © ${new Date().getFullYear()} CDC Inspection. All rights reserved.
                  </p>
                  <p style="margin: 8px 0 0;">
                    This is an automated message. If you have questions, simply reply to this email.
                  </p>
                </div>
        
              </div>
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

  exports.rejectPropertyVerification = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { email, name } = req.body;
  
        if (!email || !name) {
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
          subject: "Property Verification Update – Action Required",
          text: `Hello ${name},
        
        Thank you for submitting your property for verification.
        
        After reviewing the information provided, we were unable to approve your property verification at this time.
        
        This may be due to missing, incomplete, or unclear details in your submission.
        
        Please review your information and resubmit once the required updates are made. If you have questions or need assistance, feel free to reply to this email and our team will be happy to help.
        
        – CDC Inspection Team`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
                <!-- Header -->
                <div style="background-color: #FF0000; padding: 20px 30px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
                    Property Verification Not Approved
                  </h1>
                </div>
        
                <!-- Body -->
                <div style="padding: 30px; color: #333333;">
                  <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
        
                  <p style="font-size: 15px; line-height: 1.6;">
                    Thank you for submitting your property for verification.
                  </p>
        
                  <p style="font-size: 15px; line-height: 1.6;">
                    After reviewing the information provided, we were unable to approve your
                    property verification at this time.
                  </p>
        
                  <div style="background-color: #fff5f5; border-left: 4px solid #FF0000; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                      This may be due to missing, incomplete, or unclear details in your submission.
                    </p>
                  </div>
        
                  <p style="font-size: 14px; line-height: 1.6;">
                    Please review your information and resubmit once the necessary updates are made.
                    If you need help or clarification, simply reply to this email — our team is happy to assist.
                  </p>
                </div>
        
                <!-- Footer -->
                <div style="background-color: #f3f3f3; padding: 20px 30px; font-size: 12px; color: #777777; text-align: center;">
                  <p style="margin: 0;">
                    © ${new Date().getFullYear()} CDC Inspection. All rights reserved.
                  </p>
                  <p style="margin: 8px 0 0;">
                    This is an automated message. Replies are monitored.
                  </p>
                </div>
        
              </div>
            </div>
          `,
        };
        
        
  
        await sgMail.send(msg);
  
        return res.status(200).json({
          success: true,
          message: "Property Rejection email sent successfully",
          body: req.body,
        });
      } catch (error) {
        console.error("rejectPropertyVerification error:", error);
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




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

  exports.additionalAcknowledgementReport = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { email, name, message } = req.body;
  
        // Validate required fields
        if (!email || !name || !message) {
          return res.status(400).json({ error: "Missing required fields: email, name, or message" });
        }
  
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = "hello@answerlyapp.com";
  
        if (!apiKey) {
          return res.status(500).json({ error: "SendGrid API key missing" });
        }
  
        sgMail.setApiKey(apiKey);
  
        // Compose email
        const msg = {
          to: email,
          from: fromEmail,
          subject: "Acknowledgement Report",
          text: `Hello ${name},
  
  ${message}
  
  – CDC Inspection Team`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
  
                <!-- Header -->
                <div style="background-color: #FF0000; padding: 20px 30px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
                    Property Verification Update
                  </h1>
                </div>
  
                <!-- Body -->
                <div style="padding: 30px; color: #333333;">
                  <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
  
                  <p style="font-size: 15px; line-height: 1.6;">
                    ${message}
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
  
        // Send email
        await sgMail.send(msg);
  
        return res.status(200).json({
          success: true,
          message: "Acknowledgement email sent successfully",
          body: req.body,
        });

      } catch (error) {
        console.error("additionalAcknowledgementReport error:", error);
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
          customerName,
          pendingBookingData,
        } = req.body;
  
        if (!amount || amount < 0.50) {
          return res.status(400).json({ 
            error: "Invalid amount. Minimum is $0.50" 
          });
        }

        console.log("=== CREATE CHECKOUT SESSION ===");
        console.log("Amount:", amount);
        console.log("Payment Type:", metadata.paymentType);
        console.log("pendingBookingData exists:", !!pendingBookingData);
        if (pendingBookingData) {
          console.log("pendingBookingData keys:", Object.keys(pendingBookingData));
          if (pendingBookingData.approvalToken) {
            console.log("✅ approvalToken found in pendingBookingData");
          }
        }
    
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
          success_url: successUrl || `${req.headers.origin || 'http://localhost:5173'}/payment-success`,
          cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:5173'}/payment-cancel`,
          customer_email: customerEmail,
          metadata: metadata,
        });

              // Store pending booking data in Firestore for webhook processing
        // if (pendingBookingData) {
        //   await admin.firestore()
        //     .collection('pendingBookings')
        //     .doc(session.id)
        //     .set({
        //       ...pendingBookingData,
        //       createdAt: admin.firestore.FieldValue.serverTimestamp(),
        //     });
        // }

        let bookingPayload = null;
      
        if (pendingBookingData) {
          // If sent as object, use it directly
          bookingPayload = pendingBookingData;
        } else if (metadata.bookingPayload) {
          // If sent as JSON string in metadata, parse it
          try {
            bookingPayload = typeof metadata.bookingPayload === 'string' 
              ? JSON.parse(metadata.bookingPayload) 
              : metadata.bookingPayload;
          } catch (e) {
            console.error("Failed to parse bookingPayload from metadata:", e);
          }
        }


        await admin.firestore().collection("payments").doc(session.id).set({
          status: "pending",
          paymentType: metadata.paymentType || "pay_now",
          userId: metadata.userId || null,
          bookingPayload: bookingPayload, // ← Now this will have the data!
          stripe: {
            sessionId: session.id,
            paymentIntentId: session.payment_intent || null,
            customerEmail: customerEmail || null,
            amountTotal: session.amount_total || Math.round(amount * 100),
            currency: currency,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
      console.log("Payment doc created:", session.id, "bookingPayload exists:", !!bookingPayload);
  
  
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

  exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      console.log("Webhook event received:", event.type);
      
      // ✅ LOG FULL STRIPE EVENT FOR DEBUGGING
      console.log("=== FULL STRIPE EVENT ===");
      console.log(JSON.stringify(event, null, 2));
      console.log("=== END STRIPE EVENT ===");
      
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const sessionId = session.id;
  
          console.log("=== Processing checkout.session.completed ===");
          console.log("Session ID:", sessionId);
  
          // 1) Find the payment doc that was created when checkout session was created
          const paymentRef = admin.firestore().collection("payments").doc(sessionId);
          const paymentSnap = await paymentRef.get();
  
          if (!paymentSnap.exists) {
            console.error("❌ No payments doc found for session:", sessionId);
            console.error("This means createCheckoutSession didn't create the payment doc!");
            break;
          }
  
          const paymentData = paymentSnap.data();
          console.log("✅ Payment doc found:", sessionId);
          console.log("Payment status:", paymentData.status);
          
          // ✅ LOG PAYMENT DATA FROM FIRESTORE
          console.log("=== PAYMENT DATA FROM FIRESTORE ===");
          console.log(JSON.stringify(paymentData, null, 2));
          console.log("=== END PAYMENT DATA ===");
  
          // prevent double-processing
          if (paymentData.status === "paid") {
            console.log("⚠️ Payment already processed:", sessionId);
            break;
          }
  
          // 2) Get bookingPayload
          let bookingPayload = paymentData.bookingPayload || null;
  
          if (!bookingPayload && session.metadata?.bookingPayload) {
            try {
              bookingPayload = typeof session.metadata.bookingPayload === 'string'
                ? JSON.parse(session.metadata.bookingPayload)
                : session.metadata.bookingPayload;
              console.log("✅ Got bookingPayload from session.metadata");
            } catch (e) {
              console.error("❌ Failed to parse bookingPayload from metadata:", e);
            }
          }
  
          if (!bookingPayload) {
            console.error("❌ Missing bookingPayload for session:", sessionId);
            console.error("paymentData keys:", Object.keys(paymentData));
            console.error("session.metadata:", session.metadata);
            break;
          }
  
          console.log("✅ bookingPayload found, keys:", Object.keys(bookingPayload));
  
          // 3) Get userId
          const userId = paymentData.userId || bookingPayload.userId || session.metadata?.userId || null;
          
          if (!userId) {
            console.error("❌ Missing userId!");
            break;
          }
  
          console.log("✅ userId:", userId);
  
          const paymentType = paymentData.paymentType || session.metadata?.paymentType || "pay_now";
          console.log("✅ paymentType:", paymentType);
  
          let bookingId = null;
  
          // 4) Create or update booking
          if (paymentType === "pay_now") {
            // Check if booking already exists
            const existing = await admin
              .firestore()
              .collection("bookings")
              .where("stripeSessionId", "==", sessionId)
              .limit(1)
              .get();
  
            if (!existing.empty) {
              bookingId = existing.docs[0].id;
              console.log("⚠️ Booking already exists:", bookingId);
            } else {
              // Create new booking
              console.log("📝 Creating new booking...");
              const bookingRef = await admin.firestore().collection("bookings").add({
                ...bookingPayload,
                userId: userId, // Foreign key to users collection
                status: "PAID",
                paymentStatus: "completed",
                stripeSessionId: sessionId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              
              bookingId = bookingRef.id;
              console.log("✅ Booking created with ID:", bookingId);
            }
          } else if (paymentType === "challenge") {
            // Challenge flow - find existing booking by approvalToken
            const approvalToken = bookingPayload.approvalToken || paymentData.approvalToken;
            
            if (!approvalToken) {
              console.error("❌ Challenge flow: approvalToken missing");
              break;
            }
  
            const bookingsQuery = await admin
              .firestore()
              .collection("bookings")
              .where("approvalToken", "==", approvalToken)
              .limit(1)
              .get();
  
            if (bookingsQuery.empty) {
              console.error("❌ Challenge flow: booking not found for approvalToken:", approvalToken);
              break;
            }
  
            const bookingDoc = bookingsQuery.docs[0];
            bookingId = bookingDoc.id;
            
            console.log("📝 Updating existing booking:", bookingId);

            const { approvalToken: _, timestamp: __, ...bookingDataWithoutToken } = bookingPayload;

            await admin.firestore().collection("bookings").doc(bookingId).update({
              ...bookingDataWithoutToken,
              userId: userId, // Ensure userId is set
              status: "Approved",
              paymentStatus: "completed",
              stripeSessionId: sessionId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              approvalTokenUsed: true,
              approvalToken: admin.firestore.FieldValue.delete(),
              approvalTokenExpiresAt: admin.firestore.FieldValue.delete(),
            });
  
            console.log("✅ Booking updated (challenge) for session:", sessionId);
          } else {
            console.error("❌ Unknown paymentType:", paymentType);
            break;
          }
  
          if (!bookingId) {
            console.error("❌ bookingId is null - booking creation/update failed!");
            break;
          }
  
          // 5) Update payment doc with bookingId and full Stripe payload
          console.log("📝 Updating payment doc with bookingId and Stripe payload...");
          
          const paymentUpdateData = {
            status: "paid",
            userId: userId, // Foreign key to users collection
            bookingId: bookingId, // Foreign key to bookings collection
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            stripe: {
              ...(paymentData.stripe || {}),
              sessionId: sessionId,
              paymentIntentId: session.payment_intent || paymentData.stripe?.paymentIntentId || null,
              amountTotal: session.amount_total ?? paymentData.stripe?.amountTotal ?? null,
              currency: session.currency ?? paymentData.stripe?.currency ?? null,
              customerEmail:
                session.customer_details?.email ??
                paymentData.stripe?.customerEmail ??
                session.customer_email ??
                null,
            },
            // ✅ Store full Stripe session payload
            stripePayload: {
              session: session, // Full session object
              event: {
                id: event.id,
                type: event.type,
                created: event.created,
                livemode: event.livemode,
              },
            },
          };
  
          await paymentRef.update(paymentUpdateData);
          console.log("✅ Payment doc updated with bookingId:", bookingId);
          console.log("=== END Processing checkout.session.completed ===");
  
          break;
        }
  
        case "checkout.session.async_payment_succeeded": {
          console.log("Async payment succeeded - processing same as checkout.session.completed");
          // You can duplicate the checkout.session.completed logic here if needed
          break;
        }
  
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
  
      return res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook handler error:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      // still return 200 so Stripe doesn't keep retrying forever while you debug
      return res.json({ received: true });
    }
  });




  // Webhook handler for payment confirmations
// exports.stripeWebhook = functions.https.onRequest((req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;

//   try {
//     event = Stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
//     console.log("Webhook event received:", event.type);

//     console.log("event in stripe webhook", req.body);
    
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//     case "checkout.session.completed":
//         const session = event.data.object;

//   const paymentRef = admin.firestore().collection("payments").doc(session.id);
//   const paymentSnap = await paymentRef.get();
//   if (!paymentSnap.exists) {
//     console.error("No payment doc for session:", session.id);
//     break;
//   }

//   const payment = paymentSnap.data();
//   const bookingPayload =
//     payment.bookingPayload ||
//     (session.metadata?.bookingPayload ? JSON.parse(session.metadata.bookingPayload) : null);

//   if (!bookingPayload) {
//     console.error("Missing bookingPayload for session:", session.id);
//     break;
//   }
//       break;
    
//     case "checkout.session.async_payment_succeeded":
//       handleCheckoutSessionCompleted(event.data.object);
//       break;
    
//     case "payment_intent.succeeded":
//       const paymentIntent = event.data.object;
//       console.log("Payment succeeded:", paymentIntent.id);
//       // You can keep this for other payment flows if needed
//       break;
    
//     case "payment_intent.payment_failed":
//       console.log("Payment failed:", event.data.object.id);
//       break;
    
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   res.json({ received: true });
// });


// exports.stripeWebhook = functions.https.onRequest((req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;

//   try {
//     event = Stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
//     console.log("Webhook event received:", event.type);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//     case "checkout.session.completed":
//       handleCheckoutSessionCompleted(event.data.object);
//       break;
    
//     case "checkout.session.async_payment_succeeded":
//       handleCheckoutSessionCompleted(event.data.object);
//       break;
    
//     case "payment_intent.succeeded":
//       const paymentIntent = event.data.object;
//       console.log("Payment succeeded:", paymentIntent.id);
//       // You can keep this for other payment flows if needed
//       break;
    
//     case "payment_intent.payment_failed":
//       console.log("Payment failed:", event.data.object.id);
//       break;
    
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Always return 200 immediately to acknowledge receipt
//   res.json({ received: true });
// });






// updating our data into database 
// async function handleCheckoutSessionCompleted(session) {
//   try {
//     console.log("Processing checkout.session.completed for session:", session.id);
    
//     // Extract metadata from session
//     const metadata = session.metadata || {};
//     const userId = metadata.userId;
//     const paymentType = metadata.paymentType; // 'pay_now' or 'challenge'
//     const sessionId = session.id;
    
//     if (!userId) {
//       console.error("Missing userId in session metadata");
//       return;
//     }
    
//     // Retrieve pending booking data from Firestore
//     const pendingBookingRef = admin.firestore()
//       .collection('pendingBookings')
//       .doc(sessionId);
    
//     const pendingBookingDoc = await pendingBookingRef.get();
    
//     if (!pendingBookingDoc.exists) {
//       console.error("Pending booking not found for session:", sessionId);
//       return;
//     }
    
//     const pendingBookingData = pendingBookingDoc.data();
    
//     /* =====================
//        PAY NOW FLOW
//     ====================== */
//     if (paymentType === 'pay_now') {
//       // Check if booking already exists
//       const existingBookingQuery = await admin.firestore()
//         .collection('bookings')
//         .where('stripeSessionId', '==', sessionId)
//         .limit(1)
//         .get();
      
//       if (!existingBookingQuery.empty) {
//         console.warn('Booking already exists for this Stripe session');
//         return;
//       }
      
//       // Create booking document
//       const bookingToSave = {
//         ...pendingBookingData,
//         userId: userId,
//         status: 'PAID',
//         paymentStatus: 'completed',
//         stripeSessionId: sessionId,
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//         paidAt: admin.firestore.FieldValue.serverTimestamp(),
//       };
      
//       await admin.firestore().collection('bookings').add(bookingToSave);
//       console.log('Booking created successfully (Pay Now)');
      
//       // Delete pending booking document
//       await pendingBookingRef.delete();
//     }
    
//     /* =====================
//        CHALLENGE FLOW
//     ====================== */
//     else if (paymentType === 'challenge') {
//       const approvalToken = pendingBookingData.approvalToken;
      
//       if (!approvalToken) {
//         console.error('Approval token missing in challenge flow');
//         return;
//       }
      
//       // Find existing booking by approval token
//       const bookingsQuery = await admin.firestore()
//         .collection('bookings')
//         .where('approvalToken', '==', approvalToken)
//         .limit(1)
//         .get();
      
//       if (bookingsQuery.empty) {
//         console.error('Booking not found for approval token');
//         return;
//       }
      
//       const bookingDoc = bookingsQuery.docs[0];
//       const bookingRef = admin.firestore()
//         .collection('bookings')
//         .doc(bookingDoc.id);
      
//       const existingBookingData = bookingDoc.data();
      
//       // Merge property data
//       const updatedProperty = {
//         ...pendingBookingData.property,
//         challengePrice: existingBookingData.property?.challengePrice || pendingBookingData.property?.challengePrice,
//       };
      
//       // Update booking
//       await bookingRef.update({
//         property: updatedProperty,
//         isDiscount: true,
//         status: 'Approved',
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         approvalTokenUsed: true,
//         approvalToken: admin.firestore.FieldValue.delete(),
//         approvalTokenExpiresAt: admin.firestore.FieldValue.delete(),
//         date: pendingBookingData.date,
//         sessionId: sessionId,
//         time: pendingBookingData.time,
//         formattedDateTime: pendingBookingData.formattedDateTime,
//         verifiedContact: pendingBookingData.verifiedContact,
//         userId: userId,
//       });
      
//       console.log('Booking updated successfully (Challenge)');
      
//       // Delete pending booking document
//       await pendingBookingRef.delete();
//     }
    
//   } catch (error) {
//     console.error("Error processing checkout session:", error);
//     // Don't throw - webhook should return 200 even on errors
//     // You might want to log to a separate error collection
//   }
// }




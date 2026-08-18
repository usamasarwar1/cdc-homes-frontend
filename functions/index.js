const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const RentCastService = require("./services/rentCast");
const sgMail = require('@sendgrid/mail');
const Stripe = require("stripe")
const twilio = require("twilio");

admin.initializeApp();

const logger = functions.logger;

const corsHandler = cors({
  origin: true,
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

      const rentCast = new RentCastService(process.env.RENTCAST_API_KEY);

      const propertyData = await rentCast.getPropertyDetails(address);

      return res.json({
        success: true,
        property: propertyData,
      });
    });
  });

  exports.sendVerificationCode = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ success: false });
        }
  
        const { phoneNumber } = req.body;
  
        if (!phoneNumber) {
          return res.status(400).json({
            success: false,
            message: "Phone number required",
          });
        }

        const twilioSID = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const verifyServiceSID  = process.env.TWILIO_VERIFY_SERVICE_SID
  
        const client = twilio(twilioSID, authToken);
  
        const verification = await client.verify.v2
          .services(verifyServiceSID)
          .verifications.create({
            to: phoneNumber,
            channel: "sms",
          });
  
        return res.status(200).json({
          success: true,
          message: "Verification code sent",
          status: verification.status,
        });
  
      } catch (error) {
        console.error("Twilio Error:", error);
  
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });
  });

  exports.verifyOtpCode = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ success: false });
        }
  
        const { phoneNumber, code } = req.body;
  
        if (!phoneNumber || !code) {
          return res.status(400).json({
            success: false,
            message: "Phone number and code required",
          });
        }
  
        const twilioSID = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const verifyServiceSID = process.env.TWILIO_VERIFY_SERVICE_SID; 
  
        const client = twilio(twilioSID, authToken);
  
  
        const verificationCheck = await client.verify.v2
        .services(verifyServiceSID)
          .verificationChecks.create({
            to: phoneNumber,
            code: code,
          });
  
        if (verificationCheck.status === "approved") {
          return res.status(200).json({
            success: true,
            message: "Phone verified successfully",
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid code",
          });
        }
  
      } catch (error) {
        console.error("Verify Error:", error);
  
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });
  });
  

  exports.propertyVerificationApproval = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { email, name, url } = req.body;
  
        if (!email || !url) {
          return res.status(400).json({ error: "Missing required fields" });
        }
  
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
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
            <!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f9f9;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;">
  <tr>
    <td align="center" style="padding:20px 10px;">

      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">

        <!-- Header -->
        <tr>
          <td style="background:#FF0000;padding:20px;">
            <h1 style="margin:0;font-size:22px;color:#ffffff;font-family:Arial,sans-serif;">
              Property Verification Approved
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:25px;font-family:Arial,sans-serif;color:#333;">
            <p style="font-size:16px;margin:0 0 12px;">
              Hello <strong>${name}</strong>,
            </p>

            <p style="font-size:15px;line-height:1.6;margin:0 0 15px;">
              Great news! Your property verification has been successfully approved.
              You are now eligible for a
              <strong style="color:#FF0000;">50% discount</strong> on your inspection.
            </p>

            <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
              Please click the button below to verify your property and continue.
            </p>

            <!-- Button -->
            <table width="100%">
              <tr>
                <td align="center" style="padding:15px 0;">
                  <a href="${url}"
                     style="background:#FF0000;color:#ffffff;text-decoration:none;
                     padding:14px 26px;font-size:16px;font-weight:bold;
                     border-radius:6px;display:inline-block;">
                    Verify Property
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:14px;line-height:1.6;margin:15px 0;">
              Once verified, one of our certified inspectors will contact you to schedule your inspection.
            </p>

            <p style="font-size:13px;color:#666;word-break:break-word;">
              If the button doesn’t work, copy and paste this link into your browser:<br>
              <a href="${url}" style="color:#FF0000;">${url}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f3f3f3;padding:18px;text-align:center;
            font-size:12px;font-family:Arial,sans-serif;color:#777;">
            <p style="margin:0;">
              © ${new Date().getFullYear()} CDC Inspection. All rights reserved.
            </p>
            <p style="margin:6px 0 0;">
              This is an automated message. Replies are monitored.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>

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
  
        if (!email) {
          return res.status(400).json({ error: "Missing required fields" });
        }
  
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
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
          <!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f9f9;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:20px 10px;">

      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">

        <!-- Header -->
        <tr>
          <td style="background:#FF0000;padding:20px;">
            <h1 style="margin:0;font-size:22px;color:#ffffff;font-family:Arial,sans-serif;">
              Property Verification Not Approved
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:25px;font-family:Arial,sans-serif;color:#333;">
            <p style="font-size:16px;margin:0 0 12px;">
              Hello <strong>${name}</strong>,
            </p>

            <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">
              Thank you for submitting your property for verification.
            </p>

            <p style="font-size:15px;line-height:1.6;margin:0 0 15px;">
              After reviewing the information provided, we were unable to approve your
              property verification at this time.
            </p>

            <table width="100%" style="background:#fff5f5;border-left:4px solid #FF0000;margin:20px 0;">
              <tr>
                <td style="padding:14px;font-size:14px;line-height:1.6;">
                  This may be due to missing, incomplete, or unclear details in your submission.
                </td>
              </tr>
            </table>

            <p style="font-size:14px;line-height:1.6;">
              Please review your information and resubmit once the necessary updates are made.
              If you need help, simply reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f3f3f3;padding:18px;text-align:center;
            font-size:12px;font-family:Arial,sans-serif;color:#777;">
            <p style="margin:0;">
              © ${new Date().getFullYear()} CDC Inspection. All rights reserved.
            </p>
            <p style="margin:6px 0 0;">
              This is an automated message. Replies are monitored.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>

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
  
        if (!email || !name || !message) {
          return res.status(400).json({ error: "Missing required fields: email, name, or message" });
        }
  
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
        if (!apiKey) {
          return res.status(500).json({ error: "SendGrid API key missing" });
        }
  
        sgMail.setApiKey(apiKey);
  
        const msg = {
          to: email,
          from: fromEmail,
          subject: "Acknowledgement Report",
          text: `Hello ${name},
  
  ${message}
  
  – CDC Inspection Team`,
          html: `
         <!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f9f9;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:20px 10px;">

      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">

        <!-- Header -->
        <tr>
          <td style="background:#FF0000;padding:20px;">
            <h1 style="margin:0;font-size:22px;color:#ffffff;font-family:Arial,sans-serif;">
              Property Verification Update
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:25px;font-family:Arial,sans-serif;color:#333;">
            <p style="font-size:16px;margin:0 0 12px;">
              Hello <strong>${name}</strong>,
            </p>

            <p style="font-size:15px;line-height:1.6;">
              ${message}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f3f3f3;padding:18px;text-align:center;
            font-size:12px;font-family:Arial,sans-serif;color:#777;">
            <p style="margin:0;">
              © ${new Date().getFullYear()} CDC Inspection. All rights reserved.
            </p>
            <p style="margin:6px 0 0;">
              This is an automated message. Replies are monitored.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>

          `,
        };
  
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

  exports.appointmentUpdated = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { email, name, propertyAddress, previousDateTime, newDateTime } = req.body;

        if (!email || !newDateTime) {
          return res.status(400).json({ error: "Missing required fields: email, newDateTime" });
        }

        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;

        if (!apiKey) {
          return res.status(500).json({ error: "SendGrid API key missing" });
        }

        sgMail.setApiKey(apiKey);

        const displayName = name || "there";

        const msg = {
          to: email,
          from: fromEmail,
          subject: "Your Inspection Appointment Has Been Rescheduled",
          text: `Hello ${displayName},

Your home inspection appointment${propertyAddress ? ` for ${propertyAddress}` : ""} has been rescheduled by our team.

${previousDateTime ? `Previous date & time: ${previousDateTime}\n` : ""}New date & time: ${newDateTime}

If this new time does not work for you, please reply to this email and we will help find another slot.

– CDC Inspection Team`,
          html: `
          <!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f9f9;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:20px 10px;">

      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">

        <!-- Header -->
        <tr>
          <td style="background:#007bff;padding:20px;">
            <h1 style="margin:0;font-size:22px;color:#ffffff;font-family:Arial,sans-serif;">
              Appointment Rescheduled
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:25px;font-family:Arial,sans-serif;color:#333;">
            <p style="font-size:16px;margin:0 0 12px;">
              Hello <strong>${displayName}</strong>,
            </p>

            <p style="font-size:15px;line-height:1.6;margin:0 0 15px;">
              Your home inspection appointment${propertyAddress ? ` for <strong>${propertyAddress}</strong>` : ""} has been rescheduled by our team.
            </p>

            <table width="100%" style="background:#f0f7ff;border-left:4px solid #007bff;margin:20px 0;">
              <tr>
                <td style="padding:14px;font-size:14px;line-height:1.8;">
                  ${previousDateTime ? `<span style="color:#777;text-decoration:line-through;">Previous: ${previousDateTime}</span><br/>` : ""}
                  <strong>New date &amp; time: ${newDateTime}</strong>
                </td>
              </tr>
            </table>

            <p style="font-size:14px;line-height:1.6;">
              If this new time does not work for you, simply reply to this email and we will help find another slot.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f3f3f3;padding:18px;text-align:center;
            font-size:12px;font-family:Arial,sans-serif;color:#777;">
            <p style="margin:0;">
              © ${new Date().getFullYear()} CDC Inspection. All rights reserved.
            </p>
            <p style="margin:6px 0 0;">
              This is an automated message. Replies are monitored.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>

          `,
        };

        await sgMail.send(msg);

        return res.status(200).json({
          success: true,
          message: "Appointment update email sent successfully",
        });
      } catch (error) {
        console.error("appointmentUpdated error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  });

  exports.createPaymentIntent = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
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


        let bookingPayload = null;
      
        if (pendingBookingData) {
          bookingPayload = pendingBookingData;
        } else if (metadata.bookingPayload) {
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
          bookingPayload: bookingPayload,
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

    logger.info("stripeWebhook: request received", {
      method: req.method,
      hasSignature: !!sig,
    });
  
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      logger.info("stripeWebhook: event verified", {
        eventId: event.id,
        eventType: event.type,
        livemode: event.livemode,
      });
    } catch (err) {
      logger.error("stripeWebhook: signature verification failed", {
        message: err.message,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const sessionId = session.id;

          logger.info("stripeWebhook: processing checkout.session.completed", {
            sessionId,
            paymentStatus: session.payment_status,
            amountTotal: session.amount_total,
            currency: session.currency,
          });
  
          const paymentRef = admin.firestore().collection("payments").doc(sessionId);
          const paymentSnap = await paymentRef.get();
  
          if (!paymentSnap.exists) {
            logger.error("stripeWebhook: no payments doc found for session", {
              sessionId,
              hint: "createCheckoutSession did not create the payment doc",
            });
            break;
          }
  
          const paymentData = paymentSnap.data();
          
          // prevent double-processing
          if (paymentData.status === "paid") {
            logger.warn("stripeWebhook: payment already processed", { sessionId });
            break;
          }
  
          // 2) Get bookingPayload
          let bookingPayload = paymentData.bookingPayload || null;
          // let inceptionDate = paymentData.bookingPayload.formattedDateTime || null;
          // let email = paymentData.stripe.customerEmail
  
          if (!bookingPayload && session.metadata?.bookingPayload) {
            try {
              bookingPayload = typeof session.metadata.bookingPayload === 'string'
                ? JSON.parse(session.metadata.bookingPayload)
                : session.metadata.bookingPayload;
              logger.info("stripeWebhook: got bookingPayload from session.metadata", {
                sessionId,
              });
            } catch (e) {
              logger.error("stripeWebhook: failed to parse bookingPayload from metadata", {
                sessionId,
                error: e.message,
              });
            }
          }
  
          if (!bookingPayload) {
            logger.error("stripeWebhook: missing bookingPayload", {
              sessionId,
              paymentDataKeys: Object.keys(paymentData),
              sessionMetadata: session.metadata,
            });
            break;
          }          

          let inceptionDate = bookingPayload.formattedDateTime || null;


          const paymentType = paymentData.paymentType || session.metadata?.paymentType || "pay_now";

          logger.info("stripeWebhook: resolved payment type", {
            sessionId,
            paymentType,
            hasInceptionDate: !!inceptionDate,
          });
  
          let bookingId = null;
  
          if (paymentType === "pay_now") {
            const existing = await admin
              .firestore()
              .collection("bookings")
              .where("stripeSessionId", "==", sessionId)
              .limit(1)
              .get();
  
            if (!existing.empty) {
              bookingId = existing.docs[0].id;
              logger.warn("stripeWebhook: booking already exists", {
                sessionId,
                bookingId,
              });
            } else {
              logger.info("stripeWebhook: creating new booking", { sessionId });
              
              const bookingRef = await admin.firestore().collection("bookings").add({
                ...bookingPayload,
                status: "PAID",
                paymentStatus: "completed",
                stripeSessionId: sessionId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              bookingId = bookingRef.id;
              logger.info("stripeWebhook: booking created", {
                sessionId,
                bookingId,
              });

              if (inceptionDate) {
                await admin.firestore().collection("inspectionDates").add({
                  bookingId: bookingId,
                  inceptionDate: inceptionDate,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                logger.info("stripeWebhook: added inspectionDate for new booking", {
                  bookingId,
                  inceptionDate,
                });
              }
              
            }
          } else if (paymentType === "challenge") {
            const approvalToken = bookingPayload.approvalToken || paymentData.approvalToken;
            
            if (!approvalToken) {
              logger.error("stripeWebhook: challenge flow missing approvalToken", {
                sessionId,
              });
              break;
            }
  
            const bookingsQuery = await admin
              .firestore()
              .collection("bookings")
              .where("approvalToken", "==", approvalToken)
              .limit(1)
              .get();
  
            if (bookingsQuery.empty) {
              logger.error("stripeWebhook: challenge booking not found for approvalToken", {
                sessionId,
                approvalToken,
              });
              break;
            }
  
            const bookingDoc = bookingsQuery.docs[0];
            bookingId = bookingDoc.id;
            inceptionDate = bookingPayload.formattedDateTime;

            logger.info("stripeWebhook: updating challenge booking", {
              sessionId,
              bookingId,
            });

            const { approvalToken: _, timestamp: __, ...bookingDataWithoutToken } = bookingPayload;

            await admin.firestore().collection("bookings").doc(bookingId).update({
              ...bookingDataWithoutToken,
              status: "Approved",
              paymentStatus: "completed",
              stripeSessionId: sessionId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              approvalTokenUsed: true,
              isDiscount:true,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              approvalToken: admin.firestore.FieldValue.delete(),
              approvalTokenExpiresAt: admin.firestore.FieldValue.delete(),
            });

            if (inceptionDate) {
              await admin.firestore().collection("inceptionDates").add({
                bookingId: bookingId,
                inceptionDate: inceptionDate,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              logger.info("stripeWebhook: added inceptionDate for challenge booking", {
                bookingId,
                inceptionDate,
              });
            }
            
  
          } else {
            logger.error("stripeWebhook: unknown paymentType", {
              sessionId,
              paymentType,
            });
            break;
          }
  
          if (!bookingId) {
            logger.error("stripeWebhook: bookingId is null - booking creation/update failed", {
              sessionId,
              paymentType,
            });
            break;
          }
  
          
          const paymentUpdateData = {
            status: "paid",
            bookingId: bookingId,
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
            stripePayload: {
              session: session, 
              event: {
                id: event.id,
                type: event.type,
                created: event.created,
                livemode: event.livemode,
              },
            },
          };
  
          await paymentRef.update(paymentUpdateData);
          logger.info("stripeWebhook: payment marked as paid", {
            sessionId,
            bookingId,
            amountTotal: paymentUpdateData.stripe.amountTotal,
            customerEmail: paymentUpdateData.stripe.customerEmail,
          });
          
          // Send confirmation email to customer
          try {
            const customerEmail = paymentUpdateData.stripe.customerEmail || 
                                paymentData.stripe?.customerEmail || 
                                bookingPayload.verifiedContact?.payerEmail;
            
            if (customerEmail && bookingPayload) {
              // Call the email function internally
              const functionUrl = `https://us-central1-inspection-app-4c592.cloudfunctions.net/paymentSuccessConfirmation`;
              
              // Use internal HTTP call or direct function call
              await fetch(functionUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customerEmail: customerEmail,
                  bookingData: bookingPayload,
                }),
              }).catch(err => {
                // Log error but don't fail the webhook
                logger.error("stripeWebhook: failed to send confirmation email", {
                  customerEmail,
                  error: err.message,
                });
              });
              
              logger.info("stripeWebhook: confirmation email sent", {
                customerEmail,
                bookingId,
              });
            } else {
              logger.warn("stripeWebhook: skipped confirmation email - missing email or bookingPayload", {
                hasCustomerEmail: !!customerEmail,
                hasBookingPayload: !!bookingPayload,
                bookingId,
              });
            }
          } catch (emailError) {
            // Log error but don't fail the webhook
            logger.error("stripeWebhook: error sending confirmation email", {
              message: emailError.message,
              stack: emailError.stack,
            });
          }

          logger.info("stripeWebhook: checkout.session.completed finished", {
            sessionId,
            bookingId,
            paymentType,
          });
          break;
        }
  
        case "checkout.session.async_payment_succeeded": {
          logger.info("stripeWebhook: async payment succeeded - no additional processing", {
            eventId: event.id,
          });
          break;
        }
  
        default:
          logger.info("stripeWebhook: unhandled event type", {
            eventType: event.type,
            eventId: event.id,
          });
      }
  
      return res.json({ received: true });
    } catch (err) {
      logger.error("stripeWebhook: handler error", {
        message: err.message,
        stack: err.stack,
        eventId: event?.id,
        eventType: event?.type,
      });
      return res.json({ received: true });
    }
  });

  exports.paymentSuccessConfirmation = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { customerEmail, bookingData } = req.body;
  
        if (!bookingData || !customerEmail) {
          return res.status(400).json({ error: "Missing required fields: bookingData, customerEmail" });
        }
  
        const apiKey = process.env.SENDGRID_API_KEY;
          const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
        if (!apiKey) {
          return res.status(500).json({ error: "SendGrid API key missing" });
        }
  
        sgMail.setApiKey(apiKey);
  
        // Extract customer name from bookingData
        const firstName = bookingData.verifiedContact?.payeeName?.firstName || 
                         bookingData.verifiedContact?.firstName || 
                         '';
        const lastName = bookingData.verifiedContact?.payeeName?.lastName || 
                        bookingData.verifiedContact?.lastName || 
                        '';
        const customerName = `${firstName} ${lastName}`.trim() || 'Valued Customer';
        
        // Extract booking details
        const propertyAddress = bookingData.property?.address || 'N/A';
        const formattedDateTime = bookingData.formattedDateTime || 
                                  `${bookingData.date || 'N/A'} at ${bookingData.time || 'N/A'}`;
        const price = bookingData.fullPrice || bookingData.price || 0;
        const paymentMethod = bookingData.property?.paymentMethod === 'challenge' ? 'Challenge (50% Discount)' : 'Pay Now';
  
        const msg = {
          to: customerEmail,
          from: fromEmail,
          subject: "Payment Confirmed – Your Home Inspection is Scheduled",
          text: `Hello ${customerName},
  
  Thank you for your payment! Your home inspection has been successfully scheduled.
  
  Booking Details:
  - Property Address: ${propertyAddress}
  - Inspection Date & Time: ${formattedDateTime}
  - Payment Amount: $${price.toFixed(2)}
  - Payment Method: ${paymentMethod}
  
  Our inspector will contact you prior to the scheduled inspection date. If you have any questions or need to reschedule, please don't hesitate to reach out.
  
  Thank you for choosing CDC Inspection!
  
  – CDC Inspection Team`,
          html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background:#FF0000;padding:20px;">
              <h1 style="margin:0;font-size:22px;color:#ffffff;font-family:Arial,sans-serif;">
                Payment Confirmed ✓
              </h1>
            </td>
          </tr>
  
          <!-- Body -->
          <tr>
            <td style="padding:25px;font-family:Arial,sans-serif;color:#333;">
              <p style="font-size:16px;margin:0 0 12px;">
                Hello <strong>${customerName}</strong>,
              </p>
  
              <p style="font-size:15px;line-height:1.6;margin:0 0 15px;">
                Thank you for your payment! Your home inspection has been successfully scheduled.
              </p>
  
              <!-- Booking Details Box -->
              <table width="100%" style="background:#f8f9fa;border-radius:6px;padding:20px;margin:20px 0;border-left:4px solid #FF0000;">
                <tr>
                  <td style="padding:0;">
                    <p style="margin:0 0 10px;font-size:14px;color:#666;"><strong style="color:#333;">Property Address:</strong></p>
                    <p style="margin:0 0 15px;font-size:15px;color:#333;font-weight:500;">${propertyAddress}</p>
                    
                    <p style="margin:0 0 10px;font-size:14px;color:#666;"><strong style="color:#333;">Inspection Date & Time:</strong></p>
                    <p style="margin:0 0 15px;font-size:15px;color:#333;font-weight:500;">${formattedDateTime}</p>
                    
                    <p style="margin:0 0 10px;font-size:14px;color:#666;"><strong style="color:#333;">Payment Amount:</strong></p>
                    <p style="margin:0 0 15px;font-size:15px;color:#333;font-weight:500;">$${price.toFixed(2)}</p>
                    
                    <p style="margin:0 0 10px;font-size:14px;color:#666;"><strong style="color:#333;">Payment Method:</strong></p>
                    <p style="margin:0;font-size:15px;color:#333;font-weight:500;">${paymentMethod}</p>
                  </td>
                </tr>
              </table>
  
              <p style="font-size:14px;line-height:1.6;margin:15px 0;">
                Our inspector will contact you prior to the scheduled inspection date. If you have any questions or need to reschedule, please don't hesitate to reach out.
              </p>
  
              <p style="font-size:14px;line-height:1.6;margin:15px 0;">
                Thank you for choosing CDC Inspection!
              </p>
            </td>
          </tr>
  
          <!-- Footer -->
          <tr>
            <td style="background:#f3f3f3;padding:18px;text-align:center;
              font-size:12px;font-family:Arial,sans-serif;color:#777;">
              <p style="margin:0;">
                © ${new Date().getFullYear()} CDC Inspection. All rights reserved.
              </p>
              <p style="margin:6px 0 0;">
                This is an automated message. Replies are monitored.
              </p>
            </td>
          </tr>
  
        </table>
      </td>
    </tr>
  </table>
  </body>
  </html>
          `,
        };
  
        await sgMail.send(msg);
  
        return res.status(200).json({
          success: true,
          message: "Payment confirmation email sent successfully",
        });
        
      } catch (error) {
        console.error("paymentSuccessConfirmation error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  });
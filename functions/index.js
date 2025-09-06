const {
  onRequest,
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// Initialize Firebase
admin.initializeApp();

// Set global options
setGlobalOptions({
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 60,
});

exports.sendEmail = onCall(
  {
    cors: true, // This enables CORS automatically
  },
  async (req, res) => {
    // Validate request method
    if (req.rawRequest.method !== "POST") {
      // Throwing an HttpsError so that the client gets the error details.
      throw new HttpsError(
        "failed-precondition",
        "Method Not Allowed.",
        JSON.stringify({
          success: false,
          message: "Method Not Allowed",
        })
      );
      // return res.status(405).send({ error: "Method Not Allowed" });
    }

    const { to, prize_image_url, custom_message } = req.data;

    // Validate required fields
    if (!to || !prize_image_url || !custom_message) {
      throw new HttpsError(
        "failed-precondition",
        "Missing required fields.",
        JSON.stringify({
          success: false,
          message: "Missing required fields",
          required: ["to", "imageUri", "message"],
        })
      );
      // return res.status(400).json({
      //   error: "Missing required fields",
      //   required: ["to", "imageUri", "message"],
      // });
    }

    // Set SendGrid API key from environment variable
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "your-sendgrid-api-key-here");
     
    const msg = {
      to,
      from: "info@qemplate.com",
      templateId: "d-7c3db50ed49a43a98cde6720394ccf04",
      dynamicTemplateData: {
        prize_image_url: prize_image_url,
        custom_message: custom_message,
        quiz_title: "Prize Email",
        cta_text: "Get prize",
        cta_url: "www.google.com"
      },
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      throw new HttpsError(
        "failed-precondition",
        "Failed to send email.",
        JSON.stringify({
          success: false,
          message: "Failed to send email",
          error,
        })
      );
    }
    return {
      success: true,
      message: "Email Sent",
    };
  }
);

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const line = require("@line/bot-sdk");
const crypto = require("crypto");
require("dotenv").config();

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
});

const verifySignature = (originalSignature, body) => {
  let text = JSON.stringify(body);
  text = text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    (e) => {
      return (
        "\\u" +
        e.charCodeAt(0).toString(16).toUpperCase() +
        "\\u" +
        e.charCodeAt(1).toString(16).toUpperCase()
      );
    }
  );
  const signature = crypto
    .createHmac("SHA256", process.env.CHANNEL_SECRET)
    .update(text)
    .digest("base64")
    .toString();
  if (signature !== originalSignature) {
    functions.logger.error("Unauthorized");
    return false;
  }
  return true;
};

exports.callback = functions.https.onRequest(async (req, res) => {
  if (req.method === "POST") {
    if (!verifySignature(req.headers["x-line-signature"], req.body)) {
      return res.status(401).send("Unauthorized");
    }

    let event = req.body.events[0];
    if (event === undefined) {
      return res.end();
    }

    if (event.type === "message") {
      if (event.message.type === "text") {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: event.message.text,
        });
      }
    }
  }
  return res.send(req.method);
});

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({ original: original });
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore
  .document("/messages/{documentId}")
  .onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const original = snap.data().original;

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log("Uppercasing", context.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({ uppercase }, { merge: true });
  });

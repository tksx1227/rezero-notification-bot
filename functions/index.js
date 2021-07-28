const { checkUpdate } = require("./src/checkUpdate");

global.functions = require("firebase-functions");
global.admin = require("firebase-admin");
const line = require("@line/bot-sdk");

global.client = new line.Client({
  channelAccessToken: functions.config().env.channel_access_token,
  channelSecret: functions.config().env.channel_secret,
});

exports.scheduledFunction = functions
  .region("asia-east2")
  .pubsub.schedule("every 1 minutes")
  .onRun(async (_) => {
    const collections = [{ name: "rezero", ncode: "N2267BE" }];
    for (const collection of collections) {
      await checkUpdate(collection);
    }
    return null;
  });

admin.initializeApp();

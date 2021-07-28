import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { checkUpdate } from "./checkUpdate";

admin.initializeApp();

exports.scheduledFunction = functions
  .region("asia-east2")
  .pubsub.schedule("every 5 minutes")
  .onRun(async (_) => {
    const collections = [{ name: "rezero", ncode: "N2267BE" }];
    for (const collection of collections) {
      await checkUpdate(collection);
    }
    return null;
  });

export const db = admin.firestore();

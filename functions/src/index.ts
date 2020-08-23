import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const updateLastMessageDate = functions.firestore
  .document('rooms/{roomId}/messages/{messageId}')
  .onCreate((snapshot, context) => {
    const message = snapshot.data();
    if (message.timestamp) {
      const room = snapshot.ref.parent.parent;
      room?.update({ lastMessageTimestamp: message.timestamp });
    }
    return null;
  });

const updateDB = async (colName, data) => {
  const ref = admin.firestore().collection(colName).doc("info");
  await ref.set({
    title: data.title,
    lastPosted: data.lastPosted,
    latestStory: data.latestStory,
  });
};

module.exports = { updateDB };

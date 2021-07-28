const readDB = async (colName) => {
  const ref = admin.firestore().collection(colName).doc("info");
  const doc = await ref.get();
  return doc.data();
};

module.exports = { readDB };

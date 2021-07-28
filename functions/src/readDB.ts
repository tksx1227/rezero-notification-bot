import { db } from "./index";

export const readDB = async (
  colName: string
): Promise<FirebaseFirestore.DocumentData | undefined> => {
  const docName = "info";
  const ref = db.collection(colName).doc(docName);
  const doc = await ref.get();
  return doc.data();
};

import { db } from "./index";
import { DataType } from "./types/data";

export const updateDB = async (
  colName: string,
  data: DataType
): Promise<void> => {
  const docName = "info";
  const ref = db.collection(colName).doc(docName);
  await ref.set({
    title: data.title,
    lastPosted: data.lastPosted,
    latestStory: data.latestStory,
  });
};

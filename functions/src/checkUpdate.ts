import { readDB } from "./readDB";
import { updateDB } from "./updateDB";
import { CollectionType } from "./types/data";
import { fetchNaroInfo } from "./fetchNaroInfo";
import { sendBroadCastMessage } from "./sendBroadCastMessage";

export const checkUpdate = async (
  collection: CollectionType
): Promise<void> => {
  const dbData = await readDB(collection.name);
  const apiData = await fetchNaroInfo(collection.ncode);

  if (dbData === undefined || apiData === undefined) {
    await updateDB(collection.name, apiData);
    return;
  }

  const dbTS = Date.parse(dbData.lastPosted);
  const apiTS = Date.parse(apiData.lastPosted);
  if (dbTS < apiTS && dbData.latestStory < apiData.latestStory) {
    sendBroadCastMessage(collection.ncode, apiData);
    updateDB(collection.name, apiData);
  }
};

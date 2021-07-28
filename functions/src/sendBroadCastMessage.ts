import * as line from "@line/bot-sdk";
import * as Config from "firebase-functions/lib/config";

const client = new line.Client({
  channelAccessToken: Config.config().env.channel_access_token,
  channelSecret: Config.config().env.channel_secret,
});

import { DataType } from "./types/data";

export const sendBroadCastMessage = async (
  ncode: string,
  apiData: DataType
): Promise<void> => {
  const naro_url = "https://ncode.syosetu.com";
  await client.broadcast({
    type: "text",
    text: `"${apiData.title}" の最新話が投稿されました！\n\n${naro_url}/${ncode}/${apiData.latestStory}`,
  });
};

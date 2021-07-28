import axios from "axios";

import { DataType } from "./types/data";

export const fetchNaroInfo = async (ncode: string): Promise<DataType> => {
  const url = "https://api.syosetu.com/novelapi/api/";
  const params = {
    out: "json",
    ncode: ncode,
  };
  const data = {} as DataType;
  await axios
    .get(url, { params })
    .then((res) => {
      const info = res.data[1];
      data.title = info.title;
      data.lastPosted = info.general_lastup;
      data.latestStory = info.general_all_no;
    })
    .catch((err) => {
      console.error(err);
    });
  return data;
};

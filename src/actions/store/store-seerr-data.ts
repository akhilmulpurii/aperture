import {
  SeerrAuthData,
  setSeerrData,
  getSeerrData,
  removeSeerrData,
} from "./server-actions";

export class StoreSeerrData {
  static async set(value: SeerrAuthData) {
    return setSeerrData(value);
  }

  static async get(): Promise<SeerrAuthData | null> {
    return getSeerrData();
  }

  static async remove() {
    return removeSeerrData();
  }
}

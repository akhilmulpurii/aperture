import { getServerUrl, setServerUrl, removeServerUrl } from "./server-actions";

export class StoreServerURL {
  static async set(value: string) {
    return setServerUrl(value);
  }

  static async get(): Promise<string | null> {
    return getServerUrl();
  }

  static async remove() {
    return removeServerUrl();
  }
}

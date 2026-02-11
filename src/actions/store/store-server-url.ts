// storage.ts
import secureLocalStorage from "react-secure-storage";

export class StoreServerURL {
  private static SERVER_URL_KEY = "jellyfin-server-url";

  static async set(value: string) {
    secureLocalStorage.setItem(this.SERVER_URL_KEY, value);
  }

  static async get(): Promise<string | null> {
    const val = secureLocalStorage.getItem(this.SERVER_URL_KEY);
    return val ? String(val) : null;
  }

  static async remove() {
    secureLocalStorage.removeItem(this.SERVER_URL_KEY);
  }
}

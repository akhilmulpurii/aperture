// storage.ts
import { AuthenticationResult } from "@jellyfin/sdk/lib/generated-client/models";
import secureLocalStorage from "react-secure-storage";

interface AuthData {
  serverUrl: string;
  user: AuthenticationResult & { AccessToken: string };
  timestamp: number;
}

export class StoreAuthData {
  private static AUTH_DATA_KEY = "jellyfin-auth";

  static async set(value: AuthData) {
    secureLocalStorage.setItem(this.AUTH_DATA_KEY, value);
  }

  static async get(): Promise<AuthData | null> {
    const val = secureLocalStorage.getItem(this.AUTH_DATA_KEY);
    if (!val) return null;

    try {
      // secureLocalStorage may store JSON strings, so parse it
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      return parsed as AuthData;
    } catch {
      return null;
    }
  }
  static async remove() {
    secureLocalStorage.removeItem(this.AUTH_DATA_KEY);
  }
}

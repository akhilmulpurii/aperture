import { isTauri } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";
import secureLocalStorage from "react-secure-storage";

export type SeerrAuthType = "api-key" | "jellyfin-user" | "local-user";

export interface SeerrAuthData {
  serverUrl: string;
  authType: SeerrAuthType;
  apiKey?: string;
  username?: string;
  password?: string;
}

export class StoreSeerrData {
  private static store: Store | null;
  private static SEERR_DATA_KEY = "seerr-config";

  private static async getStore() {
    if (!this.store) {
      this.store = isTauri() ? await Store.load("app.json") : null;
    }
    return this.store;
  }

  static async set(value: SeerrAuthData) {
    if (isTauri()) {
      const store = await this.getStore();
      if (store) {
        await store.set(this.SEERR_DATA_KEY, value);
        await store.save();
      }
    } else {
      secureLocalStorage.setItem(this.SEERR_DATA_KEY, value);
    }
  }

  static async get(): Promise<SeerrAuthData | null> {
    if (isTauri()) {
      const store = await this.getStore();
      if (store) {
        const val = await store.get(this.SEERR_DATA_KEY);
        return val ? (val as SeerrAuthData) : null;
      }
      return null;
    } else {
      const val = secureLocalStorage.getItem(this.SEERR_DATA_KEY);
      if (!val) return null;

      try {
        const parsed = typeof val === "string" ? JSON.parse(val) : val;
        return parsed as SeerrAuthData;
      } catch {
        return null;
      }
    }
  }

  static async remove() {
    if (isTauri()) {
      const store = await this.getStore();
      if (store) {
        await store.delete(this.SEERR_DATA_KEY);
        await store.save();
      }
    } else {
      secureLocalStorage.removeItem(this.SEERR_DATA_KEY);
    }
  }
}

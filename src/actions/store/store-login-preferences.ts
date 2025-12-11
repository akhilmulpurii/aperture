import { isTauri } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";
import secureLocalStorage from "react-secure-storage";

interface LoginPreferences {
  username?: string;
  serverUrl?: string;
}

export class StoreLoginPreferences {
  private static store: Store | null;
  private static KEY = "login-preferences";

  private static async getStore() {
    if (!this.store) {
      this.store = isTauri() ? await Store.load("app.json") : null;
    }
    return this.store;
  }

  static async set(value: LoginPreferences) {
    if (isTauri()) {
      const store = await this.getStore();
      if (store) {
        await store.set(this.KEY, value);
        await store.save();
      }
    } else {
      secureLocalStorage.setItem(this.KEY, JSON.stringify(value));
    }
  }

  static async get(): Promise<LoginPreferences | null> {
    if (isTauri()) {
      const store = await this.getStore();
      if (store) {
        const val = await store.get<LoginPreferences>(this.KEY);
        return (val as LoginPreferences) || null;
      }
      return null;
    }

    const raw = secureLocalStorage.getItem(this.KEY);
    if (!raw || typeof raw !== "string") return null;
    try {
      return JSON.parse(raw) as LoginPreferences;
    } catch {
      return null;
    }
  }

  static async remove() {
    if (isTauri()) {
      const store = await this.getStore();
      if (store) {
        await store.delete(this.KEY);
        await store.save();
      }
    } else {
      secureLocalStorage.removeItem(this.KEY);
    }
  }
}

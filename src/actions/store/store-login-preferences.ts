import {
  getLoginPreferences,
  setLoginPreferences,
  removeLoginPreferences,
  LoginPreferences,
} from "./server-actions";

export class StoreLoginPreferences {
  static async set(value: LoginPreferences) {
    return setLoginPreferences(value);
  }

  static async get(): Promise<LoginPreferences | null> {
    return getLoginPreferences();
  }

  static async remove() {
    return removeLoginPreferences();
  }
}

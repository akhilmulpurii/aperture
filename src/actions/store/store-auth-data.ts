import {
  getAuthData,
  setAuthData,
  removeAuthData,
  AuthData,
} from "./server-actions";

export class StoreAuthData {
  static async set(value: AuthData) {
    return setAuthData(value);
  }

  static async get(): Promise<AuthData | null> {
    return getAuthData();
  }

  static async remove() {
    return removeAuthData();
  }
}

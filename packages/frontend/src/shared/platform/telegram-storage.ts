import { getWebApp } from "./telegram-platform";

type StorageCallback<T> = (error: string | null, value: T) => void;

type DeviceStorage = {
  getItem: (key: string, callback?: StorageCallback<string>) => unknown;
  setItem: (
    key: string,
    value: string,
    callback?: StorageCallback<boolean>,
  ) => unknown;
  removeItem: (key: string, callback?: StorageCallback<boolean>) => unknown;
  clear?: (callback?: StorageCallback<boolean>) => unknown;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

class LocalDeviceStorage implements DeviceStorage {
  getItem(key: string, callback?: StorageCallback<string>): this {
    try {
      callback?.(null, localStorage.getItem(key) ?? "");
    } catch (error) {
      callback?.(getErrorMessage(error), "");
    }
    return this;
  }

  setItem(
    key: string,
    value: string,
    callback?: StorageCallback<boolean>,
  ): this {
    try {
      localStorage.setItem(key, value);
      callback?.(null, true);
    } catch (error) {
      callback?.(getErrorMessage(error), false);
    }
    return this;
  }

  removeItem(key: string, callback?: StorageCallback<boolean>): this {
    try {
      localStorage.removeItem(key);
      callback?.(null, true);
    } catch (error) {
      callback?.(getErrorMessage(error), false);
    }
    return this;
  }

  clear(callback?: StorageCallback<boolean>): this {
    try {
      localStorage.clear();
      callback?.(null, true);
    } catch (error) {
      callback?.(getErrorMessage(error), false);
    }
    return this;
  }
}

const localDeviceStorage = new LocalDeviceStorage();
let deviceStorage: DeviceStorage | null = null;

function getDeviceStorage(): DeviceStorage {
  if (deviceStorage) return deviceStorage;

  const webApp = getWebApp() as { DeviceStorage?: DeviceStorage } | null;
  deviceStorage = webApp?.DeviceStorage ?? localDeviceStorage;
  return deviceStorage;
}

export function storageGet(key: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      getDeviceStorage().getItem(key, (error, value) => {
        if (!error) {
          resolve(value ?? "");
          return;
        }

        localDeviceStorage.getItem(key, (_fallbackError, fallbackValue) => {
          resolve(fallbackValue ?? "");
        });
      });
    } catch {
      localDeviceStorage.getItem(key, (_error, value) => {
        resolve(value ?? "");
      });
    }
  });
}

export function storageSet(key: string, value: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      getDeviceStorage().setItem(key, value, (error) => {
        if (!error) {
          resolve();
          return;
        }

        localDeviceStorage.setItem(key, value, () => {
          resolve();
        });
      });
    } catch {
      localDeviceStorage.setItem(key, value, () => {
        resolve();
      });
    }
  });
}

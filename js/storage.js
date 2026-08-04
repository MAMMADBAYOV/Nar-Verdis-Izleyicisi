const STORAGE_PREFIX = "nar_storage_";

if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(STORAGE_PREFIX + key);

      if (value === null) {
        throw new Error(`Key not found: ${key}`);
      }

      return {
        key,
        value,
        shared: false
      };
    },

    async set(key, value) {
      localStorage.setItem(STORAGE_PREFIX + key, value);

      return {
        key,
        value,
        shared: false
      };
    },

    async delete(key) {
      localStorage.removeItem(STORAGE_PREFIX + key);

      return {
        key,
        deleted: true,
        shared: false
      };
    },

    async list(prefix = "") {
      const keys = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(STORAGE_PREFIX + prefix)) {
          keys.push(key.slice(STORAGE_PREFIX.length));
        }
      }

      return {
        keys,
        prefix,
        shared: false
      };
    }
  };
}

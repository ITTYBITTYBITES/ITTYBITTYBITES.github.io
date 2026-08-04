/**
 * YearGlass — IndexedDB Save Engine
 *
 * Persists the sanctuary state to IndexedDB. Keyed operations are stored in
 * object stores and written through a small request-promise wrapper so the
 * simulation code never blocks on the main thread. If IndexedDB is
 * unavailable (private mode, some embedded webviews) it transparently falls
 * back to in-memory storage so the sanctuary still works for the session.
 */

export interface SaveData {
  key: string;
  value: unknown;
  updatedAt: number;
}

const DB_NAME = 'yearglass-save';
const DB_VERSION = 1;
const STORE = 'state';
const META = 'meta';

export class SaveEngine {
  private db: IDBDatabase | null = null;
  private memory = new Map<string, SaveData>();
  private usingIDB = false;
  private initPromise: Promise<boolean> | null = null;

  open(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.openInternal();
    return this.initPromise;
  }

  private openInternal(): Promise<boolean> {
    if (typeof indexedDB === 'undefined') {
      this.usingIDB = false;
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch {
        this.usingIDB = false;
        resolve(false);
        return;
      }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(META)) {
          db.createObjectStore(META, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        this.usingIDB = true;
        resolve(true);
      };
      request.onerror = () => {
        this.db = null;
        this.usingIDB = false;
        resolve(false);
      };
      request.onblocked = () => {
        this.usingIDB = false;
        resolve(false);
      };
    });
  }

  async put(key: string, value: unknown): Promise<void> {
    await this.open();
    const record: SaveData = { key, value, updatedAt: Date.now() };
    if (this.usingIDB && this.db) {
      return this.transact(STORE, 'readwrite', (store) => {
        store.put(record);
      });
    }
    this.memory.set(key, record);
  }

  async get<T>(key: string): Promise<T | null> {
    await this.open();
    if (this.usingIDB && this.db) {
      return this.transact<T | null>(STORE, 'readonly', (store) => {
        return store.get(key);
      }).then((record) => {
        if (record && typeof record === 'object') {
          return (record as unknown as SaveData).value as T;
        }
        return record as T | null;
      });
    }
    const record = this.memory.get(key);
    return record ? (record.value as T) : null;
  }

  async del(key: string): Promise<void> {
    await this.open();
    if (this.usingIDB && this.db) {
      return this.transact(STORE, 'readwrite', (store) => {
        store.delete(key);
      });
    }
    this.memory.delete(key);
  }

  async getKeys(): Promise<string[]> {
    await this.open();
    if (this.usingIDB && this.db) {
      return this.transact<IDBValidKey[]>(STORE, 'readonly', (store) => store.getAllKeys()).then(
        (keys) => (keys || []).map((k) => String(k))
      );
    }
    return Array.from(this.memory.keys());
  }

  async clear(): Promise<void> {
    await this.open();
    if (this.usingIDB && this.db) {
      return this.transact(STORE, 'readwrite', (store) => {
        store.clear();
      });
    }
    this.memory.clear();
  }

  private transact<T>(
    storeName: string,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest | void
  ): Promise<T> {
    const db = this.db as IDBDatabase;
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const req = action(store);
      let result: T | undefined;
      if (req) {
        req.onsuccess = () => {
          result = (req as IDBRequest<T>).result;
        };
      }
      tx.oncomplete = () => resolve(result as T);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  /** Close the database (called on teardown). */
  close(): void {
    if (this.db) {
      try {
        this.db.close();
      } catch {
        /* ignore */
      }
      this.db = null;
    }
    this.initPromise = null;
  }
}

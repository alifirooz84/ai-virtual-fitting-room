import { ClothingProduct } from '../types/clothing';

const DB_NAME = 'VTON_FITTING_ROOM_DB';
const DB_VERSION = 1;
const STORE_NAME = 'products';
const LOCAL_STORAGE_KEY = 'vton_user_custom_products';

/**
 * Native IndexedDB Wrapper for Virtual Fitting Room.
 * Unlike localStorage (which hard-caps at 5MB and drops large base64 images),
 * IndexedDB has virtually unlimited storage (hundreds of megabytes) in all modern browsers.
 */
class IndexedDbStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: ClothingProduct[] = [];

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return reject(new Error('IndexedDB not supported'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('storeSlug', 'storeSlug', { unique: false });
          store.createIndex('slot', 'slot', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Automatically migrates legacy localStorage items into IndexedDB and clears the 5MB bottleneck.
   */
  public async migrateFromLocalStorage(): Promise<ClothingProduct[]> {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          for (const item of list) {
            await this.saveProduct(item);
          }
          // Clear legacy key to free up 5MB localStorage quota for other browser features
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('[IndexedDB] LocalStorage migration:', e);
    }
    return this.getAllProducts();
  }

  /**
   * Save or update a product in IndexedDB
   */
  public async saveProduct(product: ClothingProduct): Promise<void> {
    // 1. Update memory cache
    this.memoryCache = [product, ...this.memoryCache.filter((p) => p.id !== product.id)];

    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(product);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Save fallback to memory:', e);
    }
  }

  /**
   * Get all custom products stored by user
   */
  public async getAllProducts(): Promise<ClothingProduct[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const result = (req.result || []) as ClothingProduct[];
          // Sort newest first
          result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          this.memoryCache = result;
          resolve(result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.memoryCache;
    }
  }

  /**
   * Delete a product from IndexedDB
   */
  public async deleteProduct(id: string): Promise<void> {
    this.memoryCache = this.memoryCache.filter((p) => p.id !== id);
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Delete error:', e);
    }
  }

  /**
   * Synchronous cached read for initial component render
   */
  public getCachedProducts(): ClothingProduct[] {
    return this.memoryCache;
  }
}

export const dbStorage = new IndexedDbStorage();

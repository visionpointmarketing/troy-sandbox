/**
 * TROY Sandbox — Image Storage
 * Stores images in IndexedDB for persistence
 */

const DB_NAME = 'troy-sandbox-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let db = null;
let initPromise = null;

/**
 * Initialize the database
 */
export async function initImageStore() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Failed to open image database');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Ensure database is initialized (prevents race conditions)
 */
async function ensureInit() {
    if (db) return db;
    if (!initPromise) {
        initPromise = initImageStore();
    }
    return initPromise;
}

/**
 * Store an image
 * @param {string} id - Unique identifier (usually sectionId-fieldName)
 * @param {string} data - Base64 image data
 */
export async function storeImage(id, data) {
    await ensureInit();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id, data, timestamp: Date.now() });

        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get an image by ID
 * @param {string} id - Image identifier
 * @returns {Promise<string|null>} Base64 image data or null
 */
export async function getImage(id) {
    await ensureInit();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result ? request.result.data : null);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete an image
 * @param {string} id - Image identifier
 */
export async function deleteImage(id) {
    await ensureInit();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all images
 * @returns {Promise<Object>} Map of id -> data
 */
export async function getAllImages() {
    await ensureInit();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const images = {};
            request.result.forEach(item => {
                images[item.id] = item.data;
            });
            resolve(images);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Clear all images
 */
export async function clearAllImages() {
    await ensureInit();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Read a file as base64 data URL
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 data URL
 */
export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

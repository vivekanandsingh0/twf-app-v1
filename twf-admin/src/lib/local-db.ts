import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

// Ensure DB exists
if (!fs.existsSync(DB_PATH)) {
    const initialData = { profiles: [], products: [], orders: [], vendors: [], vendor_requests: [] };
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

// Helper to read/write
async function readDb() {
    const data = await fs.promises.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function writeDb(data: any) {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export const localDb = {
    profiles: {
        getAll: async () => (await readDb()).profiles,
        create: async (profile: any) => {
            const db = await readDb();
            // Check if exists
            const exists = db.profiles.find((p: any) => p.phone_number === profile.phone_number);
            if (exists) return exists;

            db.profiles.unshift(profile);
            await writeDb(db);
            return profile;
        },
        update: async (id: string, updates: any) => {
            const db = await readDb();
            const index = db.profiles.findIndex((p: any) => p.id === id);
            if (index === -1) return null; // Create logic handled in API if needed but simplified here

            db.profiles[index] = { ...db.profiles[index], ...updates };
            await writeDb(db);
            return db.profiles[index];
        }
    },
    orders: {
        getAll: async () => (await readDb()).orders,
        getById: async (id: string) => (await readDb()).orders.find((o: any) => o.id === id),
        create: async (order: any) => {
            const db = await readDb();
            db.orders.unshift(order);
            await writeDb(db);
            return order;
        },
        update: async (id: string, updates: any) => {
            const db = await readDb();
            const index = db.orders.findIndex((o: any) => o.id === id);
            if (index === -1) return null;

            db.orders[index] = { ...db.orders[index], ...updates };
            await writeDb(db);
            return db.orders[index];
        }
    },
    products: {
        getAll: async () => (await readDb()).products,
        create: async (product: any) => {
            const db = await readDb();
            db.products.unshift(product);
            await writeDb(db);
            return product;
        },
        update: async (id: string, updates: any) => {
            const db = await readDb();
            const index = db.products.findIndex((p: any) => p.id === id);
            if (index === -1) return null;
            db.products[index] = { ...db.products[index], ...updates };
            await writeDb(db);
            return db.products[index];
        },
        delete: async (id: string) => {
            const db = await readDb();
            db.products = db.products.filter((p: any) => p.id !== id);
            await writeDb(db);
            return true;
        }
    },
    vendors: {
        getAll: async () => {
            // Return profiles that are vendors
            const db = await readDb();
            return db.profiles.filter((p: any) => p.user_type === 'Vendor');
        },
        getRequests: async () => (await readDb()).vendor_requests
    },
    dashboard: {
        getStats: async () => {
            const db = await readDb();
            const vendors = db.profiles.filter((p: any) => p.user_type === 'Vendor');
            return {
                products: db.products.length,
                farmers: vendors.length,
                users: db.profiles.length
            };
        }
    }
};

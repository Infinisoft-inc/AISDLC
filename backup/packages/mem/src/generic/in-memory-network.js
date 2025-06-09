// Shared in-memory storage
const storage = new Map();
export const InMemoryNetwork = {
    async write(key, data) {
        try {
            storage.set(key, data);
            return {
                success: true,
                data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    async read(key) {
        try {
            const data = storage.get(key);
            if (data === undefined) {
                return {
                    success: false,
                    error: `Key '${key}' not found`
                };
            }
            return {
                success: true,
                data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    async update(key, data) {
        try {
            if (!storage.has(key)) {
                return {
                    success: false,
                    error: `Key '${key}' not found for update`
                };
            }
            storage.set(key, data);
            return {
                success: true,
                data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    async delete(key) {
        try {
            const deleted = storage.delete(key);
            return {
                success: true,
                data: deleted
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    async list() {
        try {
            const items = Array.from(storage.values());
            return {
                success: true,
                data: items,
                totalCount: items.length,
                limit: items.length,
                pageSize: items.length,
                pageNumber: 1
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                error: error instanceof Error ? error.message : 'Unknown error',
                totalCount: 0,
                limit: 0,
                pageSize: 0,
                pageNumber: 1
            };
        }
    }
};
//# sourceMappingURL=in-memory-network.js.map
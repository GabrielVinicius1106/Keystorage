// Um Key Storage baseado no REDIS.
// Auxiliar Functions
function isExpired(expires_at) {
    return expires_at.getTime() <= new Date().getTime();
}
// TTL: Miliseconds
function calculateTimeToLive(expires_at) {
    const expiresAtTime = expires_at.getTime();
    const now = new Date().getTime();
    const seconds = Math.floor(expiresAtTime - now);
    return seconds;
}
class Keystorage {
    map;
    constructor() {
        this.map = new Map();
    }
    // Set a NEW VALUE to MEMORY
    SET(key, value, expires_in) {
        const expireTime = new Date(Date.now() + expires_in);
        const created_at = new Date();
        const expires_at = new Date(expireTime);
        const new_element = {
            key,
            value,
            created_at,
            expires_at,
            time_to_live: expires_in
        };
        const created = this.map.set(key, new_element);
        if (created)
            return new_element;
        return null;
    }
    // Get a VALUE from MEMORY
    GET(key) {
        const res = this.map.get(key);
        // If KEY NOT EXISTS
        if (res === undefined)
            return null;
        const { value, created_at, expires_at } = res;
        const ttl = calculateTimeToLive(expires_at);
        // If KEY is EXPIRED
        if (isExpired(expires_at))
            return null;
        return {
            key,
            value,
            created_at,
            expires_at,
            time_to_live: calculateTimeToLive(expires_at)
        };
    }
    // Delete a VALUE from MEMORY
    DEL(key) {
        return this.map.delete(key);
    }
    // Verify if a KEY / VALUE EXISTS
    EXISTS(key) {
        const value = this.map.get(key);
        return value ? true : false;
    }
    // Time to Live for a KEY
    TTL(key) {
        const res = this.map.get(key);
        if (res === undefined)
            return 0;
        const timeToLive = res.expires_at.getTime() - new Date().getTime();
        return timeToLive;
    }
    GET_ALL() {
        let map_elements = [];
        map_elements.push(...this.map);
        let elements = [];
        for (const a of map_elements) {
            const { key, value, created_at, expires_at, time_to_live } = a[1];
            // If INVALID KEY_VALUE. Continue.
            if (isExpired(expires_at))
                continue;
            const element = {
                key,
                value,
                created_at,
                expires_at,
                time_to_live: calculateTimeToLive(expires_at)
            };
            elements.push(element);
        }
        return elements;
    }
}
const k_storage = new Keystorage();
export { k_storage };
//# sourceMappingURL=keystorage.js.map
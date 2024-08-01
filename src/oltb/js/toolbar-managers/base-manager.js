/**
 * About:
 * BaseManager
 * 
 * Description:
 * Abstract base class that all other Managers extends.
 */
class BaseManager {
    static async initAsync(options = {}) {
        throw new Error('Abstract base class');
    }

    static setMap(map) {
        throw new Error('Abstract base method');
    }

    static getName() {
        throw new Error('Abstract base method');
    }
}

export { BaseManager };
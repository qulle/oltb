/**
 * About:
 * BaseManager
 * 
 * Description:
 * Abstract base class that all other Manager extends.
 */
class BaseManager {
    static async initAsync(options = {}) {
        if(this.constructor == BaseManager) {
            throw new Error('Abstract base class');
        }
    }

    static setMap(map) {
        throw new Error('Abstract base method');
    }

    static getName() {
        throw new Error('Abstract base method');
    }
}

export { BaseManager };
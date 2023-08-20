import { LogManager } from '../core/managers/LogManager';

const FILENAME = 'helpers/Assert.js';

class Assert {
    static check(condition, message) {
        LogManager.logDebug(FILENAME, 'check', {
            condition: condition,
            message: message
        });

        if(!condition) {
            throw new Error(`Assertion failed - ${message}`);
        }
    }

    static isTrue(value, message) {
        this.check((value === true), message);
    }

    static isFalse(value, message) {
        this.check((value === false), message);
    }
    
    static equalTo(left, right, message) {
        this.check((left === right), message);
    }

    static notEqualTo(left, right, message) {
        this.check((left !== right), message);
    }

    static objectIs(left, right, message) {
        this.check((Object.is(left, right)), message);
    }

    static objectIsNot(left, right, message) {
        this.check((!Object.is(left, right)), message);
    }

    static greaterThan(left, right, message) {
        this.check((left > right), message);
    }
	
    static greaterThanOrEqualTo(left, right, message) {
        this.check((left >= right), message);
    }
    
    static lessThan(left, right, message) {
        this.check((left < right), message);
    }

    static lessThanOrEqualTo(left, right, message) {
        this.check((left <= right), message);
    }
}

export { Assert };
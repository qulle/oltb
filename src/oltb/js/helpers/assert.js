class Assert {
    static check(condition, message) {
        if(!condition) {
            throw new Error(`Assertion failed - ${message}`);
        }
    }

    static isTrue(value) {
        this.check((value === true), `${value} === true`);
    }

    static isFalse(value) {
        this.check((value === false), `${value} === false`);
    }
    
    static equalTo(left, right) {
        this.check((left === right), `${left} === ${right}`);
    }

    static notEqualTo(left, right) {
        this.check((left !== right), `${left} !== ${right}`);
    }

    static objectIs(left, right) {
        this.check((Object.is(left, right)), `Object.is(${left}, ${right})`);
    }

    static objectIsNot(left, right) {
        this.check((!Object.is(left, right)), `!Object.is(${left}, ${right})`);
    }

    static greaterThan(left, right) {
        this.check((left > right), `${left} > ${right}`);
    }
	
    static greaterThanOrEqualTo(left, right) {
        this.check((left >= right), `${left} >= ${right}`);
    }
    
    static lessThan(left, right) {
        this.check((left < right), `${left} < ${right}`);
    }

    static lessThanOrEqualTo(left, right) {
        this.check((left <= right), `${left} <= ${right}`);
    }
}

export { Assert };
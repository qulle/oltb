import { describe, it, expect } from '@jest/globals';
import './json-cycle';

describe('JSONCycle', () => {
    it('should have two methods [decycle, retrocycle]', () => {
        expect(typeof JSON.decycle === 'function');
        expect(typeof JSON.retrocycle === 'function');
    });
});
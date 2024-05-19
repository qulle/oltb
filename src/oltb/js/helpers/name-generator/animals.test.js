import { describe, it, expect } from '@jest/globals';
import { Animals } from './animals';

describe('Animals', () => {
    it('should be a list containing items', () => {
        expect(Animals).toBeTruthy();
        expect(Animals.length).toBeGreaterThan(0);
    });
});
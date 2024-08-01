import { describe, it, expect } from '@jest/globals';
import { Adjectives } from './adjectives';

describe('Adjectives', () => {
    it('should be a list containing items', () => {
        expect(Adjectives).toBeTruthy();
        expect(Adjectives.length).toBeGreaterThan(0);
    });
});
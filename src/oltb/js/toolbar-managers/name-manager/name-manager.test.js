import { describe, it, expect } from '@jest/globals';
import { NameManager } from './name-manager';
import '../../browser-prototypes/string';

describe('NameManager', () => {
    it('should create a concatenated name', () => {
        const name = NameManager.generate();
        expect(name.length).toBeGreaterThan(0);
        expect(name).toContain(' ');
    });
});
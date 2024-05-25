import { describe, it, expect } from '@jest/globals';
import { BaseManager } from './base-manager';

describe('BaseManager', () => {
    it('should throw error for all methods since abstract class', async () => {
        await expect(BaseManager.initAsync({})).rejects.toThrow();
        expect(() => BaseManager.setMap()).toThrow();
        expect(() => BaseManager.getName()).toThrow();
    });
});
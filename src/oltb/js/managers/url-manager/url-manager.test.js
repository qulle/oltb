import { describe, it, expect } from '@jest/globals';
import { UrlManager } from "./url-manager";

const FILENAME = 'url-manager.js';

describe('UrlManager', () => {
    it('should init the manager', async () => {
        return UrlManager.initAsync({}).then((data) => {
            expect(data).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should return the correct filename', () => {
        expect(UrlManager.getName()).toBe(FILENAME);
    });
});
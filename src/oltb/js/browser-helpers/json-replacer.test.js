import { describe, beforeAll, it, expect } from '@jest/globals';
import { jsonReplacer } from './json-replacer';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
class MockResponse {
    constructor() {}
}

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('JsonReplacer', () => {
    beforeAll(async () => {
        window.Response = MockResponse;
    });

    it('should return undefined for ignored key', () => {
        const key = 'marker';
        const value = 1;

        const result = jsonReplacer(key, value);
        expect(result).toBe(undefined);
    });

    it('should return number as is', () => {
        const key = 'jest';
        const value = 1;

        const result = jsonReplacer(key, value);
        expect(result).toBe(1);
    });

    it('should return string as is', () => {
        const key = 'jest';
        const value = 'foobar';

        const result = jsonReplacer(key, value);
        expect(result).toBe('foobar');
    });

    it('should return custom Error object', () => {
        const key = 'jest';
        const value = new Error();

        const result = jsonReplacer(key, value);
        ['name', 'message', 'fileName', 'lineNumber', 'columnNumber', 'stack', 'cause'].forEach((prop) => {
            expect(result).toHaveProperty(prop);
        });
    });

    it('should return custom Response object', () => {
        const key = 'jest';
        const value = new Response();

        const result = jsonReplacer(key, value);
        ['ok', 'redirect', 'status', 'statusText', 'type', 'url'].forEach((prop) => {
            expect(result).toHaveProperty(prop);
        });
    });
});
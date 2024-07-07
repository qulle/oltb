import { describe, it, expect } from '@jest/globals';
import './json-cycle';

describe('JSONCycle', () => {
    it('should have two methods [decycle, retrocycle]', () => {
        expect(typeof JSON.decycle === 'function');
        expect(typeof JSON.retrocycle === 'function');
    });

    it('should run [decycle]', () => {
        const input = {
            lon: 1234, 
            lat: 4321, 
            values: [0, 1, 2], 
            items: {
                a: 'foo', 
                b: 'bar'
            }
        };
        const output = JSON.stringify(JSON.decycle(input));

        expect(output).toEqual('{"lon":1234,"lat":4321,"values":[0,1,2],"items":{"a":"foo","b":"bar"}}');
    });

    it('should run [retrocycle]', () => {
        const input = '{"lon":1234,"lat":4321,"values":[0,1,2],"items":{"a":"foo","b":"bar"}}';
        const output = JSON.retrocycle(JSON.parse(input));

        expect(output).toStrictEqual({
            lon: 1234, 
            lat: 4321, 
            values: [0, 1, 2], 
            items: {
                a: 'foo', 
                b: 'bar'
            }
        });
    });
});
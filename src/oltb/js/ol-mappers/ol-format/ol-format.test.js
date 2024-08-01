import { describe, it, expect } from '@jest/globals';
import { FormatOptions, FormatType, instantiateFormat } from './ol-format';

describe('OpenLayers Format', () => {
    it('should have two format-options', () => {
        expect(FormatOptions.length).toBe(2);
    });

    it('should have all format-options as keys in format-type', () => {
        FormatOptions.forEach((option) => {
            expect(FormatType[option.value]).toBeTruthy();
        });
    });

    it('should instantiate each format-type', () => {
        FormatOptions.forEach((option) => {
            const value = option.value;
            const format = instantiateFormat(option.value, {});

            expect(format).toBeTruthy();
            expect(format).toBeInstanceOf(FormatType[value]);
        });
    });

    it('should return null for unknown format', () => {
        expect(instantiateFormat('unknown-format', {})).toBeNull();
    });
});
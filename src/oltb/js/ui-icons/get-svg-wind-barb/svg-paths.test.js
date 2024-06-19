import { describe, it, expect } from '@jest/globals';
import { SvgPaths } from "./svg-paths";

describe('SvgPaths', () => {
    it('should be valid object', () => {
        expect(SvgPaths).toBeTruthy();
    });

    it('should have two base values [knot0, knot2]', () => {
        const knot0 = 'knot0';
        expect(SvgPaths[knot0]).toBeTruthy();
        expect(SvgPaths[knot0]).toContain('<path');
        expect(SvgPaths[knot0]).toContain('/>');
       
        const knot2 = 'knot2';
        expect(SvgPaths[knot2]).toBeTruthy();
        expect(SvgPaths[knot2]).toContain('<path');
        expect(SvgPaths[knot2]).toContain('/>');
    });

    it('should have range from [knot5, knot190]', () => {
        const baseKey = 'knot';
        const step = 5;
        const startIndex = 5;
        const endIndex = 190;
        
        for(let i = startIndex; i <= endIndex; i = i + step) {
            expect(SvgPaths[`${baseKey}${i}`]).toBeTruthy();
            expect(SvgPaths[`${baseKey}${i}`]).toContain('<path');
            expect(SvgPaths[`${baseKey}${i}`]).toContain('/>');
        }
    });
});
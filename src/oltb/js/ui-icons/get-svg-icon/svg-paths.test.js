import { describe, it, expect } from '@jest/globals';
import { SvgPaths } from "./svg-paths";

describe('SvgPaths', () => {
    it('should be valid object', () => {
        expect(SvgPaths).toBeTruthy();
    });

    it('should only be [stroked, filled, mixed] as second level keys', () => {
        const allowed = ['stroked', 'filled', 'mixed'];
        for(const types of Object.values(SvgPaths)) {
            for(const [type, path] of Object.entries(types)) {
                expect(allowed).toContain(type);
                expect(path).toContain('<path');
                expect(path).toContain('/>');
            }
        }
    });
});
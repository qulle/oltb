import { describe, it, expect } from '@jest/globals';
import { SvgPaths } from './svg-paths';
import { getSvgIcon } from './get-svg-icon';

describe('getSvgIcon', () => {
    it('should create default svg-icon', () => {
        const icon = getSvgIcon({});

        expect(icon).toBeTruthy();
        expect(icon).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
        expect(icon).toContain('</svg>');
        expect(icon).toContain(SvgPaths.airplane.stroked);
        expect(icon).toContain('width="24"');
        expect(icon).toContain('height="24"');
        expect(icon).toContain('fill="currentColor"');
        expect(icon).toContain('stroke="#FFFFFFFF"');
        expect(icon).toContain('stroke-width="0"');
        expect(icon).toContain('class=""');
    });

    it('should create svg-icon by given path "SvgPaths.geoPin.stroked"', () => {
        const icon = getSvgIcon({
            path: SvgPaths.geoPin.stroked,
            width: 36,
            height: 36
        });

        expect(icon).toBeTruthy();
        expect(icon).toContain(SvgPaths.geoPin.stroked);
        expect(icon).toContain('width="36"');
        expect(icon).toContain('height="36"');
    });

    it('should have encoded all "#" as "%23"', () => {
        const icon = getSvgIcon({
            shouldReplaceHashtag: true,
            fill: '#0099FF'
        });

        expect(icon).toBeTruthy();
        expect(icon).toContain('%23');
        expect(icon).not.toContain('#');
    });
});
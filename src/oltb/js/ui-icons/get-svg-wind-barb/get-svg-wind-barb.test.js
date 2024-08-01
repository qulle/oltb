import { describe, it, expect } from '@jest/globals';
import { SvgPaths } from './svg-paths';
import { getSvgWindBarb } from './get-svg-wind-barb';

describe('getSvgWindBarb', () => {
    it('should create default svg-windBarb', () => {
        const windBarb = getSvgWindBarb({});

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
        expect(windBarb).toContain('</svg>');
        expect(windBarb).toContain(SvgPaths.knot0);
        expect(windBarb).toContain('width="250"');
        expect(windBarb).toContain('height="250"');
        expect(windBarb).toContain('fill="#3B4352FF"');
        expect(windBarb).toContain('stroke="#3B4352FF"');
        expect(windBarb).toContain('stroke-width="3"');
        expect(windBarb).toContain('stroke-linecap="round"');
        expect(windBarb).toContain('stroke-linejoin="round"');
        expect(windBarb).toContain('stroke-miterlimit="10"');
    });

    it('should create windBarb for 1 m/s = 2 knots', () => {
        const windBarb = getSvgWindBarb({
            windSpeed: 1
        });

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain(SvgPaths.knot2);
    });

    it('should create windBarb for 25 m/s = 50 knots', () => {
        const windBarb = getSvgWindBarb({
            windSpeed: 25,
            width: 200,
            height: 200
        });

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain(SvgPaths.knot50);
        expect(windBarb).toContain('width="200"');
        expect(windBarb).toContain('height="200"');
    });

    it('should fallback to 0 knots icon for to high m/s value', () => {
        const windBarb = getSvgWindBarb({
            windSpeed: 1000
        });

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain(SvgPaths.knot0);
    });

    it('should have encoded all "#" as "%23"', () => {
        const windBarb = getSvgWindBarb({
            shouldReplaceHashtag: true,
            fill: '#0099FF'
        });

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain('%23');
        expect(windBarb).not.toContain('#');
    });
});
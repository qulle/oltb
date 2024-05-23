import { describe, it, expect } from '@jest/globals';
import { WindBarb, getWindBarb } from './get-wind-barb';

describe('GetWindBarb', () => {
    it('should create default svg-windBarb', () => {
        const windBarb = getWindBarb({});

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
        expect(windBarb).toContain('</svg>');
        expect(windBarb).toContain(WindBarb.knot0);
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
        const windBarb = getWindBarb({
            windSpeed: 1
        });

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain(WindBarb.knot2);
    });

    it('should create windBarb for 25 m/s = 50 knots', () => {
        const windBarb = getWindBarb({
            windSpeed: 25,
            width: 200,
            height: 200
        });

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain(WindBarb.knot50);
        expect(windBarb).toContain('width="200"');
        expect(windBarb).toContain('height="200"');
    });

    it('should fallback to 0 knots icon for to high m/s value', () => {
        const windBarb = getWindBarb({
            windSpeed: 1000
        });

        expect(windBarb).toBeTruthy();
        expect(windBarb).toContain(WindBarb.knot0);
    });
});
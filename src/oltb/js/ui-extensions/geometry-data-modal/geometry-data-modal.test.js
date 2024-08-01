import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { GeometryDataModal } from './geometry-data-modal';

const FILENAME = 'geometry-data-modal.js';

describe('GeometryDataModal', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create modal-extension', () => {
        const options = {
            title: 'jest',
            data: {
                id: 1234,
                measurement: '3071640.38 km2',
                oltbProperties: `<pre><code>{"type": "drawing"}</code></pre>`,
                vertices: 6,
                coordinates: `<pre><code>[
                    [-2821600.331828734,8262006.348294033],
                    [171346.63509037718,9719610.390624769],
                    [890431.2959735394,7484617.525717639],
                    [-333956.0995842796,5618884.351534298],
                    [-2452340.6411049496,6337969.012417461],
                    [-2821600.331828734,8262006.348294033]
                ]</code></pre>`
            }
        };

        const modal = new GeometryDataModal(options);

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
    });
});
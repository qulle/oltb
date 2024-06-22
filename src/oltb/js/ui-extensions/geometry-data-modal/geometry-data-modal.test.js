import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { GeometryDataModal } from './geometry-data-modal';

const FILENAME = 'geometry-data-modal.js';

describe('GeometryDataModal', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create modal-extension', () => {
        const modal = new GeometryDataModal({
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
    });
});
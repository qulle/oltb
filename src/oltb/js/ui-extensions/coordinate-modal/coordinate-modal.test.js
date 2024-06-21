import { jest, beforeAll, beforeEach, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { CoordinateModal } from './coordinate-modal';

const FILENAME = 'coordinate-model.js';

describe('CoordinateModal', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create modal-extension', () => {
        const modal = new CoordinateModal({
            FILENAME,
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
    });
});
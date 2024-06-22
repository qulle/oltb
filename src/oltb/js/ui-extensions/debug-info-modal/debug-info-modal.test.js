import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { StyleManager } from '../../toolbar-managers/style-manager/style-manager';
import { DebugInfoModal } from './debug-info-modal';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import '../../browser-prototypes/json-cycle';

const FILENAME = 'debug-info-modal.js';

class MockResponse {
    constructor() {}
}

describe('DebugInfoModal', () => {
    beforeAll(() => {
        window.Response = MockResponse;

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(StyleManager, 'getSize').mockImplementation(() => {
            return 0;
        });

        jest.spyOn(TranslationManager, 'getLanguages').mockImplementation(() => {
            return [];
        });
    });

    it('should create modal-extension', () => {
        const modal = new DebugInfoModal({
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
    });
});
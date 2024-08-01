import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { IconMarkerModal } from './icon-marker-modal';
import '../../browser-prototypes/string';

const FILENAME = 'icon-marker-modal.js';

describe('IconMarkerModal', () => {
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
        const modal = new IconMarkerModal({
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
        expect(modal.getButtons().length).toBe(2);
    });

    it('should test callback [onCancel]', () => {
        const callback = {onCancel: () => {}};
        const spyOnOnCancel = jest.spyOn(callback, 'onCancel');
        const modal = new IconMarkerModal({
            onCancel: callback.onCancel
        });

        const cancelButton = modal.getButtons()[0];
        cancelButton.click();

        expect(cancelButton.nodeName).toBe('BUTTON');
        expect(spyOnOnCancel).toHaveBeenCalled();
    });

    it('should test callback [onCreate]', () => {
        const callback = {onCreate: () => {}};
        const spyOnOnCreate = jest.spyOn(callback, 'onCreate');
        const modal = new IconMarkerModal({
            onCreate: callback.onCreate
        });

        const createButton = modal.getButtons()[1];
        createButton.click();

        expect(createButton.nodeName).toBe('BUTTON');
        expect(spyOnOnCreate).toHaveBeenCalledWith({
            latitude: NaN,
            longitude: NaN,
            title: 'Marker',
            description: '',
            icon: 'geoPin.filled',
            iconFill: '#FFFFFFFF',
            iconStroke: '#FFFFFFFF',
            markerFill: '#0166A5FF',
            markerStroke: '#0166A566',
            label: 'Marker',
            labelFill: '#FFFFFF',
            labelStroke: '#3B4352CC',
            labelStrokeWidth: '8'
        });
    });
});
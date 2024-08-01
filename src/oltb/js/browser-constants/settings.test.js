import { describe, it, expect } from '@jest/globals';
import { Settings } from './settings';

describe('Settings', () => {
    const sut = Object.freeze({
        altShiftDragRotate: 'altShiftDragRotate',
        alwaysNewLayers: 'alwaysNewLayers',
        copyCoordinatesOnClick: 'copyCoordinatesOnClick',
        dragPan: 'dragPan',
        keyboardPan: 'keyboardPan',
        keyboardZoom: 'keyboardZoom',
        mouseOnlyToEditVectorShapes: 'mouseOnlyToEditVectorShapes',
        mouseWheelZoom: 'mouseWheelZoom',
        selectVectorMapShapes: 'selectVectorMapShapes',
        snapHelpLines: 'snapHelpLines',
        snapInteraction: 'snapInteraction',
        updateToolboxCoordinatesOnHover: 'updateToolboxCoordinatesOnHover'
    });

    it('should have the same structure as the runtime-object', () => {
        expect(Settings).toStrictEqual(sut);
    });
});

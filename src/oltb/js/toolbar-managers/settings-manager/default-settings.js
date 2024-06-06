import { Settings } from '../../browser-constants/settings';

const DefaultSettings = new Map([
    [
        Settings.mouseWheelZoom, { 
            state: false 
        }
    ], [
        Settings.altShiftDragRotate, { 
            state: true 
        }
    ], [
        Settings.dragPan, { 
            state: true 
        }
    ], [
        Settings.keyboardZoom, { 
            state: true 
        }
    ], [
        Settings.keyboardPan, { 
            state: true 
        }
    ], [
        Settings.selectVectorMapShapes, { 
            state: false 
        }
    ], [
        Settings.snapInteraction, { 
            state: true 
        }
    ], [
        Settings.snapHelpLines, { 
            state: true 
        }
    ], [
        Settings.alwaysNewLayers, { 
            state: false 
        }
    ]
]);

export { DefaultSettings };
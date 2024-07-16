import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { ResetNorthTool } from './reset-north-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import '../../browser-prototypes/string';

const FILENAME = 'reset-north-tool.js';
const I18N__BASE = 'tools.resetNorthTool';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const mockView = {
    animate: (options) => {},
    cancelAnimations: () => {},
    getAnimating: () => true,
    getZoom: () => 1.234,
    getProjection: () => 'jest',
    getCenter: () => [1.123, 2.456],
    getRotation: () => 1.234,
    getConstrainedZoom: (zoom) => 1
};

const mockMap = {
    addLayer: (layer) => {},
    removeLayer: (layer) => {}, 
    addInteraction: (interaction) => {},
    removeInteraction: (interaction) => {},
    addOverlay: (overlay) => {},
    removeOverlay: (overlay) => {},
    on: (event, callback) => {},
    getView: () => {
        return mockView;
    }
};

describe('MagnifyTool', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ResetNorthTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });
    });

    afterEach(() => {
        window.onkeydown = function() {};
        window.onkeyup = function() {};

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = new ResetNorthTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ResetNorthTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onReset: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ResetNorthTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new ResetNorthTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should rotate the map', () => {
        const spyOnLogDebug = jest.spyOn(LogManager, 'logDebug');
        const tool = new ResetNorthTool();
        tool.doRotation(mockMap, [0, 0], 5, 90);

        expect(spyOnLogDebug).toHaveBeenCalledWith(FILENAME, 'doRotation', {
            degrees: 90,
            radians: 1.5707963267948966
        });
    });

    it('should ask user to rotate the map', () => {
        const tool = new ResetNorthTool();
        const spyOnDoRotation = jest.spyOn(tool, 'doRotation');
        const dialog = tool.askToSetRotation(mockMap);

        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnDoRotation).toHaveBeenCalledTimes(1);
    });

    it('should ask user to rotate the map but fail due to letters', () => {
        jest.spyOn(mockView, 'getRotation').mockImplementation(() => {
            return 1.234 + 'jest';
        });

        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast, 'error');

        const tool = new ResetNorthTool();
        const dialog = tool.askToSetRotation(mockMap);

        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnLogError).toHaveBeenCalledWith(FILENAME, 'askToSetRotation', {
            message: 'Only digits are allowed as input',
            result: 'NaN'
        });

        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.invalidValue`
        });
    });
});
import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { UrlManager } from '../../toolbar-managers/url-manager/url-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { StyleManager } from '../../toolbar-managers/style-manager/style-manager';
import { DebugInfoTool } from './debug-info-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import '../../browser-prototypes/json-cycle';

const FILENAME = 'debug-info-tool.js';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
class MockResponse {
    constructor() {}
}

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

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('DebugInfoTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        window.Response = MockResponse;

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(UrlManager, 'getParameter').mockImplementation(() => {
            return 'false';
        });

        await StateManager.initAsync();
        await StyleManager.initAsync();
        await TranslationManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new DebugInfoTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(DebugInfoTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onlyWhenGetParameter: false,
            onInitiated: undefined,
            onClicked: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new DebugInfoTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should init the tool hidden if debug = false and onlyWhenGetParameter = true', () => {
        const tool = new DebugInfoTool({
            onlyWhenGetParameter: true
        });

        expect(tool).toBeTruthy();
        expect(tool.button.classList.contains('oltb-tool-button--hidden'));
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(DebugInfoTool.prototype, 'momentaryActivation');

        const tool = new DebugInfoTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [4]', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(DebugInfoTool.prototype, 'momentaryActivation');

        new DebugInfoTool(options);
        simulateKeyPress('keyup', window, '4');

        // Note:
        // Since using prototype spy, more have-been-called-results than one first might expect.
        // 5 -> 4 times called by key-binding on window-object and 1 using tool.onClickTool
        expect(spyMomentary).toHaveBeenCalledTimes(6);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spy = jest.spyOn(options, 'onClicked');

        new DebugInfoTool(options);
        simulateKeyPress('keyup', window, '!');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should open the debug-modal', () => {
        const spyGetMap = jest.spyOn(DebugInfoTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        const tool = new DebugInfoTool();

        // Note:
        // Trigger twice to also let JEST verify the blocking of helpDialog when truthy
        tool.doShowDebugInfoModal();
        tool.doShowDebugInfoModal();

        expect(spyGetMap).toHaveBeenCalledTimes(1);
        expect(tool.debugInfoModal).toBeTruthy();

        const closeButton = tool.debugInfoModal.buttons[0];
        closeButton.click();
        expect(tool.debugInfoModal).toBeFalsy();
    });
});
import { jest, beforeAll, beforeEach, describe, afterEach, it, expect } from '@jest/globals';
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
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new DebugInfoTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        window.Response = MockResponse;

        await StateManager.initAsync();
        await StyleManager.initAsync();
        await TranslationManager.initAsync();
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(UrlManager, 'getParameter').mockImplementation(() => {
            return 'false';
        });

        jest.spyOn(DebugInfoTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });
    });

    afterEach(() => {
        toolInstances.forEach((tool) => {
            tool.detachGlobalListeners();
        });
        toolInstances.length = 0;

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = initToolInstance();

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
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should init the tool hidden if debug = false and onlyWhenGetParameter = true', () => {
        const tool = initToolInstance({
            onlyWhenGetParameter: true
        });

        expect(tool).toBeTruthy();
        expect(tool.button.classList.contains('oltb-tool-button--hidden'));
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');

        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [4]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');

        simulateKeyPress('keyup', window, '4');

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keyup', window, '!');

        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should open the debug-modal', () => {
        const tool = initToolInstance();

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        tool.doShowDebugInfoModal();
        tool.doShowDebugInfoModal();

        expect(tool.debugInfoModal).toBeTruthy();

        const closeButton = tool.debugInfoModal.buttons[0];
        closeButton.click();

        expect(tool.debugInfoModal).toBeFalsy();
    });
});
import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { HomeTool } from './home-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'home-tool.js';
const I18N__BASE = 'tools.homeTool';

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

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('HomeTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new HomeTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        await StateManager.initAsync();
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(HomeTool.prototype, 'getMap').mockImplementation(() => {
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

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = initToolInstance();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(HomeTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(HomeTool.prototype, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [H]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, 'H');

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

    it('should get zoom', () => {
        const tool = initToolInstance();
        const zoom = tool.getZoom();

        expect(zoom).toBe(3);
    });

    it('should get rotation', () => {
        const tool = initToolInstance();
        const rotation = tool.getRotation();

        expect(rotation).toBe(0);
    });

    it('should get location', () => {
        const tool = initToolInstance();
        const location = tool.getLocation();

        expect(location).toStrictEqual([18.1201, 35.3518]);
    });

    it('should get modified zoom', () => {
        const tool = initToolInstance();
        tool.localStorage.zoom = 4;
        const zoom = tool.getZoom();

        expect(zoom).toBe(4);
    });

    it('should get modified rotation', () => {
        const tool = initToolInstance();
        tool.localStorage.rotation = 1;
        const rotation = tool.getRotation();

        expect(rotation).toBe(1);
    });

    it('should get modified location', () => {
        const tool = initToolInstance();
        tool.localStorage.lon = 20.1234;
        tool.localStorage.lat = 40.5648;

        const location = tool.getLocation();
        expect(location).toStrictEqual([20.1234, 40.5648]);
    });

    it('should create new Home location', () => {
        const tool = initToolInstance();
        tool.localStorage.lon = 20.1234;
        tool.localStorage.lat = 40.5648;

        const location = tool.getLocation();
        expect(location).toStrictEqual([20.1234, 40.5648]);

        const spyOnToastSuccess = jest.spyOn(Toast, 'success');
        tool.doCreateNewHome([10.123, 20.456]);

        expect(tool.localStorage.lon).toBe(10.123);
        expect(tool.localStorage.lat).toBe(20.456);
        expect(spyOnToastSuccess).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.setHomeLocation`,
            autoremove: true
        });
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spyOnOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');
        initToolInstance(options);

        EventManager.dispatchEvent([window], 'oltb.browser.state.cleared');
        expect(spyOnOnBrowserStateCleared).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        const tool = initToolInstance();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spyOnSetStateObject).toHaveBeenCalledTimes(1);
    });
});
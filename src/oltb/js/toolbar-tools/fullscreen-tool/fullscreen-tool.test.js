import screenfull from 'screenfull';
import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { FullscreenTool } from './fullscreen-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'fullscreen-tool.js';

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
    getTargetElement: () => window.document.createElement('div'),
    addOverlay: (overlay) => {},
    removeOverlay: (overlay) => {},
    on: (event, callback) => {},
    updateSize: () => {},
    getView: () => {
        return mockView;
    }
};

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('FullscreenTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new FullscreenTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(FullscreenTool.prototype, 'getMap').mockImplementation(() => {
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
        expect(tool).toBeInstanceOf(FullscreenTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onEnter: undefined,
            onLeave: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool - request fullscreen', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');
        const spyOnRequestFullscreen = jest.spyOn(screenfull, 'request');
        
        screenfull.isFullscreen = false;
        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
        expect(spyOnRequestFullscreen).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool - exit fullscreen', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');
        const spyOnExitFullscreen = jest.spyOn(screenfull, 'exit');

        screenfull.isFullscreen = true;
        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
        expect(spyOnExitFullscreen).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [F]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, 'F');

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

    it('should update map-size', () => {
        const spyOnUpdateMapSize = jest.spyOn(mockMap, 'updateSize');
        const tool = initToolInstance();

        tool.doUpdateMapSize();
        expect(spyOnUpdateMapSize).toHaveBeenCalledTimes(1);
    });

    it('should simulate on-enter-fullscreen-event', () => {
        const mockElement = window.document.createElement('div');
        window.document.fullscreenElement = mockElement;

        const options = {onEnter: () => {}};
        const spyOnOnEnter = jest.spyOn(options, 'onEnter');
        initToolInstance(options);

        EventManager.dispatchEvent([window.document], 'fullscreenchange');
        expect(spyOnOnEnter).toHaveBeenCalledTimes(1);
    });

    it('should simulate on-leave-fullscreen-event', () => {
        const mockElement = undefined;
        window.document.fullscreenElement = mockElement;

        const options = {onLeave: () => {}};
        const spyOnOnLeave = jest.spyOn(options, 'onLeave');
        initToolInstance(options);

        EventManager.dispatchEvent([window.document], 'fullscreenchange');
        expect(spyOnOnLeave).toHaveBeenCalledTimes(1);
    });
});
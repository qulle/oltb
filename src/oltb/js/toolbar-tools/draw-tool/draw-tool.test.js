import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { DrawTool } from './draw-tool';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'draw-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-draw';
const I18N__BASE = 'tools.drawTool';
const I18N__BASE_COMMON = 'commons';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.draw">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <label class="oltb-label" for="${ID__PREFIX}-type" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.title">__JEST__</label>
                <select id="${ID__PREFIX}-type" class="oltb-select">
                    <option value="Circle" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.circle">__JEST__</option>
                    <option value="Square" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.square">__JEST__</option>
                    <option value="Rectangle" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.rectangle">__JEST__</option>
                    <option value="LineString" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.lineString">__JEST__</option>
                    <option value="Point" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.point">__JEST__</option>
                    <option value="Polygon" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.polygon">__JEST__</option>
                </select>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-intersection-enable" data-oltb-i18n="${I18N__BASE}.toolbox.groups.intersectable.title">__JEST__</label>
                    <select id="${ID__PREFIX}-intersection-enable" class="oltb-select">
                        <option value="false" data-oltb-i18n="${I18N__BASE}.toolbox.groups.intersectable.false">__JEST__</option>
                        <option value="true" data-oltb-i18n="${I18N__BASE}.toolbox.groups.intersectable.true">__JEST__</option>
                    </select>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-stroke-width" data-oltb-i18n="${I18N__BASE}.toolbox.groups.strokeWidth.title">__JEST__</label>
                    <select id="${ID__PREFIX}-stroke-width" class="oltb-select">
                        <option value="1">1</option>
                        <option value="1.25">1.25</option>
                        <option value="1.5">1.5</option>
                        <option value="2">2</option>
                        <option value="2.5">2.5</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </div>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-stroke-color" data-oltb-i18n="${I18N__BASE}.toolbox.groups.strokeColor.title">__JEST__</label>
                    <div id="${ID__PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID__PREFIX}-stroke-color" data-oltb-color="__JEST__" tabindex="0">
                        <div class="oltb-color-input__inner" style="background-color: #000000;"></div>
                    </div>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-fill-color" data-oltb-i18n="${I18N__BASE}.toolbox.groups.fillColor.title">__JEST__</label>
                    <div id="${ID__PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID__PREFIX}-fill-color" data-oltb-color="__JEST__" tabindex="0">
                        <div class="oltb-color-input__inner" style="background-color: #000000;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`);

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
// # Section: Helpers
//--------------------------------------------------------------------
const hasToolActiveClass = (tool) => {
    return tool.button.classList.contains('oltb-tool-button--active');
}

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('DrawTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new DrawTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        window.document.body.innerHTML = HTML__MOCK;
        await StateManager.initAsync();
        await SnapManager.initAsync();

        SnapManager.setMap(mockMap);
    });

    beforeEach(() => {
        Element.prototype.scrollIntoView = jest.fn();
        
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(SettingsManager, 'getSetting').mockImplementation(() => {
            return true;
        });

        jest.spyOn(DrawTool.prototype, 'getMap').mockImplementation(() => {
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
        expect(tool).toBeInstanceOf(DrawTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            circleSize: 5,
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined,
            onStart: undefined,
            onEnd: undefined,
            onAbort: undefined,
            onError: undefined,
            onIntersected: undefined,
            onSnapped: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', async () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should toggle the tool using short-cut-key [P]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keyup', window, 'P');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keyup', window, 'P');
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should abort draw when Escape-key is pressed', () => {
        const tool = initToolInstance();
        tool.doUpdateTool('Polygon', 3, '#009922', '#0099FF');

        const spyOnDrawAbort = jest.spyOn(tool.interactionDraw, 'abortDrawing');
        simulateKeyPress('keyup', window, 'Escape');

        expect(spyOnDrawAbort).toHaveBeenCalled();
    });

    it('should slide-toggle the toolbox section', () => {
        const tool = initToolInstance();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');
        const spyOnGetElementById = jest.spyOn(window.document, 'getElementById').mockImplementation(() => {
            return {
                slideToggle: (duration, callback) => {
                    callback(true);
                }
            }
        });

        tool.doToggleToolboxSection('jest-mock-name');

        expect(tool.localStorage.isCollapsed).toBe(true);
        expect(spyOnGetElementById).toHaveBeenCalled();
        expect(spyOnSetStateObject).toHaveBeenCalled();
    });

    it('should deactivate tool as done by ToolManager', () => {
        const tool = initToolInstance();
        const spyOnRemoveActiveTool = jest.spyOn(ToolManager, 'removeActiveTool');

        tool.activateTool();
        tool.deselectTool();

        expect(spyOnRemoveActiveTool).toHaveBeenCalled();
    });

    it('should re-activate active tool after reload', () => {
        const tool = initToolInstance();
        tool.localStorage.isActive = true;

        const spyOnActivateTool = jest.spyOn(tool, 'activateTool').mockImplementation(() => {
            return;
        });

        EventManager.dispatchEvent([window], 'oltb.is.ready');
        expect(spyOnActivateTool).toHaveBeenCalled();
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

    it('should check if intersection mode is enabled', () => {
        const options = {onSnapped: () => {}};
        const spyOnOnSnapped = jest.spyOn(options, 'onSnapped');

        const tool = initToolInstance(options);
        SnapManager.addSnap(tool);
        
        const interaction = SnapManager.getInteraction();
        interaction.dispatchEvent('snap');

        expect(spyOnOnSnapped).toHaveBeenCalledTimes(1);
    });

    it('should check if intersection mode is enabled', () => {
        const tool = initToolInstance();
        expect(tool.isIntersectionEnabled()).toBe(false);
    });

    // TODO:
    // At this point it is hard to simulate the events due to missing feature
    it('should trigger drawing-related-events', () => {
        const options = {
            onStart: () => {},
            onEnd: () => {},
            onDrag: () => {},
            onAbort: () => {},
            onError: () => {}
        };

        const spyOnOnStart = jest.spyOn(options, 'onStart');
        const spyOnOnEnd = jest.spyOn(options, 'onEnd');
        const spyOnOnAbort = jest.spyOn(options, 'onAbort');
        const spyOnOnError = jest.spyOn(options, 'onError');

        const tool = initToolInstance(options);
        tool.doUpdateTool('Polygon', 3, '#009922', '#0099FF');

        tool.interactionDraw.dispatchEvent('drawstart');
        tool.interactionDraw.dispatchEvent('drawend');
        tool.interactionDraw.dispatchEvent('drawabort');
        tool.interactionDraw.dispatchEvent('error');

        expect(spyOnOnStart).toHaveBeenCalledTimes(1);
        expect(spyOnOnEnd).toHaveBeenCalledTimes(1);
        expect(spyOnOnAbort).toHaveBeenCalledTimes(1);
        expect(spyOnOnError).toHaveBeenCalledTimes(1);
    });
});
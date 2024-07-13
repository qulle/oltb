import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { MeasureTool } from './measure-tool';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';

const FILENAME = 'measure-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-measure';
const I18N__BASE = 'tools.measureTool';
const I18N__BASE_COMMON = 'commons';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.measure">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <label class="oltb-label" for="${ID__PREFIX}-type" data-oltb-i18n="${I18N__BASE}.toolbox.groups.type.title">__JEST__</label>
                <select id="${ID__PREFIX}-type" class="oltb-select">
                    <option value="LineString" data-oltb-i18n="${I18N__BASE}.toolbox.groups.type.lineString">__JEST__</option>
                    <option value="Polygon" data-oltb-i18n="${I18N__BASE}.toolbox.groups.type.polygon">__JEST__</option>
                </select>
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
describe('MeasureTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        Element.prototype.scrollIntoView = jest.fn();
        window.document.body.innerHTML = HTML__MOCK;

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(SettingsManager, 'getSetting').mockImplementation(() => {
            return true;
        });

        jest.spyOn(MeasureTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        await StateManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new MeasureTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(MeasureTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined,
            onStart: undefined,
            onEnd: undefined,
            onAbort: undefined,
            onError: undefined,
            onSnapped: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new MeasureTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', async () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(MeasureTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(MeasureTool.prototype, 'deactivateTool');

        await SnapManager.initAsync();
        SnapManager.setMap(mockMap);

        const tool = new MeasureTool(options);

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyActivate).toHaveBeenCalledTimes(1);
        expect(spyDeactivate).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should clear tool state', () => {
        // Note:
        // Spy after new, to make sure it is triggered only one time
        const tool = new MeasureTool();
        const spy = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
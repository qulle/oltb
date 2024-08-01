import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TooltipManager } from '../../toolbar-managers/tooltip-manager/tooltip-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { CoordinatesTool } from './coordinates-tool';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { ProjectionManager } from '../../toolbar-managers/projection-manager/projection-manager';

const FILENAME = 'coordinates-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-coordinates';
const I18N__BASE = 'tools.coordinatesTool';
const I18N__BASE_COMMON = 'commons';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.coordinates">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <label class="oltb-label" for="${ID__PREFIX}-format" data-oltb-i18n="${I18N__BASE}.toolbox.groups.formats.title">__JEST__</label>
                <select id="${ID__PREFIX}-format" class="oltb-select">
                    <option value="DD" data-oltb-i18n="${I18N__BASE}.toolbox.groups.formats.dd">__JEST__</option>
                    <option value="DMS" data-oltb-i18n="${I18N__BASE}.toolbox.groups.formats.dms">__JEST__</option>
                </select>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.coordinates.title">__JEST__</em></label>
                <table class="oltb-table oltb-table--horizontal oltb-table--no-background oltb-table--tight-bottom-and-top oltb-mt-05" id="${ID__PREFIX}-table"></table>
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
describe('CoordinatesTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new CoordinatesTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        window.document.body.innerHTML = HTML__MOCK;

        await TooltipManager.initAsync();
        await StateManager.initAsync();
        await SettingsManager.initAsync();
        await ProjectionManager.initAsync();

        TooltipManager.setMap(mockMap);
    });

    beforeEach(() => {
        Element.prototype.scrollIntoView = jest.fn();

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(CoordinatesTool.prototype, 'getMap').mockImplementation(() => {
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
        expect(tool).toBeInstanceOf(CoordinatesTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onMapClicked: undefined,
            onBrowserStateCleared: undefined
        });
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

    it('should toggle the tool using short-cut-key [C]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keydown', window, 'C');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keydown', window, 'C');
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keydown', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
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

    it('should re-activate active tool after reload', () => {
        const tool = initToolInstance();
        tool.localStorage.isActive = true;
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');

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
        const spyOnStateObject = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spyOnStateObject).toHaveBeenCalledTimes(1);
    });

    it('should resolve copy coordinates', async () => {
        const spyOnToastInfo = jest.spyOn(Toast, 'info');
        const event = {
            coordinate: {lon: 12.34, lat: 43.21}
        };

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.resolve();
        });
        
        const tool = initToolInstance();
        await tool.doCopyCoordinatesAsync(event);

        expect(spyOnToastInfo).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.copyCoordinates`,
            autoremove: true
        });
    });

    it('should reject copy coordinates', async () => {
        const spyOnToastError = jest.spyOn(Toast, 'error');
        const event = {
            coordinate: {lon: 12.34, lat: 43.21}
        };

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.reject();
        });
        
        const tool = initToolInstance();
        await tool.doCopyCoordinatesAsync(event);

        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.copyCoordinates`
        });
    });

    it('should create list of tooltip coordinates', () => {
        const tool = initToolInstance();
        const result = tool.doCreateToolCoordinatesList([57.36, 16.10]);

        expect(result).toStrictEqual([
            {
                code: 'EPSG:3857',
                coordinates: [
                    57.36,
                    16.1
                ],
                name: 'WGS 84 / Pseudo-Mercator',
                prettyCoordinates: '16° 06′ N 57° 21′ 36″ E'
            },
            {
                code: 'EPSG:4326',
                coordinates: [
                    0.0005152736469709574,
                    0.00014462876073650932
                ],
                name: 'WGS 84',
                prettyCoordinates: '0° 00′ 01″ N 0° 00′ 02″ E'
            },
            {
                code: 'EPSG:7789',
                coordinates: [
                    6378136.99972189,
                    57.35999999904528
                ],
                name: 'ITRF2014',
                prettyCoordinates: '57° 21′ 36″ N 16° 59′ 59″ E'
            },
            {
                code: 'EPSG:3006',
                coordinates: [
                    -1188600.039276576,
                    16.55370831247003,
                ],
                name: 'SWEREF99 TM',
                prettyCoordinates: '16° 33′ 13″ N 119° 57′ 39″ E'
            },
            {
                code: 'EPSG:3021',
                coordinates: [
                    -282691.5360820275,
                    -679.1421153766157,
                ],
                name: 'RT90 2.5 gon V',
                prettyCoordinates: '40° 51′ 28″ N 91° 32′ 10″ W'
            }
        ]);
    });

    it('should create tooltip coordinates', () => {
        const tool = initToolInstance();
        tool.onClickTool();

        tool.doCreateTooltipCoordinates({
            coordinate: [57.36, 16.10]
        });

        expect(tool.tooltipItem.innerHTML).toBe('0° 00′ 01″ N 0° 00′ 02″ E');
    });

    it('should create toolbox coordinates', () => {
        const tool = initToolInstance();
        tool.onClickTool();

        tool.doCreateToolboxCoordinates({
            coordinate: [57.36, 16.10]
        });

        expect(tool.uiRefCoordinatesTable.innerHTML.replace(/\s+/g, ' ').trim()).toBe('<tr><th class="oltb-tippy" title="EPSG:3857"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:4326"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:7789"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:3006"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:3021"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:3857"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:4326"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:7789"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:3006"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:3021"></th></tr><tr><td></td></tr><tr><th class="oltb-tippy" title="EPSG:3857"></th></tr><tr><td> 16.1000, 57.3600 </td></tr><tr><th class="oltb-tippy" title="EPSG:4326"></th></tr><tr><td> 0.0001, 0.0005 </td></tr><tr><th class="oltb-tippy" title="EPSG:7789"></th></tr><tr><td> 57.3600, 6378136.9997 </td></tr><tr><th class="oltb-tippy" title="EPSG:3006"></th></tr><tr><td> 16.5537, -1188600.0393 </td></tr><tr><th class="oltb-tippy" title="EPSG:3021"></th></tr><tr><td> -679.1421, -282691.5361 </td></tr>');
    });
});
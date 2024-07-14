import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TooltipManager } from '../../toolbar-managers/tooltip-manager/tooltip-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { CoordinatesTool } from './coordinates-tool';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

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

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(TooltipManager, 'push').mockImplementation(() => {
            return;
        });

        jest.spyOn(TooltipManager, 'pop').mockImplementation(() => {
            return;
        });

        await StateManager.initAsync();
        await SettingsManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new CoordinatesTool();

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
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new CoordinatesTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(CoordinatesTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(CoordinatesTool.prototype, 'deactivateTool');

        const tool = new CoordinatesTool(options);

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyActivate).toHaveBeenCalledTimes(1);
        expect(spyDeactivate).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should toggle the tool using short-cut-key [C]', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(CoordinatesTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(CoordinatesTool.prototype, 'deactivateTool');

        const tool = new CoordinatesTool(options);
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keydown', window, 'C');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keydown', window, 'C');
        expect(hasToolActiveClass(tool)).toBe(false);

        // Note:
        // Since using prototype spy, more have-been-called-results than one first might expect.
        // 5 -> 4 times called by key-binding on window-object and 1 using tool.onClickTool
        expect(spyActivate).toHaveBeenCalledTimes(5);
        expect(spyDeactivate).toHaveBeenCalledTimes(5);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spy = jest.spyOn(options, 'onClicked');

        new CoordinatesTool(options);
        simulateKeyPress('keydown', window, '!');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should re-activate active tool after reload', () => {
        const spy = jest.spyOn(CoordinatesTool.prototype, 'activateTool').mockImplementation(() => {
            return;
        });

        const tool = new CoordinatesTool();
        tool.localStorage.isActive = true;

        eventDispatcher([window], 'oltb.is.ready');
        expect(spy).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spy = jest.spyOn(options, 'onBrowserStateCleared');
        new CoordinatesTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spy).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        // Note:
        // Spy after new, to make sure it is triggered only one time
        const tool = new CoordinatesTool();
        const spy = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should resolve copy coordinates', async () => {
        const spyToast = jest.spyOn(Toast, 'info');
        const event = {
            coordinate: {lon: 12.34, lat: 43.21}
        };

        jest.spyOn(copyToClipboard, 'copy').mockImplementation(() => {
            return Promise.resolve();
        });
        
        const tool = new CoordinatesTool();
        await tool.doCopyCoordinates(event);

        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.copyCoordinates`,
            autoremove: true
        });
    });

    it('should reject copy coordinates', async () => {
        const spyToast = jest.spyOn(Toast, 'error');
        const event = {
            coordinate: {lon: 12.34, lat: 43.21}
        };

        jest.spyOn(copyToClipboard, 'copy').mockImplementation(() => {
            return Promise.reject();
        });
        
        const tool = new CoordinatesTool();
        await tool.doCopyCoordinates(event);

        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.copyCoordinates`
        });
    });
});
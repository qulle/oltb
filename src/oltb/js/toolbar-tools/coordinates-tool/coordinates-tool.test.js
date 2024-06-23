import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { CoordinatesTool } from './coordinates-tool';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { TooltipManager } from '../../toolbar-managers/tooltip-manager/tooltip-manager';

const FILENAME = 'coordinates-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-coordinates';
const I18N__BASE = 'tools.coordinatesTool';
const I18N__BASE_COMMON = 'commons';

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

describe('CoordinatesTool', () => {
    beforeAll(() => {
        Element.prototype.scrollIntoView = jest.fn();
        window.document.body.innerHTML = HTML__MOCK;

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });

        jest.spyOn(StateManager, 'setStateObject').mockImplementation(() => {
            return;
        });

        jest.spyOn(SettingsManager, 'addSetting').mockImplementation(() => {
            return;
        });

        jest.spyOn(TooltipManager, 'push').mockImplementation(() => {
            return;
        });

        jest.spyOn(TooltipManager, 'pop').mockImplementation(() => {
            return;
        });
    });

    it('should init the tool', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new CoordinatesTool(options);

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(CoordinatesTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(CoordinatesTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(CoordinatesTool.prototype, 'deactivateTool');

        const tool = new CoordinatesTool(options);
        tool.onClickTool();
        tool.onClickTool();

        expect(spyActivate).toHaveBeenCalledTimes(1);
        expect(spyDeactivate).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
    });
});
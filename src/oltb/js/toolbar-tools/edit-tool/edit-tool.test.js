import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import * as jsts from 'jsts/dist/jsts.min';
import { BaseTool } from '../base-tool';
import { EditTool } from './edit-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';

const FILENAME = 'edit-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-edit';
const I18N__BASE = 'tools.editTool';
const I18N__BASE_COMMON = 'commons';

const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.edit">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar">
                <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.title">__JEST__</label>
                <button type="button" id="${ID__PREFIX}-delete-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.delete" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-rotate-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.rotate" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-info-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.geometryData" title="__JEST__">__JEST__</button>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar">
                <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.title">__JEST__</label>
                <button type="button" id="${ID__PREFIX}-union-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.union" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-intersect-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.intersect" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-exclude-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.exclude" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-difference-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.difference" title="__JEST__">__JEST__</button>
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

describe('EditTool', () => {
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

        jest.spyOn(SettingsManager, 'getSetting').mockImplementation(() => {
            return true;
        });

        jest.spyOn(SettingsManager, 'addSetting').mockImplementation(() => {
            return;
        });
    });

    it('should init the tool', () => {
        const tool = new EditTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(EditTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(jsts.io.OL3Parser).toHaveBeenCalled();
    });

    it('should test user callbacks [onInitiated, onClicked]', () => {
        const options = {
            onInitiated: () => {},
            onClicked: () => {}
        };

        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new EditTool(options);

        tool.onClickTool();

        expect(spyOnInitiated).toHaveBeenCalled();
        expect(spyOnClicked).toHaveBeenCalled();
    });
});
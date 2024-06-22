import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { DrawTool } from './draw-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';

const FILENAME = 'draw-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-draw';
const I18N__BASE = 'tools.drawTool';
const I18N__BASE_COMMON = 'commons';

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

describe('DrawTool', () => {
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
    });

    it('should init the tool', () => {
        const tool = new DrawTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(DrawTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test user callbacks [onInitiated, onClicked]', () => {
        const options = {
            onInitiated: () => {},
            onClicked: () => {}
        };

        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new DrawTool(options);

        tool.onClickTool();

        expect(spyOnInitiated).toHaveBeenCalled();
        expect(spyOnClicked).toHaveBeenCalled();
    });
});
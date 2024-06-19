import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { OSM } from 'ol/source';
import { Tile } from 'ol';
import { BaseTool } from '../base-tool';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { SplitViewTool } from './split-view-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'split-view-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-split-view';
const I18N__BASE = 'tools.splitViewTool';
const I18N__BASE_COMMON = 'commons';

const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.splitView">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: 'block'}">
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-left-source" data-oltb-i18n="${I18N__BASE}.toolbox.groups.leftSide.title">__JEST__</label>
                    <select id="${ID__PREFIX}-left-source" class="oltb-select"></select>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__group-part" style="flex: none;">
                    <button type="button" id="${ID__PREFIX}-swap-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="__JEST__">__JEST__</button>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-source" data-oltb-i18n="${I18N__BASE}.toolbox.groups.rightSide.title">__JEST__</label>
                    <select id="${ID__PREFIX}-right-source" class="oltb-select"></select>
                </div>
            </div>
        </div>
    </div>
`);

describe('SplitViewTool', () => {
    beforeAll(() => {
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

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            const mapElement = window.document.createElement('div');
            mapElement.insertAdjacentHTML('beforeend', `
                <input type="range" min="0" max="100" value="50" class="oltb-slider" id="${ID__PREFIX}-slider">
            `);
            
            return mapElement;
        });

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });

        jest.spyOn(StateManager, 'setStateObject').mockImplementation(() => {
            return;
        });

        LayerManager.setMap({
            addLayer: () => {},
            removeLayer: () => {}
        });
        LayerManager.addMapLayers([
            {
                id: '7b5399a8-9e57-4304-a233-cdf363c8ed93',
                name: 'Open Street Map',
                layer: new Tile({
                    source: new OSM({
                        crossOrigin: 'anonymous'
                    }),
                    visible: true
                })
            }, {
                id: '7b5399a8-9e57-4304-a233-cdf363c8ed93',
                name: 'Open Street Map 2',
                layer: new Tile({
                    source: new OSM({
                        crossOrigin: 'anonymous'
                    }),
                    visible: true
                })
            }
        ]);
    });

    it('should have two mock layers to be used by tool', () => {
        expect(LayerManager.getMapLayerSize()).toBe(2);
    });

    it('should init the tool', () => {
        const tool = new SplitViewTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(SplitViewTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test user callbacks [onInitiated, onClicked]', () => {
        const options = {
            onInitiated: () => {},
            onClicked: () => {}
        };

        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new SplitViewTool(options);

        tool.onClickTool();

        expect(spyOnInitiated).toHaveBeenCalled();
        expect(spyOnClicked).toHaveBeenCalled();
    });
});
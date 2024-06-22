import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { OverviewTool } from './overview-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'overview-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-overview';
const I18N__BASE = 'tools.overviewTool';
const I18N__BASE_COMMON = 'commons';

const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.overview">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group" id="${ID__PREFIX}-target"></div>
        </div>
    </div>
`);

// Note:
// Used by OpenLayers in the background of the OverViewMap
class MockResizeObserver {
    observe() {}
    unobserve() {}
}

describe('OverviewTool', () => {
    beforeAll(() => {
        Element.prototype.scrollIntoView = jest.fn();
        window.document.body.innerHTML = HTML__MOCK;
        window.ResizeObserver = MockResizeObserver;

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });
    });

    it('should init the tool', () => {
        const tool = new OverviewTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(OverviewTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test user callbacks [onInitiated, onClicked]', () => {
        const options = {
            onInitiated: () => {},
            onClicked: () => {}
        };

        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new OverviewTool(options);

        tool.onClickTool();

        expect(spyOnInitiated).toHaveBeenCalled();
        expect(spyOnClicked).toHaveBeenCalled();
    });
});
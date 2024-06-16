import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BookmarkTool } from './bookmark-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'bookmark-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOOLBOX_LIST = 'oltb-toolbox-list';
const ID__PREFIX = 'oltb-bookmark';
const I18N__BASE = 'tools.bookmarkTool';
const I18N__BASE_COMMON = 'commons';

// Note:
// Simplified mock from #initToolboxHTML
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.bookmarks">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: 'block'}">
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <div class="oltb-input-button-group">
                    <input type="text" id="${ID__PREFIX}-add-text" class="oltb-input" data-oltb-i18n="${I18N__BASE}.toolbox.groups.addBookmark.placeholder" placeholder="__JEST__">
                    <button type="button" id="${ID__PREFIX}-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.addBookmark.add" title="__JEST__">+</button>
                </div>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <ul id="${ID__PREFIX}-stack" class="${CLASS__TOOLBOX_LIST}"></ul>
            </div>
        </div>
    </div>
`);

describe('BookmarkTool', () => {
    beforeAll(() => {
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
    });

    it('should init the tool', () => {
        const tool = new BookmarkTool({});

        expect(tool).toBeTruthy();
        expect(tool.getName()).toBe(FILENAME);
    });
});
import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { BookmarkTool } from './bookmark-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { InfoWindowManager } from '../../toolbar-managers/info-window-manager/info-window-manager';

const FILENAME = 'bookmark-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOOLBOX_LIST = 'oltb-toolbox-list';
const ID__PREFIX = 'oltb-bookmark';
const I18N__BASE = 'tools.bookmarkTool';
const I18N__BASE_COMMON = 'commons';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.bookmarks">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
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

//--------------------------------------------------------------------
// # Section: Helpers
//--------------------------------------------------------------------
const hasToolActiveClass = (tool) => {
    return tool.button.classList.contains('oltb-tool-button--active');
}

describe('BookmarkTool', () => {
    let spyOnActivateTool = undefined;
    let spyOnDeactivateTool = undefined;

    beforeAll(async () => {
        window.document.body.innerHTML = HTML__MOCK;
        await StateManager.initAsync();
    });

    beforeEach(() => {
        Element.prototype.scrollIntoView = jest.fn();
        
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        spyOnActivateTool = jest.spyOn(BookmarkTool.prototype, 'activateTool');
        spyOnDeactivateTool = jest.spyOn(BookmarkTool.prototype, 'deactivateTool');
    });

    afterEach(() => {
        window.onkeydown = function() {};
        window.onkeyup = function() {};

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = new BookmarkTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(BookmarkTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            markerLayerVisibleOnLoad: true,
            markerLabelUseEllipsisAfter: 20,
            markerLabelUseUpperCase: false,
            bookmarks: [],
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined,
            onAdded: undefined,
            onRemoved: undefined,
            onRenamed: undefined,
            onZoomedTo: undefined,
            onCleared: undefined,
            onDragged: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new BookmarkTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new BookmarkTool(options);
        
        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should toggle the tool using short-cut-key [B]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new BookmarkTool(options);
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keyup', window, 'B');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keyup', window, 'B');
        expect(hasToolActiveClass(tool)).toBe(false);

        // TODO:
        // Why is the counter 4? Are results comming from other assertions?
        expect(spyOnActivateTool).toHaveBeenCalledTimes(4);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(4);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        new BookmarkTool(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should re-activate active tool after reload', () => {
        spyOnActivateTool.mockImplementation(() => {
            return;
        });

        const tool = new BookmarkTool();
        tool.localStorage.isActive = true;

        eventDispatcher([window], 'oltb.is.ready');
        expect(spyOnActivateTool).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spyOnOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');
        new BookmarkTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spyOnOnBrowserStateCleared).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        const tool = new BookmarkTool();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spyOnSetStateObject).toHaveBeenCalledTimes(1);
    });

    it('should resolve copy bookmark-coordinates', async () => {
        const spyOnToastInfo = jest.spyOn(Toast, 'info');
        const bookmark = {
            coordinates: {lon: 12.34, lat: 43.21}
        };

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.resolve();
        });
        
        const tool = new BookmarkTool();
        await tool.doCopyBookmarkCoordinatesAsync(bookmark);

        expect(spyOnToastInfo).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.copyCoordinates`,
            autoremove: true
        });
    });

    it('should reject copy bookmark-coordinates', async () => {
        const spyOnToastError = jest.spyOn(Toast, 'error');
        const bookmark = {
            coordinates: {lon: 12.34, lat: 43.21}
        };

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.reject();
        });
        
        const tool = new BookmarkTool();
        await tool.doCopyBookmarkCoordinatesAsync(bookmark);

        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.copyCoordinates`
        });
    });

    it('should ask user to clear bookmarks', () => {
        const spyOnToastInfo = jest.spyOn(Toast, 'info');
        const spyOnDoClearBookmarks = jest.spyOn(BookmarkTool.prototype, 'doClearBookmarks').mockImplementation(() => {
            return;
        });

        const tool = new BookmarkTool();
        const dialog = tool.askToClearBookmarks();

        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnDoClearBookmarks).toHaveBeenCalledTimes(1);
        expect(spyOnToastInfo).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.clearBookmarks`,
            autoremove: true
        });
    });

    it('should ask user to delete bookmark', () => {
        const spyOnHideOverlay = jest.spyOn(InfoWindowManager, 'hideOverlay').mockImplementation(() => {
            return;
        });

        const spyOnDoRemoveBookmark = jest.spyOn(BookmarkTool.prototype, 'doRemoveBookmark').mockImplementation(() => {
            return;
        });

        const bookmark = {name: 'jest'};
        const element = {name: 'jest-element'}
        const tool = new BookmarkTool();
        const dialog = tool.askToDeleteBookmark(bookmark, element);

        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnHideOverlay).toHaveBeenCalled();
        expect(spyOnDoRemoveBookmark).toHaveBeenCalledWith(bookmark, element);
    });

    it('should ask user to edit bookmark', () => {
        const spyOnHideOverlay = jest.spyOn(InfoWindowManager, 'hideOverlay').mockImplementation(() => {
            return;
        });

        const spyOnDoEditBookmark = jest.spyOn(BookmarkTool.prototype, 'doEditBookmark').mockImplementation(() => {
            return;
        });

        const bookmark = {name: 'jest'};
        const bookmarkName = 'jest';
        const tool = new BookmarkTool();
        const dialog = tool.askToEditBookmark(bookmark, bookmarkName);

        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnHideOverlay).toHaveBeenCalled();
        expect(spyOnDoEditBookmark).toHaveBeenCalledWith(bookmark, bookmarkName, 'jest');
    });

    it('should check if local storage has stored bookmark', () => {
        const bookmark = {id: 1, name: 'jest'};
        const tool = new BookmarkTool();
        tool.localStorage.bookmarks.push(bookmark);

        expect(tool.hasLocalStorageBookmarkById(1)).toBe(true);
        expect(tool.getLocalStorageBookmarkById(1)).toStrictEqual(bookmark);

        expect(tool.hasLocalStorageBookmarkById(2)).toBe(false);
        expect(tool.getLocalStorageBookmarkById(2)).toBeUndefined();
    });
});
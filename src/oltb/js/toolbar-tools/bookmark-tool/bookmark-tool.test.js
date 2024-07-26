import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import tippy from 'tippy.js';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { BookmarkTool } from './bookmark-tool';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { InfoWindowManager } from '../../toolbar-managers/info-window-manager/info-window-manager';
import '../../browser-prototypes/string';

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
describe('BookmarkTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new BookmarkTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

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

        jest.spyOn(BookmarkTool.prototype, 'getMap').mockImplementation(() => {
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
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should init the tool with one Bookmark', () => {
        const options = {bookmarks: [{
            id: '6812cc22-f490-46b7-a9f3-42eb9ea58ac2',
            name: 'Custom Bookmark',
            zoom: 5,
            coordinates: [57.123, 16.456]
        }]};
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(tool.localStorage.bookmarks.length).toBe(1);
        expect(tool.localStorage.bookmarks[0].id).toEqual(options.bookmarks[0].id);
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

    it('should toggle the tool using short-cut-key [B]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keyup', window, 'B');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keyup', window, 'B');
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keyup', window, '!');
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
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        tool.localStorage.isActive = true;
        
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
        
        const tool = initToolInstance();
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
        
        const tool = initToolInstance();
        await tool.doCopyBookmarkCoordinatesAsync(bookmark);

        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.copyCoordinates`
        });
    });

    it('should ask user to clear bookmarks', () => {
        const tool = initToolInstance();
        const spyOnToastInfo = jest.spyOn(Toast, 'info');
        const spyOnDoClearBookmarks = jest.spyOn(tool, 'doClearBookmarks').mockImplementation(() => {
            return;
        });

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
        const bookmark = {name: 'jest'};
        const element = {name: 'jest-element'}
        const tool = initToolInstance();

        const spyOnHideOverlay = jest.spyOn(InfoWindowManager, 'hideOverlay').mockImplementation(() => {
            return;
        });

        const spyOnDoRemoveBookmark = jest.spyOn(tool, 'doRemoveBookmark').mockImplementation(() => {
            return;
        });

        const dialog = tool.askToDeleteBookmark(bookmark, element);
        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnHideOverlay).toHaveBeenCalled();
        expect(spyOnDoRemoveBookmark).toHaveBeenCalledWith(bookmark, element);
    });

    it('should ask user to edit bookmark', () => {
        const bookmark = {name: 'jest'};
        const bookmarkName = 'jest';
        const tool = initToolInstance();

        const spyOnHideOverlay = jest.spyOn(InfoWindowManager, 'hideOverlay').mockImplementation(() => {
            return;
        });

        const spyOnDoEditBookmark = jest.spyOn(tool, 'doEditBookmark').mockImplementation(() => {
            return;
        });
        
        const dialog = tool.askToEditBookmark(bookmark, bookmarkName);
        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnHideOverlay).toHaveBeenCalled();
        expect(spyOnDoEditBookmark).toHaveBeenCalledWith(bookmark, bookmarkName, 'jest');
    });

    it('should check if local storage has stored bookmark', () => {
        const bookmark = {id: 1, name: 'jest', coordinates: [57.0, 36.0]};
        const tool = initToolInstance();
        tool.localStorage.bookmarks.push(bookmark);

        expect(tool.hasLocalStorageBookmarkById(1)).toBe(true);
        expect(tool.getLocalStorageBookmarkById(1)).toStrictEqual(bookmark);

        expect(tool.hasLocalStorageBookmarkById(2)).toBe(false);
        expect(tool.getLocalStorageBookmarkById(2)).toBeUndefined();
    });

    it('should zoom to given bookmark', () => {
        const bookmark = {id: 1, name: 'jest', coordinates: [57.0, 36.0]};
        const options = {onZoomedTo: () => {}};
        const spyOnOnZoomedTo = jest.spyOn(options, 'onZoomedTo');

        const tool = initToolInstance(options);
        tool.doZoomToBookmark(bookmark);
        
        expect(spyOnOnZoomedTo).toHaveBeenCalledTimes(1);
        expect(tippy).toHaveBeenCalledTimes(1);
    });

    it('should add bookmark', () => {
        const options = {onAdded: () => {}};
        const spyOnOnAdded = jest.spyOn(options, 'onAdded');

        const tool = initToolInstance(options);
        const bookmark = tool.doAddBookmark('jest-bookmark', [36.0, 57.0]);
        
        expect(spyOnOnAdded).toHaveBeenCalledTimes(1);
        expect(bookmark).toHaveProperty('name', 'jest-bookmark');
        expect(bookmark).toHaveProperty('coordinates', [36.0, 57.0]);
    });

    it('should remove bookmark', () => {
        const options = {onRemoved: (bookmark) => {
            expect(bookmark).toHaveProperty('id', 1);
            expect(bookmark).toHaveProperty('name', 'jest');
            expect(bookmark).toHaveProperty('coordinates', [57.0, 36.0]);
        }};
        const spyOnOnRemoved = jest.spyOn(options, 'onRemoved');

        const bookmark = {id: 1, name: 'jest', coordinates: [57.0, 36.0]};
        const bookmarkElement = window.document.createElement('div');

        const tool = initToolInstance(options);
        tool.doRemoveBookmark(bookmark, bookmarkElement);
        
        expect(spyOnOnRemoved).toHaveBeenCalledTimes(1);
    });

    it('should edit bookmark', () => {
        const options = {onRenamed: (bookmark) => {
            expect(bookmark).toHaveProperty('id', 1);
            expect(bookmark).toHaveProperty('name', 'foobar');
            expect(bookmark).toHaveProperty('coordinates', [57.0, 36.0]);
        }};
        const spyOnOnRenamed = jest.spyOn(options, 'onRenamed');

        const result = 'foobar';
        const bookmark = {id: 1, name: 'jest', coordinates: [57.0, 36.0]};
        const bookmarkName = {
            getTippy: () => {
                return {
                    setContent: () => {}
                }
            }
        };

        const tool = initToolInstance(options);
        tool.doEditBookmark(bookmark, bookmarkName, result);
        
        expect(spyOnOnRenamed).toHaveBeenCalledTimes(1);
    });

    it('should have visible layer at load', () => {
        const options = {markerLayerVisibleOnLoad: true};
        const tool = initToolInstance(options);
        expect(tool.isLayerVisible()).toBe(true);
    });

    it('should not have visible layer at load', () => {
        const options = {markerLayerVisibleOnLoad: false};
        const tool = initToolInstance(options);
        expect(tool.isLayerVisible()).toBe(false);
    });
});
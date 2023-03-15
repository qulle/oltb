import tippy from 'tippy.js';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../helpers/GoToView';
import { toLonLat, transform } from 'ol/proj';
import { LogManager } from '../core/managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { toStringHDMS } from 'ol/coordinate';
import { randomNumber } from '../helpers/browser/Random';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { copyToClipboard } from '../helpers/browser/CopyToClipboard';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { generateAnimalName } from '../helpers/name-generator/NameGenerator';

const FILENAME = 'tools/BookmarkTool.js';
const BOOKMARK_BUTTON_DEFAULT_CLASSES = 'oltb-func-btn';
const ID_PREFIX = 'oltb-bookmark';

const DefaultOptions = Object.freeze({
    storeDataInLocalStorage: false,
    bookmarks: []
});

const LocalStorageNodeName = LocalStorageKeys.bookmarkTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false,
    bookmarks: [],
    click: undefined,
    added: undefined,
    removed: undefined,
    renamed: undefined,
    zoomedTo: undefined,
    cleared: undefined
});

class BookmarkTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.bookmarkStar.stroked,
            class: 'oltb-tool-button__icon'
        });

        const clearBookmarksIcon = getIcon({
            path: SvgPaths.bookmarkX.stroked
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Bookmarks (${ShortcutKeys.bookmarkTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = { ...DefaultOptions, ...options };
        
        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Bookmarks
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <div class="oltb-input-button-group">
                            <input type="text" id="${ID_PREFIX}-add-text" class="oltb-input" placeholder="Bookmark name">
                            <button type="button" id="${ID_PREFIX}-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="Add Bookmark">
                                ${getIcon({
                                    path: SvgPaths.plus.stroked,
                                    width: 20,
                                    height: 20,
                                    fill: 'none',
                                    stroke: '#FFFFFFFF',
                                    class: 'oltb-btn__icon'
                                })}
                            </button>
                        </div>
                    </div>
                    <div class="oltb-toolbox-section__group oltb-m-0">
                        <ul id="${ID_PREFIX}-stack" class="oltb-toolbox-list"></ul>
                    </div>
                </div>
            </div>
        `);

        this.bookmarkToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.bookmarkStack = this.bookmarkToolbox.querySelector(`#${ID_PREFIX}-stack`);

        this.addBookmarkButton = this.bookmarkToolbox.querySelector(`#${ID_PREFIX}-add-button`);
        this.addBookmarkText = this.bookmarkToolbox.querySelector(`#${ID_PREFIX}-add-text`);

        this.addBookmarkButton.addEventListener(Events.browser.click, this.onBookmarkAdd.bind(this));
        this.addBookmarkText.addEventListener(Events.browser.keyUp, this.onBookmarkAdd.bind(this));

        const toggleableTriggers = this.bookmarkToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        // Add all bookmarks that is passed through constructor
        this.options.bookmarks.forEach((bookmark) => {
            this.createBookmark(bookmark);
        });

        // Add all saved bookmarks from localstorage
        this.localStorage.bookmarks.forEach((bookmark) => {
            this.createBookmark(bookmark);
        });

        ContextMenu.addItem({
            icon: icon, 
            name: 'Add location as bookmark', 
            fn: this.onContextMenuBookmarkAdd.bind(this)
        });

        ContextMenu.addItem({
            icon: clearBookmarksIcon, 
            name: 'Clear all bookmarks', 
            fn: this.onContextMenuBookmarksClear.bind(this)
        });

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(Boolean(this.localStorage.active)) {
            this.activateTool();
        }
    }

    onContextMenuBookmarkAdd(map, coordinates, target) {
        this.addBookmark('');
    }

    onContextMenuBookmarksClear(map, coordinates, target) {
        Dialog.confirm({
            title: 'Clear bookmarks',
            message: 'Do you want to clear all stored bookmarks?',
            confirmText: 'Clear',
            onConfirm: () => {
                this.clearBookmarks();

                Toast.info({
                    title: 'Cleared',
                    message: "All stored bookmarks was cleared", 
                    autoremove: Config.autoRemovalDuation.normal
                });
            }
        });
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.bookmarkTool)) {
            this.handleClick(event);
        }
    }

    onWindowSettingsCleared() {
        this.localStorage = { ...LocalStorageDefaults };
    }

    onBookmarkAdd(event) {
        if(
            event.type === Events.browser.keyUp && 
            event.key !== Keys.valueEnter
        ) {
            return;
        }

        this.addBookmark(this.addBookmarkText.value);
        this.addBookmarkText.value = '';
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(Boolean(this.active)) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.active = true;
        this.bookmarkToolbox.classList.add('oltb-toolbox-section--show');
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.active = false;
        this.bookmarkToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    addBookmark(bookmarkName) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        const view = map.getView();
        const zoom = view.getZoom();
        const location = toLonLat(view.getCenter());

        if(!Boolean(bookmarkName)) {
            bookmarkName = generateAnimalName();
        }

        bookmarkName = bookmarkName.trim();

        const bookmark = {
            id: randomNumber(),
            name: bookmarkName,
            zoom: zoom,
            location: location
        };

        if(Boolean(this.options.storeDataInLocalStorage)) {
            this.localStorage.bookmarks.push(bookmark);
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }        

        this.createBookmark(bookmark);

        if(!Boolean(this.active)) {
            Toast.success({
                title: 'New bookmark',
                message: `A new bookmark created <strong>${bookmarkName}</strong>`, 
                autoremove: Config.autoRemovalDuation.normal
            });
        }

        // User defined callback from constructor
        if(typeof this.options.added === 'function') {
            this.options.added(bookmark);
        }
    }

    clearBookmarks() {
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
        this.bookmarkStack.innerHTML = '';

        // User defined callback from constructor
        if(typeof this.options.cleared === 'function') {
            this.options.cleared();
        }
    }

    createBookmark(bookmark) {
        const bookmarkElement = DOM.createElement({
            element: 'li', 
            id: `oltb-bookmark-${bookmark.id}`,
            class: 'oltb-toolbox-list__item'
        });

        const bookmarkName = DOM.createElement({
            element: 'span', 
            text: bookmark.name.ellipsis(20),
            class: 'oltb-toolbox-list__title oltb-tippy',
            title: bookmark.name
        });

        // This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        tippy(bookmarkName, {
            content(reference) {
                const title = reference.getAttribute('title');
                reference.removeAttribute('title');
                return title;
            },
            placement: 'top',
            theme: 'oltb oltb-themed',
            delay: [600, 100]
        });

        const leftButtonWrapper = DOM.createElement({
            element: 'div', 
            class: 'oltb-toolbox-list__wrapper'
        });

        DOM.appendChildren(leftButtonWrapper, [
            bookmarkName
        ]);

        DOM.appendChildren(bookmarkElement, [
            leftButtonWrapper
        ]);

        const rightButtonWrapper = DOM.createElement({
            element: 'div', 
            class: 'oltb-toolbox-list__wrapper'
        });

        const zoomToButton = DOM.createElement({
            element: 'button',
            class: `${BOOKMARK_BUTTON_DEFAULT_CLASSES} oltb-func-btn--geo-pin oltb-tippy`,
            title: 'Zoom to location',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.zoomToBookmark.bind(this, bookmark)
            }
        });

        const copyCoordinatesButton = DOM.createElement({
            element: 'button',
            class: `${BOOKMARK_BUTTON_DEFAULT_CLASSES} oltb-func-btn--crosshair oltb-tippy`,
            title: 'Copy coordinates',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.coopyBookmarkCoordinates.bind(this, bookmark)
            }
        });
        
        const editButton = DOM.createElement({
            element: 'button',
            class: `${BOOKMARK_BUTTON_DEFAULT_CLASSES} oltb-func-btn--edit oltb-tippy`,
            title: 'Rename bookmark',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.editBookmark.bind(this, bookmark, bookmarkName)
            }
        });

        const deleteButton = DOM.createElement({
            element: 'button',
            class: `${BOOKMARK_BUTTON_DEFAULT_CLASSES} oltb-func-btn--delete oltb-tippy`,
            title: 'Delete bookmark',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.deleteBookmark.bind(this, bookmark, bookmarkElement)
            }
        });
        
        DOM.appendChildren(rightButtonWrapper, [
            zoomToButton,
            copyCoordinatesButton,
            editButton, 
            deleteButton
        ]);
        
        DOM.appendChildren(bookmarkElement, [
            rightButtonWrapper
        ]);

        // Add the bookmark to the user interface
        this.bookmarkStack.prepend(bookmarkElement);
    }

    zoomToBookmark(bookmark) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }
        
        goToView(map, bookmark.location, bookmark.zoom);

        // User defined callback from constructor
        if(typeof this.options.zoomedTo === 'function') {
            this.options.zoomedTo(bookmark);
        }
    }
    
    coopyBookmarkCoordinates(bookmark) {
        const coordinates = transform(
            bookmark.location, 
            Config.projection.default, 
            Config.projection.wgs84
        );

        const prettyCoordinates = toStringHDMS(coordinates);

        copyToClipboard(prettyCoordinates)
            .then(() => {
                Toast.success({
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard', 
                    autoremove: Config.autoRemovalDuation.normal
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';
                LogManager.logError(FILENAME, 'coopyBookmarkCoordinates', {
                    message: errorMessage,
                    error: error
                });
                
                Toast.error({
                    title: 'Error',
                    message: errorMessage
                });
            });
    }

    deleteBookmark(bookmark, bookmarkElement) {
        Dialog.confirm({
            title: 'Delete bookmark',
            message: `Do you want to delete the <strong>${bookmark.name}</strong> bookmark?`,
            confirmText: 'Delete',
            onConfirm: () => {
                bookmarkElement.remove();

                // Remove the bookmark from the collection
                this.localStorage.bookmarks = this.localStorage.bookmarks.filter((item) => {
                    return item.id !== bookmark.id;
                });

                StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

                // User defined callback from constructor
                if(typeof this.options.removed === 'function') {
                    this.options.removed(bookmark);
                }
            }
        });
    }

    editBookmark(bookmark, bookmarkName) {
        Dialog.prompt({
            title: 'Edit name',
            message: `You are editing the <strong>${bookmark.name}</strong> bookmark`,
            value: bookmark.name,
            confirmText: 'Rename',
            onConfirm: (result) => {
                if(result !== null && !!result.length) {
                    bookmark.name = result;
                    bookmarkName.innerText = result.ellipsis(20);
                    bookmarkName._tippy.setContent(result);

                    StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

                    // User defined callback from constructor
                    if(typeof this.options.renamed === 'function') {
                        this.options.renamed(bookmark);
                    }
                }
            }
        });
    }
}

export { BookmarkTool };
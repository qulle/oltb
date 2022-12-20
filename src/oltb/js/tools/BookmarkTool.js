import tippy from 'tippy.js';
import { DOM } from '../helpers/browser/DOM';
import { KEYS } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../core/managers/StateManager';
import { randomNumber } from '../helpers/browser/Random';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';
import { generateAnimalName } from '../helpers/name-generator/NameGenerator';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/elements/index';

const BOOKMARK_BUTTON_DEFAULT_CLASSES = 'oltb-func-btn';
const ID_PREFIX = 'oltb-bookmark';

const DEFAULT_OPTIONS = Object.freeze({
    storeDataInLocalStorage: false
});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.BookmarkTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false,
    collapsed: false,
    bookmarks: Object.freeze([])
});

class BookmarkTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Bookmark,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Bookmarks (${SHORTCUT_KEYS.Bookmark})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        // Load stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
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
                            <input type="text" id="${ID_PREFIX}-add-txt" class="oltb-input" placeholder="Bookmark name">
                            <button type="button" id="${ID_PREFIX}-add-btn" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="Add Bookmark">
                                ${getIcon({
                                    path: SVG_PATHS.PlusSmall,
                                    width: 20,
                                    height: 20,
                                    fill: 'none',
                                    stroke: 'rgb(255, 255, 255)',
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

        this.addBookmarkButton = this.bookmarkToolbox.querySelector(`#${ID_PREFIX}-add-btn`);
        this.addBookmarkText = this.bookmarkToolbox.querySelector(`#${ID_PREFIX}-add-txt`);

        this.addBookmarkButton.addEventListener(EVENTS.Browser.Click, this.onBookmarkAdd.bind(this));
        this.addBookmarkText.addEventListener(EVENTS.Browser.KeyUp, this.onBookmarkAdd.bind(this));

        const toggleableTriggers = this.bookmarkToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleToolbox.bind(this, toggle));
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
            icon: icon, 
            name: 'Clear all bookmarks', 
            fn: this.onContextMenuBookmarksClear.bind(this)
        });

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(CONFIG.AnimationDuration.Fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onContextMenuBookmarkAdd(map, coordinates, target) {
        this.addBookmark('');
    }

    onContextMenuBookmarksClear(map, coordinates, target) {
        Dialog.confirm({
            text: 'Do you want to clear all bookmarks?',
            onConfirm: () => {
                this.clearBookmarks();

                Toast.success({text: "All bookmarks was cleared", autoremove: 4000});
            }
        });
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Bookmark)) {
            this.handleClick(event);
        }
    }

    onWindowSettingsCleared() {
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS };
    }

    onBookmarkAdd(event) {
        if(
            event.type === EVENTS.Browser.KeyUp && 
            event.key.toLowerCase() !== KEYS.Enter
        ) {
            return;
        }

        this.addBookmark(this.addBookmarkText.value);
        this.addBookmarkText.value = '';
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(this.active) {
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
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    deActivateTool() {
        this.active = false;
        this.bookmarkToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    addBookmark(bookmarkName) {
        const view = this.getMap().getView();
        const zoom = view.getZoom();
        const location = view.getCenter();

        if(!bookmarkName) {
            bookmarkName = generateAnimalName();
        }

        bookmarkName = bookmarkName.trim();

        const bookmark = {
            id: randomNumber(),
            name: bookmarkName,
            zoom: zoom,
            location: location
        };

        if(this.options.storeDataInLocalStorage) {
            this.localStorage.bookmarks.push(bookmark);
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        }        

        // Create the bookmark UI element
        this.createBookmark(bookmark);

        if(!this.active) {
            Toast.success({text: 'Bookmark created', autoremove: 4000});
        }

        // User defined callback from constructor
        if(typeof this.options.added === 'function') {
            this.options.added(bookmark);
        }
    }

    clearBookmarks() {
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(LOCAL_STORAGE_DEFAULTS));
        this.bookmarkStack.innerHTML = '';

        // User defined callback from constructor
        if(typeof this.options.cleared === 'function') {
            this.options.cleared();
        }
    }

    createBookmark(bookmark) {
        // Create bookmark item
        const bookmarkElement = DOM.createElement({
            element: 'li', 
            id: `oltb-bookmark-${bookmark.id}`,
            class: 'oltb-toolbox-list__item'
        });

        // Create bookmark name label
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

        // Create div for holding left side of bookmark item
        const leftButtonWrapper = DOM.createElement({
            element: 'div', 
            class: 'oltb-toolbox-list__wrapper'
        });

        leftButtonWrapper.appendChild(bookmarkName);
        bookmarkElement.appendChild(leftButtonWrapper);

        // Create div for holding right side of bookmark item
        const rightButtonWrapper = DOM.createElement({
            element: 'div', 
            class: 'oltb-toolbox-list__wrapper'
        });

        // Add all buttons to the bookmark
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
            editButton, 
            deleteButton
        ]);
        
        bookmarkElement.appendChild(rightButtonWrapper);

        // Add the bookmark to the user interface
        this.bookmarkStack.prepend(bookmarkElement);
    }

    zoomToBookmark(bookmark) {
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            zoom: bookmark.zoom,
            center: bookmark.location,
            duration: CONFIG.AnimationDuration.Normal,
            easing: easeOut
        });

        // User defined callback from constructor
        if(typeof this.options.zoomedTo === 'function') {
            this.options.zoomedTo(bookmark);
        }
    }

    deleteBookmark(bookmark, bookmarkElement) {
        Dialog.confirm({
            html: `Do you want to delete bookmark <strong>${bookmark.name}</strong>?`,
            onConfirm: () => {
                bookmarkElement.remove();

                // Remove the bookmark from the collection
                this.localStorage.bookmarks = this.localStorage.bookmarks.filter((item) => {
                    return item.id !== bookmark.id;
                });

                StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

                // User defined callback from constructor
                if(typeof this.options.removed === 'function') {
                    this.options.removed(bookmark);
                }
            }
        });
    }

    editBookmark(bookmark, bookmarkName) {
        Dialog.prompt({
            text: 'Edit bookmark name',
            value: bookmark.name,
            confirmText: 'Rename',
            onConfirm: (result) => {
                if(result !== null && !!result.length) {
                    bookmark.name = result;
                    bookmarkName.innerText = result.ellipsis(20);
                    bookmarkName._tippy.setContent(result);

                    StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

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
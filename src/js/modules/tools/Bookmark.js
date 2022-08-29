import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Dialog from '../common/Dialog';
import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import Config from '../core/Config';
import StateManager from '../core/Managers/StateManager';
import { Control } from 'ol/control';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { generateAnimalName } from '../helpers/NameGenerator/NameGenerator';
import { easeOut } from 'ol/easing';
import { randomNumber } from '../helpers/Random';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const BOOKMARK_BUTTON_DEFAULT_CLASSES = 'oltb-func-btn';
const LOCAL_STORAGE_NODE_NAME = 'bookmarkTool';
const LOCAL_STORAGE_PROPS = {
    collapsed: false,
    bookmarks: []
};

const DEFAULT_OPTIONS = {
    storeDataInLocalStorage: false
};

class Bookmark extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Bookmark,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Bookmarks (B)'
            }
        });
        
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = options;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        // Load potential stored data from localStorage
        const loadedPropertiesFromLocalStorage = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};

        // Merge the potential data replacing the default values
        this.localStorage = { ...LOCAL_STORAGE_PROPS, ...loadedPropertiesFromLocalStorage };

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-bookmarks-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="oltb-bookmarks-toolbox-collapsed">
                        Bookmarks
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="oltb-bookmarks-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <div class="oltb-input-button-group">
                            <input type="text" id="oltb-add-bookmark-txt" class="oltb-input" placeholder="Bookmark name">
                            <button type="button" id="oltb-add-bookmark-btn" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="Add Bookmark">
                                ${getIcon({
                                    path: SVGPaths.PlusSmall,
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
                        <ul id="oltb-bookmark-stack" class="oltb-toolbox-list"></ul>
                    </div>
                </div>
            </div>
        `);

        const bookmarksToolbox = document.querySelector('#oltb-bookmarks-toolbox');
        this.bookmarksToolbox = bookmarksToolbox;

        const addBookmarkBtn = bookmarksToolbox.querySelector('#oltb-add-bookmark-btn');
        const addBookmarkTxt = bookmarksToolbox.querySelector('#oltb-add-bookmark-txt');

        addBookmarkBtn.addEventListener('click', (event) => {
            event.preventDefault();
    
            this.addBookmark(addBookmarkTxt.value);
            addBookmarkTxt.value = '';
        });

        addBookmarkTxt.addEventListener('keyup', (event) => {
            if(event.key === 'Enter') {
                this.addBookmark(addBookmarkTxt.value);
                addBookmarkTxt.value = '';
            }
        });

        const bookmarkStack = bookmarksToolbox.querySelector('#oltb-bookmark-stack');
        this.bookmarkStack = bookmarkStack;

        const toggleableTriggers = bookmarksToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                event.preventDefault();
                
                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                });
            });
        });

        // Add all saved bookmarks from localstorage
        this.localStorage.bookmarks.forEach(bookmark => {
            this.createBookmark(bookmark);
        });

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Add location as bookmark', fn: this.addBookmark.bind(this)});
        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Clear all bookmarks', fn: () => {
            Dialog.confirm({
                text: 'Do you want to clear all bookmarks?',
                onConfirm: () => {
                    this.clearBookmarks();

                    Toast.success({text: "All bookmarks was cleared", autoremove: 3000});
                }
            });
        }});

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'b')) {
                this.handleClick(event);
            }
        });
        window.addEventListener('oltb.settings.cleared', () => {
            this.localStorage = LOCAL_STORAGE_PROPS;
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleBookmarks();
    }

    handleBookmarks() {
        this.active = !this.active;
        this.bookmarksToolbox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }

    addBookmark(bookmarkName) {
        const view = this.getMap().getView();
        const zoom = view.getZoom();
        const location = view.getCenter();

        bookmarkName = bookmarkName.trim();

        if(!bookmarkName) {
            bookmarkName = generateAnimalName();
        }

        const bookmark = {
            id: randomNumber(),
            name: bookmarkName,
            zoom: zoom,
            location: location
        };

        if(this.options.storeDataInLocalStorage) {
            this.localStorage.bookmarks.push(bookmark);
            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        }        

        // Create the bookmark UI element
        this.createBookmark(bookmark);

        if(!this.active) {
            Toast.success({text: 'Bookmark created', autoremove: 3000});
        }

        // User defined callback from constructor
        if(typeof this.options.added === 'function') {
            this.options.added(bookmark);
        }
    }

    clearBookmarks() {
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(LOCAL_STORAGE_PROPS));
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
            class: BOOKMARK_BUTTON_DEFAULT_CLASSES + ' oltb-func-btn--geo-pin oltb-tippy',
            title: 'Zoom to location',
            attributes: {
                type: 'button'
            }
        });

        zoomToButton.addEventListener('click', this.zoomToBookmark.bind(this, bookmark));

        const editButton = DOM.createElement({
            element: 'button',
            class: BOOKMARK_BUTTON_DEFAULT_CLASSES + ' oltb-func-btn--edit oltb-tippy',
            title: 'Rename bookmark',
            attributes: {
                type: 'button'
            }
        });

        editButton.addEventListener('click', this.editBookmark.bind(this, bookmark, bookmarkName));

        const deleteButton = DOM.createElement({
            element: 'button',
            class: BOOKMARK_BUTTON_DEFAULT_CLASSES + ' oltb-func-btn--delete oltb-tippy',
            title: 'Delete bookmark',
            attributes: {
                type: 'button'
            }
        });

        deleteButton.addEventListener('click', this.deleteBookmark.bind(this, bookmark, bookmarkElement));

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
            duration: Config.animationDuration,
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
                this.localStorage.bookmarks = this.localStorage.bookmarks.filter((item => {
                    return item.id !== bookmark.id;
                }));

                StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

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

                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

                    // User defined callback from constructor
                    if(typeof this.options.renamed === 'function') {
                        this.options.renamed(bookmark);
                    }
                }
            }
        });
    }
}

export default Bookmark;
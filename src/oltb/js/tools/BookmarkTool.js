import tippy from 'tippy.js';
import Sortable from 'sortablejs';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../core/managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { v4 as uuidv4 } from 'uuid';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { generateMarker } from '../generators/GenerateMarker';
import { ElementManager } from '../core/managers/ElementManager';
import { copyToClipboard } from '../helpers/browser/CopyToClipboard';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { InfoWindowManager } from '../core/managers/InfoWindowManager';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { generateAnimalName } from '../helpers/name-generator/NameGenerator';
import { fromLonLat, toLonLat } from 'ol/proj';

const FILENAME = 'tools/BookmarkTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOOLBOX_LIST = 'oltb-toolbox-list';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX = 'oltb-bookmark';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const SORTABLE_BOOKMARKS = 'sortableBookmarks';

const DefaultOptions = Object.freeze({
    markerLayerVisibleOnLoad: true,
    storeDataInLocalStorage: false,
    bookmarks: [],
    click: undefined,
    added: undefined,
    removed: undefined,
    renamed: undefined,
    zoomedTo: undefined,
    cleared: undefined
});

const LocalStorageNodeName = LocalStorageKeys.bookmarkTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false,
    bookmarks: [],
    sortMap: {}
});

class BookmarkTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.bookmarkStar.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const clearBookmarksIcon = getIcon({
            path: SvgPaths.bookmarkX.stroked
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
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

        this.layerWrapper = LayerManager.addFeatureLayer({
            id: '1fde0d79-46f9-4c92-8f9c-eb0e98f46772',
            name: 'Bookmarks', 
            visible: this.options.markerLayerVisibleOnLoad, 
            silent: true,
            disableFeatureLayerVisibilityButton: false,
            disableFeatureLayerEditButton: false,
            disableFeatureLayerDownloadButton: true,
            disableFeatureLayerDeleteButton: true
        });

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Bookmarks
                        <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
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
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <ul id="${ID_PREFIX}-stack" class="${CLASS_TOOLBOX_LIST}"></ul>
                    </div>
                </div>
            </div>
        `);

        this.bookmarkToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.bookmarkStack = this.bookmarkToolbox.querySelector(`#${ID_PREFIX}-stack`);

        this.sortableBookmarkStack = Sortable.create(this.bookmarkStack, {
            group: SORTABLE_BOOKMARKS,
            animation: Config.animationDuration.warp,
            forceFallback: true,
            handle: `.${CLASS_TOOLBOX_LIST}__handle`,
            chosenClass: `${CLASS_TOOLBOX_LIST}__item--chosen`,
            dragClass: `${CLASS_TOOLBOX_LIST}__item--drag`,
            ghostClass: `${CLASS_TOOLBOX_LIST}__item--ghost`,
            onEnd: (event) => {
                const ul = event.to;
                ul.childNodes.forEach((li, index) => {
                    // Update data-attribute, this is used by Sortable.js to do the sorting
                    li.setAttribute('data-id', index);

                    // Update state that is stored in localStorage
                    // This will keep track of the sort after a reload
                    const bookmarkId = li.getAttribute('data-item-id');
                    console.log('Innan', this.localStorage.sortMap[bookmarkId]);
                    this.localStorage.sortMap[bookmarkId] = index;
                    console.log('Efter', this.localStorage.sortMap[bookmarkId]);
                });

                StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
            }
        });
                                
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

    validateName(name) {
        name = name.trim();

        if(!name) {
            name = generateAnimalName();
        }

        return name;
    }

    addMarker(marker) {
        this.layerWrapper.getLayer().getSource().addFeature(marker);
    }

    removeMarker(marker) {
        this.layerWrapper.getLayer().getSource().removeFeature(marker);
    }

    clearMarkers() {
        this.layerWrapper.getLayer().getSource().clear();
    }

    isLayerVisible() {
        return this.layerWrapper.getLayer().getVisible()
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
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
        if(this.options.click instanceof Function) {
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
        this.bookmarkToolbox.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.active = false;
        this.bookmarkToolbox.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    addBookmark(name) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const view = map.getView();
        const zoom = view.getZoom();
        const coordinates = toLonLat(view.getCenter());

        name = this.validateName(name);

        const bookmarkId = uuidv4();
        const bookmark = {
            id: bookmarkId,
            name: name,
            zoom: zoom,
            coordinates: coordinates
        };

        if(this.options.storeDataInLocalStorage) {
            this.localStorage.bookmarks.push(bookmark);
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }        

        this.createBookmark(bookmark);

        if(!this.active) {
            Toast.success({
                title: 'New bookmark',
                message: `A new bookmark created <strong>${name}</strong>`, 
                autoremove: Config.autoRemovalDuation.normal
            });
        }

        // User defined callback from constructor
        if(this.options.added instanceof Function) {
            this.options.added(bookmark);
        }
    }

    clearBookmarks() {
        LogManager.logInformation(FILENAME, 'clearBookmarks', 'All bookmarks cleared');
        
        // Delete bookmark items from toolbox
        this.bookmarkStack.innerHTML = '';

        // Delete markers from feature-layer
        this.clearMarkers();

        // Remove the bookmarks from localstorage
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);

        // User defined callback from constructor
        if(this.options.cleared instanceof Function) {
            this.options.cleared();
        }
    }

    addBookmarkMarker(bookmark) {
        const coordinates = bookmark.coordinates;
        const prettyCoordinates = toStringHDMS(coordinates);
        const infoWindow = {
            title: bookmark.name,
            content: '',
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-copy="${bookmark.name}"></button>
                </div>
            `
        };
        
        const marker = new generateMarker({
            lon: coordinates[0],
            lat: coordinates[1],
            title: bookmark.name,
            description: '',
            icon: 'bookmarkStar.filled',
            fill: '#3B4352FF',
            stroke: '#FFFFFFFF',
            infoWindow: infoWindow
        });

        // Add reference to the marker on the bookmark
        bookmark.marker = marker;

        this.addMarker(marker);
    }

    sortAsc(sortable) {
        const order = sortable.toArray();
        sortable.sort(order.sort(), false);
    }

    sortDesc(sortable) {
        const order = sortable.toArray();
        sortable.sort(order.reverse(), false);
    }

    getDataIdFromBookmarkId(primary, secondary, id) {
        return primary[id] ?? secondary.length;
    }

    addBookmarkItem(bookmark) {
        // BookmarkId = The unique Bookmark Id
        // Data Id = The Sort Index used by Sortable.js
        const bookmarkId = bookmark.id;
        const dataId = this.getDataIdFromBookmarkId(
            this.localStorage.sortMap,
            this.bookmarkStack.childNodes,
            bookmarkId
        );

        const bookmarkElement = DOM.createElement({
            element: 'li', 
            id: `oltb-bookmark-${bookmarkId}`,
            class: `${CLASS_TOOLBOX_LIST}__item`,
            attributes: {
                'data-item-id': bookmarkId,
                'data-id': dataId
            }
        });

        const bookmarkName = DOM.createElement({
            element: 'span', 
            text: bookmark.name.ellipsis(20),
            class: `${CLASS_TOOLBOX_LIST}__title`,
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

        const leftWrapper = DOM.createElement({
            element: 'div', 
            class: `${CLASS_TOOLBOX_LIST}__wrapper`
        });

        DOM.appendChildren(leftWrapper, [
            bookmarkName
        ]);

        DOM.appendChildren(bookmarkElement, [
            leftWrapper
        ]);

        const rightWrapper = DOM.createElement({
            element: 'div', 
            class: `${CLASS_TOOLBOX_LIST}__wrapper`
        });

        const zoomToButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--geo-pin oltb-tippy`,
            title: 'Zoom to coordinates',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.zoomToBookmark.bind(this, bookmark)
            }
        });

        const copyCoordinatesButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy`,
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
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy`,
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
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy`,
            title: 'Delete bookmark',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.deleteBookmark.bind(this, bookmark, bookmarkElement)
            }
        });
        
        DOM.appendChildren(rightWrapper, [
            zoomToButton,
            copyCoordinatesButton,
            editButton, 
            deleteButton
        ]);

        const layerHandle = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__handle oltb-tippy`,
            title: 'Drag to sort'
        });

        DOM.appendChildren(rightWrapper, [
            layerHandle
        ]);
        
        DOM.appendChildren(bookmarkElement, [
            rightWrapper
        ]);

        this.bookmarkStack.append(bookmarkElement);
        this.sortDesc(this.sortableBookmarkStack);
    }

    createBookmark(bookmark) {
        LogManager.logInformation(FILENAME, 'createBookmark', bookmark);        

        this.addBookmarkItem(bookmark);
        this.addBookmarkMarker(bookmark);
    }

    zoomToBookmark(bookmark) {
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        // Focus Location in view
        goToView(map, bookmark.coordinates, bookmark.zoom);

        // Trigger InfoWindow to show
        if(this.isLayerVisible()) {
            window.setTimeout(() => {
                InfoWindowManager.showOverly(bookmark.marker, fromLonLat(bookmark.coordinates));
            }, Config.animationDuration.normal);
        }

        // User defined callback from constructor
        if(this.options.zoomedTo instanceof Function) {
            this.options.zoomedTo(bookmark);
        }
    }
    
    coopyBookmarkCoordinates(bookmark) {
        const prettyCoordinates = toStringHDMS(bookmark.coordinates);

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
        InfoWindowManager.hideOverlay();
        Dialog.confirm({
            title: 'Delete bookmark',
            message: `Do you want to delete the <strong>${bookmark.name}</strong> bookmark?`,
            confirmText: 'Delete',
            onConfirm: () => {
                LogManager.logInformation(FILENAME, 'deleteBookmark', bookmark);

                // Delete bookmark item from toolbox
                bookmarkElement.remove();

                // Delete stored sort index
                delete this.localStorage.sortMap[bookmark.id];

                // Delete marker from feature-layer
                this.removeMarker(bookmark.marker);

                // Remove the bookmark from localstorage
                this.localStorage.bookmarks = this.localStorage.bookmarks.filter((item) => {
                    return item.id !== bookmark.id;
                });

                StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

                // User defined callback from constructor
                if(this.options.removed instanceof Function) {
                    this.options.removed(bookmark);
                }
            }
        });
    }

    editBookmark(bookmark, bookmarkName) {
        InfoWindowManager.hideOverlay();
        Dialog.prompt({
            title: 'Edit name',
            message: `You are editing the <strong>${bookmark.name}</strong> bookmark`,
            value: bookmark.name,
            confirmText: 'Rename',
            onConfirm: (result) => {
                if(result !== null && !!result.length) {
                    // Update model
                    bookmark.name = result;

                    // Update UI item
                    bookmarkName.innerText = result.ellipsis(20);
                    bookmarkName._tippy.setContent(result);

                    // Update Marker and InfoWindow
                    // Easiest to delete and add a new Marker at the same location
                    this.removeMarker(bookmark.marker);
                    this.addBookmarkMarker(bookmark);

                    StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

                    // User defined callback from constructor
                    if(this.options.renamed instanceof Function) {
                        this.options.renamed(bookmark);
                    }
                }
            }
        });
    }
}

export { BookmarkTool };
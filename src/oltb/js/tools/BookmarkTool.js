import _ from 'lodash';
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
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-bookmark';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const SORTABLE_BOOKMARKS = 'sortableBookmarks';
const INDEX_OFFSET = 1;

const DefaultOptions = Object.freeze({
    markerLayerVisibleOnLoad: true,
    bookmarks: [],
    onClick: undefined,
    onAdded: undefined,
    onRemoved: undefined,
    onRenamed: undefined,
    onZoomedTo: undefined,
    onCleared: undefined,
    onDragged: undefined
});

const LocalStorageNodeName = LocalStorageKeys.bookmarkTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false,
    bookmarks: []
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
                'type': 'button',
                'data-tippy-content': `Bookmarks (${ShortcutKeys.bookmarkTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        // Persistent layer that holds all Bookmark markers
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

        this.initToolboxHTML();
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();

        this.uiRefBookmarkStack = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-stack`);
                                
        this.uiRefAddBookmarkText = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-add-text`);
        this.uiRefAddBookmarkButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-add-button`);

        this.uiRefAddBookmarkText.addEventListener(Events.browser.keyUp, this.onAddBookmarkByKey.bind(this));
        this.uiRefAddBookmarkButton.addEventListener(Events.browser.click, this.onAddBookmarkByClick.bind(this));

        this.sortableBookmarkStack = this.generateSortable(this.uiRefBookmarkStack, {
            group: SORTABLE_BOOKMARKS,
            callback: this.options.onDragged,
            stack: this.localStorage.bookmarks
        });

        this.initState();

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

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initToolboxHTML() {
        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', `
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
    }

    initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS_TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });
    }

    initState() {
        // Process all Bookmarks from constructor
        // Check if the id of the Bookmark is already in LS, if not, add it
        this.options.bookmarks.forEach((bookmark) => {
            if(!this.hasLocalStorageBookmarkById(bookmark.id)) {
                bookmark.sortIndex = 0;
                bookmark.isDynamicallyAdded = false;

                this.localStorage.bookmarks.push(bookmark);
            }
        });

        // Create all Bookmarks in Map and Toolbox
        this.localStorage.bookmarks.forEach((bookmark) => {
            this.createUIBookmark(bookmark);
        });

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }

        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.active = true;
        this.uiRefToolboxSection.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.active = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        const targetNode = document.getElementById(targetName);

        targetNode?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    // -------------------------------------------------------------------
    // # Section: Window/Document Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.bookmarkTool)) {
            this.onClickTool(event);
        }
    }

    onWindowSettingsCleared() {
        this.clearBookmarks();
        
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);

        if(this.active) {
            this.deActivateTool();
        }
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Local Storage
    // -------------------------------------------------------------------

    getLocalStorageBookmarkById(id) {
        const bookmark = this.localStorage.bookmarks.find((item) => {
            return item.id === id;
        });

        return bookmark;
    }

    hasLocalStorageBookmarkById(id) {
        const bookmark = this.getLocalStorageBookmarkById(id);

        if(bookmark) {
            return true;
        }

        return false;
    }

    // -------------------------------------------------------------------
    // # Section: Context Menu Methods
    // -------------------------------------------------------------------

    onContextMenuBookmarkAdd(map, coordinates, target) {
        this.addBookmark('', coordinates);
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

    // -------------------------------------------------------------------
    // # Section: OpenLayers Shortcut
    // -------------------------------------------------------------------

    addMarkerToMap(marker) {
        this.layerWrapper.getLayer().getSource().addFeature(marker);
    }

    removeMarkerFromMap(marker) {
        this.layerWrapper.getLayer().getSource().removeFeature(marker);
    }

    clearMarkersFromMap() {
        this.layerWrapper.getLayer().getSource().clear();
    }

    isLayerVisible() {
        return this.layerWrapper.getLayer().getVisible()
    }

    // -------------------------------------------------------------------
    // # Section: Sortable
    // -------------------------------------------------------------------

    generateSortable(element, options) {
        return Sortable.create(element, {
            group: options.group,
            dataIdAttr: 'data-oltb-sort-index',
            animation: Config.animationDuration.warp,
            forceFallback: true,
            handle: `.${CLASS_TOOLBOX_LIST}__handle`,
            chosenClass: `${CLASS_TOOLBOX_LIST}__item--chosen`,
            dragClass: `${CLASS_TOOLBOX_LIST}__item--drag`,
            ghostClass: `${CLASS_TOOLBOX_LIST}__item--ghost`,
            onEnd: (event) => this.onEndSortable(event, options)
        });
    }

    onEndSortable(event, options) {
        // Callback data
        // Note: The old/new are swapped due to the list beeing reversed in DESC order
        const list = [];
        const currentItem = {
            id: event.item.getAttribute('data-oltb-id'),
            oldIndex: event.newDraggableIndex,
            newIndex: event.oldDraggableIndex
        };

        const ul = event.to;
        ul.childNodes.forEach((li, index) => {
            // Note: Reverse the index so that 0 is at bottom of list not top
            const reversedIndex = ul.childNodes.length - index - INDEX_OFFSET;
            li.setAttribute('data-oltb-sort-index', reversedIndex);

            const id = li.getAttribute('data-oltb-id');
            const target = this.getLocalStorageBookmarkById(id);

            if(target) {
                target.sortIndex = reversedIndex;
            }

            list.push({
                id: id,
                index: reversedIndex
            });
        });

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // Note: Consumer callback
        if(options.callback instanceof Function) {
            options.callback(currentItem, list);
        }
    }

    sortSortableDesc(sortable, animate = false) {
        const order = sortable.toArray().sort().reverse();
        sortable.sort(order, animate);
    }

    getSortableIndexFromBookmarkId(primary, secondary, id) {
        const item = primary.find((item) => {
            return item.id === id;
        });

        if(item && item.sortIndex !== undefined) {
            return item.sortIndex;
        }

        return secondary.length;
    }

    // -------------------------------------------------------------------
    // # Section: Conversions/Validation
    // -------------------------------------------------------------------

    validateName(name) {
        name = name.trim();

        if(!name) {
            name = generateAnimalName();
        }

        return name;
    }

    isValidResult(result) {
        return result !== null && !!result.length;
    }

    isValidEnter(event) {
        return event.type === Events.browser.keyUp && event.key === Keys.valueEnter;
    }

    // -------------------------------------------------------------------
    // # Section: HTML/Map Callback
    // -------------------------------------------------------------------

    onAddBookmarkByKey(event) {
        if(!this.isValidEnter(event)) {
            return;
        }

        this.onAddBookmarkByClick();
    }

    onAddBookmarkByClick() {
        const name = this.uiRefAddBookmarkText.value;
        this.uiRefAddBookmarkText.value = '';

        this.addBookmark(name);
    }

    // -------------------------------------------------------------------
    // # Section: UI
    // -------------------------------------------------------------------

    createUIBookmarkNameTippy(bookmarkName) {
        tippy(bookmarkName, {
            content(reference) {
                const title = reference.getAttribute('title');
                reference.removeAttribute('title');
                return title;
            },
            placement: 'top',
            theme: 'oltb oltb-themed',
            delay: Config.tippy.offset
        });
    }

    createUIBookmark(bookmark) {
        LogManager.logInformation(FILENAME, 'createUIBookmark', bookmark);        

        this.createUIBookmarkItem(bookmark);
        this.createUIBookmarkMarker(bookmark);

        if(!this.hasLocalStorageBookmarkById(bookmark.id)) {
            this.localStorage.bookmarks.push(bookmark);
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }
    }

    createUIBookmarkItem(bookmark) {
        const sortIndex = this.getSortableIndexFromBookmarkId(
            this.localStorage.bookmarks,
            this.uiRefBookmarkStack.childNodes,
            bookmark.id
        );

        // Note: This is the current true sortIndex
        bookmark.sortIndex = sortIndex;

        const bookmarkElement = DOM.createElement({
            element: 'li', 
            id: `${ID_PREFIX}-${bookmark.id}`,
            class: `${CLASS_TOOLBOX_LIST}__item`,
            attributes: {
                'data-oltb-id': bookmark.id,
                'data-oltb-sort-index': sortIndex
            }
        });

        const bookmarkName = DOM.createElement({
            element: 'span', 
            text: bookmark.name.ellipsis(20),
            class: `${CLASS_TOOLBOX_LIST}__title`,
            title: bookmark.name,
            prototypes:{
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        // Note: This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        this.createUIBookmarkNameTippy(bookmarkName);

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
                'type': 'button'
            },
            listeners: {
                'click': this.onZoomToBookmark.bind(this, bookmark)
            }
        });

        const copyCoordinatesButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy`,
            title: 'Copy coordinates',
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.onCopyBookmarkCoordinates.bind(this, bookmark)
            }
        });
        
        const editButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy`,
            title: 'Rename bookmark',
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.onEditBookmark.bind(this, bookmark, bookmarkName)
            }
        });

        const deleteButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy`,
            title: 'Delete bookmark',
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.onDeleteBookmark.bind(this, bookmark, bookmarkElement)
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

        this.uiRefBookmarkStack.append(bookmarkElement);
        this.sortSortableDesc(this.sortableBookmarkStack);
    }

    createUIBookmarkMarker(bookmark) {
        const coordinates = bookmark.coordinates;
        const prettyCoordinates = toStringHDMS(coordinates);
        const infoWindow = {
            title: bookmark.name,
            content: '',
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${bookmark.name}"></button>
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

        bookmark.marker = marker;

        this.addMarkerToMap(marker);
    }

    // -------------------------------------------------------------------
    // # Section: Tool Specific
    // -------------------------------------------------------------------

    addBookmark(name, coordinates) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Validate properties
        name = this.validateName(name);

        const view = map.getView();
        const zoom = view.getZoom();
        const transformedCoordinates = coordinates ?? toLonLat(view.getCenter());

        // Create Bookmark object
        const bookmarkId = uuidv4();
        const bookmark = {
            id: bookmarkId,
            name: name,
            zoom: zoom,
            coordinates: transformedCoordinates,
            isDynamicallyAdded: true,
            sortIndex: 0
        };

        this.createUIBookmark(bookmark);

        // Note: Alert the user, the Bookmark was created when the tools was not active
        if(!this.active) {
            Toast.success({
                title: 'New bookmark',
                message: `A new bookmark created <strong>${name}</strong>`, 
                autoremove: Config.autoRemovalDuation.normal
            });
        }

        // Note: Consumer callback
        if(this.options.onAdded instanceof Function) {
            this.options.onAdded(bookmark);
        }
    }

    clearBookmarks() {
        LogManager.logInformation(FILENAME, 'clearBookmarks', 'All bookmarks cleared');
        
        DOM.clearElement(this.uiRefBookmarkStack);
        this.clearMarkersFromMap();

        this.localStorage.bookmarks = [];
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // Note: Consumer callback
        if(this.options.onCleared instanceof Function) {
            this.options.onCleared();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Bookmark Callback
    // -------------------------------------------------------------------

    onZoomToBookmark(bookmark) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        goToView(map, bookmark.coordinates, bookmark.zoom);

        if(this.isLayerVisible()) {
            InfoWindowManager.showOverly(
                bookmark.marker, 
                fromLonLat(bookmark.coordinates),
                Config.animationDuration.normal
            );
        }

        // Note: Consumer callback
        if(this.options.onZoomedTo instanceof Function) {
            this.options.onZoomedTo(bookmark);
        }
    }
    
    onCopyBookmarkCoordinates(bookmark) {
        const prettyCoordinates = toStringHDMS(bookmark.coordinates);

        copyToClipboard(prettyCoordinates)
            .then(() => {
                Toast.info({
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard', 
                    autoremove: Config.autoRemovalDuation.normal
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';
                LogManager.logError(FILENAME, 'onCopyBookmarkCoordinates', {
                    message: errorMessage,
                    error: error
                });
                
                Toast.error({
                    title: 'Error',
                    message: errorMessage
                });
            });
    }

    onDeleteBookmark(bookmark, bookmarkElement) {
        InfoWindowManager.hideOverlay();

        Dialog.confirm({
            title: 'Delete bookmark',
            message: `Do you want to delete the <strong>${bookmark.name}</strong> bookmark?`,
            confirmText: 'Delete',
            onConfirm: () => {
                LogManager.logInformation(FILENAME, 'onDeleteBookmark', bookmark);

                DOM.removeElement(bookmarkElement);
                this.removeMarkerFromMap(bookmark.marker);

                this.localStorage.bookmarks = this.localStorage.bookmarks.filter((item) => {
                    return item.id !== bookmark.id;
                });

                this.localStorage.bookmarks.forEach((item) => {
                    if(item.sortIndex > bookmark.sortIndex) {
                        item.sortIndex -= 1;
                    }
                });

                this.uiRefBookmarkStack.childNodes.forEach((item) => {
                    const sortIndex = Number(item.getAttribute('data-oltb-sort-index'));
        
                    if(sortIndex > bookmark.sortIndex) {
                        bookmarkElement.setAttribute('data-oltb-sort-index', sortIndex - 1);
                    }
                });

                this.sortSortableDesc(this.sortableBookmarkStack);
                StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

                // Note: Consumer callback
                if(this.options.onRemoved instanceof Function) {
                    this.options.onRemoved(bookmark);
                }
            }
        });
    }

    onEditBookmark(bookmark, bookmarkName) {
        InfoWindowManager.hideOverlay();
        
        Dialog.prompt({
            title: 'Edit name',
            message: `You are editing the <strong>${bookmark.name}</strong> bookmark`,
            value: bookmark.name,
            confirmText: 'Rename',
            onConfirm: (result) => {
                if(this.isValidResult(result)) {
                    bookmark.name = result;
                    bookmarkName.innerText = result.ellipsis(20);
                    bookmarkName.getTippy().setContent(result);

                    // Note: Easiest to delete and add a new Marker at the same location
                    this.removeMarkerFromMap(bookmark.marker);
                    this.createUIBookmarkMarker(bookmark);

                    StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

                    // Note: Consumer callback
                    if(this.options.onRenamed instanceof Function) {
                        this.options.onRenamed(bookmark);
                    }
                }
            }
        });
    }
}

export { BookmarkTool };
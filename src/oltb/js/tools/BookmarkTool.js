import _ from 'lodash';
import tippy from 'tippy.js';
import Sortable from 'sortablejs';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { v4 as uuidv4 } from 'uuid';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../managers/LayerManager';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { copyToClipboard } from '../helpers/browser/CopyToClipboard';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { InfoWindowManager } from '../managers/InfoWindowManager';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { generateIconMarker } from '../generators/GenerateIconMarker';
import { TranslationManager } from '../managers/TranslationManager';
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
const ID_MARKER_PATH = 'bookmarkStar.filled';
const SORTABLE_BOOKMARKS = 'sortableBookmarks';
const INDEX_OFFSET = 1;
const I18N_BASE = 'tools.bookmarkTool';
const I18N_BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
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

const LocalStorageNodeName = LocalStorageKeys.bookmarkTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    isCollapsed: false,
    bookmarks: []
});

/**
 * About:
 * Create locations as Bookmarks 
 * 
 * Description:
 * A marker on the map shows the location and is also found in the Toolbox.
 * Sorting can be done by simple drag and drop.
 */
class BookmarkTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        this.icon = getIcon({
            path: SvgPaths.bookmarkStar.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        this.clearBookmarksIcon = getIcon({
            path: SvgPaths.bookmarkX.stroked
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.bookmarkTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.bookmarkTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.layerWrapper = this.generateBookmarkLayer();

        this.initToolboxHTML();
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();
                                
        this.uiRefAddBookmarkText = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-add-text`);
        this.uiRefAddBookmarkButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-add-button`);

        this.uiRefAddBookmarkText.addEventListener(Events.browser.keyUp, this.onAddBookmarkByKey.bind(this));
        this.uiRefAddBookmarkButton.addEventListener(Events.browser.click, this.onAddBookmarkByClick.bind(this));

        this.uiRefBookmarkStack = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-stack`);
        this.sortableBookmarkStack = this.generateSortable(this.uiRefBookmarkStack, {
            group: SORTABLE_BOOKMARKS,
            callback: this.options.onDragged,
            stack: this.localStorage.bookmarks
        });

        this.initState();
        this.initContextMenuItems();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initToolboxHTML() {
        const i18n = TranslationManager.get(`${I18N_BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.bookmarks">${i18n.titles.bookmarks}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <div class="oltb-input-button-group">
                            <input type="text" id="${ID_PREFIX}-add-text" class="oltb-input" data-oltb-i18n="${I18N_BASE}.toolbox.groups.addBookmark.placeholder" placeholder="${i18n.groups.addBookmark.placeholder}">
                            <button type="button" id="${ID_PREFIX}-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N_BASE}.toolbox.groups.addBookmark.add" title="${i18n.groups.addBookmark.add}">
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
        // Check if the id of the Bookmark is already in local storage, if not, add it
        this.options.bookmarks.forEach((bookmark) => {
            if(!this.hasLocalStorageBookmarkById(bookmark.id)) {
                bookmark.sortIndex = 0;
                bookmark.isDynamicallyAdded = false;

                this.localStorage.bookmarks.push(bookmark);
            }
        });

        this.localStorage.bookmarks.forEach((bookmark) => {
            this.createUIBookmark(bookmark);
        });

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    initContextMenuItems() {
        ContextMenu.addItem({
            icon: this.icon, 
            i18nKey: `${I18N_BASE}.contextItems.addBookmark`,
            fn: this.onContextMenuBookmarkAdd.bind(this)
        });

        ContextMenu.addItem({
            icon: this.clearBookmarksIcon, 
            i18nKey: `${I18N_BASE}.contextItems.clearBookmarks`, 
            fn: this.onContextMenuBookmarksClear.bind(this)
        });
    }

    // -------------------------------------------------------------------
    // # Section: Generate Helpers
    // -------------------------------------------------------------------

    generateBookmarkLayer() {
        return LayerManager.addFeatureLayer({
            id: '1fde0d79-46f9-4c92-8f9c-eb0e98f46772',
            name: TranslationManager.get(`${I18N_BASE}.layers.bookmarks`), 
            visible: this.options.markerLayerVisibleOnLoad, 
            isSilent: true,
            disableFeatureLayerEditButton: false,
            disableFeatureLayerDownloadButton: true,
            disableFeatureLayerDeleteButton: true
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        if(this.isActive) {
            this.deactivateTool();
        }else {
            this.activateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        this.isActive = true;
        this.uiRefToolboxSection.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deactivateTool() {
        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.bookmarkTool)) {
            this.onClickTool(event);
        }
    }

    onWindowBrowserStateCleared() {
        this.doClearBookmarks();
        this.doClearState();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool Callbacks
    // -------------------------------------------------------------------

    onZoomToBookmark(bookmark) {
        this.doZoomToBookmark(bookmark);
    }
    
    onCopyBookmarkCoordinates(bookmark) {
        this.doCopyBookmarkCoordinates(bookmark);
    }

    onDeleteBookmark(bookmark, bookmarkElement) {
        this.askDeleteBookmark(bookmark, bookmarkElement);
    }

    onEditBookmark(bookmark, bookmarkName) {        
        this.askEditBookmark(bookmark, bookmarkName);
    }

    // -------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    // -------------------------------------------------------------------

    onContextMenuBookmarkAdd(map, coordinates, target) {
        this.doAddBookmark('', coordinates);
    }

    onContextMenuBookmarksClear(map, coordinates, target) {
        this.askClearBookmarks();
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        
        this.doToggleToolboxSection(targetName);
    }

    onAddBookmarkByKey(event) {
        if(!this.isValidEnterKey(event)) {
            return;
        }

        this.onAddBookmarkByClick(event);
    }

    onAddBookmarkByClick(event) {
        const name = this.uiRefAddBookmarkText.value;
        this.uiRefAddBookmarkText.value = '';

        this.doAddBookmark(name);
    }

    // -------------------------------------------------------------------
    // # Section: LocalStorage Helpers
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
        const duration = ConfigManager.getConfig().animationDuration.warp;

        return Sortable.create(element, {
            group: options.group,
            dataIdAttr: 'data-oltb-sort-index',
            animation: duration,
            forceFallback: true,
            handle: `.${CLASS_TOOLBOX_LIST}__handle`,
            chosenClass: `${CLASS_TOOLBOX_LIST}__item--chosen`,
            dragClass: `${CLASS_TOOLBOX_LIST}__item--drag`,
            ghostClass: `${CLASS_TOOLBOX_LIST}__item--ghost`,
            onEnd: (event) => this.onEndSortable(event, options)
        });
    }

    onEndSortable(event, options) {
        // Note: 
        // User callback data
        // The old/new are swapped due to the list beeing reversed in DESC order
        const list = [];
        const currentItem = {
            id: event.item.getAttribute('data-oltb-id'),
            oldIndex: event.newDraggableIndex,
            newIndex: event.oldDraggableIndex
        };

        const ul = event.to;
        ul.childNodes.forEach((li, index) => {
            // Note: 
            // Reverse the index so that 0 is at bottom of list not top
            const reversedIndex = ul.childNodes.length - index - INDEX_OFFSET;
            li.setAttribute('data-oltb-sort-index', reversedIndex);

            const id = li.getAttribute('data-oltb-id');

            // Note: 
            // The Bookmark item is one and the same for LocalStorage
            // This is not true for the LayerTool that has slightly different logic
            const bookmarkItem = this.getLocalStorageBookmarkById(id);
            if(bookmarkItem) {
                bookmarkItem.sortIndex = reversedIndex;
            }

            list.push({
                id: id,
                index: reversedIndex
            });
        });

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // Note: 
        // @Consumer callback
        if(options.callback instanceof Function) {
            options.callback(currentItem, list);
        }
    }

    sortSortableDesc(sortable, isAnimated = false) {
        const order = sortable.toArray().sort().reverse();
        sortable.sort(order, isAnimated);
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

        if(!this.isValid(name)) {
            name = generateAnimalName();
        }

        return name;
    }

    isValid(result) {
        return result !== null && result !== undefined && !!result.length;
    }

    isValidEnterKey(event) {
        return event.type === Events.browser.keyUp && event.key === Keys.valueEnter;
    }

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    createUIBookmarkNameTippy(bookmarkName) {
        return tippy(bookmarkName, {
            content(reference) {
                const title = reference.getAttribute('title');
                reference.removeAttribute('title');
                return title;
            },
            placement: 'top',
            theme: 'oltb oltb-themed',
            delay: ConfigManager.getConfig().tippy.delay
        });
    }

    createUIBookmark(bookmark) {
        LogManager.logDebug(FILENAME, 'createUIBookmark', bookmark);        

        this.createUIBookmarkItem(bookmark);
        this.doAddIconMarker(bookmark);

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

        // Note: 
        // This is the current true sortIndex
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
            prototypes: {
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        // Note: 
        // This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        this.createUIBookmarkNameTippy(bookmarkName);

        const leftWrapper = DOM.createElement({
            element: 'div', 
            class: `${CLASS_TOOLBOX_LIST}__wrapper`
        });

        const layerActiveDot = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__dot`
        });

        DOM.appendChildren(leftWrapper, [
            layerActiveDot
        ]);

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

        const i18n = TranslationManager.get(I18N_BASE_COMMON);
        const zoomToButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--geo-pin oltb-tippy`,
            title: i18n.titles.zoomToCoordinates,
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
            title: i18n.titles.copyCoordinates,
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
            title: i18n.titles.rename,
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
            title: i18n.titles.delete,
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
            title: i18n.titles.dragToSort
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

    // -------------------------------------------------------------------
    // # Section: Ask User
    // -------------------------------------------------------------------

    askClearBookmarks() {
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.confirms.clearBookmarks`);

        Dialog.confirm({
            title: i18n.title,
            message: i18n.message,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                this.doClearBookmarks();

                Toast.info({
                    i18nKey: `${I18N_BASE}.toasts.infos.clearBookmarks`,
                    autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
                });
            }
        });
    }

    askDeleteBookmark(bookmark, bookmarkElement) {
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.confirms.clearBookmarks`);

        Dialog.confirm({
            title: i18n.title,
            message: `${i18n.message} <strong>${bookmark.name}</strong>?`,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                InfoWindowManager.hideOverlay();
                this.doRemoveBookmark(bookmark, bookmarkElement);
            }
        });
    }

    askEditBookmark(bookmark, bookmarkName) {
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.prompts.editBookmark`);

        Dialog.prompt({
            title: i18n.title,
            message: `${i18n.message} <strong>${bookmark.name}</strong>`,
            value: bookmark.name,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                InfoWindowManager.hideOverlay();
                
                if(this.isValid(result)) {
                    this.doEditBookmark(bookmark, bookmarkName, result);
                }
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doToggleToolboxSection(targetName) {
        const targetNode = document.getElementById(targetName);
        const duration = ConfigManager.getConfig().animationDuration.fast;

        targetNode?.slideToggle(duration, (collapsed) => {
            this.localStorage.isCollapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doAddIconMarker(bookmark) {
        const coordinates = bookmark.coordinates;
        const prettyCoordinates = toStringHDMS(coordinates);

        const infoWindow = {
            title: bookmark.name,
            content: '',
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy Marker Coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${bookmark.name}"></button>
                </div>
            `
        };
        
        const marker = new generateIconMarker({
            lon: coordinates[0],
            lat: coordinates[1],
            title: bookmark.name,
            icon: ID_MARKER_PATH,
            markerFill: '#3B4352FF',
            markerStroke: '#FFFFFFFF',
            label: bookmark.name,
            labelUseEllipsisAfter: this.options.markerLabelUseEllipsisAfter,
            labelUseUpperCase: this.options.markerLabelUseUpperCase,
            infoWindow: infoWindow
        });

        bookmark.marker = marker;

        this.addMarkerToMap(marker);

        return marker;
    }

    doAddBookmark(name, coordinates) {
        const map = this.getMap();
        if(!map) {
            return;
        }

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

        // Note: 
        // Alert the user, the Bookmark was created when the tool was not active
        if(!this.isActive) {
            Toast.success({
                i18nKey: `${I18N_BASE}.toasts.infos.createBookmark`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }

        // Note: 
        // @Consumer callback
        if(this.options.onAdded instanceof Function) {
            this.options.onAdded(bookmark);
        }

        return bookmark;
    }

    doRemoveBookmark(bookmark, bookmarkElement) {
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

        // Note: 
        // @Consumer callback
        if(this.options.onRemoved instanceof Function) {
            this.options.onRemoved(bookmark);
        }
    }

    doEditBookmark(bookmark, bookmarkName, result) {
        bookmark.name = result;
        bookmarkName.innerText = result.ellipsis(20);
        bookmarkName.getTippy().setContent(result);

        // Note: 
        // Easiest to delete and add a new Marker at the same location
        this.removeMarkerFromMap(bookmark.marker);
        this.doAddIconMarker(bookmark);

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // Note: 
        // @Consumer callback
        if(this.options.onRenamed instanceof Function) {
            this.options.onRenamed(bookmark);
        }
    }

    doClearBookmarks() {
        LogManager.logDebug(FILENAME, 'doClearBookmarks', 'All bookmarks cleared');
        
        DOM.clearElement(this.uiRefBookmarkStack);
        this.clearMarkersFromMap();

        this.localStorage.bookmarks = [];
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // Note: 
        // @Consumer callback
        if(this.options.onCleared instanceof Function) {
            this.options.onCleared();
        }
    }

    doZoomToBookmark(bookmark) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        goToView({
            map: map,
            coordinates: bookmark.coordinates,
            zoom: bookmark.zoom,
            onDone: (result) => {
                if(this.isLayerVisible()) {
                    InfoWindowManager.pulseAnimation(bookmark.marker);
                    InfoWindowManager.showOverlay(bookmark.marker, fromLonLat(bookmark.coordinates));
                }
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onZoomedTo instanceof Function) {
            this.options.onZoomedTo(bookmark);
        }
    }

    async doCopyBookmarkCoordinates(bookmark) {
        const prettyCoordinates = toStringHDMS(bookmark.coordinates);
        
        try {
            await copyToClipboard(prettyCoordinates);

            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.copyCoordinates`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }catch(error) {
            LogManager.logError(FILENAME, 'doCopyBookmarkCoordinates', {
                message: 'Failed to copy coordinates',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.errors.copyCoordinates`
            });
        }
    }
}

export { BookmarkTool };
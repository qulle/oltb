import _ from 'lodash';
import tippy from 'tippy.js';
import Sortable from 'sortablejs';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Dialog } from '../../ui-common/ui-dialogs/dialog';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { goToView } from '../../ol-helpers/go-to-view';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { NameManager } from '../../toolbar-managers/name-manager/name-manager';
import { v4 as uuidv4 } from 'uuid';
import { toStringHDMS } from 'ol/coordinate';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { InfoWindowManager } from '../../toolbar-managers/info-window-manager/info-window-manager';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';
import { fromLonLat, toLonLat } from 'ol/proj';

const FILENAME = 'bookmark-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOOLBOX_LIST = 'oltb-toolbox-list';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-bookmark';
const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const ID__MARKER_PATH = 'bookmarkStar.filled';
const ID__BOOKMARK_LAYER_UUID = '1fde0d79-46f9-4c92-8f9c-eb0e98f46772';
const SORTABLE_BOOKMARKS = 'sortableBookmarks';
const INDEX_OFFSET = 1;
const I18N__BASE = 'tools.bookmarkTool';
const I18N__BASE_COMMON = 'commons';

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
class BookmarkTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        this.icon = getSvgIcon({
            path: SvgPaths.bookmarkStar.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        this.clearBookmarksIcon = getSvgIcon({
            path: SvgPaths.bookmarkX.stroked
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.bookmarkTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.bookmarkTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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

        this.layerWrapper = this.#generateBookmarkLayer();

        this.#initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.#initToggleables();
                                
        this.uiRefAddBookmarkText = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-add-text`);
        this.uiRefAddBookmarkButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-add-button`);

        this.uiRefAddBookmarkText.addEventListener(Events.browser.keyUp, this.#onAddBookmarkByKey.bind(this));
        this.uiRefAddBookmarkButton.addEventListener(Events.browser.click, this.#onAddBookmarkByClick.bind(this));

        this.uiRefBookmarkStack = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-stack`);
        this.sortableBookmarkStack = this.#generateSortable(this.uiRefBookmarkStack, {
            group: SORTABLE_BOOKMARKS,
            callback: this.options.onDragged,
            stack: this.localStorage.bookmarks
        });

        this.#initState();
        this.#initContextMenuItems();
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onOLTBReadyBind = this.#onOLTBReady.bind(this);
        this.onWindowBrowserStateClearedBind = this.#onWindowBrowserStateCleared.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.removeEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);

        if(this.isActive) {
            this.deactivateTool();
        }else {
            this.activateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initToolboxHTML() {
        const i18n = TranslationManager.get(`${I18N__BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);

        const html = (`
            <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
                <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.bookmarks">${i18n.titles.bookmarks}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group">
                        <div class="oltb-input-button-group">
                            <input type="text" id="${ID__PREFIX}-add-text" class="oltb-input" data-oltb-i18n="${I18N__BASE}.toolbox.groups.addBookmark.placeholder" placeholder="${i18n.groups.addBookmark.placeholder}">
                            <button type="button" id="${ID__PREFIX}-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.addBookmark.add" title="${i18n.groups.addBookmark.add}">
                                ${getSvgIcon({
                                    path: SvgPaths.plus.stroked,
                                    width: 20,
                                    height: 20,
                                    fill: 'none',
                                    stroke: '#FFFFFFFF',
                                    strokeWidth: 1,
                                    class: 'oltb-btn__icon'
                                })}
                            </button>
                        </div>
                    </div>
                    <div class="${CLASS__TOOLBOX_SECTION}__group">
                        <ul id="${ID__PREFIX}-stack" class="${CLASS__TOOLBOX_LIST}"></ul>
                    </div>
                </div>
            </div>
        `);

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', html);
    }

    #initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS__TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.#onToggleToolbox.bind(this, toggle));
        });
    }

    #initState() {
        // Note:
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
            this.#createUIBookmark(bookmark);
        });

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    #initContextMenuItems() {
        ContextMenuTool.addItem({
            icon: this.icon, 
            i18nKey: `${I18N__BASE}.contextItems.addBookmark`,
            fn: this.#onContextMenuBookmarkAdd.bind(this)
        });

        ContextMenuTool.addItem({
            icon: this.clearBookmarksIcon, 
            i18nKey: `${I18N__BASE}.contextItems.clearBookmarks`, 
            fn: this.#onContextMenuBookmarksClear.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: Generate Helpers
    //--------------------------------------------------------------------
    #generateBookmarkLayer() {
        return LayerManager.addFeatureLayer({
            id: ID__BOOKMARK_LAYER_UUID,
            name: TranslationManager.get(`${I18N__BASE}.layers.bookmarks`), 
            isVisible: this.options.markerLayerVisibleOnLoad, 
            isSilent: true,
            disableFeatureLayerEditButton: false,
            disableFeatureLayerDownloadButton: true,
            disableFeatureLayerDeleteButton: true
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    activateTool() {
        this.isActive = true;
        this.uiRefToolboxSection.classList.add(`${CLASS__TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        this.uiRefToolboxSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end', 
            inline: 'nearest' 
        });
    }

    deactivateTool() {
        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS__TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.bookmarkTool)) {
            this.onClickTool(event);
        }
    }

    #onWindowBrowserStateCleared() {
        this.doClearBookmarks();
        this.doClearState();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool Callbacks
    //--------------------------------------------------------------------
    #onZoomToBookmark(bookmark) {
        this.doZoomToBookmark(bookmark);
    }
    
    #onCopyBookmarkCoordinates(bookmark) {
        this.doCopyBookmarkCoordinatesAsync(bookmark);
    }

    #onDeleteBookmark(bookmark, bookmarkElement) {
        this.askToDeleteBookmark(bookmark, bookmarkElement);
    }

    #onEditBookmark(bookmark, bookmarkName) {        
        this.askToEditBookmark(bookmark, bookmarkName);
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    #onContextMenuBookmarkAdd(map, coordinates, target) {
        this.doAddBookmark('', coordinates);
    }

    #onContextMenuBookmarksClear(map, coordinates, target) {
        this.askToClearBookmarks();
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }

    #onAddBookmarkByKey(event) {
        if(!this.#isValidEnterKey(event)) {
            return;
        }

        this.onAddBookmarkByClick(event);
    }

    #onAddBookmarkByClick(event) {
        const name = this.uiRefAddBookmarkText.value;
        this.uiRefAddBookmarkText.value = '';

        this.doAddBookmark(name);
    }

    //--------------------------------------------------------------------
    // # Section: LocalStorage Helpers
    //--------------------------------------------------------------------
    getLocalStorageBookmarkById(id) {
        const bookmark = this.localStorage.bookmarks.find((item) => {
            return item.id === id;
        });

        return bookmark;
    }

    hasLocalStorageBookmarkById(id) {
        return !!this.getLocalStorageBookmarkById(id);
    }

    //--------------------------------------------------------------------
    // # Section: OpenLayers Shortcut
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Sortable
    //--------------------------------------------------------------------
    #generateSortable(element, options) {
        const duration = ConfigManager.getConfig().animationDuration.warp;

        return Sortable.create(element, {
            group: options.group,
            dataIdAttr: 'data-oltb-sort-index',
            animation: duration,
            forceFallback: true,
            handle: `.${CLASS__TOOLBOX_LIST}__handle`,
            chosenClass: `${CLASS__TOOLBOX_LIST}__item--chosen`,
            dragClass: `${CLASS__TOOLBOX_LIST}__item--drag`,
            ghostClass: `${CLASS__TOOLBOX_LIST}__item--ghost`,
            onEnd: (event) => this.#onEndSortable(event, options)
        });
    }

    #onEndSortable(event, options) {
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
        if(options.callback) {
            options.callback(currentItem, list);
        }
    }

    #sortSortableDesc(sortable, isAnimated = false) {
        const order = sortable.toArray().sort().reverse();
        sortable.sort(order, isAnimated);
    }

    #getSortableIndexFromBookmarkId(primary, secondary, id) {
        const item = primary.find((item) => {
            return item.id === id;
        });

        if(item && item.sortIndex !== undefined) {
            return item.sortIndex;
        }

        return secondary.length;
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    #validateName(name) {
        name = name.trim();

        if(!this.#isValid(name)) {
            name = NameManager.generate();
        }

        return name;
    }

    #isValid(result) {
        return result !== null && result !== undefined && !!result.length;
    }

    #isValidEnterKey(event) {
        return event.type === Events.browser.keyUp && event.key === KeyboardKeys.valueEnter;
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createUIBookmarkNameTippy(bookmarkName) {
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

    #createUIBookmark(bookmark) {
        LogManager.logDebug(FILENAME, 'createUIBookmark', bookmark);        

        this.#createUIBookmarkItem(bookmark);
        this.doAddIconMarker(bookmark);

        if(!this.hasLocalStorageBookmarkById(bookmark.id)) {
            this.localStorage.bookmarks.push(bookmark);
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }
    }

    #createUIBookmarkItem(bookmark) {
        const sortIndex = this.#getSortableIndexFromBookmarkId(
            this.localStorage.bookmarks,
            this.uiRefBookmarkStack.childNodes,
            bookmark.id
        );

        // Note: 
        // This is the current true sortIndex
        bookmark.sortIndex = sortIndex;

        const bookmarkElement = DOM.createElement({
            element: 'li', 
            id: `${ID__PREFIX}-${bookmark.id}`,
            class: `${CLASS__TOOLBOX_LIST}__item`,
            attributes: {
                'data-oltb-id': bookmark.id,
                'data-oltb-sort-index': sortIndex
            }
        });

        const bookmarkName = DOM.createElement({
            element: 'span', 
            text: bookmark.name.ellipsis(20),
            class: `${CLASS__TOOLBOX_LIST}__title`,
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
        this.#createUIBookmarkNameTippy(bookmarkName);

        const leftWrapper = DOM.createElement({
            element: 'div', 
            class: `${CLASS__TOOLBOX_LIST}__wrapper`
        });

        const layerActiveDot = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__dot`
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
            class: `${CLASS__TOOLBOX_LIST}__wrapper`
        });

        const i18n = TranslationManager.get(I18N__BASE_COMMON);
        const zoomToButton = DOM.createElement({
            element: 'button',
            class: `${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--geo-pin oltb-tippy`,
            title: i18n.titles.zoomToCoordinates,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onZoomToBookmark.bind(this, bookmark)
            }
        });

        const copyCoordinatesButton = DOM.createElement({
            element: 'button',
            class: `${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--crosshair oltb-tippy`,
            title: i18n.titles.copyCoordinates,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onCopyBookmarkCoordinates.bind(this, bookmark)
            }
        });
        
        const editButton = DOM.createElement({
            element: 'button',
            class: `${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--edit oltb-tippy`,
            title: i18n.titles.rename,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onEditBookmark.bind(this, bookmark, bookmarkName)
            }
        });

        const deleteButton = DOM.createElement({
            element: 'button',
            class: `${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--delete oltb-tippy`,
            title: i18n.titles.delete,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onDeleteBookmark.bind(this, bookmark, bookmarkElement)
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
            class: `${CLASS__TOOLBOX_LIST}__handle oltb-tippy`,
            title: i18n.titles.dragToSort
        });

        DOM.appendChildren(rightWrapper, [
            layerHandle
        ]);
        
        DOM.appendChildren(bookmarkElement, [
            rightWrapper
        ]);

        this.uiRefBookmarkStack.append(bookmarkElement);
        this.#sortSortableDesc(this.sortableBookmarkStack);
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToClearBookmarks() {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.clearBookmarks`);

        return Dialog.confirm({
            title: i18n.title,
            message: i18n.message,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                this.doClearBookmarks();

                Toast.info({
                    i18nKey: `${I18N__BASE}.toasts.infos.clearBookmarks`,
                    autoremove: true
                });
            }
        });
    }

    askToDeleteBookmark(bookmark, bookmarkElement) {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.clearBookmarks`);

        return Dialog.confirm({
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

    askToEditBookmark(bookmark, bookmarkName) {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.prompts.editBookmark`);

        return Dialog.prompt({
            title: i18n.title,
            message: `${i18n.message} <strong>${bookmark.name}</strong>`,
            value: bookmark.name,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                InfoWindowManager.hideOverlay();
                
                if(this.#isValid(result)) {
                    this.doEditBookmark(bookmark, bookmarkName, result);
                }
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doToggleToolboxSection(targetName) {
        const targetNode = window.document.getElementById(targetName);
        const duration = ConfigManager.getConfig().animationDuration.fast;

        targetNode?.slideToggle(duration, (collapsed) => {
            this.localStorage.isCollapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    doAddIconMarker(bookmark) {
        const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
        const coordinates = bookmark.coordinates;
        const prettyCoordinates = toStringHDMS(coordinates);

        const infoWindow = {
            title: bookmark.name,
            content: '',
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--crosshair oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.copyCoordinates" title="${i18n.copyCoordinates}" id="${ID__PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--copy oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.copyText" title="${i18n.copyText}" id="${ID__PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${bookmark.name}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--layer oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.showLayer" title="${i18n.showLayer}" id="${ID__PREFIX_INFO_WINDOW}-show-layer"></button>
                </div>
            `
        };

        const marker = FeatureManager.generateIconMarker({
            lon: coordinates[0],
            lat: coordinates[1],
            title: bookmark.name,
            infoWindow: infoWindow,
            marker: {
                fill: '#3B4352FF',
                stroke: '#3B435266'
            },
            icon: {
                key: ID__MARKER_PATH
            },
            label: {
                text: bookmark.name,
                useEllipsisAfter: this.options.markerLabelUseEllipsisAfter,
                useUpperCase: this.options.markerLabelUseUpperCase
            }
        });

        bookmark.marker = marker;

        this.addMarkerToMap(marker);

        return marker;
    }

    createBookmarkObject(map, name, coordinates) {
        const view = map.getView();
        const zoom = view.getZoom();
        const transformedCoordinates = coordinates ?? toLonLat(view.getCenter());
        const id = uuidv4();
        
        const bookmark = {
            id: id,
            name: name,
            zoom: zoom,
            coordinates: transformedCoordinates,
            isDynamicallyAdded: true,
            sortIndex: 0
        };

        return bookmark;
    }

    doAddBookmark(name, coordinates) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        name = this.#validateName(name);

        const bookmark = this.createBookmarkObject(map, name, coordinates);
        this.#createUIBookmark(bookmark);

        // Note: 
        // Alert the user, the Bookmark was created when the tool was not active
        if(!this.isActive) {
            Toast.success({
                i18nKey: `${I18N__BASE}.toasts.infos.createBookmark`,
                autoremove: true
            });
        }

        // Note: 
        // @Consumer callback
        if(this.options.onAdded) {
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

        this.#sortSortableDesc(this.sortableBookmarkStack);
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // Note: 
        // @Consumer callback
        if(this.options.onRemoved) {
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
        if(this.options.onRenamed) {
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
        if(this.options.onCleared) {
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
                    InfoWindowManager.tryPulseAnimation(bookmark.marker);
                    InfoWindowManager.showOverlay(bookmark.marker, fromLonLat(bookmark.coordinates));
                }
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onZoomedTo) {
            this.options.onZoomedTo(bookmark);
        }
    }

    async doCopyBookmarkCoordinatesAsync(bookmark) {
        const prettyCoordinates = toStringHDMS(bookmark.coordinates);
        
        try {
            await copyToClipboard.copyAsync(prettyCoordinates);

            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.copyCoordinates`,
                autoremove: true
            });
        }catch(error) {
            LogManager.logError(FILENAME, 'doCopyBookmarkCoordinatesAsync', {
                message: 'Failed to copy coordinates',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.copyCoordinates`
            });
        }
    }
}

export { BookmarkTool };
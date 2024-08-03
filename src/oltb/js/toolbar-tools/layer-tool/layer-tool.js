import _ from 'lodash';
import tippy from 'tippy.js';
import Sortable from 'sortablejs';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Dialog } from '../../ui-common/ui-dialogs/dialog';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { LayerModal } from '../../ui-extensions/layer-modal/layer-modal';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { downloadFile } from '../../browser-helpers/download-file';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { instantiateLayer } from '../../ol-mappers/ol-layer/ol-layer';
import { createUICheckbox } from '../../ui-creators/ui-checkbox/create-ui-checkbox';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { instantiateSource } from '../../ol-mappers/ol-source/ol-source';
import { instantiateFormat } from '../../ol-mappers/ol-format/ol-format';
import { InfoWindowManager } from '../../toolbar-managers/info-window-manager/info-window-manager';
import { ProjectionManager } from '../../toolbar-managers/projection-manager/projection-manager';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { DownloadLayerModal } from '../../ui-extensions/download-layer-modal/download-layer-modal';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'layer-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOOLBOX_LIST = 'oltb-toolbox-list';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-layer';
const SORTABLE_MAP_LAYERS = 'sortableMapLayers';
const SORTABLE_FEATURE_LAYERS = 'sortableFeatureLayers';
const INDEX_OFFSET = 1;
const I18N__BASE = 'tools.layerTool';
const I18N__BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    disableMapCreateLayerButton: false,
    disableMapLayerEditButton: false,
    disableMapLayerDeleteButton: false,
    disableFeatureCreateLayerButton: false,
    disableFeatureLayerEditButton: false,
    disableFeatureLayerDeleteButton: false,
    disableFeatureLayerDownloadButton: false,
    onClicked: undefined,
    onInitiated: undefined,
    onBrowserStateCleared: undefined,
    onMapLayerAdded: undefined,
    onMapLayerRemoved: undefined,
    onMapLayerRenamed: undefined,
    onMapLayerVisibilityChanged: undefined,
    onMapLayerDragged: undefined,
    onFeatureLayerAdded: undefined,
    onFeatureLayerRemoved: undefined,
    onFeatureLayerRenamed: undefined,
    onFeatureLayerVisibilityChanged: undefined,
    onFeatureLayerDownloaded: undefined,
    onFeatureLayerDragged: undefined
});

/* 
    Because this tool has two different sections that can be collapsed it's not a viable solution to have a single collapsed property. 
    Unfortunately this results in two longer names stored in localStorage.
*/
const LocalStorageNodeName = LocalStorageKeys.layerTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    mapLayers: [],
    featureLayers: [],
    'oltb-layer-map-toolbox-collapsed': false,
    'oltb-layer-feature-toolbox-collapsed': false,
});

/**
 * About:
 * Manage Map- and Feature layers
 * 
 * Description:
 * Create and manage layers for both Map and Markers. 
 * Sorting can be done by simple drag and drop.
 */
class LayerTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        this.icon = getSvgIcon({
            path: SvgPaths.layers.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.layerTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.layerTool})`,
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
        this.layerModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.#initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.#initToggleables();

        this.uiRefMapLayerStack = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-map-stack`);
        this.uiRefAddMapLayerButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-map-stack-add-button`);
        this.uiRefAddMapLayerText = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-map-stack-add-text`);

        this.sortableMapLayerStack = this.#generateSortable(this.uiRefMapLayerStack, {
            group: SORTABLE_MAP_LAYERS,
            callback: this.options.onMapLayerDragged,
            setZIndex: LayerManager.setMapLayerZIndex.bind(LayerManager),
            getLayerItemById: LayerManager.getMapLayerById.bind(LayerManager),
            getLocalStorageItemById: this.getLocalStorageMapLayerById.bind(this),
            stack: this.localStorage.mapLayers
        });

        this.uiRefFeatureLayerStack = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-feature-stack`);
        this.uiRefAddFeatureLayerButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-feature-stack-add-button`);
        this.uiRefAddFeatureLayerText = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-feature-stack-add-text`);

        this.sortableFeatureLayerStack = this.#generateSortable(this.uiRefFeatureLayerStack, {
            group: SORTABLE_FEATURE_LAYERS,
            callback: this.options.onFeatureLayerDragged,
            setZIndex: LayerManager.setFeatureLayerZIndex.bind(LayerManager),
            getLayerItemById: LayerManager.getFeatureLayerById.bind(LayerManager),
            getLocalStorageItemById: this.getLocalStorageFeatureLayerById.bind(this),
            stack: this.localStorage.featureLayers
        });

        // Note: 
        // The three refs below might be null due to the user
        // disabled them in the constructor options
        if(this.uiRefAddMapLayerButton) {
            this.uiRefAddMapLayerButton.addEventListener(Events.browser.click, this.#onShowAddMapLayerModal.bind(this));
        }

        if(this.uiRefAddFeatureLayerButton) {
            this.uiRefAddFeatureLayerButton.addEventListener(Events.browser.click, this.#onAddFeatureLayerByClick.bind(this));
        }

        if(this.uiRefAddFeatureLayerText) {
            this.uiRefAddFeatureLayerText.addEventListener(Events.browser.keyUp, this.#onAddFeatureLayerByKey.bind(this));
        }

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
        this.onWindowMapLayerAddedBind = this.#onWindowMapLayerAdded.bind(this);
        this.onWindowMapLayerRemovedBind = this.#onWindowMapLayerRemoved.bind(this);
        this.onWindowFeatureLayerAddedBind = this.#onWindowFeatureLayerAdded.bind(this);
        this.onWindowFeatureLayerRemovedBind = this.#onWindowFeatureLayerRemoved.bind(this);
        this.onWindowBrowserStateClearedBind = this.#onWindowBrowserStateCleared.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.addEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAddedBind);
        window.addEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemovedBind);
        window.addEventListener(Events.custom.featureLayerAdded, this.onWindowFeatureLayerAddedBind);
        window.addEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemovedBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.removeEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAddedBind);
        window.removeEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemovedBind);
        window.removeEventListener(Events.custom.featureLayerAdded, this.onWindowFeatureLayerAddedBind);
        window.removeEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemovedBind);
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
                <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-map-toolbox-collapsed">
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.mapLayers">${i18n.titles.mapLayers}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-map-toolbox-collapsed" style="display: ${this.localStorage[`${ID__PREFIX}-map-toolbox-collapsed`] ? 'none' : 'block'}">
                    ${this.options.disableMapCreateLayerButton ? '' :
                        `
                            <div class="${CLASS__TOOLBOX_SECTION}__group">
                                <div class="oltb-input-button-group">
                                    <input type="text" id="${ID__PREFIX}-map-stack-add-text" class="oltb-input" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createMapLayer.placeholder" placeholder="${i18n.groups.createMapLayer.placeholder}">
                                    <button type="button" id="${ID__PREFIX}-map-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createMapLayer.create" title="${i18n.groups.createMapLayer.create}">
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
                        `
                    }
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${this.options.disableMapCreateLayerButton ? `${CLASS__TOOLBOX_SECTION}__group--topmost` : ''}">
                        <ul id="${ID__PREFIX}-map-stack" class="${CLASS__TOOLBOX_LIST}"></ul>
                    </div>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-feature-toolbox-collapsed">
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.featureLayers">${i18n.titles.featureLayers}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-feature-toolbox-collapsed" style="display: ${this.localStorage[`${ID__PREFIX}-feature-toolbox-collapsed`] ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group">
                        ${this.options.disableFeatureCreateLayerButton ? '' :
                            `
                                <div class="oltb-input-button-group">
                                    <input type="text" id="${ID__PREFIX}-feature-stack-add-text" class="oltb-input" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createFeatureLayer.placeholder" placeholder="${i18n.groups.createFeatureLayer.placeholder}">
                                    <button type="button" id="${ID__PREFIX}-feature-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createFeatureLayer.create" title="${i18n.groups.createFeatureLayer.create}">
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
                            `
                        }
                    </div>
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${this.options.disableFeatureCreateLayerButton ? `${CLASS__TOOLBOX_SECTION}__group--topmost` : ''}">
                        <ul id="${ID__PREFIX}-feature-stack" class="${CLASS__TOOLBOX_LIST} ${CLASS__TOOLBOX_LIST}--selectable"></ul>
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

    #initContextMenuItems() {
        if(!this.options.disableMapCreateLayerButton || !this.options.disableFeatureCreateLayerButton) {
            ContextMenuTool.addItem({});
        }

        if(!this.options.disableMapCreateLayerButton) {
            ContextMenuTool.addItem({
                icon: this.icon, 
                i18nKey: `${I18N__BASE}.contextItems.addMapLayer`, 
                fn: this.#onContextMenuAddMapLayerModal.bind(this)
            });
        }

        if(!this.options.disableFeatureCreateLayerButton) {
            ContextMenuTool.addItem({
                icon: this.icon, 
                i18nKey: `${I18N__BASE}.contextItems.addFeatureLayer`, 
                fn: this.#onContextMenuAddFeatureLayer.bind(this)
            });
        }
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

        // Note:
        // Need to clean unused map- and feature layers
        // These can be layers that the user have created and that (at this point) is not persisted when app is reloaded
        this.removeUnusedLayers();
    }

    #onWindowBrowserStateCleared() {
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

    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.layerTool)) {
            this.onClickTool(event);
        }
    }

    #onWindowMapLayerAdded(event) {
        this.doMapLayerAdded(event);
    }

    #onWindowMapLayerRemoved(event) {
        this.doMapLayerRemoved(event);
    }

    #onWindowFeatureLayerAdded(event) {
        this.doFeatureLayerAdded(event);
    }

    #onWindowFeatureLayerRemoved(event) {
        this.doFeatureLayerRemoved(event);
    }

    //--------------------------------------------------------------------
    // # Section: LocalStorage Helpers
    //--------------------------------------------------------------------
    removeUnusedLayers() {
        // Note:
        // MapLayers
        const mapLayersToRemove = [];
        this.localStorage.mapLayers.forEach((layer) => {
            if(!LayerManager.hasMapLayerWithId(layer.id)) {
                mapLayersToRemove.push(layer);
            }
        });

        mapLayersToRemove.forEach((layerToRemove) => {
            this.localStorage.mapLayers = this.localStorage.mapLayers.filter((layer) => {
                return layerToRemove.id !== layer.id;
            }); 
        });

        // Note:
        // FeatureLayers
        const featureLayersToRemove = [];
        this.localStorage.featureLayers.forEach((layer) => {
            if(!LayerManager.hasFeatureLayerWithId(layer.id)) {
                featureLayersToRemove.push(layer);
            }
        });

        featureLayersToRemove.forEach((layerToRemove) => {
            this.localStorage.featureLayers = this.localStorage.featureLayers.filter((layer) => {
                return layerToRemove.id !== layer.id;
            }); 
        });

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        
        LogManager.logDebug(FILENAME, 'removeUnusedLayers', {
            info: 'Removing unused layers',
            mapLayers: mapLayersToRemove,
            featureLayers: featureLayersToRemove
        });
    }

    getLocalStorageFeatureLayerById(id) {
        const layer = this.localStorage.featureLayers.find((item) => {
            return item.id === id;
        });

        return layer;
    }

    hasLocalStorageFeatureLayerById(id) {
        return !!this.getLocalStorageFeatureLayerById(id);
    }

    getLocalStorageMapLayerById(id) {
        const layer = this.localStorage.mapLayers.find((item) => {
            return item.id === id;
        });

        return layer;
    }

    hasLocalStorageMapLayerById(id) {
        return !!this.getLocalStorageMapLayerById(id);
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    #onContextMenuAddMapLayerModal() {
        this.doShowAddMapLayerModal();
    }

    #onContextMenuAddFeatureLayer() {
        this.doAddFeatureLayer({
            name: '',
            isDynamicallyAdded: true
        });

        // Note: 
        // Alert the user, the Layer was created when the tool was not active
        if(!this.isActive) {
            Toast.success({
                i18nKey: `${I18N__BASE}.toasts.infos.addFeatureLayer`,
                autoremove: true
            });
        }
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

            // Update data-attribute, this is used by Sortable.js to do the sorting
            li.setAttribute('data-oltb-sort-index', reversedIndex);

            // Update state that is stored in localStorage
            // This will keep track of the sort after a reload
            const id = li.getAttribute('data-oltb-id');

            // Note: 
            // Only meta data about a layer is stored in LocalStorage
            // This is not true for the BookmarkTool that has slightly different logic
            const layerMetaItem = options.getLocalStorageItemById(id);
            if(layerMetaItem) {
                layerMetaItem.sortIndex = reversedIndex;
            }

            // Note: 
            // The actual layer must also be updated
            const layerItem = options.getLayerItemById(id);
            if(layerItem) {
                layerItem.sortIndex = reversedIndex;
            }

            // Update each layer with the new ZIndex
            options.setZIndex(id, reversedIndex);

            // Update callback data
            list.push({
                id: id,
                index: reversedIndex
            });
        });

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        
        LogManager.logDebug(FILENAME, 'onEndSortable', {
            currentItem: currentItem,
            list: list
        });

        // Note: 
        // @Consumer callback
        if(options.callback) {
            options.callback(currentItem, list);
        }
    }

    #sortSortableDesc(sortable, animate = false) {
        const order = sortable.toArray().sort().reverse();
        sortable.sort(order, animate);
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    isValidEnter(event) {
        return event.type === Events.browser.keyUp && event.key === KeyboardKeys.valueEnter;
    }

    hasLayerFeatures(layer) {
        return (
            layer.getSource().getFeatures instanceof Function &&
            layer.getSource().getFeatures().length > 0
        );
    }

    hasProjection(projection) {
        const hasProjection = ProjectionManager.hasProjection(projection);

        if(!hasProjection) {
            LogManager.logError(FILENAME, 'hasProjection', {
                message: 'Missing projection definition',
                projection: projection
            });

            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.missingProjection`
            });
        }

        return hasProjection;
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }

    #onAddFeatureLayerByKey(event) {
        if(!this.isValidEnter(event)) {
            return;
        }

        this.#onAddFeatureLayerByClick(event);
    }

    #onAddFeatureLayerByClick(event) {
        const name = this.uiRefAddFeatureLayerText.value;
        this.uiRefAddFeatureLayerText.value = '';

        this.doAddFeatureLayer({
            name: name,
            isDynamicallyAdded: true
        });
    }

    #onCreateMapLayer(result) {
        if(!this.hasProjection(result.projection)) {
            return;
        }

        try {
            this.doAddMapLayer(result);
        }catch(error) {
            LogManager.logError(FILENAME, 'onCreateMapLayer', {
                message: 'Failed to create new layer',
                error: error
            });

            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.addFeatureLayer`
            });
        }
    }

    #onMapLayerPropertyChange(id, layerElement, checkbox, event) {
        // Note:
        // Only run for visibility changes
        const property = event.key;
        if(property !== 'visible') {
            return;
        }

        layerElement.classList.toggle(`${CLASS__TOOLBOX_LIST}__item--hidden`);

        const isVisible = !layerElement.classList.contains(`${CLASS__TOOLBOX_LIST}__item--hidden`);
        const storedLayerState = this.getLocalStorageMapLayerById(id);

        checkbox.checked = isVisible;

        // Note: 
        // storedLayerState is a reference to a object inside this.localStorage
        if(storedLayerState) {
            storedLayerState.isVisible = isVisible;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }
    }

    #onFeatureLayerPropertyChange(id, layerElement, checkbox, event) {
        // Note:
        // Only run for visibility changes
        const property = event.key;
        if(property !== 'visible') {
            return;
        }

        layerElement.classList.toggle(`${CLASS__TOOLBOX_LIST}__item--hidden`);

        const isVisible = !layerElement.classList.contains(`${CLASS__TOOLBOX_LIST}__item--hidden`);
        const storedLayerState = this.getLocalStorageFeatureLayerById(id);

        checkbox.checked = isVisible;

        // Note: 
        // storedLayerState is a reference to a object inside this.localStorage
        if(storedLayerState) {
            storedLayerState.isVisible = isVisible;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }
    }

    #onLayerDelete(layerWrapper, callback) {
        this.askToDeleteLayer(layerWrapper, callback);
    }

    #onLayerVisibilityChange(layerWrapper, callback, layerName) {
        this.doChangeLayerVisibility(layerWrapper, callback);
    }

    #onLayerEdit(layerWrapper, callback, layerName) {
        this.askToRenameLayer(layerWrapper, callback, layerName);
    }

    #onLayerDownload(layerWrapper, callback) {
        this.askToDownloadLayer(layerWrapper, callback);
    }

    #onShowAddMapLayerModal() {
        this.doShowAddMapLayerModal();
    }

    //--------------------------------------------------------------------
    // # Section: Listeners Subscriptions
    //--------------------------------------------------------------------
    attachUIButtonCallbacks(options, layerWrapper, rightWrapper, layerName) {
        for(const name in options) {
            const functionObject = options[name];
            const button = functionObject.function.call(this, layerWrapper, functionObject.callback, layerName);

            DOM.appendChildren(rightWrapper, [
                button
            ]);
        }
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createUILayerNameTippy(layerName) {
        return tippy(layerName, {
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

    #createUIMapLayerItem(layerWrapper, options) {
        const layer = layerWrapper.getLayer();

        // Note: 
        // The state of the layer is a combination of data stored from localStorage and 
        // data if it is the first time the layer is added
        const layerId = layerWrapper.getId();
        const defaultSortIndex = this.uiRefMapLayerStack.childNodes.length;
        const defaultVisibility = layer.getVisible();
        
        const layerState = {
            id: layerId,
            sortIndex: defaultSortIndex,
            isVisible: defaultVisibility
        };

        // Note: 
        // Check if the state needs to be updated or stored for the first time
        const storedLayerState = this.getLocalStorageMapLayerById(layerId);
        if(storedLayerState) {
            layerState.sortIndex = storedLayerState.sortIndex;
            layerState.isVisible = storedLayerState.isVisible;
            
            layerWrapper.sortIndex = layerState.sortIndex;
            layer.setVisible(layerState.isVisible);
        }else {
            this.localStorage.mapLayers.push({
                id: layerId,
                sortIndex: layerState.sortIndex,
                isVisible: layerState.isVisible
            });
        }

        LayerManager.setMapLayerZIndex(layerId, layerState.sortIndex);

        const layerElement = DOM.createElement({
            element: 'li', 
            id: `${ID__PREFIX}-map-${layerId}`,
            class: (`
                ${CLASS__TOOLBOX_LIST}__item
                ${!layerState.isVisible 
                    ? `${CLASS__TOOLBOX_LIST}__item--hidden` 
                    : ''
                }
            `),
            attributes: {
                'data-oltb-id': layerId,
                'data-oltb-sort-index': layerState.sortIndex
            }
        });

        const layerName = DOM.createElement({
            element: 'span', 
            text: layerWrapper.getName().ellipsis(20),
            class: `${CLASS__TOOLBOX_LIST}__title`,
            title: layerWrapper.getName(),
            prototypes: {
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        // Note: 
        // This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        this.#createUILayerNameTippy(layerName);

        const leftWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__wrapper`
        });

        const [ checkboxWrapper, checkbox ] = createUICheckbox({
            checked: layerState.isVisible,
            listeners: {
                'click': this.#onLayerVisibilityChange.bind(
                    this, 
                    layerWrapper, 
                    this.options.onMapLayerVisibilityChanged, 
                    layerName
                )
            }
        });

        layer.on(Events.openLayers.propertyChange, this.#onMapLayerPropertyChange.bind(this, layerId, layerElement, checkbox));

        const layerDot = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__dot`
        });

        DOM.appendChildren(leftWrapper, [
            layerDot,
            checkboxWrapper
        ]);

        DOM.appendChildren(leftWrapper, [
            layerName
        ]);

        DOM.appendChildren(layerElement, [
            leftWrapper
        ]);

        const rightWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__wrapper`
        });

        this.attachUIButtonCallbacks(options, layerWrapper, rightWrapper, layerName);
        
        const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
        const layerHandle = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__handle oltb-tippy`,
            title: i18n.dragToSort
        });

        DOM.appendChildren(rightWrapper, [
            layerHandle
        ]);

        DOM.appendChildren(layerElement, [
            rightWrapper
        ]);

        this.uiRefMapLayerStack.append(layerElement);
        this.#sortSortableDesc(this.sortableMapLayerStack);
    }

    #createUIFeatureLayerItem(layerWrapper, options) {
        const layer = layerWrapper.getLayer();

        // Note: 
        // The state of the layer is a combination of data stored from localStorage and 
        // data if it is the first time the layer is added
        const layerId = layerWrapper.getId();
        const defaultSortIndex = this.uiRefFeatureLayerStack.childNodes.length;
        const defaultVisibility = layer.getVisible();

        const layerState = {
            id: layerId,
            sortIndex: defaultSortIndex,
            isVisible: defaultVisibility
        };

        // Check if the state needs to be updated or stored for the first time
        const storedLayerState = this.getLocalStorageFeatureLayerById(layerId);
        if(storedLayerState) {
            layerState.sortIndex = storedLayerState.sortIndex;
            layerState.isVisible = storedLayerState.isVisible;

            layerWrapper.sortIndex = layerState.sortIndex;
            layer.setVisible(layerState.isVisible);
        }else {
            this.localStorage.featureLayers.push({
                id: layerId,
                sortIndex: layerState.sortIndex,
                isVisible: layerState.isVisible
            });
        }

        LayerManager.setFeatureLayerZIndex(layerId, layerState.sortIndex);

        const layerElement = DOM.createElement({
            element: 'li', 
            id: `${ID__PREFIX}-feature-${layerId}`,
            class: (`
                ${CLASS__TOOLBOX_LIST}__item 
                ${CLASS__TOOLBOX_LIST}__item--active
                ${!layerState.isVisible 
                    ? `${CLASS__TOOLBOX_LIST}__item--hidden` 
                    : ''
                }
            `),
            attributes: {
                'data-oltb-id': layerId,
                'data-oltb-sort-index': layerState.sortIndex
            }
        });

        const layerName = DOM.createElement({
            element: 'span', 
            text: layerWrapper.getName().ellipsis(20),
            class: `${CLASS__TOOLBOX_LIST}__title`,
            title: layerWrapper.getName(),
            prototypes: {
                getTippy: function() {
                    return this._tippy;
                }
            },
            listeners: {
                'click': this.doSetFeatureLayerAsActive.bind(this, layerWrapper, layerElement)
            }
        });

        // Note: 
        // This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        this.#createUILayerNameTippy(layerName);

        const leftWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__wrapper`
        });

        const [ checkboxWrapper, checkbox ] = createUICheckbox({
            checked: layerState.isVisible,
            listeners: {
                'click': this.#onLayerVisibilityChange.bind(
                    this, 
                    layerWrapper, 
                    this.options.onFeatureLayerVisibilityChanged, 
                    layerName
                )
            }
        });

        layer.on(Events.openLayers.propertyChange, this.#onFeatureLayerPropertyChange.bind(this, layerId, layerElement, checkbox));

        const layerDot = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__dot`,
            listeners: {
                'click': this.doSetFeatureLayerAsActive.bind(this, layerWrapper, layerElement)
            }
        });

        DOM.appendChildren(leftWrapper, [
            layerDot,
            checkboxWrapper
        ]);

        DOM.appendChildren(leftWrapper, [
            layerName
        ]);

        DOM.appendChildren(layerElement, [
            leftWrapper
        ]);

        const rightWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__wrapper`
        });

        this.attachUIButtonCallbacks(options, layerWrapper, rightWrapper, layerName);
        
        const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
        const layerHandle = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOOLBOX_LIST}__handle oltb-tippy`,
            title: i18n.dragToSort,
            attributes: {
                'data-oltb-i18n': `${I18N__BASE_COMMON}.titles.dragToSort`
            }
        });

        DOM.appendChildren(rightWrapper, [
            layerHandle
        ]);

        DOM.appendChildren(layerElement, [
            rightWrapper
        ]);

        this.uiRefFeatureLayerStack.append(layerElement);
        this.#sortSortableDesc(this.sortableFeatureLayerStack);
    }

    #createUIDeleteButton(layerWrapper, callback) {
        const i18nKey = `${I18N__BASE_COMMON}.titles.delete`;
        const deleteButton = DOM.createElement({
            element: 'button',
            class: `${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--delete oltb-tippy`,
            title: TranslationManager.get(i18nKey),
            attributes: {
                'type': 'button',
                'data-oltb-i18n': i18nKey
            },
            listeners: {
                'click': this.#onLayerDelete.bind(this, layerWrapper, callback)
            }
        });

        return deleteButton;
    }

    #createUIDownloadButton(layerWrapper, callback) {
        const i18nKey = `${I18N__BASE_COMMON}.titles.download`;
        const downloadButton = DOM.createElement({
            element: 'button', 
            class: `${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--download oltb-tippy`,
            title: TranslationManager.get(i18nKey),
            attributes: {
                'type': 'button',
                'data-oltb-i18n': i18nKey
            },
            listeners: {
                'click': this.#onLayerDownload.bind(this, layerWrapper, callback)
            }
        });

        return downloadButton;
    }

    #createUIEditButton(layerWrapper, callback, layerName) {
        const i18nKey = `${I18N__BASE_COMMON}.titles.rename`;
        const editButton = DOM.createElement({
            element: 'button',
            class: `${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--edit oltb-tippy`,
            title: TranslationManager.get(i18nKey),
            attributes: {
                'type': 'button',
                'data-oltb-i18n': i18nKey
            },
            listeners: {
                'click': this.#onLayerEdit.bind(this, layerWrapper, callback, layerName)
            }
        });

        return editButton;
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToDownloadLayer(layerWrapper, callback) {
        return new DownloadLayerModal({
            onDownload: (result) => {   
                const format = instantiateFormat(result.format);
            
                if(!format) {
                    LogManager.logError(FILENAME, 'onLayerDownload', {
                        title: 'Error',
                        message: `The layer format is not supported (${format})`
                    });
                    
                    Toast.error({
                        i18nKey: `${I18N__BASE}.toasts.errors.unsupportedFormat`
                    });

                    return;
                }

                LogManager.logDebug(FILENAME, 'onLayerDownload', {
                    layerName: layerWrapper.getName(),
                    formatName: result.format,
                    format: format
                });
                    
                this.doDownloadLayer(layerWrapper, format, result, callback);
            }
        });
    }

    askToRenameLayer(layerWrapper, callback, layerName) {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.prompts.renameLayer`);

        return Dialog.prompt({
            title: i18n.title,
            message: `${i18n.message} <strong>${layerWrapper.getName()}</strong>`,
            value: layerWrapper.getName(),
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                if(result !== null && !!result.length) {
                    // Update model
                    layerWrapper.setName(result);
                    
                    // Update UI-item
                    layerName.innerText = result.ellipsis(20);
                    layerName.getTippy().setContent(result);
                    
                    // Note: 
                    // @Consumer callback
                    if(callback) {
                        callback(layerWrapper);
                    }
                }
            }
        });
    }

    askToDeleteLayer(layerWrapper, callback) {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.deleteLayer`);

        return Dialog.confirm({
            title: i18n.title,
            message: `${i18n.message} <strong>${layerWrapper.getName()}</strong>?`,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                callback(layerWrapper);
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
            this.localStorage[targetName] = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    doMapLayerAdded(event) {
        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;

        const disableEditButton = (
            event.detail.disableMapLayerEditButton ||
            this.options.disableMapLayerEditButton ||
            false
        );

        const disableDeleteButton = (
            event.detail.disableMapLayerDeleteButton ||
            this.options.disableMapLayerDeleteButton ||
            false
        );

        this.#createUIMapLayerItem(layerWrapper, {
            ...(!disableEditButton && { editButton: {
                function: this.#createUIEditButton.bind(this),
                callback: this.options.onMapLayerRenamed.bind(this)
            }}),
            ...(!disableDeleteButton && { deleteButton: {
                function: this.#createUIDeleteButton.bind(this),
                callback: LayerManager.removeMapLayer.bind(LayerManager)
            }})
        });

        // Note: 
        // @Consumer callback
        if(!isSilent && this.options.onMapLayerAdded) {
            this.options.onMapLayerAdded(layerWrapper);
        }
    }

    doRemoveUILayerItem(uiRefStack, selector) {
        const uiRefLayer = uiRefStack.querySelector(selector);
        if(uiRefLayer) {
            DOM.removeElement(uiRefLayer);
        }
    }

    doMapLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;
        const layerId = layerWrapper.getId();

        this.doRemoveUILayerItem(this.uiRefMapLayerStack, `#${ID__PREFIX}-map-${layerId}`);

        // Note: 
        // @Consumer callback
        if(!isSilent && this.options.onMapLayerRemoved) {
            this.options.onMapLayerRemoved(layerWrapper);
        }
    }

    doFeatureLayerAdded(event) {
        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;

        const disableEditButton = (
            event.detail.disableFeatureLayerEditButton ||
            this.options.disableFeatureLayerEditButton ||
            false
        );

        const disableDownloadButton = (
            event.detail.disableFeatureLayerDownloadButton ||
            this.options.disableFeatureLayerDownloadButton ||
            false
        );

        const disableDeleteButton = (
            event.detail.disableFeatureLayerDeleteButton ||
            this.options.disableFeatureLayerDeleteButton ||
            false
        );

        this.doRemoveActiveFeatureLayerClass();
        this.#createUIFeatureLayerItem(layerWrapper, {
            ...(!disableEditButton && { editButton: {
                function: this.#createUIEditButton.bind(this),
                callback: this.options.onFeatureLayerRenamed
            }}),
            ...(!disableDownloadButton && { downloadButton: {
                function: this.#createUIDownloadButton.bind(this),
                callback: this.options.onFeatureLayerDownloaded
            }}),
            ...(!disableDeleteButton && { deleteButton: {
                function: this.#createUIDeleteButton.bind(this),
                callback: LayerManager.removeFeatureLayer.bind(LayerManager)
            }})
        });

        // Note: 
        // @Consumer callback
        if(!isSilent && this.options.onFeatureLayerAdded) {
            this.options.onFeatureLayerAdded(layerWrapper);
        }
    }

    doSetActiveLayerAsSelected(uiRefStack) {
        const activeFeatureLayer = LayerManager.getActiveFeatureLayer();
        if(activeFeatureLayer) {
            uiRefStack.querySelectorAll('li').forEach((item) => {
                if(activeFeatureLayer.getId() === item.getAttribute('data-oltb-id')) {
                    item.classList.add(`${CLASS__TOOLBOX_LIST}__item--active`);
                }
            });
        }
    }

    doFeatureLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;
        const layerId = layerWrapper.getId();

        this.doRemoveUILayerItem(this.uiRefFeatureLayerStack, `#${ID__PREFIX}-feature-${layerId}`);
        this.doRemoveActiveFeatureLayerClass();
        this.doSetActiveLayerAsSelected(this.uiRefFeatureLayerStack);

        // Note: 
        // @Consumer callback
        if(!isSilent && this.options.onFeatureLayerRemoved) {
            this.options.onFeatureLayerRemoved(layerWrapper);
        }
    }

    doSetFeatureLayerAsActive(layerWrapper, layerElement) {
        this.doRemoveActiveFeatureLayerClass();

        LayerManager.setActiveFeatureLayer(layerWrapper);
        layerElement.classList.add(`${CLASS__TOOLBOX_LIST}__item--active`);
    }

    doRemoveActiveFeatureLayerClass() {
        // Note: 
        // Should just be one li-item that has the active class
        // Just in case, clean all items
        this.uiRefFeatureLayerStack.querySelectorAll('li').forEach((item) => {
            item.classList.remove(`${CLASS__TOOLBOX_LIST}__item--active`);
        });
    }

    doToggleLayerVisibility(layerWrapper) {
        const layer = layerWrapper.getLayer();
        const flippedVisibility = !layer.getVisible();
        layer.setVisible(flippedVisibility);

        return flippedVisibility;
    }

    doSetLayerFeaturesVisibility(layerWrapper, map, visibility = false) {
        const layer = layerWrapper.getLayer();
        if(!this.hasLayerFeatures(layer)) {
            return;
        }

        layer.getSource().getFeatures().forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                FeatureManager.getTooltip(feature).setMap(visibility ? map : null)
            }
        });
    }

    doChangeLayerVisibility(layerWrapper, callback) {
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        InfoWindowManager.hideOverlay();
        
        const visibility = this.doToggleLayerVisibility(layerWrapper);
        this.doSetLayerFeaturesVisibility(layerWrapper, map, visibility);

        // Note: 
        // @Consumer callback
        if(callback) {
            callback(layerWrapper);
        }
    }

    doDownloadLayer(layerWrapper, format, result, callback) {
        const features = layerWrapper.getLayer().getSource().getFeatures();
        const content = format.writeFeatures(features, {
            featureProjection: ConfigManager.getConfig().projection.default
        });
        
        const filename = `${layerWrapper.getName()}.${result.format.toLowerCase()}`;
        downloadFile(filename, content);

        // Note: 
        // @Consumer callback
        if(callback) {
            callback(layerWrapper, filename, content);
        }
    }

    doAddMapLayer(options) {
        const layer = instantiateLayer(options.layer, {
            projection: options.projection || ConfigManager.getConfig().projection.default,
            source: instantiateSource(options.source, {
                url: options.url,
                params: JSON.parse(options.parameters),
                wrapX: options.wrapX,
                attributions: options.attributions,
                ...(options.crossOrigin !== 'undefined' && {
                    crossOrigin: options.crossOrigin
                }),
                format: instantiateFormat(options.source)
            })
        });

        return LayerManager.addMapLayer({
            name: options.name,
            sortIndex: 0,
            isDynamicallyAdded: options.isDynamicallyAdded,
            layer: layer
        });
    }

    doAddFeatureLayer(options) {
        return LayerManager.addFeatureLayer({
            name: options.name,
            sortIndex: 0,
            isDynamicallyAdded: options.isDynamicallyAdded
        });
    }

    doShowAddMapLayerModal() {
        if(this.layerModal) {
            return;
        }

        const name = this.uiRefAddMapLayerText.value;
        this.layerModal = new LayerModal({
            name: name,
            onCreate: (result) => {
                this.#onCreateMapLayer(result);
            },
            onClose: () => {
                this.layerModal = undefined;
            }
        });
    }
}

export { LayerTool };
import _ from 'lodash';
import tippy from 'tippy.js';
import Sortable from 'sortablejs';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { download } from '../helpers/browser/Download';
import { LogManager } from '../managers/LogManager';
import { LayerModal } from './modal-extensions/LayerModal';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../managers/StateManager';
import { LayerManager } from '../managers/LayerManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { instantiateLayer } from '../ol-types/LayerType';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { instantiateSource } from '../ol-types/SourceType';
import { instantiateFormat } from '../ol-types/FormatType';
import { InfoWindowManager } from '../managers/InfoWindowManager';
import { ProjectionManager } from '../managers/ProjectionManager';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { TranslationManager } from '../managers/TranslationManager';
import { DownloadLayerModal } from './modal-extensions/DownloadLayerModal';
import { hasCustomFeatureProperty } from '../helpers/browser/HasNestedProperty';

const FILENAME = 'tools/LayerTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOOLBOX_LIST = 'oltb-toolbox-list';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-layer';
const SORTABLE_MAP_LAYERS = 'sortableMapLayers';
const SORTABLE_FEATURE_LAYERS = 'sortableFeatureLayers';
const INDEX_OFFSET = 1;
const I18N_BASE = 'tools.layerTool';
const I18N_BASE_COMMON = 'common';

const DefaultOptions = Object.freeze({
    disableMapCreateLayerButton: false,
    disableMapLayerVisibilityButton: false,
    disableMapLayerEditButton: false,
    disableMapLayerDeleteButton: false,
    disableFeatureCreateLayerButton: false,
    disableFeatureLayerVisibilityButton: false,
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
class LayerTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        this.icon = getIcon({
            path: SvgPaths.layers.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.layerTool})`
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

        this.initToolboxHTML();
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();

        this.uiRefMapLayerStack = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-map-stack`);
        this.uiRefAddMapLayerButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-map-stack-add-button`);

        this.sortableMapLayerStack = this.generateSortable(this.uiRefMapLayerStack, {
            group: SORTABLE_MAP_LAYERS,
            callback: this.options.onMapLayerDragged,
            setZIndex: LayerManager.setMapLayerZIndex.bind(LayerManager),
            getLayerItemById: LayerManager.getMapLayerById.bind(LayerManager),
            getLocalStorageItemById: this.getLocalStorageMapLayerById.bind(this),
            stack: this.localStorage.mapLayers
        });

        this.uiRefFeatureLayerStack = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-feature-stack`);
        this.uiRefAddFeatureLayerButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-feature-stack-add-button`);
        this.uiRefAddFeatureLayerText = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-feature-stack-add-text`);

        this.sortableFeatureLayerStack = this.generateSortable(this.uiRefFeatureLayerStack, {
            group: SORTABLE_FEATURE_LAYERS,
            callback: this.options.onFeatureLayerDragged,
            setZIndex: LayerManager.setFeatureLayerZIndex.bind(LayerManager),
            getLayerItemById: LayerManager.getFeatureLayerById.bind(LayerManager),
            getLocalStorageItemById: this.getLocalStorageFeatureLayerById.bind(this),
            stack: this.localStorage.featureLayers
        });

        // Note: The three refs below might be null due to the user
        // disabled them in the constructor options
        if(this.uiRefAddMapLayerButton) {
            this.uiRefAddMapLayerButton.addEventListener(Events.browser.click, this.doShowAddMapLayerModal.bind(this));
        }

        if(this.uiRefAddFeatureLayerButton) {
            this.uiRefAddFeatureLayerButton.addEventListener(Events.browser.click, this.onAddFeatureLayerByClick.bind(this));
        }

        if(this.uiRefAddFeatureLayerText) {
            this.uiRefAddFeatureLayerText.addEventListener(Events.browser.keyUp, this.onAddFeatureLayerByKey.bind(this));
        }

        this.initContextMenuItems();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));
        window.addEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(Events.custom.featureLayerAdded, this.onWindowFeatureLayerAdded.bind(this));
        window.addEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
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
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-map-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.mapLayers">${i18n.titles.mapLayers}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-map-toolbox-collapsed" style="display: ${this.localStorage[`${ID_PREFIX}-map-toolbox-collapsed`] ? 'none' : 'block'}">
                    ${!this.options.disableMapCreateLayerButton ? 
                        `
                            <div class="${CLASS_TOOLBOX_SECTION}__group">
                                <button type="button" id="${ID_PREFIX}-map-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-w-100" data-oltb-i18n="${I18N_BASE}.toolbox.groups.createMapLayer.create">${i18n.groups.createMapLayer.create}</button>
                            </div>
                        ` : ''
                    }
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${this.options.disableMapCreateLayerButton ? `${CLASS_TOOLBOX_SECTION}__group--topmost` : ''}">
                        <ul id="${ID_PREFIX}-map-stack" class="${CLASS_TOOLBOX_LIST}"></ul>
                    </div>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-feature-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.featureLayers">${i18n.titles.featureLayers}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-feature-toolbox-collapsed" style="display: ${this.localStorage[`${ID_PREFIX}-feature-toolbox-collapsed`] ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        ${!this.options.disableFeatureCreateLayerButton ? 
                            `
                                <div class="oltb-input-button-group">
                                    <input type="text" id="${ID_PREFIX}-feature-stack-add-text" class="oltb-input" data-oltb-i18n="${I18N_BASE}.toolbox.groups.createFeatureLayer.placeholder" placeholder="${i18n.groups.createFeatureLayer.placeholder}">
                                    <button type="button" id="${ID_PREFIX}-feature-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N_BASE}.toolbox.groups.createFeatureLayer.create" title="${i18n.groups.createFeatureLayer.create}">
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
                            ` : ''
                        }
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${this.options.disableFeatureCreateLayerButton ? `${CLASS_TOOLBOX_SECTION}__group--topmost` : ''}">
                        <ul id="${ID_PREFIX}-feature-stack" class="${CLASS_TOOLBOX_LIST} ${CLASS_TOOLBOX_LIST}--selectable"></ul>
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

    initContextMenuItems() {
        if(!this.options.disableMapCreateLayerButton || !this.options.disableFeatureCreateLayerButton) {
            ContextMenu.addItem({});
        }

        if(!this.options.disableMapCreateLayerButton) {
            ContextMenu.addItem({
                icon: this.icon, 
                i18nKey: `${I18N_BASE}.contextItems.addMapLayer`, 
                fn: this.onContextMenuAddMapLayerModal.bind(this)
            });
        }

        if(!this.options.disableFeatureCreateLayerButton) {
            ContextMenu.addItem({
                icon: this.icon, 
                i18nKey: `${I18N_BASE}.contextItems.addFeatureLayer`, 
                fn: this.onContextMenuAddFeatureLayer.bind(this)
            });
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        if(this.isActive) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }

        // Note: Consumer callback
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

    deActivateTool() {
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

    onWindowBrowserStateCleared() {
        this.doClearState();

        if(this.isActive) {
            this.deActivateTool();
        }

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.layerTool)) {
            this.onClickTool(event);
        }
    }

    onWindowMapLayerAdded(event) {
        this.doMapLayerAdded(event);
    }

    onWindowMapLayerRemoved(event) {
        this.doMapLayerRemoved(event);
    }

    onWindowFeatureLayerAdded(event) {
        this.doFeatureLayerAdded(event);
    }

    onWindowFeatureLayerRemoved(event) {
        this.doFeatureLayerRemoved(event);
    }

    // -------------------------------------------------------------------
    // # Section: LocalStorage Helpers
    // -------------------------------------------------------------------

    getLocalStorageFeatureLayerById(id) {
        const layer = this.localStorage.featureLayers.find((item) => {
            return item.id === id;
        });

        return layer;
    }

    hasLocalStorageFeatureLayerById(id) {
        const layer = this.getLocalStorageFeatureLayerById(id);

        if(layer) {
            return true;
        }

        return false;
    }

    getLocalStorageMapLayerById(id) {
        const layer = this.localStorage.mapLayers.find((item) => {
            return item.id === id;
        });

        return layer;
    }

    hasLocalStorageMapLayerById(id) {
        const layer = this.getLocalStorageMapLayerById(id);

        if(layer) {
            return true;
        }

        return false;
    }

    // -------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    // -------------------------------------------------------------------

    onContextMenuAddMapLayerModal() {
        this.doShowAddMapLayerModal();
    }

    onContextMenuAddFeatureLayer() {
        this.doAddFeatureLayer({
            name: '',
            isDynamicallyAdded: true
        });

        // Note: Alert the user, the Layer was created when the tool was not active
        if(!this.isActive) {
            Toast.success({
                i18nKey: `${I18N_BASE}.toasts.newLayer`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }
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
        // User callback data
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

            // Update data-attribute, this is used by Sortable.js to do the sorting
            li.setAttribute('data-oltb-sort-index', reversedIndex);

            // Update state that is stored in localStorage
            // This will keep track of the sort after a reload
            const id = li.getAttribute('data-oltb-id');

            // Note: Only meta data about a layer is stored in LocalStorage
            // This is not true for the BookmarkTool that has slightly different logic
            const layerMetaItem = options.getLocalStorageItemById(id);
            if(layerMetaItem) {
                layerMetaItem.sortIndex = reversedIndex;
            }

            // Note: The actual layer must also be updated
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

        // Note: Consumer callback
        if(options.callback instanceof Function) {
            options.callback(currentItem, list);
        }
    }

    sortSortableDesc(sortable, animate = false) {
        const order = sortable.toArray().sort().reverse();
        sortable.sort(order, animate);
    }

    getSortableIndexFromLayerId(primary, secondary, id) {
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

    isValidEnter(event) {
        return event.type === Events.browser.keyUp && event.key === Keys.valueEnter;
    }

    hasLayerFeatures(layer) {
        return (
            layer.getSource().getFeatures instanceof Function &&
            layer.getSource().getFeatures().length > 0
        );
    }

    hasTooltip(feature) {
        return hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip);
    }

    hasProjection(projection) {
        const hasProjection = ProjectionManager.hasProjection(projection);

        if(!hasProjection) {
            LogManager.logError(FILENAME, 'hasProjection', {
                message: 'Missing projection definition',
                projection: projection
            });

            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.missingProjectionError`
            });
        }

        return hasProjection;
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        
        this.doToggleToolboxSection(targetName);
    }

    onAddFeatureLayerByKey(event) {
        if(!this.isValidEnter(event)) {
            return;
        }

        this.onAddFeatureLayerByClick(event);
    }

    onAddFeatureLayerByClick(event) {
        const name = this.uiRefAddFeatureLayerText.value;
        this.uiRefAddFeatureLayerText.value = '';

        this.doAddFeatureLayer({
            name: name,
            isDynamicallyAdded: true
        });
    }

    onCreateMapLayer(result) {
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
                i18nKey: `${I18N_BASE}.toasts.newLayerError`
            });
        }
    }

    onMapLayerPropertyChange(id, layerElement, event) {
        if(event.key === 'visible') {
            layerElement.classList.toggle(`${CLASS_TOOLBOX_LIST}__item--hidden`);
        }

        const isVisible = !layerElement.classList.contains(`${CLASS_TOOLBOX_LIST}__item--hidden`);
        const storedLayerState = this.getLocalStorageMapLayerById(id);

        // Note: storedLayerState is a reference to a object inside this.localStorage
        if(storedLayerState) {
            storedLayerState.isVisible = isVisible;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }
    }

    onFeatureLayerPropertyChange(id, layerElement, event) {
        if(event.key === 'visible') {
            layerElement.classList.toggle(`${CLASS_TOOLBOX_LIST}__item--hidden`);
        }

        const isVisible = !layerElement.classList.contains(`${CLASS_TOOLBOX_LIST}__item--hidden`);
        const storedLayerState = this.getLocalStorageFeatureLayerById(id);

        // Note: storedLayerState is a reference to a object inside this.localStorage
        if(storedLayerState) {
            storedLayerState.isVisible = isVisible;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Listeners Subscriptions
    // -------------------------------------------------------------------

    attachUIButtonCallbacks(options, layerWrapper, rightWrapper, layerName) {
        for(const name in options) {
            const functionObject = options[name];
            const button = functionObject.function.call(this, layerWrapper, functionObject.callback, layerName);

            DOM.appendChildren(rightWrapper, [
                button
            ]);
        }
    }

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    createUILayerNameTippy(layerName) {
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

    createUIMapLayerItem(layerWrapper, options) {
        const layer = layerWrapper.getLayer();

        // Note: The state of the layer is a combination of data stored from localStorage and 
        // data if it is the first time the layer is added
        const layerId = layerWrapper.getId();
        const defaultSortIndex = this.uiRefMapLayerStack.childNodes.length;
        const defaultVisibility = layer.getVisible();
        
        const layerState = {
            id: layerId,
            sortIndex: defaultSortIndex,
            isVisible: defaultVisibility
        };

        // Note: Check if the state needs to be updated or stored for the first time
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
            id: `${ID_PREFIX}-map-${layerId}`,
            class: (`
                ${CLASS_TOOLBOX_LIST}__item
                ${!layerState.isVisible 
                    ? `${CLASS_TOOLBOX_LIST}__item--hidden` 
                    : ''
                }
            `),
            attributes: {
                'data-oltb-id': layerId,
                'data-oltb-sort-index': layerState.sortIndex
            }
        });

        layer.on(Events.openLayers.propertyChange, this.onMapLayerPropertyChange.bind(this, layerId, layerElement));

        const layerName = DOM.createElement({
            element: 'span', 
            text: layerWrapper.getName().ellipsis(20),
            class: `${CLASS_TOOLBOX_LIST}__title`,
            title: layerWrapper.getName(),
            prototypes: {
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        // Note: This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        this.createUILayerNameTippy(layerName);

        const leftWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__wrapper`
        });

        DOM.appendChildren(leftWrapper, [
            layerName
        ]);

        DOM.appendChildren(layerElement, [
            leftWrapper
        ]);

        const rightWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__wrapper`
        });

        this.attachUIButtonCallbacks(options, layerWrapper, rightWrapper, layerName);
        
        const i18n = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);
        const layerHandle = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__handle oltb-tippy`,
            title: i18n.dragToSort
        });

        DOM.appendChildren(rightWrapper, [
            layerHandle
        ]);

        DOM.appendChildren(layerElement, [
            rightWrapper
        ]);

        this.uiRefMapLayerStack.append(layerElement);
        this.sortSortableDesc(this.sortableMapLayerStack);
    }

    createUIFeatureLayerItem(layerWrapper, options) {
        const layer = layerWrapper.getLayer();

        // Note: The state of the layer is a combination of data stored from localStorage and 
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
            id: `${ID_PREFIX}-feature-${layerId}`,
            class: (`
                ${CLASS_TOOLBOX_LIST}__item 
                ${CLASS_TOOLBOX_LIST}__item--active
                ${!layerState.isVisible 
                    ? `${CLASS_TOOLBOX_LIST}__item--hidden` 
                    : ''
                }
            `),
            attributes: {
                'data-oltb-id': layerId,
                'data-oltb-sort-index': layerState.sortIndex
            }
        });

        layer.on(Events.openLayers.propertyChange, this.onFeatureLayerPropertyChange.bind(this, layerId, layerElement));

        const layerName = DOM.createElement({
            element: 'span', 
            text: layerWrapper.getName().ellipsis(20),
            class: `${CLASS_TOOLBOX_LIST}__title`,
            title: layerWrapper.getName(),
            prototypes: {
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        // Note: This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        this.createUILayerNameTippy(layerName);

        // Attach eventlistener for setting the active layer
        layerName.addEventListener(Events.browser.click, (event) => {
            this.doRemoveActiveFeatureLayerClass();
                    
            // Set the target layer as the active layer
            LayerManager.setActiveFeatureLayer(layerWrapper);
            layerElement.classList.add(`${CLASS_TOOLBOX_LIST}__item--active`);
        });

        const leftWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__wrapper`
        });

        const layerActiveStrip = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__strip`
        });

        DOM.appendChildren(leftWrapper, [
            layerActiveStrip
        ]);

        DOM.appendChildren(leftWrapper, [
            layerName
        ]);

        DOM.appendChildren(layerElement, [
            leftWrapper
        ]);

        const rightWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__wrapper`
        });

        this.attachUIButtonCallbacks(options, layerWrapper, rightWrapper, layerName);
        
        const i18n = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);
        const layerHandle = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOOLBOX_LIST}__handle oltb-tippy`,
            title: i18n.dragToSort
        });

        DOM.appendChildren(rightWrapper, [
            layerHandle
        ]);

        DOM.appendChildren(layerElement, [
            rightWrapper
        ]);

        this.uiRefFeatureLayerStack.append(layerElement);
        this.sortSortableDesc(this.sortableFeatureLayerStack);
    }

    createUIDeleteButton(layerWrapper, callback) {
        const deleteButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy`,
            title: TranslationManager.get(`${I18N_BASE_COMMON}.functionButtons.delete`),
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.onLayerDelete.bind(this, layerWrapper, callback)
            }
        });

        return deleteButton;
    }

    createUIDownloadButton(layerWrapper, callback) {
        const downloadButton = DOM.createElement({
            element: 'button', 
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--download oltb-tippy`,
            title: TranslationManager.get(`${I18N_BASE_COMMON}.functionButtons.download`),
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.onLayerDownload.bind(this, layerWrapper, callback)
            }
        });

        return downloadButton;
    }

    createUIEditButton(layerWrapper, callback, layerName) {
        const editButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy`,
            title: TranslationManager.get(`${I18N_BASE_COMMON}.functionButtons.rename`),
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.onLayerEdit.bind(this, layerWrapper, callback, layerName)
            }
        });

        return editButton;
    }

    createUIVisibilityButton(layerWrapper, callback, layerName) {
        const visibilityButton = DOM.createElement({
            element: 'button',
            class: `${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--visibility oltb-tippy`,
            title: TranslationManager.get(`${I18N_BASE_COMMON}.functionButtons.toggleVisibility`),
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.onLayerVisibilityChange.bind(this, layerWrapper, callback, layerName)
            }
        });

        return visibilityButton;
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onLayerDelete(layerWrapper, callback) {
        this.askToDeleteLayer(layerWrapper, callback);
    }

    onLayerVisibilityChange(layerWrapper, callback, layerName) {
        this.doChangeLayerVisibility(layerWrapper, callback);
    }

    onLayerEdit(layerWrapper, callback, layerName) {
        this.askToRenameLayer(layerWrapper, callback, layerName);
    }

    onLayerDownload(layerWrapper, callback) {
        this.askToDownloadLayer(layerWrapper, callback);
    }

    // -------------------------------------------------------------------
    // # Section: Ask User
    // -------------------------------------------------------------------
    
    askToDownloadLayer(layerWrapper, callback) {
        new DownloadLayerModal({
            onDownload: (result) => {   
                const format = instantiateFormat(result.format);
            
                if(!format) {
                    LogManager.logError(FILENAME, 'onLayerDownload', {
                        title: 'Error',
                        message: `The layer format is not supported (${format})`
                    });
                    
                    Toast.error({
                        i18nKey: `${I18N_BASE}.toasts.unsupportedFormatError`
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
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.renameLayer`);

        Dialog.prompt({
            title: i18n.title,
            message: `${i18n.message} <strong>${layerWrapper.getName()}</strong>`,
            value: layerWrapper.getName(),
            confirmText: i18n.confirmText,
            onConfirm: (result) => {
                if(result !== null && !!result.length) {
                    // Update model
                    layerWrapper.setName(result);
                    
                    // Update UI-item
                    layerName.innerText = result.ellipsis(20);
                    layerName.getTippy().setContent(result);
                    
                    // Note: Consumer callback
                    if(callback instanceof Function) {
                        callback(layerWrapper);
                    }
                }
            }
        });
    }

    askToDeleteLayer(layerWrapper, callback) {
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.deleteLayer`);

        Dialog.confirm({
            title: i18n.title,
            message: `${i18n.message} <strong>${layerWrapper.getName()}</strong>?`,
            confirmText: i18n.confirmText,
            onConfirm: () => {
                callback(layerWrapper);
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doMapLayerAdded(event) {
        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;

        const disableVisibilityButton = (
            event.detail.disableMapLayerVisibilityButton ||
            this.options.disableMapLayerVisibilityButton ||
            false
        );

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

        this.createUIMapLayerItem(layerWrapper, {
            ...(!disableVisibilityButton && { visibilityButton: {
                function: this.createUIVisibilityButton.bind(this), 
                callback: this.options.onMapLayerVisibilityChanged.bind(this)
            }}),
            ...(!disableEditButton && { editButton: {
                function: this.createUIEditButton.bind(this),
                callback: this.options.onMapLayerRenamed.bind(this)
            }}),
            ...(!disableDeleteButton && { deleteButton: {
                function: this.createUIDeleteButton.bind(this),
                callback: LayerManager.removeMapLayer.bind(LayerManager)
            }})
        });

        // Note: Consumer callback
        if(!isSilent && this.options.onMapLayerAdded instanceof Function) {
            this.options.onMapLayerAdded(layerWrapper);
        }
    }

    doMapLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;
        const layerId = layerWrapper.getId();

        // Remove layer from UI
        const uiRefLayer = this.uiRefMapLayerStack.querySelector(`#${ID_PREFIX}-map-${layerId}`);
        if(uiRefLayer) {
            DOM.removeElement(uiRefLayer);
        }

        // Note: Consumer callback
        if(!isSilent && this.options.onMapLayerRemoved instanceof Function) {
            this.options.onMapLayerRemoved(layerWrapper);
        }
    }

    doFeatureLayerAdded(event) {
        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;

        const disableVisibilityButton = (
            event.detail.disableFeatureLayerVisibilityButton ||
            this.options.disableFeatureLayerVisibilityButton ||
            false
        );

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
        this.createUIFeatureLayerItem(layerWrapper, {
            ...(!disableVisibilityButton && { visibilityButton: {
                function: this.createUIVisibilityButton.bind(this), 
                callback: this.options.onFeatureLayerVisibilityChanged
            }}),
            ...(!disableEditButton && { editButton: {
                function: this.createUIEditButton.bind(this),
                callback: this.options.onFeatureLayerRenamed
            }}),
            ...(!disableDownloadButton && { downloadButton: {
                function: this.createUIDownloadButton.bind(this),
                callback: this.options.onFeatureLayerDownloaded
            }}),
            ...(!disableDeleteButton && { deleteButton: {
                function: this.createUIDeleteButton.bind(this),
                callback: LayerManager.removeFeatureLayer.bind(LayerManager)
            }})
        });

        // Note: Consumer callback
        if(!isSilent && this.options.onFeatureLayerAdded instanceof Function) {
            this.options.onFeatureLayerAdded(layerWrapper);
        }
    }

    doFeatureLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const isSilent = event.detail.isSilent;
        const layerWrapper = event.detail.layerWrapper;

        // Remove layer from UI
        const uiRefLayer = this.uiRefFeatureLayerStack.querySelector(`#${ID_PREFIX}-feature-${layerWrapper.getId()}`);
        if(uiRefLayer) {
            DOM.removeElement(uiRefLayer);
        }

        // Set new active feature layer
        this.doRemoveActiveFeatureLayerClass();
        const activeFeatureLayer = LayerManager.getActiveFeatureLayer();
        if(activeFeatureLayer) {
            this.uiRefFeatureLayerStack.querySelectorAll('li').forEach((item) => {
                if(activeFeatureLayer.getId() === item.getAttribute('data-oltb-id')) {
                    item.classList.add(`${CLASS_TOOLBOX_LIST}__item--active`);
                }
            });
        }

        // Note: Consumer callback
        if(!isSilent && this.options.onFeatureLayerRemoved instanceof Function) {
            this.options.onFeatureLayerRemoved(layerWrapper);
        }
    }

    doChangeLayerVisibility(layerWrapper, callback) {
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        InfoWindowManager.hideOverlay();

        const layer = layerWrapper.getLayer();
        const flippedVisibility = !layer.getVisible();
        layer.setVisible(flippedVisibility);
                     
        // Hide overlays associated with the layer
        if(this.hasLayerFeatures(layer)) {
            layer.getSource().getFeatures().forEach((feature) => {
                if(this.hasTooltip(feature)) {
                    feature.getProperties().oltb.tooltip.setMap(flippedVisibility ? map : null)
                }
            });
        }

        // Note: Consumer callback
        if(callback instanceof Function) {
            callback(layerWrapper);
        }
    }

    doToggleToolboxSection(targetName) {
        const targetNode = document.getElementById(targetName);
        const duration = ConfigManager.getConfig().animationDuration.fast;

        targetNode?.slideToggle(duration, (collapsed) => {
            this.localStorage[targetName] = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doDownloadLayer(layerWrapper, format, result, callback) {
        const features = layerWrapper.getLayer().getSource().getFeatures();
        const content = format.writeFeatures(features, {
            featureProjection: ConfigManager.getConfig().projection.default
        });
        
        const filename = `${layerWrapper.getName()}.${result.format.toLowerCase()}`;
        download(filename, content);

        // Note: Consumer callback
        if(callback instanceof Function) {
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

        LayerManager.addMapLayer({
            name: options.name,
            sortIndex: 0,
            isDynamicallyAdded: options.isDynamicallyAdded,
            layer: layer
        });
    }

    doAddFeatureLayer(options) {
        LayerManager.addFeatureLayer({
            name: options.name,
            sortIndex: 0,
            isDynamicallyAdded: options.isDynamicallyAdded
        });
    }

    doShowAddMapLayerModal() {
        if(this.layerModal) {
            return;
        }

        this.layerModal = new LayerModal({
            onCreate: (result) => {
                this.onCreateMapLayer(result);
            },
            onClose: () => {
                this.layerModal = undefined;
            }
        });
    }

    doRemoveActiveFeatureLayerClass() {
        // Note: Should just be one li-item that has the active class
        // Just in case, clean all items
        this.uiRefFeatureLayerStack.querySelectorAll('li').forEach((item) => {
            item.classList.remove(`${CLASS_TOOLBOX_LIST}__item--active`);
        });
    }
}

export { LayerTool };
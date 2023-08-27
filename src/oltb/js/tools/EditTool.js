import _ from 'lodash';
import jsts from 'jsts/dist/jsts.min';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Feature } from 'ol';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../helpers/constants/Settings';
import { LogManager } from '../core/managers/LogManager';
import { SnapManager } from '../core/managers/SnapManager';
import { ToolManager } from '../core/managers/ToolManager';
import { shiftKeyOnly } from 'ol/events/condition';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../core/managers/ConfigManager';
import { ElementManager } from '../core/managers/ElementManager';
import { TooltipManager } from '../core/managers/TooltipManager';
import { createUITooltip } from '../creators/CreateUITooltip';
import { SettingsManager } from '../core/managers/SettingsManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { TranslationManager } from '../core/managers/TranslationManager';
import { Fill, Stroke, Style } from 'ol/style';
import { hasCustomFeatureProperty } from '../helpers/browser/HasNestedProperty';
import { getCustomFeatureProperty } from '../helpers/browser/GetNestedProperty';
import { Select, Modify, Translate } from 'ol/interaction';
import { getMeasureCoordinates, getMeasureValue } from '../helpers/Measurements';
import { GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';

/*!
 *  JSTS
 *  To avoid circular dependencies i include the full dist
 *  This increases the bundle size but removes errors/warnings in Rollup build process
 *  Also more features can be used from this lib in the future
 *   
 *  https://github.com/bjornharrtell/jsts#caveats
 */

const FILENAME = 'tools/EditTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-edit';
const KEY_TOOLTIP = 'tool.edit';

const DefaultOptions = Object.freeze({
    hitTolerance: 5,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStyleChange: undefined,
    onShapeOperation: undefined,
    onSelectAdd: undefined,
    onSelectRemove: undefined,
    onModifyStart: undefined,
    onModifyEnd: undefined,
    onTranslateStart: undefined,
    onTranslatEnd: undefined,
    onRemovedFeature: undefined,
    onError: undefined,
    onSnapped: undefined
});

const LocalStorageNodeName = LocalStorageKeys.editTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    isCollapsed: false,
    strokeColor: '#0166A5FF',
    fillColor: '#D7E3FA80'
});

const DefaultButtonProps = Object.freeze({
    width: 20,
    height: 20,
    fill: '#FFFFFFFF',
    stroke: 'none',
    class: 'oltb-btn__icon'
});

const DefaultDrawingStyle = new Style({
    fill: new Fill({
        color: '#D7E3FA80'
    }),
    stroke: new Stroke({
        color: '#0166A5FF',
        width: 2.5
    })
});

const DefaultMeasureStyle = new Style({
    fill: new Fill({
        color: '#FFFFFF66'
    }),
    stroke: new Stroke({
        color: '#3B4352FF',
        lineDash: [2, 5],
        width: 2.5
    })
});

/**
 * About:
 * Edit objects on the Map
 * 
 * Description:
 * Edit previously drawn objects (including measurements) in the map. Change there size, color, shape and location. 
 * Apply various shape functions such as Union, Intersect, Exclude and Difference.
 */
class EditTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.cursor.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get('tools.debugInfoTool');
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.editTool})`
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
        this.lastStyle = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        // JSTS
        this.parser = new jsts.io.OL3Parser();
        this.parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);
        
        this.initToolboxHTML();
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();
        this.initSettings();

        this.uiRefDeleteSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-delete-selected-button`);
        this.uiRefDeleteSelectedButton.addEventListener(Events.browser.click, this.onDeleteSelectedFeatures.bind(this));

        this.uiRefUnionSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-union-selected-button`);
        this.uiRefUnionSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.unionFeatures, 'union'));

        this.uiRefIntersectSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-intersect-selected-button`);
        this.uiRefIntersectSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.intersectFeatures, 'intersect'));

        this.uiRefExcludeSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-exclude-selected-button`);
        this.uiRefExcludeSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.excludeFeatures, 'exclude'));

        this.uiRefDifferenceSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-difference-selected-button`);
        this.uiRefDifferenceSelectedButton.addEventListener(Events.browser.click, this.onShapeOperator.bind(this, this.differenceFeatures, 'difference'));

        this.uiRefFillColor = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-fill-color`);
        this.uiRefFillColor.addEventListener(Events.custom.colorChange, this.onFeatureColorChange.bind(this));

        this.uiRefStrokeColor = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.uiRefStrokeColor.addEventListener(Events.custom.colorChange, this.onFeatureColorChange.bind(this));

        this.interactionSelect = this.generateOLInteractionSelect();
        this.interactionModify = this.generateOLInteractionModify();
        this.interactionTranslate = this.generateOLInteractionTranslate();

        this.interactionSelect.getFeatures().on(Events.openLayers.add, this.onSelectFeatureAdd.bind(this));
        this.interactionSelect.getFeatures().on(Events.openLayers.remove, this.onSelectFeatureRemove.bind(this));

        this.interactionModify.addEventListener(Events.openLayers.modifyStart, this.onModifyStart.bind(this));
        this.interactionModify.addEventListener(Events.openLayers.modifyEnd, this.onModifyEnd.bind(this));

        this.interactionTranslate.addEventListener(Events.openLayers.translateStart, this.onTranslateStart.bind(this));
        this.interactionTranslate.addEventListener(Events.openLayers.translateEnd, this.onTranslateEnd.bind(this));

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));
        window.addEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));

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
        const i18n = TranslationManager.get('tools.editTool.toolbox');
        const i18nCommon = TranslationManager.get('common.titles');

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="tools.editTool.toolbox.titles.draw">${i18n.titles.edit}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="common.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" data-oldb-i18n="tools.editTool.toolbox.groups.misc">${i18n.groups.misc}</label>
                        <button type="button" id="${ID_PREFIX}-delete-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Delete">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.trash.stroked })}
                        </button>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${CLASS_TOOLBOX_SECTION}__group--sub-toolbar">
                        <label class="oltb-label" data-oldb-i18n="tools.editTool.toolbox.groups.shapes">${i18n.groups.misc}</label>
                        <button type="button" id="${ID_PREFIX}-union-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Union">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.union.mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-intersect-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Intersect">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.intersect.mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-exclude-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Exclude">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.exclude.mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-difference-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Difference">
                            ${getIcon({ ...DefaultButtonProps, path: SvgPaths.subtract.mixed })}
                        </button>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-stroke-color" data-oldb-i18n="tools.editTool.toolbox.groups.strokeColor">${i18n.groups.strokeColor}</label>
                        <div id="${ID_PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-fill-color" data-oldb-i18n="tools.editTool.toolbox.groups.fillColor">${i18n.groups.fillColor}</label>
                        <div id="${ID_PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-fill-color" data-oltb-color="${this.localStorage.fillColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.fillColor};"></div>
                        </div>
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

    initSettings() {
        const i18n = TranslationManager.get('tools.editTool.settings');
        SettingsManager.addSetting(Settings.mouseOnlyToEditVectorShapes, {
            state: true, 
            text: i18n.mouseOnlyToEditVectorShapes
        });
    }

    // -------------------------------------------------------------------
    // # Section: Generate Helpers
    // -------------------------------------------------------------------

    generateOLInteractionSelect() {
        return new Select({
            hitTolerance: this.options.hitTolerance,
            filter: (feature, layer) => {
                const isSelectable = !this.isSelectable(feature);
                const isFeatureLayer = LayerManager.getFeatureLayers().find((layerWrapper) => {
                    return layerWrapper.getLayer().getSource().hasFeature(feature);
                });
                
                return (isSelectable && (isFeatureLayer || 
                    SettingsManager.getSetting(Settings.selectVectorMapShapes)
                ));
            },
            style: this.lastStyle
        });
    }

    generateOLInteractionModify() {
        return new Modify({
            features: this.interactionSelect.getFeatures(),
            condition: (event) => {
                return shiftKeyOnly(event) || this.useMouseOnlyToEditVectorShapes()
            }
        });
    }

    generateOLInteractionTranslate() {
        return new Translate({
            features: this.interactionSelect.getFeatures(),
        });
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
        const map = this.getMap();
        if(!map) {
            return;
        }

        [
            this.interactionSelect,
            this.interactionTranslate,
            this.interactionModify
        ].forEach((item) => {
            map.addInteraction(item);
        });

        ToolManager.setActiveTool(this);
        SnapManager.addSnap(this);

        this.isActive = true;
        this.uiRefToolboxSection.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        [
            this.interactionSelect,
            this.interactionTranslate,
            this.interactionModify
        ].forEach((item) => {
            this.getMap().removeInteraction(item);
        });

        ToolManager.removeActiveTool();
        SnapManager.removeSnap();

        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deSelectTool() {
        this.deActivateTool();
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
        if(isShortcutKeyOnly(event, ShortcutKeys.editTool)) {
            this.onClickTool(event);
        }else if(this.isActive && event.key === Keys.valueDelete) {
            this.onDeleteSelectedFeatures();
        }
    }
    
    onWindowBrowserStateCleared() {
        this.doClearState();

        this.uiRefFillColor.setAttribute('data-oltb-color', this.localStorage.fillColor);
        this.uiRefFillColor.firstElementChild.style.backgroundColor = this.localStorage.fillColor;

        this.uiRefStrokeColor.setAttribute('data-oltb-color', this.localStorage.strokeColor);
        this.uiRefStrokeColor.firstElementChild.style.backgroundColor = this.localStorage.strokeColor;

        if(this.isActive) {
            this.deActivateTool();
        }

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    onWindowFeatureLayerRemoved(event) {
        this.interactionSelect.getFeatures().clear();
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        
        this.doToggleToolboxSection(targetName);
    }

    onSelectFeatureAdd(event) {
        this.doSelectFeatureAdd(event);
    }

    onSelectFeatureRemove(event) {
        this.doSelectFeatureRemove(event);
    }

    onModifyStart(event) {
        this.doModifyStart(event);
    }

    onModifyEnd(event) {
        this.doModifyEnd(event);
    }

    onTranslateStart(event) {
        this.doTranslateStart(event);
    }

    onTranslateEnd(event) {
        this.doTranslateEnd(event);
    }

    onSnap(event) {
        this.doSnap(event);
    }

    onDeleteSelectedFeatures() {
        const featureLength = this.interactionSelect.getFeatures().getArray().length;

        if(featureLength === 0) {
            const i18n = TranslationManager.get('tools.editTool.toasts.noSelected');

            Toast.info({
                title: i18n.title,
                message: i18n.message, 
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });

            return;
        }

        this.askToDeleteFeatures();
    }

    onFeatureColorChange(event) {
        this.doFeatureColorChange(event);
    }

    onFeatureChange(feature) {
        this.doFeatureChange(feature);
    }

    onShapeOperator(operation, type) {
        this.doShapeOperation(operation, type);
    }

    // -------------------------------------------------------------------
    // # Section: Listeners Subscriptions
    // -------------------------------------------------------------------

    attachOnChange(feature) {
        const selectedFeatures = this.interactionSelect.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        if(hasOtherTooltip && selectedFeatures.length === 1) {
            this.tooltipItem = TooltipManager.push(KEY_TOOLTIP);
        }

        const properties = feature.getProperties();
        const hiddenTooltip = hasOtherTooltip && selectedFeatures.length === 1;

        properties.oltb.onChangeListener = feature.getGeometry().on(Events.openLayers.change, this.onFeatureChange.bind(this, feature));
        properties.oltb.tooltip.getElement().className = (`oltb-overlay-tooltip ${
            hiddenTooltip ? 'oltb-overlay-tooltip--hidden' : ''
        }`);
    }

    detachOnChange(feature) {
        const selectedFeatures = this.interactionSelect.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        
        if(hasOtherTooltip && selectedFeatures.length === 1) {
            TooltipManager.pop(KEY_TOOLTIP);
        }

        const properties = feature.getProperties();
        const geometry = feature.getGeometry();

        unByKey(properties.oltb.onChangeListener);

        const overlay = properties.oltb.tooltip;
        overlay.setPosition(getMeasureCoordinates(geometry));

        const tooltip = overlay.getElement();
        tooltip.className = 'oltb-overlay-tooltip';

        const measureValue = getMeasureValue(geometry);
        tooltip.firstElementChild.innerHTML = `${measureValue.value} ${measureValue.unit}`;
    }

    // -------------------------------------------------------------------
    // # Section: JSTS Functions
    // -------------------------------------------------------------------

    unionFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.union(a, b);
    }

    intersectFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.intersection(a, b);
    }

    excludeFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.symDifference(a, b);
    }

    differenceFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.difference(a, b);
    }

    // -------------------------------------------------------------------
    // # Section: Conversions/Validation
    // -------------------------------------------------------------------

    useMouseOnlyToEditVectorShapes() {
        return SettingsManager.getSetting(Settings.mouseOnlyToEditVectorShapes);
    }

    isMeasurementType(feature) {
        return getCustomFeatureProperty(feature.getProperties(), 'type') === FeatureProperties.type.measurement;
    }

    isTwoAndOnlyTwoShapes(features) {
        return features.length === 2;
    }

    isSelectable(feature) {
        return hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.notSelectable);
    }

    hasTooltip(feature) {
        return hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip);
    }

    // -------------------------------------------------------------------
    // # Section: Ask User
    // -------------------------------------------------------------------

    askToDeleteFeatures() {
        const featureLength = this.interactionSelect.getFeatures().getArray().length;
        const i18n = TranslationManager.get('tools.editTool.dialogs.deleteFeatures');

        Dialog.confirm({
            title: i18n.title,
            message: `${i18n.message} ${featureLength}st?`,
            confirmText: i18n.confirmText,
            onConfirm: () => {
                const features = [ ...this.interactionSelect.getFeatures().getArray() ];
                this.doDeleteFeatures(features);
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doSelectFeatureAdd(event) {
        // Note: Consumer callback
        if(this.options.onSelectAdd instanceof Function) {
            this.options.onSelectAdd(event);
        }
    }

    doSelectFeatureRemove(event) {
        const feature = event.element;

        // Note: The setTimeout must be used
        // If not, the style will be reset to the style used before the feature was selected
        window.setTimeout(() => {
            if(!this.colorHasChanged) {
                return;
            }

            // Set the lastStyle as the default style
            feature.setStyle(this.lastStyle);

            if(this.isMeasurementType(feature)) {
                // To add lineDash, a new Style object must be used
                // If the lastStyle is used all object that is referenced with that object will get a dashed line
                const style = new Style({
                    fill: new Fill({
                        color: this.lastStyle.getFill().getColor()
                    }),
                    stroke: new Stroke({
                        color: this.lastStyle.getStroke().getColor(),
                        width: this.lastStyle.getStroke().getWidth(),
                        lineDash: [2, 5]
                    })
                });
                    
                feature.setStyle(style);
            }

            // Note: Consumer callback
            if(this.options.onStyleChange instanceof Function) {
                this.options.onStyleChange(event, this.lastStyle);
            }

            // Reset for the last deselected item
            if(event.index === 0) {
                this.colorHasChanged = false;
            }
        });

        // Note: Consumer callback
        if(this.options.onSelectRemove instanceof Function) {
            this.options.onSelectRemove(event);
        }
    }

    doModifyStart(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(this.hasTooltip(feature)) {
                this.attachOnChange(feature);
            }
        });

        // Note: Consumer callback
        if(this.options.onModifyStart instanceof Function) {
            this.options.onModifyStart(event);
        }
    }

    doModifyEnd(event) {
        const features = event.features;
        features.forEach((feature) => {
            if(this.hasTooltip(feature)) {
                this.detachOnChange(feature);
            }
        });

        // Note: Consumer callback
        if(this.options.onModifyEnd instanceof Function) {
            this.options.onModifyEnd(event);
        }
    }

    doTranslateStart(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(this.hasTooltip(feature)) {
                this.attachOnChange(feature);
            }
        });

        // Note: Consumer callback
        if(this.options.onTranslateStart instanceof Function) {
            this.options.onTranslateStart(event);
        }
    }

    doTranslateEnd(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(this.hasTooltip(feature)) {
                this.detachOnChange(feature);
            }
        });

        // Note: Consumer callback
        if(this.options.onTranslatEnd instanceof Function) {
            this.options.onTranslatEnd(event);
        }
    }

    doSnap(event) {
        // Note: Consumer callback
        if(this.options.onSnapped instanceof Function) {
            this.options.onSnapped(event);
        }
    }

    doFeatureColorChange(event) {
        this.colorHasChanged = true;

        const fillColor = this.uiRefFillColor.getAttribute('data-oltb-color');
        const strokeColor = this.uiRefStrokeColor.getAttribute('data-oltb-color');

        const features = [ ...this.interactionSelect.getFeatures().getArray() ];

        this.lastStyle = new Style({
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                width: 2.5
            })
        });

        features.forEach((feature) => {
            feature.setStyle(this.lastStyle);      
        });

        this.localStorage.fillColor = this.lastStyle.getFill().getColor();
        this.localStorage.strokeColor = this.lastStyle.getStroke().getColor();

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    doFeatureChange(feature) {
        const selectedFeatures = this.interactionSelect.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        const geometry = feature.getGeometry();
        const measureValue = getMeasureValue(geometry);

        if(hasOtherTooltip && selectedFeatures.length === 1) {
            this.tooltipItem.innerHTML = `${measureValue.value} ${measureValue.unit}`;
        }else {
            const overlay = feature.getProperties().oltb.tooltip;
            overlay.setPosition(getMeasureCoordinates(geometry));

            const tooltip = overlay.getElement();
            tooltip.firstElementChild.innerHTML = `${measureValue.value} ${measureValue.unit}`;
        }
    }

    doShapeOperation(operation, type) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const features = [ ...this.interactionSelect.getFeatures().getArray() ];

        if(!this.isTwoAndOnlyTwoShapes(features)) {
            const i18n = TranslationManager.get('tools.editTool.toasts.strictTwoShapes');

            Toast.info({
                title: i18n.title,
                message: i18n.message, 
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });

            return;
        }

        try {
            const a = features[0];
            const b = features[1];

            const aGeometry = this.parser.read(a.getGeometry());
            const bGeometry = this.parser.read(b.getGeometry());

            // JSTS Lib operation
            const shape = operation(aGeometry, bGeometry);

            // Create new feature with that shape
            const feature = new Feature({
                geometry: new Polygon(this.parser.write(shape).getCoordinates()),
            });

            // Check if a or b was a measurement, if so, create a new tooltip
            if(this.isMeasurementType(a) || this.isMeasurementType(b)) {
                const tooltip = createUITooltip();

                feature.setProperties({
                    oltb: {
                        type: FeatureProperties.type.measurement,
                        tooltip: tooltip.getOverlay()
                    }
                });

                const geometry = feature.getGeometry();
                tooltip.setPosition(getMeasureCoordinates(geometry));

                const measureValue = getMeasureValue(geometry);
                tooltip.setData(`${measureValue.value} ${measureValue.unit}`);

                map.addOverlay(tooltip.getOverlay());
                feature.setStyle(DefaultMeasureStyle);
            }else {
                feature.setStyle(DefaultDrawingStyle);
            }

            // Add the unioned shape
            const layerWrapper = LayerManager.getActiveFeatureLayer();
            LayerManager.addFeatureToLayer(feature, layerWrapper);

            // Remove two original shapes
            this.doDeleteFeatures(features);

            // Note: Consumer callback
            if(this.options.onShapeOperation instanceof Function) {
                this.options.onShapeOperation(type, a, b, feature);
            }
        }catch(error) {
            const i18n = TranslationManager.get('tools.editTool.toasts.shapeOperationError');

            LogManager.logError(FILENAME, 'onShapeOperator', {
                message: i18n.message,
                error: error
            });
            
            Toast.error({
                title: i18n.title,
                message: i18n.message
            }); 

            // Note: Consumer callback
            if(this.options.onError instanceof Function) {
                this.options.onError(error);
            }
        }
    }

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

    doDeleteFeatures(features) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const layerWrappers = LayerManager.getFeatureLayers();

        // Note: The user can select features from any layer
        // Each feature needs to be removed from its associated layer
        features.forEach((feature) => {
            layerWrappers.forEach((layerWrapper) => {
                const source = layerWrapper.getLayer().getSource();
                if(!source.hasFeature(feature)) {
                    return;
                }

                LayerManager.removeFeatureFromLayer(feature, layerWrapper);
                this.interactionSelect.getFeatures().remove(feature);

                // Remove overlays associated with the feature
                if(this.hasTooltip(feature)) {
                    map.removeOverlay(feature.getProperties().oltb.tooltip);
                }

                // Note: Consumer callback
                if(this.options.onRemovedFeature instanceof Function) {
                    this.options.onRemovedFeature(feature);
                }
            });
        });
    }
}

export { EditTool };
import _ from 'lodash';
import jsts from 'jsts/dist/jsts.min';
import { DOM } from '../../helpers/browser/dom-factory';
import { Keys } from '../../helpers/constants/keys';
import { Toast } from '../../common/toasts/toast';
import { Dialog } from '../../common/dialogs/dialog';
import { Events } from '../../helpers/constants/events';
import { Feature } from 'ol';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../../helpers/constants/settings';
import { getCenter } from 'ol/extent';
import { LogManager } from '../../managers/log-manager/log-manager';
import { SnapManager } from '../../managers/snap-manager/snap-manager';
import { ToolManager } from '../../managers/tool-manager/tool-manager';
import { shiftKeyOnly } from 'ol/events/condition';
import { LayerManager } from '../../managers/layer-manager/layer-manager';
import { StateManager } from '../../managers/state-manager/state-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { jsonReplacer } from '../../helpers/browser/json-replacer';
import { ConfigManager } from '../../managers/config-manager/config-manager';
import { DefaultConfig } from '../../managers/config-manager/default-config';
import { FeatureManager } from '../../managers/feature-manager/feature-manager';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { TooltipManager } from '../../managers/tooltip-manager/tooltip-manager';
import { createUITooltip } from '../../creators/create-ui-tooltip';
import { SettingsManager } from '../../managers/settings-manager/settings-manager';
import { degreesToRadians } from '../../helpers/conversions';
import { LocalStorageKeys } from '../../helpers/constants/local-storage-keys';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { GeometryDataModal } from '../../modal-extensions/geometry-data-modal';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { FeatureProperties } from '../../helpers/constants/feature-properties';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';
import { Fill, Stroke, Style } from 'ol/style';
import { Select, Modify, Translate } from 'ol/interaction';
import { getMeasureCoordinates, getMeasureValue } from '../../helpers/measurements';
import { GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';

/*!
 *  JSTS
 *  To avoid circular dependencies i include the full dist
 *  This increases the bundle size but removes errors/warnings in Rollup build process
 *  Also more features can be used from this lib in the future
 *   
 *  https://github.com/bjornharrtell/jsts#caveats
 */

const FILENAME = 'EditTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-edit';
const KEY_TOOLTIP = 'tools.editTool';
const I18N_BASE = 'tools.editTool';
const I18N_BASE_COMMON = 'commons';

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

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.editTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.editTool})`,
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
        this.uiRefToolboxSection = window.document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();
        this.initSettings();

        this.uiRefDeleteSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-delete-selected-button`);
        this.uiRefDeleteSelectedButton.addEventListener(Events.browser.click, this.onDeleteSelectedFeatures.bind(this));

        this.uiRefRotateSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-rotate-selected-button`);
        this.uiRefRotateSelectedButton.addEventListener(Events.browser.click, this.onRotateSelectedFeatures.bind(this));

        this.uiRefInfoSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-info-button`);
        this.uiRefInfoSelectedButton.addEventListener(Events.browser.click, this.onInfoSelectedFeatures.bind(this));

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

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initToolboxHTML() {
        const i18n = TranslationManager.get(`${I18N_BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);

        const buttonClasses = 'class="oltb-btn oltb-btn--blue-mid oltb-tippy"';
        const html = (`
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.edit">${i18n.titles.edit}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${CLASS_TOOLBOX_SECTION}__group--sub-toolbar">
                        <label class="oltb-label" data-oltb-i18n="${I18N_BASE}.toolbox.groups.misc.title">${i18n.groups.misc.title}</label>
                        <button type="button" id="${ID_PREFIX}-delete-selected-button" ${buttonClasses} data-oltb-i18n="${I18N_BASE}.toolbox.groups.misc.delete" title="${i18n.groups.misc.delete}">
                            ${getIcon({...DefaultButtonProps, path: SvgPaths.trash.stroked})}
                        </button>
                        <button type="button" id="${ID_PREFIX}-rotate-selected-button" ${buttonClasses} data-oltb-i18n="${I18N_BASE}.toolbox.groups.misc.rotate" title="${i18n.groups.misc.rotate}">
                            ${getIcon({...DefaultButtonProps, path: SvgPaths.arrowRepeat.stroked})}
                        </button>
                        <button type="button" id="${ID_PREFIX}-info-button" ${buttonClasses} data-oltb-i18n="${I18N_BASE}.toolbox.groups.misc.geometryData" title="${i18n.groups.misc.geometryData}">
                            ${getIcon({...DefaultButtonProps, path: SvgPaths.infoCircle.stroked})}
                        </button>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${CLASS_TOOLBOX_SECTION}__group--sub-toolbar">
                        <label class="oltb-label" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.title">${i18n.groups.shapes.title}</label>
                        <button type="button" id="${ID_PREFIX}-union-selected-button" ${buttonClasses} data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.union" title="${i18n.groups.shapes.union}">
                            ${getIcon({...DefaultButtonProps, path: SvgPaths.union.mixed})}
                        </button>
                        <button type="button" id="${ID_PREFIX}-intersect-selected-button" ${buttonClasses} data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.intersect" title="${i18n.groups.shapes.intersect}">
                            ${getIcon({...DefaultButtonProps, path: SvgPaths.intersect.mixed})}
                        </button>
                        <button type="button" id="${ID_PREFIX}-exclude-selected-button" ${buttonClasses} data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.exclude" title="${i18n.groups.shapes.exclude}">
                            ${getIcon({...DefaultButtonProps, path: SvgPaths.exclude.mixed})}
                        </button>
                        <button type="button" id="${ID_PREFIX}-difference-selected-button" ${buttonClasses} data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.difference" title="${i18n.groups.shapes.difference}">
                            ${getIcon({...DefaultButtonProps, path: SvgPaths.subtract.mixed})}
                        </button>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${CLASS_TOOLBOX_SECTION}__group--split-group">
                        <div class="${CLASS_TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID_PREFIX}-stroke-color" data-oltb-i18n="${I18N_BASE}.toolbox.groups.strokeColor.title">${i18n.groups.strokeColor.title}</label>
                            <div id="${ID_PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                                <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                            </div>
                        </div>
                        <div class="${CLASS_TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID_PREFIX}-fill-color" data-oltb-i18n="${I18N_BASE}.toolbox.groups.fillColor.title">${i18n.groups.fillColor.title}</label>
                            <div id="${ID_PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-fill-color" data-oltb-color="${this.localStorage.fillColor}" tabindex="0">
                                <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.fillColor};"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', html);
    }

    initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS_TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });
    }

    initSettings() {
        SettingsManager.addSetting(Settings.mouseOnlyToEditVectorShapes, {
            state: true, 
            i18nBase: `${I18N_BASE}.settings`,
            i18nKey: 'mouseOnlyToEditVectorShapes'
        });
    }

    //--------------------------------------------------------------------
    // # Section: Generate Helpers
    //--------------------------------------------------------------------
    generateOLInteractionSelect() {
        return new Select({
            hitTolerance: this.options.hitTolerance,
            filter: (feature, layer) => {
                const isIconMarker = FeatureManager.isIconMarkerType(feature);
                if(isIconMarker) {
                    return false;
                }

                const isWindBarb = FeatureManager.isWindBarbType(feature)
                if(isWindBarb) {
                    return false;
                }

                const belongsToFeatureLayer = LayerManager.belongsToFeatureLayer(feature);
                if(belongsToFeatureLayer) {
                    return true;
                }

                const selectVectorShapesInMapLayers = SettingsManager.getSetting(Settings.selectVectorMapShapes);
                const belongsToMapLayer = LayerManager.belongsToMapLayer(feature);
                if(belongsToMapLayer && selectVectorShapesInMapLayers) {
                    return true;
                }

                return false;
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

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
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

        this.uiRefToolboxSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end', 
            inline: 'nearest' 
        });
    }

    deactivateTool() {
        [
            this.interactionSelect,
            this.interactionTranslate,
            this.interactionModify
        ].forEach((item) => {
            this.getMap().removeInteraction(item);
        });

        this.interactionSelect.getFeatures().clear();

        ToolManager.removeActiveTool();
        SnapManager.removeSnap();

        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deselectTool() {
        this.deactivateTool();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
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
        this.doClearColors();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note:
        // @Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    onWindowFeatureLayerRemoved(event) {
        this.interactionSelect.getFeatures().clear();
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
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
        const features = [...this.interactionSelect.getFeatures().getArray()];
        const autoremove = ConfigManager.getConfig().autoRemovalDuation.normal;

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.missingFeatures`,
                autoremove: autoremove
            });

            return;
        }

        this.askToDeleteFeatures(features);
    }

    onRotateSelectedFeatures() {
        const features = [...this.interactionSelect.getFeatures().getArray()];
        const autoremove = ConfigManager.getConfig().autoRemovalDuation.normal;

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.missingFeatures`,
                autoremove: autoremove
            });

            return;
        }

        this.askToRotateSelectedFeatures(features);
    }

    onInfoSelectedFeatures() {
        const features = [...this.interactionSelect.getFeatures().getArray()];
        const autoremove = ConfigManager.getConfig().autoRemovalDuation.normal;

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.missingFeatures`,
                autoremove: autoremove
            });

            return;
        }

        if(features.length >= 2) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.strictOneFeature`,
                autoremove: autoremove
            });

            return;
        }

        this.doShowFeatureInfo(features[0]);
    }

    onFeatureColorChange(event) {
        this.doFeatureColorChange(event);
    }

    onFeatureChange(feature) {
        this.doFeatureChange(feature);
    }

    onShapeOperator(operation, type) {
        const features = [...this.interactionSelect.getFeatures().getArray()];
        const autoremove = ConfigManager.getConfig().autoRemovalDuation.normal;

        if(!this.isTwoAndOnlyTwoShapes(features)) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.strictTwoFeatures`,
                autoremove: autoremove
            });

            return;
        }

        this.doShapeOperation(features, operation, type);
    }

    //--------------------------------------------------------------------
    // # Section: Listeners Subscriptions
    //--------------------------------------------------------------------
    attachOnChange(feature) {
        const selectedFeatures = this.interactionSelect.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        if(hasOtherTooltip && selectedFeatures.length === 1) {
            this.tooltipItem = TooltipManager.push(KEY_TOOLTIP);
        }

        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        const hiddenTooltip = hasOtherTooltip && selectedFeatures.length === 1;

        properties.onChangeListener = feature.getGeometry().on(Events.openLayers.change, this.onFeatureChange.bind(this, feature));
        properties.tooltip.getElement().className = (`oltb-overlay-tooltip ${
            hiddenTooltip ? 'oltb-overlay-tooltip--hidden' : ''
        }`);
    }

    detachOnChange(feature) {
        const selectedFeatures = this.interactionSelect.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        
        if(hasOtherTooltip && selectedFeatures.length === 1) {
            TooltipManager.pop(KEY_TOOLTIP);
        }

        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        const geometry = feature.getGeometry();

        unByKey(properties.onChangeListener);

        const overlay = properties.tooltip;
        overlay.setPosition(getMeasureCoordinates(geometry));

        const tooltip = overlay.getElement();
        tooltip.className = 'oltb-overlay-tooltip';

        const measureValue = getMeasureValue(geometry);
        tooltip.firstElementChild.innerHTML = `${measureValue.value} ${measureValue.unit}`;
    }

    //--------------------------------------------------------------------
    // # Section: JSTS Functions
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    useMouseOnlyToEditVectorShapes() {
        return SettingsManager.getSetting(Settings.mouseOnlyToEditVectorShapes);
    }

    isTwoAndOnlyTwoShapes(features) {
        return features.length === 2;
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToDeleteFeatures(features) {
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.confirms.deleteFeatures`);

        Dialog.confirm({
            title: i18n.title,
            message: `${i18n.message} ${features.length}st?`,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                this.doDeleteFeatures(features);
            }
        });
    }

    askToRotateSelectedFeatures(features) {
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.prompts.rotateFeatures`);

        Dialog.prompt({
            title: i18n.title,
            message: `${i18n.message}`,
            value: '0',
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                if(result.isDigitsOnly()) {
                    this.doRotateFeatures(features, result);
                }else {
                    LogManager.logError(FILENAME, 'askToRotateSelectedFeatures', {
                        message: 'Only digits are allowed as input',
                        result: result
                    });
                    
                    Toast.error({
                        i18nKey: `${I18N_BASE}.toasts.errors.invalidValue`
                    });
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

    doSelectFeatureAdd(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onSelectAdd instanceof Function) {
            this.options.onSelectAdd(event);
        }
    }

    doSelectFeatureRemove(event) {
        const feature = event.element;

        // Note: 
        // The setTimeout must be used
        // If not, the style will be reset to the style used before the feature was selected
        window.setTimeout(() => {
            if(!this.colorHasChanged) {
                return;
            }

            // Set the lastStyle as the default style
            feature.setStyle(this.lastStyle);

            if(FeatureManager.isMeasurementType(feature)) {
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

            // Note: 
            // @Consumer callback
            if(this.options.onStyleChange instanceof Function) {
                this.options.onStyleChange(event, this.lastStyle);
            }

            // Reset for the last deselected item
            if(event.index === 0) {
                this.colorHasChanged = false;
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onSelectRemove instanceof Function) {
            this.options.onSelectRemove(event);
        }
    }

    doModifyStart(event) {
        const features = event.features;
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.attachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onModifyStart instanceof Function) {
            this.options.onModifyStart(event);
        }
    }

    doModifyEnd(event) {
        const features = event.features;
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.detachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onModifyEnd instanceof Function) {
            this.options.onModifyEnd(event);
        }
    }

    doTranslateStart(event) {
        const features = event.features;
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.attachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onTranslateStart instanceof Function) {
            this.options.onTranslateStart(event);
        }
    }

    doTranslateEnd(event) {
        const features = event.features;
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.detachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onTranslatEnd instanceof Function) {
            this.options.onTranslatEnd(event);
        }
    }

    doSnap(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onSnapped instanceof Function) {
            this.options.onSnapped(event);
        }
    }

    doFeatureColorChange(event) {
        this.colorHasChanged = true;

        const fillColor = this.uiRefFillColor.getAttribute('data-oltb-color');
        const strokeColor = this.uiRefStrokeColor.getAttribute('data-oltb-color');

        const features = [...this.interactionSelect.getFeatures().getArray()];

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
            const overlay = FeatureManager.getTooltip(feature);
            overlay.setPosition(getMeasureCoordinates(geometry));

            const tooltip = overlay.getElement();
            tooltip.firstElementChild.innerHTML = `${measureValue.value} ${measureValue.unit}`;
        }
    }

    doShapeOperation(features, operation, type) {
        const map = this.getMap();
        if(!map) {
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
            if(FeatureManager.isMeasurementType(a) || FeatureManager.isMeasurementType(b)) {
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

            // Note: 
            // @Consumer callback
            if(this.options.onShapeOperation instanceof Function) {
                this.options.onShapeOperation(type, a, b, feature);
            }
        }catch(error) {
            LogManager.logError(FILENAME, 'onShapeOperator', {
                message: 'Failed to perform shape operation',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.operationFailed`
            }); 

            // Note: 
            // @Consumer callback
            if(this.options.onError instanceof Function) {
                this.options.onError(error);
            }
        }
    }

    doClearColors() {
        this.uiRefFillColor.setAttribute('data-oltb-color', this.localStorage.fillColor);
        this.uiRefFillColor.firstElementChild.style.backgroundColor = this.localStorage.fillColor;

        this.uiRefStrokeColor.setAttribute('data-oltb-color', this.localStorage.strokeColor);
        this.uiRefStrokeColor.firstElementChild.style.backgroundColor = this.localStorage.strokeColor;
    }

    doDeleteFeatures(features) {
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        // Note: 
        // The user can select features from any layer
        // Each feature needs to be removed from its associated layer
        const layerWrappers = LayerManager.getFeatureLayers();
        features.forEach((feature) => {
            layerWrappers.forEach((layerWrapper) => {
                const source = layerWrapper.getLayer().getSource();
                if(!source.hasFeature(feature)) {
                    return;
                }

                LayerManager.removeFeatureFromLayer(feature, layerWrapper);
                this.interactionSelect.getFeatures().remove(feature);

                // Remove overlays associated with the feature
                if(FeatureManager.hasTooltip(feature)) {
                    map.removeOverlay(FeatureManager.getTooltip(feature));
                }

                // Note: 
                // @Consumer callback
                if(this.options.onRemovedFeature instanceof Function) {
                    this.options.onRemovedFeature(feature);
                }
            });
        });
    }

    doRotateFeatures(features, rotation) {
        const radians = degreesToRadians(rotation);
        
        features.forEach((feature) => {
            const geometry = feature.getGeometry();
            const center = getCenter(geometry.getExtent());
            geometry.rotate(radians, center);
        });
    }

    doShowFeatureInfo(feature) {
        // TODO:
        // Why is the [0] on the coordiantes required?
        const id = feature.ol_uid;
        const geometry = feature.getGeometry();
        const measurement = getMeasureValue(geometry);
        const coordinates = geometry.getCoordinates()[0];
        const vertices = coordinates.length;

        const indentation = 4;
        const coordinatesText = JSON.stringify(
            JSON.retrocycle(coordinates),
            jsonReplacer, 
            indentation
        );

        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        const propertiesText = JSON.stringify(
            JSON.retrocycle(properties),
            jsonReplacer, 
            indentation
        );

        // Note:
        // The data properties are used as keys in the translation-files
        const options = {
            data: {
                id: id,
                measurement: `${measurement.value} ${measurement.unit}`,
                oltbProperties: `<pre><code>${propertiesText}</code></pre>`,
                vertices: vertices,
                coordinates: `<pre><code>${coordinatesText}</code></pre>`
            }
        };

        return new GeometryDataModal(options);
    }
}

export { EditTool };
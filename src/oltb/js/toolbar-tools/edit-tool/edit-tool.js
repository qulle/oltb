import _ from 'lodash';
import * as jsts from 'jsts/dist/jsts.min';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { getUid } from 'ol/util';
import { Dialog } from '../../ui-common/ui-dialogs/dialog';
import { Events } from '../../browser-constants/events';
import { Feature } from 'ol';
import { unByKey } from 'ol/Observable';
import { BaseTool } from '../base-tool';
import { Settings } from '../../browser-constants/settings';
import { getCenter } from 'ol/extent';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { shiftKeyOnly } from 'ol/events/condition';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { jsonReplacer } from '../../browser-helpers/json-replacer';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';
import { StyleManager } from '../../toolbar-managers/style-manager/style-manager';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { DefaultConfig } from '../../toolbar-managers/config-manager/default-config';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TooltipManager } from '../../toolbar-managers/tooltip-manager/tooltip-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { FeatureProperties } from '../../ol-helpers/feature-properties';
import { GeometryDataModal } from '../../ui-extensions/geometry-data-modal/geometry-data-modal';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { ConversionManager } from '../../toolbar-managers/conversion-manager/conversion-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { Fill, Stroke, Style } from 'ol/style';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';
import { Select, Modify, Translate } from 'ol/interaction';
import { getMeasureCoordinates, getMeasureValue } from '../../ol-helpers/geometry-measurements';
import { GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';

const FILENAME = 'edit-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-edit';
const KEY__TOOLTIP = 'tools.editTool';
const I18N__BASE = 'tools.editTool';
const I18N__BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    hitTolerance: 5,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStyleChange: undefined,
    onCutFeatures: undefined,
    onCopyFeatures: undefined,
    onPasteFeatures: undefined,
    onShapeOperation: undefined,
    onSelectAdd: undefined,
    onSelectRemove: undefined,
    onModifyStart: undefined,
    onModifyEnd: undefined,
    onTranslateStart: undefined,
    onTranslateEnd: undefined,
    onRemovedFeatures: undefined,
    onError: undefined,
    onSnapped: undefined,
    onUnSnapped: undefined
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

/**
 * About:
 * Edit objects on the Map
 * 
 * Description:
 * Edit previously drawn objects (including measurements) in the map. Change there size, color, shape and location. 
 * Apply various shape functions such as Union, Intersect, Exclude and Difference.
 */
class EditTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.cursor.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.editTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.editTool})`,
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
        this.lastStyle = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.originalFeatureStyles = {};
        this.featureClipboard = [];

        this.parser = new jsts.io.OL3Parser();
        this.parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);
        
        this.#initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.#initToggleables();
        this.#initSettings();

        this.uiRefDeleteSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-delete-selected-button`);
        this.uiRefDeleteSelectedButton.addEventListener(Events.browser.click, this.#onDeleteSelectedFeatures.bind(this));

        this.uiRefRotateSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-rotate-selected-button`);
        this.uiRefRotateSelectedButton.addEventListener(Events.browser.click, this.#onRotateSelectedFeatures.bind(this));

        this.uiRefInfoSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-info-button`);
        this.uiRefInfoSelectedButton.addEventListener(Events.browser.click, this.#onInfoSelectedFeatures.bind(this));

        this.uiRefConvertSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-convert-button`);
        this.uiRefConvertSelectedButton.addEventListener(Events.browser.click, this.#onConvertSelectedFeatures.bind(this));

        this.uiRefCutSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-cut-selected-button`);
        this.uiRefCutSelectedButton.addEventListener(Events.browser.click, this.#onCutSelectedFeatures.bind(this));

        this.uiRefCopySelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-copy-selected-button`);
        this.uiRefCopySelectedButton.addEventListener(Events.browser.click, this.#onCopySelectedFeatures.bind(this));

        this.uiRefPasteSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-paste-selected-button`);
        this.uiRefPasteSelectedButton.addEventListener(Events.browser.click, this.#onPasteSelectedFeatures.bind(this));

        this.uiRefUnionSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-union-selected-button`);
        this.uiRefUnionSelectedButton.addEventListener(Events.browser.click, this.#onShapeOperator.bind(this, this.unionFeatures, 'union'));

        this.uiRefIntersectSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-intersect-selected-button`);
        this.uiRefIntersectSelectedButton.addEventListener(Events.browser.click, this.#onShapeOperator.bind(this, this.intersectFeatures, 'intersect'));

        this.uiRefExcludeSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-exclude-selected-button`);
        this.uiRefExcludeSelectedButton.addEventListener(Events.browser.click, this.#onShapeOperator.bind(this, this.excludeFeatures, 'exclude'));

        this.uiRefDifferenceSelectedButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-difference-selected-button`);
        this.uiRefDifferenceSelectedButton.addEventListener(Events.browser.click, this.#onShapeOperator.bind(this, this.differenceFeatures, 'difference'));

        this.uiRefFillColor = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-fill-color`);
        this.uiRefFillColor.addEventListener(Events.custom.colorChange, this.#onFeatureColorChange.bind(this));

        this.uiRefStrokeColor = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-stroke-color`);
        this.uiRefStrokeColor.addEventListener(Events.custom.colorChange, this.#onFeatureColorChange.bind(this));

        this.interactionSelect = this.#generateOLInteractionSelect();
        this.interactionModify = this.#generateOLInteractionModify();
        this.interactionTranslate = this.#generateOLInteractionTranslate();

        this.interactionSelect.getFeatures().on(Events.openLayers.add, this.#onSelectFeatureAdd.bind(this));
        this.interactionSelect.getFeatures().on(Events.openLayers.remove, this.#onSelectFeatureRemove.bind(this));

        this.interactionModify.addEventListener(Events.openLayers.modifyStart, this.#onModifyStart.bind(this));
        this.interactionModify.addEventListener(Events.openLayers.modifyEnd, this.#onModifyEnd.bind(this));

        this.interactionTranslate.addEventListener(Events.openLayers.translateStart, this.#onTranslateStart.bind(this));
        this.interactionTranslate.addEventListener(Events.openLayers.translateEnd, this.#onTranslateEnd.bind(this));

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
        this.onWindowFeatureLayerRemovedBind = this.#onWindowFeatureLayerRemoved.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
        window.addEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemovedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.removeEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
        window.removeEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemovedBind);
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

        const buttonClasses = 'class="oltb-btn oltb-btn--blue-mid oltb-tippy"';
        const html = (`
            <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
                <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.edit">${i18n.titles.edit}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar">
                        <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.title">${i18n.groups.misc.title}</label>
                        <button type="button" id="${ID__PREFIX}-delete-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.delete" title="${i18n.groups.misc.delete}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.trash.stroked})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-rotate-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.rotate" title="${i18n.groups.misc.rotate}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.arrowRepeat.stroked})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-info-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.geometryData" title="${i18n.groups.misc.geometryData}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.infoCircle.stroked})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-convert-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.convertFeature" title="${i18n.groups.misc.convertFeature}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.shuffle.stroked})}
                        </button>
                    </div>
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar">
                        <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.title">${i18n.groups.copying.title}</label>
                        <button type="button" id="${ID__PREFIX}-cut-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.cut" title="${i18n.groups.copying.cut}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.scissors.filled})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-copy-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.copy" title="${i18n.groups.copying.copy}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.copy.stroked})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-paste-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.paste" title="${i18n.groups.copying.paste}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.clipboard.stroked})}
                        </button>
                    </div>
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar ${CLASS__TOOLBOX_SECTION}__group--split-group">
                        <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.title">${i18n.groups.shapes.title}</label>
                        <button type="button" id="${ID__PREFIX}-union-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.union" title="${i18n.groups.shapes.union}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.union.mixed})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-intersect-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.intersect" title="${i18n.groups.shapes.intersect}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.intersect.mixed})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-exclude-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.exclude" title="${i18n.groups.shapes.exclude}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.exclude.mixed})}
                        </button>
                        <button type="button" id="${ID__PREFIX}-difference-selected-button" ${buttonClasses} data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.difference" title="${i18n.groups.shapes.difference}">
                            ${getSvgIcon({...DefaultButtonProps, path: SvgPaths.subtract.mixed})}
                        </button>
                    </div>
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                        <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID__PREFIX}-stroke-color" data-oltb-i18n="${I18N__BASE}.toolbox.groups.strokeColor.title">${i18n.groups.strokeColor.title}</label>
                            <div id="${ID__PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID__PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                                <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                            </div>
                        </div>
                        <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID__PREFIX}-fill-color" data-oltb-i18n="${I18N__BASE}.toolbox.groups.fillColor.title">${i18n.groups.fillColor.title}</label>
                            <div id="${ID__PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID__PREFIX}-fill-color" data-oltb-color="${this.localStorage.fillColor}" tabindex="0">
                                <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.fillColor};"></div>
                            </div>
                        </div>
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

    #initSettings() {
        SettingsManager.addSetting(Settings.mouseOnlyToEditVectorShapes, {
            state: true, 
            i18nBase: `${I18N__BASE}.settings`,
            i18nKey: 'mouseOnlyToEditVectorShapes'
        });
    }

    //--------------------------------------------------------------------
    // # Section: Generate Helpers
    //--------------------------------------------------------------------
    #generateOLInteractionSelect() {
        return new Select({
            hitTolerance: this.options.hitTolerance,
            style: (feature, resolution) => {
                return StyleManager.getSelectedStyle(feature, resolution);
            },
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
            }
        });
    }

    #generateOLInteractionModify() {
        return new Modify({
            features: this.interactionSelect.getFeatures(),
            condition: (event) => {
                return shiftKeyOnly(event) || this.useMouseOnlyToEditVectorShapes()
            }
        });
    }

    #generateOLInteractionTranslate() {
        return new Translate({
            features: this.interactionSelect.getFeatures(),
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
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
        this.uiRefToolboxSection.classList.remove(`${CLASS__TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deselectTool() {
        this.deactivateTool();
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    #deleteFeatures(features) {
        // Note: 
        // The user can select features from any layer
        // Each feature needs to be removed from its associated layer
        const layerWrappers = LayerManager.getFeatureLayers();
        features.forEach((feature) => {
            layerWrappers.forEach((layerWrapper) => {
                if((
                    layerWrapper.getLayer().getSource().hasFeature === undefined ||
                    !layerWrapper.getLayer().getSource().hasFeature(feature)
                )) {
                    return;
                }

                LayerManager.removeFeatureFromLayer(feature, layerWrapper);
                this.interactionSelect.getFeatures().remove(feature);
            });
        });
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
        if(isShortcutKeyOnly(event, ShortcutKeys.editTool)) {
            this.onClickTool(event);
        }else if(this.isActive && event.key === KeyboardKeys.valueDelete) {
            this.#onDeleteSelectedFeatures();
        }
    }
    
    #onWindowBrowserStateCleared() {
        this.doClearState();
        this.doClearColors();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note:
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }

    #onWindowFeatureLayerRemoved(event) {
        this.interactionSelect.getFeatures().clear();
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }

    #onSelectFeatureAdd(event) {
        this.doSelectFeatureAdd(event);
    }

    #onSelectFeatureRemove(event) {
        this.doSelectFeatureRemove(event);
    }

    #onModifyStart(event) {
        this.doModifyStart(event);
    }

    #onModifyEnd(event) {
        this.doModifyEnd(event);
    }

    #onTranslateStart(event) {
        this.doTranslateStart(event);
    }

    #onTranslateEnd(event) {
        this.doTranslateEnd(event);
    }

    #onDeleteSelectedFeatures() {
        const features = [...this.interactionSelect.getFeatures().getArray()];
        const autoremove = true

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingFeatures`,
                autoremove: autoremove
            });

            return;
        }

        this.askToDeleteFeatures(features);
    }

    #onRotateSelectedFeatures() {
        const features = [...this.interactionSelect.getFeatures().getArray()];
        const autoremove = true

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingFeatures`,
                autoremove: autoremove
            });

            return;
        }

        this.askToRotateSelectedFeatures(features);
    }

    #onInfoSelectedFeatures() {
        const features = [...this.interactionSelect.getFeatures().getArray()];

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingFeatures`,
                autoremove: true
            });

            return;
        }

        if(features.length >= 2) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.strictOneFeature`,
                autoremove: true
            });

            return;
        }

        this.doShowFeatureInfo(features[0]);
    }

    #onConvertSelectedFeatures() {
        const features = [...this.interactionSelect.getFeatures().getArray()];

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingFeatures`,
                autoremove: true
            });

            return;
        }

        this.askToConvertSelectedFeatures(features);
    }

    #onCutSelectedFeatures(event) {
        const features = [...this.interactionSelect.getFeatures().getArray()];

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingFeatures`,
                autoremove: true
            });

            return;
        }

        this.doCutFeatures(features);
    }

    #onCopySelectedFeatures(event) {
        const features = [...this.interactionSelect.getFeatures().getArray()];

        if(features.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingFeatures`,
                autoremove: true
            });

            return;
        }

        this.doCopyFeatures(features);
    }

    #onPasteSelectedFeatures(event) {
        if(this.featureClipboard.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingFeatures`,
                autoremove: true
            });

            return;
        }

        this.doPasteFeatures();
    }

    #onFeatureColorChange(event) {
        this.doFeatureColorChange(event);
    }

    #onFeatureChange(feature) {
        this.doFeatureChange(feature);
    }

    #onShapeOperator(operation, type) {
        const features = [...this.interactionSelect.getFeatures().getArray()];

        if(!this.isTwoAndOnlyTwoShapes(features)) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.strictTwoFeatures`,
                autoremove: true
            });

            return;
        }

        this.doShapeOperation(features, operation, type);
    }

    // Note:
    // This is a global event that is invoked from the SnapManager
    onSnap(event) {
        this.doSnap(event);
    }

    onUnSnap(event) {
        this.doUnSnap(event);
    }

    //--------------------------------------------------------------------
    // # Section: Listeners Subscriptions
    //--------------------------------------------------------------------
    attachOnChange(feature) {
        const selectedFeatures = this.interactionSelect.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        if(hasOtherTooltip && selectedFeatures.length === 1) {
            this.tooltipItem = TooltipManager.push(KEY__TOOLTIP);
        }

        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        const hiddenTooltip = hasOtherTooltip && selectedFeatures.length === 1;

        properties.onChangeListener = feature.getGeometry().on(Events.openLayers.change, this.#onFeatureChange.bind(this, feature));
        properties.tooltip.getElement().className = (`oltb-overlay-tooltip ${
            hiddenTooltip ? 'oltb-overlay-tooltip--hidden' : ''
        }`);
    }

    detachOnChange(feature) {
        const selectedFeatures = this.interactionSelect.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        
        if(hasOtherTooltip && selectedFeatures.length === 1) {
            TooltipManager.pop(KEY__TOOLTIP);
        }

        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        const geometry = feature.getGeometry();

        unByKey(properties.onChangeListener);

        const overlay = properties.tooltip;
        const tooltip = overlay.getElement();
        const measureCoordinates = getMeasureCoordinates(geometry);
        const measureValue = getMeasureValue(geometry);

        overlay.setPosition(measureCoordinates);
        tooltip.className = 'oltb-overlay-tooltip';
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
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
    getNumSelectedFeatures() {
        return this.interactionSelect.getFeatures().getLength();
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToDeleteFeatures(features) {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.deleteFeatures`);

        return Dialog.confirm({
            title: i18n.title,
            message: `${i18n.message} ${features.length}st?`,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                this.doDeleteFeatures(features);
            }
        });
    }

    askToRotateSelectedFeatures(features, value = '0') {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.prompts.rotateFeatures`);

        return Dialog.prompt({
            title: i18n.title,
            message: `${i18n.message}`,
            value: value,
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
                        i18nKey: `${I18N__BASE}.toasts.errors.invalidValue`
                    });
                }
            }
        });
    }

    askToConvertSelectedFeatures(features) {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.prompts.convertFeatures`);
        const i18nCommon = TranslationManager.get(`${I18N__BASE_COMMON}.types.convertable`);

        return Dialog.select({
            title: i18n.title,
            message: i18n.message,
            value: FeatureProperties.type.measurement,
            options: [
                {
                    text: i18nCommon.drawing,
                    value: FeatureProperties.type.drawing
                }, {
                    text: i18nCommon.measurement,
                    value: FeatureProperties.type.measurement
                }
            ],
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                this.doConvertFeatures(features, result);
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doPushFeatureStyle(feature) {
        const featureId = getUid(feature);
        this.originalFeatureStyles[featureId] = feature.getStyle();
    }

    doPopFeatureStyle(feature) {
        const featureId = getUid(feature);
        feature.setStyle(this.originalFeatureStyles[featureId]);
        delete this.originalFeatureStyles[featureId];
    }

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
        const feature = event.element;
        this.doPushFeatureStyle(feature);

        // Note: 
        // @Consumer callback
        if(this.options.onSelectAdd) {
            this.options.onSelectAdd(event);
        }
    }

    doSelectFeatureRemove(event) {
        const feature = event.element;

        // Note: 
        // The setTimeout must be used
        // If not, the style will be reset to the style used before the feature was selected
        feature && window.setTimeout(() => {
            if(!this.colorHasChanged) {
                return;
            }

            // Set the lastStyle as the default style
            feature.setStyle(this.lastStyle);

            if(FeatureManager.isMeasurementType(feature)) {
                // To add lineDash, a new Style object must be used
                // If the lastStyle is used all object that is referenced with that object will get a dashed line
                // TODO:
                // This should be a method in the style-manager to convert
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
            if(this.options.onStyleChange) {
                this.options.onStyleChange(event, this.lastStyle);
            }

            // Reset for the last deselected item
            if(event.index === 0) {
                this.colorHasChanged = false;
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onSelectRemove) {
            this.options.onSelectRemove(event);
        }
    }

    doModifyStart(event) {
        const features = event.features || [];
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.attachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onModifyStart) {
            this.options.onModifyStart(event);
        }
    }

    doModifyEnd(event) {
        const features = event.features || [];
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.detachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onModifyEnd) {
            this.options.onModifyEnd(event);
        }
    }

    doTranslateStart(event) {
        const features = event.features || [];
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.attachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onTranslateStart) {
            this.options.onTranslateStart(event);
        }
    }

    doTranslateEnd(event) {
        const features = event.features || [];
        features.forEach((feature) => {
            if(FeatureManager.hasTooltip(feature)) {
                this.detachOnChange(feature);
            }
        });

        // Note: 
        // @Consumer callback
        if(this.options.onTranslateEnd) {
            this.options.onTranslateEnd(event);
        }
    }

    doSnap(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onSnapped) {
            this.options.onSnapped(event);
        }
    }

    doUnSnap(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onUnSnapped) {
            this.options.onUnSnapped(event);
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
        try {
            const a = features[0];
            const b = features[1];

            const aGeometry = this.parser.read(a.getGeometry());
            const bGeometry = this.parser.read(b.getGeometry());

            const shape = operation(aGeometry, bGeometry);
            const shapedFeature = new Feature({
                geometry: new Polygon(this.parser.write(shape).getCoordinates()),
            });

            if(FeatureManager.isMeasurementType(a) || FeatureManager.isMeasurementType(b)) {
                FeatureManager.applyMeasurementProperties(shapedFeature);
                shapedFeature.setStyle(StyleManager.getDefaultMeasurementStyle());
            }else {
                shapedFeature.setStyle(StyleManager.getDefaultDrawingStyle());
            }

            const layerWrapper = LayerManager.getActiveFeatureLayer();
            LayerManager.addFeatureToLayer(shapedFeature, layerWrapper);

            this.doDeleteFeatures(features);

            // Note: 
            // @Consumer callback
            if(this.options.onShapeOperation) {
                this.options.onShapeOperation(type, a, b, shapedFeature);
            }
        }catch(error) {
            LogManager.logError(FILENAME, 'onShapeOperator', {
                message: 'Failed to perform shape operation',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.operationFailed`
            }); 

            // Note: 
            // @Consumer callback
            if(this.options.onError) {
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
        this.#deleteFeatures(features);

        // Note: 
        // @Consumer callback
        if(this.options.onRemovedFeatures) {
            this.options.onRemovedFeatures(features);
        }
    }

    doRotateFeatures(features, rotation) {
        const radians = ConversionManager.degreesToRadians(rotation);
        
        features.forEach((feature) => {
            const geometry = feature.getGeometry();
            const center = getCenter(geometry.getExtent());
            geometry.rotate(radians, center);
        });
    }

    doCutFeatures(features) {
        features.forEach((feature) => {
            const clonedFeature = FeatureManager.deepCopyVectorFeatureWithStyle(feature, this.originalFeatureStyles);
            this.featureClipboard.push(clonedFeature);
        });

        this.#deleteFeatures(features);

        Toast.info({
            prefix: features.length,
            i18nKey: `${I18N__BASE}.toasts.infos.cutFeatures`,
            autoremove: true
        });

        // Note: 
        // @Consumer callback
        if(this.options.onCutFeatures) {
            this.options.onCutFeatures(features);
        }
    }

    doCopyFeatures(features) {
        features.forEach((feature) => {
            const clonedFeature = FeatureManager.deepCopyVectorFeatureWithStyle(feature, this.originalFeatureStyles);
            this.featureClipboard.push(clonedFeature);
        });

        Toast.info({
            prefix: features.length,
            i18nKey: `${I18N__BASE}.toasts.infos.copiedFeatures`,
            autoremove: true
        });

        // Note: 
        // @Consumer callback
        if(this.options.onCopyFeatures) {
            this.options.onCopyFeatures(features);
        }
    }

    doPasteFeatures() {
        const copies = [...this.featureClipboard];
        this.featureClipboard = [];

        const layerWrapper = LayerManager.getActiveFeatureLayer();
        copies.forEach((feature) => {
            LayerManager.addFeatureToLayer(feature, layerWrapper);
        });

        Toast.info({
            prefix: copies.length,
            i18nKey: `${I18N__BASE}.toasts.infos.pastedFeatures`,
            autoremove: true
        });

        // Note: 
        // @Consumer callback
        if(this.options.onPasteFeatures) {
            this.options.onPasteFeatures(copies, layerWrapper);
        }
    }

    doAddSelectedFeature(feature) {
        this.interactionSelect.getFeatures().push(feature);
    }

    doRemoveSelectedFeature(feature) {
        this.interactionSelect.getFeatures().remove(feature);
    }

    doClearSelectedFeatures() {
        this.interactionSelect.getFeatures().clear();
    }

    doConvertFeatures(features, format) {
        this.doClearSelectedFeatures();
        FeatureManager.convertFeaturesTo(features, format.to);
    }

    doShowFeatureInfo(feature) {
        // TODO:
        // Why is the [0] on the coordiantes required?
        const featureId = getUid(feature);
        const geometry = feature.getGeometry();
        const measurement = getMeasureValue(geometry);
        const coordinates = geometry.getCoordinates()[0];
        const vertices = coordinates.length;

        const indentation = 4;
        const coordinatesText = JSON.stringify(
            JSON.decycle(coordinates),
            jsonReplacer, 
            indentation
        );

        const oltb = DefaultConfig.toolbar.id;
        const properties = feature.get(oltb);
        const propertiesText = JSON.stringify(
            JSON.decycle(properties),
            jsonReplacer, 
            indentation
        );

        // Note:
        // The data properties are used as keys in the translation-files
        const options = {
            data: {
                id: featureId,
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
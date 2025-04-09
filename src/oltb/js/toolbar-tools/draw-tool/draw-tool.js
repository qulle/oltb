import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Draw } from 'ol/interaction';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { Settings } from '../../browser-constants/settings';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { DefaultConfig } from '../../toolbar-managers/config-manager/default-config';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { FeatureProperties } from '../../ol-helpers/feature-properties';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { LinearRing, Polygon } from 'ol/geom';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';
import { isFeatureIntersectable } from '../../ol-helpers/is-feature-intersectable';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { GeometryType, instantiateGeometry } from '../../ol-mappers/ol-geometry/ol-geometry';

const FILENAME = 'draw-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-draw';
const I18N__BASE = 'tools.drawTool';
const I18N__BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    circleSize: 5,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStart: undefined,
    onEnd: undefined,
    onAbort: undefined,
    onError: undefined,
    onIntersected: undefined,
    onSnapped: undefined,
    onUnSnapped: undefined
});

const LocalStorageNodeName = LocalStorageKeys.drawTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    isCollapsed: false,
    toolType: GeometryType.Polygon,
    strokeWidth: '2.5',
    strokeColor: '#0166A5FF',
    fillColor: '#D7E3FA80'
});

/**
 * About:
 * Draw objects on the Map
 * 
 * Description:
 * Draw Circles, Squares, Rectangles, Lines, Points and Polygons. Ability to draw with different styles and colors.
 */
class DrawTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.vectorPen.mixed,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.drawTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.drawTool})`,
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
        this.intersectedFeatures = [];
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.#initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.#initToggleables();

        this.uiRefToolType = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-type`);
        this.uiRefToolType.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefIntersectionEnable = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-intersection-enable`);
        this.uiRefIntersectionEnable.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefFillColor = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-fill-color`);
        this.uiRefFillColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        this.uiRefStrokeWidth = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-stroke-width`);
        this.uiRefStrokeWidth.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefStrokeColor = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-stroke-color`);
        this.uiRefStrokeColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        this.#initDefaultValues();
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
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.draw">${i18n.titles.draw}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID__PREFIX}-type" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.title">${i18n.groups.shapes.title}</label>
                        <select id="${ID__PREFIX}-type" class="oltb-select">
                            <option value="Circle" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.circle">${i18n.groups.shapes.circle}</option>
                            <option value="Square" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.square">${i18n.groups.shapes.square}</option>
                            <option value="Rectangle" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.rectangle">${i18n.groups.shapes.rectangle}</option>
                            <option value="LineString" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.lineString">${i18n.groups.shapes.lineString}</option>
                            <option value="Point" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.point">${i18n.groups.shapes.point}</option>
                            <option value="Polygon" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.polygon">${i18n.groups.shapes.polygon}</option>
                        </select>
                    </div>
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                        <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID__PREFIX}-intersection-enable" data-oltb-i18n="${I18N__BASE}.toolbox.groups.intersectable.title">${i18n.groups.intersectable.title}</label>
                            <select id="${ID__PREFIX}-intersection-enable" class="oltb-select">
                                <option value="false" data-oltb-i18n="${I18N__BASE}.toolbox.groups.intersectable.false">${i18n.groups.intersectable.false}</option>
                                <option value="true" data-oltb-i18n="${I18N__BASE}.toolbox.groups.intersectable.true">${i18n.groups.intersectable.true}</option>
                            </select>
                        </div>
                        <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID__PREFIX}-stroke-width" data-oltb-i18n="${I18N__BASE}.toolbox.groups.strokeWidth.title">${i18n.groups.strokeWidth.title}</label>
                            <select id="${ID__PREFIX}-stroke-width" class="oltb-select">
                                <option value="1">1</option>
                                <option value="1.25">1.25</option>
                                <option value="1.5">1.5</option>
                                <option value="2">2</option>
                                <option value="2.5">2.5</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                            </select>
                        </div>
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

    #initDefaultValues() {
        this.uiRefToolType.value = this.localStorage.toolType;
        this.uiRefStrokeWidth.value = this.localStorage.strokeWidth;
        this.uiRefIntersectionEnable.value = 'false';
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    activateTool() {
        this.isActive = true;
        this.uiRefToolboxSection.classList.add(`${CLASS__TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS__TOOL_BUTTON}--active`);

        ToolManager.setActiveTool(this);

        if(this.shouldAlwaysCreateNewLayer()) {
            LayerManager.addFeatureLayer({
                name: TranslationManager.get(`${I18N__BASE}.layers.defaultName`)
            });
        }

        // Important:
        // Triggers activation of the tool
        EventManager.dispatchEvent([this.uiRefToolType], Events.browser.change);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        this.uiRefToolboxSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end', 
            inline: 'nearest' 
        });
    }

    deactivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS__TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);

        this.doRemoveDrawInteraction();
        ToolManager.removeActiveTool();
        SnapManager.removeSnap();

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deselectTool() {
        this.deactivateTool();
    }

    updateTool() {
        // Note: 
        // Remember options until next time
        this.localStorage.toolType = this.uiRefToolType.value;
        this.localStorage.strokeWidth = this.uiRefStrokeWidth.value;
        this.localStorage.fillColor = this.uiRefFillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeColor = this.uiRefStrokeColor.getAttribute('data-oltb-color');

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // Note: 
        // IntersectionMode doesn't play well when tool is LineString or Point
        if(this.isIntersectionModeAvailable()) {
            this.uiRefIntersectionEnable.value = 'false';
            this.uiRefIntersectionEnable.disabled = true;
        }else {
            this.uiRefIntersectionEnable.disabled = false;
        }

        this.doUpdateTool(
            this.uiRefToolType.value,
            this.uiRefStrokeWidth.value,
            this.uiRefFillColor.getAttribute('data-oltb-color'),
            this.uiRefStrokeColor.getAttribute('data-oltb-color')
        );
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
        const key = event.key;

        if(key === KeyboardKeys.valueEscape) {
            if(this.interactionDraw) {
                this.interactionDraw.abortDrawing();
            }
        }else if(event.ctrlKey && key === KeyboardKeys.valueZ) {
            if(this.interactionDraw) {
                this.interactionDraw.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.drawTool)) {
            this.onClickTool(event);
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

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }

    #onDrawStart(event) {
        this.doDrawStart(event);
    }

    #onDrawEnd(event) {
        this.doDrawEnd(event);
    }

    #onDrawAbort(event) {
        this.doDrawAbort(event);
    }

    #onDrawError(event) {
        this.doDrawError(event);
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
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    shouldAlwaysCreateNewLayer() {
        return SettingsManager.getSetting(Settings.alwaysNewLayers);
    }

    isIntersectionModeAvailable() {
        return this.uiRefToolType.value === GeometryType.LineString || this.uiRefToolType.value === GeometryType.Point;
    }

    isIntersectionEnabled() {
        return this.uiRefIntersectionEnable.value.toLowerCase() === 'true';
    }

    //--------------------------------------------------------------------
    // # Section: Generator Helpers
    //--------------------------------------------------------------------
    #generateOLInteractionDraw(type, geometryFunction) {
        return new Draw({
            type: type,
            style: this.style,
            stopClick: true,
            geometryFunction: geometryFunction
        });
    }

    #generateOLStyleObject(strokeWidth, fillColor, strokeColor) {
        return new Style({
            image: new Circle({
                fill: new Fill({
                    color: fillColor
                }),
                stroke: new Stroke({
                    color: strokeColor,
                    width: strokeWidth
                }),
                radius: this.options.circleSize
            }),
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                width: strokeWidth
            })
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

    doDrawStart(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onStart) {
            this.options.onStart(event);
        }
    }

    doDrawEnd(event) {
        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: TranslationManager.get(`${I18N__BASE}.layers.defaultName`)
        });

        if(this.isIntersectionEnabled()) {
            this.doDrawEndIntersection(event);
        }else {
            this.doDrawEndNormal(layerWrapper, event);
        }
    }

    doDrawEndNormal(layerWrapper, event) {
        const feature = event.feature;
        
        if(feature) {
            feature.setStyle(this.style);
            feature.setProperties({
                oltb: {
                    type: FeatureProperties.type.drawing
                }
            });

            LayerManager.addFeatureToLayer(feature, layerWrapper, `${I18N__BASE}.toasts.infos.drawInHiddenLayer`);
        }

        // Note: 
        // @Consumer callback
        if(this.options.onEnd) {
            this.options.onEnd(event);
        }
    }

    doDrawEndIntersection(event) {
        const feature = event.feature;
        const featureGeometry = feature.getGeometry();

        // Note: 
        // Must search all layers thus features from different layers can be targeted
        const oltb = DefaultConfig.toolbar.id;
        const layerWrappers = LayerManager.getFeatureLayers();
        layerWrappers.forEach((layerWrapper) => {
            const layer = layerWrapper.getLayer();

            if(!layer.getVisible()) {
                return;
            }

            const source = layer.getSource();
            source.forEachFeatureIntersectingExtent(featureGeometry.getExtent(), (intersectedFeature) => {
                const type = intersectedFeature.getProperties(oltb)?.type;
                const geometry = intersectedFeature.getGeometry();
    
                if(isFeatureIntersectable(type, geometry)) {
                    this.intersectedFeatures.push(intersectedFeature);
                }
            });
        });

        this.intersectedFeatures.forEach((intersected) => {
            const coordinates = intersected.getGeometry().getCoordinates();
            const geometry = new Polygon(coordinates.slice(0, coordinates.length));
            const linearRing = new LinearRing(featureGeometry.getCoordinates()[0]);

            geometry.appendLinearRing(linearRing);
            intersected.setGeometry(geometry);
        });

        if(this.intersectedFeatures.length === 0) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.missingIntersections`,
                autoremove: true
            });
        }

        // Note: 
        // @Consumer callback
        if(this.options.onIntersected) {
            this.options.onIntersected(event, this.intersectedFeatures);
        }

        this.intersectedFeatures = [];
    }

    doDrawAbort(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onAbort) {
            this.options.onAbort(event);
        }
    }

    doDrawError(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onError) {
            this.options.onError(event);
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

    doClearColors() {
        this.uiRefFillColor.setAttribute('data-oltb-color', this.localStorage.fillColor);
        this.uiRefFillColor.firstElementChild.style.backgroundColor = this.localStorage.fillColor;

        this.uiRefStrokeColor.setAttribute('data-oltb-color', this.localStorage.strokeColor);
        this.uiRefStrokeColor.firstElementChild.style.backgroundColor = this.localStorage.strokeColor;
    }

    doUpdateTool(toolType, strokeWidth, fillColor, strokeColor) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Note: 
        // Remove previous interaction if tool is changed
        if(this.interactionDraw) {
            this.doRemoveDrawInteraction();
            SnapManager.removeSnap();
        }

        this.style = this.#generateOLStyleObject(strokeWidth, fillColor, strokeColor);

        const [ geometryType, geometryFunction ] = instantiateGeometry(toolType);
        this.interactionDraw = this.#generateOLInteractionDraw(geometryType, geometryFunction);

        this.interactionDraw.on(Events.openLayers.drawStart, this.#onDrawStart.bind(this));
        this.interactionDraw.on(Events.openLayers.drawEnd, this.#onDrawEnd.bind(this));
        this.interactionDraw.on(Events.openLayers.drawAbort, this.#onDrawAbort.bind(this));
        this.interactionDraw.on(Events.openLayers.error, this.#onDrawError.bind(this));

        // Note: 
        // The Snap interaction must be added last
        this.doAddDrawInteraction();
        SnapManager.addSnap(this);
    }

    doAddDrawInteraction() {
        this.getMap().addInteraction(this.interactionDraw);
    }

    doRemoveDrawInteraction() {
        this.getMap().removeInteraction(this.interactionDraw);
    }
}

export { DrawTool };
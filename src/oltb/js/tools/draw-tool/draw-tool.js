import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { Draw } from 'ol/interaction';
import { Keys } from '../../helpers/constants/Keys';
import { Toast } from '../../common/Toast';
import { Events } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { Settings } from '../../helpers/constants/Settings';
import { LogManager } from '../managers/LogManager';
import { ToolManager } from '../managers/ToolManager';
import { SnapManager } from '../managers/SnapManager';
import { GeometryType } from '../../ol-mappers/GeometryType';
import { StateManager } from '../managers/StateManager';
import { LayerManager } from '../managers/LayerManager';
import { ShortcutKeys } from '../../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { DefaultConfig } from '../managers/config-manager/DefaultConfig';
import { ElementManager } from '../managers/ElementManager';
import { SettingsManager } from '../managers/SettingsManager';
import { eventDispatcher } from '../../helpers/browser/EventDispatcher';
import { LocalStorageKeys } from '../../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../../helpers/constants/FeatureProperties';
import { TranslationManager } from '../managers/TranslationManager';
import { LinearRing, Polygon } from 'ol/geom';
import { isFeatureIntersectable } from '../../helpers/IsFeatureIntersectable';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { createBox, createRegularPolygon } from 'ol/interaction/Draw';

const FILENAME = 'tools/DrawTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-draw';
const I18N_BASE = 'tools.drawTool';
const I18N_BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStart: undefined,
    onEnd: undefined,
    onAbort: undefined,
    onError: undefined,
    onIntersected: undefined,
    onSnapped: undefined
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
class DrawTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.vectorPen.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.drawTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.drawTool})`,
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
        this.intersectedFeatures = [];
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();

        this.uiRefToolType = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-type`);
        this.uiRefToolType.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefIntersectionEnable = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-intersection-enable`);
        this.uiRefIntersectionEnable.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefFillColor = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-fill-color`);
        this.uiRefFillColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        this.uiRefStrokeWidth = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-stroke-width`);
        this.uiRefStrokeWidth.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefStrokeColor = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.uiRefStrokeColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        // Set default selected values
        this.uiRefToolType.value = this.localStorage.toolType;
        this.uiRefStrokeWidth.value = this.localStorage.strokeWidth;
        this.uiRefIntersectionEnable.value = 'false';

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

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initToolboxHTML() {
        const i18n = TranslationManager.get(`${I18N_BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);

        const html = (`
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.draw">${i18n.titles.draw}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-type" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.title">${i18n.groups.shapes.title}</label>
                        <select id="${ID_PREFIX}-type" class="oltb-select">
                            <option value="Circle" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.circle">${i18n.groups.shapes.circle}</option>
                            <option value="Square" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.square">${i18n.groups.shapes.square}</option>
                            <option value="Rectangle" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.rectangle">${i18n.groups.shapes.rectangle}</option>
                            <option value="LineString" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.lineString">${i18n.groups.shapes.lineString}</option>
                            <option value="Point" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.point">${i18n.groups.shapes.point}</option>
                            <option value="Polygon" data-oltb-i18n="${I18N_BASE}.toolbox.groups.shapes.polygon">${i18n.groups.shapes.polygon}</option>
                        </select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group ${CLASS_TOOLBOX_SECTION}__group--split-group">
                        <div class="${CLASS_TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID_PREFIX}-intersection-enable" data-oltb-i18n="${I18N_BASE}.toolbox.groups.intersectable.title">${i18n.groups.intersectable.title}</label>
                            <select id="${ID_PREFIX}-intersection-enable" class="oltb-select">
                                <option value="false" data-oltb-i18n="${I18N_BASE}.toolbox.groups.intersectable.false">${i18n.groups.intersectable.false}</option>
                                <option value="true" data-oltb-i18n="${I18N_BASE}.toolbox.groups.intersectable.true">${i18n.groups.intersectable.true}</option>
                            </select>
                        </div>
                        <div class="${CLASS_TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID_PREFIX}-stroke-width" data-oltb-i18n="${I18N_BASE}.toolbox.groups.strokeWidth.title">${i18n.groups.strokeWidth.title}</label>
                            <select id="${ID_PREFIX}-stroke-width" class="oltb-select">
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
        this.isActive = true;
        this.uiRefToolboxSection.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        ToolManager.setActiveTool(this);

        if(this.shouldAlwaysCreateNewLayer()) {
            LayerManager.addFeatureLayer({
                name: TranslationManager.get(`${I18N_BASE}.layers.defaultName`)
            });
        }

        // Triggers activation of the tool
        eventDispatcher([this.uiRefToolType], Events.browser.change);

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
        this.uiRefToolboxSection.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

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
    onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        const key = event.key;

        if(key === Keys.valueEscape) {
            if(this.interactionDraw) {
                this.interactionDraw.abortDrawing();
            }
        }else if(event.ctrlKey && key === Keys.valueZ) {
            if(this.interactionDraw) {
                this.interactionDraw.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.drawTool)) {
            this.onClickTool(event);
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
        if(this.options.onBrowserStateClear instanceof Function) {
            this.options.onBrowserStateClear();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }

    onDrawStart(event) {
        this.doDrawStart(event);
    }

    onDrawEnd(event) {
        this.doDrawEnd(event);
    }

    onDrawAbort(event) {
        this.doDrawAbort(event);
    }

    onDrawError(event) {
        this.doDrawError(event);
    }

    onSnap(event) {
        this.doSnap(event);
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
    generateOLInteractionDraw(type, geometryFunction) {
        return new Draw({
            type: type,
            style: this.style,
            stopClick: true,
            geometryFunction: geometryFunction
        });
    }

    generateOLStyleObject(strokeWidth, fillColor, strokeColor) {
        return new Style({
            image: new Circle({
                fill: new Fill({
                    color: fillColor
                }),
                stroke: new Stroke({
                    color: strokeColor,
                    width: strokeWidth
                }),
                radius: 5
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
        if(this.options.onStart instanceof Function) {
            this.options.onStart(event);
        }
    }

    doDrawEnd(event) {
        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: TranslationManager.get(`${I18N_BASE}.layers.defaultName`)
        });

        if(this.isIntersectionEnabled()) {
            this.doDrawEndIntersection(event);
        }else {
            this.doDrawEndNormal(layerWrapper, event);
        }
        
        if(!layerWrapper.getLayer().getVisible()) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.drawInHiddenLayer`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }
    }

    doDrawEndNormal(layerWrapper, event) {
        const feature = event.feature;
        
        feature.setStyle(this.style);
        feature.setProperties({
            oltb: {
                type: FeatureProperties.type.drawing
            }
        });

        LayerManager.addFeatureToLayer(feature, layerWrapper);

        // Note: 
        // @Consumer callback
        if(this.options.onEnd instanceof Function) {
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
                i18nKey: `${I18N_BASE}.toasts.infos.missingIntersections`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }

        // Note: 
        // @Consumer callback
        if(this.options.onIntersected instanceof Function) {
            this.options.onIntersected(event, this.intersectedFeatures);
        }

        this.intersectedFeatures = [];
    }

    doDrawAbort(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onAbort instanceof Function) {
            this.options.onAbort(event);
        }
    }

    doDrawError(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onError instanceof Function) {
            this.options.onError(event);
        }
    }

    doSnap(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onSnapped instanceof Function) {
            this.options.onSnapped(event);
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

        this.style = this.generateOLStyleObject(strokeWidth, fillColor, strokeColor);

        // Note: 
        // A normal circle can not be serialized to json, approximated circle as polygon instead. 
        // Also use circle to create square and rectangle
        let geometryFunction = undefined;

        if(toolType === GeometryType.Square) {
            geometryFunction = createRegularPolygon(4);
            toolType = GeometryType.Circle;
        }else if(toolType === GeometryType.Rectangle) {
            geometryFunction = createBox();
            toolType = GeometryType.Circle;
        }else if(toolType === GeometryType.Circle) {
            geometryFunction = createRegularPolygon(32);
        }

        this.interactionDraw = this.generateOLInteractionDraw(toolType, geometryFunction);

        this.interactionDraw.on(Events.openLayers.drawStart, this.onDrawStart.bind(this));
        this.interactionDraw.on(Events.openLayers.drawEnd, this.onDrawEnd.bind(this));
        this.interactionDraw.on(Events.openLayers.drawAbort, this.onDrawAbort.bind(this));
        this.interactionDraw.on(Events.openLayers.error, this.onDrawError.bind(this));

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
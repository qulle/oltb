import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Draw } from 'ol/interaction';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../helpers/constants/Settings';
import { LogManager } from '../managers/LogManager';
import { ToolManager } from '../managers/ToolManager';
import { SnapManager } from '../managers/SnapManager';
import { GeometryType } from '../ol-types/GeometryType';
import { LayerManager } from '../managers/LayerManager';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { TooltipManager } from '../managers/TooltipManager';
import { createUITooltip } from '../creators/CreateUITooltip';
import { SettingsManager } from '../managers/SettingsManager';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { TranslationManager } from '../managers/TranslationManager';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { getMeasureCoordinates, getMeasureValue } from '../helpers/Measurements';

const FILENAME = 'tools/MeasureTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-measure';
const KEY_TOOLTIP = 'tools.measureTool';
const I18N_BASE = 'tools.measureTool';
const I18N_BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStart: undefined,
    onEnd: undefined,
    onAbort: undefined,
    onError: undefined,
    onSnapped: undefined
});

const LocalStorageNodeName = LocalStorageKeys.measureTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    isCollapsed: false,
    toolType: GeometryType.LineString,
    strokeColor: '#3B4352FF',
    fillColor: '#D7E3FA80'
});

/**
 * About:
 * Measure distances and areas
 * 
 * Description:
 * Measure distances and areas in metric scale. 
 * These objects can be edited and merged using the Edit tool.
 */
class MeasureTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.rulers.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.measureTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.measureTool})`,
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

        this.initToolboxHTML();
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();

        this.uiRefToolType = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-type`);
        this.uiRefToolType.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefFillColor = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-fill-color`);
        this.uiRefFillColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        this.uiRefStrokeColor = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.uiRefStrokeColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        // Set default selected values
        this.uiRefToolType.value = this.localStorage.toolType; 

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
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.measure">${i18n.titles.measure}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-type" data-oltb-i18n="${I18N_BASE}.toolbox.groups.type.title">${i18n.groups.type.title}</label>
                        <select id="${ID_PREFIX}-type" class="oltb-select">
                            <option value="LineString" data-oltb-i18n="${I18N_BASE}.toolbox.groups.type.lineString">${i18n.groups.type.lineString}</option>
                            <option value="Polygon" data-oltb-i18n="${I18N_BASE}.toolbox.groups.type.polygon">${i18n.groups.type.polygon}</option>
                        </select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-stroke-color" data-oltb-i18n="${I18N_BASE}.toolbox.groups.strokeColor.title">${i18n.groups.strokeColor.title}</label>
                        <div id="${ID_PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-fill-color" data-oltb-i18n="${I18N_BASE}.toolbox.groups.fillColor.title">${i18n.groups.fillColor.title}</label>
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

        ToolManager.setActiveTool(this);

        if(this.shouldAlwaysCreateNewLayer()) {
            LayerManager.addFeatureLayer({
                name: TranslationManager.get(`${I18N_BASE}.layers.defaultName`)
            });
        }

        // Triggers activation of the measure tool
        eventDispatcher([this.uiRefToolType], Events.browser.change);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
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
        this.localStorage.fillColor = this.uiRefFillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeColor = this.uiRefStrokeColor.getAttribute('data-oltb-color');

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        this.doUpdateTool(
            this.uiRefToolType.value,
            this.uiRefFillColor.getAttribute('data-oltb-color'),
            this.uiRefStrokeColor.getAttribute('data-oltb-color')
        );
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
        const key = event.key;

        if(key === Keys.valueEscape) {
            if(this.interactionDraw) {
                this.interactionDraw.abortDrawing();
            }
        }else if(event.ctrlKey && key === Keys.valueZ) {
            if(this.interactionDraw) {
                this.interactionDraw.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.measureTool)) {
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
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

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

    // -------------------------------------------------------------------
    // # Section: Conversions/Validation
    // -------------------------------------------------------------------

    shouldAlwaysCreateNewLayer() {
        return SettingsManager.getSetting(Settings.alwaysNewLayers);
    }

    // -------------------------------------------------------------------
    // # Section: Generator Helpers
    // -------------------------------------------------------------------

    generateOLInteractionDraw(type) {
        return new Draw({
            type: type,
            stopClick: true,
            style: this.styles
        });
    }

    generateOLStyleObject(fillColor, strokeColor) {
        return new Style({
            image: new Circle({
                fill: new Fill({
                    color: fillColor
                }),
                stroke: new Stroke({
                    color: strokeColor,
                    width: 2
                }),
                radius: 5
            }),
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                lineDash: [2, 5],
                width: 2.5
            })
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doToggleToolboxSection(targetName) {
        const targetNode = document.getElementById(targetName);
        const duration = ConfigManager.getConfig().animationDuration.fast;

        targetNode?.slideToggle(duration, (collapsed) => {
            this.localStorage.isCollapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    doDrawStart(event) {
        const feature = event.feature;
        const tooltipItem = TooltipManager.push(KEY_TOOLTIP);
        
        this.onChangeListener = feature.getGeometry().on(Events.openLayers.change, (event) => {
            const measureValue = getMeasureValue(event.target);
            tooltipItem.innerHTML = `${measureValue.value} ${measureValue.unit}`;
        });

        // Note: 
        // @Consumer callback
        if(this.options.onStart instanceof Function) {
            this.options.onStart(event);
        }   
    }

    doDrawEnd(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        unByKey(this.onChangeListener);

        const feature = event.feature;
        feature.setStyle(this.styles);
        
        TooltipManager.pop(KEY_TOOLTIP);
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

        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: TranslationManager.get(`${I18N_BASE}.layers.defaultName`)
        });
        
        LayerManager.addFeatureToLayer(feature, layerWrapper);
        const layer = layerWrapper.getLayer();
        
        if(!layer.getVisible()) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.drawInHiddenLayer`, 
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }

        map.addOverlay(tooltip.getOverlay());

        // The layer might be hidden, check if the tooltip also should be hidden
        if(layer.getVisible()) {
            tooltip.getOverlay().setMap(map);
        }else {
            tooltip.getOverlay().setMap(null);
        }

        // Note: 
        // @Consumer callback
        if(this.options.onEnd instanceof Function) {
            this.options.onEnd(event);
        }
    }

    doDrawAbort(event) {
        unByKey(this.onChangeListener);
        
        TooltipManager.pop(KEY_TOOLTIP);

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

    doUpdateTool(toolType, fillColor, strokeColor) {
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
        
        this.styles = this.generateOLStyleObject(fillColor, strokeColor);
        this.interactionDraw = this.generateOLInteractionDraw(toolType);

        this.interactionDraw.on(Events.openLayers.drawStart, this.onDrawStart.bind(this));
        this.interactionDraw.on(Events.openLayers.drawEnd, this.onDrawEnd.bind(this));
        this.interactionDraw.on(Events.openLayers.drawAbort, this.onDrawAbort.bind(this));
        this.interactionDraw.on(Events.openLayers.error, this.onDrawEnd.bind(this));

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

export { MeasureTool };
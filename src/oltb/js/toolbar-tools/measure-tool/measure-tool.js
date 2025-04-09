import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Draw } from 'ol/interaction';
import { Events } from '../../browser-constants/events';
import { unByKey } from 'ol/Observable';
import { BaseTool } from '../base-tool';
import { Settings } from '../../browser-constants/settings';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { GeometryType } from '../../ol-mappers/ol-geometry/ol-geometry';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TooltipManager } from '../../toolbar-managers/tooltip-manager/tooltip-manager';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { getMeasureValue } from '../../ol-helpers/geometry-measurements';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';
import { Fill, Stroke, Circle, Style } from 'ol/style';

const FILENAME = 'measure-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-measure';
const KEY__TOOLTIP = 'tools.measureTool';
const I18N__BASE = 'tools.measureTool';
const I18N__BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStart: undefined,
    onEnd: undefined,
    onAbort: undefined,
    onError: undefined,
    onSnapped: undefined,
    onUnSnapped: undefined
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
class MeasureTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.rulers.mixed,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.measureTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.measureTool})`,
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

        this.#initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.#initToggleables();

        this.uiRefToolType = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-type`);
        this.uiRefToolType.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefFillColor = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-fill-color`);
        this.uiRefFillColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

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
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.measure">${i18n.titles.measure}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID__PREFIX}-type" data-oltb-i18n="${I18N__BASE}.toolbox.groups.type.title">${i18n.groups.type.title}</label>
                        <select id="${ID__PREFIX}-type" class="oltb-select">
                            <option value="LineString" data-oltb-i18n="${I18N__BASE}.toolbox.groups.type.lineString">${i18n.groups.type.lineString}</option>
                            <option value="Polygon" data-oltb-i18n="${I18N__BASE}.toolbox.groups.type.polygon">${i18n.groups.type.polygon}</option>
                        </select>
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
        this.localStorage.fillColor = this.uiRefFillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeColor = this.uiRefStrokeColor.getAttribute('data-oltb-color');

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        this.doUpdateTool(
            this.uiRefToolType.value,
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
        }else if(isShortcutKeyOnly(event, ShortcutKeys.measureTool)) {
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

    //--------------------------------------------------------------------
    // # Section: Generator Helpers
    //--------------------------------------------------------------------
    #generateOLInteractionDraw(type) {
        return new Draw({
            type: type,
            stopClick: true,
            style: this.styles
        });
    }

    #generateOLStyleObject(fillColor, strokeColor) {
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
        const feature = event.feature;
        const tooltipItem = TooltipManager.push(KEY__TOOLTIP);
        
        if(feature) {
            this.onChangeListener = feature.getGeometry().on(Events.openLayers.change, (event) => {
                const measureValue = getMeasureValue(event.target);
                tooltipItem.innerHTML = `${measureValue.value} ${measureValue.unit}`;
            });
        }

        // Note: 
        // @Consumer callback
        if(this.options.onStart) {
            this.options.onStart(event);
        }   
    }

    doDrawEnd(event) {
        unByKey(this.onChangeListener);
        const feature = event.feature;

        if(feature) {
            TooltipManager.pop(KEY__TOOLTIP);
            FeatureManager.applyMeasurementProperties(feature);
            feature.setStyle(this.styles);

            const layerWrapper = LayerManager.getActiveFeatureLayer({
                fallback: TranslationManager.get(`${I18N__BASE}.layers.defaultName`)
            });
            
            LayerManager.addFeatureToLayer(feature, layerWrapper, `${I18N__BASE}.toasts.infos.drawInHiddenLayer`);
        }

        // Note: 
        // @Consumer callback
        if(this.options.onEnd) {
            this.options.onEnd(event);
        }
    }

    doDrawAbort(event) {
        unByKey(this.onChangeListener);
        TooltipManager.pop(KEY__TOOLTIP);

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
        
        this.styles = this.#generateOLStyleObject(fillColor, strokeColor);
        this.interactionDraw = this.#generateOLInteractionDraw(toolType);

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

export { MeasureTool };
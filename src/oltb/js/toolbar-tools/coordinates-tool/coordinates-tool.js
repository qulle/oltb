import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from '../../common/toasts/toast';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../../helpers/constants/settings';
import { transform } from 'ol/proj';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ToolManager } from '../../managers/tool-manager/tool-manager';
import { toStringHDMS } from 'ol/coordinate';
import { StateManager } from '../../managers/state-manager/state-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ConfigManager } from '../../managers/config-manager/config-manager';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { TooltipManager } from '../../managers/tooltip-manager/tooltip-manager';
import { SettingsManager } from '../../managers/settings-manager/settings-manager';
import { copyToClipboard } from '../../helpers/browser/copy-to-clipboard';
import { LocalStorageKeys } from '../../helpers/constants/local-storage-keys';
import { ProjectionManager } from '../../managers/projection-manager/projection-manager';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'coordinates-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-coordinates';
const KEY__TOOLTIP = 'tools.coordinatesTool';
const FORMAT_DECIMAL_DEGREES = 'DD';
const FORMAT_DEGREE_MINUTES_SECONDS = 'DMS';
const I18N__BASE = 'tools.coordinatesTool';
const I18N__BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onMapClicked: undefined,
    onBrowserStateCleared: undefined
});

const LocalStorageNodeName = LocalStorageKeys.coordinatesTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    coordinatesFormat: FORMAT_DECIMAL_DEGREES
});

/**
 * About:
 * Display and copy Coordinates
 * 
 * Description:
 * The coordinates are shown in a Tooltip and in the Toolbox in all projections that have been registered.
 */
class CoordinatesTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        const icon = getSvgIcon({
            path: SvgPaths.crosshair.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.coordinatesTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.coordinatesTool})`,
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
        this.tooltipItem = undefined;
        this.projections = new Map();
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.initToggleables();
        this.initSettings();

        this.uiRefCoordinatesTable = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-table`);
        
        this.uiRefCoordinatesFormat = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-format`);
        this.uiRefCoordinatesFormat.value = this.localStorage.coordinatesFormat;
        this.uiRefCoordinatesFormat.addEventListener(Events.browser.change, this.onCoordinatesFormatChange.bind(this));

        window.addEventListener(Events.browser.keyDown, this.onWindowKeyDown.bind(this));
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
        const i18n = TranslationManager.get(`${I18N__BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
        
        const html = (`
            <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
                <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.coordinates">${i18n.titles.coordinates}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID__PREFIX}-format" data-oltb-i18n="${I18N__BASE}.toolbox.groups.formats.title">${i18n.groups.formats.title}</label>
                        <select id="${ID__PREFIX}-format" class="oltb-select">
                            <option value="DD" data-oltb-i18n="${I18N__BASE}.toolbox.groups.formats.dd">${i18n.groups.formats.dd}</option>
                            <option value="DMS" data-oltb-i18n="${I18N__BASE}.toolbox.groups.formats.dms">${i18n.groups.formats.dms}</option>
                        </select>
                    </div>
                    <div class="${CLASS__TOOLBOX_SECTION}__group">
                        <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.coordinates.title">${i18n.groups.coordinates.title} <em>(Lat, Lon)</em></label>
                        <table class="oltb-table oltb-table--horizontal oltb-table--no-background oltb-table--tight-bottom-and-top oltb-mt-05" id="${ID__PREFIX}-table"></table>
                    </div>
                </div>
            </div>
        `);

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', html);
    }

    initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS__TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });
    }

    initSettings() {
        SettingsManager.addSetting(Settings.copyCoordinatesOnClick, {
            state: true, 
            i18nBase: `${I18N__BASE}.settings`,
            i18nKey: 'copyOnClick'
        });

        SettingsManager.addSetting(Settings.updateToolboxCoordinatesOnHover, {
            state: true, 
            i18nBase: `${I18N__BASE}.settings`,
            i18nKey: 'updateToolboxOnHover'
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
        this.createUIProjections();

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
        this.removeUIProjections();

        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS__TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyDown(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.coordinatesTool)) {
            this.onClickTool(event);
        }
    }

    onWindowBrowserStateCleared() {
        this.doClearState();
    
        if(this.isActive) {
            this.deactivateTool();
        }
    
        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }

    onCoordinatesFormatChange() {
        this.localStorage.coordinatesFormat = this.uiRefCoordinatesFormat.value;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    onPointerMove(event) {
        this.doCreateTooltipCoordinates(event);

        if(this.shouldUpdateToolboxCoordinatesOnHover()) {
            this.doCreateToolboxCoordinates(event);
        }
    }

    onMapClick(event) {        
        this.doCopyCoordinates(event);

        if(!this.shouldCopyCoordinatesOnClick()) {
            this.toolboxCoordinates(event);
        }

        const allCoordinates = this.doCreateToolCoordinatesList(event.coordinate);

        // Note: 
        // @Consumer callback
        if(this.options.onMapClicked instanceof Function) {
            this.options.onMapClicked(allCoordinates);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    shouldCopyCoordinatesOnClick() {
        return SettingsManager.getSetting(Settings.copyCoordinatesOnClick);
    }

    shouldUpdateToolboxCoordinatesOnHover() {
        return SettingsManager.getSetting(Settings.updateToolboxCoordinatesOnHover);
    }

    toDecimalDegrees(cell, coordinates) {
        cell.innerHTML = (`
            ${parseFloat(coordinates[1]).toFixed(4)}, 
            ${parseFloat(coordinates[0]).toFixed(4)}
        `);
    }

    toDegreeMinutesSeconds(cell, coordinates) {
        const prettyCoordinates = toStringHDMS(coordinates);
        cell.innerHTML = prettyCoordinates;
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    createUIProjections() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            const projectionRow = DOM.createElement({
                element: 'tr'
            });

            const projectionName = DOM.createElement({
                element: 'th',
                text: projection.name,
                title: projection.code,
                class: 'oltb-tippy'
            });

            DOM.appendChildren(projectionRow, [
                projectionName
            ]);

            const coordinatesRow = DOM.createElement({
                element: 'tr'
            });

            const coordinatesCell = DOM.createElement({
                element: 'td',
                text: '-'
            });

            DOM.appendChildren(coordinatesRow, [
                coordinatesCell
            ]);

            DOM.appendChildren(this.uiRefCoordinatesTable, [
                projectionRow,
                coordinatesRow
            ]);

            this.projections.set(projection.code, coordinatesCell);
        });

        this.tooltipItem = TooltipManager.push(KEY__TOOLTIP);
        this.onPointerMoveListener = map.on(Events.openLayers.pointerMove, this.onPointerMove.bind(this));
        this.onMapClickListener = map.on(Events.browser.click, this.onMapClick.bind(this));
    }

    removeUIProjections() {
        DOM.clearElement(this.uiRefCoordinatesTable);
        TooltipManager.pop(KEY__TOOLTIP);
        
        unByKey(this.onPointerMoveListener);
        unByKey(this.onMapClickListener);
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

    doCreateToolCoordinatesList(coordinates) {
        const projections = ProjectionManager.getProjections();
        const result = [];

        projections.forEach((projection) => {
            const transformedCoordinates = transform(
                coordinates, 
                ConfigManager.getConfig().projection.default, 
                projection.code
            );

            const prettyCoordinates = toStringHDMS(transformedCoordinates);
            result.push({
                code: projection.code,
                name: projection.name,
                coordinates: transformedCoordinates,
                prettyCoordinates: prettyCoordinates
            });
        });

        return result;
    }

    doCreateTooltipCoordinates(event) {
        const projection = ConfigManager.getConfig().projection;
        const coordinates = transform(
            event.coordinate, 
            projection.default, 
            projection.wgs84
        );
        
        const prettyCoordinates = toStringHDMS(coordinates);
        this.tooltipItem.innerHTML = prettyCoordinates;
    }

    doCreateToolboxCoordinates(event) {
        const projections = ProjectionManager.getProjections();

        projections.forEach((projection) => {
            const coordinates = transform(
                event.coordinate, 
                ConfigManager.getConfig().projection.default, 
                projection.code
            );

            const format = this.uiRefCoordinatesFormat.value;
            const cell = this.projections.get(projection.code);

            if(format === FORMAT_DEGREE_MINUTES_SECONDS) {
                this.toDegreeMinutesSeconds(cell, coordinates);
            }else {
                this.toDecimalDegrees(cell, coordinates);
            }
        });
    }

    async doCopyCoordinates(event) {
        if(!this.shouldCopyCoordinatesOnClick() || ToolManager.hasActiveTool()) {
            return;
        }

        const projection = ConfigManager.getConfig().projection;
        const coordinates = transform(
            event.coordinate, 
            projection.default, 
            projection.wgs84
        );

        const prettyCoordinates = toStringHDMS(coordinates);
        
        try {
            await copyToClipboard(prettyCoordinates);

            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.copyCoordinates`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }catch(error) {
            LogManager.logError(FILENAME, 'doCopyCoordinates', {
                message: 'Failed to copy coordinates',
                error: error
            });

            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.copyCoordinates`
            });
        }
    }
}

export { CoordinatesTool };
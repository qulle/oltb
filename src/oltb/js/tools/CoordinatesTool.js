import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../helpers/constants/Settings';
import { transform } from 'ol/proj';
import { LogManager } from '../managers/LogManager';
import { ToolManager } from '../managers/ToolManager';
import { toStringHDMS } from 'ol/coordinate';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { TooltipManager } from '../managers/TooltipManager';
import { SettingsManager } from '../managers/SettingsManager';
import { copyToClipboard } from '../helpers/browser/CopyToClipboard';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { ProjectionManager } from '../managers/ProjectionManager';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/CoordiantesTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-coordinates';
const KEY_TOOLTIP = 'tools.coordinatesTool';
const FORMAT_DECIMAL_DEGREES = 'DD';
const FORMAT_DEGREE_MINUTES_SECONDS = 'DMS';
const I18N_BASE = 'tools.coordinatesTool';
const I18N_BASE_COMMON = 'common';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onMapClicked: undefined
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

        const icon = getIcon({
            path: SvgPaths.crosshair.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.coordinatesTool})`
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
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();
        this.initSettings();

        this.uiRefCoordinatesTable = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-table`);
        
        this.uiRefCoordinatesFormat = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-format`);
        this.uiRefCoordinatesFormat.value = this.localStorage.coordinatesFormat;
        this.uiRefCoordinatesFormat.addEventListener(Events.browser.change, this.onCoordinatesFormatChange.bind(this));

        window.addEventListener(Events.browser.keyDown, this.onWindowKeyDown.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));

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
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.coordinates">${i18n.titles.coordiantes}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-format" data-oltb-i18n="${I18N_BASE}.toolbox.groups.formats.title">${i18n.groups.formats.title}</label>
                        <select id="${ID_PREFIX}-format" class="oltb-select">
                            <option value="DD" data-oltb-i18n="${I18N_BASE}.toolbox.groups.formats.dd">${i18n.groups.formats.dd}</option>
                            <option value="DMS" data-oltb-i18n="${I18N_BASE}.toolbox.groups.formats.dms">${i18n.groups.formats.dms}</option>
                        </select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" data-oltb-i18n="${I18N_BASE}.toolbox.groups.coordinates.title">${i18n.groups.coordinates.title} <em>(Lat, Lon)</em></label>
                        <table class="oltb-table oltb-mt-05" id="${ID_PREFIX}-table"></table>
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
        const i18n = TranslationManager.get(`${I18N_BASE}.settings`);
        SettingsManager.addSetting(Settings.copyCoordinatesOnClick, {
            state: true, 
            text: i18n.copyOnClick
        });

        SettingsManager.addSetting(Settings.updateToolboxCoordinatesOnHover, {
            state: true, 
            text: i18n.updateToolboxOnHover
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
        this.createUIProjections();

        this.isActive = true;
        this.uiRefToolboxSection.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.removeUIProjections();

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

    onWindowKeyDown(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.coordinatesTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

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

        // Note: Consumer callback
        if(this.options.onMapClicked instanceof Function) {
            this.options.onMapClicked(allCoordinates);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Conversions/Validation
    // -------------------------------------------------------------------

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

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

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

        this.tooltipItem = TooltipManager.push(KEY_TOOLTIP);
        this.onPointerMoveListener = map.on(Events.openLayers.pointerMove, this.onPointerMove.bind(this));
        this.onMapClickListener = map.on(Events.browser.click, this.onMapClick.bind(this));
    }

    removeUIProjections() {
        DOM.clearElement(this.uiRefCoordinatesTable);
        TooltipManager.pop(KEY_TOOLTIP);
        
        unByKey(this.onPointerMoveListener);
        unByKey(this.onMapClickListener);
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doToggleToolboxSection(targetName) {
        const targetNode = document.getElementById(targetName);
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

    doCopyCoordinates(event) {
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
        
        copyToClipboard(prettyCoordinates)
            .then(() => {
                Toast.info({
                    i18nKey: `${I18N_BASE}.toasts.infos.copyCoordinates`,
                    autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
                });
            })
            .catch((error) => {
                LogManager.logError(FILENAME, 'doCopyCoordinates', {
                    message: 'Failed to copy coordinates',
                    error: error
                });

                Toast.error({
                    i18nKey: `${I18N_BASE}.toasts.errors.copyCoordinates`
                });
            });
    }
}

export { CoordinatesTool };
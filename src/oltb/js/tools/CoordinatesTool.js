import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../helpers/constants/Settings';
import { transform } from 'ol/proj';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { toStringHDMS } from 'ol/coordinate';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { TooltipManager } from '../core/managers/TooltipManager';
import { SettingsManager } from '../core/managers/SettingsManager';
import { copyToClipboard } from '../helpers/browser/CopyToClipboard';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { ProjectionManager } from '../core/managers/ProjectionManager';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/CoordiantesTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-coordinates';
const KEY_TOOLTIP = 'tool.coordinates';
const FORMAT_DECIMAL_DEGREES = 'DD';
const FORMAT_DEGREE_MINUTES_SECONDS = 'DMS';

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

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Show Coordinates (${ShortcutKeys.coordinatesTool})`
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
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initToolboxHTML() {
        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Coordinates Tool
                        <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" title="Toggle Section"></span>
                    </h4>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-format">Format</label>
                        <select id="${ID_PREFIX}-format" class="oltb-select">
                            <option value="DD">Decimal Degrees</option>
                            <option value="DMS">Degrees, Minutes, Seconds</option>
                        </select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label">Coordinates <em>(Lat, Lon)</em></label>
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
        SettingsManager.addSetting(Settings.copyCoordinatesOnClick, {
            state: true, 
            text: 'Copy Coordinates On Click'
        });

        SettingsManager.addSetting(Settings.updateToolboxCoordinatesOnHover, {
            state: true, 
            text: 'Update Toolbox Coordinates When Hover'
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

    onDOMContentLoaded() {
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
        
        targetNode?.slideToggle(Config.animationDuration.fast, (collapsed) => {
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
                Config.projection.default, 
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
        const coordinates = transform(
            event.coordinate, 
            Config.projection.default, 
            Config.projection.wgs84
        );
        
        const prettyCoordinates = toStringHDMS(coordinates);
        this.tooltipItem.innerHTML = prettyCoordinates;
    }

    doCreateToolboxCoordinates(event) {
        const projections = ProjectionManager.getProjections();

        projections.forEach((projection) => {
            const coordinates = transform(
                event.coordinate, 
                Config.projection.default, 
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

        const coordinates = transform(
            event.coordinate, 
            Config.projection.default, 
            Config.projection.wgs84
        );

        const prettyCoordinates = toStringHDMS(coordinates);

        copyToClipboard(prettyCoordinates)
            .then(() => {
                Toast.info({
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard', 
                    autoremove: Config.autoRemovalDuation.normal
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';
                LogManager.logError(FILENAME, 'doCopyCoordinates', {
                    message: errorMessage,
                    error: error
                });

                Toast.error({
                    title: 'Error',
                    message: errorMessage
                });
            });
    }
}

export { CoordinatesTool };
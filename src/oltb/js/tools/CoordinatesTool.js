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
const TOOL_BUTTON_CLASS = 'oltb-tool-button';
const TOOLBOX_SECTION_CLASS = 'oltb-toolbox-section';
const ID_PREFIX = 'oltb-coordinates';
const TOOLTIP_KEY = 'coordinates';

const DefaultOptions = Object.freeze({
    click: undefined,
    mapClicked: undefined
});

const LocalStorageNodeName = LocalStorageKeys.coordinatesTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    coordinatesFormat: 'DD'
});

class CoordinatesTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        const icon = getIcon({
            path: SvgPaths.crosshair.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `Show coordinates (${ShortcutKeys.coordinatesTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.tooltipItem = undefined;
        this.options = { ...DefaultOptions, ...options };

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${TOOLBOX_SECTION_CLASS}">
                <div class="${TOOLBOX_SECTION_CLASS}__header">
                    <h4 class="${TOOLBOX_SECTION_CLASS}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Coordinates
                        <span class="${TOOLBOX_SECTION_CLASS}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${TOOLBOX_SECTION_CLASS}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="${TOOLBOX_SECTION_CLASS}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-format">Format</label>
                        <select id="${ID_PREFIX}-format" class="oltb-select">
                            <option value="DD">Decimal degrees</option>
                            <option value="DMS">Degrees, minutes, seconds</option>
                        </select>
                    </div>
                    <div class="${TOOLBOX_SECTION_CLASS}__group">
                        <label class="oltb-label">Coordinates <em>(Lat, Lon)</em></label>
                        <table class="oltb-table oltb-mt-05" id="${ID_PREFIX}-table"></table>
                    </div>
                </div>
            </div>
        `);

        this.coordinatesToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.coordinatesTable = this.coordinatesToolbox.querySelector(`#${ID_PREFIX}-table`);
        
        this.coordinatesFormat = this.coordinatesToolbox.querySelector(`#${ID_PREFIX}-format`);
        this.coordinatesFormat.value = this.localStorage.coordinatesFormat;
        this.coordinatesFormat.addEventListener(Events.browser.change, this.onCoordinatesFormatChange.bind(this));

        this.projections = new Map();

        const toggleableTriggers = this.coordinatesToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        SettingsManager.addSetting(Settings.copyCoordinatesOnClick, {
            state: true, 
            text: 'Copy coordinates on click'
        });

        SettingsManager.addSetting(Settings.updateToolboxCoordinatesOnHover, {
            state: true, 
            text: 'Update toolbox coordinates when hover'
        });

        window.addEventListener(Events.browser.keyDown, this.onWindowKeyDown.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }
    
    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyDown(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.coordinatesTool)) {
            this.handleClick(event);
        }
    }

    onCoordinatesFormatChange() {
        this.localStorage.coordinatesFormat = this.coordinatesFormat.value;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }
        
        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
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

            DOM.appendChildren(this.coordinatesTable, [
                projectionRow,
                coordinatesRow
            ]);

            this.projections.set(projection.code, coordinatesCell);
        });

        this.tooltipItem = TooltipManager.push(TOOLTIP_KEY);
        this.onPointerMoveListener = map.on(Events.openLayers.pointerMove, this.onPointerMove.bind(this));
        this.onMapClickListener = map.on(Events.browser.click, this.onMapClick.bind(this));

        this.active = true;
        this.coordinatesToolbox.classList.add(`${TOOLBOX_SECTION_CLASS}--show`);
        this.button.classList.add(`${TOOL_BUTTON_CLASS}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.coordinatesTable.innerHTML = '';
        TooltipManager.pop(TOOLTIP_KEY);
        
        unByKey(this.onPointerMoveListener);
        unByKey(this.onMapClickListener);

        this.active = false;
        this.coordinatesToolbox.classList.remove(`${TOOLBOX_SECTION_CLASS}--show`);
        this.button.classList.remove(`${TOOL_BUTTON_CLASS}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    tooltipCoordinates(event) {
        const coordinates = transform(
            event.coordinate, 
            Config.projection.default, 
            Config.projection.wgs84
        );
        
        const prettyCoordinates = toStringHDMS(coordinates);
        this.tooltipItem.innerHTML = prettyCoordinates;
    }

    toolboxCoordinates(event) {
        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            const coordinates = transform(
                event.coordinate, 
                Config.projection.default, 
                projection.code
            );

            const format = this.coordinatesFormat.value;
            const cell = this.projections.get(projection.code);

            if(format === 'DMS') {
                this.toDegreeMinutesSeconds(cell, coordinates);
            }else {
                this.toDecimalDegrees(cell, coordinates);
            }
        });
    }

    toDecimalDegrees(cell, coordinates) {
        cell.innerHTML = `
            ${parseFloat(coordinates[1]).toFixed(4)}, 
            ${parseFloat(coordinates[0]).toFixed(4)}
        `;
    }

    toDegreeMinutesSeconds(cell, coordinates) {
        const prettyCoordinates = toStringHDMS(coordinates);
        cell.innerHTML = prettyCoordinates;
    }

    onPointerMove(event) {
        this.tooltipCoordinates(event);

        if(SettingsManager.getSetting(Settings.updateToolboxCoordinatesOnHover)) {
            this.toolboxCoordinates(event);
        }
    }

    onMapClick(event) {        
        this.copyCoordinates(event);

        if(!SettingsManager.getSetting(Settings.updateToolboxCoordinatesOnHover)) {
            this.toolboxCoordinates(event);
        }

        const allCoordinates = [];
        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            const coordinates = transform(
                event.coordinate, 
                Config.projection.default, 
                projection.code
            );

            const prettyCoordinates = toStringHDMS(coordinates);
            allCoordinates.push({
                code: projection.code,
                name: projection.name,
                coordinates: coordinates,
                prettyCoordinates: prettyCoordinates
            });
        });

        // User defined callback from constructor
        if(this.options.mapClicked instanceof Function) {
            this.options.mapClicked(allCoordinates);
        }
    }

    copyCoordinates(event) {
        if(!SettingsManager.getSetting(Settings.copyCoordinatesOnClick) || ToolManager.hasActiveTool()) {
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
                Toast.success({
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard', 
                    autoremove: Config.autoRemovalDuation.normal
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';
                LogManager.logError(FILENAME, 'copyCoordinates', {
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
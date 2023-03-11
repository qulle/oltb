import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { SETTINGS } from '../helpers/constants/Settings';
import { transform } from 'ol/proj';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { toStringHDMS } from 'ol/coordinate';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { TooltipManager } from '../core/managers/TooltipManager';
import { SettingsManager } from '../core/managers/SettingsManager';
import { copyToClipboard } from '../helpers/browser/CopyToClipboard';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { ProjectionManager } from '../core/managers/ProjectionManager';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'tools/CoordiantesTool.js';
const ID_PREFIX = 'oltb-coordinates';
const DEFAULT_OPTIONS = Object.freeze({
    click: undefined,
    mapClicked: undefined
});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.CoordinatesTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false,
    coordinatesFormat: 'DD'
});

class CoordinatesTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        const icon = getIcon({
            path: SVG_PATHS.Crosshair.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Show coordinates (${SHORTCUT_KEYS.Coordinates})`
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
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Coordinates
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-format">Format</label>
                        <select id="${ID_PREFIX}-format" class="oltb-select">
                            <option value="DD">Decimal degrees</option>
                            <option value="DMS">Degrees, minutes, seconds</option>
                        </select>
                    </div>
                    <div class="oltb-toolbox-section__group">
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
        this.coordinatesFormat.addEventListener(EVENTS.Browser.Change, this.onCoordinatesFormatChange.bind(this));

        this.projections = new Map();

        const toggleableTriggers = this.coordinatesToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleToolbox.bind(this, toggle));
        });

        SettingsManager.addSetting(SETTINGS.CopyCoordinatesOnClick, {
            state: true, 
            text: 'Coordinates tool - Copy coordinates on click'
        });

        window.addEventListener(EVENTS.Browser.KeyDown, this.onWindowKeyDown.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }
    
    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(CONFIG.AnimationDuration.Fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(Boolean(this.localStorage.active)) {
            this.activateTool();
        }
    }

    onWindowKeyDown(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Coordinates)) {
            this.handleClick(event);
        }
    }

    onCoordinatesFormatChange() {
        this.localStorage.coordinatesFormat = this.coordinatesFormat.value;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        if(Boolean(this.active)) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!Boolean(map)) {
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

        this.tooltipItem = TooltipManager.push('coordinates');
        this.onPointerMoveListener = map.on(EVENTS.OpenLayers.PointerMove, this.onPointerMove.bind(this));
        this.onMapClickListener = map.on(EVENTS.Browser.Click, this.onMapClick.bind(this));

        this.active = true;
        this.coordinatesToolbox.classList.add('oltb-toolbox-section--show');
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    deActivateTool() {
        this.coordinatesTable.innerHTML = '';
        const poppedTooltip = TooltipManager.pop('coordinates');
        
        unByKey(this.onPointerMoveListener);
        unByKey(this.onMapClickListener);

        this.active = false;
        this.coordinatesToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    onPointerMove(event) {
        this.tooltipCoordinates(event);
        this.toolboxCoordinates(event);
    }

    tooltipCoordinates(event) {
        const coordinates = transform(
            event.coordinate, 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );
        
        const prettyCoordinates = toStringHDMS(coordinates);
        this.tooltipItem.innerHTML = prettyCoordinates;
    }

    toolboxCoordinates(event) {
        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            const coordinates = transform(
                event.coordinate, 
                CONFIG.Projection.Default, 
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

    async onMapClick(event) {        
        const allCoordinates = [];
        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            const coordinates = transform(
                event.coordinate, 
                CONFIG.Projection.Default, 
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
        if(typeof this.options.mapClicked === 'function') {
            this.options.mapClicked(allCoordinates);
        }

        if(
            !SettingsManager.getSetting(SETTINGS.CopyCoordinatesOnClick) || 
            ToolManager.hasActiveTool()
        ) {
            return;
        }

        this.copyCoordinates(event);
    }

    copyCoordinates(event) {
        const coordinates = transform(
            event.coordinate, 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );

        const prettyCoordinates = toStringHDMS(coordinates);

        copyToClipboard(prettyCoordinates)
            .then(() => {
                Toast.success({
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard', 
                    autoremove: CONFIG.AutoRemovalDuation.Normal
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';
                LogManager.logError(FILENAME, 'onMapClick', {
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
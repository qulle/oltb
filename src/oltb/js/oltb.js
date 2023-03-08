// Core OpenLayers
import { fromLonLat } from 'ol/proj';
import { MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';

// Toolbar helpers
import './core/Tooltips';
import './epsg/Registrate';
import './helpers/browser/Prototypes';
import './helpers/browser/SlideToggle';

// Core Toolbar
import '../scss/oltb.scss';
import { Toast } from './common/Toast';
import { Modal } from './common/Modal';
import { CONFIG } from './core/Config';
import { Dialog } from './common/Dialog';
import { SETTINGS } from './helpers/constants/Settings';
import { ContextMenu } from './common/ContextMenu';
import { MAP_ELEMENT } from './core/elements/index';
import { LOCAL_STORAGE_KEYS } from './helpers/constants/LocalStorageKeys';

// Core Managers
import { LogManager } from './core/managers/LogManager';
import { UrlManager } from './core/managers/UrlManager';
import { ToolManager } from './core/managers/ToolManager';
import { LayerManager } from './core/managers/LayerManager';
import { StateManager } from './core/managers/StateManager';
import { TooltipManager } from './core/managers/TooltipManager';
import { SettingsManager } from './core/managers/SettingsManager';
import { BootstrapManager } from './core/managers/BootstrapManager';
import { InfoWindowManager } from './core/managers/InfoWindowManager';
import { AccessibilityManager } from './core/managers/AccessibilityManager';

// Generator functions
import { generateMarker } from './generators/GenerateMarker';
import { generateTooltip } from './generators/GenerateTooltip';
import { generateWindBarb } from './generators/generateWindBarb';

// Toolbar tools
import { ALL_TOOLS } from './tools/index';

// This is the same NODE_NAME and PROPS that the MapNavigationTool.js is using
const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.MapData;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    lon: 18.0685,
    lat: 59.3293,
    zoom: 3,
    rotation: 0
});

// Load stored data from localStorage
const LOCAL_STORAGE_STATE = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
const LOCAL_STORAGE = { ...LOCAL_STORAGE_DEFAULTS, ...LOCAL_STORAGE_STATE };

class OLTB {
    #tools = {};

    static CONFIG = CONFIG;

    static LogManager = LogManager;
    static UrlManager = UrlManager;
    static ToolManager = ToolManager;
    static StateManager = StateManager;
    static LayerManager = LayerManager;
    static TooltipManager = TooltipManager;
    static SettingsManager = SettingsManager;
    static InfoWindowManager = InfoWindowManager;
    static AccessibilityManager = AccessibilityManager;
    
    static Toast = Toast;
    static Modal = Modal;
    static Dialog = Dialog;

    generateMarker = generateMarker;
    generateTooltip = generateTooltip;
    generateWindBarb = generateWindBarb;

    constructor(options = {}) {
        // Tools that should be added
        const tools = options.tools && Object.keys(options.tools).length 
            ? options.tools 
            : ALL_TOOLS;

        // Create tool instances
        Object.entries(tools).forEach((entry) => {
            const [key, value] = entry;

            const toolName = key;
            const toolParameters = typeof value !== 'function' 
                ? value 
                : {};

            if(ALL_TOOLS.hasOwnProperty(toolName)) {
                this.#tools[toolName] = new ALL_TOOLS[toolName](toolParameters);
            }
        });

        // Always add the ContextMenu
        this.#tools['ContextMenu'] = new ContextMenu({});

        if(Boolean(options.map)) {
            this.setMap(options.map);
        }
    }

    setMap(map) {
        // Update all added tools with map reference
        Object.values(this.#tools).forEach((tool) => {
            tool.setMap(map);
        });

        // Initialize static managers
        BootstrapManager.init(map, [
            LogManager,
            UrlManager,
            ToolManager,
            LayerManager,
            StateManager,
            TooltipManager,
            SettingsManager,
            InfoWindowManager,
            AccessibilityManager
        ]);

        map.setTarget(MAP_ELEMENT);
        map.getInteractions().extend([
            new MouseWheelZoom({
                condition: function(event) { 
                    return (
                        platformModifierKeyOnly(event) || 
                        SettingsManager.getSetting(SETTINGS.MouseWheelZoom)
                    ); 
                }
            }),
            new DragRotate({
                condition: function(event) {
                    return (
                        altShiftKeysOnly(event) && 
                        SettingsManager.getSetting(SETTINGS.AltShiftDragRotate)
                    );
                }
            }),
            new DragPan({
                condition: function(event) {
                    return (
                        (
                            platformModifierKeyOnly(event) || 
                            SettingsManager.getSetting(SETTINGS.DragPan)
                        ) && !altShiftKeysOnly(event) && !shiftKeyOnly(event)
                    );
                }
            }),
            new KeyboardZoom({
                condition: function(event) {
                    return (
                        SettingsManager.getSetting(SETTINGS.KeyboardZoom) && 
                        targetNotEditable(event)
                    );
                }
            }),
            new KeyboardPan({
                condition: function(event) {
                    return (
                        SettingsManager.getSetting(SETTINGS.KeyboardPan) && 
                        targetNotEditable(event)
                    );
                }
            })
        ]);

        const view = map.getView();
        const coordinates = fromLonLat([
            LOCAL_STORAGE.lon,
            LOCAL_STORAGE.lat
        ], CONFIG.Projection.Default);

        view.setCenter(coordinates);
        view.setZoom(LOCAL_STORAGE.zoom);
        view.setRotation(LOCAL_STORAGE.rotation);
    }
}

export default OLTB;
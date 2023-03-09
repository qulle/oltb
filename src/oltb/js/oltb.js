// Core OpenLayers
import { fromLonLat } from 'ol/proj';
import { MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';

// Toolbar helpers
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
import { LOCAL_STORAGE_KEYS } from './helpers/constants/LocalStorageKeys';

// Core Managers
import { LogManager } from './core/managers/LogManager';
import { UrlManager } from './core/managers/UrlManager';
import { ToolManager } from './core/managers/ToolManager';
import { LayerManager } from './core/managers/LayerManager';
import { StateManager } from './core/managers/StateManager';
import { TippyManager } from './core/managers/TippyManager';
import { ElementManager } from './core/managers/ElementManager';
import { TooltipManager } from './core/managers/TooltipManager';
import { SettingsManager } from './core/managers/SettingsManager';
import { BootstrapManager } from './core/managers/BootstrapManager';
import { InfoWindowManager } from './core/managers/InfoWindowManager';
import { ProjectionManager } from './core/managers/ProjectionManager';
import { ColorPickerManager } from './core/managers/ColorPickerManager';
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
    lon: 18.1201,
    lat: 35.3518,
    zoom: 3,
    rotation: 0
});

class OLTB {
    #tools = {};
    #localStorage = {};

    static CONFIG = CONFIG;

    static LogManager = LogManager;
    static StateManager = StateManager;
    static ElementManager = ElementManager;
    static ProjectionManager = ProjectionManager;
    static LayerManager = LayerManager;
    static TippyManager = TippyManager;
    static TooltipManager = TooltipManager;
    static UrlManager = UrlManager;
    static ToolManager = ToolManager;
    static SettingsManager = SettingsManager;
    static InfoWindowManager = InfoWindowManager;
    static ColorPickerManager = ColorPickerManager;
    static AccessibilityManager = AccessibilityManager;
    
    static Toast = Toast;
    static Modal = Modal;
    static Dialog = Dialog;

    generateMarker = generateMarker;
    generateTooltip = generateTooltip;
    generateWindBarb = generateWindBarb;

    constructor(options = {}) {
        // Note: The order of the collection is important
        BootstrapManager.init([
            LogManager,
            StateManager,
            ElementManager,
            ProjectionManager,
            LayerManager,
            TippyManager,
            TooltipManager,
            UrlManager,
            ToolManager,
            SettingsManager,
            InfoWindowManager,
            ColorPickerManager,
            AccessibilityManager
        ]);

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.#localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

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
        Object.values(this.#tools).forEach((tool) => {
            tool.setMap(map);
        });

        BootstrapManager.setMap(map);

        map.setTarget(ElementManager.getMapElement());
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
            this.#localStorage.lon,
            this.#localStorage.lat
        ], CONFIG.Projection.Default);

        view.setCenter(coordinates);
        view.setZoom(this.#localStorage.zoom);
        view.setRotation(this.#localStorage.rotation);
    }
}

export default OLTB;
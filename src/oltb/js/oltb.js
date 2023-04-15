// Core OpenLayers
import { fromLonLat } from 'ol/proj';
import { MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';

// Browser prototype extensions
import './helpers/prototypes/String';
import './helpers/prototypes/SlideToggle';

// Core Toolbar
import '../scss/oltb.scss';
import { Toast } from './common/Toast';
import { Modal } from './common/Modal';
import { Config } from './core/Config';
import { Dialog } from './common/Dialog';
import { Settings } from './helpers/constants/Settings';
import { ContextMenu } from './common/ContextMenu';
import { LocalStorageKeys } from './helpers/constants/LocalStorageKeys';

// Core Managers
import { LogManager } from './core/managers/LogManager';
import { UrlManager } from './core/managers/UrlManager';
import { ToolManager } from './core/managers/ToolManager';
import { LayerManager } from './core/managers/LayerManager';
import { StateManager } from './core/managers/StateManager';
import { TippyManager } from './core/managers/TippyManager';
import { ErrorManager } from './core/managers/ErrorManager';
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
import { AllTools } from './tools/index';

// This is the same NODE_NAME and PROPS that the MapNavigationTool.js is using
const LocalStorageNodeName = LocalStorageKeys.mapData;
const LocalStorageDefaults = Object.freeze({
    lon: 18.1201,
    lat: 35.3518,
    zoom: 3,
    rotation: 0
});

class OLTB {
    #tools = {};
    #localStorage = {};

    static Config = Config;

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
        // Note: The init order is important
        BootstrapManager.init([
            LogManager,
            ErrorManager,
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
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.#localStorage = { ...LocalStorageDefaults, ...localStorageState };

        // Tools that should be added
        const tools = options.tools && Object.keys(options.tools).length 
            ? options.tools 
            : AllTools;

        // Create tool instances
        Object.entries(tools).forEach((entry) => {
            const [key, value] = entry;

            const toolName = key;
            const toolParameters = !(value instanceof Function)
                ? value 
                : {};

            if(AllTools.hasOwnProperty(toolName)) {
                this.#tools[toolName] = new AllTools[toolName](toolParameters);
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
                        SettingsManager.getSetting(Settings.mouseWheelZoom)
                    ); 
                }
            }),
            new DragRotate({
                condition: function(event) {
                    return (
                        altShiftKeysOnly(event) && 
                        SettingsManager.getSetting(Settings.altShiftDragRotate)
                    );
                }
            }),
            new DragPan({
                condition: function(event) {
                    return (
                        (
                            platformModifierKeyOnly(event) || 
                            SettingsManager.getSetting(Settings.dragPan)
                        ) && !altShiftKeysOnly(event) && !shiftKeyOnly(event)
                    );
                }
            }),
            new KeyboardZoom({
                condition: function(event) {
                    return (
                        SettingsManager.getSetting(Settings.keyboardZoom) && 
                        targetNotEditable(event)
                    );
                }
            }),
            new KeyboardPan({
                condition: function(event) {
                    return (
                        SettingsManager.getSetting(Settings.keyboardPan) && 
                        targetNotEditable(event)
                    );
                }
            })
        ]);

        const view = map.getView();
        const coordinates = fromLonLat([
            Number(this.#localStorage.lon),
            Number(this.#localStorage.lat)
        ], Config.projection.default);

        view.setCenter(coordinates);
        view.setZoom(this.#localStorage.zoom);
        view.setRotation(this.#localStorage.rotation);
    }
}

// Note: This must be a default export
// Rollup won't build the CDN-lib correctly if named export is used
export default OLTB;
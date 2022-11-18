// (1). Core OpenLayers
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';
import { MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { fromLonLat } from 'ol/proj';

// (2). Core Toolbar
import '../scss/oltb.scss';
import Dialog from './modules/common/Dialog';
import Toast from './modules/common/Toast';
import Modal from './modules/common/Modal';
import ContextMenu from './modules/common/ContextMenu';
import CONFIG from './modules/core/Config';
import { MAP_ELEMENT } from './modules/core/ElementReferences';
import { CONTEXT_MENUS } from './modules/helpers/constants/ContextMenus';
import { SETTINGS } from './modules/helpers/constants/Settings';

// (3). Core Managers
import StateManager from './modules/core/managers/StateManager';
import SettingsManager from './modules/core/managers/SettingsManager';
import LayerManager from './modules/core/managers/LayerManager';
import TooltipManager from './modules/core/managers/TooltipManager';
import InfoWindowManager from './modules/core/managers/InfoWindowManager';

// (4). Custom OL generator functions
import { generateMarker } from './modules/helpers/ol-functions/GenerateMarker';
import { generateTooltip } from './modules/helpers/ol-functions/GenerateTooltip';
import { generateWindbarb } from './modules/helpers/ol-functions/GenerateWindbarb';

// (5). Toolbar tools
import ALL_TOOLS from './modules/tools/index';

// (6). Additional toolbar helpers
import './modules/core/Tooltips';
import './modules/epsg/Registrate';
import './modules/helpers/Browser/Prototypes';
import './modules/helpers/Accessibility';
import './modules/helpers/SlideToggle';

// Note: This is the same NODE_NAME and PROPS that the MapNavigationTool.js is using
const LOCAL_STORAGE_NODE_NAME = 'mapData';
const LOCAL_STORAGE_DEFAULTS = {
    lon: 25.5809,
    lat: 23.7588,
    zoom: 3,
    rotation: 0
};

// Load potential stored data from localStorage
const LOCAL_STORAGE_STATE = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
const LOCAL_STORAGE = { ...LOCAL_STORAGE_DEFAULTS, ...LOCAL_STORAGE_STATE };

class OLTB {
    // Private scope
    #tools = {};

    // Public scope
    StateManager      = StateManager;
    LayerManager      = LayerManager;
    TooltipManager    = TooltipManager;
    SettingsManager   = SettingsManager;
    InfoWindowManager = InfoWindowManager;

    Toast  = Toast;
    Modal  = Modal;
    Dialog = Dialog;

    generateMarker   = generateMarker;
    generateTooltip  = generateTooltip;
    generateWindbarb = generateWindbarb;

    constructor(options = {}) {
        // Tools that should be added
        const tools = options.tools && Object.keys(options.tools).length 
            ? options.tools 
            : ALL_TOOLS;

        // Create tool instances
        Object.entries(tools).forEach((entry) => {
            const [key, value] = entry;

            const toolName = key;
            const toolParameters = typeof value !== 'function' ? value : {};

            if(ALL_TOOLS.hasOwnProperty(toolName)) {
                this.#tools[toolName] = new ALL_TOOLS[toolName](toolParameters);
            }
        });

        // Always add the ContextMenu
        this.#tools['ContextMenu'] = new ContextMenu({
            name: CONTEXT_MENUS.MainMap, 
            selector: `#${MAP_ELEMENT.id} canvas`
        });

        if(options.map) {
            this.setMap(options.map);
        }
    }

    setMap(map) {
        Object.values(this.#tools).forEach((tool) => {
            tool.setMap(map);
        });

        [
            StateManager,
            SettingsManager,
            LayerManager,
            TooltipManager,
            InfoWindowManager
        ].forEach((manager) => {
            manager.init(map);
        });

        map.setTarget(MAP_ELEMENT);

        map.getInteractions().extend([
            new MouseWheelZoom({
                condition: function(event) { 
                    return platformModifierKeyOnly(event) || SettingsManager.getSetting(SETTINGS.MouseWheelZoom); 
                }
            }),
            new DragRotate({
                condition: function(event) {
                    return altShiftKeysOnly(event) && SettingsManager.getSetting(SETTINGS.AltShiftDragRotate);
                }
            }),
            new DragPan({
                condition: function(event) {
                    return (platformModifierKeyOnly(event) || SettingsManager.getSetting(SETTINGS.DragPan)) && !altShiftKeysOnly(event) && !shiftKeyOnly(event);
                }
            }),
            new KeyboardZoom({
                condition: function(event) {
                    return SettingsManager.getSetting(SETTINGS.KeyboardZoom) && targetNotEditable(event);
                }
            }),
            new KeyboardPan({
                condition: function(event) {
                    return SettingsManager.getSetting(SETTINGS.KeyboardPan) && targetNotEditable(event);
                }
            })
        ]);

        const view = map.getView();
        const coordinate = fromLonLat([
            LOCAL_STORAGE.lon,
            LOCAL_STORAGE.lat
        ], CONFIG.projection);

        view.setCenter(coordinate);
        view.setZoom(LOCAL_STORAGE.zoom);
        view.setRotation(LOCAL_STORAGE.rotation);
    }
}

export default OLTB;
// (1). Core OpenLayers
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';
import { MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { fromLonLat } from 'ol/proj';

// (2). Toolbar tools
import ALL_TOOLS from './modules/tools/index';

// (3). Managers
import StateManager from './modules/core/managers/StateManager';
import SettingsManager from './modules/core/managers/SettingsManager';
import LayerManager from './modules/core/managers/LayerManager';
import TooltipManager from './modules/core/managers/TooltipManager';
import InfoWindowManager from './modules/core/managers/InfoWindowManager';

// (4). Additional toolbar helpers
import ContextMenu from './modules/common/ContextMenu';
import CONFIG from './modules/core/Config';
import Dialog from './modules/common/Dialog';
import Toast from './modules/common/Toast';
import Modal from './modules/common/Modal';
import { MAP_ELEMENT } from './modules/core/ElementReferences';
import { CONTEXT_MENUS } from './modules/helpers/constants/ContextMenus';
import { SETTINGS } from './modules/helpers/constants/Settings';
import '../scss/oltb.scss';
import './modules/core/Tooltips';
import './modules/epsg/Registrate';
import './modules/helpers/Browser/Prototypes';
import './modules/helpers/Accessibility';
import './modules/helpers/SlideToggle';

// (5). Load layers
import './modules/layers/Maps';
// import './modules/layers/Countries';
// import './modules/layers/Continents';
// import './modules/layers/Wind';
// import './modules/layers/Capitals';

// Note: This is the same NODE_NAME and PROPS that the MapNavigation.js tool is using
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
    dialog = Dialog;
    toast  = Toast;
    modal  = Modal;

    managers = {
        StateManager,
        SettingsManager,
        LayerManager,
        TooltipManager,
        InfoWindowManager
    };

    tools = {};

    constructor(options = {}) {
        // Create all tool instances
        if(options.tools) {
            Object.entries(options.tools).forEach((entry) => {
                // Key   = Name of Tool
                // Value = User defined Tool constructor parameters
                const [key, value] = entry;

                const result = ALL_TOOLS.find((item) => {
                    return key === item.name;
                });

                if(result) {
                    this.tools[key] = new result.tool(value);
                }
            });
        }

        // Always add the Core ContextMenu
        this.tools['ContextMenu'] = new ContextMenu({
            name: CONTEXT_MENUS.MainMap, 
            selector: `#${MAP_ELEMENT.id} canvas`
        });

        if(options.map) {
            this.setMap(options.map);
        }
    }

    setMap(map) {
        Object.values(this.tools).forEach((tool) => {
            tool.setMap(map);
        });

        Object.values(this.managers).forEach((manager) => {
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

        view.setCenter(
            fromLonLat([
                LOCAL_STORAGE.lon,
                LOCAL_STORAGE.lat
            ], CONFIG.projection)
        );

        view.setZoom(LOCAL_STORAGE.zoom);
        view.setRotation(LOCAL_STORAGE.rotation);
    }
}

export default OLTB;
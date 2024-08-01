// Core OpenLayers
import { fromLonLat } from 'ol/proj';
import { MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';

// Browser prototype extensions
import './browser-prototypes/json-cycle';
import './browser-prototypes/string';
import './browser-prototypes/slide-toggle';

// Core Toolbar
import '../scss/oltb.scss';
import { Toast } from './ui-common/ui-toasts/toast';
import { Modal } from './ui-common/ui-modals/modal';
import { Dialog } from './ui-common/ui-dialogs/dialog';
import { Settings } from './browser-constants/settings';
import { LocalStorageKeys } from './browser-constants/local-storage-keys';

// Core Managers
import { LogManager } from './toolbar-managers/log-manager/log-manager';
import { UrlManager } from './toolbar-managers/url-manager/url-manager';
import { NameManager } from './toolbar-managers/name-manager/name-manager';
import { ToolManager } from './toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from './toolbar-managers/snap-manager/snap-manager';
import { EventManager } from './toolbar-managers/event-manager/event-manager';
import { StyleManager } from './toolbar-managers/style-manager/style-manager';
import { LayerManager } from './toolbar-managers/layer-manager/layer-manager';
import { StateManager } from './toolbar-managers/state-manager/state-manager';
import { TippyManager } from './toolbar-managers/tippy-manager/tippy-manager';
import { ErrorManager } from './toolbar-managers/error-manager/error-manager';
import { ConfigManager } from './toolbar-managers/config-manager/config-manager';
import { ElementManager } from './toolbar-managers/element-manager/element-manager';
import { TooltipManager } from './toolbar-managers/tooltip-manager/tooltip-manager';
import { FeatureManager } from './toolbar-managers/feature-manager/feature-manager';
import { SettingsManager } from './toolbar-managers/settings-manager/settings-manager';
import { BootstrapManager } from './toolbar-managers/bootstrap-manager/bootstrap-manager';
import { ConversionManager } from './toolbar-managers/conversion-manager/conversion-manager';
import { InfoWindowManager } from './toolbar-managers/info-window-manager/info-window-manager';
import { ProjectionManager } from './toolbar-managers/projection-manager/projection-manager';
import { TranslationManager } from './toolbar-managers/translation-manager/translation-manager';
import { ColorPickerManager } from './toolbar-managers/color-picker-manager/color-picker-manager';
import { AccessibilityManager } from './toolbar-managers/accessibility-manager/accessibility-manager';

// Create UI functions
import { createUITooltip } from './ui-creators/ui-tooltip/create-ui-tooltip';

// Toolbar Tools
import { AllTools } from './toolbar-tools/index';

class OLTB {
    static LogManager = LogManager;
    static StyleManager = StyleManager;
    static ErrorManager = ErrorManager;
    static FeatureManager = FeatureManager;
    static StateManager = StateManager;
    static ElementManager = ElementManager;
    static ConfigManager = ConfigManager;
    static TranslationManager = TranslationManager;
    static ProjectionManager = ProjectionManager;
    static LayerManager = LayerManager;
    static TippyManager = TippyManager;
    static TooltipManager = TooltipManager;
    static UrlManager = UrlManager;
    static ToolManager = ToolManager;
    static SnapManager = SnapManager;
    static SettingsManager = SettingsManager;
    static InfoWindowManager = InfoWindowManager;
    static ColorPickerManager = ColorPickerManager;
    static AccessibilityManager = AccessibilityManager;
    static ConversionManager = ConversionManager;
    static NameManager = NameManager;
    
    static Toast = Toast;
    static Modal = Modal;
    static Dialog = Dialog;

    createUITooltip = createUITooltip;

    #tools = {};
    #localStorage = {};

    #hasSpecifiedTools(options) {
        return options.tools && Object.keys(options.tools).length;
    }

    #getTools(options) {
        if(this.#hasSpecifiedTools(options)) {
            return options.tools;
        }

        return AllTools;
    }

    #getToolParameters(value) {
        if(!(value instanceof Function)) {
            return value;
        }

        return {};
    }

    #initTools(options) {
        // Tools that should be added
        const tools = this.#getTools(options);

        // Create tool instances
        Object.entries(tools).forEach((entry) => {
            const [ key, value ] = entry;

            const toolName = key;
            const toolParameters = this.#getToolParameters(value);

            if(Object.prototype.hasOwnProperty.call(AllTools, toolName)) {
                this.#tools[toolName] = new AllTools[toolName](toolParameters);
            }
        });

        // Note: 
        // Always add the ContextMenuTool last
        this.#tools['ContextMenuTool'] = new AllTools.ContextMenuTool({});
    }

    #initLocalStorage() {
        const defaultLocation = ConfigManager.getConfig().location.default;
        const LocalStorageNodeName = LocalStorageKeys.mapData;
        const LocalStorageDefaults = Object.freeze({
            lon: defaultLocation.lon,
            lat: defaultLocation.lat,
            zoom: defaultLocation.zoom,
            rotation: defaultLocation.rotation,
        });

        this.#localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );
    }

    constructor(options = {}) {
        // Note: 
        // The init order is important due to dependencies between the managers
        BootstrapManager.initAsync([
            { manager: LogManager },
            { manager: EventManager },
            { manager: StyleManager },
            { manager: ErrorManager },
            { manager: FeatureManager },
            { manager: StateManager, options: {
                ignoredKeys: []
            }},
            { manager: ElementManager },
            { manager: ConfigManager },
            { manager: TranslationManager },
            { manager: ProjectionManager },
            { manager: LayerManager },
            { manager: ColorPickerManager },
            { manager: TippyManager },
            { manager: TooltipManager },
            { manager: UrlManager },
            { manager: ToolManager },
            { manager: SettingsManager },
            { manager: SnapManager },
            { manager: InfoWindowManager },
            { manager: AccessibilityManager }
        ]).then(() => {
            this.#initLocalStorage();
            this.#initTools(options);

            if(options.map) {
                this.setMap(options.map);
            }
        });
    }

    setMap(map) {
        Object.values(this.#tools).forEach((tool) => {
            tool.setMap(map);
        });

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
        ], ConfigManager.getConfig().projection.default);

        view.setCenter(coordinates);
        view.setZoom(this.#localStorage.zoom);
        view.setRotation(this.#localStorage.rotation);

        BootstrapManager.setMap(map);
        BootstrapManager.ready();
    }
}

// Note: 
// This must be a default export
// Rollup won't build the CDN-lib correctly if named export is used
export default OLTB;
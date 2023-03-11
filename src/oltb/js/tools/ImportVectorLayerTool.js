import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { FORMAT_TYPES } from '../core/ol-types/FormatTypes';
import { LayerManager } from '../core/managers/LayerManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { instantiateFormat } from '../core/ol-types/FormatTypes';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const FILENAME = 'tools/ImportVectorLayerTool.js';
const DEFAULT_OPTIONS = Object.freeze({
    click: undefined,
    imported: undefined,
    error: undefined
});

class ImportVectorLayerTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SVG_PATHS.FolderOpen.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Import Vector layer (${SHORTCUT_KEYS.ImportVectorLayer})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.fileReader = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        this.inputDialog = DOM.createElement({
            element: 'input',
            attributes: {
                type: 'file',
                accept: '.geojson, .kml'
            },
            listeners: {
                'change': this.loadLayer.bind(this)
            }
        });
        
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ImportVectorLayer)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        this.inputDialog.click();
    }

    loadLayer(event) {
        const fileDialog = event.target;

        this.fileReader = new FileReader();
        this.fileReader.addEventListener(EVENTS.Browser.Load, this.parseLayer.bind(this, fileDialog));
        this.fileReader.readAsText(fileDialog.files[0]);
    }

    parseLayer(fileDialog) {
        const file = fileDialog.files[0].name;
            
        try {
            const filename = file.split('.')[0];
            const fileExtension = file.split('.').pop().toLowerCase();

            // Can't use the in-operator since the format can be formatted by the user
            // Forcing format to be lower-case and the do a search for it as a key in the format-object
            const format = Object.keys(FORMAT_TYPES).find((key) => {
                return key.toLowerCase() === fileExtension;
            });

            // This should not happen since the format is set in the dialog
            if(!Boolean(format)) {
                Toast.error({
                    title: 'Error',
                    message: 'This layer format is not supported'
                });

                return;
            }
                
            const features = instantiateFormat(format).readFeatures(this.fileReader.result, {
                featureProjection: CONFIG.Projection.Default
            });

            const layerWrapper = LayerManager.addFeatureLayer(`Import : ${filename}`);
            layerWrapper.getLayer().getSource().addFeatures(features);

            // User defined callback from constructor
            if(typeof this.options.imported === 'function') {
                this.options.imported(features);
            }
        }catch(error) {
            const errorMessage = 'Failed to import vector layer';
            LogManager.logError(FILENAME, 'parseLayer', {
                message: errorMessage,
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: errorMessage
            });

            // User defined callback from constructor
            if(typeof this.options.error === 'function') {
                this.options.error(file, error);
            }
        }
    }
}

export { ImportVectorLayerTool };
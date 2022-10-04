import Toast from '../common/Toast';
import LayerManager from '../core/managers/LayerManager';
import CONFIG from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import FORMAT_TYPES, { instantiateFormat } from '../core/ol-types/FormatTypes';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';

const DEFAULT_OPTIONS = {};

class ImportVectorLayerTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Open,
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

        this.element.appendChild(button);
        this.fileReader = new FileReader();
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
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.inputDialog.click();
    }

    loadLayer(event) {
        const fileDialog = event.target;

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
            if(!format) {
                Toast.error({text: 'Unsupported layer format'});
                return;
            }

            const dataProjection = fileExtension.toLowerCase() === 'kml' 
                ? CONFIG.projection 
                : undefined;
                
            const features = instantiateFormat(format).readFeatures(this.fileReader.result, {
                featureProjection: CONFIG.projection,
                dataProjection: dataProjection
            });

            const layerWrapper = LayerManager.addFeatureLayer('Import : ' + filename);
            
            layerWrapper.layer.getSource().addFeatures(features);

            // User defined callback from constructor
            if(typeof this.options.imported === 'function') {
                this.options.imported(features);
            }
        }catch(error) {
            console.error(`Error importing vector layer [${error}]`);
            Toast.error({text: 'Error when parsing layer - check syntax'});

            // User defined callback from constructor
            if(typeof this.options.error === 'function') {
                this.options.error(file, error);
            }
        }
    }
}

export default ImportVectorLayerTool;
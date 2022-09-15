import Toast from '../common/Toast';
import LayerManager from '../core/Managers/LayerManager';
import Config from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import FormatTypes, { instantiateFormat } from '../core/olTypes/FormatTypes';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const DEFAULT_OPTIONS = {};

class ImportVectorLayer extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Open,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Import Vector layer (O)'
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
        
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'o')) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        this.inputDialog.click();
    }

    loadLayer(event) {
        const fileDialog = event.target;

        this.fileReader.addEventListener('load', this.parseLayer.bind(this, fileDialog));
        this.fileReader.readAsText(fileDialog.files[0]);
    }

    parseLayer(fileDialog) {
        const file = fileDialog.files[0].name;
            
        try {
            const filename = file.split('.')[0];
            const fileExtension = file.split('.').pop().toLowerCase();

            // Can't use the in-operator since the format can be formatted by the user
            // Forcing format to be lower-case and the do a search for it as a key in the format-object
            const format = Object.keys(FormatTypes).find((key) => {
                return key.toLowerCase() === fileExtension;
            });

            // This should not happen since the format is set in the dialog
            if(!format) {
                Toast.error({text: 'Unsupported layer format'});
                return;
            }

            const features = instantiateFormat(format).readFeatures(this.fileReader.result, {
                featureProjection: Config.projection
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

export default ImportVectorLayer;
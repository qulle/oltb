import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Toast from '../common/Toast';
import LayerManager from '../core/Managers/LayerManager';
import Config from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import FormatTypes, { instantiateFormat } from '../core/olTypes/FormatTypes';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

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
            }
        });

        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.options = options;

        // Helper element to open a local geojson file
        const inputDialog = DOM.createElement({
            element: 'input',
            class: 'oltb-d-none',
            attributes: {
                type: 'file',
                accept: '.geojson, .kml'
            }
        })

        inputDialog.addEventListener('change', this.loadVectorLayer.bind(this));
        this.inputDialog = inputDialog;

        document.body.insertAdjacentElement('beforeend', inputDialog);
        
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'o')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.inputDialog.click();
    }

    loadVectorLayer(event) {
        const fileDialog = event.target;
        const fileReader = new FileReader();
        const self = this;

        fileReader.onload = function() {
            const file = fileDialog.files[0].name;
            
            try {
                const filename = file.split('.')[0];
                const fileExtension = file.split('.').pop().toLowerCase();

                // Can't use the in-operator since the format can be formatted by the user
                // Forcing format to be lower-case and the do a search for it as a key in the format-object
                const format = Object.keys(FormatTypes).find(key => key.toLowerCase() === fileExtension);

                // This should not happen since the format is set in the dialog
                if(!format) {
                    Toast.error({text: 'Unsupported layer format'});
                    return;
                }

                const features = instantiateFormat(format).readFeatures(fileReader.result, {
                    featureProjection: Config.baseProjection,
                    dataProjection: Config.baseProjection
                });

                LayerManager.addFeatureLayer('Import : ' + filename);
                const layer = LayerManager.getActiveFeatureLayer().layer;
                layer.getSource().addFeatures(features);

                // User defined callback from constructor
                if(typeof self.options.imported === 'function') {
                    self.options.imported(features);
                }
            }catch(error) {
                Toast.error({text: 'Error when parsing layer - check syntax'});

                // User defined callback from constructor
                if(typeof self.options.error === 'function') {
                    self.options.error(file, error);
                }
            }
        }
              
        fileReader.readAsText(fileDialog.files[0]);
    }
}

export default ImportVectorLayer;
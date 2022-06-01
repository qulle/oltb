import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Toast from '../common/Toast';
import LayerManager from '../core/Managers/LayerManager';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { importLayerAsGeoJSON } from '../helpers/olFunctions/GeoJSON';

class ImportGeoJSON extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Brackets,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Open Geojson (O)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.options = options;

        // Helper element to open a local geojson file
        const inputDialog = document.createElement('input');
        inputDialog.className = 'oltb-d-none';
        inputDialog.setAttribute('type', 'file');
        inputDialog.setAttribute('accept', '.geojson, .json');
        inputDialog.addEventListener('change', this.loadGeoJSON.bind(this));
        document.body.insertAdjacentElement('beforeend', inputDialog);
        
        this.inputDialog = inputDialog;

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

    loadGeoJSON(event) {
        const fileDialog = event.target;
        const fileReader = new FileReader();
        const self = this;

        fileReader.onload = function() {
            const file = fileDialog.files[0].name;
            
            try {
                const filename = file.split('.')[0];
                const features = importLayerAsGeoJSON(fileReader.result);

                LayerManager.addFeatureLayer('Import : ' + filename);
                const layer = LayerManager.getActiveFeatureLayer().layer;
                layer.getSource().addFeatures(features);

                // User defined callback from constructor
                if(typeof self.options.imported === 'function') {
                    self.options.imported(features);
                }
            }catch(error) {
                Toast.error({text: 'Error when parsing the geojson - check syntax'});

                // User defined callback from constructor
                if(typeof self.options.error === 'function') {
                    self.options.error(file, error);
                }
            }
        }
              
        fileReader.readAsText(fileDialog.files[0]);
    }
}

export default ImportGeoJSON;
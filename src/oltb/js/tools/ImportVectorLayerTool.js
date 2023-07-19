import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { FormatType } from '../core/ol-types/FormatType';
import { LayerManager } from '../core/managers/LayerManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { ImportLayerModal } from './modal-extensions/ImportLayerModal';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { instantiateFormat } from '../core/ol-types/FormatType';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/ImportVectorLayerTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onClick: undefined,
    onImported: undefined,
    onError: undefined
});

class ImportVectorLayerTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.folderOpen.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Import Vector layer (${ShortcutKeys.importVectorLayerTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.fileReader = undefined;
        this.importLayerModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        
        this.inputDialog = DOM.createElement({
            element: 'input',
            attributes: {
                'type': 'file',
                'accept': '.geojson, .kml'
            },
            listeners: {
                'change': this.onInputChange.bind(this)
            }
        });
        
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.importVectorLayerTool)) {
            this.onClickTool(event);
        }
    }

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        if(this.importLayerModal) {
            return;
        }

        this.inputDialog.click();
    }

    onInputChange(event) {
        const fileDialog = event.target;

        this.fileReader = new FileReader();
        this.fileReader.addEventListener(Events.browser.load, this.onParseLayer.bind(this, fileDialog));
        this.fileReader.readAsText(fileDialog.files[0]);
    }

    onParseLayer(fileDialog) {
        const file = fileDialog.files[0].name;
        
        this.importLayerModal = new ImportLayerModal({
            onImport: (result) => {   
                this.onImportLayer(file, result);
            },
            onClose: () => {
                this.importLayerModal = undefined;
            }
        });
    }

    onImportLayer(file, result) {
        LogManager.logInformation(FILENAME, 'onImportLayer', {
            file: file,
            featureProjection: result.featureProjection,
            dataProjection: result.dataProjection
        });

        try {
            const filename = file.split('.')[0];
            const fileExtension = file.split('.').pop().toLowerCase();

            const format = Object.keys(FormatType).find((key) => {
                return key.toLowerCase() === fileExtension;
            });

            // This should not happen since the format is set in the dialog
            if(!format) {
                const errorMessage = `This layer format (${format}) is not supported`;
                LogManager.logError(FILENAME, 'onImportLayer', errorMessage);

                Toast.error({
                    title: 'Error',
                    message: errorMessage
                });

                return;
            }

            const features = instantiateFormat(format).readFeatures(this.fileReader.result, {
                featureProjection: result.featureProjection,
                dataProjection: result.dataProjection
            });
    
            const layerWrapper = LayerManager.addFeatureLayer({
                name: `Import : ${filename}`
            });
            layerWrapper.getLayer().getSource().addFeatures(features);
    
            // Note: Consumer callback
            if(this.options.onImported instanceof Function) {
                this.options.onImported(features);
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

            // Note: Consumer callback
            if(this.options.onError instanceof Function) {
                this.options.onError(file, error);
            }
        }
    }
}

export { ImportVectorLayerTool };
import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from '../../common/toasts/toast';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { FormatType } from '../../ol-mappers/ol-format';
import { LayerManager } from '../../managers/layer-manager/layer-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { ImportLayerModal } from '../../modal-extensions/import-layer-modal';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { instantiateFormat } from '../../ol-mappers/ol-format';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'ImportVectorLayerTool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.importVectorLayerTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onImported: undefined,
    onError: undefined
});

/**
 * About:
 * Import Vector layers
 * 
 * Description:
 * Vector layers such as geojson can be imported and then create a Feature layer with its specified projections.
 */
class ImportVectorLayerTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.folderOpen.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.importVectorLayerTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.importVectorLayerTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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
        
        this.inputDialog = this.createUIInputDialog();
        
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        if(this.importLayerModal) {
            return;
        }

        this.inputDialog.click();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.importVectorLayerTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    createUIInputDialog() {
        return DOM.createElement({
            element: 'input',
            attributes: {
                'type': 'file',
                'accept': '.geojson, .kml'
            },
            listeners: {
                'change': this.onInputChange.bind(this)
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    onInputChange(event) {
        const fileDialog = event.target;

        this.fileReader = new FileReader();
        this.fileReader.addEventListener(Events.browser.load, this.onParseLayer.bind(this, fileDialog));
        this.fileReader.readAsText(fileDialog.files[0]);
    }

    onParseLayer(fileDialog) {
        if(this.importLayerModal) {
            return;
        }
        
        const file = fileDialog.files[0].name;
        this.doShowImportLayerModal(file);
    }

    onImportLayer(file, result) {
        this.doImportLayer(file, result);
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doShowImportLayerModal(file) {
        if(this.importLayerModal) {
            return;
        }
        
        this.importLayerModal = new ImportLayerModal({
            onImport: (result) => {   
                this.onImportLayer(file, result);
            },
            onClose: () => {
                this.importLayerModal = undefined;
            }
        });
    }

    doAddFeaturesToMap(features, filename) {
        const layerWrapper = LayerManager.addFeatureLayer({
            name: filename
        });
        
        layerWrapper.getLayer().getSource().addFeatures(features);
    }

    doImportLayer(file, result) {
        LogManager.logDebug(FILENAME, 'doImportLayer', {
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

            // Note: 
            // This should not happen since the format is set in the dialog using select element
            if(!format) {
                LogManager.logError(FILENAME, 'doImportLayer', {
                    title: 'Error',
                    message: `The layer format is not supported (${format})`
                });

                Toast.error({
                    i18nKey: `${I18N__BASE}.toasts.errors.unsupportedFormat`,
                });

                return;
            }

            const features = instantiateFormat(format).readFeatures(this.fileReader.result, {
                featureProjection: result.featureProjection,
                dataProjection: result.dataProjection
            });
    
            this.doAddFeaturesToMap(features, filename);
    
            // Note: 
            // @Consumer callback
            if(this.options.onImported instanceof Function) {
                this.options.onImported(features);
            }
        }catch(error) {
            LogManager.logError(FILENAME, 'doImportLayer', {
                message: 'Failed to import vector layer',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.importFailed`
            });

            // Note: 
            // @Consumer callback
            if(this.options.onError instanceof Function) {
                this.options.onError(file, error);
            }
        }
    }
}

export { ImportVectorLayerTool };
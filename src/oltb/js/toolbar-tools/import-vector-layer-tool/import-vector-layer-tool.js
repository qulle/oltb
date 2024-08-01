import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { FormatType } from '../../ol-mappers/ol-format/ol-format';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ImportLayerModal } from '../../ui-extensions/import-layer-modal/import-layer-modal';
import { instantiateFormat } from '../../ol-mappers/ol-format/ol-format';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'import-vector-layer-tool.js';
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
class ImportVectorLayerTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
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
        this.inputDialog = this.#createUIInputDialog();
        
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        if(this.importLayerModal) {
            return;
        }

        this.inputDialog.click();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.importVectorLayerTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createUIInputDialog() {
        return DOM.createElement({
            element: 'input',
            attributes: {
                'type': 'file',
                'accept': '.geojson, .kml'
            },
            listeners: {
                'change': this.#onInputChange.bind(this)
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onInputChange(event) {
        const fileDialog = event.target;

        this.fileReader = new FileReader();
        this.fileReader.addEventListener(Events.browser.load, this.#onParseLayer.bind(this, fileDialog));
        this.fileReader.readAsText(fileDialog.files[0]);
    }

    #onParseLayer(fileDialog) {
        if(this.importLayerModal) {
            return;
        }
        
        const file = fileDialog.files[0].name;
        this.askToImportLayer(file);
    }

    #onImportLayer(file, result) {
        this.doImportLayer(file, result);
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToImportLayer(file) {
        if(this.importLayerModal) {
            return;
        }
        
        this.importLayerModal = new ImportLayerModal({
            onImport: (result) => {   
                this.#onImportLayer(file, result);
            },
            onClose: () => {
                this.importLayerModal = undefined;
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
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
            if(this.options.onImported) {
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
            if(this.options.onError) {
                this.options.onError(file, error);
            }
        }
    }
}

export { ImportVectorLayerTool };
import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../../core/Config';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { createUISelect } from '../../creators/CreateUISelect';
import { ProjectionManager } from '../../core/managers/ProjectionManager';

const FILENAME = 'modal-extensions/ImportLayerModal.js';
const ID_PREFIX = 'oltb-import-layer-modal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onImport: undefined,
    onCancel: undefined
});

class ImportLayerModal extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            'Import layer', 
            options.maximized, 
            options.onClose
        );

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    getName() {
        return FILENAME;
    }

    #createModal() {
        const featureProjectionOptions = [];
        const dataProjectionOptions = [];

        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            featureProjectionOptions.push({
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });

            dataProjectionOptions.push({
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });
        });

        const [ featureProjectionWrapper, featureProjectionSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-feature-projection',
            text: 'Feature projection',
            options: featureProjectionOptions,
            value: Config.projection.default
        });

        const [ dataProjectionWrapper, dataProjectionSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-data-projection',
            text: 'Data projection',
            options: dataProjectionOptions,
            value: Config.projection.wgs84
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15' 
        });

        const importButton = DOM.createElement({
            element: 'button', 
            text: 'Import layer',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    const result = {
                        featureProjection: featureProjectionSelect.value.trim(),
                        dataProjection: dataProjectionSelect.value.trim()
                    };
        
                    this.close();
                    this.options.onImport instanceof Function && this.options.onImport(result);
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: 'Cancel', 
            class: `oltb-dialog__btn oltb-btn ${
                isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'
            }`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    this.options.onCancel instanceof Function && this.options.onCancel();
                }
            }
        });

        DOM.appendChildren(buttonsWrapper, [
            cancelButton, 
            importButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            featureProjectionWrapper,
            dataProjectionWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }
}

export { ImportLayerModal };
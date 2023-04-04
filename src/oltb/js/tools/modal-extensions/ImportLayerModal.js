import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../../core/Config';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { ProjectionManager } from '../../core/managers/ProjectionManager';

const FILENAME = 'modal-extensions/ImportLayerModal.js';
const PREFIX_LAYER_ID = 'oltb-import-layer-modal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onImport: undefined,
    onCancel: undefined
});

class ImportLayerModal extends ModalBase {
    constructor(options = {}) {
        super(
            'Import layer', 
            options.maximized, 
            options.onClose
        );

        this.options = { DefaultOptions, ...options };
        this.#createModal();
    }

    #createModal() {
        const featureProjectionWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const featureProjectionLabel = DOM.createElement({
            element: 'label', 
            text: 'Feature projection',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-feature-projection`
            }
        });

        const featureProjectionSelect = DOM.createElement({
            element: 'select',
            id: `${PREFIX_LAYER_ID}-feature-projection`,  
            class: 'oltb-select'
        });

        DOM.appendChildren(featureProjectionWrapper, [
            featureProjectionLabel,
            featureProjectionSelect
        ]);

        const dataProjectionWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const dataProjectionLabel = DOM.createElement({
            element: 'label', 
            text: 'Data projection',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-data-projection`
            }
        });

        const dataProjectionSelect = DOM.createElement({
            element: 'select',
            id: `${PREFIX_LAYER_ID}-data-projection`,  
            class: 'oltb-select'
        });

        DOM.appendChildren(dataProjectionWrapper, [
            dataProjectionLabel,
            dataProjectionSelect
        ]);

        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            const featureOption = DOM.createElement({
                element: 'option', 
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });

            const dataOption = DOM.createElement({
                element: 'option', 
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });

            DOM.appendChildren(featureProjectionSelect, [
                featureOption
            ]);

            DOM.appendChildren(dataProjectionSelect, [
                dataOption
            ]);
        });

        // Set the default selected values
        featureProjectionSelect.value = Config.projection.default;
        dataProjectionSelect.value = Config.projection.wgs84;

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15' 
        });

        const importButton = DOM.createElement({
            element: 'button', 
            text: 'Import layer',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    const result = {
                        featureProjection: featureProjectionSelect.value,
                        dataProjection: dataProjectionSelect.value
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
                type: 'button'
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
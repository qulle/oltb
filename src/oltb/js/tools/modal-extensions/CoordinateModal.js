import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { generateInput } from '../../generators/GenerateInput';

const FILENAME = 'modal-extensions/CoordinateModal.js';
const ID_PREFIX = 'oltb-coordinates-modal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onNavigate: undefined,
    onCancel: undefined
});

class CoordinateModal extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            'Coordinates', 
            options.maximized, 
            options.onClose
        );
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    #createModal() {
        const [ latWrapper, latInput ] = generateInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lat',
            text: 'Latitud',
            placeholder: '51.5072'
        });

        const [ lonWrapper, lonInput ] = generateInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lon',
            text: 'Longitud',
            placeholder: '0.1276'
        });
        
        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const navigateButton = DOM.createElement({
            element: 'button', 
            text: 'Navigate to',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    const result = [
                        lonInput.value.trim(), 
                        latInput.value.trim()
                    ];

                    this.close();
                    this.options.onNavigate instanceof Function && this.options.onNavigate(result);
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
            navigateButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });

        const coordinatesLabel = DOM.createElement({
            element: 'label', 
            text: 'Coordinates are given in WGS84/EPSG:4326',
            class: 'oltb-label oltb-mt-1'
        });

        DOM.appendChildren(modalContent, [
            latWrapper,
            lonWrapper,
            coordinatesLabel,
            buttonsWrapper,
        ]);

        this.show(modalContent);
    }
}

export { CoordinateModal };
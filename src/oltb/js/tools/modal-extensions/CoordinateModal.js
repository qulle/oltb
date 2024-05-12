import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { createUIInput } from '../../creators/CreateUIInput';
import { TranslationManager } from '../../managers/TranslationManager';

const FILENAME = 'modal-extensions/CoordinateModal.js';
const ID_PREFIX = 'oltb-coordinates-modal';
const I18N_BASE = 'modalExtensions.coordinateModal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onNavigate: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles navigation to entered coordinates
 */
class CoordinateModal extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            TranslationManager.get(`${I18N_BASE}.title`), 
            options.maximized, 
            options.onClose
        );
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createModal() {
        const i18n = TranslationManager.get(`${I18N_BASE}.form`);
        const [ latWrapper, latInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lat',
            text: i18n.latitude,
            placeholder: '51.5072'
        });

        const [ lonWrapper, lonInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lon',
            text: i18n.longitude,
            placeholder: '0.1276'
        });
        
        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const navigateButton = DOM.createElement({
            element: 'button', 
            text: i18n.navigateTo,
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.#onClick([
                        lonInput.value.trim(), 
                        latInput.value.trim()
                    ]);
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: i18n.cancel, 
            class: `oltb-dialog__btn oltb-btn ${
                isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'
            }`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onCancel.bind(this)
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
            text: i18n.description,
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

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onClick(result) {
        this.close();
        this.options.onNavigate instanceof Function && this.options.onNavigate(result);
    }

    #onCancel() {
        this.close();
        this.options.onCancel instanceof Function && this.options.onCancel();
    }
}

export { CoordinateModal };
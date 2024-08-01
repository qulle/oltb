import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseModal } from '../../ui-common/ui-modals/base-modal';
import { isDarkTheme } from '../../ui-helpers/is-dark-theme/is-dark-theme';
import { createUIInput } from '../../ui-creators/ui-input/create-ui-input';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const FILENAME = 'coordinate-model.js';
const ID__PREFIX = 'oltb-coordinates-modal';
const I18N__BASE = 'modalExtensions.coordinateModal';

// Note:
// Only specify the unique options to this class
// Things to override on the BaseModal is passed directly
const DefaultOptions = Object.freeze({
    onNavigate: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles navigation to entered coordinates
 */
class CoordinateModal extends BaseModal {
    #buttons = [];

    constructor(options = {}) {
        super({
            filename: FILENAME,
            title: TranslationManager.get(`${I18N__BASE}.title`), 
            ...options
        });
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModalContent();
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createModalContent() {
        const i18n = TranslationManager.get(`${I18N__BASE}.form`);
        const [ latWrapper, latInput ] = createUIInput({
            idPrefix: ID__PREFIX,
            idPostfix: '-lat',
            text: i18n.latitude,
            placeholder: '51.5072'
        });

        const [ lonWrapper, lonInput ] = createUIInput({
            idPrefix: ID__PREFIX,
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
                    this.#onNavigate([
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

        this.#buttons = [cancelButton, navigateButton];
        this.show(modalContent);
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onNavigate(result) {
        this.close();
        this.options.onNavigate && this.options.onNavigate(result);
    }

    #onCancel() {
        this.close();
        this.options.onCancel && this.options.onCancel();
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    getButtons() {
        return this.#buttons;
    }
}

export { CoordinateModal };
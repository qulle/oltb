import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseModal } from '../../ui-common/ui-modals/base-modal';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const FILENAME = 'geometry-data-modal.js';
const I18N__BASE = 'modalExtensions.geometryDataModal';

// Note:
// Only specify the unique options to this class
// Things to override on the BaseModal is passed directly
const DefaultOptions = Object.freeze({
    data: {}
});

/**
 * About:
 * Manager that handles downloading of vector layers
 */
class GeometryDataModal extends BaseModal {
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
        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        const table = DOM.createElement({
            element: 'table',
            class: 'oltb-table oltb-table--vertical'
        });

        const tbody = DOM.createElement({
            element: 'tbody'
        });

        DOM.appendChildren(table, [
            tbody
        ]);

        // TODO:
        // How to handle translations? 
        // For now the key for each property is used as the descriptor
        for(const [key, value] of Object.entries(this.options.data)) {
            const tr = DOM.createElement({
                element: 'tr'
            });

            const i18n = TranslationManager.get(`${I18N__BASE}.data`);
            const th = DOM.createElement({
                element: 'th',
                text: i18n[key]
            });

            const td = DOM.createElement({
                element: 'td',
                html: value
            });

            DOM.appendChildren(tr, [
                th,
                td
            ]);

            DOM.appendChildren(tbody, [
                tr
            ]);
        }

        DOM.appendChildren(modalContent, [
            table
        ]);

        this.show(modalContent);
    }
}

export { GeometryDataModal };
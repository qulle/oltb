import _ from 'lodash';
import { DOM } from '../helpers/browser/dom-factory';
import { BaseModal } from '../common/modals/base-modal';
import { TranslationManager } from '../managers/translation-manager/translation-manager';

const FILENAME = 'geometry-data-modal.js';
const I18N__BASE = 'modalExtensions.geometryDataModal';

const DefaultOptions = Object.freeze({
    maximized: false,
    data: {}
});

/**
 * About:
 * Manager that handles downloading of vector layers
 */
class GeometryDataModal extends BaseModal {
    constructor(options = {}) {
        super(
            TranslationManager.get(`${I18N__BASE}.title`),
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
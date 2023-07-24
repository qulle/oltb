import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { SvgPaths } from '../../core/icons/GetIcon';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { createUIInput } from '../../creators/CreateUIInput';
import { createUISelect } from '../../creators/CreateUISelect';
import { createUIColorInput } from '../../creators/CreateUIColorInput';

const FILENAME = 'modal-extensions/MarkerModal.js';
const ID_PREFIX = 'oltb-marker-modal-marker';

const DefaultOptions = Object.freeze({
    edit: false,
    coordinates: [0, 0],
    title: 'Marker',
    description: '',
    fill: '#0166A5FF',
    stroke: '#FFFFFFFF',
    icon: 'geoPin.filled',
    maximized: false,
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

class MarkerModal extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            'Marker configuration', 
            options.maximized, 
            options.onClose
        );
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    #createModal() {
        const [ titleWrapper, titleInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-title',
            text: 'Title',
            value: this.options.title
        });

        const [ descriptionWrapper, descriptionInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-description',
            text: 'Description',
            value: this.options.description
        });

        const iconOptions = [];
        for(const path in SvgPaths) {
            for(const version in SvgPaths[path]) {
                iconOptions.push({
                    text: `${path.capitalize()} (${version})`, 
                    value: `${path}.${version}`
                });
            }
        }

        const [ iconWrapper, iconSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-icon',
            text: 'Icon',
            options: iconOptions,
            value: this.options.icon
        });

        const [ latWrapper, latInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lat',
            text: 'Latitud',
            value: this.options.coordinates[1],
        });

        const [ lonWrapper, lonInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lon',
            text: 'Longitud',
            value: this.options.coordinates[0],
        });

        const [ fillWrapper, fillInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-fill',
            text: 'Fill color',
            color: this.options.fill,
        });

        const [ strokeWrapper, strokeInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-stroke',
            text: 'Stroke color',
            color: this.options.stroke,
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const createButton = DOM.createElement({
            element: 'button', 
            text: `${this.options.edit ? 'Save changes' : 'Create marker'}`, 
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid',
            attributes: {
                'type': 'button',
            },
            listeners: {
                'click': () => {
                    const result = {
                        title: titleInput.value.trim(),
                        description: descriptionInput.value.trim(),
                        icon: iconSelect.value.trim(),
                        latitude: parseFloat(latInput.value.trim()),
                        longitude: parseFloat(lonInput.value.trim()),
                        fill: fillInput.getAttribute('data-oltb-color'),
                        stroke: strokeInput.getAttribute('data-oltb-color')
                    };
        
                    this.close();
                    this.options.onCreate instanceof Function && this.options.onCreate(result);
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
            createButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            titleWrapper,
            descriptionWrapper,
            iconWrapper,
            latWrapper,
            lonWrapper,
            fillWrapper,
            strokeWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }
}

export { MarkerModal };
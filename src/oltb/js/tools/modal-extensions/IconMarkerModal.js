import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { SvgPaths } from '../../core/icons/GetIcon';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { createUIInput } from '../../creators/CreateUIInput';
import { createUISelect } from '../../creators/CreateUISelect';
import { createUIColorInput } from '../../creators/CreateUIColorInput';

const FILENAME = 'modal-extensions/IconMarkerModal.js';
const ID_PREFIX = 'oltb-marker-modal-marker';

const DefaultOptions = Object.freeze({
    edit: false,
    coordinates: [0, 0],
    title: 'Marker',
    description: '',
    markerFill: '#0166A5FF',
    markerStroke: '#FFFFFFFF',
    label: 'Marker',
    labelFill: '#FFFFFF',
    labelStroke: '#3B4352CC',
    labelStrokeWidth: 12,
    icon: 'geoPin.filled',
    maximized: false,
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

class IconMarkerModal extends ModalBase {
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

    getName() {
        return FILENAME;
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

        const [ markerFillWrapper, markerFillInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-marker-fill',
            text: 'Marker Fill',
            color: this.options.markerFill,
        });

        const [ markerStrokeWrapper, markerStrokeInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-marker-stroke',
            text: 'Marker Stroke',
            color: this.options.markerStroke,
        });

        const [ labelWrapper, labelInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-label',
            text: 'Label',
            value: this.options.label,
        });

        const [ labelFillWrapper, labelFillInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-label-fill',
            text: 'Label Fill',
            color: this.options.labelFill,
        });

        const [ labelStrokeWidthWrapper, labelStrokeWidthSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-label-stroke-width',
            text: 'Label Stroke Width',
            options: [
                {text: 1, value: 1},
                {text: 2, value: 2},
                {text: 3, value: 3},
                {text: 4, value: 4},
                {text: 5, value: 5},
                {text: 6, value: 6},
                {text: 7, value: 7},
                {text: 8, value: 8},
                {text: 9, value: 9},
                {text: 10, value: 10},
                {text: 11, value: 11},
                {text: 12, value: 12},
                {text: 13, value: 13},
                {text: 14, value: 14},
                {text: 15, value: 15},
                {text: 16, value: 16},
                {text: 17, value: 17},
                {text: 18, value: 18},
                {text: 19, value: 19},
                {text: 20, value: 20},
                {text: 21, value: 21},
                {text: 22, value: 22},
                {text: 23, value: 23},
                {text: 24, value: 24}
            ],
            value: this.options.labelStrokeWidth
        });

        const [ labelStrokeWrapper, labelStrokeInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-label-stroke',
            text: 'Label Stroke',
            color: this.options.labelStroke,
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
                        latitude: parseFloat(latInput.value.trim()),
                        longitude: parseFloat(lonInput.value.trim()),
                        title: titleInput.value.trim(),
                        description: descriptionInput.value.trim(),
                        icon: iconSelect.value.trim(),
                        markerFill: markerFillInput.getAttribute('data-oltb-color'),
                        markerStroke: markerStrokeInput.getAttribute('data-oltb-color'),
                        label: labelInput.value.trim(),
                        labelFill: labelFillInput.getAttribute('data-oltb-color'),
                        labelStrokeWidth: labelStrokeWidthSelect.value.trim(),
                        labelStroke: labelStrokeInput.getAttribute('data-oltb-color')
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
            markerFillWrapper,
            markerStrokeWrapper,
            labelWrapper,
            labelFillWrapper,
            labelStrokeWidthWrapper,
            labelStrokeWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }
}

export { IconMarkerModal };
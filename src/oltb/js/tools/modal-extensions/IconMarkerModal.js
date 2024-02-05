import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { SvgPaths } from '../../icons/GetIcon';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { createUIInput } from '../../creators/CreateUIInput';
import { createUISelect } from '../../creators/CreateUISelect';
import { createUIColorInput } from '../../creators/CreateUIColorInput';
import { TranslationManager } from '../../managers/TranslationManager';

const FILENAME = 'modal-extensions/IconMarkerModal.js';
const ID_PREFIX = 'oltb-marker-modal-marker';
const I18N_BASE = 'modalExtensions.iconMarkerModal';

const DefaultOptions = Object.freeze({
    edit: false,
    coordinates: [0, 0],
    title: 'Marker',
    description: '',
    marker: Object.freeze({
        fill: '#0166A5FF',
        stroke: '#0166A566',
    }),
    icon: Object.freeze({
        key: 'geoPin.filled',
        fill: '#FFFFFFFF',
        stroke: '#FFFFFFFF'
    }),
    label: Object.freeze({
        text: 'Marker',
        fill: '#FFFFFF',
        stroke: '#3B4352CC',
        strokeWidth: 8,
    }),
    maximized: false,
    maxLabelStrokeWidth: 24,
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles creation of Icon-Markers
 */
class IconMarkerModal extends ModalBase {
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

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    #createModal() {
        const i18n = TranslationManager.get(`${I18N_BASE}.form`);
        const [ titleWrapper, titleInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-title',
            text: i18n.title,
            value: this.options.title
        });

        const [ descriptionWrapper, descriptionInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-description',
            text: i18n.description,
            value: this.options.description
        });

        const [ latWrapper, latInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lat',
            text: i18n.latitude,
            value: this.options.coordinates[1],
        });

        const [ lonWrapper, lonInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-lon',
            text: i18n.longitude,
            value: this.options.coordinates[0],
        });

        const markerColorGroup = DOM.createElement({
            element: 'div',
            class: 'oltb-group'
        });

        const [ markerFillWrapper, markerFillInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-marker-fill',
            text: i18n.markerFill,
            color: this.options.marker.fill,
            default: DefaultOptions.marker.fill
        });

        const [ markerStrokeWrapper, markerStrokeInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-marker-stroke',
            text: i18n.markerStroke,
            color: this.options.marker.stroke,
            default: DefaultOptions.marker.stroke
        });

        DOM.appendChildren(markerColorGroup, [
            markerFillWrapper,
            markerStrokeWrapper
        ]);

        const iconOptions = [];
        for(const path in SvgPaths) {
            for(const version in SvgPaths[path]) {
                iconOptions.push({
                    text: `${path.capitalize()} | ${version}`, 
                    value: `${path}.${version}`
                });
            }
        }

        const [ iconWrapper, iconSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-icon',
            text: i18n.icon,
            options: iconOptions,
            value: this.options.icon.key,
            default: DefaultOptions.icon.key
        });

        const iconColorGroup = DOM.createElement({
            element: 'div',
            class: 'oltb-group'
        });

        const [ iconFillWrapper, iconFillInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-icon-fill',
            text: i18n.iconFill,
            color: this.options.icon.fill,
            default: DefaultOptions.icon.fill
        });

        const [ iconStrokeWrapper, iconStrokeInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-icon-stroke',
            text: i18n.iconStroke,
            color: this.options.icon.stroke,
            default: DefaultOptions.icon.stroke
        });

        DOM.appendChildren(iconColorGroup, [
            iconFillWrapper,
            iconStrokeWrapper
        ]);

        const [ labelWrapper, labelInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-label',
            text: i18n.label,
            value: this.options.label.text,
        });

        const labelColorGroup = DOM.createElement({
            element: 'div',
            class: 'oltb-group'
        });

        const [ labelFillWrapper, labelFillInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-label-fill',
            text: i18n.labelFill,
            color: this.options.label.fill,
            default: DefaultOptions.label.fill
        });

        const [ labelStrokeWrapper, labelStrokeInput ] = createUIColorInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-label-stroke',
            text: i18n.labelStroke,
            color: this.options.label.stroke,
            default: DefaultOptions.label.stroke
        });

        DOM.appendChildren(labelColorGroup, [
            labelFillWrapper,
            labelStrokeWrapper
        ]);

        const widthOptions = [];
        for(let i = 1; i <= this.options.maxLabelStrokeWidth; i++) {
            widthOptions.push({
                text: i,
                value: i
            });
        }

        const [ labelStrokeWidthWrapper, labelStrokeWidthSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-label-stroke-width',
            text: i18n.labelStrokeWidth,
            options: widthOptions,
            value: this.options.label.strokeWidth,
            default: DefaultOptions.label.strokeWidth
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const createButton = DOM.createElement({
            element: 'button', 
            text: `${this.options.edit ? i18n.saveChanges : i18n.createMarker}`, 
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid',
            attributes: {
                'type': 'button',
            },
            listeners: {
                'click': () => {
                    this.#onClick({
                        latitude: parseFloat(latInput.value.trim()),
                        longitude: parseFloat(lonInput.value.trim()),
                        title: titleInput.value.trim(),
                        description: descriptionInput.value.trim(),
                        icon: iconSelect.value.trim(),
                        iconFill: iconFillInput.getAttribute('data-oltb-color'),
                        iconStroke: iconStrokeInput.getAttribute('data-oltb-color'),
                        markerFill: markerFillInput.getAttribute('data-oltb-color'),
                        markerStroke: markerStrokeInput.getAttribute('data-oltb-color'),
                        label: labelInput.value.trim(),
                        labelFill: labelFillInput.getAttribute('data-oltb-color'),
                        labelStroke: labelStrokeInput.getAttribute('data-oltb-color'),
                        labelStrokeWidth: labelStrokeWidthSelect.value.trim()
                    });
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
            createButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            titleWrapper,
            descriptionWrapper,
            latWrapper,
            lonWrapper,
            markerColorGroup,
            iconWrapper,
            iconColorGroup,
            labelWrapper,
            labelColorGroup,
            labelStrokeWidthWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }

    // -------------------------------------------------------------------
    // # Section: Events
    // -------------------------------------------------------------------

    #onClick(result) {
        this.close();
        this.options.onCreate instanceof Function && this.options.onCreate(result);
    }

    #onCancel() {
        this.close();
        this.options.onCancel instanceof Function && this.options.onCancel();
    }
}

export { IconMarkerModal };
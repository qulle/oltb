import { DOM } from '../../helpers/browser/DOM';
import { Toast } from '../../common/Toast';
import { CONFIG } from '../../core/Config';
import { ModalBase } from '../../common/modals/ModalBase';
import { PROJECTIONS } from '../../epsg/Projections';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';

const DEFAULT_OPTIONS = Object.freeze({
    map: undefined,
    onClose: undefined
});

class DebugInfoModal extends ModalBase {
    constructor(options = {}) {
        super('Debug information', options.onClose);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const storage = {};
        Object.keys(localStorage).forEach((key) => {
            storage[key] = JSON.parse(localStorage.getItem(key) || '{}');
        });

        const view = this.options.map?.getView();
        const content = view ? {
            zoom: view.getZoom(),
            location: view.getCenter(),
            rotation: view.getRotation(),
            projection: view.getProjection(),
            proj4Defs: PROJECTIONS,
            defaultConfig: CONFIG,
            localStorage: storage
        } : {
            info: 'No map reference found'
        };

        const indentation = 4;
        const debugInformationText = DOM.createElement({
            element: 'textarea', 
            value: JSON.stringify(content, undefined, indentation),
            class: 'oltb-input oltb-thin-scrollbars',
            attributes: {
                rows: 15,
                cols: 100,
                spellcheck: 'false'
            }
        });

        const actionSelect = DOM.createElement({
            element: 'select',
            class: 'oltb-select'
        });

        [
            {
                name: 'Copy debug information',
                action: 'copy.debug.information'
            }, {
                name: 'Log map to browser console',
                action: 'log.map.to.console'
            }
        ].forEach((item) => {
            actionSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: item.name, 
                    value: item.action
                }
            ));
        });

        const actionButton = DOM.createElement({
            element: 'button',
            text: 'Do action',
            class: 'oltb-btn oltb-btn--blue-mid oltb-ml-05',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.onDoAction.bind(this)
            }
        });
        
        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        }); 

        DOM.appendChildren(buttonsWrapper, [
            actionSelect,
            actionButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content' 
        });
        
        DOM.appendChildren(modalContent, [
            debugInformationText, 
            buttonsWrapper
        ]);
        
        this.debugInformationText = debugInformationText;
        this.actionSelect = actionSelect;
        
        this.show(modalContent);
    }

    onDoAction() {
        const action = this.actionSelect.value;
        const actions = {
            'copy.debug.information': this.actionCopyDebugInfo.bind(this),
            'log.map.to.console': this.actionLoggingMap.bind(this)
        };

        const actionMethod = actions[action];

        if(actionMethod) {
            actionMethod.call();
        }
    }

    actionLoggingMap() {
        console.dir(this.options.map);
        Toast.success({
            title: 'Logged',
            message: 'Map object logged to console (F12)', 
            autoremove: 4000
        });
    }

    actionCopyDebugInfo() {
        copyToClipboard(this.debugInformationText.value)
            .then(() => {
                Toast.success({
                    title: 'Copied',
                    message: 'Debug info copied to clipboard', 
                    autoremove: 4000
                });
            })
            .catch((error) => {
                const errorMassage = 'Failed to copy debug information';

                console.error(errorMassage, error);
                Toast.error({
                    title: 'Error',
                    message: errorMassage
                });
            });
    }
}

export { DebugInfoModal };
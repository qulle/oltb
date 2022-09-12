import Dialog from '../common/Dialog';
import Toast from '../common/Toast';
import SettingsModal from './ModalExtensions/SettingsModal';
import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const DEFAULT_OPTIONS = {};

class Settings extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Settings,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Settings (U)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Clear settings', fn: () => {
            Dialog.confirm({
                text: 'Do you want to clear all settings?',
                onConfirm: () => {
                    this.clearSettings();

                    Toast.success({text: "All settings was cleared", autoremove: 3000});
                }
            });
        }});

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'u')) {
                this.handleClick(event);
            }
        });
    }

    clearSettings() {
        StateManager.clear();

        // User defined callback from constructor
        if(typeof this.options.cleared === 'function') {
            this.options.cleared();
        }

        // Emit event so that any tool can clean up
        window.dispatchEvent(new CustomEvent('oltb.settings.cleared'));
    }

    handleClick() {
        const settingsModal = new SettingsModal();
    }
}

export default Settings;
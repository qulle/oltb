import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../core/managers/StateManager';
import { SettingsModal } from './modal-extensions/SettingsModal';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { SettingsManager } from '../core/managers/SettingsManager';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const DEFAULT_OPTIONS = Object.freeze({});

class SettingsTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Gear.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Settings (${SHORTCUT_KEYS.Settings})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.settingsModal = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        ContextMenu.addItem({
            icon: icon, 
            name: 'Clear settings', 
            fn: this.onContextMenuSettingsClear.bind(this)
        });

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Settings)) {
            this.handleClick(event);
        }
    }

    onContextMenuSettingsClear(map, coordinates, target) {
        Dialog.confirm({
            title: 'Clear settings',
            message: 'Do you want to clear and reset all settings?',
            confirmText: 'Clear',
            onConfirm: () => {
                this.clearSettings();

                Toast.success({
                    title: 'Cleared',
                    message: "All stored settings was cleared", 
                    autoremove: CONFIG.AutoRemovalDuation.Normal
                });
            }
        });
    }

    clearSettings() {
        [
            SettingsManager, 
            StateManager
        ].forEach((manager) => {
            manager.clear();
        });

        // User defined callback from constructor
        if(typeof this.options.cleared === 'function') {
            this.options.cleared();
        }

        // Emit event so that any tool can clean up
        window.dispatchEvent(new CustomEvent(EVENTS.Custom.SettingsCleared));
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(this.settingsModal) {
            return;
        }

        this.settingsModal = new SettingsModal({
            onClose: () => {
                this.settingsModal = undefined;
            }
        });
    }
}

export { SettingsTool };
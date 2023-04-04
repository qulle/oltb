import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { SettingsModal } from './modal-extensions/SettingsModal';
import { ElementManager } from '../core/managers/ElementManager';
import { SettingsManager } from '../core/managers/SettingsManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/SettingsTool.js';

const DefaultOptions = Object.freeze({
    click: undefined,
    cleared: undefined
});

class SettingsTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.gear.stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Settings (${ShortcutKeys.settingsTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.settingsModal = undefined;
        this.options = { ...DefaultOptions, ...options };

        ContextMenu.addItem({
            icon: icon, 
            name: 'Clear settings', 
            fn: this.onContextMenuSettingsClear.bind(this)
        });

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.settingsTool)) {
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
                    autoremove: Config.autoRemovalDuation.normal
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
        if(this.options.cleared instanceof Function) {
            this.options.cleared();
        }

        // Emit event so that any tool can clean up
        window.dispatchEvent(new CustomEvent(Events.custom.settingsCleared));
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(Boolean(this.settingsModal)) {
            return;
        }

        this.settingsModal = new SettingsModal({
            onSave: () => {
                Toast.success({
                    title: 'Saved',
                    message: "All settings settings was saved", 
                    autoremove: Config.autoRemovalDuation.normal
                });
            },
            onClose: () => {
                this.settingsModal = undefined;
            }
        });
    }
}

export { SettingsTool };
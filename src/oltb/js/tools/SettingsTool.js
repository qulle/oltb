import _ from 'lodash';
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
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onClick: undefined,
    onCleared: undefined
});

class SettingsTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.gear.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                type: 'button',
                'data-tippy-content': `Settings (${ShortcutKeys.settingsTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.settingsModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        ContextMenu.addItem({
            icon: icon, 
            name: 'Clear settings', 
            fn: this.onContextMenuSettingsClear.bind(this)
        });

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.settingsTool)) {
            this.onClickTool(event);
        }
    }

    onContextMenuSettingsClear(map, coordinates, target) {
        Dialog.confirm({
            title: 'Clear settings',
            message: 'Do you want to clear and reset all settings?',
            confirmText: 'Clear',
            onConfirm: () => {
                this.clearSettings();

                Toast.info({
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

        // Note: Consumer callback
        if(this.options.onCleared instanceof Function) {
            this.options.onCleared();
        }

        // Emit event so that any tool can clean up
        window.dispatchEvent(new CustomEvent(Events.custom.settingsCleared));
    }

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(this.settingsModal) {
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
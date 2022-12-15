import DOM from '../helpers/browser/DOM';
import Toast from '../common/Toast';
import Dialog from '../common/Dialog';
import StateManager from '../core/managers/StateManager';
import SettingsModal from './modal-extensions/SettingsModal';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { CONTEXT_MENUS } from '../helpers/constants/ContextMenus';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const DEFAULT_OPTIONS = {};

class SettingsTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.settings,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Settings (${SHORTCUT_KEYS.settings})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.settingsModal = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        addContextMenuItem(CONTEXT_MENUS.mainMap, {
            icon: icon, 
            name: 'Clear settings', 
            fn: this.onContextMenuSettingsClear.bind(this)
        });

        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.settings)) {
            this.handleClick(event);
        }
    }

    onContextMenuSettingsClear(map, coordinates, target) {
        Dialog.confirm({
            text: 'Do you want to clear all settings?',
            onConfirm: () => {
                this.clearSettings();

                Toast.success({text: "All settings was cleared", autoremove: 4000});
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
        window.dispatchEvent(new CustomEvent(EVENTS.custom.settingsCleared));
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

export default SettingsTool;
import Dialog from '../common/Dialog';
import Toast from '../common/Toast';
import SettingsModal from './ModalExtensions/SettingsModal';
import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const DEFAULT_OPTIONS = {};

class Settings extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Settings,
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

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Clear settings', fn: this.onContextMenuSettingsClear.bind(this)});

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Settings)) {
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
        window.dispatchEvent(new CustomEvent('oltb.settings.cleared'));
    }

    handleClick() {
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

export default Settings;
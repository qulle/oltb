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
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined
});

/**
 * About:
 * Various settings for the Map and its tools
 * 
 * Description:
 * Check settings for Map zooming, panning, rotating, copying coordinates, etc.
 */
class SettingsTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        this.icon = getIcon({
            path: SvgPaths.gear.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
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

        this.initContextMenuItems();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initContextMenuItems() {
        ContextMenu.addItem({
            icon: this.icon, 
            name: 'Clear Browser State', 
            fn: this.onContextMenuBrowserStateClear.bind(this)
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        this.momentaryActivation();

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        if(this.settingsModal) {
            return;
        }

        this.showSettingsModal();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.settingsTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    // -------------------------------------------------------------------

    onContextMenuBrowserStateClear(map, coordinates, target) {
        Dialog.confirm({
            title: 'Clear Browser State',
            message: 'Do you want to reset <strong>all</strong> items to default state for the Toolbar?',
            confirmText: 'Clear',
            onConfirm: () => {
                this.clearBrowserState();

                Toast.info({
                    title: 'Cleared',
                    message: "All stored items was reset to default", 
                    autoremove: Config.autoRemovalDuation.normal
                });
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Actions
    // -------------------------------------------------------------------

    showSettingsModal() {
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

    clearBrowserState() {
        // Emit event so that any tool can clean up
        window.dispatchEvent(new CustomEvent(Events.custom.browserStateCleared));

        // Reset Managers as last step
        [
            SettingsManager, 
            StateManager
        ].forEach((manager) => {
            manager.clear();
        });

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }
}

export { SettingsTool };
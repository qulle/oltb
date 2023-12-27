import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { SettingsModal } from './modal-extensions/SettingsModal';
import { ElementManager } from '../managers/ElementManager';
import { SettingsManager } from '../managers/SettingsManager';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/SettingsTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.settingsTool';

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

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.settingsTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.settingsTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
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

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initContextMenuItems() {
        ContextMenu.addItem({});
        ContextMenu.addItem({
            icon: this.icon, 
            i18nKey: `${I18N_BASE}.contextItems.clearBrowserState`, 
            fn: this.onContextMenuBrowserStateClear.bind(this)
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doShowSettingsModal();
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
        this.askToClearBrowserState();
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    askToClearBrowserState() {
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.confirms.clearBrowserState`);

        Dialog.confirm({
            title: i18n.title,
            message: i18n.message,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                this.doClearBrowserState();
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doClearBrowserState() {
        this.doDispatchBrowserStateCleared();

        Toast.info({
            i18nKey: `${I18N_BASE}.toasts.infos.clearBrowserState`,
            autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
        });
    }

    doShowSettingsModal() {
        if(this.settingsModal) {
            return;
        }
        
        this.settingsModal = new SettingsModal({
            onSave: () => {
                Toast.success({
                    i18nKey: `${I18N_BASE}.toasts.successes.savedSettings`,
                    autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
                });
            },
            onClose: () => {
                this.settingsModal = undefined;
            }
        });
    }

    doDispatchBrowserStateCleared() {
        // Note: 
        // Trigger event so that any tool can clean up
        window.dispatchEvent(new CustomEvent(Events.custom.browserStateCleared));

        [
            SettingsManager, 
            StateManager
        ].forEach((manager) => {
            manager.clear();
        });

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }
}

export { SettingsTool };
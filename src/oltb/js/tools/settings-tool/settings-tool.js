import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from '../../common/toasts/toast';
import { Dialog } from '../../common/dialogs/dialog';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { StateManager } from '../../managers/state-manager/state-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ConfigManager } from '../../managers/config-manager/config-manager';
import { SettingsModal } from '../../modal-extensions/settings-modal';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { SettingsManager } from '../../managers/settings-manager/settings-manager';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'SettingsTool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.settingsTool';

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
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.settingsTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.settingsTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initContextMenuItems() {
        ContextMenuTool.addItem({});
        ContextMenuTool.addItem({
            icon: this.icon, 
            i18nKey: `${I18N__BASE}.contextItems.clearBrowserState`, 
            fn: this.onContextMenuBrowserStateClear.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.settingsTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    onContextMenuBrowserStateClear(map, coordinates, target) {
        this.askToClearBrowserState();
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    askToClearBrowserState() {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.clearBrowserState`);

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

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doClearBrowserState() {
        this.doDispatchBrowserStateCleared();

        Toast.info({
            i18nKey: `${I18N__BASE}.toasts.infos.clearBrowserState`,
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
                    i18nKey: `${I18N__BASE}.toasts.successes.savedSettings`,
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
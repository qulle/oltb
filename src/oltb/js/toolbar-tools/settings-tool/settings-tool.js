import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Dialog } from '../../ui-common/ui-dialogs/dialog';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { SettingsModal } from '../../ui-extensions/settings-modal/settings-modal';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'settings-tool.js';
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
class SettingsTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        this.icon = getSvgIcon({
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

        this.#initContextMenuItems();
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initContextMenuItems() {
        ContextMenuTool.addItem({});
        ContextMenuTool.addItem({
            icon: this.icon, 
            i18nKey: `${I18N__BASE}.contextItems.clearBrowserState`, 
            fn: this.#onContextMenuBrowserStateClear.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        this.doShowSettingsModal();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.settingsTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    #onContextMenuBrowserStateClear(map, coordinates, target) {
        this.askToClearBrowserState();
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    askToClearBrowserState() {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.clearBrowserState`);

        return Dialog.confirm({
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
            autoremove: true
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
                    autoremove: true
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
        EventManager.dispatchCustomEvent([window], Events.custom.browserStateCleared);

        [
            SettingsManager, 
            StateManager
        ].forEach((manager) => {
            manager.clear();
        });

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }
}

export { SettingsTool };
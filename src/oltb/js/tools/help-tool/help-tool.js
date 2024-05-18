import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from '../../common/toasts/toast';
import { Dialog } from '../../common/dialogs/dialog';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'HelpTool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.helpTool';

const DefaultOptions = Object.freeze({
    url: 'https://github.com/qulle/oltb',
    target: '_blank',
    onInitiated: undefined,
    onClicked: undefined
});

/**
 * About:
 * Open help or documentation pages
 * 
 * Description:
 * Open documentation for the functions of the Map or your application as a whole, corresponds to F1 in many computer applications.
 */
class HelpTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.questionCircle.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.helpTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.helpTool})`,
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
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

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
        this.doOpenTabOrWindow();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.helpTool)) {
            this.onClickTool();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToOpenTabOrWindow() {
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.openHelp`);

        Dialog.confirm({
            title: i18n.title,
            message: i18n.message,
            confirmClass: Dialog.Success,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: () => {
                this.doOpenTabOrWindow();
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doOpenTabOrWindow() {
        try {
            window.open(this.options.url, this.options.target).focus();
        }catch(error) {
            LogManager.logError(FILENAME, 'doOpenTabOrWindow', {
                message: 'Action was restricted by browser settings',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.blockedByBrowser`
            });
        }
    }
}

export { HelpTool };
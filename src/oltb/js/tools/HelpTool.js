import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../core/managers/TranslationManager';

const FILENAME = 'tools/HelpTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

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
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get('tools.helpTool');
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.helpTool})`
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

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
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
        this.doOpenTabOrWindow();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.helpTool)) {
            this.onClickTool();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Ask User
    // -------------------------------------------------------------------

    askToOpenTabOrWindow() {
        const i18n = TranslationManager.get('tools.helpTool.dialogs.openHelp');

        Dialog.confirm({
            title: i18n.title,
            message: i18n.message,
            confirmClass: Dialog.Success,
            confirmText: i18n.confirmText,
            onConfirm: () => {
                this.doOpenTabOrWindow();
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doOpenTabOrWindow() {
        try {
            window.open(this.options.url, this.options.target).focus();
        }catch(error) {
            const i18n = TranslationManager.get('tools.helpTool.toasts.blockedByBrowserError');

            LogManager.logError(FILENAME, 'doOpenTabOrWindow', {
                message: i18n.message,
                error: error
            });
            
            Toast.error({
                title: i18n.title,
                message: i18n.message
            });
        }
    }
}

export { HelpTool };
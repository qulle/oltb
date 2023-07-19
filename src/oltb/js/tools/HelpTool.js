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

const FILENAME = 'tools/HelpTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    url: 'https://github.com/qulle/oltb',
    target: '_blank',
    onClick: undefined
});

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

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Help (${ShortcutKeys.helpTool})`
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
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        try {
            window.open(this.options.url, this.options.target).focus();
        }catch(error) {
            const errorMessage = 'Action was restricted by browser settings';
            LogManager.logError(FILENAME, 'momentaryActivation', {
                message: errorMessage,
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        }
    }

    // -------------------------------------------------------------------
    // # Section: Window/Document Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.helpTool)) {
            Dialog.confirm({
                title: 'Help pages',
                message: 'Browsers block automatic opening new windows, here is a button for you to press',
                confirmClass: Dialog.Success,
                confirmText: 'Open Help',
                onConfirm: () => {
                    this.onClickTool();
                }
            });
        }
    }
}

export { HelpTool };
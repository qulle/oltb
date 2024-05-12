import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom';
import { Modal } from '../../common/Modal';
import { Events } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../managers/LogManager';
import { ShortcutKeys } from '../../helpers/constants/ShortcutKeys';
import { ElementManager } from '../managers/ElementManager';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/InfoTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.infoTool';

const DefaultOptions = Object.freeze({
    title: 'Hey!',
    content: 'This is the default content, try adding some content of your own.',
    onInitiated: undefined,
    onClicked: undefined
});

/**
 * About:
 * Display an information modal
 * 
 * Description:
 * The information window can contain shorter help descriptions, news, shortcuts, operating information, etc.
 */
class InfoTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.infoCircle.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.infoTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.infoTool})`,
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
        this.infoModal = undefined;
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
        this.doShowInfoModal();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.infoTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doShowInfoModal() {
        if(this.infoModal) {
            return;
        }
        
        this.infoModal = Modal.create({
            title: this.options.title, 
            content: this.options.content,
            onClose: () => {
                this.infoModal = undefined;
            }
        });
    }
}

export { InfoTool };
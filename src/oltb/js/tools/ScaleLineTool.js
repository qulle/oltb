import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Events } from '../helpers/constants/Events';
import { LogManager } from '../managers/LogManager';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { Control, ScaleLine } from 'ol/control';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/ScaleLineTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.scaleLineTool';

const DefaultOptions = Object.freeze({
    units: 'metric',
    onInitiated: undefined,
    onClicked: undefined
});

const LocalStorageNodeName = LocalStorageKeys.scaleLineTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false
});

/**
 * About:
 * Show current distance scaling
 * 
 * Description:
 * Depending on zoom level and position on the Map, a fixed distance will vary in value. 
 * This is reflected in the scaling component.
 */
class ScaleLineTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.scaleLine.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.scaleLineTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        
        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.scaleLine = this.generateOLScaleLine();
        
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));

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

        if(this.isActive) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doAddScaleLine(map);

        this.isActive = true;
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.doRemoveScaleLine();

        this.isActive = false;
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    // -------------------------------------------------------------------
    // # Section: Generate Helpers
    // -------------------------------------------------------------------

    generateOLScaleLine() {
        return new ScaleLine({
            units: this.options.units
        });
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.scaleLineTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doAddScaleLine(map) {
        this.scaleLine.setMap(map);
    }

    doRemoveScaleLine() {
        this.scaleLine.setMap(null);
    }
}

export { ScaleLineTool };
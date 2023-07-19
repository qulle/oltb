import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Stroke } from 'ol/style';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { Graticule } from 'ol/layer';
import { LogManager } from '../core/managers/LogManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/GraticuleTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    color: '#3B4352E6',
    dashed: true,
    width: 2,
    showLabels: true,
    wrapX: true,
    onClick: undefined
});

const LocalStorageNodeName = LocalStorageKeys.graticuleTool;
const LocalStorageDefaults = Object.freeze({
    active: false
});

class GraticuleTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.globe.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Show graticule (${ShortcutKeys.graticuleTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );
        
        this.graticule = this.generateGraticule();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    // -------------------------------------------------------------------
    // # Section: Generate Helpers
    // -------------------------------------------------------------------

    generateGraticule() {
        return new Graticule({
            strokeStyle: new Stroke({
                color: this.options.color,
                width: this.options.width,
                lineDash: this.options.dashed ? [1, 4] : [0, 0],
            }),
            showLabels: this.options.showLabels,
            visible: true,
            wrapX: this.options.wrapX,
        });
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

        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.graticule.setMap(map);

        this.active = true;
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.graticule.setMap(null);

        this.active = false;
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    // -------------------------------------------------------------------
    // # Section: Window/Document Events
    // -------------------------------------------------------------------

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.graticuleTool)) {
            this.onClickTool(event);
        }
    }
}

export { GraticuleTool };
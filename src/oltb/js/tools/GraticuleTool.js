import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Stroke } from 'ol/style';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { Graticule } from 'ol/layer';
import { LogManager } from '../managers/LogManager';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/GraticuleTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.graticuleTool';
const DASHED_ON = [1, 4];
const DASHED_OFF = [0, 0];

const DefaultOptions = Object.freeze({
    color: '#3B4352E6',
    dashed: true,
    width: 2,
    showLabels: true,
    wrapX: true,
    onInitiated: undefined,
    onClicked: undefined
});

const LocalStorageNodeName = LocalStorageKeys.graticuleTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false
});

/**
 * About:
 * Graphical depiction of a coordinate system as a grid of lines
 * 
 * Description:
 * Show a graphical depiction of a coordinate system as a grid of lines both in vertical and horizontal directions.
 */
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

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.graticuleTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.graticuleTool})`,
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
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );
        
        this.graticule = this.generateOLGraticule();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));

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
    // # Section: Generate Helpers
    // -------------------------------------------------------------------

    generateOLGraticule() {
        return new Graticule({
            strokeStyle: new Stroke({
                color: this.options.color,
                width: this.options.width,
                lineDash: this.options.dashed ? DASHED_ON : DASHED_OFF,
            }),
            showLabels: this.options.showLabels,
            isVisible: true,
            wrapX: this.options.wrapX,
        });
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

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doAddGraticuleLines(map);

        this.isActive = true;
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.doRemoveGraticuleLines();

        this.isActive = false;
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
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
        if(isShortcutKeyOnly(event, ShortcutKeys.graticuleTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doAddGraticuleLines(map) {
        this.graticule.setMap(map);
    }

    doRemoveGraticuleLines() {
        this.graticule.setMap(null);
    }
}

export { GraticuleTool };
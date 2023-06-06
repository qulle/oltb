import { OSM } from 'ol/source';
import { DOM } from '../helpers/browser/DOM';
import { Tile } from 'ol/layer';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { LogManager } from '../core/managers/LogManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { Control, OverviewMap } from 'ol/control';

const FILENAME = 'tools/OverviewTool.js';
const TOOL_BUTTON_CLASS = 'oltb-tool-button';
const TOOLBOX_SECTION_CLASS = 'oltb-toolbox-section';
const ID_PREFIX = 'oltb-overview';

const DefaultOptions = Object.freeze({
    click: undefined
});

const LocalStorageNodeName = LocalStorageKeys.overviewTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false
});

class OverviewTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.aspectRatio.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `Area overview (${ShortcutKeys.overviewTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = { ...DefaultOptions, ...options };

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${TOOLBOX_SECTION_CLASS}">
                <div class="${TOOLBOX_SECTION_CLASS}__header">
                    <h4 class="${TOOLBOX_SECTION_CLASS}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Overview tool
                        <span class="${TOOLBOX_SECTION_CLASS}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${TOOLBOX_SECTION_CLASS}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="${TOOLBOX_SECTION_CLASS}__group" id="${ID_PREFIX}-target"></div>
                </div>
            </div>
        `);

        this.overviewToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        const toggleableTriggers = this.overviewToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        this.overviewMap = new OverviewMap({
            target: 'oltb-overview-target',
            collapsed: false,
            collapsible: false,
            layers: [
                new Tile({
                    source: new OSM(),
                }),
            ]
        });

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        
            // Force render of overview, 
            // Other solutions will not render the dashed box correctly until the map is moved
            this.overviewMap.setMap(null);
            this.overviewMap.setMap(map);
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.overviewTool)) {
            this.handleClick(event);
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = { ...LocalStorageDefaults };
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
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

        // The class must be added before setMap or the overview will not render correctly
        this.overviewToolbox.classList.add(`${TOOLBOX_SECTION_CLASS}--show`);
        this.overviewMap.setMap(map);

        this.active = true;
        this.button.classList.add(`${TOOL_BUTTON_CLASS}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.overviewMap.setMap(null);

        this.active = false;
        this.button.classList.remove(`${TOOL_BUTTON_CLASS}--active`);
        this.overviewToolbox.classList.remove(`${TOOLBOX_SECTION_CLASS}--show`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }
}

export { OverviewTool };
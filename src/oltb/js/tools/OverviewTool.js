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
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.aspectRatio.stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
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

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Overview tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group" id="${ID_PREFIX}-target"></div>
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
        if(!Boolean(map)) {
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
        if(Boolean(this.localStorage.active)) {
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
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(Boolean(this.active)) {
            this.deActivateTool();
        }else {
            this.activateTool(); 
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        // The class must be added before setMap or the overview will not render correctly
        this.overviewToolbox.classList.add('oltb-toolbox-section--show');
        this.overviewMap.setMap(map);

        this.active = true;
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.overviewMap.setMap(null);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');
        this.overviewToolbox.classList.remove('oltb-toolbox-section--show');

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }
}

export { OverviewTool };
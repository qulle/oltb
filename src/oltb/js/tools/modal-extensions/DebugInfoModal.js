import { DOM } from '../../helpers/browser/DOM';
import { Toast } from '../../common/Toast';
import { CONFIG } from '../../core/Config';
import { EVENTS } from '../../helpers/constants/Events';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { PROJECTIONS } from '../../epsg/Projections';
import { getIcon, SVG_PATHS } from '../../core/icons/GetIcon';

const FILENAME = 'modal-extensions/DebugInfoModal.js';
const ID_PREFIX = 'oltb-debug';
const DEFAULT_OPTIONS = Object.freeze({
    map: undefined,
    maximized: true,
    onClose: undefined
});

class DebugInfoModal extends ModalBase {
    constructor(options = {}) {
        super(
            'Debug information', 
            DEFAULT_OPTIONS.maximized, 
            options.onClose
        );
        
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const modalContent = this.#generateModalContent();

        this.show(modalContent);

        const toggleableTriggers = modalContent.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleSection.bind(this, toggle));
        });
    }

    #generateCommandSection() {
        const actionSelect = DOM.createElement({
            element: 'select',
            class: 'oltb-select'
        });

        [
            {
                name: 'Log map to browser console',
                action: 'log.map.to.console'
            }
        ].forEach((item) => {
            actionSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: item.name, 
                    value: item.action
                }
            ));
        });

        const actionButton = DOM.createElement({
            element: 'button',
            text: 'Do action',
            class: 'oltb-btn oltb-btn--blue-mid oltb-ml-05',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.onDoAction.bind(this)
            }
        });
        
        const commandsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-debug__commands oltb-d-flex oltb-justify-content-between oltb-mt-15'
        }); 

        DOM.appendChildren(commandsWrapper, [
            actionSelect,
            actionButton
        ]);

        this.actionSelect = actionSelect;

        return commandsWrapper;
    }

    #generateSection(section, index) {
        const sectionWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-debug'
        });

        const sectionHeader = DOM.createElement({
            element: 'div',
            class: 'oltb-debug__header oltb-toggleable',
            attributes: {
                'data-oltb-toggleable-target': `${ID_PREFIX}-section-${index}`
            }
        });

        const sectionTitle = DOM.createElement({
            element: 'h4',
            class: 'oltb-debug__title',
            text: section.title
        });

        const sectionToggle = DOM.createElement({
            element: 'button', 
            html: getIcon({
                path: SVG_PATHS.ChevronExpand.Stroked, 
                fill: 'none', 
                stroke: 'currentColor',
                width: 16,
                height: 16,
            }),
            title: 'Toggle section',
            class: 'oltb-debug__toggle oltb-btn oltb-btn--blank oltb-tippy',
            attributes: {
                type: 'button'
            }
        });

        const sectionContent = DOM.createElement({
            element: 'div',
            class: 'oltb-debug__content',
            style: `display: ${section.display};`,
            id: `${ID_PREFIX}-section-${index}`
        });

        if(section.json) {
            const jsonSection = this.#generateJSONSection(section);
            DOM.appendChildren(sectionContent, [
                jsonSection
            ]);
        }else {
            const logSection = this.#generateLogSection(section);
            DOM.appendChildren(sectionContent, [
                logSection
            ]);
        }

        DOM.appendChildren(sectionHeader, [
            sectionTitle, 
            sectionToggle
        ]);

        DOM.appendChildren(sectionWrapper, [
            sectionHeader, 
            sectionContent
        ]);

        return sectionWrapper;
    }

    #generateJSONSection(section) {
        const sectionPre = DOM.createElement({
            element: 'pre',
            class: 'oltb-debug__json oltb-thin-scrollbars'
        });

        const sectionCode = DOM.createElement({
            element: 'code',
            text: JSON.stringify(section.content, undefined, 4),
        });

        DOM.appendChildren(sectionPre, [
            sectionCode
        ]);

        return sectionPre;
    }

    #generateLogSection(section) {
        const eventlogList = DOM.createElement({
            element: 'ul',
            class: 'oltb-debug__log'
        });

        section.content.forEach((entry) => {
            const logItem = DOM.createElement({
                element: 'li',
                html: entry.level.icon + entry.origin + entry.method + entry.value,
                class: 'oltb-debug__log-item'
            });

            DOM.appendChildren(eventlogList, [
                logItem
            ]);
        });

        return eventlogList;
    }

    #generateModalContent() {
        const commandsWrapper = this.#generateCommandSection();

        // Browser LocalStorage
        const localStorageContent = {};
        Object.keys(localStorage).forEach((key) => {
            try {
                localStorageContent[key] = JSON.parse(localStorage.getItem(key) || '{}');
            }catch (error) {
                LogManager.logError('DebugInfoModal.js', 'constructor', {
                    message: 'Error parsing localstorage',
                    error: error
                });
            }
        });

        // Browser SectionStorage
        const sessionStorageContent = {};
        Object.keys(sessionStorage).forEach((key) => {
            try {
                sessionStorageContent[key] = JSON.parse(localStorage.getItem(key) || '{}');
            } catch (error) {
                LogManager.logError('DebugInfoModal.js', 'constructor', {
                    message: 'Error parsing sessionStorage',
                    error: error
                });
            }
        });

        // Browser Cookies
        const cookiesContent = Object.fromEntries(document.cookie.split('; ').map((c) => {
            return c.split('=');
        }));

        // Eventlog
        const eventlog = LogManager.getLog();

        // OL Information
        const view = this.options.map?.getView();
        const debugContent = view ? {
            zoom: view.getZoom(),
            location: view.getCenter(),
            rotation: view.getRotation(),
            projection: view.getProjection(),
            proj4Defs: PROJECTIONS,
            defaultConfig: CONFIG
        } : {
            info: 'No map reference found'
        };

        // Generate sections
        const sectionFragment = document.createDocumentFragment(); 
        [
            {
                title: 'Local Storage',
                content: localStorageContent,
                display: 'none',
                json: true
            },
            {
                title: 'Session Storage',
                content: sessionStorageContent,
                display: 'none',
                json: true
            }, {
                title: 'Cookies',
                content: cookiesContent,
                display: 'none',
                json: true
            }, {
                title: 'App data',
                content: debugContent,
                display: 'none',
                json: true
            }, {
                title: 'Eventlog',
                content: eventlog,
                display: 'block',
                json: false
            }
        ].forEach((section, index) => {
            const sectionWrapper = this.#generateSection(section, index);
            DOM.appendChildren(sectionFragment, [
                sectionWrapper
            ]);
        });

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content' 
        });
        
        DOM.appendChildren(modalContent, [
            commandsWrapper,
            sectionFragment
        ]);

        return modalContent;
    }

    onToggleSection(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(CONFIG.AnimationDuration.Fast);
    }

    onDoAction() {
        const action = this.actionSelect.value;
        const actions = {
            'log.map.to.console': this.actionLoggingMap.bind(this)
        };

        const actionMethod = actions[action];

        if(actionMethod) {
            actionMethod.call();
        }
    }

    actionLoggingMap() {
        console.dir(this.options.map);
        Toast.success({
            title: 'Logged',
            message: 'Map object logged to console (F12)', 
            autoremove: CONFIG.AutoRemovalDuation.Normal
        });
    }
}

export { DebugInfoModal };
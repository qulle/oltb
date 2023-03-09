import { DOM } from '../../helpers/browser/DOM';
import { Toast } from '../../common/Toast';
import { CONFIG } from '../../core/Config';
import { EVENTS } from '../../helpers/constants/Events';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { ProjectionManager } from '../../core/managers/ProjectionManager';
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
        this.#createModal();
    }

    #createModal() {
        const modalContent = this.#generateModalContent();
        this.show(modalContent);

        const toggleableTriggers = modalContent.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleSection.bind(this, toggle));
        });
    }

    #generateCommandSection() {
        const commandsCollection = DOM.createElement({
            element: 'select',
            class: 'oltb-select'
        });

        [
            {
                name: 'Log map to browser console',
                action: 'log.map.to.console'
            }
        ].forEach((item) => {
            const option = DOM.createElement({
                element: 'option', 
                text: item.name, 
                value: item.action
            });

            DOM.appendChildren(commandsCollection, [
                option
            ]);
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
            commandsCollection,
            actionButton
        ]);

        this.commandsCollection = commandsCollection;

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

        DOM.appendChildren(sectionHeader, [
            sectionTitle, 
            sectionToggle
        ]);

        const sectionContent = DOM.createElement({
            element: 'div',
            class: 'oltb-debug__content',
            style: `display: ${section.display};`,
            id: `${ID_PREFIX}-section-${index}`
        });

        if(Boolean(section.json)) {
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

        DOM.appendChildren(sectionWrapper, [
            sectionHeader, 
            sectionContent
        ]);

        return sectionWrapper;
    }

    #generateJSONSection(section) {
        const sectionPre = DOM.createElement({
            element: 'pre',
            class: `${section.class} oltb-thin-scrollbars`
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
        const eventLog = DOM.createElement({
            element: 'div',
            class: 'oltb-log oltb-thin-scrollbars'
        });

        section.content.forEach((entry, index) => {
            if(typeof entry.value === 'string') {
                const logItem = this.#generateTextLogItem(entry);
                DOM.appendChildren(eventLog, [
                    logItem
                ]);
            }else {
                const logItem = this.#generateObjectLogItem(entry, index);
                DOM.appendChildren(eventLog, [
                    logItem
                ]);
            }
        });

        return eventLog;
    }

    #generateTextLogItem(entry) {
        const logHeader = DOM.createElement({
            element: 'div',
            class: 'oltb-log__header',
        });

        const logTitle = DOM.createElement({
            element: 'span',
            class: 'oltb-log__title', 
            html: `
                <span class="oltb-tippy" title="${entry.level.info}">${
                    entry.level.icon
                }</span> <strong>${
                    entry.timestamp
                }</strong> 🡒 ${
                    entry.origin
                } 🡒 ${
                    entry.method
                } 🡒 ${
                    entry.value
                }
            `
        }); 

        DOM.appendChildren(logHeader, [
            logTitle
        ]);

        const logItem = DOM.createElement({
            element: 'div',
            class: 'oltb-log__item'
        });

        DOM.appendChildren(logItem, [
            logHeader
        ]);

        return logItem;
    }

    #generateObjectLogItem(entry, index) {
        const logHeader = DOM.createElement({
            element: 'div',
            class: 'oltb-log__header oltb-log__header--toggleable oltb-toggleable',
            attributes: {
                'data-oltb-toggleable-target': `${ID_PREFIX}-log-item-${index}`
            }
        });

        const logTitle = DOM.createElement({
            element: 'span',
            class: 'oltb-log__title', 
            html: `
                <span class="oltb-tippy" title="${entry.level.info}">${
                    entry.level.icon
                }</span> <strong>${
                    entry.timestamp
                }</strong> 🡒 ${
                    entry.origin
                } 🡒 ${
                    entry.method
                }
            `
        }); 

        const logToggle = DOM.createElement({
            element: 'button', 
            html: getIcon({
                path: SVG_PATHS.ChevronExpand.Stroked, 
                fill: 'none', 
                stroke: 'currentColor',
                width: 16,
                height: 16,
            }),
            title: 'Toggle section',
            class: 'oltb-log__toggle oltb-btn oltb-btn--blank oltb-tippy',
            attributes: {
                type: 'button'
            }
        });

        DOM.appendChildren(logHeader, [
            logTitle,
            logToggle
        ]);

        const logContent = DOM.createElement({
            element: 'div',
            style: 'display: none;',
            id: `${ID_PREFIX}-log-item-${index}`
        });

        const jsonSection = this.#generateJSONSection({
            content: entry.value,
            class: 'oltb-log__json'
        }, true);

        DOM.appendChildren(logContent, [
            jsonSection
        ]);

        const logItem = DOM.createElement({
            element: 'div',
            class: 'oltb-log__item'
        });

        DOM.appendChildren(logItem, [
            logHeader,
            logContent
        ]);

        return logItem;
    }

    #generateModalContent() {
        const commandsWrapper = this.#generateCommandSection();

        // OL Information
        const view = this.options.map?.getView();
        const appDataContent = view ? {
            zoom: view.getZoom(),
            location: view.getCenter(),
            rotation: view.getRotation(),
            projection: view.getProjection(),
            proj4Defs: ProjectionManager.getProjections(),
            defaultConfig: CONFIG
        } : {
            info: 'No map reference found'
        };

        // Browser LocalStorage
        const localStorageContent = {};
        Object.keys(localStorage).forEach((key) => {
            try {
                localStorageContent[key] = JSON.parse(localStorage.getItem(key)) || {};
            }catch (error) {
                LogManager.logError(FILENAME, 'generateModalContent', {
                    message: 'Error parsing localstorage',
                    error: error
                });
            }
        });

        // Browser SessionStorage
        const sessionStorageContent = {};
        Object.keys(sessionStorage).forEach((key) => {
            try {
                sessionStorageContent[key] = JSON.parse(localStorage.getItem(key)) || {};
            } catch (error) {
                LogManager.logError(FILENAME, 'generateModalContent', {
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
        const eventlog = LogManager.getLog().slice().reverse();

        // Generate sections
        const sectionFragment = document.createDocumentFragment(); 
        [
            {
                title: 'App data',
                content: appDataContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: 'Local Storage',
                content: localStorageContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: 'Session Storage',
                content: sessionStorageContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: 'Cookies',
                content: cookiesContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: 'Eventlog',
                content: eventlog,
                class: 'oltb-debug__json',
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
        document.getElementById(targetName)?.slideToggle(CONFIG.AnimationDuration.Fast);
    }

    onDoAction() {
        const action = this.commandsCollection.value;
        const actions = {
            'log.map.to.console': this.actionLoggingMap.bind(this)
        };

        const actionMethod = actions[action];
        if(Boolean(actionMethod)) {
            actionMethod.call();
        }
    }

    actionLoggingMap() {
        console.dir(this.options.map);
        Toast.success({
            title: 'Logged',
            message: 'Map object logged to console <strong>(F12)</strong>', 
            autoremove: CONFIG.AutoRemovalDuation.Normal
        });
    }
}

export { DebugInfoModal };
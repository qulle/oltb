import _ from 'lodash';
import BrowserDetector from 'browser-dtector';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { toLonLat } from 'ol/proj';
import { BaseModal } from '../../ui-common/ui-modals/base-modal';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { v4 as uuidv4 } from 'uuid';
import { StyleManager } from '../../toolbar-managers/style-manager/style-manager';
import { jsonReplacer } from '../../browser-helpers/json-replacer';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { ProjectionManager } from '../../toolbar-managers/projection-manager/projection-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'debug-info-modal.js';
const ID__PREFIX = 'oltb-debug';
const ID__EVENT_LOG = 'oltb-event-log';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const I18N__BASE = 'modalExtensions.debugInfoModal';
const I18N__BASE_COMMON = 'commons';

// Note:
// Only specify the unique options to this class
// Things to override on the BaseModal is passed directly
const DefaultOptions = Object.freeze({
    map: undefined
});

/**
 * About:
 * Manager providing debugging information
 */
class DebugInfoModal extends BaseModal {
    #buttons = [];
    
    constructor(options = {}) {
        super({
            filename: FILENAME,
            title: TranslationManager.get(`${I18N__BASE}.title`), 
            pushWidth: true, 
            ...options
        });
            
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModalContent();
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createModalContent() {
        // Note:
        // Create a summary log-entry as the top item with some usefull information
        const logManagerSize = LogManager.getSize();
        const styleManagerSize = StyleManager.getSize();
        LogManager.logInformation(FILENAME, 'summary', {
            logManager: {
                size: logManagerSize
            },
            styleManager: {
                size: styleManagerSize
            }
        });

        const modalContent = this.#generateModalContent();
        this.show(modalContent);

        modalContent.querySelectorAll(`.${CLASS__TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.#onToggleSection.bind(this, toggle));
        });
    }

    #generateCommandSection() {
        const i18n = TranslationManager.get(`${I18N__BASE}.form`);
        const commandsCollection = DOM.createElement({
            element: 'select',
            class: 'oltb-select'
        });

        // Default item, the top element that tells user to pick an item
        const option = DOM.createElement({
            element: 'option', 
            text: i18n.defaultItem.title,
            attributes: {
                disabled: 'disabled',
                selected: 'selected'
            }
        });

        DOM.appendChildren(commandsCollection, [
            option
        ]);

        // Note:
        // All groups that will contain selectable elements as children
        [
            {
                name: i18n.miscGroup.title,
                items: [
                    {
                        name: i18n.miscGroup.items.logToBrowser,
                        action: 'log.map.to.console'
                    }, {
                        name: i18n.miscGroup.items.generateUUID,
                        action: 'generate.uuid'
                    }, {
                        name: i18n.miscGroup.items.clearStyleManager,
                        action: 'clear.style.manager'
                    }
                ]
            }, {
                name: i18n.eventLogGroup.title,
                items: [
                    {
                        name: i18n.eventLogGroup.items.copyEventLog,
                        action: 'copy.event.log'
                    }, {
                        name: i18n.eventLogGroup.items.clearEventLog,
                        action: 'clear.event.log'
                    }
                ]
            }
        ].forEach((group) => {
            const optgroup = DOM.createElement({
                element: 'optgroup', 
                attributes: {
                    label: group.name
                }
            });

            DOM.appendChildren(commandsCollection, [
                optgroup
            ]);

            // Note:
            // Children to each group (the selectable items)
            group.items.forEach((item) => {
                const option = DOM.createElement({
                    element: 'option', 
                    text: item.name, 
                    value: item.action
                });
    
                DOM.appendChildren(optgroup, [
                    option
                ]);
            });
        });

        const actionButton = DOM.createElement({
            element: 'button',
            text: i18n.doAction,
            class: 'oltb-btn oltb-btn--blue-mid oltb-ml-05',
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onAction.bind(this)
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
        const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
        const sectionWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-debug'
        });

        const sectionHeader = DOM.createElement({
            element: 'div',
            class: 'oltb-debug__header oltb-toggleable',
            attributes: {
                'data-oltb-toggleable-target': `${ID__PREFIX}-section-${index}`
            }
        });

        const sectionTitle = DOM.createElement({
            element: 'h4',
            class: 'oltb-debug__title',
            text: section.title
        });

        const sectionToggle = DOM.createElement({
            element: 'button', 
            html: getSvgIcon({
                path: SvgPaths.chevronExpand.stroked, 
                fill: 'none', 
                stroke: 'currentColor',
                strokeWidth: 1,
                width: 16,
                height: 16,
            }),
            title: i18n.toggleSection,
            class: 'oltb-debug__toggle oltb-btn oltb-btn--blank oltb-tippy',
            attributes: {
                'type': 'button'
            }
        });

        DOM.appendChildren(sectionHeader, [
            sectionTitle, 
            sectionToggle
        ]);

        const sectionContent = DOM.createElement({
            element: 'div',
            id: `${ID__PREFIX}-section-${index}`,
            class: 'oltb-debug__content',
            style: {
                'display': `${section.display}`
            }
        });

        if(section.json) {
            const jsonSection = this.#generateJsonSection(section);
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

    #generateJsonSection(section) {
        const sectionPre = DOM.createElement({
            element: 'pre',
            class: `${section.class} oltb-thin-scrollbars`
        });

        const indentation = 4;
        const sectionCode = DOM.createElement({
            element: 'code',
            text: JSON.stringify(
                JSON.retrocycle(section.content),
                jsonReplacer, 
                indentation
            ),
        });

        DOM.appendChildren(sectionPre, [
            sectionCode
        ]);

        return sectionPre;
    }

    #generateLogSection(section) {
        // Note:
        // Defining the default Map to contain all levels regardless of the log contains that level or not
        const chips = new Map();
        const defaultLevels = LogManager.getLogLevels();
        for(const [key, value] of Object.entries(defaultLevels)) {
            chips.set(value.name, {
                count: 0,
                name: value.name,
                visible: value.visible,
                color: value.color,
                key: key,
                backgroundColor: value.backgroundColor,
                borderColor: value.borderColor
            });
        }

        const eventLog = DOM.createElement({
            element: 'div',
            id: ID__EVENT_LOG,
            class: 'oltb-log oltb-thin-scrollbars'
        });

        section.content.forEach((entry, index) => {
            // Note:
            // To create a filter using chips above the eventlog
            // Updating the count of the chip to the correct value
            const current = chips.get(entry.level.name);
            chips.set(entry.level.name, {
                count: current.count + 1,
                name: entry.level.name,
                visible: entry.level.visible,
                color: entry.level.color,
                backgroundColor: entry.level.backgroundColor,
                borderColor: entry.level.borderColor
            });

            // Note:
            // Both normal strings and complex JSON structures can be logged
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

        const eventLogWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-log__wrapper'
        });

        const chipWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-log__filter oltb-hide-scrollbars'
        });

        DOM.appendChildren(eventLogWrapper, [
            chipWrapper,
            eventLog
        ]);

        chips.forEach((value, key, map) => {
            const chip = DOM.createElement({
                element: 'span',
                class: `oltb-chip ${!value.visible ? 'oltb-chip--deactivated' : ''}`,
                text: `${key} (${value.count})`,
                attributes: {
                    'data-oltb-reset-value': `${key} (0)`
                },
                listeners: {
                    click: () => {
                        this.doFilterEventLog(chip, value.name, eventLog)
                    }
                },
                style: {
                    'background-color': value.backgroundColor,
                    'color': value.color,
                    'border': `1px solid ${value.borderColor}`
                }
            });
    
            DOM.appendChildren(chipWrapper, [
                chip
            ]);
        });

        return eventLogWrapper;
    }

    #generateTextLogItem(entry) {
        const logHeader = DOM.createElement({
            element: 'div',
            class: 'oltb-log__header'
        });

        const logTitle = DOM.createElement({
            element: 'div',
            class: 'oltb-log__title',
            html: `
                </span><span class="oltb-log__timestamp">${
                    entry.timestamp
                }</span> &rarr; ${
                    entry.origin
                } &rarr; ${
                    entry.method
                } &rarr; ${
                    entry.value
                }
            `
        }); 

        DOM.appendChildren(logHeader, [
            logTitle
        ]);

        const logItem = DOM.createElement({
            element: 'div',
            class: `oltb-log__item ${!entry.level.visible ? 'oltb-log__item--hidden' : ''}`,
            attributes: {
                'data-oltb-log-name': entry.level.name
            },
            style: {
                'background-color': entry.level.backgroundColor,
                'color': entry.level.color, 
                'border': `1px solid ${entry.level.borderColor}`
            }
        });

        DOM.appendChildren(logItem, [
            logHeader
        ]);

        return logItem;
    }

    #generateObjectLogItem(entry, index) {
        const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
        const logHeader = DOM.createElement({
            element: 'div',
            class: 'oltb-log__header oltb-log__header--toggleable oltb-toggleable',
            attributes: {
                'data-oltb-toggleable-target': `${ID__PREFIX}-log-item-${index}`
            }
        });

        const logTitle = DOM.createElement({
            element: 'div',
            class: 'oltb-log__title',
            html: `
                </span><span class="oltb-log__timestamp">${
                    entry.timestamp
                }</span> &rarr; ${
                    entry.origin
                } &rarr; ${
                    entry.method
                }
            `
        }); 

        const logToggle = DOM.createElement({
            element: 'button', 
            html: getSvgIcon({
                path: SvgPaths.chevronExpand.stroked, 
                fill: 'none', 
                stroke: 'currentColor',
                strokeWidth: 1,
                width: 16,
                height: 16,
            }),
            title: i18n.toggleSection,
            class: 'oltb-log__toggle oltb-btn oltb-btn--blank oltb-tippy',
            attributes: {
                'type': 'button'
            }
        });

        DOM.appendChildren(logHeader, [
            logTitle,
            logToggle
        ]);

        const logContent = DOM.createElement({
            element: 'div',
            id: `${ID__PREFIX}-log-item-${index}`,
            style: {
                'display': 'none'
            }
        });

        const jsonSection = this.#generateJsonSection({
            content: entry.value,
            class: 'oltb-log__json'
        }, true);

        DOM.appendChildren(logContent, [
            jsonSection
        ]);

        const logItem = DOM.createElement({
            element: 'div',
            class: `oltb-log__item ${!entry.level.visible ? 'oltb-log__item--hidden' : ''}`,
            attributes: {
                'data-oltb-log-name': entry.level.name
            },
            style: {
                'background-color': entry.level.backgroundColor,
                'color': entry.level.color,
                'border': `1px solid ${entry.level.borderColor}`,
            }
        });

        DOM.appendChildren(logItem, [
            logHeader,
            logContent
        ]);

        return logItem;
    }

    #generateModalContent() {
        const commandsWrapper = this.#generateCommandSection();
        const config = ConfigManager.getConfig();

        // TODO:
        // Move http-links to config.json? or central config-file?
        // App Information
        const appDataContent = {
            oltb: {
                version: config.toolbar.version,
                url: 'https://github.com/qulle/oltb'
            },
            ol: {
                version: config.openLayers.version,
                url: `https://openlayers.org/en/v${config.openLayers.version}/apidoc/`
            },
            defaultConfig: config
        };

        // Loaded Translations
        const languages = TranslationManager.getLanguages();
        const languageSections = [];
        languages.forEach((language) => {
            const section = {
                title: `${language.value}.json | ${language.text}`,
                content: language.translation,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            };

            languageSections.push(section);
        });

        // Map Information
        const view = this.options.map?.getView();
        const mapDataContent = view ? {
            zoom: view.getZoom(),
            location: toLonLat(view.getCenter()),
            rotation: view.getRotation(),
            projection: view.getProjection(),
            proj4Defs: ProjectionManager.getProjections()
        } : {
            info: TranslationManager.get(`${I18N__BASE}.noMapFound`)
        };

        const browser = new BrowserDetector(window.navigator.userAgent);
        const userAgent = browser.parseUserAgent();
        const browserDataContent = {
            userAgent: userAgent,
            device: {
                isSecureContext: window.isSecureContext,
                location: {
                    protocol: window.location.protocol,
                    domain: window.location.hostname,
                    path: window.location.pathname,
                    port: window.location.port
                }, 
                screen: {
                    width: window.screen.width,
                    height: window.screen.height
                },
                window: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    pixelRatio: {
                        scalar: window.devicePixelRatio,
                        percentage: `${window.devicePixelRatio * 100}%`
                    }
                }
            }
        };

        // Browser LocalStorage
        const localStorageContent = {};
        Object.keys(window.localStorage).forEach((key) => {
            try {
                localStorageContent[key] = JSON.parse(window.localStorage.getItem(key)) || {};
            }catch (error) {
                LogManager.logError(FILENAME, 'generateModalContent', {
                    message: 'Error parsing localstorage',
                    error: error
                });
            }
        });

        // Browser SessionStorage
        const sessionStorageContent = {};
        Object.keys(window.sessionStorage).forEach((key) => {
            try {
                sessionStorageContent[key] = JSON.parse(window.sessionStorage.getItem(key)) || {};
            }catch (error) {
                LogManager.logError(FILENAME, 'generateModalContent', {
                    message: 'Error parsing sessionStorage',
                    error: error
                });
            }
        });

        // Browser Cookies
        const cookiesContent = Object.fromEntries(window.document.cookie.split('; ').map((c) => {
            return c.split('=');
        }));

        // Eventlog
        const eventLog = LogManager.getLog().slice().reverse();

        // Generate sections
        const i18n = TranslationManager.get(`${I18N__BASE}.sections`);
        const sectionFragment = window.document.createDocumentFragment(); 
        [
            {
                title: i18n.appData,
                content: appDataContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: i18n.mapData,
                content: mapDataContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: i18n.browserData,
                content: browserDataContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: i18n.localStorage,
                content: localStorageContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: i18n.sessionStorage,
                content: sessionStorageContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, {
                title: i18n.cookies,
                content: cookiesContent,
                class: 'oltb-debug__json',
                display: 'none',
                json: true
            }, ...languageSections, {
                title: i18n.eventLog,
                content: eventLog,
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

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onToggleSection(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        const duration = ConfigManager.getConfig().animationDuration.fast;
        
        window.document.getElementById(targetName)?.slideToggle(duration);
    }

    #onAction() {
        this.doActionByName(this.commandsCollection.value);
    }

    //--------------------------------------------------------------------
    // # Section: DoActions
    //--------------------------------------------------------------------
    doActionByName(name) {
        const actions = {
            'log.map.to.console': this.doActionLoggingMap.bind(this),
            'generate.uuid': this.doActionGenerateUUID.bind(this),
            'copy.event.log': this.doActionCopyEventLogAsync.bind(this),
            'clear.event.log': this.doActionClearEventLog.bind(this),
            'clear.style.manager': this.doActionClearStyleManager.bind(this)
        };

        const actionMethod = actions[name];
        if(actionMethod) {
            actionMethod.call();
        }else {
            LogManager.logWarning(FILENAME, 'doActionByName', {
                info: 'Missing action',
                name: name
            });
        }
    }
    
    doFilterEventLog(chip, value, eventLog) {
        chip.classList.toggle('oltb-chip--deactivated');

        // Apply filter to the targeted log-items
        const logItems = eventLog.querySelectorAll(`[data-oltb-log-name="${value}"]`);
        logItems.forEach((item) => {
            item.classList.toggle('oltb-log__item--hidden');
        });

        // Note:
        // :empty is difficult to use beacuase of white spaces
        // Check if all items in the log are hidden
        // Then apply helper class to the eventLog itself
        const logItemsNotHidden = eventLog.querySelectorAll('.oltb-log__item:not(.oltb-log__item--hidden)');
        if(logItemsNotHidden.length === 0) {
            eventLog.classList.add('oltb-log--empty');
        }else {
            eventLog.classList.remove('oltb-log--empty');
        }
    }

    doActionLoggingMap() {
        window.console.dir(this.options.map);

        Toast.info({
            i18nKey: `${I18N__BASE}.toasts.infos.logMapObject`,
            autoremove: true
        });
    }

    doActionGenerateUUID() {
        const uuid = uuidv4();
        const entry = LogManager.logInformation(FILENAME, 'actionGenerateUUID', uuid);

        const eventLog = window.document.getElementById(ID__EVENT_LOG);
        const logItem = this.#generateTextLogItem(entry);
        DOM.prependChildren(eventLog, [
            logItem
        ]);
    }

    async doActionCopyEventLogAsync() {
        const eventLog = LogManager.getLog().slice().reverse();
        
        try {
            const indentation = 4;
            const serialized = JSON.stringify(
                JSON.retrocycle(eventLog),
                jsonReplacer, 
                indentation
            );

            await copyToClipboard.copyAsync(serialized);

            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.copyEventLog`,
                autoremove: true
            });
        }catch(error) {
            LogManager.logError(FILENAME, 'doActionCopyEventLogAsync', {
                message: 'Failed to copy Event Log',
                error: error
            });
                
            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.copyEventLog`,
            });
        }
    }

    doActionClearEventLog() {
        LogManager.clearLog();

        // Clear eventlog
        const uiRefEventLog = window.document.getElementById(ID__EVENT_LOG);
        if(uiRefEventLog) {
            DOM.clearElement(uiRefEventLog);
        }
        
        // Reset chips to zero value
        const chipResetKey = 'data-oltb-reset-value';
        const uiRefChips = window.document.querySelectorAll(`[${chipResetKey}]`);
        uiRefChips.forEach((chip) => {
            chip.innerHTML = chip.getAttribute(chipResetKey);
        });

        Toast.info({
            i18nKey: `${I18N__BASE}.toasts.infos.clearEventLog`,
            autoremove: true
        });
    }

    doActionClearStyleManager() {
        const beforeSize = StyleManager.getSize();
        StyleManager.clearStyles();
        const afterSize = StyleManager.getSize();

        LogManager.logInformation(FILENAME, 'doActionClearStyleManager', {
            info: 'StyleManager cleared',
            beforeSize: beforeSize,
            afterSize: afterSize
        });

        Toast.info({
            i18nKey: `${I18N__BASE}.toasts.infos.clearStyleManager`,
            autoremove: true
        });

        return [beforeSize, afterSize];
    }
}

export { DebugInfoModal };
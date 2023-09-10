import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Modal } from '../common/Modal';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../managers/LogManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/NotificationTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const URL_NOTIFICATION = 'https://raw.githubusercontent.com/qulle/notification-endpoints/main/endpoints/oltb.json';
const I18N_BASE = 'tools.notificationTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined
});

/**
 * About:
 * Notifications from the developer
 * 
 * Description:
 * Get information about new version and ongoing new tools and features.
 */
class NotificationTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.bell.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.notificationTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.notificationModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

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

        this.momentaryActivation();

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doFetchNotifications();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.notificationTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Conversions/Validation
    // -------------------------------------------------------------------

    hasLatestVersionInfo(notification) {
        return (
            Boolean(notification.latest) && 
            Boolean(notification.latest.version) && 
            Boolean(notification.latest.released)
        );
    }

    hasFeaturesUnderDevelopment(notification) {
        return (
            Boolean(notification.features) && 
            notification.features.length > 0
        );
    }

    // -------------------------------------------------------------------
    // # Section: Getters and Setters
    // -------------------------------------------------------------------

    setModalContent(notification) {
        const i18n = TranslationManager.get(`${I18N_BASE}.modals.notifications`);
        const locale = ConfigManager.getConfig().locale;
        const version = ConfigManager.getConfig().toolbar.version;

        const content = (`
            <h3>👋 ${i18n.from}</h3>
            <p>${notification.message}</p>
            <h3>🔭 ${i18n.yourVersion}</h3>
            <p>
                <a href="https://github.com/qulle/oltb/releases/tag/v${version}" target="_blank" class="oltb-link">
                    v${version}
                </a>
            </p>
            ${this.hasLatestVersionInfo(notification) ? 
                `
                    <h3>🚀 ${i18n.latestVersion}</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${notification.latest.version}" target="_blank" class="oltb-link">
                            v${notification.latest.version} - ${new Date(notification.latest.released).toLocaleDateString(locale)}
                        </a>
                    </p>
                ` : ''
            }
            ${this.hasFeaturesUnderDevelopment(notification) ? 
                `
                    <h3>💡 ${i18n.news}</h3>
                    ${notification.features}
                ` : ''
            }
        `);

        this.notificationModal.setContent(content);
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doFetchNotifications() {
        if(this.notificationModal) {
            return;
        }
        
        const i18n = TranslationManager.get(`${I18N_BASE}.modals.notifications`);

        this.notificationModal = Modal.create({
            title: i18n.title,
            content: `<p>${i18n.content}</p>`,
            onClose: () => {
                this.notificationModal = undefined;
            }
        });

        const timestamp = new Date().getTime().toString();
        fetch(`${URL_NOTIFICATION}?cache=${timestamp}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json'
                },
            })
            .then((response) => {
                if(!response.ok) {
                    throw new Error('Bad response from server', {
                        cause: response
                    });
                }

                return response.json();
            })
            .then((data) => {
                this.doPrepareModalContent(data);
            })
            .catch((error) => {
                LogManager.logError(FILENAME, 'doFetchNotifications', {
                    message: 'Failed to fetch notifications',
                    error: error
                });
                
                Toast.error({
                    i18nKey: `${I18N_BASE}.toasts.fetchError`
                });
            });
    }

    doPrepareModalContent(data) {
        const i18n = TranslationManager.get(`${I18N_BASE}.modals.notifications`);

        let features = '';
        if(data.features.length === 0) {
            features = `<p>${i18n.noNews}</p>`;
        }else {
            data.features.forEach((feature) => {
                features += `<p>${feature}</p>`;
            });
        }

        const notification = {
            message: data.message,
            latest: {
                version: data.latest.version,
                released: data.latest.released
            },
            features: features
        };

        this.setModalContent(notification);
    }
}

export { NotificationTool };
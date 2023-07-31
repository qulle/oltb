import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Modal } from '../common/Modal';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/NotificationTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const URL_NOTIFICATION = 'https://raw.githubusercontent.com/qulle/notification-endpoints/main/endpoints/oltb.json';

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

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Notifications (${ShortcutKeys.notificationsTool})`
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
        if(isShortcutKeyOnly(event, ShortcutKeys.notificationsTool)) {
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

    hasError(notification) {
        return (
            Boolean(notification.error) && 
            notification.error.length > 0
        );
    }

    // -------------------------------------------------------------------
    // # Section: Getters and Setters
    // -------------------------------------------------------------------

    setModalContent(notification) {
        const content = `
            <h3>👋 From Qulle</h3>
            <p>${notification.message}</p>
            <h3>🔭 Your version</h3>
            <p>
                <a href="https://github.com/qulle/oltb/releases/tag/v${Config.toolbar.version}" target="_blank" class="oltb-link">
                    v${Config.toolbar.version}
                </a>
            </p>
            ${this.hasLatestVersionInfo(notification) 
                ? `
                    <h3>🚀 Latest version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${notification.latest.version}" target="_blank" class="oltb-link">
                            v${notification.latest.version} - ${new Date(notification.latest.released).toLocaleDateString(Config.locale)}
                        </a>
                    </p>
                ` : ''
            }
            ${this.hasFeaturesUnderDevelopment(notification)
                ? `
                    <h3>💡 New features under development</h3>
                    ${notification.features}
                ` : ''
            }
            ${this.hasError(notification)
                ? `
                    <h3>📡 Fetch error</h3>
                    <p>${notification.error}</p>
                ` : ''
            }
        `;

        this.notificationModal.setContent(content);
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doFetchNotifications() {
        if(this.notificationModal) {
            return;
        }
        
        this.notificationModal = Modal.create({
            title: 'Notifications',
            content: '<p>Loading notifications...</p>',
            onClose: () => {
                this.notificationModal = undefined;
            }
        });

        const timestamp = new Date().getTime().toString();
        fetch(`${URL_NOTIFICATION}?cache=${timestamp}`, {
                method: 'GET',
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
                let features = '';
                if(data.features.length === 0) {
                    features = '<p>No features currently under development</p>';
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
            })
            .catch((error) => {
                LogManager.logError(FILENAME, 'doFetchNotifications', {
                    message: 'Failed to fetch notifications',
                    error: error
                });

                const notification = {
                    message: 'Glad you are using my App, hope you find it useful!',
                    error: 'Data from the GitHub repo could not be fetched'
                };

                this.setModalContent(notification);
            });
    }
}

export { NotificationTool };
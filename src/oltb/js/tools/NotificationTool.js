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
const NOTIFICATION_URL = 'https://raw.githubusercontent.com/qulle/notification-endpoints/main/endpoints/oltb.json';

const DefaultOptions = Object.freeze({
    click: undefined
});

class NotificationTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.bell.stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Notifications (${ShortcutKeys.notificationsTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.notificationModal = undefined;
        this.options = { ...DefaultOptions, ...options };

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.notificationsTool)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        this.fetchNotifications();
    }

    fetchNotifications() {
        if(Boolean(this.notificationModal)) {
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
        const notificationPromise = fetch(`${NOTIFICATION_URL}?cache=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
            })
            .then((response) => {
                if(!Boolean(response.ok)) {
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
                LogManager.logError(FILENAME, 'fetchNotifications', {
                    message: error.message,
                    error: {
                        type: error.cause.type,
                        status: error.cause.status,
                        statusText: error.cause.statusText,
                        url: error.cause.url
                    }
                });

                const notification = {
                    message: 'Glad you are using my App, hope you find it useful!',
                    error: 'Data from the GitHub repo could not be fetched'
                };

                this.setModalContent(notification);
            });
    }

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
            ${
                Boolean(notification.latest) && 
                Boolean(notification.latest.version) && 
                Boolean(notification.latest.released)
                ? `
                    <h3>🚀 Latest version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${notification.latest.version}" target="_blank" class="oltb-link">
                            v${notification.latest.version} - ${new Date(notification.latest.released).toLocaleDateString(Config.locale)}
                        </a>
                    </p>
                ` : ''
            }
            ${
                Boolean(notification.features) && 
                notification.features.length > 0
                ? `
                    <h3>💡 New features under development</h3>
                    <p>${notification.features}</p>
                ` : ''
            }
            ${
                Boolean(notification.error) && 
                notification.error.length > 0
                ? `
                    <h3>📡 Fetch error</h3>
                    <p>${notification.error}</p>
                ` : ''
            }
        `;

        this.notificationModal.setContent(content);
    }
}

export { NotificationTool };
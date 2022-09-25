import Modal from '../common/Modal';
import DOM from '../helpers/Browser/DOM';
import Config from '../core/Config';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const NOTIFICATION_URL = 'https://raw.githubusercontent.com/qulle/notification-endpoints/main/endpoints/oltb.json';

class Notification extends Control {
    constructor() {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Bell,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Notifications (${SHORTCUT_KEYS.Notifications})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.notificationModal = undefined;

        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Notifications)) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        if(this.notificationModal) {
            return;
        }

        this.fetchData();
    }

    fetchData() {
        this.notificationModal = Modal.create({
            title: 'Notifications',
            content: '<p>Loading notifications...</p>',
            onClose: () => {
                this.notificationModal = undefined;
            }
        });

        const timestamp = new Date().getTime().toString();

        fetch(NOTIFICATION_URL + '?cache=' + timestamp)
            .then(async (response) => {
                const data = await response.json();

                if(!response.ok) {
                   return Promise.reject((data && data.message) || response.status);
                }

                let features = '';
                if(data.features.length === 0) {
                    features = '<p>No features currently under development</p>';
                }else {
                    data.features.forEach((feature) => {
                        features += `<p>${feature}</p>`;
                    });
                }

                const content = `
                    <h3>👋 From Qulle</h3>
                    <p>${data.qulle}</p>
                    <h3>🔭 Your version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${Config.version}" target="_blank" class="oltb-link">
                            v${Config.version}
                        </a>
                    </p>
                    <h3>🚀 Latest version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${data.latest}" target="_blank" class="oltb-link">
                            v${data.latest} - ${new Date(data.released).toLocaleDateString(Config.locale)}
                        </a>
                    </p>
                    <h3>💡 New features under development</h3>
                    ${features}
                `;

                this.notificationModal.setContent(content);
            })
            .catch((error) => {
                const content = `
                    <h3>👋 From Qulle</h3>
                    <p>Glad you are using my App, hope you find it useful!</p>
                    <h3>🔭 Your version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${Config.version}" target="_blank" class="oltb-link">
                            v${Config.version}
                        </a>
                    </p>
                    <h3>📡 Fetch error</h3>
                    <p>Data from the GitHub repo could not be fetched</p>
                `;

                this.notificationModal.setContent(content);
                console.error(`Fetch error [${error}]`);
            });
    }
}

export default Notification;
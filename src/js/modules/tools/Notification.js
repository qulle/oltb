import Modal from '../common/Modal';
import DOM from '../helpers/Browser/DOM';
import Config from '../core/Config';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

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
                'data-tippy-content': 'Notifications (X)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'x')) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        this.fetchData();
    }

    fetchData() {
        const contentReference = DOM.createElement({
            element: 'p',
            text: 'Loading notifications...'
        });

        const notificationModal = Modal.create({
            title: 'Notifications',
            content: contentReference
        });

        const timestamp = new Date().getTime().toString();

        fetch(NOTIFICATION_URL + '?cache=' + timestamp)
            .then(async response => {
                const data = await response.json();

                if(!response.ok) {
                   return Promise.reject((data && data.message) || response.status);
                }

                let features = '';
                if(data.features.length === 0) {
                    features = '<p>No features currently under development</p>';
                }else {
                    data.features.forEach((feature, index) => {
                        features += `<p ${data.features.length - 1 === index ? 'class="oltb-m-0"' : ''}>${feature}</p>`;
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

                contentReference.innerHTML = content;
            })
            .catch(error => {
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
                    <p class="oltb-m-0">Data from the GitHub repo could not be fetched</p>
                `;

                contentReference.innerHTML = content;
                console.error(`Fetch error [${error}]`);
            });
    }
}

export default Notification;
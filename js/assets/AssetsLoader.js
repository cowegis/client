import layerTypes from '../layer';
import controlTypes from '../control';

class AssetsLoader {
    constructor(element) {
        this.layerTypes = layerTypes;
        this.controlTypes = controlTypes;
        this.element = element;
    }

    async load(asset) {
        switch (asset.type) {
            case 'stylesheet':
                return this.loadStyleSheet(asset.url);

            case 'javascript':
                return this.loadJavascript(asset.url);

            case 'callbacks':
                return import(/* webpackIgnore: true */ asset.url).then(function (callbacks) {
                    if (callbacks !== undefined && callbacks.default) {
                        this.element.listeners[asset.identifier] = callbacks.default;
                    } else if (window[asset.identifier] !== undefined) {
                        this.element.listeners[asset.identifier] = window[asset.identifier];
                    } else {
                        throw new Error('Could not load callbacks.');
                    }
                }.bind(this));

            case 'component':
                return import(/* webpackIgnore: true */ asset.url).then(function (component) {
                    console.log(component);
                    // TODO: Rework, for plugins
                    // if (component instanceof LayerType) {
                    //     this.layerTypes.register(component.name(), component);
                    // } else if (component instanceof ControlType) {
                    //     this.controlTypes.register(component.name(), component)
                    // } else {
                    //     throw new Error('Unknown component provided');
                    // }
                });

            default:
                throw new Error('Unsupported asset type ' + asset.type);
        }
    }

    async loadJavascript(url) {
        return new Promise(
            function (resolve, reject) {
                const script = document.createElement('script'),
                        head = document.head || document.getElementsByTagName('head')[0];

                script.src = url;
                script.async = true; // optionally
                script.addEventListener('load', function () {
                    resolve(url)
                });
                script.addEventListener('error', function () {
                    reject(new Error('Loading script "' + url + '" failed'));
                })

                head.insertBefore(script, head.firstChild);
            }
        )
    }

    async loadStyleSheet(url) {
        return new Promise(
            function (resolve, reject) {
                const link = document.createElement('link');

                link.rel = 'stylesheet';
                link.href = url;
                link.async = true;
                link.addEventListener('load', function () {
                    resolve(url)
                });
                link.addEventListener('error', function () {
                    reject(new Error('Loading stylesheet "' + url + '" failed'));
                })

                this.element.shadowRoot.insertBefore(link, this.element.shadowRoot.firstChild);
            }.bind(this)
        )
    }
}

export default AssetsLoader;

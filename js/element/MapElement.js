import AssetsLoader from '../assets/AssetsLoader';
import { mapFactory } from '../factory';
import L from '../leaflet';

const template = `
    <div class="cowegis-map-container" style="height: 100%"></div>
`;

class MapElement extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = template;
        this._leaflet = L;
        this._container = this.shadowRoot.querySelector('.cowegis-map-container');;
        this._map = null;
        this._layers = {};
        this._controls = {};
        this._panes = {};
        this._listeners = {};
        this._config = {};
        this._assets = new AssetsLoader(this);
    }

    get container() {
        return this._container;
    }

    get config() {
        return this._config;
    }

    set config(config) {
        // TODO: Remove event listeners

        this._map = null;
        this._layers = {};
        this._controls = {};
        this._panes = {};
        this._listeners = {};
        this._config = this._prepareConfig(config);

        mapFactory.create(this).then(function () {
            this.dispatchEvent(new CustomEvent('cowegis:ready', {bubbles: true, detail: {element: this}}));
        }.bind(this));
    }

    get leaflet() {
        return this._leaflet;
    }

    get map() {
        return this._map;
    }

    set map(map) {
        this._map = map;
    }

    get layers() {
        return this._layers;
    }

    get controls() {
        return this._controls;
    }

    get panes() {
        return this._panes;
    }

    get listeners() {
        return this._listeners;
    }

    get assets() {
        return this._assets;
    }

    async connectedCallback() {
        if (this.style.display === '') {
            this.style.display = 'block';
        }

        if (this.getAttribute('map-uri')) {
            const response = await fetch(this.getAttribute('map-uri'));
            const config   = response.json();

            config.then(function (config) {
                this.config = config;
            }.bind(this));

            return;
        }

        this.observeConfig(this.container);
    }

    observeConfig() {
        const callback = function (mutations, observer) {
            mutations.forEach(function (mutation) {
                Array.from(mutation.addedNodes).forEach(function (node) {
                    if (!(node instanceof HTMLScriptElement)) {
                        return;
                    }

                    if (node.getAttribute('type') !== 'application/vnd.cowegis.map+json') {
                        return;
                    }

                    observer.disconnect();
                    this.config = JSON.parse(node.innerText);
                }.bind(this));
            }.bind(this))
        }.bind(this);

        const observer = new MutationObserver(callback);

        observer.observe(this, {childList: true});
    }

    _prepareConfig(config) {
        config = Object.assign(
            {},
            {
                config: {},
                assets: []
            },
            config
        );

        config.map = Object.assign(
            {},
            {
                options: {},
                panes: [],
                layers: [],
                controls: [],
                presets: {}
            },
            config.map
        );

        return config;
    }
}

export default MapElement;

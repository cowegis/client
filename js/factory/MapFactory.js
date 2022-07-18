import {LatLngBounds} from 'leaflet';

import controlTypes from '../control';
import iconTypes from '../icon';
import layerTypes from '../layer';

import bindEvents from './bindEvents';
import preloadAssets from './preloadAssets';

class MapFactory {
    constructor() {
        this.layerTypes = layerTypes;
        this.controlTypes = controlTypes;
        this.iconTypes = iconTypes;
    }

    _calculateBounds(element) {
        const bounds = new LatLngBounds();

        element.map.fire('cowegis:calculate-bounds', { element: element, bounds: bounds});

        if (bounds.isValid()) {
            element.map.fitBounds(bounds, element.config.map.bounds);
        }
    }

    async create(element) {
        const config = element.config.map;
        const promises = [];

        await preloadAssets(element.config.assets, element);

        element.map = element.leaflet.map(element.container, config.options);

        config.panes.forEach((pane) => this.createPane(pane, element));
        config.layers.forEach((layer) => promises.push(this.createLayer(layer, element)));
        config.controls.forEach((config) => promises.push(this.createControl(config, element)));

        this.registerListeners(config, element);

        if (config.view) {
            element.map.setView(config.view.center, config.view.zoom, config.view.zoomOptions);
        }

        if (config.locate) {
            element.map.locate(config.locate === true ? {} : config.locate);
        }

        if (config.bounds && config.bounds.adjustAfterLoad) {
            const calculateBoundsListener = function () {
                this._calculateBounds(element);
                element.removeEventListener('cowegis:ready', calculateBoundsListener);
            }.bind(this);

            element.addEventListener('cowegis:ready', calculateBoundsListener);
        }

        return Promise.all(promises);
    }

    createPane(config, element) {
        const pane = element.map.createPane(config.name);

        if (config.zIndex !== undefined && config.zIndex !== null) {
            pane.style.zIndex = config.zIndex;
        }

        if (config.pointerEvents !== undefined && config.pointerEvents !== null) {
            pane.style.pointerEvents = config.pointerEvents;
        }

        element.panes[config.paneId] = config;
    }

    async createLayer(config, element) {
        return this.layerTypes.get(config.type).then(async function (factory) {
            if (config.options.pane && element.panes[config.options.pane]) {
                config.options.pane = element.panes[config.options.pane].name;
            } else {
                delete config.options.pane;
            }

            return factory(config, element).then(function (layer) {
                layer.cowegis = config;
                element.layers[config.layerId] = layer;

                if (config.initialVisible) {
                    element.map.addLayer(layer);
                }

                element.dispatchEvent(new CustomEvent('cowegis:layer:add', {bubbles: true, detail: {
                        config: config,
                        layer: layer,
                        element: element,
                    }}));

                return layer;
            })
        });
    }

    async createControl(config, element) {
        return this.controlTypes.get(config.type).then(async function (factory) {
            return factory(config, element).then(function (control) {
                control.cowegis = config;
                element.controls[config.controlId] = control;
                element.map.addControl(control);

                element.dispatchEvent(new CustomEvent('cowegis:control:add', {bubbles: true, detail: {
                        config: config,
                        control: control,
                        element: element,
                    }}));

                return control;
            })
        })
    }

    async createIcon(config, properties, element) {
        return this.iconTypes.get(config.type).then(async function (factory) {
            return factory(config, properties, element);
        });
    }

    registerListeners(config, element) {
        bindEvents(element.map, config.events, element);
    }

    getListener(element, reference)
    {
        if (reference.namespace === null) {
            return element.listeners[reference.reference];
        }

        let listeners = element.listeners;
        reference.namespace.forEach(function (part) {
            listeners = listeners[part];
        });

        return listeners[reference.reference];
    }
}

export default MapFactory;

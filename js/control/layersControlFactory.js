import leaflet from '../leaflet';

function defaultNameCallback(layer) {
    return `<span class="cowegis-layer cowegis-layer-${layer.cowegis.type}">${layer.cowegis.title}</span>`;
}

function collectLayers(element, layers, state, nameCallback) {
    layers.forEach(function (layerId) {
        if (element.layers.hasOwnProperty(layerId)) {
            state.available[nameCallback(element.layers[layerId])] = element.layers[layerId];
        } else {
            state.pending.push(layerId);
        }
    });
}

function registerCollectListener(element, state, callback, nameCallback) {
    if (state.pending.length === 0) {
        return;
    }

    const listener = function (event) {
        const index = state.pending.indexOf(event.detail.config.layerId);
        if (index < 0) {
            return;
        }

        callback(event.detail.layer, nameCallback(event.detail.layer));
        state.pending.splice(index, 1);

        if (state.pending.length === 0) {
            element.removeEventListener('cowegis:layer:add', listener);
        }
    }

    element.addEventListener('cowegis:layer:add', listener);
}

function createDefaultSortLayerCallback(config) {
    return function (layerA, layerB) {
        let positionA = config.baseLayers.indexOf(layerA.cowegis.layerId);
        let positionB;

        if (positionA >= 0 ) {
            positionB = config.baseLayers.indexOf(layerB.cowegis.layerId);
        } else {
            positionA = config.overlays.indexOf(layerA.cowegis.layerId);
            positionB = config.overlays.indexOf(layerB.cowegis.layerId);
        }

        return positionA - positionB;
    }
}

function getListener(element, reference)
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

export default async function(config, element) {
    const baseLayers = {
        available: {},
        pending: [],
    };

    const overlays = {
        available: {},
        pending: [],
    };

    if (config.options.sortFunction) {
        config.options.sortFunction = getListener(element, config.options.sortFunction);
    } else if (!config.options.sortLayers) {
        config.options.sortLayers = true;
        config.options.sortFunction = createDefaultSortLayerCallback(config);
    }

    const nameCallback = config.options.nameFunction
        ? getListener(element, config.options.nameFunction)
        : defaultNameCallback;

    collectLayers(element, config.baseLayers, baseLayers, nameCallback);
    collectLayers(element, config.overlays, overlays, nameCallback);

    const control = leaflet.control.layers(baseLayers.available, overlays.available, config.options);
    registerCollectListener(element, baseLayers, control.addBaseLayer.bind(control), nameCallback);
    registerCollectListener(element, overlays, control.addOverlay.bind(control), nameCallback);

    return control;
}

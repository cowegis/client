import leaflet from '../leaflet';

function collectLayers(element, layers, state) {
    layers.forEach(function (layerId) {
        if (element.layers.hasOwnProperty(layerId)) {
            state.available.push(element.layers[layerId]);
        } else {
            state.pending.push(layerId);
        }
    });
}

function registerCollectListener(element, layer, state) {
    if (state.pending.length === 0) {
        return;
    }

    const listener = function (event) {
        const index = state.pending.indexOf(event.detail.config.layerId);
        if (index < 0) {
            return;
        }

        layer.addLayer(event.detail.layer);
        state.pending.splice(index, 1);

        if (state.pending.length === 0) {
            element.removeEventListener('cowegis:layer:add', listener);
        }
    }

    element.addEventListener('cowegis:layer:add', listener);
}

export function createFactory(layerFactory) {
    return async function (config, element) {
        const state = {
            available: [],
            pending: [],
        };

        collectLayers(element, config.layers, state);
        const layer = layerFactory(state.available, config.options);
        registerCollectListener(element, layer, state);

        return layer;
    }
}

export default createFactory(leaflet.layerGroup);

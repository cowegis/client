import 'leaflet.markercluster';
import 'leaflet.markercluster.layersupport';

function collectLayers(element, layers, pending, layer) {
    layers.forEach(function (layerId) {
        if (element.layers.hasOwnProperty(layerId)) {
            if (element.layers[layerId].cowegis.initialVisible) {
                layer.addLayer(element.layers[layerId]);
            } else {
                layer.checkIn(element.layers[layerId]);
            }
        } else {
            pending.push(layerId);
        }
    });
}

function registerCollectListener(element, layer, pending) {
    if (pending.length === 0) {
        return;
    }

    const listener = function (event) {
        const index = pending.indexOf(event.detail.config.layerId);
        if (index < 0) {
            return;
        }

        pending.splice(index, 1);
        if (event.detail.config.initialVisible) {
            layer.addLayer(element.layers[event.detail.config.layerId]);
        } else {
            layer.checkIn(element.layers[event.detail.config.layerId]);
        }

        if (pending.length === 0) {
            element.removeEventListener('cowegis:layer:add', listener);
        }
    }

    element.addEventListener('cowegis:layer:add', listener);
}

export default async function(config, element) {
    const pending = [];
    const layer   = L.markerClusterGroup.layerSupport(config.options);

    collectLayers(element, config.layers, pending, layer);
    registerCollectListener(element, layer, pending);

    return layer;
}

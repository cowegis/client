import {mapFactory} from '../factory';
import {determineListener} from '../factory/bindEvents';
import preloadAssets from '../factory/preloadAssets';
import {from} from '../geojson';
import pointToLayer from '../geojson/pointToLayer';
import leaflet from '../leaflet';

function boundsListener(layer, map) {
    if (!layer.options.adjustBounds) {
        return;
    }

    const listener = function (event) {
        layer.eachLayer(function (child) {
            if (child.getBounds) {
                const source = child.getBounds();

                if (source.isValid()) {
                    event.bounds.extend(source);
                }
            } else if (child.getLatLng) {
                event.bounds.extend(child.getLatLng());
            }
        });
    };

    map.on('cowegis:calculate-bounds', listener);
    layer.off('remove', function () {
        map.offset('cowegis:calculate-bounds', listener);
    });
}

export default async function (config, element) {
    let data, response;

    switch (config.data.type) {
        case 'inline':
            data = config.data.data;
            break;

        case 'uri':
            response = await fetch(config.data.uri);
            const json = await response.json();
            await preloadAssets(json.assets, element);
            data = json.data;
            break;

        case 'external':
            response = await fetch(config.data.uri);
            const blob = await response.blob();
            const content = await blob.text();
            data = content;

            break;

        default:
            throw new Error(`Unknown data type "${config.data.type}"`);
    }

    data = from(config.data.format, data);

    // TODO: Implement a better way for preprocessing geojson data
    if (data.features) {
        for (const index in data.features) {
            const feature = data.features[index];
            if (!feature.properties || !feature.properties.icon) {
                continue;
            }

            if (element.config.map.presets.icons[feature.properties.icon] === undefined) {
                continue;
            }

            feature.properties.options.icon = await mapFactory.createIcon(
                element.config.map.presets.icons[feature.properties.icon],
                feature.properties,
                element
            );
        }
    }

    const pointToLayerCallback = config.options.pointToLayer
        ? determineListener(config.options.pointToLayer, element)
        : pointToLayer;

    config.options.pointToLayer = (feature, latlng) => pointToLayerCallback(feature, latlng, element, pointToLayer);

    const layer = leaflet.geoJSON(data, config.options);
    boundsListener(layer, element.map);

    return layer;
}

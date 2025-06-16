import osmtogeojson from 'osmtogeojson';

import leaflet from '../leaflet';
import {mapFactory} from "../factory";

/**
 * Get the bounds as overpass bbox string.
 *
 * @returns {string}
 */
function toOverpassBBoxString (LatLngBounds) {
    var a = LatLngBounds._southWest,
        b = LatLngBounds._northEast;

    return [a.lat, a.lng, b.lat, b.lng].join(',');
}

/**
 * Implementation of the overpass layer. Heavily inspired by
 * https://github.com/kartenkarsten/leaflet-layer-overpass.
 */
export default leaflet.FeatureGroup.extend({
    options: {
        minZoom: 0,
        endpoint: '//overpass-api.de/api/',
        query: '(node(BBOX)[organic];node(BBOX)[second_hand];);out qt;',
        amenityIcons: {}
    },
    /**
     * Initialize the layer.
     *
     * @param options
     */
    initialize: function (options, element) {
        if (!options.pointToLayer) {
            options.pointToLayer = this.pointToLayer;
        }
        if (!options.onEachFeature) {
            options.onEachFeature = this.onEachFeature;
        }

        leaflet.Util.setOptions(this, options);
        this.options.dynamicLoad = !this.options.adjustBounds && !!this.options.query.match(/BBOX/g);

        this._layer  = leaflet.geoJson();
        this._layers = {};
        this._element = element;

        this.addLayer(this._layer);
    },
    /**
     * Refresh the data of the layer.
     *
     * TODO: Implement some caching.
     */
    refreshData: function () {
        if (this._map.getZoom() < this.options.minZoom) {
            return;
        }

        var bounds = toOverpassBBoxString(this._map.getBounds());
        var query  = this.options.query.replace(/(BBOX)/g, bounds);
        var url    = this.options.endpoint + 'interpreter?data=' + encodeURIComponent('[out:json];' + query);

        this._map.fire('dataloading', {layer: this});

        fetch(url).then(async function (response) {
            var data     = await response.json();
            var features = osmtogeojson(data);
            var layer    = leaflet.geoJson(features, {
                pointToLayer: this.options.pointToLayer.bind(this),
                onEachFeature: this.options.onEachFeature.bind(this)
            });

            this.addLayer(layer);
            this.removeLayer(this._layer);
            this._layer = layer;

            if (this.options.adjustBounds && layer.getBounds().isValid()) {
                var bounds = this._map.getBounds();
                this._map.fitBounds(bounds.extend(layer.getBounds()));
            }

            this._map.fire('dataload', {layer: this});
        }.bind(this));
    },
    /**
     * @param map
     */
    onAdd: function (map) {
        if (this.options.dynamicLoad) {
            map.on('moveend', this.refreshData, this);
        }

        this.refreshData();
    },
    pointToLayer: function (feature, latlng) {
        var type   = 'marker';
        var icon   = null;
        var marker = leaflet.marker(latlng, feature.properties.options);

        if (feature.properties) {
            if (feature.properties.radius) {
                marker.setRadius(feature.properties.radius);
            }

            if (feature.properties.icon) {
                icon = feature.properties.icon;
            } else if (feature.properties.amenity) {
                icon = this.options.amenityIcons[feature.properties.amenity] || undefined;
            }

            if (icon && this._element.config.map.presets.icons[icon]) {
                mapFactory.createIcon(
                    this._element.config.map.presets.icons[icon],
                    feature.properties,
                    this._element
                ).then(icon => marker.setIcon(icon));
            }
        }

        if (this.options.overpassPopup) {
            marker.bindPopup(this.options.overpassPopup(feature, marker));
        }

        this._map.fire('point:added', {marker: marker, feature: feature, latlng: latlng, type: type});

        return marker;
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            leaflet.Util.setOptions(layer, feature.properties.options);

            if (this.options.overpassPopup) {
                layer.bindPopup(this.options.overpassPopup(feature, layer));
            }

            this._map.fire('feature:added', {feature: feature, layer: layer});
        }
    },
});

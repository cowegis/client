import Registry from '../Registry';

export default new Registry({
    data: './layer/dataLayerFactory',
    featureGroup: './layer/featureGroupFactory',
    layerGroup: './layer/layerGroupFactory',
    markerClusterGroup: './layer/markerClusterGroupFactory',
    overpass: './layer/overpassLayerFactory',
    provider: './layer/providerLayerFactory',
    tileLayer: './layer/tileLayerFactory',
});

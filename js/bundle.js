import {layerTypes, iconTypes, controlTypes, mapFactory} from './client';
import attributionControlFactory from './control/attributionControlFactory';
import fullscreenControlFactory from './control/fullscreenControlFactory';
import geocoderControlFactory from './control/geocoderControlFactory';
import layersControlFactory from './control/layersControlFactory';
import loadingControlFactory from './control/loadingControlFactory';
import scaleControlFactory from './control/scaleControlFactory';
import zoomControlFactory from './control/zoomControlFactory';
import divIconFactory from './icon/divIconFactory';
import fontAwesomeIconFactory from './icon/fontAwesomeIconFactory';
import imageIconFactory from './icon/imageIconFactory';
import svgIconFactory from './icon/svgIconFactory';
import dataLayerFactory from './layer/dataLayerFactory';
import featureGroupFactory from './layer/featureGroupFactory';
import layerGroupFactory from './layer/layerGroupFactory';
import markerClusterGroupFactory from './layer/markerClusterGroupFactory';
import overpassLayerFactory from './layer/overpassLayerFactory';
import providerLayerFactory from './layer/providerLayerFactory';
import tileLayerFactory from './layer/tileLayerFactory';

layerTypes.register('data', dataLayerFactory);
layerTypes.register('featureGroup', featureGroupFactory);
layerTypes.register('layerGroupFactory', layerGroupFactory);
layerTypes.register('markerClusterGroup', markerClusterGroupFactory);
layerTypes.register('overpass', overpassLayerFactory);
layerTypes.register('provider', providerLayerFactory);
layerTypes.register('tileLayer', tileLayerFactory);

controlTypes.register('attribution', attributionControlFactory);
controlTypes.register('fullscreen', fullscreenControlFactory);
controlTypes.register('geocoder', geocoderControlFactory);
controlTypes.register('layers', layersControlFactory);
controlTypes.register('loading', loadingControlFactory);
controlTypes.register('scale', scaleControlFactory);
controlTypes.register('zoom', zoomControlFactory);

iconTypes.register('div', divIconFactory);
iconTypes.register('fontAwesome', fontAwesomeIconFactory);
iconTypes.register('image', imageIconFactory);
iconTypes.register('svg', svgIconFactory);

export { layerTypes, iconTypes, controlTypes, mapFactory};

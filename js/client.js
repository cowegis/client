import controlTypes from './control';
import EditorElement from './element/EditorElement';
import MapElement from './element/MapElement';
import {mapFactory} from './factory';
import iconTypes from './icon';
import layerTypes from './layer';

import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet-loading/src/Control.Loading.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '@raruto/leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'spin.js/spin.css';
import '../css/loading.css';
import '../css/icon.css';

customElements.define('cowegis-map', MapElement);
customElements.define('cowegis-editor', EditorElement);

export { layerTypes, iconTypes, controlTypes, mapFactory};

import leaflet from 'leaflet';
import "@raruto/leaflet-gesture-handling";
import { ATTRIBUTION} from "../config";

/* This code is needed to properly load the images in the Leaflet CSS */
delete leaflet.Icon.Default.prototype._getIconUrl;

leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

leaflet.Control.Attribution.addInitHook(function() {
    this.options.prefix = ATTRIBUTION + this.options.prefix;
});

leaflet.Control.Attribution.include({
    setPrefix: function (prefix) {
        if (prefix.indexOf(ATTRIBUTION) === -1) {
            prefix = ATTRIBUTION + prefix;
        }

        this.options.prefix = prefix;

        this._update();
        return this;
    }
});

export default leaflet;

import {Icon, Util} from "leaflet";

export default function(config, options, element) {
    options = Util.extend({}, config.options, options || {});

    return new Icon(options);
}

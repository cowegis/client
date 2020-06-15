import leaflet from "../leaflet";

export default async function(config, element) {
    const control = leaflet.control.zoom(config.options);

    if (config.replacesDefault && element.map.zoomControl) {
        element.map.removeControl(element.map.zoomControl);
    }

    // Required for compatibility with leaflet.fullscreen which cannot handle a custom zoom control.
    if (! element.map.zoomControl) {
        element.map.zoomControl = control;
    }

    return control;
}

import leaflet from "../leaflet";

export default async function(config, element) {
    const control = leaflet.control.attribution(config.options);

    config.attributions.forEach((attribution) => control.addAttribution(attribution));

    if (config.replacesDefault && element.map.attributionControl) {
        element.map.removeControl(element.map.attributionControl);
    }

    return control;
}

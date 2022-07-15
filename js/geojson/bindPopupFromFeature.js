import bindEvents from '../factory/bindEvents';

export default function (object, feature, element) {
    if (!feature.properties || !feature.properties.popup) {
        return;
    }

    let options = feature.properties.popup.options;
    if (feature.properties.popup.presetId && element.config.map.presets.popups[feature.properties.popup.presetId]) {
        options = Object.assign(element.config.map.presets.popups[feature.properties.popup.presetId].options, options);
    }

    object.bindPopup(feature.properties.popup.content, options);
    bindEvents(object, feature.properties.popup.events, element);
}

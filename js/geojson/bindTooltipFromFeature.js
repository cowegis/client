import bindEvents from "../factory/bindEvents";

export default function (object, feature, element) {
    if (!feature.properties || !feature.properties.tooltip) {
        return;
    }

    let options = feature.properties.tooltip.options || {};
    if (feature.properties.tooltip.presetId && element.config.map.presets.tooltips[feature.properties.tooltip.presetId]) {
        options = Object.assign(element.config.map.presets.tooltips[feature.properties.tooltip.presetId].options, options);
    }

    object.bindTooltip(feature.properties.tooltip.content, options)
    bindEvents(object, feature.properties.tooltip.events, element);
}

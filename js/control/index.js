import Registry from "../Registry";

export default new Registry({
        attribution: './control/attributionControlFactory',
        fullscreen: './control/fullscreenControlFactory',
        geocoder: './control/geocoderControlFactory',
        layers: './control/layersControlFactory',
        loading: './control/loadingControlFactory',
        scale: './control/scaleControlFactory',
        zoom: './control/zoomControlFactory',
});

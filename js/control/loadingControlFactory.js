import 'leaflet-loading';

export default async function(config, element) {
    if (config.options.zoomControl) {
        if (element.controls[config.options.zoomControl] !== undefined) {
            config.options.zoomControl = element.controls[config.options.zoomControl];
        } else {
            delete config.options.zoomControl;
        }
    }

    if (config.options.spinjs && config.options.spin === undefined) {
        config.options.spin = {
            lines: 7,
            length: 3,
            width: 3,
            radius: 4,
            rotate: 13,
            top: "50%"
        }
    }
    if (config.options.spinjs && global.Spinner === undefined) {
      await import(/* webpackChunkName: "spin" */ 'spin.js').then(
          (module) => global.Spinner = module.Spinner
      );
    }

    return L.Control.loading(config.options);
}

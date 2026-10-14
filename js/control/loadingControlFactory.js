// Leaflet has to be loaded first, the plugin registers itself on the global L.
import leaflet from '../leaflet';

import 'leaflet-loading';

// leaflet-loading only moves the leaflet-bar-part-bottom class between the last visible button and its indicator.
// Buttons added to the zoom control afterwards, e.g. by leaflet.fullscreen, leave the class on a button in the middle
// of the bar. The class is removed from all other buttons whenever the indicator changes.
const LoadingControl = leaflet.Control.Loading.extend({
    _showIndicator: function () {
        leaflet.Control.Loading.prototype._showIndicator.call(this);

        this._resetBottomButtons();
    },

    _hideIndicator: function () {
        leaflet.Control.Loading.prototype._hideIndicator.call(this);

        if (this._resetBottomButtons()) {
            leaflet.DomUtil.addClass(this._getLastControlButton(), 'leaflet-bar-part-bottom');
        }
    },

    _resetBottomButtons: function () {
        if (this.options.separate || !(this.zoomControl instanceof leaflet.Control.Zoom)) {
            return false;
        }

        Array.from(this.zoomControl.getContainer().children).forEach((button) => {
            if (button !== this._indicator) {
                leaflet.DomUtil.removeClass(button, 'leaflet-bar-part-bottom');
            }
        });

        return true;
    }
});

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
            top: '50%'
        }
    }
    if (config.options.spinjs && globalThis.Spinner === undefined) {
      await import('spin.js').then(
          (module) => globalThis.Spinner = module.Spinner
      );
    }

    return new LoadingControl(config.options);
}

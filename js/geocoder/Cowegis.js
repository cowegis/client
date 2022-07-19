import {Util} from 'leaflet';
import {geocoders} from 'leaflet-control-geocoder';

function getParamString(obj, existingUrl, uppercase) {
    const params = [];
    for (const i in obj) {
        const key = encodeURIComponent(uppercase ? i.toUpperCase() : i);
        const value = obj[i];
        if (!Array.isArray(value)) {
            params.push(key + '=' + encodeURIComponent(String(value)));
        } else {
            for (let j = 0; j < value.length; j++) {
                params.push(key + '=' + encodeURIComponent(value[j]));
            }
        }
    }
    return (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') + params.join('&');
}

function getJSON(url, params, callback) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState !== 4) {
            return;
        }
        let message;
        if (xmlHttp.status !== 200 && xmlHttp.status !== 304) {
            message = '';
        } else if (typeof xmlHttp.response === 'string') {
            // IE doesn't parse JSON responses even with responseType: 'json'.
            try {
                message = JSON.parse(xmlHttp.response);
            } catch (e) {
                // Not a JSON response
                message = xmlHttp.response;
            }
        } else {
            message = xmlHttp.response;
        }
        callback(message);
    };
    xmlHttp.open('GET', url + getParamString(params), true);
    xmlHttp.responseType = 'json';
    xmlHttp.setRequestHeader('Accept', 'application/json');
    xmlHttp.send(null);
}

export class Cowegis extends geocoders.Nominatim {
    geocode(query, cb, context) {
        const params = Util.extend({
            q: query,
            limit: 5,
            format: 'json',
            addressdetails: 1
        }, this.options.geocodingQueryParams);
        getJSON(this.options.serviceUrl, params, data => {
            const results = [];
            for (let i = data.length - 1; i >= 0; i--) {
                const bbox = data[i].boundingbox;
                for (let j = 0; j < 4; j++) bbox[j] = +bbox[j];
                results[i] = {
                    icon: data[i].icon,
                    name: data[i].display_name,
                    html: this.options.htmlTemplate ? this.options.htmlTemplate(data[i]) : undefined,
                    bbox: L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]),
                    center: L.latLng(data[i].lat, data[i].lon),
                    properties: data[i]
                };
            }
            cb.call(context, results);
        });
    }
}

export function cowegis(options) {
    return new Cowegis(options);
}

import { describe, expect, it, vi } from 'vitest';

import { cowegis } from '../../../js/geocoder/Cowegis';

const berlin = {
    display_name: 'Berlin, Deutschland',
    lat: '52.5',
    lon: '13.4',
    boundingbox: ['52.3', '52.7', '13.0', '13.8'],
    icon: 'city.png',
    address: { city: 'Berlin', country: 'Deutschland' },
};

function stubXhr(status, response) {
    class FakeXMLHttpRequest {
        open(method, url) {
            FakeXMLHttpRequest.url = url;
        }

        setRequestHeader() {}

        send() {
            this.readyState = 4;
            this.status = status;
            this.response = response;
            this.onreadystatechange();
        }
    }

    vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest);

    return FakeXMLHttpRequest;
}

function geocode(geocoder, query) {
    return new Promise((resolve) => geocoder.geocode(query, resolve));
}

describe('Cowegis geocoder', () => {
    it('queries the service with default and configured parameters', async () => {
        const xhr = stubXhr(200, [berlin]);
        const geocoder = cowegis({ serviceUrl: 'https://geo.example/search', geocodingQueryParams: { countrycodes: 'de' } });

        await geocode(geocoder, 'Berlin');

        expect(xhr.url).toBe('https://geo.example/search?q=Berlin&limit=5&format=json&addressdetails=1&countrycodes=de');
    });

    it('maps results to geocoder results', async () => {
        stubXhr(200, [berlin]);

        const [result] = await geocode(cowegis({ serviceUrl: 'https://geo.example/search' }), 'Berlin');

        expect(result.name).toBe('Berlin, Deutschland');
        expect(result.icon).toBe('city.png');
        expect(result.center).toMatchObject({ lat: 52.5, lng: 13.4 });
        expect(result.bbox.getSouthWest()).toMatchObject({ lat: 52.3, lng: 13.0 });
        expect(result.bbox.getNorthEast()).toMatchObject({ lat: 52.7, lng: 13.8 });
        expect(result.properties).toBe(berlin);
    });

    it('uses a custom html template', async () => {
        stubXhr(200, [berlin]);
        const geocoder = cowegis({ serviceUrl: 'https://geo.example/search', htmlTemplate: (r) => '<b>' + r.display_name + '</b>' });

        const [result] = await geocode(geocoder, 'Berlin');

        expect(result.html).toBe('<b>Berlin, Deutschland</b>');
    });

    it('returns no results if the service fails', async () => {
        stubXhr(500, null);

        await expect(geocode(cowegis({ serviceUrl: 'https://geo.example/search' }), 'Berlin')).resolves.toEqual([]);
    });
});

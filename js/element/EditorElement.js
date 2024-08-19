import MapElement from './MapElement';

export default class EditorElement extends MapElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        if (this.style.display === '') {
            this.style.display = 'block';
        }

        await import('@geoman-io/leaflet-geoman-free');

        return super.connectedCallback();
    }
}

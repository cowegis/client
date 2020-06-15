import {DivIcon, point as toPoint} from 'leaflet';

const sizes = {
    small: 0.7,
    medium: 1,
    large: 1.5,
}

export default DivIcon.extend({
    options: {
        iconSize: [26, 40],
        iconAnchor: [13, 40],
        popupAnchor: [0, -41],
        className: 'cowegis-icon',
        extraIconClasses: '',
        extraDivClasses: '',
        bgColor: '#80c22a',
        color: '#fff',
        pinViewBox: '0 0 26 40',
        pinPath: 'M12.594 1.323C6.021 1.323.55 7.014.55 13.19c0 2.778 1.564 6.308 2.694 8.746l9.306 17.872 9.262-17.872c1.13-2.438 2.738-5.79 2.738-8.746 0-6.175-5.383-11.866-11.956-11.866z',
        size: 'medium'
    },

    createIcon: function (oldIcon) {
        const div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
            options = this.options;

        div.className = options.className;
        if (options.extraDivClasses) {
            div.className += ' ' + options.extraDivClasses;
        }

        div.innerHTML = `<svg width="${options.iconSize[0]}px" 
            height="${options.iconSize[1]}px" 
            viewBox="${options.pinViewBox}" 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlns:xlink="http://www.w3.org/1999/xlink"
            class="cowegis-marker-pin">
            <path d="${options.pinPath}" fill="${options.bgColor}"></path>
        </svg>`;

        this._createSymbol(div, options);
        this._setIconStyles(div, 'icon');

        return div;
    },

    _createSymbol(div, options) {
        if (options.html) {
            const content = document.createElement('span');
            content.classList.add('cowegis-marker-content');
            content.innerHTML = options.html;

            if (options.color) {
                content.style.color = options.color;
            }

            div.appendChild(content);
        }
    }
});

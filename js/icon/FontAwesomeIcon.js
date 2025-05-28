import { icon, findIconDefinition, library } from '@fortawesome/fontawesome-svg-core';

import SvgIcon from './SvgIcon';

const prefixes = {
    solid: 'fas',
    brands: 'fab',
    regular: 'far',
}

function determineIconModuleName(str) {
    str = str.replace(/([-][a-z])/g, (group) => group.toUpperCase().replace('-', ''));
    str = str.charAt(0).toUpperCase() + str.slice(1)

    return 'fa' + str;
}

export default SvgIcon.extend({
    options: {
        attribution: '<a href="https://fontawesome.com" title="Font Awesome Free by © Fonticons, Inc.">Font Awesome Free</a>',
        iconSet: 'solid',
        icon: 'circle'
    },

    _createSymbol: function (container, options) {
        const iconSet  = options.iconSet;
        const iconName = determineIconModuleName(options.icon);

        import(`@fortawesome/free-${iconSet}-svg-icons/${iconName}.js`).then(function (module) {
            library.add(module[iconName]);

            const definition = findIconDefinition({ prefix: prefixes[iconSet], iconName: options.icon});
            if (definition === undefined) {
                return;
            }

            const result = icon(definition);
            const node   = result.node[0];

            node.classList.add('cowegis-marker-icon');
            node.setAttribute('width', Math.floor(options.iconSize[0] / 2));
            node.style.color = options.color;

            container.appendChild(node);
        }, function () {
            console.error(`Could not resolve Font Awesome icon "${options.icon}" in icon set "${iconSet}"`);
        });
    }
});

/*
// export default class FontAwesomeIcon extends BaseIcon {
//     constructor(options) {
//         super(options);
//
//         Util.setOptions(this, defaultOptions);
//         Util.setOptions(this, options);
//     }
//     _createInner(container) {
//         const iconSet  = this.options.iconSet;
//
//
//             library.add(module[iconName]);
//
//             const definition = findIconDefinition({ prefix: prefixes[iconSet], iconName: this.options.icon});
//             if (definition === undefined) {
//                 return;
//             }
//
//             const result = icon(definition);
//             const node   = result.node[0];
//
//             node.classList.add('vector-marker-icon');
//             this._addClasses(node.classList, this.options);
//
//             container.appendChild(node);
//         }.bind(this));
//     }
// }
// */

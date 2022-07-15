import OverpassLayer from './OverpassLayer';

export default async function (config, element) {
    return new OverpassLayer(config.options);
}

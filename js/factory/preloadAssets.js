
export default async function preloadAssets(assets, element) {
    const promises = [];

    assets.forEach(function (asset) {
        promises.push(element.assets.load(asset));
    }.bind(this));

    return Promise.all(promises);
}


class Registry {
    constructor() {
        this.factories = {}
    }

    register(name, factory) {
        this.factories[name] = factory;
    }

    async get(name) {
        if (this.factories.hasOwnProperty(name)) {
            return this.factories[name];
        }

        if (this.builtIn.hasOwnProperty(name)) {
            const type   = this.builtIn[name];
            const module = await import(/* webpackChunkName: "[request]" */ `${type}`);

            return this._register(name, module);
        }

        if (this.loaders.hasOwnProperty(name)) {
            const loader = this.loaders[name];
            const module = await import(/* webpackIgnore: true */ `${loader}`);

            return this._register(name, module);
        }

        throw 'Type "' + name + ' not found';
    }
}

export default Registry;


class Registry {
    constructor() {
        this.factories = {}
    }

    register(name, factory) {
        this.factories[name] = factory;
    }

    async get(name) {
        if (Object.prototype.hasOwnProperty.call(this.factories, name)) {
            return this.factories[name];
        }

        throw 'Type "' + name + ' not found';
    }
}

export default Registry;

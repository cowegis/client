
export const determineListener = function (reference, element) {
    // TODO: Support scopes (global or callbacks)

    // TODO: Detect if reference is a function (useful if config is created in js)

    if (reference.namespace === null) {
        return element.listeners[reference.reference];
    }

    let listeners = element.listeners;
    reference.namespace.forEach((part) => listeners = listeners[part]);

    return listeners[reference.reference];
}

export default function (object, events, element) {
    if (events === undefined || events === null) {
        return;
    }

    events.forEach((listener) => object.on(listener.eventName, determineListener(listener.reference, element)));
}

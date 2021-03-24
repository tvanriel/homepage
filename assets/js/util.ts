export function $h<K extends keyof HTMLElementTagNameMap, T extends Node>(tagName: K, attributes: object = {}, children: (T|string)[] = []): HTMLElementTagNameMap[K] {
    let element = document.createElement(tagName);

    Object.entries(attributes).forEach((i) => {
        element.setAttribute(i[0], i[1]);
    })

    children.forEach(x => {
        if (x === null || x === undefined) {}
        else if (typeof x === "string") {
            element.appendChild(document.createTextNode(x))
        } else if (x instanceof Node) {
            element.appendChild(x)
        } else {
            console.log(x)
            throw new Error("Child is not type of node.")
        }
    })

    return element;
}

export function $e(elementId: string): HTMLElement|null{
    if (elementId.length === 0) return null;

    if (elementId[0] === "#") return document.getElementById(elementId.substring(1))
    if (elementId[0] === ".") {
        let list = document.getElementsByClassName(elementId.substring(1));
        if (list.length > 0) return (<HTMLElement>list[0]);
        return null;
    }
    else {
        let list = document.getElementsByTagName(elementId);
        if (list.length > 0) return (<HTMLElement>list[0]);
        return null;
    }
}


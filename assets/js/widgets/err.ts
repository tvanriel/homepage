import { div, p } from 'skruv/html';
import Widget from './widget';

type Config = {
    type?: string;
}

export default class ErrWidget implements Widget {
    private type: null|string;

    constructor(state, w: Config) {
        this.type = w.type ?? null;
    }

    public render(): HTMLElement {
        return div({ class: 'card bg-red mb-1' },
            div({ class: 'card-body text-white' },
                p({},
                    typeof this.type === 'string'
                        ? `Faulty widget type: "${this.type}".`
                        : 'Unknown widget type.')));
    }
}

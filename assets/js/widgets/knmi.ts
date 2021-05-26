import { div, img, a } from 'skruv/html';
import Widget from './widget';

export default class KNMIWidget implements Widget {
    constructor(state: object) {
        if (state.widget.knmi === undefined) state.widget.knmi = {};

        state.widget.knmi.url = 'https://cdn.knmi.nl/knmi/map/general/weather-map.gif';
        setInterval(() => {
            state.widget.knmi.url = `https://cdn.knmi.nl/knmi/map/general/weather-map.gif?x=${Math.random()}`;
        }, 30 * 60 * 1000);
    }

    // eslint-disable-next-line class-methods-use-this
    public render(s:object): HTMLElement {
        return div({ class: 'card widget-knmi' },
            div({ class: 'card-header' },
                a({ target: '_blank', rel: 'noopener', href: 'https://knmi.nl' },
                    'KNMI'),
                ' Weersvoorspelling'),
            img({ src: s.widget.knmi.url }));
    }
}

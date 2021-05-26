import { img, div } from 'skruv/html';
import Widget from './widget';

type Config = {
    url: string;
    title: string;
}

export default class WebcamWidget implements Widget {
    private id: number;

    constructor(state: object, w: Config) {
        if (state.widget.webcam === undefined) state.widget.webcam = [];
        this.id = state.widget.webcam.push({
            url: w.url ?? '',
            title: w.title ?? '',
        }) - 1;
        const reload = () => {
            state.widget.webcam[this.id].url = `${w.url}?x=${(new Date()).valueOf()}`;
        };
        setInterval(() => { reload(); }, 10 * 60 * 1000);
    }

    public render(s: object): HTMLElement {
        return div({ class: 'card widget-webcam' },
            (s.widget.webcam[this.id].title.length > 0
                ? div({ class: 'card-header' }, s.widget.webcam[this.id].title)
                : div({})),
            img({ alt: s.widget.webcam[this.id].title, src: s.widget.webcam[this.id].url }));
    }
}

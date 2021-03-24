import { $h } from '../util';
import Widget from './widget';

type Config = {
    url: string;
    title: string;
}

export default class WebcamWidget implements Widget {
    private url: string;

    private title: string;

    constructor(w: Config) {
        this.url = w.url ?? '';
        this.title = w.title ?? '';
    }

    public render(): HTMLElement {
        const img: HTMLElement = $h('img', { alt: this.title }, []);
        const reload = () => img.setAttribute('src', `${this.url}?x=${(new Date()).valueOf()}`);
        reload();
        setInterval(() => reload(), 10 * 60 * 1000);

        return $h('div', { class: 'card widget-webcam mb-1' }, [
            this.title.length > 0 ? $h('div', { class: 'card-header' }, [this.title]) : null,
            img,
        ]);
    }
}

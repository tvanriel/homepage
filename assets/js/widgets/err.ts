import { $h } from '../util';
import Widget from './widget';

type Config = {
    type?: string;
}

export default class ErrWidget implements Widget {
    private type: null|string;

    constructor(w: Config) {
        this.type = w.type ?? null;
    }

    public render(): HTMLElement {
        return $h('div', { class: 'card bg-red mb-1' }, [
            $h('div', { class: 'card-body text-white' }, [
                $h('p', {}, [
                    typeof this.type === 'string'
                        ? `Faulty widget type: "${this.type}".`
                        : 'Unknown widget type.',
                ]),
            ]),
        ]);
    }
}

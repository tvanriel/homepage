import {
    span, div, a, ul, li,
} from 'skruv/html';
import Widget from './widget';

type Launch = {
    name: string;
    window_start: string; // eslint-disable-line camelcase
    mission: {
        description: string;
    }|null;

}

type Response = {
    results: Launch[];
}

function getLaunches(): Promise<Response|null> {
    const d = new Date();
    return fetch(`https://ll.thespacedevs.com/2.2.0/launch/?window_start__gt=${d.getFullYear()}-${(`${d.getMonth() + 1}`).padStart(2, '0')}-${(`${d.getDate()}`).padStart(2, '0')}T00%3A00%3A00Z`).then((res) => res.json());
}

export default class SpaceWidget implements Widget {
    constructor(state: object) {
        if (state.widget.space === undefined) { state.widget.space = { error: '', launches: [] }; } else return; // Already fetching from one location, to avoid over-using the API stop reloading and rely on the state changes of the other widget instance.

        const reload = () => getLaunches().then((launches) => {
            state.widget.space = {
                error: '',
                launches: launches.results.splice(0, 15),
            };
        }).catch((e) => {
            state.widget.space = {
                error: e.toString(),
                launches: [],
            };
        });

        reload();
        setInterval(() => reload(), 60 * 60 * 1000);
    }

    // eslint-disable-next-line class-methods-use-this
    public render(state: object):HTMLElement {
        return div({ class: 'card widget-space mb-1' },
            div({ class: 'card-header' },
                a({ href: 'https://thespacedevs.com', target: '_blank', rel: 'nofollow noreferrer noopener' },
                    'Space Launches by TheSpaceDevs.com')),
            ul({ class: 'list-group list-group-flush' },
                ...state.widget.space.launches.map((l) => li({ class: 'list-group-item', title: l.mission?.description },
                    span({}, l.window_start),
                    ' ',
                    span({ class: 'text-white' }, l.name)))),
            state.widget.space.error.length > 0 ? div({ class: 'bg-red text-white p-3 rounded' }, state.widget.space.error) : '');
    }
}

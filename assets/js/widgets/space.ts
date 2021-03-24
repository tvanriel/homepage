import { $h } from '../util';

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
    // eslint-disable-next-line class-methods-use-this
    public render():HTMLElement {
        const list = $h('ul', { class: 'list-group list-group-flush' }, []);

        const reload = () => getLaunches().then((launches) => launches.results.forEach((l) => {
            list.appendChild(
                $h('li', { class: 'list-group-item', title: l.mission?.description }, [
                    $h('span', {}, [l.window_start]),
                    ' ',
                    $h('span', { class: 'text-white' }, [l.name]),
                ]),
            );
        })).catch((e) => {
            list.appendChild($h('li', { class: 'list-group-item text-white bg-danger' }, [`Cannot get space launches: ${e.toString()}`]));
        });

        reload();
        setInterval(() => {
            while (list.firstChild) list.removeChild(list.firstChild);
            reload();
        }, 60 * 60 * 1000);
        return $h('div', { class: 'card widget-space mb-1' }, [
            $h('div', { class: 'card-header' }, [
                $h('a', { href: 'https://thespacedevs.com', target: '_blank' }, [
                    'Space Launches by TheSpaceDevs.com',
                ]),
            ]),
            list,
        ]);
    }
}

import Mousetrap from 'mousetrap';
import {
    h3, div, span, a, img, kbd, ul,
} from 'skruv/html';
import Widget from './widget';

// type Link = {
//    href: string;
//    title: string;
//    shortcutKey: string;
// }

function favicon(href) {
    let url;
    try {
        url = new URL(href);
    } catch (e) {
        return '';
    }

    return `https://duckduckgo.com/ip3/${url.host}.ico`;
}

type LinkConfig = {
    href: string;
    title: string;
    shortcutKey?:string;
}

type Config = {
    icon?: string;
    title?: string;
    color?: string;
    links: LinkConfig[];
}

export default class ListComponent implements Widget {
    private id: number;

    private isPersistent = false;

    private navigat(to: string): void {
        if (this.isPersistent) {
            window.open(to, '_blank').opener = null;
        } else {
            location.replace(to);
        }
    }

    private onClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropogation();
        this.navigat(event.target.href);
    }

    constructor(state:object, config: Config) {
        this.isPersistent = new URLSearchParams(location.hash.substr(1)).get('persistent') !== null;

        if (state.widget.links === undefined) state.widget.links = [];
        this.id = state.widget.links.push({
            icon: config.icon ?? '',
            title: config.title ?? '',
            color: config.color ?? '',
            links: config.links,
        }) - 1;

        config.links.filter((l) => l.shortcutKey !== '' && l.shortcutKey !== undefined).forEach((l) => Mousetrap.bind(l.shortcutKey, () => {
            this.navigat(l.href);
        }));
    }

    public render(state):HTMLElement {
        return div({ class: 'card widget-list' },
            div({ class: `card-header${state.widget.links[this.id].color !== '' && state.widget.links[this.id].color !== undefined ? ` text-${state.widget.links[this.id].color}` : ''}` },

                // Show the title of the list.
                h3({},
                    state.widget.links[this.id].icon !== '' && state.widget.links[this.id].icon !== undefined
                        ? span({ class: 'material-icons' }, state.widget.links[this.id].icon)
                        : null,
                    ' ',
                    state.widget.links[this.id].title)),
            ul({ class: 'list-group list-group-flush' },
                ...state.widget.links[this.id].links.map((l) => a({
                    class: 'list-group-item d-flex justify-content-between align-items-center bg-dark',
                    target: this.isPersistent ? '_blank' : '',
                    href: l.href,
                    rel: 'noopener noreferrer noopener',
                },
                // Left side of the link
                div({},
                    img({
                        src: favicon(l.href), onerror: 'this.style.display = "none"', height: 16, width: 16, style: 'margin-right: 0.7em;',
                    }),
                    span({}, l.title)),

                // Right side of the link
                div({},
                    l.shortcutKey !== '' && l.shortcutKey !== undefined ? kbd({ class: 'text-monospace' }, l.shortcutKey) : '')))));
    }
}

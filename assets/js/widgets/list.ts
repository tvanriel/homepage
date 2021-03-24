import Mousetrap from 'mousetrap';
import { $h } from '../util';
import Widget from './widget';

type Link = {
    href: string;
    title: string;
    shortcutKey: string;
}

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
    private links: Link[] = [];

    private title: string = '';

    private color: string = '';

    private icon: string = '';

    constructor(config: Config) {
        let links = [];
        if (!Array.isArray(config.links)) { links = []; } else { links = config.links; }
        this.links = links.map((l) => ({
            href: l.href,
            title: l.title,
            shortcutKey: l.shortcutKey,
        }));

        this.icon = config.icon ?? '';
        this.title = config.title ?? '';
        this.color = config.color ?? '';
    }

    public render():HTMLElement {
        this.links.filter((l) => l.shortcutKey !== '' && l.shortcutKey !== undefined).forEach((l) => Mousetrap.bind(l.shortcutKey, () => {
            window.open(l.href, '_blank').opener = null;
        }));

        return $h('div', { class: 'card mb-1 widget-list' }, [
            $h('div', { class: `card-header${this.color !== '' && this.color !== undefined ? ` text-${this.color}` : ''}` }, [

                // Show the title of the list.
                $h('h3', {}, [
                    this.icon !== '' && this.icon !== undefined
                        ? $h('span', { class: 'material-icons' }, [this.icon])
                        : null,
                    ' ',
                    this.title,
                ]),
            ]),
            $h('ul', { class: 'list-group list-group-flush' },
                this.links.map((l) => $h('a', {
                    class: 'list-group-item d-flex justify-content-between align-items-center bg-dark',
                    target: '_blank',
                    href: l.href,
                    rel: 'noopener noreferrer noopener',
                }, [
                    // Left side of the link
                    $h('div', {}, [
                        $h('img', {
                            src: favicon(l.href), onerror: 'this.style.display = "none"', height: 16, width: 16, style: 'margin-right: 0.7em;',
                        }),
                        $h('span', {}, [l.title]),
                    ]),

                    // Right side of the link
                    $h('div', {}, [
                        l.shortcutKey !== '' ? $h('kbd', { class: 'text-monospace' }, [l.shortcutKey]) : null,
                    ]),

                ]))),
        ]);
    }
}

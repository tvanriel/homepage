import {
    div, a, p, ul, li,
} from 'skruv/html';
import Widget from './widget';

export default class RSSWidget implements Widget {
    private url: string;

    private title: string;

    private length: number;

    private id: number;

    constructor(state: object, w) {
        if (state.widget.rss === undefined) state.widget.rss = [];
        this.id = state.widget.rss.push({
            url: w.resource,
            title: w.title ?? '',
            length: w.length ?? 7,
            articles: [],
            lastUpdated: new Date(0),
        }) - 1;

        const reload = () => {
            fetch(`/api/v1/rss?url=${encodeURIComponent(state.widget.rss[this.id].url)}`, {
                headers: {
                    Accept: 'text/xml',
                },
                mode: 'no-cors',
            }).then((res) => res.text()).then((str) => {
                const doc = (new DOMParser()).parseFromString(str, 'text/xml');

                // Call map to turn the nodeList into an array and then splice off until
                // the length to avoid having a giant list.
                state.widget.rss[this.id].articles = [
                    ...Array.prototype.map.call(doc.querySelectorAll('item'), (x) => x).splice(0, state.widget.rss[this.id].length).map((item) => ({
                        href: item.getElementsByTagName('link')[0].firstChild.nodeValue,
                        title: item.getElementsByTagName('title')[0].firstChild.nodeValue,
                    })),

                    // Call map to turn the nodeList into an array and then splice off until
                    // the length to avoid having a giant list.
                    ...Array.prototype.map.call(doc.querySelectorAll('entry'), (x) => x).splice(0, state.widget.rss[this.id].length).map((item) => ({
                        href: item.getElementsByTagName('link')[0].getAttribute('href'),
                        title: item.getElementsByTagName('title')[0].firstChild.nodeValue,
                    })),
                ];
                state.widget.rss[this.id].lastUpdated = new Date();
            });
        };
        reload();
        setInterval(() => reload(), 10 * 10 * 1000);
    }

    public render(s):HTMLElement {
        return div({ class: 'card widget-rss' },
            p({ class: 'card-header', title: ((d) => `Last updated: ${d.getFullYear()}-${(`${d.getMonth() + 1}`).padStart(2, '0')}-${(`${d.getDate()}`).padStart(2, '0')} ${d.getHours()}:${d.getMinutes()}`)(s.widget.rss[this.id].lastUpdated) }, s.widget.rss[this.id].title),
            ul({ class: 'list-group list-group-flush' },
                ...s.widget.rss[this.id].articles.map((article) => li({ class: 'list-group-item' },
                    a({
                        href: article.href,
                        target: new URLSearchParams(location.hash.substr(1)).get('persistent') !== null ? '_blank' : '',
                        rel: 'noopener noreferrer nofollow',
                    }, article.title)))));
    }
}

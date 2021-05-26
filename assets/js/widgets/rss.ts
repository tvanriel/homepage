import { $h } from '../util';
import Widget from './widget';

export default class RSSWidget implements Widget {
    private url: string;

    private title: string;

    private length: number;

    constructor(w) {
        this.url = w.resource;
        this.title = w.title ?? '';
        this.length = w.length ?? 7;
    }

    public render():HTMLElement {
        let list: HTMLElement;
        const card = $h('div', { class: 'card mb-1 widget-rss' }, [
            $h('p', { class: 'card-header' }, [this.title]),
            list = $h('ul', { class: 'list-group list-group-flush' }, [

            ]),
        ]);

        const reload = () => {
            fetch(`/api/v1/rss?url=${encodeURIComponent(this.url)}`, {
                headers: {
                    Accept: 'text/xml',
                },
                mode: 'no-cors',
            }).then((res) => res.text()).then((str) => {
                const doc = (new DOMParser()).parseFromString(str, 'text/xml');

                while (list.firstChild)list.removeChild(list.firstChild);

                // Call map to turn the nodeList into an array and then splice off until
                // the length to avoid having a giant list.
                Array.prototype.map.call(doc.querySelectorAll('item'), (x) => x).splice(0, this.length).forEach((item) => {
                    list.appendChild($h('li', { class: 'list-group-item' }, [
                        $h('a', {
                            href: item.getElementsByTagName('link')[0].firstChild.nodeValue,
                            target: '_blank',
                            rel: 'noopener noreferrer nofollow',
                        }, [
                            item.getElementsByTagName('title')[0].firstChild.nodeValue,
                        ]),
                    ]));
                });

                // Call map to turn the nodeList into an array and then splice off until
                // the length to avoid having a giant list.
                Array.prototype.map.call(doc.querySelectorAll('entry'), (x) => x).splice(0, this.length).forEach((item) => {
                    list.appendChild($h('li', { class: 'list-group-item' }, [
                        $h('a', {
                            href: item.getElementsByTagName('link')[0].getAttribute('href'),
                            target: '_blank',
                            rel: 'noopener noreferrer nofollow',
                        }, [
                            item.getElementsByTagName('title')[0].firstChild.nodeValue,
                        ]),
                    ]));
                });
                const d = new Date();

                card.firstElementChild.setAttribute(
                    'title',
                    `Last updated: ${d.getFullYear()}-${(`${d.getMonth() + 1}`).padStart(2, '0')}-${(`${d.getDate()}`).padStart(2, '0')} ${d.getHours()}:${d.getMinutes()}`,
                );
            });
        };
        reload();
        setInterval(() => reload(), 10 * 10 * 1000);

        return card;
    }
}

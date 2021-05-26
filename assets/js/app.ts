import {$h, $e} from './util'

import ClockWidget from './widgets/clock';
import ListWidget from './widgets/list';
import ErrWidget from './widgets/err';
import KNMIWidget from './widgets/knmi';
import RSSWidget from './widgets/rss';
import SpaceWidget from './widgets/space';
import WebcamWidget from './widgets/webcam';
import OpenWeatherMapWidget from './widgets/openweathermap'

import Widget from './widgets/widget';
import Mousetrap from 'mousetrap';

export class Config {
    public title: string;
    public style: string;
    public wallpaper: string;
    public searchKey: string;
}




// Fetch a new config from the server using key k
export function loadConfig(k: string): Promise<Config|null> {
    return new Promise((resolve) => {
        fetch("/api/v1/page/" + k + ".json").then(r=>r.json()).then(r => {
            const c = new Config();

            c.searchKey = r.searchKey;
            c.title = r.title;
            c.wallpaper = r.wallpaper;
            c.style = r.style;

            resolve(c);
        }).catch(e => {
            console.error(e);
            resolve(null);
        })
    });
}


// Render the contents of config c into root.
export function renderWindow(root: HTMLElement, c: Config, columns: Widget[][]): void {
        let titleElem = $e("title");

        // Remove all the child nodes from the title.
        while(titleElem.firstChild) titleElem.removeChild(titleElem.firstChild);
        titleElem.appendChild(document.createTextNode(c.title))
        root.appendChild($h('h1', {id: 'title'}, [c.title]))

        let container: HTMLElement;
        root.appendChild($h('div', {'class': 'container-fluid'}, [container = $h('div', {'class': 'form-row', 'id': 'columns'})]))
        columns.forEach((col, nth) => {
            container.appendChild($h('div', {'class': 'col columns-' + (nth+1)}, col.map(wid=>wid.render())));
        });
    document.body.style.backgroundImage = c.wallpaper
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.backgroundPosition = 'center'

    if (c.searchKey) {
        let searchModal = $e('#search-modal');
        let searchInput = (<HTMLInputElement>document.getElementById('search-input'));
        Mousetrap(searchInput).bind('enter', () => {
                open('https://duckduckgo.com/?q=' + searchInput.value.replace(/\s/g, '+'), '', 'noopener');
                searchInput.value = "";
                searchModal.classList.add('hidden');
        });
        Mousetrap(searchInput).bind('escape', () => {
                searchInput.value = "";
                searchModal.classList.add('hidden');
                Mousetrap.unbind('escape');
        });

        Mousetrap.bind(typeof c.searchKey === "string" ? c.searchKey : '\\', () => {
                searchModal.classList.remove('hidden');
                searchInput.focus();
        });
    }

    const styleElem = $e('#custom-style')
    styleElem.appendChild(document.createTextNode(c.style))
}

export function getCurrentKey(): string {
    const lsKey = localStorage.getItem("current-key")
    if (lsKey !== null) {
        return lsKey;
    }
    const locationKey = location.hash;
    if (locationKey !== "") {
        return locationKey;
    }

    return "";
}

export function makeWidgets(config: object[][]): Widget[][] {
    return config.map(col => col.map((wid: any) => {
        console.assert(typeof wid.type === "string");
        switch(wid.type) {
            case 'clock':
                return new ClockWidget()
            case 'list':
                return new ListWidget(wid)
            case 'knmi':
                return new KNMIWidget()
            case 'rss':
                return new RSSWidget(wid)
            case 'space':
                return new SpaceWidget()
            case 'webcam':
                return new WebcamWidget(wid)
            case 'weather':
                return new OpenWeatherMapWidget(wid)
            default:
                return new ErrWidget(wid)
        }
    }))
}


export function getColumnConfig(): object[][] {
    let local = localStorage.getItem("widgets")
    if (local !== null) {
        return JSON.parse(local);
    }
    return [
        [
            {type:'clock'},
            {type:'knmi'}
        ],
        [
            {
                type: 'list',
                title: 'Links',
                color: 'cyan',
                icon: 'link',
                links: [
                    {
                        shortcutKey: 'e d',
                        title: 'Edit this page!',
                        href: '/editor.html',

                    }
                ]
            },
        ],
        [],
        []
    ];
}

export function defaultConfig(): Config {
    const c = new Config();
    c.title = "My Homepage";
    c.style = "";
    c.wallpaper = "";
    c.searchKey = "\\";
    return c;
}

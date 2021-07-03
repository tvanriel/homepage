import { renderNode } from 'skruv/vDOM';
import { createState } from 'skruv/state';
import { title, h1, div, css, main } from 'skruv/html';

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
    public version: number = 1;
    public stylesheets: string[] = [
        "https://bootswatch.com/5/slate/bootstrap.css",
    ];
}


export type State = {
    config: Config;
    columns: object[][];
}

// Fetch a new config from the server using key k
export function loadConfig(k: string): Promise<Config> {
    return new Promise((resolve) => {
        fetch("/api/v1/page/" + k + ".json").then(r => r.json()).then(r => {
            const c = new Config();

            c.searchKey = r.searchKey;
            c.title = r.title;
            c.wallpaper = r.wallpaper;
            c.style = r.style;
            if (c.version === undefined) c.version = 1;

            resolve(c);
        }).catch(e => {
            console.error(e);
            resolve(new Config());
        })
    });
}

function makeSearchStr(url: string = 'https://duckduckgo.com/?q={search}', query: string = ''): string {
    return url.replace('{search}', query.replace(/\s/g, '+'))
}


// Render the contents of config c into root.
export async function renderWindow(root: () => HTMLElement, state: object, renderer: (w: Widget) => HTMLElement): void {
    document.body.style.backgroundImage = state.config.wallpaper
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.backgroundPosition = 'center'

    if (state.config.searchKey) {
        let searchModal = document.getElementById('search-modal');
        let searchInput = (<HTMLInputElement>document.getElementById('search-input'));
        Mousetrap(searchInput).bind('enter', () => {
            const searchStr = makeSearchStr(state.config.searchEngine, searchInput.value);
            if (new URLSearchParams(location.hash.substr(1)).get('persistent') !== null) {
                open(searchStr, '', 'noopener');
            } else {
                location.replace(searchStr);
            }

            searchInput.value = "";
            searchModal.classList.add('hidden');
        });
        Mousetrap(searchInput).bind('escape', () => {
            searchInput.value = "";
            searchModal.classList.add('hidden');
            Mousetrap.unbind('escape');
        });

        Mousetrap.bind(typeof state.config.searchKey === "string" ? state.config.searchKey : '\\', () => {
            searchModal.classList.remove('hidden');
            searchInput.focus();
        });

        let columns = makeWidgets(state.columns, state);

        console.log('test');
        state.config.stylesheets.forEach(sheet => {
            console.log(sheet);
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', sheet);
            document.head.appendChild(link);
        })

        // When the config changes, reload the page.
        for await (const s of state) {
            const content = main({ id: 'main', role: 'main' },
                css`${s.config.style}`,
                h1({ id: 'title' }, s.config.title),
                div({ class: 'container-fluid' },
                    div({ class: 'row gx-1', id: 'columns' },
                        ...columns.map((col, nth) =>
                            // Render the columns into the view.
                            div({ class: 'col columns-' + (nth + 1) },
                                ...col.map(wid => renderer(wid.render(s))),
                            ),
                        ),
                    ),
                ),
            );
            renderNode(content, root())
        }
    }
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

export function makeWidgets(config: object[][], state: object): Widget[][] {
    return config.map(col => col.map((wid: any) => {
        switch (wid.type) {
            case 'clock':
                return new ClockWidget(state)
            case 'list':
                return new ListWidget(state, wid)
            case 'knmi':
                return new KNMIWidget(state)
            case 'rss':
                return new RSSWidget(state, wid)
            case 'space':
                return new SpaceWidget(state)
            case 'webcam':
                return new WebcamWidget(state, wid)
            case 'weather':
                return new OpenWeatherMapWidget(state, wid)
            default:
                return new ErrWidget(state, wid)
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
            { type: 'clock' },
            { type: 'knmi' }
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
    c.version = 1;
    return createState(c);
}

export function makeState(config: Config, columns: object[][]): State {
    return createState({ config, columns, widget: {} })
}

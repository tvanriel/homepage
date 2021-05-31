import {getCurrentKey, defaultConfig, loadConfig, getColumnConfig, makeWidgets, renderWindow, Config, makeState} from './app'
import {$e} from './util'
import {div} from 'skruv/html'

document.addEventListener('readystatechange', () => {
    // wait until we can interact with the document.
    if (document.readyState !== "interactive") {
        return;
    }

    let configKey = getCurrentKey();

    let colConfig = getColumnConfig();

    config(configKey).then(config => {
        renderWindow(() => $e("#main"), makeState(config,colConfig), (w) => div({class:'mb-1'}, w));

        (<HTMLInputElement>$e("#config-key")).value = configKey;

        $e('#set-key').addEventListener('click', () => {
            configKey = (<HTMLInputElement>$e('#config-key')).value;
            loadConfig(configKey).then(config => {
                localStorage.setItem('current-key', configKey);
            });
        });
    });
});

function config(key: string): Promise<Config> {
    return new Promise((res) => {
        if (key === "") {
            res(defaultConfig());
        } else {
            loadConfig(key).then(conf => res(conf));
        }
    })
}

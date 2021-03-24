import {getCurrentKey, defaultConfig, loadConfig, getColumnConfig, makeWidgets, renderWindow, Config} from './app'
import {$h, $e} from './util'

document.addEventListener('readystatechange', () => {
    // wait until we can interact with the document.
    if (document.readyState !== "interactive") {
        return;
    }



    let configKey = getCurrentKey();

    let colConfig = getColumnConfig();
    const columns = makeWidgets(colConfig);

    config(configKey).then(config => {
    renderWindow($e("#main"), config, columns);

    (<HTMLInputElement>$e("#config-key")).value = configKey;

    $e('#set-key').addEventListener('click', () => {
        configKey = (<HTMLInputElement>$e('#config-key')).value;
        loadConfig(configKey).then(config => {
            localStorage.setItem('current-key', configKey);
            const root = $e('#main');
            while(root.firstChild) root.removeChild(root.firstChild)
            renderWindow(root, config, columns);
        });

    })
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

import {getCurrentKey, defaultConfig, loadConfig, getColumnConfig, makeWidgets, renderWindow, Config} from './app'
import {$h, $e} from './util'
import Widget from './widgets/widget'

document.addEventListener('readystatechange', () => {
    // wait until we can interact with the document.
    if (document.readyState !== "interactive") {
        return;
    }

    config(getCurrentKey()).then(config => {

    let colConfig = getColumnConfig();
    let columns = makeWidgets(colConfig);

    renderWindow($e("#main"), config, columns);

    const configEditor = (<HTMLTextAreaElement>$e('#config-editor'));
    const contentEditor = (<HTMLTextAreaElement>$e('#content-editor'));
    const saveButton = (<HTMLButtonElement>$e('#save-config'));


    // Load the current config in the textareas.
    configEditor.value = JSON.stringify(config, null, '    ');
    contentEditor.value = JSON.stringify(colConfig, null, '    ');


    configEditor.addEventListener('blur', () => {
        try {
            config = (JSON.parse(configEditor.value))
            const root = $e('#main')
            while (root.firstChild) root.removeChild(root.firstChild)
            renderWindow(root, config, columns)
        } catch(e) {
            console.error(e);
        }
    });
    contentEditor.addEventListener('blur', () => {
        try {
            colConfig = (JSON.parse(contentEditor.value))
            columns = makeWidgets(colConfig);
            const root = $e('#main')
            while (root.firstChild) root.removeChild(root.firstChild)
            renderWindow(root, config, columns)
        } catch(e) {
            console.error(e);
        }

    });
    saveButton.addEventListener('click', () => save(config, colConfig))
    });
    function save(config: Config, colConfig: object[][]) {
        localStorage.setItem('widgets', JSON.stringify(colConfig));
        fetch('/api/v1/page', {
            method:'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({Content: JSON.stringify(config)}),
        }).then(res => res.json()).then(r => {
            localStorage.setItem('current-key', r.Shasum)
            location.replace('/')
        })
    }


    function config(key: string): Promise<Config> {
        return new Promise((res) => {
            if (key === "") {
                res(defaultConfig());
            } else {
                loadConfig(key).then(conf => res(conf));
            }
        })
    }
});



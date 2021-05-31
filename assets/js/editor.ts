import {getCurrentKey, defaultConfig, loadConfig, getColumnConfig, makeWidgets, renderWindow, Config, makeState} from './app'
import Widget from './widgets/widget'
import {div, button, textarea, span, a} from 'skruv/html';
import {createState} from 'skruv/state';
import {renderNode} from 'skruv/vDOM';
document.addEventListener('readystatechange', () => {
    // wait until we can interact with the document.
    if (document.readyState !== "complete") {
        return;
    }

    config(getCurrentKey()).then(config => {

        let colConfig = getColumnConfig();
        const appState = makeState(config,colConfig);
        const editorState = createState({
            config,
            columns: colConfig,
        })
        // Load the current config in the textareas.
        renderWindow(() => document.getElementById("main"), appState, (w:Widget): HTMLElement => div({"class":"mb-1"}, w));
        (async () => {
            for await (const s of editorState) {

                const jsonColConfig = JSON.stringify(s.columns, null, '    ')
                const jsonConfig = JSON.stringify(s.config, null, '    ')
                renderNode(
                    div({'id': 'editor'},
                        div({class:'row mb-3'},
                            div({class:'col'},
                                textarea({
                                    value: jsonColConfig,
                                    rows: Math.max(5,jsonColConfig.split("").filter(c=>c==="\n").length+2),
                                    class:'form-control text-white bg-dark',
                                    onblur: e => {
                                        try{
                                            const colConfig = JSON.parse(e.target.value);
                                            editorState.columns = colConfig;
                                            appState.columns = colConfig;
                                        } catch(_) {
                                            console.error(_)
                                        }
                                    }}),
                            ),
                            div({class:'col'},
                                textarea({
                                    value: jsonConfig,
                                    rows: Math.max(5,jsonConfig.split("").filter(c=>c==="\n").length+2),
                                    class:'form-control text-white bg-dark',
                                    onblur: e => {
                                        try{
                                            const config = JSON.parse(e.target.value);
                                            editorState.config = config;
                                            appState.config = config;
                                        } catch(_) {
                                            console.error(_)
                                        }
                                    }
                                }),
                            ),
                        ),
                        button({class:'btn btn-primary', id: 'save-config', onclick: () => save(editorState.config, editorState.columns)}, span({class: 'material-icons'}, 'save'), 'Save'),
                        a({class:'btn btn-secondary', href: '/'}, 'Return'),
                    ),
                    document.getElementById("editor")
                )
            }
        })()

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



import { $h } from '../util';
import Widget from './widget';

export default class KNMIWidget implements Widget {
    // eslint-disable-next-line class-methods-use-this
    public render(): HTMLElement {
        const weatherImage = $h('img', { src: `https://cdn.knmi.nl/knmi/map/general/weather-map.gif?x=${(new Date()).valueOf()}` });

        setInterval(() => {
            weatherImage.setAttribute('src', `https://cdn.knmi.nl/knmi/map/general/weather-map.gif?x=${(new Date()).valueOf()}`);
        }, 30 * 60 * 1000);

        return $h('div', { class: 'card mb-1 widget-knmi' }, [
            $h('div', { class: 'card-header' }, [$h('a', { target: '_blank', rel: 'noopener', href: 'https://knmi.nl' }, ['KNMI']), ' Weersvoorspelling']),
            weatherImage,
        ]);
    }
}

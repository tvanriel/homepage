import { $h } from '../util';
import Widget from './widget';

type Config = {
    location?: string;
    apiKey: string;
    unit: 'metric'|'imperial';
}

type OWMFragmentMain = {

        temp: number;
        feels_like: number; // eslint-disable-line camelcase
        temp_min: number;// eslint-disable-line camelcase
        temp_max: number;// eslint-disable-line camelcase

        pressure: number;
        humidity: number;
    }

type OWMFragmentWeather = {
    id: number;
    main: string;
    description: string;
    icon: string;
}

type OWMCurrentResponse = {
    coord: {
        lon: number;
        lat: number;
    }
    weather: OWMFragmentWeather[];
    base: string;
    main: OWMFragmentMain;
    visibility: number;
    wind: {
        speed: number;
        deg: number;
    }
    clouds: {
        all: number
    }
    dt: number
    sys: {
        type: number
        id: number
        message: number
        country: string
        sunset: number
        sunrise: number
    }
    timezone: number
    id: number
    name: string
    cod: number
} | {
    cod: number;
    message: string;
}
type OWMForecastResponse = {
    cod: number;
    message: number;
    cnt: number;
    list: {
        dt: number;
        main: OWMFragmentMain;
        weather: OWMFragmentWeather[];
        clouds: {
            all: number;
        }
        wind: {
            speed: number;
            deg: number;
        }
        visibility: number;
        pop: number;
        rain: {
            '3h': number;
        }
        sys: {
            pod: 'd';
        }
    }[]

    city: {
        id: number;
        name: string;
        coord: {
            lat: number;
            lon: number;
        }
        country: string;
        timezone: number;
        sunrise: number;
        sunset: number;
    }
    dt_txt: string;// eslint-disable-line camelcase

} | {
    cod: number;
    message:string;
}

type Forecast = {
    at: string;
    weather: string;
    temp: number;
}
export default class OpenWeatherMapWidget implements Widget {
    private location: string;

    private apiKey: string;

    private weather: string;

    private temp: string;

    private unit: string;

    private forecast: Forecast[] = [];

    constructor(wid: Config) {
        this.location = wid.location;
        this.apiKey = wid.apiKey;
        this.unit = wid.unit ?? 'metric';
    }

    public render(): HTMLElement {
        const errorDisplay = $h('p', { class: 'bg-red text-white p-2 rounded', style: 'display: none' }, ['']);

        const currentWeather = $h('h3', {}, ['']);
        const currentTemp = $h('h1', {}, ['']);
        const forecast = $h('div', { class: 'form-row' }, []);

        const reload = () => {
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${this.location}&appid=${this.apiKey}&units=${this.unit}`).then((res) => res.json()).then((res: OWMCurrentResponse) => {
                errorDisplay.style.display = 'none';
                errorDisplay.firstChild.nodeValue = '';
                if ('message' in res) {
                    errorDisplay.firstChild.nodeValue = res.message;
                    errorDisplay.style.display = 'block';
                    return;
                }
                currentWeather.firstChild.nodeValue = res.weather[0].description;
                currentTemp.firstChild.nodeValue = res.main.temp + { metric: ' °C', imperial: ' &deg;F' }[this.unit];
            });

            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${this.location}&appid=${this.apiKey}&units=${this.unit}`).then((res) => res.json()).then((res: OWMForecastResponse) => {
                if (!('list' in res)) {
                    errorDisplay.style.display = 'block';
                    errorDisplay.firstChild.nodeValue = res.message;
                    return;
                }

                // Filter out duplicates per day.
                const dates: string[] = [];
                // Skip today
                const cd = new Date();
                dates.push(`${cd.getFullYear()}-${cd.getMonth()}-${cd.getDate()}`);

                res.list.filter((w) => {
                    // Get the first value of a particular date.
                    const d = new Date(w.dt * 1000);
                    const dt = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                    if (!dates.includes(dt) && d.getHours() >= 11 && d.getHours() <= 14) {
                        dates.push(dt);
                        return true;
                    }
                    return false;
                })

                // Format the data for the widget.
                    .map((w) => ({
                        at: new Date(w.dt * 1000),
                        weather: w.weather[0].description,
                        temp: Math.round(w.main.temp_max) + { metric: ' °C', imperial: ' &deg;F' }[this.unit],
                    }))
                // Only take the first four.
                    .filter((_, i) => i < 4)

                // And append them to the widget.
                    .forEach((w) => {
                        forecast.appendChild($h('div', { class: 'col-3 rounded border-dark' }, [
                            $h('div', { class: 'd-flex flex-column h-100 w-100 align-content-evenly' }, [
                                $h('p', {}, [`${w.at.getMonth() + 1}-${w.at.getDate()}`]),
                                $h('p', {}, [w.weather]),
                                $h('p', { class: 'mt-auto' }, [w.temp]),
                            ]),
                        ]));
                    });
            });
        };
        reload();
        setTimeout(() => reload(), 10 * 60 * 1000);

        const card = $h('div', { class: 'card bg-dark mb-1 widget-weather' }, [
            errorDisplay,
            $h('div', { class: 'card-body' }, [
                $h('div', { class: 'form-row mb-3' }, [
                    $h('div', { class: 'col text-white' }, [currentWeather]),
                    $h('div', { class: 'col text-white' }, [currentTemp]),
                ]),
                forecast,
            ]),
        ]);

        return card;
    }
}

import {
    div, h1, h3, p,
} from 'skruv/html';
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

export default class OpenWeatherMapWidget implements Widget {
    private id: number;

    constructor(state: object, wid: Config) {
        if (state.widget.openweathermap === undefined) {
            state.widget.openweathermap = { locations: [] };
        }

        // Get the index of our results.
        this.id = state.widget.openweathermap.locations.push({
            error: '',
            location: wid.location,
            apiKey: wid.apiKey,
            unit: wid.unit ?? 'metric',
            currentWeather: 'clear',
            currentTemp: 0,
            forecast: [],
        }) - 1;

        const reload = () => {
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${state.widget.openweathermap.locations[this.id].location}&appid=${state.widget.openweathermap.locations[this.id].apiKey}&units=${state.widget.openweathermap.locations[this.id].unit}`).then((res) => res.json()).then((res: OWMCurrentResponse) => {
                if ('message' in res) {
                    state.widget.openweathermap.locations[this.id].error = res.message;
                    return;
                }
                state.widget.openweathermap.locations[this.id].error = '';
                state.widget.openweathermap.locations[this.id].currentWeather = (
                    res.weather[0].description
                );
                state.widget.openweathermap.locations[this.id].currentTemp = (
                    Math.round(res.main.temp).toString() + { metric: ' °C', imperial: ' °F' }[wid.unit ?? 'metric']
                );
            });

            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${state.widget.openweathermap.locations[this.id].location}&appid=${state.widget.openweathermap.locations[this.id].apiKey}&units=${state.widget.openweathermap.locations[this.id].unit}`).then((res) => res.json()).then((res: OWMForecastResponse) => {
                if (!('list' in res)) {
                    state.widget.openweathermap.locations[this.id].error = res.message;
                    return;
                }
                state.widget.openweathermap.locations[this.id].error = '';

                // Filter out duplicates per day.
                const dates: string[] = [];
                // Skip today
                const cd = new Date();
                dates.push(`${cd.getFullYear()}-${cd.getMonth()}-${cd.getDate()}`);

                state.widget.openweathermap.locations[this.id].forecast = res.list.filter((w) => {
                    // Get the first value of a particular date.
                    const d = new Date(w.dt * 1000);
                    const dt = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                    if (!dates.includes(dt) && d.getHours() >= 11 && d.getHours() <= 14) {
                        dates.push(dt);
                        return true;
                    }
                    return false;
                }).map((w) => ({
                    at: new Date(w.dt * 1000),
                    weather: w.weather[0].description,
                    temp: Math.round(w.main.temp_max).toString() + { metric: ' °C', imperial: ' °F' }[wid.unit ?? 'metric'],
                })).filter((_, i) => i < 4);
            });
        };
        reload();
        setInterval(() => reload(), 10 * 60 * 1000);
    }

    public render(state:object): HTMLElement {
        return div({ class: 'card bg-dark widget-weather' },
            state.widget.openweathermap.locations[this.id].error ? p({ class: 'bg-red text-white p-2 rounded', style: 'display: none' }, state.widget.openweathermap.locations[this.id].error) : div({}),
            div({ class: 'card-body' },
                div({ class: 'row gx-1 mb-3' },
                    h3({ class: 'col text-white' }, state.widget.openweathermap.locations[this.id].currentWeather),
                    h1({ class: 'col text-white' }, state.widget.openweathermap.locations[this.id].currentTemp)),
                div({ class: 'row gx-1' },
                    state.widget.openweathermap.locations[this.id].forecast.map((w) => div({ class: 'col-3 rounded' },
                        div({ class: 'd-flex flex-column h-100 w-100 align-content-vertically' },
                            p({ class: 'mb-0' }, `${w.at.getMonth() + 1}-${w.at.getDate()}`),
                            p({ class: 'mb-0' }, w.weather),
                            p({ class: 'mt-auto' }, w.temp)))))));
    }
}

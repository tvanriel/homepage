import { div, span, h2 } from 'skruv/html';
import Widget from './widget';

// Run function before setting the interval.  Interface is complicit with setInterval
// from stdlib.
function setIntervalI(f: () => void, time?: number): number {
    f(); return setInterval(f, time);
}

export default class ClockWidget implements Widget {
    constructor(state: object) {
        if (state.widget.clock === undefined) state.widget.clock = {};
        setIntervalI(() => {
            const d = new Date();
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            const seconds = d.getSeconds();
            let cur;
            // eslint-disable-next-line no-bitwise
            if ((seconds & 1) === 0) {
                cur = `${hours}:${minutes}`;
            } else {
                cur = `${hours} ${minutes}`;
            }
            if (state.widget.clock.seconds !== seconds) state.widget.clock.second = seconds;
            if (state.widget.clock.time !== cur) state.widget.clock.time = cur;
        }, 300);

        setIntervalI(() => {
            const d = new Date();
            const year = d.getFullYear().toString();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const date = d.getDate().toString().padStart(2, '0');
            const day = d.getDay();
            const cur = `${year}-${month}-${date}`;
            if (state.widget.clock.date !== cur) state.widget.clock.date = cur;
            if (state.widget.clock.day !== day) state.widget.clock.day = day;
        }, 18000);
    }

    // eslint-disable-next-line class-methods-use-this
    public render(s: object): HTMLElement {
        return div({ class: 'card bg-dark widget-clock' },
            div({ class: 'card-body' },
                div({ class: 'row no-gutters' },
                    div({ class: 'col-8' },
                        div({},
                            h2({ class: 'text-monospace d-inline' }, s.widget.clock.time),
                            ' ',
                            span({}, s.widget.clock.second?.toString()?.padStart(2, '0'))),
                        s.widget.clock.date),
                    div({ class: 'col-4 col-count-2' },
                        span({ class: `badge ${s.widget.clock.day === 0 ? 'bg-light text-dark' : 'bg-dark text-light'}` }, 'sun'),
                        span({ class: `badge ${s.widget.clock.day === 1 ? 'bg-light text-dark' : 'bg-dark text-light'}` }, 'mon'),
                        span({ class: `badge ${s.widget.clock.day === 2 ? 'bg-light text-dark' : 'bg-dark text-light'}` }, 'tue'),
                        span({ class: `badge ${s.widget.clock.day === 3 ? 'bg-light text-dark' : 'bg-dark text-light'}` }, 'wed'),
                        span({ class: `badge ${s.widget.clock.day === 4 ? 'bg-light text-dark' : 'bg-dark text-light'}` }, 'thu'),
                        span({ class: `badge ${s.widget.clock.day === 5 ? 'bg-light text-dark' : 'bg-dark text-light'}` }, 'fri'),
                        span({ class: `badge ${s.widget.clock.day === 6 ? 'bg-light text-dark' : 'bg-dark text-light'}` }, 'sat')))));
    }
}

import { $h } from '../util';
import Widget from './widget';

// Run function before setting the interval.  Interface is complicit with setInterval
// from stdlib.
function setIntervalI(f: () => void, time?: number): number {
    f(); return setInterval(f, time);
}

export default class ClockWidget implements Widget {
    // eslint-disable-next-line class-methods-use-this
    public render(): HTMLElement {
        const clockText = $h('h2', { class: 'text-monospace mb-0' }, ['']);
        const dateText = $h('p', { class: 'mb-0' }, ['']);
        const days = [
            $h('span', { class: 'badge bg-dark' }, ['sun']),
            $h('span', { class: 'badge bg-dark' }, ['mon']),
            $h('span', { class: 'badge bg-dark' }, ['tue']),
            $h('span', { class: 'badge bg-dark' }, ['wed']),
            $h('span', { class: 'badge bg-dark' }, ['thu']),
            $h('span', { class: 'badge bg-dark' }, ['fri']),
            $h('span', { class: 'badge bg-dark' }, ['sat']),
        ];
        const element = $h('div', { class: 'card bg-dark widget-clock mb-1' }, [
            $h('div', { class: 'card-body' }, [
                $h('div', { class: 'row no-gutters' }, [
                    $h('div', { class: 'col-8' }, [
                        clockText,
                        dateText,
                    ]),
                    $h('div', { class: 'col-4 col-count-2' }, days),
                ]),
            ]),
        ]);
        setIntervalI(() => {
            const d = new Date();
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            // eslint-disable-next-line no-bitwise
            if ((d.getSeconds() & 1) === 0) {
                clockText.firstChild.nodeValue = `${hours}:${minutes}`;
            } else {
                clockText.firstChild.nodeValue = `${hours} ${minutes}`;
            }
        }, 300);
        setIntervalI(() => {
            const d = new Date();
            const year = d.getFullYear().toString();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const date = d.getDate().toString().padStart(2, '0');
            const day = d.getDay();
            days.forEach((x) => { x.classList.remove('bg-light'); x.classList.add('bg-dark'); x.classList.add('text-light'); });
            days[day].classList.replace('bg-dark', 'bg-light');
            days[day].classList.replace('text-light', 'text-dark');
            if (dateText.firstChild.nodeValue !== `${year}-${month}-${date}`) {
                dateText.firstChild.nodeValue = `${year}-${month}-${date}`;
            }
        }, 18000);
        return element;
    }
}

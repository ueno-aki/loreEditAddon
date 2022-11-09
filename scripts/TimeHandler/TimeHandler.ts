import { system } from "@minecraft/server";
enum ScheduleType {
    repeat,
    delay,
}
/**```ts
world.events.blockBreak.subscribe(({ player }) => {
    const y = Schedule.repeat(tell, 20, -1, "a", player)
    .then(() => {
            world.say("ok" + `${new Date().getTime()}`);
        })
        .then(() => {
            world.say("a");
        });
        Schedule.delay(() => {
            y.cancel();
        }, 60);
});
function tell(message: string, target: Player) {
    target.tell(message + `${new Date().getTime()}`);
}
```*/
export class Schedule<T extends any[], U extends ScheduleType, V extends ScheduleOption<U>> {
    static repeat<T extends any[]>(
        task: (...args: T) => void,
        intervalTick: number,
        maxCount: number = -1,
        ...params: T
    ) {
        const repeat = new Schedule(
            ScheduleType.repeat,
            { interval: intervalTick, maxCount: maxCount },
            task,
            ...params
        );
        repeat.#init();
        return repeat;
    }

    static delay<T extends any[]>(task: (...args: T) => void, delayTick: number, ...params: T) {
        const delay = new Schedule(ScheduleType.delay, { delay: delayTick }, task, ...params);
        delay.#init();
        return delay;
    }

    #parameters: T;
    #current: number;
    #finished: boolean;
    #thenQueqe: Array<() => void>;
    private constructor(private type: U, private option: V, private task: (...args: T) => void, ...params: T) {
        this.#parameters = params;
        this.#current = 0;
        this.#finished = false;
        this.#thenQueqe = [];
    }
    #init() {
        switch (this.type) {
            case ScheduleType.repeat:
                {
                    const { interval, maxCount } = this.option as repeatOption;
                    const tick = () => {
                        if (this.#finished) {
                            this.#thenQueqe.forEach((task) => task());
                            return;
                        }
                        if (++this.#current < interval * maxCount || maxCount == -1) {
                            system.run(tick);
                            if (!(this.#current % interval)) this.task.apply(null, this.#parameters);
                        } else {
                            this.task.apply(null, this.#parameters);
                            this.#thenQueqe.forEach((task) => task());
                            this.#finished = true;
                        }
                    };
                    system.run(tick);
                }
                break;
            case ScheduleType.delay:
                {
                    const { delay } = this.option as delayOption;
                    const tick = () => {
                        if (this.#finished) {
                            this.#thenQueqe.forEach((task) => task());
                            return;
                        }
                        if (++this.#current < delay) {
                            system.run(tick);
                        } else {
                            this.task.apply(null, this.#parameters);
                            this.#thenQueqe.forEach((task) => task());
                            this.#finished = true;
                        }
                    };
                    system.run(tick);
                }
                break;
        }
    }
    cancel() {
        this.#thenQueqe = [];
        this.#finished = true;
    }
    finish() {
        this.#finished = true;
    }
    get isFinished() {
        return this.#finished;
    }
    then(task: () => void) {
        this.#thenQueqe.push(task);
        return this;
    }
}
interface repeatOption {
    interval: number;
    maxCount: number;
}
interface delayOption {
    delay: number;
}
type ScheduleOption<Type> = Type extends ScheduleType.repeat ? repeatOption : delayOption;

import { easeInBack, easeInBounce, easeInCirc, easeInCubic, easeInElastic, easeInExpo, easeInOutBack, easeInOutBounce, easeInOutCirc, easeInOutCubic, easeInOutElastic, easeInOutExpo, easeInOutQuad, easeInOutQuart, easeInOutQuint, easeInOutSine, easeInQuad, easeInQuart, easeInQuint, easeInSine, easeOutBack, easeOutBounce, easeOutCirc, easeOutCubic, easeOutElastic, easeOutExpo, easeOutQuad, easeOutQuart, easeOutQuint, easeOutSine, linear } from 'easing-utils';
export declare class Moover {
    active: boolean;
    elapsedTime: number;
    ease: typeof easeInOutQuad;
    duration: number;
    progress: number;
    value: number;
    targetValue: number;
    onUpdate: (_progress: number) => undefined;
    onComplete: () => undefined;
    constructor(config: MooverConfig);
    update(delta: number): boolean;
    stop(): void;
}
type MooverConfig = Partial<Pick<Moover, 'duration' | 'ease' | 'onUpdate' | 'onComplete'>>;
export declare class MoovManager {
    tweens: Moover[];
    lastCleanup: number;
    go(config: MooverConfig): Moover;
    update(delta: number): void;
    cleanup(delta: number): void;
    ease: {
        linear: typeof linear;
        inSine: typeof easeInSine;
        outSine: typeof easeOutSine;
        inOutSine: typeof easeInOutSine;
        inQuad: typeof easeInQuad;
        outQuad: typeof easeOutQuad;
        inOutQuad: typeof easeInOutQuad;
        inCubic: typeof easeInCubic;
        outCubic: typeof easeOutCubic;
        inOutCubic: typeof easeInOutCubic;
        inQuart: typeof easeInQuart;
        outQuart: typeof easeOutQuart;
        inOutQuart: typeof easeInOutQuart;
        inQuint: typeof easeInQuint;
        outQuint: typeof easeOutQuint;
        inOutQuint: typeof easeInOutQuint;
        inExpo: typeof easeInExpo;
        outExpo: typeof easeOutExpo;
        inOutExpo: typeof easeInOutExpo;
        inCirc: typeof easeInCirc;
        outCirc: typeof easeOutCirc;
        inOutCirc: typeof easeInOutCirc;
        inBack: typeof easeInBack;
        outBack: typeof easeOutBack;
        inOutBack: typeof easeInOutBack;
        inElastic: typeof easeInElastic;
        outElastic: typeof easeOutElastic;
        inOutElastic: typeof easeInOutElastic;
        outBounce: typeof easeOutBounce;
        inBounce: typeof easeInBounce;
        inOutBounce: typeof easeInOutBounce;
    };
}
export declare const Moov: MoovManager;
export {};
//# sourceMappingURL=Moov.d.ts.map
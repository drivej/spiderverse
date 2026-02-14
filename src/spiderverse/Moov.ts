import {
  easeInBack,
  easeInBounce,
  easeInCirc,
  easeInCubic,
  easeInElastic,
  easeInExpo,
  easeInOutBack,
  easeInOutBounce,
  easeInOutCirc,
  easeInOutCubic,
  easeInOutElastic,
  easeInOutExpo,
  easeInOutQuad,
  easeInOutQuart,
  easeInOutQuint,
  easeInOutSine,
  easeInQuad,
  easeInQuart,
  easeInQuint,
  easeInSine,
  easeOutBack,
  easeOutBounce,
  easeOutCirc,
  easeOutCubic,
  easeOutElastic,
  easeOutExpo,
  easeOutQuad,
  easeOutQuart,
  easeOutQuint,
  easeOutSine,
  linear
} from 'easing-utils';

export class Moover {
  active = true;
  elapsedTime = 0;
  ease = easeInOutQuad;
  duration = 1;
  progress = 0;
  value = 0;
  targetValue = 0;
  onUpdate = (_progress: number) => void 0;
  onComplete = () => void 0;

  constructor(config: MooverConfig) {
    Object.assign(this, config);
  }

  update(delta: number) {
    if (this.active === true) {
      this.elapsedTime += delta;
      this.progress = this.elapsedTime / this.duration;
      if (this.progress < 0) this.progress = 0;
      if (this.progress > 1) this.progress = 1;
      this.onUpdate(this.ease(this.progress));

      if (this.progress === 1) {
        this.active = false;
        this.onComplete();
      }
    }
    return this.active;
  }

  stop() {
    this.active = false;
  }
}

type MooverConfig = Partial<Pick<Moover, 'duration' | 'ease' | 'onUpdate' | 'onComplete'>>;

export class MoovManager {
  tweens: Moover[] = [];
  lastCleanup = 0;

  go(config: MooverConfig) {
    const t = new Moover(config);
    this.tweens.push(t);
    return t;
  }

  update(delta: number) {
    let i = this.tweens.length;
    while (i--) {
      this.tweens[i].update(delta);
    }
    this.cleanup(delta);
  }

  cleanup(delta: number) {
    this.lastCleanup += delta;
    if (this.lastCleanup > 10) {
      this.tweens = this.tweens.filter((t) => t.active);
      this.lastCleanup = 0;
    }
  }

  ease = {
    linear: linear,
    inSine: easeInSine,
    outSine: easeOutSine,
    inOutSine: easeInOutSine,
    inQuad: easeInQuad,
    outQuad: easeOutQuad,
    inOutQuad: easeInOutQuad,
    inCubic: easeInCubic,
    outCubic: easeOutCubic,
    inOutCubic: easeInOutCubic,
    inQuart: easeInQuart,
    outQuart: easeOutQuart,
    inOutQuart: easeInOutQuart,
    inQuint: easeInQuint,
    outQuint: easeOutQuint,
    inOutQuint: easeInOutQuint,
    inExpo: easeInExpo,
    outExpo: easeOutExpo,
    inOutExpo: easeInOutExpo,
    inCirc: easeInCirc,
    outCirc: easeOutCirc,
    inOutCirc: easeInOutCirc,
    inBack: easeInBack,
    outBack: easeOutBack,
    inOutBack: easeInOutBack,
    inElastic: easeInElastic,
    outElastic: easeOutElastic,
    inOutElastic: easeInOutElastic,
    outBounce: easeOutBounce,
    inBounce: easeInBounce,
    inOutBounce: easeInOutBounce
  };
}

export const Moov = new MoovManager();

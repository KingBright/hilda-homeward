/** A cancellable, simulation-time action. No timers and no game-state writes. */
Homeward.define('engine/action-track', [], () => {
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { n=clamp(n); return n*n*(3-2*n); };
  class ActionTrack {
    constructor(duration, score={}) {
      if (!Number.isFinite(duration) || duration<=0) throw new TypeError('Invalid action duration');
      this.duration=duration; this.elapsed=0; this.score=score; this.cancelled=false; this.claimed=false;
    }
    advance(milliseconds, paused=false) {
      if (!Number.isFinite(milliseconds) || milliseconds<0) throw new TypeError('Invalid action step');
      if (!paused && !this.cancelled) this.elapsed=Math.min(this.duration,this.elapsed+milliseconds);
      return this.sample();
    }
    sample() {
      const progress=clamp(this.elapsed/this.duration);
      return {progress, effort:smooth((progress-.22)/.6), reach:smooth(progress/.22)*(1-smooth((progress-.86)/.14)),
        phase:progress<.22?'prepare':progress<.82?'contact':progress<1?'settle':'complete',
        complete:progress===1&&!this.cancelled};
    }
    claim() { if (!this.sample().complete || this.claimed) return false; this.claimed=true; return true; }
    cancel() { this.cancelled=true; }
  }
  return {ActionTrack, smooth};
});

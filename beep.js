// ESME barkod okuma sesli onay
(function () {
  let audioCtx = null;

  function unlockAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      g.gain.value = 0.00001;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.01);
    } catch (e) {}
  }

  function successBeep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, now);
      osc.frequency.setValueAtTime(1350, now + 0.08);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.19);
    } catch (e) {}
  }

  window.addEventListener('load', function () {
    if (typeof window.scan === 'function') {
      const originalScan = window.scan;
      window.scan = function (q) {
        let p = null, before = null;
        try {
          p = typeof window.findProduct === 'function' ? window.findProduct(q) : null;
          if (p && window.counts) before = Number(window.counts[p.barcode] || 0);
        } catch (e) {}

        const result = originalScan.apply(this, arguments);

        try {
          if (p && window.counts) {
            const after = Number(window.counts[p.barcode] || 0);
            if (after > before) successBeep();
          }
        } catch (e) {}
        return result;
      };
    }

    if (typeof window.openScanner === 'function') {
      const originalOpen = window.openScanner;
      window.openScanner = function () {
        unlockAudio();
        return originalOpen.apply(this, arguments);
      };
    }

    document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  });
})();
// Simple synth for game sounds using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSound = (type) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'coin') {
        // High pitched "ding"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'levelup') {
        // Ascending arpeggio
        osc.type = 'triangle';
        gainNode.gain.value = 0.3;

        const notes = [440, 554, 659, 880]; // A major
        notes.forEach((freq, i) => {
            const t = now + (i * 0.1);
            osc.frequency.setValueAtTime(freq, t);
        });

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.8);

        osc.start(now);
        osc.stop(now + 0.8);
    }
};

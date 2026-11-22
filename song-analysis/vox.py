# Акценты вокала: из дорожки голоса (после Demucs) берём моменты, где голос вступает или ударяет слог.
import json
import numpy as np, soundfile as sf
N, HOP = 1024, 256
ids = ["real-1", "real-2", "real-3", "demo-2", "demo-3", "demo-5", "demo-6"]
out = {}
for did in ids:
    vo, sr = sf.read(f"stems/htdemucs/{did}/vocals.wav")
    vo = vo.mean(axis=1)
    win = np.hanning(N)
    n = (len(vo) - N) // HOP
    fr = np.lib.stride_tricks.sliding_window_view(vo, N)[::HOP][:n] * win
    mag = np.abs(np.fft.rfft(fr, axis=1))
    f = np.fft.rfftfreq(N, 1 / sr)
    band = (f >= 200) & (f <= 4000)
    lm = np.log1p(40 * mag[:, band] / N * 8)
    flux = np.maximum(0, np.diff(lm, axis=0, prepend=lm[:1])).mean(axis=1)
    level = lm.mean(axis=1)
    fps, lead = sr / HOP, (N / 2) / sr
    R = int(.35 * fps)
    c = np.convolve(flux, np.ones(2 * R + 1) / (2 * R + 1), mode="same")
    det = np.maximum(0, flux - c * 1.2)
    pos = det[det > 0]
    p = np.percentile(pos, 95) if len(pos) else 1
    lv95 = np.percentile(level, 95) or 1
    G = max(2, int(.05 * fps))
    acc, last = [], -9
    for i in range(G, len(det) - G):
        v = det[i]
        # голос должен реально звучать в этот момент и сразу после него
        if v < p * .45 or v < det[i - G:i + G + 1].max() or level[i:i + int(.12 * fps)].mean() < lv95 * .35:
            continue
        t = i / fps + lead
        if t - last < .28:
            continue
        last = t
        acc.append([round(float(t), 3), round(float(min(1, .45 + .55 * v / p)), 2)])
    out[did] = acc
    print(did, "вокальных акцентов:", len(acc), "в секунду:", round(len(acc) / (len(vo) / sr), 1), "первые:", [a[0] for a in acc[:6]])
json.dump(out, open("vox-map.json", "w"), separators=(",", ":"))

# Разбор песен после нейросети Demucs: из дорожки барабанов достаём удары (бочка / малый-клэп),
# из дорожки голоса — где звучит вокал. Результат — числа (время и сила ударов), сама музыка не сохраняется.
import json, sys, os
import numpy as np, soundfile as sf

P = {"real-1": .66681, "real-2": .48395, "demo-2": .47604, "demo-5": .70605, "demo-3": .70175, "demo-6": .67416, "real-3": .61237}
N, HOP = 1024, 256


def stft_mag(x, sr):
    win = np.hanning(N)
    n = max(0, (len(x) - N) // HOP)
    frames = np.lib.stride_tricks.sliding_window_view(x, N)[::HOP][:n] * win
    return np.abs(np.fft.rfft(frames, axis=1)), sr / HOP, (N / 2) / sr


def peaks(env, fps, lead, gap, thr):
    R = int(.35 * fps)
    c = np.convolve(env, np.ones(2 * R + 1) / (2 * R + 1), mode="same")
    det = np.maximum(0, env - c * 1.15)
    pos = det[det > 0]
    if not len(pos):
        return []
    p = np.percentile(pos, 95)
    G = max(2, int(.04 * fps))
    out, last = [], -9
    for i in range(G, len(det) - G):
        v = det[i]
        if v < p * thr or v < det[i - G:i + G + 1].max():
            continue
        t = i / fps + lead
        if t - last < gap:
            continue
        last = t
        out.append((round(float(t), 3), round(float(min(1, .45 + .55 * v / p)), 2)))
    return out


def main():
    res = {}
    for did, per in P.items():
        base = f"stems/htdemucs/{did}"
        dr, sr = sf.read(f"{base}/drums.wav")
        vo, _ = sf.read(f"{base}/vocals.wav")
        mix, _ = sf.read(f"wav/{did}.wav")
        dr, vo = dr.mean(axis=1), vo.mean(axis=1)
        mag, fps, lead = stft_mag(dr, sr)
        lm = np.log1p(40 * mag / N * 8)
        d = np.maximum(0, np.diff(lm, axis=0, prepend=lm[:1]))
        f = np.fft.rfftfreq(N, 1 / sr)
        kick = d[:, (f >= 40) & (f <= 150)].mean(axis=1)
        snare = d[:, (f >= 1200) & (f <= 6000)].mean(axis=1)
        hat = d[:, (f >= 7000) & (f <= 14000)].mean(axis=1)
        K, S, Hh = peaks(kick, fps, lead, .2, .45), peaks(snare, fps, lead, .2, .45), peaks(hat, fps, lead, .1, .4)
        # сильные акценты: самые мощные удары бочки и малого, не чаще чем примерно на шесть долей из десяти
        allh = sorted([(t, s, 0) for t, s in K] + [(t, min(1, s * 1.05), 1) for t, s in S], key=lambda a: -a[1])
        want, hits = round(len(dr) / sr / per * .6), []
        for t, s, b in allh:
            if len(hits) >= want:
                break
            if any(abs(h[0] - t) < per * .45 for h in hits):
                continue
            hits.append((t, s, b))
        hits.sort()
        # голос: где он звучит (уровень дорожки вокала, 20 значений в секунду)
        step = sr // 20
        v = np.sqrt(np.array([np.mean(vo[i:i + step] ** 2) for i in range(0, len(vo) - step, step)]))
        v = np.clip(v / (np.percentile(v, 95) or 1), 0, 1)
        peak_at = int(np.argmax(np.abs(mix[:sr * 8, 0])))
        res[did] = {"hits": [[t, s, b] for t, s, b in hits], "kick": [[t, s] for t, s in K], "snare": [[t, s] for t, s in S], "hat": [[t, s] for t, s in Hh],
                    "voc": [round(float(a), 2) for a in v], "len": len(mix), "peakAt": peak_at}
        print(did, "kick", len(K), "snare", len(S), "hat", len(Hh), "hits", len(hits), "len", len(mix), "peakAt", peak_at, "vocal on", round(float((v > .3).mean()), 2))
    json.dump(res, open("nn-map.json", "w"), separators=(",", ":"))


main()

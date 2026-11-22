// Telegram-бот «Тот самый день»: ещё один способ записать день.
// Человек пишет боту текст, присылает фото и называет песню. Бот шифрует всё это, кладёт в сервис пересылки
// (тот же, что передаёт фото по QR) и даёт ссылку. По ссылке сайт сам забирает день и собирает разворот и фильм.
// Бот ничего не хранит: черновик живёт в памяти, пока человек его собирает, и стирается после ссылки.
// Без библиотек: Node 20, long polling (входящих портов не нужно).
import { readFileSync } from "node:fs";
import { storyboard } from "./nn.mjs";

const TOKEN = (process.env.BOT_TOKEN || readFileSync(process.env.BOT_TOKEN_FILE || "./token.txt", "utf8")).trim();
const SITE = process.env.SITE || "https://lya22at.github.io/tot-samyi-den/";
const RELAY = process.env.RELAY || "https://relay.62.238.3.191.sslip.io/";
const API = `https://api.telegram.org/bot${TOKEN}/`, FILES = `https://api.telegram.org/file/bot${TOKEN}/`;
const MAX_MEDIA = 10, MAX_BYTES = 11 * 1024 * 1024;


const tg = async (method, body) => {
  const r = await fetch(API + method, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body || {}) });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) console.error("tg", method, j.description || r.status);
  return j;
};
const say = (chat, text, extra = {}) => tg("sendMessage", { chat_id: chat, text, ...extra });
const KB = { keyboard: [[{ text: "Записать день" }], [{ text: "Как это работает" }]], resize_keyboard: true };

// --- шифрование: тот же формат, что у страницы отправки фото (AES-GCM, ключ только в ссылке) ---
const b64u = u => Buffer.from(u).toString("base64url");
async function seal(key, meta, buf) {
  const m = new TextEncoder().encode(JSON.stringify(meta)), p = new Uint8Array(4 + m.length + buf.byteLength);
  new DataView(p.buffer).setUint32(0, m.length); p.set(m, 4); p.set(new Uint8Array(buf), 4 + m.length);
  const iv = crypto.getRandomValues(new Uint8Array(12)), c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, p));
  const o = new Uint8Array(12 + c.length); o.set(iv); o.set(c, 12); return o;
}
async function put(topic, body) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(RELAY + topic, { method: "PUT", headers: { Filename: "p.bin" }, body }).catch(() => null);
    if (r && r.ok) return true;
    await new Promise(z => setTimeout(z, 2500 * (t + 1)));
  }
  return false;
}

// --- какой это был день: сегодня, вчера или любая прошедшая дата ---
const MONTHS = ["янв", "фев", "мар", "апр", "ма", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const shiftDay = n => new Date(Date.now() + 5 * 3600e3 + n * 86400e3).toISOString().slice(0, 10);
function parseDate(t) {
  const now = shiftDay(0); let dd, mm, yy;
  let m = t.match(/^\s*(\d{1,2})[.\/\- ](\d{1,2})(?:[.\/\- ](\d{2,4}))?\s*$/);
  if (m) { dd = +m[1]; mm = +m[2]; yy = m[3] ? +m[3] : 0; }
  else if ((m = t.toLowerCase().match(/^\s*(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?/))) { dd = +m[1]; mm = MONTHS.findIndex(x => m[2].startsWith(x)) + 1; yy = m[3] ? +m[3] : 0; }
  else if (/вчера/i.test(t)) return shiftDay(-1); else if (/сегодня/i.test(t)) return now; else return null;
  if (!mm || mm > 12 || !dd || dd > 31) return null;
  if (yy && yy < 100) yy += 2000;
  const pad = v => String(v).padStart(2, "0"), mk = y => `${y}-${pad(mm)}-${pad(dd)}`;
  let iso = mk(yy || +now.slice(0, 4));
  if (!yy && iso > now) iso = mk(+now.slice(0, 4) - 1); // год не назван, а дата ещё не наступила — значит, прошлый год
  const chk = new Date(iso + "T00:00:00Z");
  if (isNaN(chk) || chk.toISOString().slice(0, 10) !== iso || iso > now || iso < "2000-01-01") return null;
  return iso;
}
const askDate = (chat, d) => { d.step = "ask-date"; return say(chat, "За какой день эта запись?", { reply_markup: { inline_keyboard: [[{ text: "Сегодня", callback_data: "d0" }, { text: "Вчера", callback_data: "d1" }], [{ text: "Другая дата", callback_data: "dx" }]] } }); };
// --- дата по Астане ---
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);

// --- черновики в памяти ---
const drafts = new Map();
const fresh = () => ({ step: "text", text: [], media: [], found: [], song: null, at: Date.now(), busy: false });
setInterval(() => { for (const [k, d] of drafts) if (Date.now() - d.at > 6 * 3600e3) drafts.delete(k); }, 600e3);

const HELLO = `Это тетрадь «Тот самый день». Она превращает один день в разворот дневника и короткий фильм под твою песню.

Мне нужно три вещи:
1. пара строк о дне — как подруге;
2. фото (можно короткие видео);
3. песня этого дня.

Нажми «Записать день».`;
const HOW = `Как это работает:
— ты пишешь о дне, присылаешь фото и называешь песню;
— я собираю это и даю ссылку;
— по ссылке открывается тетрадь, и сайт сам делает разворот, название дня и фильм.

Что на что влияет: темп и звук песни выбирают цвет бумаги и ритм фильма, цвета фото — цвет обведённых слов, слова из записи — название дня.

Я ничего не храню: текст и фото шифруются, ключ есть только в твоей ссылке, ссылка работает один час. Сам дневник хранится в твоём браузере.`;

async function findSong(q) {
  for (const c of ["", "&country=ru"]) {
    try {
      const j = await (await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=5${c}`)).json();
      const r = (j.results || []).filter(x => x.previewUrl);
      if (r.length) return r;
    } catch (e) { }
  }
  return [];
}

async function finish(chat, d) {
  if (d.busy) return; d.busy = true;
  await say(chat, "Собираю день… это несколько секунд.");
  try {
    const raw = crypto.getRandomValues(new Uint8Array(16)), key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
    const topic = "kino" + b64u(crypto.getRandomValues(new Uint8Array(12))).replace(/[-_]/g, "x");
    let sent = 0, lost = 0, n = 0; const vis = [], names = {};
    for (const m of d.media) {
      n++;
      try {
        const f = await tg("getFile", { file_id: m.id });
        if (!f.ok) { lost++; continue; }
        const buf = await (await fetch(FILES + f.result.file_path)).arrayBuffer();
        if (buf.byteLength > MAX_BYTES) { lost++; continue; }
        const ext = (f.result.file_path.match(/\.[a-z0-9]+$/i) || [m.video ? ".mp4" : ".jpg"])[0];
        const ok = await put(topic, await seal(key, { name: `tg-${n}${ext}`, mime: m.mime || (m.video ? "video/mp4" : "image/jpeg"), n, fid: "tg" + n, part: 0, parts: 1 }, buf));
        ok ? sent++ : lost++;
        if (ok) {
          names[n] = `tg-${n}${ext}`;
          // для нейросети: фото как есть (если это JPEG не больше 4 МБ), у видео — стоп-кадр от Telegram
          let b64 = null;
          try {
            if (!m.video && /\.jpe?g$/i.test(ext) && buf.byteLength < 4e6) b64 = Buffer.from(buf).toString("base64");
            else if (m.thumb) { const tf = await tg("getFile", { file_id: m.thumb }); if (tf.ok) b64 = Buffer.from(await (await fetch(FILES + tf.result.file_path)).arrayBuffer()).toString("base64"); }
          } catch (e) { }
          vis.push({ n, video: m.video, w: m.w, h: m.h, b64 });
        }
      } catch (e) { lost++; }
    }
    const x = d.song, draft = { text: d.text.join("\n").trim(), date: d.date || today(), song: x && { trackName: x.trackName, artistName: x.artistName, previewUrl: x.previewUrl, genre: x.primaryGenreName || "", year: (x.releaseDate || "").slice(0, 4), link: x.trackViewUrl || "", art: x.artworkUrl60 || "" } };
    // выжимка и раскадровка от нейросети: номера кадров заменяем на имена файлов, которые получит сайт
    const nn = await storyboard(chat, draft, vis, today());
    if (nn) {
      const nm = k => names[k], ok = k => !!names[k];
      draft.nn = { words: nn.words.slice(0, 10), board: { by: "Claude: раскадровка по рассказу и содержанию кадров", card: nm(nn.card) || null, end: nm(nn.end) || null,
        shots: nn.shots.map(q => ({ m: q.m.filter(ok).map(nm), b: [2, 4, 6, 8].includes(q.b) ? q.b : 4, w: q.w || undefined, w2: q.w2 || undefined, pol: q.pol ? 1 : undefined })).filter(q => q.m.length) } };
    }
    const ok = await put(topic, await seal(key, { kind: "draft" }, new TextEncoder().encode(JSON.stringify(draft))));
    if (!ok) throw new Error("relay");
    const url = `${SITE}?bot=${topic}.${b64u(raw)}`;
    await say(chat, `Готово.${nn ? " Нейросеть прочитала запись, посмотрела кадры и составила раскадровку фильма." : ""} В тетрадь уйдут: запись (${draft.text.length} зн.), фото и видео: ${sent}${x ? `, песня «${x.trackName}» — ${x.artistName}` : ""}.${lost ? `\nНе прошло: ${lost} (файл больше 11 МБ или не скачался) — его можно добавить на сайте.` : ""}

Открой ссылку: сайт сам придумает название дня, соберёт разворот и фильм. Проверь и нажми «вклеить в тетрадь».
Ссылка работает один час. Дневник хранится там, где ты его открыла: в Telegram и в браузере это две разные тетради, выбери одно место.`, { reply_markup: { inline_keyboard: [[{ text: "Открыть здесь, в Telegram", web_app: { url } }], [{ text: "Открыть в браузере", url }]] } });
    drafts.delete(chat);
  } catch (e) {
    console.error("finish", e.message);
    d.busy = false;
    await say(chat, "Не получилось собрать день: сервис пересылки не ответил. Нажми «Собрать ещё раз» через минуту.", { reply_markup: { inline_keyboard: [[{ text: "Собрать ещё раз", callback_data: "go" }]] } });
  }
}

async function onMessage(msg) {
  const chat = msg.chat.id, t = (msg.text || "").trim();
  if (msg.chat.type !== "private") return;
  if (t === "/start" || t === "/help") { drafts.delete(chat); return say(chat, HELLO, { reply_markup: KB }); }
  if (t === "Как это работает") return say(chat, HOW, { reply_markup: KB });
  if (t === "Записать день" || t === "/new") {
    drafts.set(chat, fresh());
    return say(chat, "Расскажи про день: что было, с кем, что запомнилось — запах, погода, смех. Можно несколькими сообщениями.\n\nКогда закончишь, пришли фото.");
  }
  let d = drafts.get(chat);
  if (!d) { d = fresh(); drafts.set(chat, d); }
  d.at = Date.now();

  const ph = msg.photo && msg.photo[msg.photo.length - 1], vid = msg.video || msg.animation, doc = msg.document && /^(image|video)\//.test(msg.document.mime_type || "") ? msg.document : null;
  if (ph || vid || doc) {
    if (msg.caption) d.text.push(msg.caption.trim());
    if (d.media.length >= MAX_MEDIA) return d.full ? null : (d.full = true, say(chat, `Хватит ${MAX_MEDIA} — больше фильм не вместит. Теперь напиши песню этого дня: название и исполнителя.`));
    const f = ph || vid || doc;
    if ((f.file_size || 0) > MAX_BYTES) return say(chat, "Этот файл слишком большой для меня (больше 11 МБ). Пришли видео покороче или добавь его потом на сайте.");
    const th = (vid && (vid.thumbnail || vid.thumb)) || (doc && (doc.thumbnail || doc.thumb)) || null;
    d.media.push({ id: f.file_id, video: !!vid || /^video/.test((doc && doc.mime_type) || ""), mime: (vid && vid.mime_type) || (doc && doc.mime_type) || "", w: f.width || 0, h: f.height || 0, thumb: th && th.file_id });
    d.step = "song";
    // альбом приходит несколькими сообщениями подряд: отвечаем один раз, когда поток затих
    clearTimeout(d.timer);
    d.timer = setTimeout(() => say(chat, `Фото и видео: ${d.media.length}. Можно прислать ещё.\n\nА теперь напиши песню этого дня: название и исполнителя.`), 1500);
    return;
  }
  if (msg.voice || msg.audio || msg.video_note) return say(chat, "Голос я пока не разбираю. Напиши текстом, а надиктовать запись можно на сайте.");
  if (!t) return;

  if (d.step === "text") {
    d.text.push(t);
    clearTimeout(d.timer);
    d.timer = setTimeout(() => say(chat, "Записала. Можно дописать ещё.\n\nТеперь пришли фото этого дня (хотя бы одно)."), 1200);
    return;
  }
  if (d.step === "date" || (d.step === "ask-date" && parseDate(t))) {
    const iso = parseDate(t);
    if (!iso) return say(chat, "Не поняла дату. Напиши так: 18.06 или 18 июня. Будущую дату поставить нельзя.");
    d.date = iso; return finish(chat, d);
  }
  // после фото текст — это название песни
  const r = await findSong(t);
  if (!r.length) return say(chat, "Такой песни не нашла. Напиши иначе: название и исполнителя, например «Sunflower Post Malone».");
  d.found = r;
  return say(chat, "Какая из них?", { reply_markup: { inline_keyboard: [...r.map((x, i) => [{ text: `${x.trackName} — ${x.artistName}`.slice(0, 60), callback_data: "s" + i }]), [{ text: "Нет нужной, поищу ещё", callback_data: "again" }]] } });
}

async function onCallback(q) {
  const chat = q.message.chat.id, d = drafts.get(chat);
  tg("answerCallbackQuery", { callback_query_id: q.id });
  if (!d) return say(chat, "Этот день уже собран или прошло много времени. Нажми «Записать день».", { reply_markup: KB });
  d.at = Date.now();
  if (q.data === "again") return say(chat, "Напиши название и исполнителя ещё раз.");
  if (q.data === "go") return finish(chat, d);
  if (/^s\d$/.test(q.data)) {
    d.song = d.found[+q.data[1]]; if (!d.song) return;
    if (!d.text.join("").trim()) { d.step = "text"; return say(chat, "Песню запомнила. Не хватает самой записи: напиши пару строк о дне."); }
    return askDate(chat, d);
  }
  if (q.data === "d0" || q.data === "d1") { d.date = shiftDay(q.data === "d1" ? -1 : 0); return finish(chat, d); }
  if (q.data === "dx") { d.step = "date"; return say(chat, "Напиши дату: день и месяц, например 18.06 или 18 июня. Год можно добавить: 18.06.2026."); }
}

// --- long polling ---
let offset = 0;
const me = await tg("getMe");
if (!me.ok) { console.error("Токен не подошёл"); process.exit(1); }
console.log("Бот запущен: @" + me.result.username);
await tg("setChatMenuButton", { menu_button: { type: "web_app", text: "Тетрадь", web_app: { url: SITE } } });
await tg("setMyCommands", { commands: [{ command: "new", description: "записать день" }, { command: "help", description: "как это работает" }] });
for (;;) {
  try {
    const r = await fetch(`${API}getUpdates?timeout=50&offset=${offset}&allowed_updates=${encodeURIComponent('["message","callback_query"]')}`, { signal: AbortSignal.timeout(65000) });
    const j = await r.json();
    if (!j.ok) { console.error("getUpdates", j.description); await new Promise(z => setTimeout(z, 5000)); continue; }
    for (const u of j.result) {
      offset = u.update_id + 1;
      (u.message ? onMessage(u.message) : u.callback_query ? onCallback(u.callback_query) : Promise.resolve()).catch(e => console.error("update", e.message));
    }
  } catch (e) { await new Promise(z => setTimeout(z, 3000)); }
}

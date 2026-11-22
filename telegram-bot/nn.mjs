// Нейросеть для бота «Тот самый день»: Claude читает запись, смотрит на кадры и составляет выжимку из главных слов и раскадровку фильма.
import { readFileSync, existsSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

// --- нейросеть: Claude читает запись, смотрит на кадры и составляет выжимку из главных слов и раскадровку фильма.
// Ключ лежит в файле на сервере. Если ключа нет или Claude не ответил, день всё равно уходит на сайт, и сайт собирает фильм сам.
const KEY_FILE = process.env.CLAUDE_KEY_FILE || "./claude-key.txt";
const claude = existsSync(KEY_FILE) ? new Anthropic({ apiKey: readFileSync(KEY_FILE, "utf8").trim() }) : null;
const NN_PER_CHAT = 6, NN_PER_DAY = 60, nnUse = { day: "", total: 0, chats: new Map() };
const Board = z.object({
  words: z.array(z.string()),
  card: z.number().int(),
  end: z.number().int(),
  shots: z.array(z.object({ m: z.array(z.number().int()), b: z.number().int(), w: z.string().nullable(), w2: z.string().nullable(), pol: z.boolean() })),
});
const NN_SYSTEM = `Ты монтажёр личного дневника «Тот самый день». Человек записал один день: текст, фото и видео, песню. По этому нужно составить раскадровку короткого фильма (20–28 секунд) и выжимку дня из главных слов.

Что вернуть:
- words: 5–8 главных слов дня по порядку рассказа. Только слова и короткие сочетания из самой записи или прямо из неё следующие (место, человек, вещь, событие, чувство). Заглавными буквами, по-русски, без точек. Не выдумывай того, чего в записи нет. Не ставь диагнозов и не называй чувства, о которых человек не писал.
- card: номер кадра для титра в начале (лучше фото, спокойное, без мелких деталей).
- end: номер кадра для финала.
- shots: кадры фильма по порядку рассказа. У каждого:
  - m: номера кадров, которые стоят вместе. Один номер — кадр во весь экран. Два или три номера — коллаж; в коллаж ставь только вертикальные кадры, близкие по смыслу. Горизонтальные кадры ставь по одному.
  - b: сколько счётов песни длится кадр: 2, 4, 6 или 8. Коллаж — не меньше 4. Сумма по всем кадрам — от 24 до 36.
  - w: главное слово, которое появляется на этом кадре, или null. Слово должно быть про то, что видно на этих кадрах. Бери слова из words.
  - w2: второе слово на этом же кадре (только если кадр длится 6 или 8 счётов), иначе null.
  - pol: true, если одиночное вертикальное фото лучше показать полароидом на бумаге (подходит для тихих и грустных дней), иначе false.
Каждый кадр используй не больше одного раза, кроме титра и финала. Не обязательно использовать все кадры: лишние и похожие пропусти. Видео показаны одним стоп-кадром.`;
export async function storyboard(chat, draft, vis, day) {
  if (!claude || !vis.length) return null;
  if (nnUse.day !== day) { nnUse.day = day; nnUse.total = 0; nnUse.chats.clear(); }
  if (nnUse.total >= NN_PER_DAY || (nnUse.chats.get(chat) || 0) >= NN_PER_CHAT) return null;
  nnUse.total++; nnUse.chats.set(chat, (nnUse.chats.get(chat) || 0) + 1);
  const content = [];
  for (const v of vis) {
    content.push({ type: "text", text: `Кадр ${v.n}: ${v.video ? "видео" : "фото"}, ${v.w && v.h ? (v.w > v.h * 1.15 ? "горизонтальный" : "вертикальный") : "ориентация неизвестна"}` });
    if (v.b64) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: v.b64 } });
  }
  content.push({ type: "text", text: `Запись дня:\n${draft.text}\n\nПесня: ${draft.song ? draft.song.trackName + " — " + draft.song.artistName + " (" + (draft.song.genre || "жанр неизвестен") + ")" : "не выбрана"}\nКадров всего: ${vis.length}. Составь раскадровку.` });
  try {
    const r = await claude.beta.messages.create({
      model: "claude-opus-5-5", max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
      output_config: { effort: "low", format: zodOutputFormat(Board) },
      system: NN_SYSTEM, messages: [{ role: "user", content }],
    });
    if (r.stop_reason === "refusal") { console.error("claude: refusal", r.stop_details && r.stop_details.category); return null; }
    const t = r.content.find(b => b.type === "text");
    const out = Board.parse(JSON.parse(t.text));
    console.log("claude: ok", r.model, "in", r.usage.input_tokens, "out", r.usage.output_tokens);
    return out;
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) console.error("claude: rate limit");
    else if (e instanceof Anthropic.AuthenticationError) console.error("claude: ключ не подошёл");
    else if (e instanceof Anthropic.APIError) console.error("claude: api", e.status, e.message);
    else console.error("claude:", e.message);
    return null;
  }
}


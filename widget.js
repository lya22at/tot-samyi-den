// «Тот самый день» — виджет для Scriptable (iPhone)
// Показывает один день из тетради: фото, дату, название папки и песню.
// Если сегодня годовщина какого-то дня, показывает его. Нажатие открывает тетрадь.
const BASE = "https://anarabilimbayeva-stack.github.io/dnevnik-kino/";
const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

async function build() {
  const w = new ListWidget();
  w.url = BASE;
  w.setPadding(12, 12, 12, 12);
  let d, label = "день из тетради";
  try {
    const data = await new Request(BASE + "widget.json").loadJSON();
    const now = new Date();
    const md = String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    d = data.days.find(x => x.date.slice(5) === md && +x.date.slice(0, 4) < now.getFullYear() + 1 && x.date !== now.toISOString().slice(0, 10));
    if (d) label = "в этот день";
    else d = data.days[Math.floor(Date.now() / 86400000) % data.days.length];
  } catch (e) {
    w.backgroundColor = new Color("#979a76");
    const t = w.addText("Тот самый день");
    t.font = new Font("Georgia-Bold", 16); t.textColor = new Color("#1d1a14");
    const s = w.addText("нет интернета — открой тетрадь позже");
    s.font = Font.systemFont(11); s.textColor = new Color("#1d1a14");
    return w;
  }
  w.url = BASE + "?d=" + d.date;
  const ink = new Color(d.ink), paper = new Color(d.paper);
  w.backgroundColor = paper;
  const [y, m, day] = d.date.split("-").map(Number);
  const dateText = day + " " + MONTHS[m - 1] + " " + y;
  let img = null;
  try { img = await new Request(BASE + d.photo).loadImage(); } catch (e) {}
  const small = config.widgetFamily === "small";

  if (small) {
    if (img) {
      w.backgroundImage = img;
      const g = new LinearGradient();
      g.colors = [new Color("#000000", 0), new Color("#000000", 0.75)];
      g.locations = [0.35, 1];
      w.backgroundGradient = g;
    }
    w.addSpacer();
    const c = img ? Color.white() : ink;
    const a = w.addText(dateText.toUpperCase()); a.font = Font.boldSystemFont(9); a.textColor = c; a.textOpacity = 0.85;
    const t = w.addText(d.title); t.font = new Font("Georgia-Bold", 13); t.textColor = c; t.lineLimit = 3; t.minimumScaleFactor = 0.8;
    return w;
  }

  const row = w.addStack(); row.centerAlignContent(); row.spacing = 12;
  if (img) {
    const frame = row.addStack(); frame.backgroundColor = new Color("#f6efe0"); frame.setPadding(5, 5, 14, 5); frame.cornerRadius = 3;
    const pic = frame.addImage(img); pic.imageSize = new Size(100, 100); pic.applyFillingContentMode(); pic.cornerRadius = 2;
  }
  const col = row.addStack(); col.layoutVertically(); col.spacing = 3;
  const a = col.addText((label + " · " + dateText).toUpperCase()); a.font = Font.boldSystemFont(9); a.textColor = ink; a.textOpacity = 0.7; a.lineLimit = 1; a.minimumScaleFactor = 0.7;
  const t = col.addText(d.title); t.font = new Font("Georgia-Bold", 17); t.textColor = ink; t.lineLimit = 3; t.minimumScaleFactor = 0.75;
  col.addSpacer(2);
  const s = col.addText("♪ " + d.song); s.font = Font.italicSystemFont(11); s.textColor = ink; s.lineLimit = 1; s.minimumScaleFactor = 0.7;
  const p = col.addText(d.pname + " · нажми, чтобы открыть"); p.font = Font.systemFont(9); p.textColor = ink; p.textOpacity = 0.6; p.lineLimit = 1;
  return w;
}

const widget = await build();
const next = new Date(); next.setHours(24, 5, 0, 0);
widget.refreshAfterDate = next;
if (config.runsInWidget) Script.setWidget(widget); else await widget.presentMedium();
Script.complete();

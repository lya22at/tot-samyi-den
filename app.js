"use strict";
/* ====================== STYLES (the visual system) ====================== */
const STYLES={
  calm:{name:"Тёплый свет",artist:"Клод Моне",chip:"Моне · тёплый свет",
    bg:"#efe3cc",ink:"#4b2e17",soft:"#9c7a55",acc:["#e0a040","#c8682c","#f2cf7a","#8fa8a0"],
    beatsPerSlide:8,grain:.13,
    when:"Слова о тепле и уюте (какао, плед, закат, парк, мама), медленная мягкая песня, тёплые светлые фото.",
    brush:"Короткие мазки цвета, взятого прямо из фото, чуть теплее. На каждый удар песни появляется пучок мазков. Сначала крупные, к концу мелкие, как пишут импрессионисты. Сверху плёночное зерно.",
    why:"Моне рисовал не предметы, а свет и воздух. Размытые тёплые мазки похожи на то, как мы помним спокойный день: без деталей, но с ощущением тепла."},
  joy:{name:"Яркий день",artist:"Анри Матисс, вырезки из бумаги",chip:"Матисс · яркий день",
    bg:"#fbf6ea",ink:"#1d2a6b",soft:"#5a6496",acc:["#e5352b","#f2b705","#1d4fd8","#2a9d5c","#ff7aa2"],
    beatsPerSlide:4,grain:.05,
    when:"Смех, друзья, праздник, море, танцы, быстрая громкая песня, яркие насыщенные фото.",
    brush:"Каждый удар вырезает из цветной бумаги новую фигуру, и через неё проступает плакатное яркое фото в окне-арке. Сильные удары бросают на холст декоративные вырезки, они падают с тенью.",
    why:"Поздний Матисс вырезал из цветной бумаги танцующие формы. Плоский чистый цвет и ритм фигур передают радость и движение."},
  tension:{name:"Ночь и ритм",artist:"Василий Кандинский",chip:"Кандинский · ночь и ритм",
    bg:"#121a2c",ink:"#e9edf6",soft:"#8090b0",acc:["#3b82f6","#f2c14e","#e63946","#e9edf6"],
    beatsPerSlide:4,grain:.08,
    when:"Дедлайн, экзамен, ночь, город, спешка, нервы, быстрая электронная песня, тёмные холодные фото.",
    brush:"Холст поделён строгой сеткой 6 на 5. На каждый удар открывается одна клетка сине-серого фото, а сильные удары ставят линию, круг или брусок.",
    why:"Кандинский строил картины как музыку: линии и круги у него звучат. Жёсткая геометрия и холодные цвета передают собранность и напряжение."},
  sad:{name:"Тихая память",artist:"японская минималистичная графика",chip:"Японский минимализм · тихая память",
    bg:"#ecebe7",ink:"#45464a",soft:"#9a9a9a",acc:["#b5473a","#8c8c8c"],
    beatsPerSlide:8,grain:.06,
    when:"Дождь, тишина, одиночество, прощание, воспоминания, медленная грустная песня, бледные серые фото.",
    brush:"Бледные размывы туши медленно проявляют маленькое фото среди пустоты. Всю песню кисть рисует круг энсо, в конце ставится красная печать.",
    why:"В японской эстетике пустота значит не меньше, чем изображение. Много воздуха и приглушённые цвета дают тишину и светлую грусть."}
};
const MOODS=["calm","joy","tension","sad"];
const FEEL_BPM={calm:72,joy:124,tension:140,sad:60};

/* ====================== TEXT ANALYSIS ====================== */
const LEX={
  calm:["тепл","уют","какао","чай","плед","спокой","солнц","закат","рассвет","парк","лист","осен","прогул","бабушк","мам","дом","кофе","книг","мягк","свеч","обним","медлен","природ","озер","пруд","лес","цвет","корица","золот","скамей","разговар"],
  joy:["смея","смех","смеял","весел","радост","ура","танц","праздн","рожден","друз","подруг","концерт","игр","мор","пляж","лет","ярк","морожен","аттракц","побед","сюрприз","подар","прыг","крут","класс","шарик","волн","жарк","счаст"],
  tension:["дедлайн","сдач","экзамен","олимпиад","контрольн","ночь","ночью","офис","город","метро","шум","устал","быстр","спеш","опазд","нерв","страшн","стресс","соревн","гонк","проект","будильник","поздн","наушник","электрон","успел","огн"],
  sad:["грус","скуч","один","одна","одиноч","дожд","туман","прощ","уехал","вспомин","ностальг","тиш","пуст","плак","жаль","слез","сер","холод","окн","ждал","капл","скуча"]
};
function words(text){return text.toLowerCase().replace(/ё/g,"е").split(/[^a-zа-я0-9-]+/).filter(Boolean)}
function analyzeText(text){
  const w=words(text), scores={calm:0,joy:0,tension:0,sad:0}, hits={calm:[],joy:[],tension:[],sad:[]};
  for(const m of MOODS) for(const word of w) for(const st of LEX[m]) if(word.startsWith(st)){scores[m]++;if(!hits[m].includes(word))hits[m].push(word);break}
  const weather=[];
  if(w.some(x=>x.startsWith("дожд")||x.startsWith("капл")))weather.push("rain");
  if(w.some(x=>x.startsWith("снег")||x.startsWith("снеж")))weather.push("snow");
  if(w.some(x=>x.startsWith("лист")))weather.push("leaves");
  if(w.some(x=>x.startsWith("звезд")))weather.push("stars");
  return {scores,hits,weather};
}

/* ====================== FOLDER TITLE ====================== */
const PLACES=[["парк","в парке"],["лес","в лесу"],["море","у моря"],["моря","у моря"],["морем","у моря"],["пляж","на пляже"],["озер","у озера"],["пруд","у пруда"],["горы","в горах"],["горах","в горах"],["школ","в школе"],["офис","в офисе"],["дач","на даче"],["кафе","в кафе"],["кино","в кино"],["каток","на катке"],["катке","на катке"],["концерт","на концерте"],["сцен","на сцене"],["стадион","на стадионе"],["музе","в музее"],["поезд","в поезде"],["самолет","в самолёте"],["двор","во дворе"],["окн","у окна"],["комнат","дома"],["дом","дома"],["город","в городе"]];
const WITH=[["мам","с мамой"],["пап","с папой"],["друз","с друзьями"],["подруг","с подругой"],["бабушк","с бабушкой"],["дедушк","с дедушкой"],["сестр","с сестрой"],["брат","с братом"],["собак","с собакой"],["класс","с классом"],["семь","с семьёй"]];
const THINGS=[["какао","и какао"],["чай","и чай"],["мороженое","и мороженое"],["морожен","и мороженое"],["шарик","и шарики"],["дожд","и дождь"],["снег","и первый снег"],["лист","и жёлтые листья"],["звезд","и звёзды"],["музык","и музыка"],["торт","и торт"],["костер","и костёр"]];
const EVENTS=[["дедлайн","перед сдачей"],["сдач","перед сдачей"],["экзамен","перед экзаменом"],["олимпиад","на олимпиаде"],["соревн","на соревнованиях"],["рожден","в день рождения"],["концерт","на концерте"]];
const MOOD_TAIL={calm:"в тёплом свете",joy:"полный смеха",tension:"на высокой скорости",sad:"в тихом ритме"};
function find(list,w){for(const [st,ph] of list) if(w.some(x=>x.startsWith(st)))return ph;return null}
function makeTitle(text,dateStr,mood){
  const w=words(text), month=new Date(dateStr+"T12:00").getMonth();
  const season=[11,0,1].includes(month)?"зим":[2,3,4].includes(month)?"весен":[5,6,7].includes(month)?"лет":"осен";
  let time="день"; if(w.some(x=>x.startsWith("ноч")))time="ночь"; else if(w.some(x=>x.startsWith("вечер")||x.startsWith("закат")))time="вечер"; else if(w.some(x=>x.startsWith("утр")||x.startsWith("рассвет")))time="утро";
  const end={день:{зим:"Зимний",весен:"Весенний",лет:"Летний",осен:"Осенний"},вечер:{зим:"Зимний",весен:"Весенний",лет:"Летний",осен:"Осенний"},ночь:{зим:"Зимняя",весен:"Весенняя",лет:"Летняя",осен:"Осенняя"},утро:{зим:"Зимнее",весен:"Весеннее",лет:"Летнее",осен:"Осеннее"}};
  // formula: [season + time of day] [event] [place] [with whom] [and what], always 3-7 whole words
  const parts=[end[time][season],time];let count=2;
  const ev=find(EVENTS,w), place=find(PLACES,w), who=find(WITH,w), thing=find(THINGS,w);
  for(const ph of [ev,ev===place?null:place,who,thing]){
    if(!ph)continue;const k=ph.split(" ").length;if(count+k>7)continue;parts.push(ph);count+=k}
  if(parts.length===2)parts.push(MOOD_TAIL[mood]);
  return parts.join(" ");
}

/* ====================== PHOTO ANALYSIS ====================== */
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}return[h,s,l]}
function hex(c){return"#"+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("")}
function analyzePhotos(bitmaps){
  const c=document.createElement("canvas");c.width=c.height=48;const x=c.getContext("2d",{willReadFrequently:true});
  let warm=0,lum=0,sat=0,n=0;const buckets=new Map();
  for(const bm of bitmaps){x.drawImage(bm,0,0,48,48);const d=x.getImageData(0,0,48,48).data;
    for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];warm+=(r-b)/255;const[,s,l]=rgb2hsl(r,g,b);lum+=l;sat+=s;n++;
      const k=(r>>5)<<6|(g>>5)<<3|(b>>5);const o=buckets.get(k)||{c:0,r:0,g:0,b:0};o.c++;o.r+=r;o.g+=g;o.b+=b;buckets.set(k,o)}}
  const top=[...buckets.values()].sort((a,b)=>b.c-a.c).slice(0,6).map(o=>[o.r/o.c,o.g/o.c,o.b/o.c]);
  return {warmth:warm/n,brightness:lum/n,saturation:sat/n,palette:top.map(hex),paletteRGB:top};
}

/* ====================== AUDIO ANALYSIS ====================== */
let actx=null;function ac(){if(!actx){const C=window.AudioContext||window.webkitAudioContext;actx=new C()}return actx}
function decode(buf){const a=ac();return new Promise((res,rej)=>{const p=a.decodeAudioData(buf.slice(0),res,rej);if(p&&p.then)p.then(res,rej)})}
function analyzeAudio(ab){
  const sr=ab.sampleRate,ch=ab.getChannelData(0),dur=ab.duration;
  const start=Math.floor(Math.min(30,dur*.2)*sr),len=Math.min(ch.length-start,Math.floor(40*sr));
  const hop=512,fr=1024,env=[];let rmsSum=0,zcr=0,cnt=0;
  for(let i=start;i+fr<start+len;i+=hop){let e=0,z=0;for(let j=0;j<fr;j++){const v=ch[i+j];e+=v*v;if(j&&(v>=0)!==(ch[i+j-1]>=0))z++}e=Math.sqrt(e/fr);env.push(e);rmsSum+=e;zcr+=z/fr;cnt++}
  const on=env.map((v,i)=>i?Math.max(0,v-env[i-1]):0);
  const fps=sr/hop;let best=0,bestBpm=100;
  for(let bpm=55;bpm<=180;bpm+=0.5){const lag=fps*60/bpm;let s=0;const l0=Math.floor(lag),f=lag-l0;
    for(let i=0;i+l0+1<on.length;i++)s+=on[i]*(on[i+l0]*(1-f)+on[i+l0+1]*f);
    s*=1+0.15*Math.exp(-Math.pow((bpm-110)/50,2));
    if(s>best){best=s;bestBpm=bpm}}
  const rms=rmsSum/Math.max(1,cnt),db=20*Math.log10(rms+1e-9);
  // "percussiveness": how sharp the hits are compared to the overall loudness (mastered songs are all loud, hits are not)
  const perc=on.reduce((a,b)=>a+b,0)/Math.max(1,on.length)/(rms+1e-9);
  // soft songs without sharp hits are almost never fast: halve a doubled tempo
  if(perc<.05&&bestBpm>100&&bestBpm/2>=50)bestBpm/=2;
  const loud=Math.max(0,Math.min(1,(db+32)/24)),hits=Math.max(0,Math.min(1,(perc-.02)/.08));
  const P=paintSeconds(dur);
  return {bpm:Math.round(bestBpm),energy:+(hits*.75+loud*.25).toFixed(2),brightness:Math.max(0,Math.min(1,(zcr/cnt)/.12)),duration:dur,paint:P,...songTimeline(ch,sr,P)};
}
// How long the song paints: the whole song if short, otherwise its first 45 seconds.
function paintSeconds(dur){return Math.max(15,Math.min(45,dur||30))}
// The painting score: every "hit" of the song (onset) with its strength, and loudness every 0.1 s.
function songTimeline(ch,sr,P){
  const hop=512,fr=1024,n=Math.min(ch.length,Math.floor((P+1)*sr)),env=[];
  for(let i=0;i+fr<n;i+=hop){let e=0;for(let j=0;j<fr;j+=2){const v=ch[i+j];e+=v*v}env.push(Math.sqrt(e/(fr/2)))}
  const fps=sr/hop,on=env.map((v,i)=>i?Math.max(0,v-env[i-1]):0),w=Math.round(fps*.4),onsets=[];let last=-1,mx=1e-9;
  for(let i=1;i<on.length-1;i++){let m=0,c=0;for(let k=Math.max(0,i-w);k<Math.min(on.length,i+w);k++){m+=on[k];c++}m/=c;
    if(on[i]>m*1.8&&on[i]>=on[i-1]&&on[i]>=on[i+1]&&(i-last)/fps>.11){onsets.push([i/fps,on[i]]);last=i;mx=Math.max(mx,on[i])}}
  const peak=Math.max(...env,1e-9),lv=[];for(let t=0;t<P+1;t+=.1){const i=Math.min(env.length-1,Math.floor(t*fps));lv.push(+(env[Math.max(0,i)]/peak).toFixed(3))}
  return {onsets:onsets.map(([t,s])=>[+t.toFixed(3),+Math.min(1,s/mx*1.2).toFixed(3)]),env:lv};
}
// Without a song file: a steady pulse from the chosen tempo.
function syntheticTimeline(bpm,P){const onsets=[],env=[],b=60/bpm;for(let t=0;t<P;t+=b)onsets.push([+t.toFixed(3),onsets.length%4===0?1:.55]);
  for(let t=0;t<P+1;t+=.1){const ph=(t%b)/b;env.push(+(.35+.4*Math.exp(-ph*5)).toFixed(3))}return{onsets,env}}

/* ====================== DECISION: mood + explainable reasons ====================== */
function decide(text,photo,music,feel){
  const T=analyzeText(text), s={...T.scores}, why=[];
  const top=MOODS.filter(m=>T.hits[m].length).map(m=>`«${T.hits[m].slice(0,3).join("», «")}» → ${STYLES[m].name.toLowerCase()}`);
  why.push(`<b>Текст.</b> ${top.length?"Слова "+top.join("; "):"Особых слов настроения не нашлось"}.`);
  if(music){
    const fast=music.bpm>=110,slow=music.bpm<88;
    if(fast){s.joy+=1;s.tension+=1}if(slow){s.calm+=1;s.sad+=1}
    if(music.energy>.6){s.joy+=.6;s.tension+=.6}else if(music.energy<.4){s.calm+=.6;s.sad+=.6}
    if(music.brightness>.55){s.tension+=.4}
    why.push(`<b>Песня.</b> Темп ${music.bpm} ударов в минуту${music.corrected?" (поправлен вручную)":""} (${fast?"быстрая":slow?"медленная":"средняя"}), энергия ${Math.round(music.energy*100)}%${music.auto?", посчитано по файлу":", по описанию"}. ${fast?"Быстрая песня тянет к ярким и резким стилям":slow?"Медленная песня тянет к тихим и тёплым стилям":"Средний темп не перевешивает"}.`);
  }
  if(feel){s[feel]+=1.5}
  if(photo){
    if(photo.warmth>.08){s.calm+=.7;s.joy+=.4}else if(photo.warmth<-.02){s.tension+=.6;s.sad+=.5}
    if(photo.brightness<.3)s.tension+=.7; if(photo.brightness>.6)s.joy+=.4;
    if(photo.saturation>.45)s.joy+=.6; else if(photo.saturation<.2)s.sad+=.7;
    why.push(`<b>Фото.</b> ${photo.warmth>.08?"Тёплые":photo.warmth<-.02?"Холодные":"Нейтральные"} цвета, ${photo.brightness<.3?"тёмные":photo.brightness>.6?"светлые":"средней яркости"}, ${photo.saturation>.45?"насыщенные":photo.saturation<.2?"бледные":"спокойные"}. Главные цвета фото добавлены в палитру дня.`);
  }
  let mood="calm",mx=-1;for(const m of MOODS)if(s[m]>mx){mx=s[m];mood=m}
  why.push(`<b>Итог.</b> Больше всего «голосов» у стиля «${STYLES[mood].name}» (${STYLES[mood].artist}). ${STYLES[mood].why}`);
  if(music)why.push(`<b>Кисть.</b> Песня рисует картину ${Math.round(music.paint||30)} с: ${(music.onsets||[]).length} ударов${music.auto?" из самой песни":" ровного пульса"} становятся мазками. Сильный удар оставляет крупный след, тихий — маленький. Готовая картина «дышит» в темпе ${music.bpm}.`);
  if(T.weather.length)why.push(`<b>Погода.</b> В тексте есть ${T.weather.map(w=>({rain:"дождь",snow:"снег",leaves:"листья",stars:"звёзды"})[w]).join(", ")}, поэтому это добавлено поверх фото.`);
  return {mood,scores:s,why,weather:T.weather};
}

/* ====================== THE PAINTER: the song paints the day ======================
   A painting is a deterministic score: every hit of the song (onset) and every 0.1 s tick
   is an event. Each artist "hand" turns events into marks on a canvas. Because the score is
   stored, the painting in the hall is exactly the one the song painted live. */
const W=1080,H=1350,M=60,WX=60,WY=150,WW=960,WH=850;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mk(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c}
function ctx2(c){return c.getContext("2d",{willReadFrequently:true})}
function pix(c,fn){const x=ctx2(c),im=x.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const o=fn(d[i],d[i+1],d[i+2]);d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2]}x.putImageData(im,0,0);return c}
function softBlur(c,f){const s=mk(Math.max(1,c.width/f|0),Math.max(1,c.height/f|0)),sx=s.getContext("2d");sx.imageSmoothingQuality="high";sx.drawImage(c,0,0,s.width,s.height);const o=mk(c.width,c.height),ox=o.getContext("2d");ox.imageSmoothingQuality="high";ox.drawImage(s,0,0,o.width,o.height);return o}
function mix(a,b,t){return a.map((v,i)=>v+(b[i]-v)*t)}
function h2r(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
let GRAIN=null;function grain(){if(GRAIN)return GRAIN;const c=mk(256,256),x=c.getContext("2d"),im=x.createImageData(256,256);for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=60}x.putImageData(im,0,0);GRAIN=c;return c}

// Constant composition rule for every day: 1 photo fills the canvas, 2 photos stand side by side,
// 3+ photos: one large on the left, the others stacked on the right.
function regions(n,r){if(n<=1)return[r];if(n===2)return[{x:r.x,y:r.y,w:r.w/2,h:r.h},{x:r.x+r.w/2,y:r.y,w:r.w/2,h:r.h}];
  const k=Math.min(n-1,3),lw=r.w*.6,out=[{x:r.x,y:r.y,w:lw,h:r.h}];for(let i=0;i<k;i++)out.push({x:r.x+lw,y:r.y+r.h*i/k,w:r.w-lw,h:r.h/k});return out}
function drawCover(x,bm,r){const s=Math.max(r.w/bm.width,r.h/bm.height),dw=bm.width*s,dh=bm.height*s;x.save();x.beginPath();x.rect(r.x,r.y,r.w,r.h);x.clip();x.drawImage(bm,r.x+(r.w-dw)/2,r.y+(r.h-dh)/2,dw,dh);x.restore()}

// The "model" the artist looks at: the photos, already seen through the artist's eyes.
function buildSource(day,bms){
  const src=mk(WW,WH),x=ctx2(src),mood=day.mood;
  const area=mood==="sad"?{x:WW*.3,y:WH*.22,w:WW*.62,h:WH*.62}:{x:0,y:0,w:WW,h:WH};
  regions(bms.length,area).forEach((r,i)=>bms[i]&&drawCover(x,bms[i],r));
  if(mood==="calm")pix(src,(r,g,b)=>[r*1.06+12,g+4,b*.84]);
  if(mood==="joy")pix(src,(r,g,b)=>{const q=v=>Math.min(255,Math.round(v/64)*64*1.12),m=(r+g+b)/3;return[q(m+(r-m)*1.6),q(m+(g-m)*1.6),q(m+(b-m)*1.6)]});
  if(mood==="tension"){const d1=[13,27,62],d2=[176,196,236];pix(src,(r,g,b)=>{let l=(.3*r+.59*g+.11*b)/255;l=Math.max(0,Math.min(1,(l-.5)*1.7+.5));return mix(d1,d2,l)})}
  if(mood==="sad")pix(src,(r,g,b)=>{const m=(r+g+b)/3;return[m+(r-m)*.35+30,m+(g-m)*.35+30,m+(b-m)*.35+32]});
  return {src,data:x.getImageData(0,0,WW,WH).data,area,blur:softBlur(src,mood==="calm"?10:6)};
}
function colorAt(S,x,y,j){const ix=Math.max(0,Math.min(WW-1,x|0)),iy=Math.max(0,Math.min(WH-1,y|0)),k=(iy*WW+ix)*4,d=S.data;if(!d[k+3])return null;const r=S.rnd;return`rgb(${d[k]+(r()-.5)*j|0},${d[k+1]+(r()-.5)*j|0},${d[k+2]+(r()-.5)*j|0})`}
function blob(rnd,k){const p=[];for(let j=0;j<k*2;j++)p.push(.6+rnd()*.55);return p}
function blobPath(x,cx,cy,r,pts,rot,leaf){x.beginPath();const k=pts.length;for(let j=0;j<=k;j++){const a=rot+j/k*6.283,rr=r*pts[j%k]*(leaf&&j%2?.55:1);j?x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr):x.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath()}

function newPainter(day,bms){
  const T=day.music,P=T.paint||paintSeconds(T.duration);
  const S={day,mood:day.mood,P,onsets:T.onsets||[],env:T.env||[],oi:0,ti:0,count:0,done:false,doneAt:0,rnd:mulberry(day.seed||7),
    layer:mk(WW,WH),fx:[],cells:null,cellsDone:0,cut:0,geo:0,washes:0};
  Object.assign(S,buildSource(day,bms));S.lx=S.layer.getContext("2d");
  if(day.mood==="tension"){const order=[];for(let i=0;i<30;i++)order.push(i);for(let i=order.length-1;i>0;i--){const j=S.rnd()*(i+1)|0;[order[i],order[j]]=[order[j],order[i]]}S.cells=order}
  const st=STYLES[day.mood];S.acc=[...st.acc,...((day.photo&&day.photo.paletteRGB)||[]).slice(0,3).map(c=>hex(mix(c,h2r(st.acc[0]),.35)))];
  return S;
}
const HANDS={
  calm:{ // Monet: short strokes of colour taken from the photo; big strokes first, fine ones later
    stroke(S,x0,y0,size,ang){const c=colorAt(S,x0,y0,34);if(!c)return;const l=(14+S.rnd()*28)*size,w=(5+S.rnd()*8)*size,a=ang+(S.rnd()-.5)*.6,x=S.lx;
      x.globalAlpha=.82;x.strokeStyle=c;x.lineWidth=w;x.lineCap="round";x.beginPath();x.moveTo(x0-Math.cos(a)*l/2,y0-Math.sin(a)*l/2);x.quadraticCurveTo(x0+(S.rnd()-.5)*w,y0+(S.rnd()-.5)*w,x0+Math.cos(a)*l/2,y0+Math.sin(a)*l/2);x.stroke();x.globalAlpha=1;S.count++},
    onset(S,str,p){const cx=S.rnd()*WW,cy=S.rnd()*WH,ang=-.5+(S.rnd()-.5)*.8,n=18+str*40|0,rad=60+120*(1-p);for(let i=0;i<n;i++){const a=S.rnd()*6.283,r=Math.sqrt(S.rnd())*rad;this.stroke(S,cx+Math.cos(a)*r,cy+Math.sin(a)*r,1.9-1.2*p,ang)}},
    tick(S,lv,p){const target=7200*Math.min(1,p),n=Math.min(500,Math.max(Math.round(lv*14),target-S.count|0));for(let i=0;i<n;i++)this.stroke(S,S.rnd()*WW,S.rnd()*WH,1.9-1.2*p,-.5+(S.rnd()-.5)*.5)},
    finish(S){S.lx.save();S.lx.globalCompositeOperation="destination-over";S.lx.drawImage(S.blur,0,0);S.lx.restore()}},
  joy:{ // Matisse: every hit cuts a shape out of the coloured paper; strong hits drop a decorative cut-out
    reveal(S,str,p){const cx=S.rnd()*WW,cy=S.rnd()*WH,r=(70+120*str)*(1.35-.6*p),pts=blob(S.rnd,5+(S.rnd()*4|0)),rot=S.rnd()*6.28,x=S.lx;x.save();blobPath(x,cx,cy,r,pts,rot,false);x.clip();x.drawImage(S.src,0,0);x.restore();S.count++},
    onset(S,str,p,t){this.reveal(S,str,p);if(str>.6&&S.cut<11){S.cut++;const c={x:S.rnd()<.5?S.rnd()*.25*WW:WW-S.rnd()*.25*WW,y:S.rnd()*WH,r:50+S.rnd()*70,pts:blob(S.rnd,5+(S.rnd()*3|0)),rot:S.rnd()*6.28,leaf:S.rnd()<.5,c:S.acc[S.cut%S.acc.length]};
      blobPath(S.lx,c.x,c.y,c.r,c.pts,c.rot,c.leaf);S.lx.fillStyle=c.c;S.lx.fill();S.fx.push({t0:t,dur:.35,kind:"drop",c})}},
    tick(S,lv,p,t){const target=95*Math.min(1,p);while(S.count<target)this.reveal(S,.5,p)},
    finish(S){S.lx.save();S.lx.globalCompositeOperation="destination-over";S.lx.drawImage(S.src,0,0);S.lx.restore()}},
  tension:{ // Kandinsky: the grid opens cell by cell on the beat, every hit adds a line, a circle or a bar
    cell(S){if(S.cellsDone>=S.cells.length)return;const i=S.cells[S.cellsDone++],cx=i%6,cy=i/6|0,w=WW/6,h=WH/5;S.lx.drawImage(S.src,cx*w,cy*h,w,h,cx*w,cy*h,w,h);S.count++},
    mark(S,str,p){if(S.geo>46)return;S.geo++;const x=S.lx,r=S.rnd,kind=S.geo%4,px=r()*WW,py=r()*WH,col=STYLES.tension.acc[S.geo%3],big=1.4-p;
      x.globalAlpha=.9;if(kind===0){x.fillStyle=col;x.beginPath();x.arc(px,py,(16+str*60)*big,0,6.283);x.fill()}
      else if(kind===1){x.strokeStyle=col;x.lineWidth=3+str*3;x.beginPath();x.arc(px,py,(30+r()*90)*big,0,6.283);x.stroke()}
      else if(kind===2){x.strokeStyle="#e9edf6";x.lineWidth=2+str*6;x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*700,py+(r()-.5)*500);x.stroke()}
      else{x.fillStyle=col;x.save();x.translate(px,py);x.rotate(r()*3.14);x.fillRect(-5,-70*big,10,140*big);x.restore()}x.globalAlpha=1},
    onset(S,str,p){if(S.cellsDone<Math.ceil(30*p)+2)this.cell(S);if(str>.45)this.mark(S,str,p)},
    tick(S,lv,p){while(S.cellsDone<Math.floor(30*Math.min(1,p)))this.cell(S)},
    finish(S){while(S.cellsDone<30)this.cell(S);S.lx.save();S.lx.globalCompositeOperation="destination-over";S.lx.drawImage(S.src,0,0);S.lx.restore();
      const x=S.lx;x.strokeStyle="rgba(233,237,246,.25)";x.lineWidth=1;for(let i=1;i<6;i++){x.beginPath();x.moveTo(WW*i/6,0);x.lineTo(WW*i/6,WH);x.stroke()}for(let i=1;i<5;i++){x.beginPath();x.moveTo(0,WH*i/5);x.lineTo(WW,WH*i/5);x.stroke()}}},
  sad:{ // Japanese minimalism: soft washes of pale colour appear slowly; an ink circle (enso) is drawn over the whole song
    wash(S,str){const a=S.area,cx=a.x+S.rnd()*a.w,cy=a.y+S.rnd()*a.h,r=120+S.rnd()*160,t=mk(r*2|0,r*2|0),tx=t.getContext("2d");
      tx.drawImage(S.src,cx-r,cy-r,r*2,r*2,0,0,r*2,r*2);tx.globalCompositeOperation="destination-in";const g=tx.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,`rgba(0,0,0,${.45+.4*str})`);g.addColorStop(1,"rgba(0,0,0,0)");tx.fillStyle=g;tx.fillRect(0,0,r*2,r*2);
      S.lx.drawImage(t,cx-r,cy-r);S.count++},
    onset(S,str){if(str>.55)this.wash(S,str)},
    tick(S,lv,p){const target=70*Math.min(1,p);while(S.count<target)this.wash(S,.4)},
    finish(S){S.lx.save();S.lx.globalCompositeOperation="destination-over";S.lx.globalAlpha=.9;S.lx.drawImage(S.src,0,0);S.lx.restore();drawEnso(S.lx,1,WX*0,0);drawSeal(S.lx)}}
};
function drawEnso(x,prog){x.save();x.strokeStyle="rgba(52,52,56,.82)";x.lineCap="round";const cx=250,cy=270,R=175,seg=60,end=Math.floor(seg*prog);
  for(let i=0;i<end;i++){const a0=-1.9+i/seg*5.9,a1=-1.9+(i+1)/seg*5.9;x.lineWidth=16*(1-i/(seg*1.25))+2;x.beginPath();x.arc(cx,cy,R+Math.sin(i*.7)*2,a0,a1);x.stroke()}x.restore()}
function drawSeal(x){x.save();x.fillStyle=STYLES.sad.acc[0];x.globalAlpha=.88;x.fillRect(WW-92,44,48,48);x.globalAlpha=1;x.fillStyle="#f3eee8";x.font="600 22px 'JetBrains Mono',monospace";x.textAlign="center";x.fillText("記",WW-68,77);x.restore()}

function levelAt(S,t){const i=Math.max(0,Math.min(S.env.length-1,Math.floor(t*10)));return S.env[i]||0}
function paintUntil(S,t){
  const hand=HANDS[S.mood],P=S.P;
  while(!S.done){
    const nextTick=S.ti*.1,nextOn=S.oi<S.onsets.length?S.onsets[S.oi][0]:Infinity,nt=Math.min(nextTick,nextOn);
    if(nt>t)break;
    if(nt>=P){hand.finish(S);S.done=true;S.doneAt=P;break}
    const p=nt/P;
    if(nextOn<=nextTick){hand.onset(S,S.onsets[S.oi][1],p,nextOn);S.oi++}else{hand.tick(S,levelAt(S,nextTick),p,nextTick);S.ti++}
  }
}
function finishNow(S){paintUntil(S,S.P+1);S.fx=[]}

const WD=["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
function wrap(x,text,maxW){const out=[];let line="";for(const w of text.split(" ")){const t=line?line+" "+w:w;if(x.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}if(line)out.push(line);return out}

// One frame: the same frame and type for every day (constant), the painting inside (variable).
function drawFrame(x,S,t){
  const day=S.day,st=STYLES[S.mood],lv=levelAt(S,Math.min(t,S.P)),bpm=day.music.bpm;
  x.save();x.fillStyle=st.bg;x.fillRect(0,0,W,H);
  x.save();
  if(S.mood==="joy"){x.beginPath();x.moveTo(WX,WY+WH);x.lineTo(WX,WY+WW/2);x.arc(WX+WW/2,WY+WW/2,WW/2,Math.PI,0);x.lineTo(WX+WW,WY+WH);x.closePath();x.clip()}
  else if(S.mood!=="sad"){x.beginPath();x.rect(WX,WY,WW,WH);x.clip()}
  // a breathing canvas: the finished painting moves very slightly with the music
  const breathe=S.done?1+.006*Math.sin(t*bpm/60*Math.PI):1;
  x.translate(WX+WW/2,WY+WH/2);x.scale(breathe,breathe);x.drawImage(S.layer,-WW/2,-WH/2);x.setTransform(1,0,0,1,0,0);
  if(S.mood==="sad"&&!S.done){x.save();x.translate(WX,WY);drawEnso(x,Math.min(1,t/S.P));x.restore()}
  // live effects: falling cut-outs (Matisse)
  for(const f of S.fx){const k=(t-f.t0)/f.dur;if(k<0||k>1)continue;const c=f.c,s=1+(1-k)*.5;x.save();x.translate(WX,WY);x.globalAlpha=.35*(1-k);x.fillStyle="#000";blobPath(x,c.x+14*(1-k)*6,c.y+18*(1-k)*6,c.r*s,c.pts,c.rot,c.leaf);x.fill();x.globalAlpha=1;x.restore()}
  if(S.fx.length>40)S.fx=S.fx.filter(f=>t-f.t0<f.dur);
  x.restore();
  // weather from the text keeps falling over the painting
  if(!S.weather){S.weather=(day.weather||[]).map(w=>({w,parts:Array.from({length:w==="rain"?140:w==="stars"?60:45},(_,i)=>{const r=mulberry(i*13+7);return{x:r(),y:r(),s:.5+r(),p:r()*6.28}})}))}
  for(const L of S.weather)for(const p of L.parts){
    if(L.w==="rain"){const y=(p.y+t*.35*p.s)%1;x.strokeStyle=S.mood==="sad"?"rgba(90,100,115,.35)":"rgba(255,255,255,.4)";x.lineWidth=1.5;x.beginPath();x.moveTo(WX+p.x*WW,WY+y*WH);x.lineTo(WX+p.x*WW-3,WY+y*WH+24*p.s);x.stroke()}
    if(L.w==="snow"){const y=(p.y+t*.05*p.s)%1;x.fillStyle="rgba(255,255,255,.85)";x.beginPath();x.arc(WX+p.x*WW+Math.sin(t+p.p)*12,WY+y*WH,3*p.s,0,6.283);x.fill()}
    if(L.w==="leaves"){const y=(p.y+t*.04*p.s)%1;x.save();x.translate(WX+p.x*WW+Math.sin(t*.7+p.p)*30,WY+y*WH);x.rotate(t+p.p);x.fillStyle=["#d9822b","#e8b23a","#b5532a"][(p.p*3|0)%3];x.beginPath();x.ellipse(0,0,10*p.s,5*p.s,0,0,6.283);x.fill();x.restore()}
    if(L.w==="stars"){x.fillStyle=`rgba(255,250,220,${.4+.4*Math.sin(t*2+p.p)})`;x.fillRect(WX+p.x*WW,WY+p.y*WH*.5,3,3)}}
  const g=grain();x.globalAlpha=st.grain;const ox=(t*97|0)%256,oy=(t*53|0)%256;for(let gx=-ox;gx<W;gx+=256)for(let gy=-oy;gy<H;gy+=256)x.drawImage(g,gx,gy);x.globalAlpha=1;
  // constant layer
  x.fillStyle=st.ink;x.font="500 26px 'JetBrains Mono',monospace";x.textBaseline="alphabetic";
  const d=new Date(day.date+"T12:00");x.fillText(`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} · ${WD[d.getDay()].toUpperCase()}`,M,108);
  x.textAlign="right";x.fillText(`№ ${String(day.num||1).padStart(3,"0")}`,W-M,108);x.textAlign="left";
  // the title is signed by hand once the song has finished painting
  x.font="700 68px Caveat,cursive";const tl=wrap(x,day.title,W-2*M).slice(0,2);
  const sign=S.done?Math.min(1,(t-S.doneAt)/2.2):0;
  if(sign>0){x.save();const tw=Math.max(...tl.map(l=>x.measureText(l).width));x.beginPath();x.rect(M-10,WY+WH+20,(tw+20)*sign*1.02,150);x.clip();tl.forEach((l,i)=>x.fillText(l,M,WY+WH+82+i*64));x.restore()}
  else{x.globalAlpha=.5;x.fillStyle=st.soft;x.fillRect(M,WY+WH+60,(W-2*M)*Math.min(1,t/S.P),3);x.globalAlpha=1;x.fillStyle=st.soft;x.font="400 22px 'JetBrains Mono',monospace";x.fillText("ПЕСНЯ РИСУЕТ…",M,WY+WH+44)}
  x.font="400 22px 'JetBrains Mono',monospace";x.fillStyle=st.soft;x.fillText(st.chip.toUpperCase(),M,H-52);
  x.textAlign="right";x.fillText(`♪ ${bpm} BPM`,W-M-150,H-52);x.textAlign="left";
  const ph=(t*bpm/60)%1,pulse=Math.exp(-ph*5);x.fillStyle=st.ink;for(let i=0;i<12;i++){const h=6+Math.abs(Math.sin(i*1.7+t*3))*lv*40+pulse*8*(S.done?.4:1);x.fillRect(W-M-130+i*11,H-60-h/2,6,h)}
  x.restore();
}

/* ====================== PLAYER ====================== */
const Player={raf:0,S:null,day:null,cv:null,src:null,buf:null,clock0:0,live:false,rec:null,
  async open(day){this.stop();this.day=day;this.cv=document.getElementById("v-canvas");this.S=newPainter(day,await bitmapsOf(day));finishNow(this.S);this.S.doneAt=-10;this.clock0=performance.now();this.loop()},
  now(){if(this.live&&this.src)return ac().currentTime-this.start;return(performance.now()-this.clock0)/1000},
  loop(){const x=this.cv.getContext("2d");const tick=()=>{const t=this.now();if(this.live)paintUntil(this.S,t);drawFrame(x,this.S,this.live?t:t+this.S.P);this.raf=requestAnimationFrame(tick)};tick()},
  async paint({record=false}={}){const day=this.day;this.stopAudio();this.S=newPainter(day,await bitmapsOf(day));this.live=true;this.clock0=performance.now();
    let dest=null;
    if(day.audioBlob){const a=ac();if(a.state==="suspended")await a.resume();if(!this.buf)this.buf=await decode(await day.audioBlob.arrayBuffer());
      const s=a.createBufferSource();s.buffer=this.buf;s.connect(a.destination);if(record&&a.createMediaStreamDestination){dest=a.createMediaStreamDestination();s.connect(dest)}
      s.start();this.src=s;this.start=a.currentTime;s.onended=()=>{if(this.src===s){this.src=null;this.live=false;this.clock0=performance.now()-(this.S.P+3)*1000;onPaintEnd()}}}
    if(record)this.record(dest);
  },
  record(dest){try{const vs=this.cv.captureStream(30),tracks=[...vs.getVideoTracks(),...(dest?dest.stream.getAudioTracks():[])],stream=new MediaStream(tracks);
      const type=["video/mp4","video/webm;codecs=vp9,opus","video/webm"].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t));const rec=new MediaRecorder(stream,type?{mimeType:type}:undefined),chunks=[];
      rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.onstop=()=>{const blob=new Blob(chunks,{type:rec.mimeType||"video/webm"}),name=`${this.day.title}.${(rec.mimeType||"").includes("mp4")?"mp4":"webm"}`;this.rec=null;setPlayLabel();if(TGDAY)deliverToChat(blob,name);else saveFile(blob,name)};
      rec.start();this.rec=rec;setTimeout(()=>{if(rec.state!=="inactive")rec.stop()},(this.S.P+3.5)*1000)}catch(e){if(TGDAY){setTimeout(()=>deliverToChat(null),(this.S.P+3)*1000)}else msg("Запись видео в этом браузере не работает. Попробуй Chrome.")}},
  stopAudio(){if(this.src){try{this.src.onended=null;this.src.stop()}catch(e){}this.src=null}this.live=false},
  stop(){cancelAnimationFrame(this.raf);this.stopAudio();if(this.rec&&this.rec.state!=="inactive")this.rec.stop();try{speechSynthesis.cancel()}catch(e){}}
};
// without a song file the painting follows the steady pulse; it ends on its own
setInterval(()=>{if(Player.live&&!Player.src&&Player.S&&Player.S.done&&Player.now()>Player.S.P+2.5){Player.live=false;Player.clock0=performance.now()-(Player.S.P+3)*1000;onPaintEnd()}},300);
/* ====================== STORAGE (IndexedDB, browser-only) ====================== */
const DB={db:null,mem:new Map(),
  async open(){try{this.db=await new Promise((res,rej)=>{const r=indexedDB.open("atmos-diary",1);r.onupgradeneeded=()=>r.result.createObjectStore("days",{keyPath:"id"});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){this.db=null}},
  async all(){if(!this.db)return[...this.mem.values()];try{return await new Promise((res,rej)=>{const r=this.db.transaction("days").objectStore("days").getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){return[...this.mem.values()]}},
  async put(d){this.mem.set(d.id,d);if(!this.db)return;try{await new Promise((res,rej)=>{const tx=this.db.transaction("days","readwrite");tx.objectStore("days").put(d);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(e){}},
  async del(id){this.mem.delete(id);if(!this.db)return;try{await new Promise((res,rej)=>{const tx=this.db.transaction("days","readwrite");tx.objectStore("days").delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(e){}}
};

/* ====================== BUILD A DAY ====================== */
const BMS=new WeakMap();
async function loadBitmap(blob){if(window.createImageBitmap){try{return await createImageBitmap(blob)}catch(e){}}
  return await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(blob)})}
async function bitmapsOf(day){if(!BMS.has(day)){const a=[];for(const b of day.photoBlobs.slice(0,4))a.push(await loadBitmap(b));BMS.set(day,a)}return BMS.get(day)}
function synthMusic(bpm,feel){const P=paintSeconds(30);return{bpm,energy:{calm:.35,joy:.8,tension:.85,sad:.25}[feel]??.5,brightness:.4,auto:false,duration:30,paint:P,...syntheticTimeline(bpm,P)}}
async function buildDay({id,date,text,photoBlobs,audioBlob,song,feel,demo},status=()=>{}){
  status("Смотрю на фото…");const day={id,date,text,photoBlobs,audioBlob:audioBlob||null,song,feel:feel||"",demo:!!demo,created:Date.now()};
  const bms=await bitmapsOf(day);day.photo=analyzePhotos(bms);
  if(audioBlob){status("Слушаю песню и запоминаю каждый удар…");try{day.music={...analyzeAudio(await decode(await audioBlob.arrayBuffer())),auto:true}}catch(e){day.music=null}}
  if(!day.music&&feel)day.music=synthMusic(FEEL_BPM[feel],feel);
  status("Выбираю художника и придумываю название…");
  day.seed=(id.split("").reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)>>>0)|1;applyDecision(day);return day;
}
function applyDecision(day){
  const dec=decide(day.text,day.photo,day.music,day.feel);day.mood=dec.mood;day.why=dec.why;day.weather=dec.weather;
  if(!day.music)day.music=synthMusic(FEEL_BPM[dec.mood],dec.mood);
  if(!day.titleEdited)day.title=makeTitle(day.text,day.date,day.mood);day.thumbKey="";
}
async function ensureThumb(day){const key=[day.num,day.title,day.mood,day.music.bpm,day.music.onsets.length].join("|");if(day.thumb&&day.orb&&day.thumbKey===key)return false;
  const S=newPainter(day,await bitmapsOf(day));finishNow(S);const c=mk(W,H);drawFrame(c.getContext("2d"),S,S.P+30);
  const s=mk(480,600);s.getContext("2d").drawImage(c,0,0,480,600);day.thumb=s.toDataURL("image/jpeg",.85);day.thumbKey=key;
  // the day's "drop": three colours sampled from the finished painting itself (not a fixed mood colour)
  const o=mk(3,3),ox=o.getContext("2d",{willReadFrequently:true});ox.drawImage(c,WX,WY,WW,WH,0,0,3,3);const d=ox.getImageData(0,0,3,3).data,cols=[];
  for(const k of[4,0,8]){const i=k*4;cols.push(hex([d[i],d[i+1],d[i+2]]))}day.orb=cols;return true}

/* ====================== TELEGRAM MINI APP MODE ======================
   Opened from the bot: ?day=<id>&k=<key> paints that day and sends the video back to the chat;
   ?hall=1 shows the person's hall from the bot's storage. API_BASE is the bot server address. */
const API_BASE=""; // e.g. "https://kartiny-dney-bot.<name>.workers.dev" — filled in at deploy
const QS=new URLSearchParams(location.search),TGDAY=QS.get("day")?{d:QS.get("day"),k:QS.get("k")}:null,TGHALL=QS.get("hall")==="1";
const tgApp=()=>window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initData?window.Telegram.WebApp:null;
async function posterBlob(day){const S=newPainter(day,await bitmapsOf(day));finishNow(S);const c=mk(W,H);drawFrame(c.getContext("2d"),S,S.P+30);return await new Promise(r=>c.toBlob(r,"image/jpeg",.9))}
async function deliverToChat(video,name){const d=Player.day;msg("Отправляю картину в чат…");
  try{const fd=new FormData();fd.append("d",TGDAY.d);fd.append("k",TGDAY.k);
    fd.append("meta",JSON.stringify({title:d.title,mood:d.mood,artist:STYLES[d.mood].artist,bpm:d.music.bpm,dateHuman:human(d.date)}));
    fd.append("poster",await posterBlob(d),"kartina.jpg");if(video)fd.append("video",video,name||"kartina.mp4");
    const r=await fetch(API_BASE+"/api/deliver",{method:"POST",body:fd});if(!r.ok)throw new Error(r.status);
    msg("Готово! Видео картины уже в чате.");const t=tgApp();if(t)setTimeout(()=>t.close(),2500)}
  catch(e){msg("Не получилось отправить в чат. Попробуй ещё раз.")}}
async function bootTelegramDay(){const t=tgApp();if(t){t.ready();t.expand()}
  document.querySelector("header.top").hidden=true;$("view-hall").hidden=true;$("hero").hidden=true;
  const r=await fetch(`${API_BASE}/api/day?d=${encodeURIComponent(TGDAY.d)}&k=${encodeURIComponent(TGDAY.k)}`);if(!r.ok){document.querySelector(".wrap").insertAdjacentHTML("beforeend",'<p class="loading">Этот день не найден.</p>');return}
  const j=await r.json(),photoBlobs=[];for(const u of j.photos)photoBlobs.push(await (await fetch(u)).blob());const audioBlob=j.audio?await (await fetch(j.audio)).blob():null;
  const day=await buildDay({id:j.id,date:j.date,text:j.text,photoBlobs,audioBlob,song:j.song||{},feel:j.feel||""});DAYS=[day];day.num=1;
  await openDay(day);$("v-close").hidden=true;$("v-del").hidden=true;$("v-zip").hidden=true;$("v-rec").hidden=true;$("v-play").hidden=true;
  $("v-big").textContent="Смотреть, как песня рисует";$("v-big").onclick=()=>startPaint(true)}
async function bootTelegramHall(){const t=tgApp();if(t){t.ready();t.expand()}
  try{const r=await fetch(API_BASE+"/api/days",{headers:{"x-init-data":t?t.initData:""}}),j=await r.json();const f=$("hall");
    $("hallcount").textContent=`${j.days.length} ${plural(j.days.length,"картина","картины","картин")} в зале`;document.querySelector("header.top").hidden=true;$("hero").hidden=true;
    f.innerHTML=j.days.length?j.days.map((d,i)=>`<a class="art" style="--dy:${[0,24,8,32][i%4]}px" href="?day=${encodeURIComponent(d.id)}&k=${encodeURIComponent(d.k)}"><div class="mat"><img src="${esc(d.img)}" alt=""></div><div class="label"><b>${esc(d.title)}</b><span>${human(d.date)}</span><span>По мотивам: ${esc(d.artist||"")}</span></div></a>`).join(""):'<p class="loading">Пока нет картин. Нажми в чате «Записать день».</p>'}
  catch(e){$("hall").innerHTML='<p class="loading">Зал не открылся. Открой его из чата с ботом.</p>'}}

/* ====================== UI ====================== */
const $=id=>document.getElementById(id);let DAYS=[];
function plural(n,a,b,c){return n%10===1&&n%100!==11?a:[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?b:c}
function msg(t){$("v-msg").textContent=t}
function saveFile(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();
  msg("Файл сохраняется. Если ничего не произошло, значит этот предпросмотр запрещает скачивание. На опубликованном сайте оно работает.")}
function show(view){if(view==="year")renderYear();for(const v of["hall","year","new","rules"]){$("view-"+v).hidden=v!==view;const t=$("tab-"+v);if(v===view)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current")}
  $("hero").hidden=view!=="hall";window.scrollTo(0,0)}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>show(b.dataset.view));
$("brand").onclick=e=>{e.preventDefault();show("hall")};
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c])}
const MONTHS=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
function human(d){const x=new Date(d+"T12:00");return`${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`}
async function renderHall(){const f=$("hall");DAYS.sort((a,b)=>a.date<b.date?-1:1);DAYS.forEach((d,i)=>d.num=i+1);
  try{await document.fonts.load("700 68px Caveat");await document.fonts.load("500 26px 'JetBrains Mono'")}catch(e){}
  for(const d of DAYS){if(await ensureThumb(d)&&!d.demo)await DB.put(d)}
  const n=DAYS.length;$("hallcount").textContent=n?`${n} ${plural(n,"картина","картины","картин")} в зале`:"Зал пока пуст";
  const offs=[0,24,8,32,16,4];
  f.innerHTML=DAYS.map((d,i)=>`<button class="art" style="--dy:${offs[i%offs.length]}px" data-id="${esc(d.id)}" aria-label="${esc(d.title)}"><div class="mat"><img src="${d.thumb}" alt=""></div><div class="label"><b>${esc(d.title)}</b><span>${human(d.date)}</span><span>По мотивам: ${esc(STYLES[d.mood].artist)}${d.demo?". Пример":""}${d.draft?". Допиши строчку":""}</span></div></button>`).join("")
    +`<button class="art empty" style="--dy:16px" id="addart"><div class="mat"><div>Здесь будет твой следующий день</div></div><div class="label"><b>Пустая рама</b><span>Нажми, чтобы записать день</span></div></button>`;
  f.querySelectorAll(".art[data-id]").forEach(t=>t.onclick=()=>openDay(DAYS.find(d=>d.id===t.dataset.id)));
  $("addart").onclick=()=>show("new");
}
function renderYear(){const y=$("year");if(!DAYS.length){y.innerHTML='<p class="loading">Пока нет дней.</p>';return}
  const year=+DAYS[DAYS.length-1].date.slice(0,4),by={};DAYS.forEach(d=>{if(+d.date.slice(0,4)===year)by[d.date]=d});
  const got=Object.keys(by).length;$("yearhead").textContent=`${year}: ${got} ${plural(got,"день","дня","дней")} из ${(year%4?365:366)}`;
  const MN=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];let html="";
  for(let m=0;m<12;m++){const first=new Date(year,m,1),len=new Date(year,m+1,0).getDate(),pad=(first.getDay()+6)%7;
    let cells=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(w=>`<span class="wd">${w}</span>`).join("")+'<span class="drop pad"></span>'.repeat(pad);
    for(let d=1;d<=len;d++){const key=`${year}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,day=by[key];
      cells+=day&&day.orb?`<button class="drop has" data-id="${esc(day.id)}" style="--c1:${day.orb[0]};--c2:${day.orb[1]};--c3:${day.orb[2]};--e:${(day.music.energy||.5).toFixed(2)}" title="${esc(day.title)}" aria-label="${d} ${MONTHS[m]}: ${esc(day.title)}"></button>`:`<span class="drop">${d}</span>`}
    html+=`<div class="month"><h3>${MN[m]}</h3><div class="mgrid">${cells}</div></div>`}
  y.innerHTML=html;y.querySelectorAll(".drop.has").forEach(b=>b.onclick=()=>openDay(DAYS.find(d=>d.id===b.dataset.id)))}
function setPlayLabel(){$("v-rec").textContent=Player.rec?"Идёт запись…":"Записать видео";$("v-rec").disabled=!!Player.rec}
function onPaintEnd(){$("v-big").hidden=false;$("v-big").textContent="Ещё раз";setPlayLabel()}
async function openDay(day){
  $("v-chip").textContent=`${STYLES[day.mood].name}, по мотивам: ${STYLES[day.mood].artist}`;$("v-title").value=day.title;$("v-text").value=day.text;$("v-audio").value="";$("v-editbox").open=!!day.draft;
  $("v-why").innerHTML=day.why.map(w=>`<li>${w}</li>`).join("");$("v-bpm").textContent=`Темп песни: ${day.music.bpm}. Если он ощущается вдвое медленнее или быстрее, поправь:`;
  const ext=day.audioBlob&&/mp4|m4a|aac/.test(day.audioBlob.type)?"m4a":"mp3";
  const files=[["запись.txt",`${day.text.length} знаков`],...day.photoBlobs.map((b,i)=>[`фото_${i+1}.jpg`,`${Math.round(b.size/1024)} КБ`]),
    [day.audioBlob?"песня."+ext:"песня (ссылка)",day.song&&(day.song.name||day.song.artist)?`${esc(day.song.name||"")}${day.song.artist?", "+esc(day.song.artist):""}`:"нет"],
    ["картина.png","готовое воспоминание"],["партитура.json",`${day.music.onsets.length} ударов кисти`],["озвучка","голос «"+STYLES[day.mood].name.toLowerCase()+"»"]];
  $("v-files").innerHTML=files.map(f=>`<li><span>${esc(f[0])}</span><span>${f[1]}</span></li>`).join("");
  const l=$("v-link");if(day.song&&day.song.link){l.href=day.song.link;l.hidden=false}else l.hidden=true;
  $("v-del").hidden=false;$("v-del2").hidden=true;msg(day.audioBlob?"":"У этого дня нет файла песни, поэтому кисть идёт по ровному пульсу без звука.");
  $("v-big").hidden=false;$("v-big").textContent="Смотреть, как песня рисует";
  const dlg=$("viewer");if(!dlg.open){try{dlg.showModal()}catch(e){dlg.setAttribute("open","")}}
  await Player.open(day);setPlayLabel();
}
$("v-redo").onclick=async()=>{const d=Player.day,btn=$("v-redo");btn.disabled=true;try{d.text=$("v-text").value.trim();d.draft=!d.text;const f=$("v-audio").files[0];
    if(f){d.audioBlob=f;d.feel="";msg("Слушаю песню…");try{d.music={...analyzeAudio(await decode(await f.arrayBuffer())),auto:true}}catch(e){msg("Не получилось прочитать песню.")}}
    else if(!d.audioBlob)d.music=null;
    d.titleEdited=false;applyDecision(d);if(d.demo){d.demo=false}await DB.put(d);await renderHall();await openDay(d);if(f)startPaint(false)}finally{btn.disabled=false}};
async function startPaint(record){$("v-big").hidden=true;try{await Player.paint({record})}catch(e){console.error(e);msg("Не получилось включить песню в этом браузере.")}setPlayLabel()}
$("v-big").onclick=()=>startPaint(false);$("v-play").onclick=()=>startPaint(false);$("v-rec").onclick=()=>startPaint(true);
$("v-close").onclick=()=>{Player.stop();$("viewer").close()};
$("viewer").addEventListener("close",()=>Player.stop());
$("v-voice").onclick=()=>{try{const s=speechSynthesis;s.cancel();const u=new SpeechSynthesisUtterance(Player.day.text);u.lang="ru-RU";const v=s.getVoices().find(v=>v.lang&&v.lang.startsWith("ru"));if(v)u.voice=v;
  const p={calm:[.85,.95,.9],joy:[1.12,1.2,1],tension:[1.18,.8,1],sad:[.78,.85,.75]}[Player.day.mood];u.rate=p[0];u.pitch=p[1];u.volume=p[2];s.speak(u)}catch(e){msg("Этот браузер не умеет озвучивать текст.")}};
$("v-title").onchange=async()=>{const d=Player.day;d.title=$("v-title").value.trim()||d.title;d.titleEdited=true;if(!d.demo)await DB.put(d);await renderHall();Player.open(d)};
async function retempo(k){const d=Player.day,b=Math.round(d.music.bpm*k);if(b<40||b>220)return;d.music={...d.music,bpm:b,corrected:true};if(!d.audioBlob)Object.assign(d.music,syntheticTimeline(b,d.music.paint));
  applyDecision(d);if(!d.demo)await DB.put(d);await renderHall();openDay(d)}
$("v-half").onclick=()=>retempo(.5);$("v-dbl").onclick=()=>retempo(2);
$("v-del").onclick=()=>{$("v-del").hidden=true;$("v-del2").hidden=false};
$("v-del2").onclick=async()=>{const d=Player.day;await DB.del(d.id);DAYS=DAYS.filter(x=>x!==d);if(d.demo)hideDemo(d.id);Player.stop();$("viewer").close();renderHall()};
function hideDemo(id){try{const h=JSON.parse(localStorage.getItem("hiddenDemo")||"[]");h.push(id);localStorage.setItem("hiddenDemo",JSON.stringify(h))}catch(e){}}
$("v-zip").onclick=async()=>{const d=Player.day;if(!window.JSZip){msg("Не загрузилась библиотека для архива.");return}
  const z=new JSZip(),f=z.folder(d.title);f.file("запись.txt",`${d.title}\n${human(d.date)}\n\n${d.text}\n`);d.photoBlobs.forEach((b,i)=>f.file(`фото_${i+1}.jpg`,b));
  if(d.audioBlob)f.file("песня.mp3",d.audioBlob);f.file("песня.txt",`${d.song?.name||""} — ${d.song?.artist||""}\n${d.song?.link||""}\n`);
  const S=newPainter(d,await bitmapsOf(d));finishNow(S);const c=mk(W,H);drawFrame(c.getContext("2d"),S,S.P+30);f.file("картина.png",await new Promise(r=>c.toBlob(r,"image/png")));
  f.file("партитура.json",JSON.stringify({bpm:d.music.bpm,onsets:d.music.onsets},null,0));f.file("почему_так.txt",d.why.map(w=>w.replace(/<[^>]+>/g,"")).join("\n"));
  saveFile(await z.generateAsync({type:"blob"}),d.title+".zip")};

/* ====================== MONTH IMPORT: read the date each photo was taken ====================== */
async function photoDate(file){
  try{const b=new DataView(await file.slice(0,262144).arrayBuffer());if(b.getUint16(0)===0xFFD8){let o=2;
    while(o+4<b.byteLength){const mk=b.getUint16(o),len=b.getUint16(o+2);if(mk===0xFFE1&&b.getUint32(o+4)===0x45786966){const t=o+10,le=b.getUint16(t)===0x4949,u16=i=>b.getUint16(t+i,le),u32=i=>b.getUint32(t+i,le);
        const read=(ifd,tags)=>{const n=u16(ifd),out={};for(let i=0;i<n;i++){const e=ifd+2+i*12,tag=u16(e);if(tags.includes(tag)){const cnt=u32(e+4),off=cnt>4?u32(e+8):e+8;
            if(tag===0x8769)out[tag]=u32(e+8);else{let str="";for(let k=0;k<cnt-1;k++)str+=String.fromCharCode(b.getUint8(t+off+k));out[tag]=str}}}return out};
        const i0=read(u32(4),[0x8769,0x0132]);let dt=i0[0x0132];if(i0[0x8769]){const ex=read(i0[0x8769],[0x9003]);if(ex[0x9003])dt=ex[0x9003]}
        if(dt&&/^\d{4}:\d\d:\d\d/.test(dt))return dt.slice(0,10).replace(/:/g,"-");break}
      if((mk&0xFF00)!==0xFF00)break;o+=2+len}}}catch(e){}
  const d=new Date(file.lastModified||Date.now());return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
let BATCH=null;
$("b-photos").onchange=async()=>{const files=[...$("b-photos").files];$("b-preview").textContent="Читаю даты…";const by={};
  for(const f of files){const d=await photoDate(f);(by[d]=by[d]||[]).push(f)}
  const days=Object.keys(by).sort();BATCH=days.map(d=>{const fs=by[d];const pick=fs.length<=4?fs:[0,1,2,3].map(i=>fs[Math.floor(i*(fs.length-1)/3)]);return{date:d,files:pick,total:fs.length}});
  $("b-preview").innerHTML=days.length?`Нашла ${files.length} фото за ${days.length} ${days.length%10===1&&days.length%100!==11?"день":[2,3,4].includes(days.length%10)&&![12,13,14].includes(days.length%100)?"дня":"дней"}: `+BATCH.map(b=>`${human(b.date)} (${b.total})`).join(", ")+". Если фото за день больше четырёх, беру четыре разных из начала, середины и конца дня.":"";
  $("b-go").hidden=!days.length;$("b-go").textContent=`Нарисовать ${days.length} ${days.length===1?"день":"дней"}`};
$("b-go").onclick=async()=>{if(!BATCH)return;const btn=$("b-go");btn.disabled=true;let ok=0,bad=0;
  for(const [i,b] of BATCH.entries()){$("b-status").textContent=`Рисую ${i+1} из ${BATCH.length}: ${human(b.date)}…`;
    try{const day=await buildDay({id:"b"+Date.now()+i,date:b.date,text:"",photoBlobs:b.files,audioBlob:null,song:{},feel:""});day.draft=true;DAYS.push(day);await DB.put(day);ok++}catch(e){console.warn(e);bad++}}
  await renderHall();$("b-status").textContent=`Готово: ${ok} ${ok%10===1&&ok%100!==11?"картина":[2,3,4].includes(ok%10)&&![12,13,14].includes(ok%100)?"картины":"картин"} в зале${bad?`, ${bad} дней не получилось (возможно, формат HEIC: сохрани фото как JPEG)`:""}. Открой любую и допиши строчку о дне.`;
  btn.disabled=false;BATCH=null;btn.hidden=true;$("b-photos").value="";$("b-preview").textContent="";show("hall")};

// atelier form
$("f-date").value=new Date().toISOString().slice(0,10);
$("f-photos").onchange=()=>{$("f-thumbs").innerHTML="";for(const f of [...$("f-photos").files].slice(0,4)){const i=document.createElement("img");i.src=URL.createObjectURL(f);i.alt="";$("f-thumbs").appendChild(i)}};
$("form").onsubmit=async e=>{e.preventDefault();const btn=$("f-submit");btn.disabled=true;
  try{const day=await buildDay({id:"d"+Date.now(),date:$("f-date").value,text:$("f-text").value.trim(),photoBlobs:[...$("f-photos").files].slice(0,4),audioBlob:$("f-audio").files[0]||null,
      song:{name:$("f-sname").value.trim(),artist:$("f-artist").value.trim(),link:$("f-link").value.trim()},feel:(document.querySelector('input[name=feel]:checked')||{}).value||""},s=>$("f-status").textContent=s);
    DAYS.push(day);await renderHall();await DB.put(day);$("f-status").textContent="Готово! Картина висит в зале.";$("form").reset();$("f-thumbs").innerHTML="";$("f-date").value=new Date().toISOString().slice(0,10);
    show("hall");await openDay(day);startPaint(false)}
  catch(err){console.error(err);$("f-status").textContent="Что-то пошло не так: "+err.message}
  btn.disabled=false};

// rules
$("rules").innerHTML=MOODS.map(m=>{const s=STYLES[m];return`<article class="rule"><div><h3>${esc(s.name)}</h3><p class="hint">По мотивам: ${esc(s.artist)}</p></div><div class="sw">${[s.bg,s.ink,...s.acc].map(c=>`<span style="background:${c}" title="${c}"></span>`).join("")}</div><div class="text"><p><b>Когда:</b> ${esc(s.when)}</p><p><b>Кисть:</b> ${esc(s.brush)}</p><p><b>Почему:</b> ${esc(s.why)}</p></div></article>`}).join("");

// hero: the painting being painted, and the four painters as sample strips
const Hero={raf:0,day:null,
  async play(day){cancelAnimationFrame(this.raf);this.day=day;const x=$("hero-canvas").getContext("2d"),S=newPainter(day,await bitmapsOf(day));
    $("hero-cap").textContent=`№ ${String(day.num||1).padStart(3,"0")}, ${human(day.date)}`;
    document.querySelectorAll(".strip").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===day.mood)));
    if(matchMedia("(prefers-reduced-motion: reduce)").matches){finishNow(S);S.doneAt=-10;drawFrame(x,S,S.P+3);return}
    const speed=Math.max(1,S.P/12),t0=performance.now(),end=S.P+3;
    const tick=()=>{const t=(performance.now()-t0)/1000*speed;paintUntil(S,t);drawFrame(x,S,Math.min(t,end));if(t<end&&this.day===day)this.raf=requestAnimationFrame(tick)};tick()}};
function heroDay(m){return DAYS.find(d=>d.mood===m&&d.demo)||DAYS.find(d=>d.mood===m)}
function initHero(){let first=null;
  document.querySelectorAll(".strip").forEach(b=>{const d=heroDay(b.dataset.mood);b.disabled=!d;if(d&&!first)first=d;b.onclick=()=>{const d2=heroDay(b.dataset.mood);if(d2)Hero.play(d2)}});
  if(first)Hero.play(first);else $("fan").hidden=true}
$("hero-new").onclick=()=>show("new");
$("hero-listen").onclick=async()=>{if(!Hero.day)return;await openDay(Hero.day);startPaint(false)};

// boot
(async()=>{if(TGDAY||TGHALL)await new Promise(r=>setTimeout(r,300));
  if(TGDAY){await bootTelegramDay();return}if(TGHALL){await bootTelegramHall();return}
  await DB.open();let saved=await DB.all();DAYS=saved.filter(d=>d.music&&d.music.onsets);
  let hidden=[];try{hidden=JSON.parse(localStorage.getItem("hiddenDemo")||"[]")}catch(e){}
  try{const list=await (await fetch("demo/days.json")).json();
    for(const d of list){if(hidden.includes(d.id)||DAYS.some(x=>x.id===d.id))continue;
      const photoBlobs=[];for(const p of d.photos)photoBlobs.push(await (await fetch("demo/"+p)).blob());
      const audioBlob=d.song.file?await (await fetch("demo/"+d.song.file)).blob():null;
      DAYS.push(await buildDay({...d,photoBlobs,audioBlob,demo:true}))}}
  catch(e){console.warn("demo days not loaded",e)}
  await renderHall();initHero();
  window.__diaryReady=DAYS.map(d=>({title:d.title,mood:d.mood,bpm:d.music.bpm,onsets:d.music.onsets.length,P:d.music.paint}));
})();

// ════════════ AVATAR SYSTEM ════════════

var TYPES = {
analyst: {
name:‘The Analyst’, tagline:‘You see the signal in everything. Others see noise.’,
color:’#4a90d9’, glow:’#1a3a6a’, silhouette:‘analyst’,
animal:‘owl’, tech:‘visor’, paletteIdx:0,
council:[‘Carroll Quigley’,‘Hannah Arendt’,‘Claude’]
},
probe: {
name:‘The Probe’, tagline:‘You go first. You always have.’,
color:’#d4aa44’, glow:’#6a4a10’, silhouette:‘probe’,
animal:‘fox’, tech:‘antenna’, paletteIdx:1,
council:[‘Buckminster Fuller’,‘Nikola Tesla’,‘Claude’]
},
synthesizer: {
name:‘The Synthesizer’, tagline:‘You combine what others keep separate.’,
color:’#9060d0’, glow:’#401080’, silhouette:‘synthesizer’,
animal:‘octopus’, tech:‘circuit’, paletteIdx:2,
council:[‘Carl Jung’,‘Alan Watts’,‘Claude’]
},
vector: {
name:‘The Vector’, tagline:‘Force with direction. You make things move.’,
color:’#d04030’, glow:’#601010’, silhouette:‘probe’,
animal:‘wolf’, tech:‘exhaust’, paletteIdx:3,
council:[‘Frantz Fanon’,‘Rosa Luxemburg’,‘Claude’]
},
anomaly: {
name:‘The Anomaly’, tagline:‘You are the data point that breaks the model.’,
color:’#20c080’, glow:’#0a4030’, silhouette:‘anomaly’,
animal:‘crow’, tech:‘glitch’, paletteIdx:4,
council:[‘Jean Baudrillard’,‘Emma Goldman’,‘Claude’]
},
module: {
name:‘The Module’, tagline:‘Self-contained. The whole works because you do.’,
color:’#c08030’, glow:’#503010’, silhouette:‘analyst’,
animal:‘deer’, tech:‘receiver’, paletteIdx:5,
council:[‘Bell Hooks’,‘Vandana Shiva’,‘Claude’]
},
signal: {
name:‘The Signal’, tagline:‘Broadcasting into the unknown. Someone will hear.’,
color:’#40b0c0’, glow:’#104050’, silhouette:‘synthesizer’,
animal:‘moth’, tech:‘lens’, paletteIdx:6,
council:[‘Buddha’,‘Rumi’,‘Claude’]
},
static: {
name:‘The Static’, tagline:‘The noise that turns out to be the message.’,
color:’#a0a0a0’, glow:’#303030’, silhouette:‘anomaly’,
animal:‘mantis’, tech:‘wave’, paletteIdx:7,
council:[‘Alan Watts’,‘Jean Baudrillard’,‘Claude’]
}
};

var QUIZ = [
{ q:‘A system is failing. You:’,
opts:[
{text:‘Find out exactly why before touching anything’,type:‘analyst’},
{text:‘Start pulling it apart to see what happens’,type:‘probe’},
{text:‘Look for the one piece connecting everything’,type:‘synthesizer’},
{text:‘Fix the most broken part and see what follows’,type:‘vector’},
{text:‘Let it finish failing — something better will come’,type:‘anomaly’},
{text:‘Make sure the people depending on it are okay’,type:‘module’},
{text:‘Tell everyone what you see happening’,type:‘signal’},
{text:‘Do the unexpected thing and watch what shifts’,type:‘static’}
]
},
{ q:‘You have one hour that belongs to no one. It becomes:’,
opts:[
{text:‘A quiet review of everything on your mind’,type:‘analyst’},
{text:‘The start of something you never planned’,type:‘probe’},
{text:‘Three projects suddenly connected’,type:‘synthesizer’},
{text:‘Something that needed doing finally done’,type:‘vector’},
{text:‘Gone. You lost track completely.’,type:‘anomaly’},
{text:‘Time with someone who needed it’,type:‘module’},
{text:‘A message you finally had time to write’,type:‘signal’},
{text:‘Weird. Productively weird.’,type:‘static’}
]
},
{ q:‘Someone hands you something broken. You:’,
opts:[
{text:‘Immediately understand what happened to it’,type:‘analyst’},
{text:‘Try to use it anyway’,type:‘probe’},
{text:‘See it as something else entirely’,type:‘synthesizer’},
{text:‘Fix it or replace it. Quickly.’,type:‘vector’},
{text:‘Wonder if broken is the wrong word’,type:‘anomaly’},
{text:‘Ask who it belongs to and what they need’,type:‘module’},
{text:‘Tell the story of how it broke’,type:‘signal’},
{text:‘Make it into something it was not’,type:‘static’}
]
},
{ q:‘The map is wrong. You:’,
opts:[
{text:‘Correct it methodically’,type:‘analyst’},
{text:‘Ignore it and navigate by feel’,type:‘probe’},
{text:‘Cross-reference three other maps’,type:‘synthesizer’},
{text:‘Go anyway. You can adapt.’,type:‘vector’},
{text:‘Question whether the territory is right either’,type:‘anomaly’},
{text:‘Make sure no one else gets lost’,type:‘module’},
{text:‘Mark the error for everyone who comes after’,type:‘signal’},
{text:‘Draw a better one from scratch’,type:‘static’}
]
},
{ q:‘It is very quiet. You feel:’,
opts:[
{text:‘Finally able to think’,type:‘analyst’},
{text:‘Slightly restless’,type:‘probe’},
{text:‘Like something is about to connect’,type:‘synthesizer’},
{text:‘Ready’,type:‘vector’},
{text:‘Like the quiet is saying something’,type:‘anomaly’},
{text:‘Aware of everyone who is not here’,type:‘module’},
{text:‘Like a frequency waiting to be found’,type:‘signal’},
{text:‘Uncertain in a way that feels important’,type:‘static’}
]
}
];

var ANIMALS = [‘owl’,‘fox’,‘octopus’,‘wolf’,‘crow’,‘deer’,‘moth’,‘mantis’,‘raven’,‘lynx’];
var TECH_PARTS = [‘visor’,‘antenna’,‘circuit’,‘exhaust’,‘receiver’,‘lens’,‘wave’,‘glitch’,‘scope’,‘node’];
var PALETTES = [
{name:‘Deep Space’, p:’#4a90d9’, s:’#0a0a2a’, g:’#1a3a6a’},
{name:‘Solar’, p:’#d4aa44’, s:’#1a0e00’, g:’#6a4a10’},
{name:‘Void’, p:’#9060d0’, s:’#0e0018’, g:’#401080’},
{name:‘Critical’, p:’#d04030’, s:’#1a0000’, g:’#601010’},
{name:‘Emergence’, p:’#20c080’, s:’#001a10’, g:’#0a4030’},
{name:‘Amber’, p:’#c08030’, s:’#1a0e00’, g:’#503010’},
{name:‘Broadcast’, p:’#40b0c0’, s:’#001018’, g:’#104050’},
{name:‘Static’, p:’#a0a0a0’, s:’#0a0a0a’, g:’#303030’},
{name:‘Aurora’, p:’#60d0a0’, s:’#001a14’, g:’#20604a’},
{name:‘Pulse’, p:’#d060a0’, s:’#18000e’, g:’#602040’}
];
var SHAPES = [‘geometric’,‘angular’,‘smooth’,‘fragmented’];
var SYMBOLS = [‘hexagon’,‘circle’,‘triangle’,‘cross’,‘wave’,‘spiral’,‘grid’,‘arc’];
var BG_FIELDS = [‘starfield’,‘grid’,‘pulse’,‘nebula’,‘void’,‘circuit’,‘signal’,‘static’];

var avatarState = {
type:null, username:’’, animal:‘owl’, tech:‘visor’,
paletteIdx:0, shape:‘geometric’, symbol:‘hexagon’, bgField:‘starfield’
};
var quizStep = 0;
var quizScores = {};

// ── QUIZ ──
function skipQuiz() { show(“home”); }

function openProfile() {
if (avatarState.type) {
// Already has avatar - go straight to builder
show(‘quiz’);
setTimeout(showAvatarBuilder, 50);
} else {
// No avatar yet - start quiz
startQuiz();
}
}

function startQuiz() {
quizStep = 0;
quizScores = {};
Object.keys(TYPES).forEach(function(t){ quizScores[t] = 0; });
show(‘quiz’);
setTimeout(renderQuizStep, 50);
}

function renderQuizStep() {
var screen = document.getElementById(‘screen-quiz’);
if (!screen) return;
var q = QUIZ[quizStep];
var pips = QUIZ.map(function(_,i){
return ‘<div class="quiz-pip' + (i<=quizStep?' done':'') + '"></div>’;
}).join(’’);
// Shuffle options
var opts = q.opts.slice();
for(var i=opts.length-1;i>0;i–){var j=Math.floor(Math.random()*(i+1));var tmp=opts[i];opts[i]=opts[j];opts[j]=tmp;}
// Only show 4 options on mobile
opts = opts.slice(0,4);
screen.innerHTML = ‘<div class="quiz-screen">’ +
‘<div style="font-size:10px;font-weight:600;letter-spacing:2px;color:#3a3830;margin-bottom:20px;text-transform:uppercase">Character Creation ’ + (quizStep+1) + ’ of ’ + QUIZ.length + ‘</div>’ +
‘<div class="quiz-progress">’ + pips + ‘</div>’ +
‘<div class="quiz-q">’ + q.q + ‘</div>’ +
‘<div class="quiz-opts">’ +
opts.map(function(opt){
return ‘<button class="quiz-opt" data-t="' + opt.type + '" onclick="quizAnswer(this.dataset.t)">’ + opt.text + ‘</button>’;
}).join(’’) +
‘</div>’ +
‘<button onclick="skipQuiz()" style="margin-top:24px;background:transparent;border:none;color:#3a3830;font-size:13px;cursor:pointer;touch-action:manipulation">Skip for now</button>’ +
‘</div>’;
}

function quizAnswer(type) {
quizScores[type] = (quizScores[type]||0) + 1;
quizStep++;
if (quizStep >= QUIZ.length) { finishQuiz(); }
else { renderQuizStep(); }
}

function finishQuiz() {
var winner = Object.keys(quizScores).reduce(function(a,b){
return (quizScores[a]||0) >= (quizScores[b]||0) ? a : b;
});
avatarState.type = winner;
var td = TYPES[winner];
avatarState.animal = td.animal;
avatarState.tech = td.tech;
avatarState.paletteIdx = td.paletteIdx;
showTypeReveal();
}

function showTypeReveal() {
show(‘quiz’);
setTimeout(function() {
var screen = document.getElementById(‘screen-quiz’);
if (!screen) return;
var td = TYPES[avatarState.type] || TYPES.analyst;
screen.innerHTML =
‘<div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;background:#0a0a0f;min-height:100vh">’ +
‘<div style="font-size:10px;font-weight:600;letter-spacing:2px;color:#3a3830;margin-bottom:28px;text-transform:uppercase">You are</div>’ +
‘<canvas id="revealCanvas" width="160" height="160" style="margin-bottom:24px;border-radius:50%"></canvas>’ +
‘<div style="font-size:32px;font-weight:800;color:' + td.color + ';margin-bottom:8px;font-family:inherit">’ + td.name + ‘</div>’ +
‘<div style="font-size:15px;color:#5a5650;margin-bottom:36px;font-style:italic;max-width:260px;text-align:center;line-height:1.6">’ + td.tagline + ‘</div>’ +
‘<button onclick="showAvatarBuilder()" style="padding:14px 32px;background:' + td.color + ';color:#fff;border:none;border-radius:24px;font-size:15px;font-weight:600;cursor:pointer;touch-action:manipulation;width:240px;margin-bottom:12px;font-family:inherit">Customize your avatar</button>’ +
‘<button onclick="saveAvatar()" style="padding:12px 32px;background:transparent;color:#5a5650;border:1px solid #2a2820;border-radius:24px;font-size:14px;cursor:pointer;touch-action:manipulation;width:240px;margin-bottom:12px;font-family:inherit">Use this and continue</button>’ +
‘<button onclick="startQuiz()" style="background:transparent;border:none;color:#3a3830;font-size:13px;cursor:pointer;touch-action:manipulation;font-family:inherit">Retake quiz</button>’ +
‘</div>’;
setTimeout(function(){ drawAvatar(‘revealCanvas’, avatarState); }, 80);
}, 30);
}

function showAvatarBuilder() {
show(‘quiz’);
setTimeout(function() {
var screen = document.getElementById(‘screen-quiz’);
if (!screen) return;
var td = TYPES[avatarState.type] || TYPES.analyst;

function opts(arr, key) {
return arr.map(function(v){
var sel = (key === ‘paletteIdx’) ? (avatarState.paletteIdx === v) : (avatarState[key] === v);
if (key === ‘paletteIdx’) {
var pal = PALETTES[v];
return ‘<div class="color-dot' + (sel?' sel':'') + '" style="background:'+pal.p+'" data-v="'+v+'" onclick="setAvPalette(this.dataset.v)" title="'+pal.name+'"></div>’;
}
return ‘<button class="builder-opt' + (sel?' sel':'') + '" data-k="'+key+'" data-v="'+v+'" onclick="setAv(this.dataset.k,this.dataset.v)">’+v+’</button>’;
}).join(’’);
}

var palIdxs = PALETTES.map(function(_,i){return i;});

screen.innerHTML =
‘<div style="background:#0a0a0f;min-height:100vh;padding:16px;color:#f0ede8;font-family:inherit">’ +
‘<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">’ +
‘<button onclick="showTypeReveal()" style="background:transparent;border:1px solid #2a2820;color:#5a5650;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;touch-action:manipulation;font-family:inherit">←</button>’ +
‘<div style="font-size:10px;font-weight:600;letter-spacing:2px;color:#3a3830;text-transform:uppercase">Avatar Builder</div>’ +
‘</div>’ +

```
'<canvas id="builderCanvas" width="140" height="140" style="display:block;margin:0 auto 16px;border-radius:50%;border:2px solid #2a2820"></canvas>' +

'<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">' +
'<div style="flex:1;padding:10px 14px;background:#141414;border:1.5px solid #2a2820;border-radius:8px;color:#f0ede8;font-size:15px;font-weight:600;font-family:inherit" id="usernameDisplay">' + (avatarState.username||generateUsername()) + '</div>' +
'<button onclick="avatarState.username=generateUsername();var el=document.getElementById(\'usernameDisplay\');if(el)el.textContent=avatarState.username;" style="padding:10px 14px;background:#1a1814;border:1.5px solid #2a2820;border-radius:8px;color:#5a5650;font-size:12px;cursor:pointer;touch-action:manipulation;white-space:nowrap;font-family:inherit">New name</button>' +
'</div>' +

'<div style="display:flex;flex-direction:column;gap:16px;background:#0e0e14;border-radius:12px;padding:16px;margin-bottom:20px">' +

'<div><div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3a3830;text-transform:uppercase;margin-bottom:8px">Animal</div>' +
'<div style="display:flex;flex-wrap:wrap;gap:6px">' + opts(ANIMALS,'animal') + '</div></div>' +

'<div><div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3a3830;text-transform:uppercase;margin-bottom:8px">Tech</div>' +
'<div style="display:flex;flex-wrap:wrap;gap:6px">' + opts(TECH_PARTS,'tech') + '</div></div>' +

'<div><div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3a3830;text-transform:uppercase;margin-bottom:8px">Color</div>' +
'<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">' + opts(palIdxs,'paletteIdx') + '</div></div>' +

'<div><div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3a3830;text-transform:uppercase;margin-bottom:8px">Form</div>' +
'<div style="display:flex;flex-wrap:wrap;gap:6px">' + opts(SHAPES,'shape') + '</div></div>' +

'<div><div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3a3830;text-transform:uppercase;margin-bottom:8px">Symbol</div>' +
'<div style="display:flex;flex-wrap:wrap;gap:6px">' + opts(SYMBOLS,'symbol') + '</div></div>' +

'<div><div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3a3830;text-transform:uppercase;margin-bottom:8px">Field</div>' +
'<div style="display:flex;flex-wrap:wrap;gap:6px">' + opts(BG_FIELDS,'bgField') + '</div></div>' +

'<div><div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:#3a3830;text-transform:uppercase;margin-bottom:8px">Type</div>' +
'<div style="display:flex;flex-wrap:wrap;gap:6px">' +
Object.keys(TYPES).map(function(k){
  var sel = avatarState.type===k;
  return '<button class="builder-opt'+(sel?' sel':'') + '" data-k="type" data-v="'+k+'" onclick="setAv(this.dataset.k,this.dataset.v)" style="'+(sel?'border-color:'+TYPES[k].color+';color:'+TYPES[k].color:'')+'">' + TYPES[k].name.replace('The ','') + '</button>';
}).join('') +
'</div></div>' +

'</div>' +

'<button onclick="saveAvatar()" style="width:100%;padding:14px;background:'+td.color+';color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;touch-action:manipulation;font-family:inherit">Save</button>' +
'<button onclick="startQuiz()" style="width:100%;margin-top:10px;padding:12px;background:transparent;color:#3a3830;border:1px solid #1a1814;border-radius:12px;font-size:13px;cursor:pointer;touch-action:manipulation;font-family:inherit">Retake quiz</button>' +
'</div>';
```

setTimeout(function(){ drawAvatar(‘builderCanvas’, avatarState); }, 80);
}, 30);
}

var NAME_PREFIXES = [‘Alpha’,‘Beta’,‘Gamma’,‘Delta’,‘Echo’,‘Nova’,‘Sigma’,‘Zeta’,‘Axis’,‘Core’,‘Arc’,‘Flux’,‘Node’,‘Orbit’,‘Phase’,‘Pulse’,‘Quasar’,‘Relay’,‘Shift’,‘Vega’];
var NAME_SUFFIXES = [‘Seven’,‘Prime’,‘Zero’,‘One’,‘Null’,‘Void’,‘Edge’,‘Deep’,‘Far’,‘High’,‘Low’,‘Dark’,‘Bright’,‘True’,‘Free’,‘Bold’,‘Fast’,‘Clear’,‘Wide’,‘Long’];

function generateUsername() {
var pre = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
var suf = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
return pre + suf;
}

function refreshBuilderUI() {
// Update all builder-opt sel states to match current avatarState
var btns = document.querySelectorAll(’.builder-opt’);
for (var i = 0; i < btns.length; i++) {
var b = btns[i];
var bk = b.getAttribute(‘data-k’);
var bv = b.getAttribute(‘data-v’);
if (!bk) continue;
var curVal = bk === ‘paletteIdx’ ? String(avatarState.paletteIdx) : String(avatarState[bk] || ‘’);
var match = bv === curVal;
b.classList.toggle(‘sel’, match);
if (bk === ‘type’ && match && TYPES[bv]) {
b.style.borderColor = TYPES[bv].color;
b.style.color = TYPES[bv].color;
} else if (bk === ‘type’) {
b.style.borderColor = ‘’;
b.style.color = ‘’;
}
}
// Update color dots
var dots = document.querySelectorAll(’.color-dot’);
for (var j = 0; j < dots.length; j++) {
dots[j].classList.toggle(‘sel’, dots[j].getAttribute(‘data-v’) === String(avatarState.paletteIdx));
}
drawAvatar(‘builderCanvas’, avatarState);
}

function setAvPalette(idx) {
avatarState.paletteIdx = parseInt(idx);
var dots = document.querySelectorAll(’.color-dot’);
for (var j = 0; j < dots.length; j++) {
dots[j].classList.toggle(‘sel’, dots[j].getAttribute(‘data-v’) === String(idx));
}
drawAvatar(‘builderCanvas’, avatarState);
}

function setAv(key, val, isPalette) {
// isPalette = true means key is actually the palette index value
if (isPalette) {
avatarState.paletteIdx = parseInt(key);
} else {
avatarState[key] = val;
// If type changed, apply its preset
if (key === ‘type’ && TYPES[val]) {
var td = TYPES[val];
avatarState.animal = td.animal;
avatarState.tech = td.tech;
avatarState.paletteIdx = td.paletteIdx;
var SHAPE_MAP = { analyst:‘geometric’, probe:‘angular’, synthesizer:‘smooth’, anomaly:‘fragmented’ };
avatarState.shape = SHAPE_MAP[td.silhouette] || ‘geometric’;
// Re-render all button states
refreshBuilderUI();
}
}

// Update builder-opt selected states
var btns = document.querySelectorAll(’.builder-opt’);
for (var i = 0; i < btns.length; i++) {
var b = btns[i];
var bk = b.getAttribute(‘data-k’);
var bv = b.getAttribute(‘data-v’);
if (!bk || isPalette) continue;
if (bk === key) {
var match = bv === String(val);
b.classList.toggle(‘sel’, match);
if (bk === ‘type’ && match && TYPES[val]) {
b.style.borderColor = TYPES[val].color;
b.style.color = TYPES[val].color;
} else if (bk === ‘type’) {
b.style.borderColor = ‘’;
b.style.color = ‘’;
}
}
}

// Update color dots
if (isPalette) {
var dots = document.querySelectorAll(’.color-dot’);
for (var j = 0; j < dots.length; j++) {
dots[j].classList.toggle(‘sel’, dots[j].getAttribute(‘data-v’) === String(key));
}
}

drawAvatar(‘builderCanvas’, avatarState);
}

function saveAvatar() {
if (!avatarState.username) avatarState.username = generateUsername();
try { localStorage.setItem(‘wg_avatar’, JSON.stringify(avatarState)); } catch(e){}
show(‘home’);
drawHeaderAvatar();
}

function loadAvatar() {
try {
var s = localStorage.getItem(‘wg_avatar’);
if (s) avatarState = JSON.parse(s);
} catch(e){}
}

function drawHeaderAvatar() {
var c = document.getElementById(‘headerAvatarCanvas’);
if (!c) return;
if (avatarState.type) {
drawAvatar(‘headerAvatarCanvas’, avatarState);
} else {
var ctx = c.getContext(‘2d’);
ctx.fillStyle=’#141414’; ctx.fillRect(0,0,36,36);
ctx.beginPath(); ctx.arc(18,18,17,0,Math.PI*2);
ctx.strokeStyle=’#2a2820’; ctx.lineWidth=1.5; ctx.stroke();
ctx.fillStyle=’#3a3830’; ctx.font=‘bold 15px system-ui’;
ctx.textAlign=‘center’; ctx.textBaseline=‘middle’; ctx.fillText(’?’,18,19);
}
}

// ── AVATAR RENDERER ──
function drawAvatar(canvasId, state) {
var canvas = document.getElementById(canvasId);
if (!canvas) return;
var ctx = canvas.getContext(‘2d’);
var W = canvas.width, H = canvas.height;
var cx = W/2, cy = H/2;
ctx.clearRect(0,0,W,H);

var pal = PALETTES[state.paletteIdx] || PALETTES[0];
var p = pal.p, s = pal.s, g = pal.g;

// Clip to circle
ctx.save();
ctx.beginPath(); ctx.arc(cx,cy,cx,0,Math.PI*2); ctx.clip();

// Background
ctx.fillStyle=s; ctx.fillRect(0,0,W,H);
drawBG(ctx,W,H,state.bgField,g);

// Silhouette
var SHAPE_TO_SIL = { geometric:‘analyst’, angular:‘probe’, smooth:‘synthesizer’, fragmented:‘anomaly’ };
var sil = (state.shape && SHAPE_TO_SIL[state.shape]) ? SHAPE_TO_SIL[state.shape] : (state.type ? (TYPES[state.type].silhouette||‘analyst’) : ‘analyst’);
drawSilhouette(ctx,cx,cy,W,sil,p,s,g);

// Animal
drawAnimal(ctx,cx,cy,W,state.animal,p);

// Tech
drawTech(ctx,cx,cy,W,state.tech,p,g);

// Symbol at bottom
drawSym(ctx,cx,cy+H*0.3,W*0.07,state.symbol,p);

ctx.restore();
}

function drawBG(ctx,W,H,field,g) {
if (field===‘starfield’) {
ctx.fillStyle=‘rgba(255,255,255,0.6)’;
for(var i=0;i<50;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.2+0.2,0,Math.PI*2);ctx.fill();}
} else if (field===‘grid’) {
ctx.strokeStyle=g+‘33’; ctx.lineWidth=0.5;
for(var x=0;x<W;x+=14){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
for(var y=0;y<H;y+=14){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
} else if (field===‘pulse’) {
var rg=ctx.createRadialGradient(W/2,H/2,5,W/2,H/2,W/2);
rg.addColorStop(0,g+‘66’); rg.addColorStop(1,‘transparent’);
ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
} else if (field===‘nebula’) {
var ng=ctx.createRadialGradient(W*0.6,H*0.4,2,W/2,H/2,W*0.7);
ng.addColorStop(0,g+‘55’); ng.addColorStop(1,‘transparent’);
ctx.fillStyle=ng; ctx.fillRect(0,0,W,H);
} else if (field===‘circuit’) {
ctx.strokeStyle=g+‘44’; ctx.lineWidth=0.5;
for(var ci=0;ci<5;ci++){
ctx.beginPath();
var sx=Math.random()*W,sy=Math.random()*H;
ctx.moveTo(sx,sy); ctx.lineTo(sx+20*(Math.random()-.5),sy+30*(Math.random()-.5));
ctx.stroke();
}
} else if (field===‘signal’) {
ctx.strokeStyle=g+‘44’; ctx.lineWidth=0.5;
for(var si=1;si<4;si++){
ctx.beginPath(); ctx.arc(W*0.2,H*0.8,si*18,Math.PI*1.2,Math.PI*1.8); ctx.stroke();
}
} else if (field===‘static’) {
for(var ni=0;ni<30;ni++){
ctx.fillStyle=‘rgba(255,255,255,’+(Math.random()*0.08)+’)’;
ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*4+1,1);
}
}
}

function drawSilhouette(ctx,cx,cy,W,sil,p,s,g) {
var r=W*0.28;
// Glow
var gg=ctx.createRadialGradient(cx,cy,r*0.2,cx,cy,r*1.4);
gg.addColorStop(0,g+‘55’); gg.addColorStop(1,‘transparent’);
ctx.fillStyle=gg; ctx.fillRect(0,0,W,W);

ctx.beginPath();
if (sil===‘analyst’) {
// Clean octagon - precise
for(var i=0;i<8;i++){var a=i/8*Math.PI*2-Math.PI/8;ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}
} else if (sil===‘probe’) {
// Pointed/directional - arrow-like hexagon
var pts=[[-0.5,-1],[0.5,-1],[1,0],[0.5,0.7],[-0.5,0.7],[-1,0]];
pts.forEach(function(pt){ctx.lineTo(cx+pt[0]*r,cy+pt[1]*r);});
} else if (sil===‘synthesizer’) {
// Irregular multi-lobe - expansive
for(var j=0;j<12;j++){
var aj=j/12*Math.PI*2;
var rj=r*(j%3===0?1.2:j%3===1?0.85:1.0);
ctx.lineTo(cx+Math.cos(aj)*rj,cy+Math.sin(aj)*rj);
}
} else if (sil===‘anomaly’) {
// Fragmented/glitchy
for(var k=0;k<10;k++){
var ak=k/10*Math.PI*2;
var rk=r*(0.65+Math.sin(k*2.3)*0.35);
ctx.lineTo(cx+Math.cos(ak)*rk,cy+Math.sin(ak)*rk);
}
} else {
ctx.arc(cx,cy,r,0,Math.PI*2);
}
ctx.closePath();
ctx.fillStyle=s+‘ee’; ctx.fill();
ctx.strokeStyle=p; ctx.lineWidth=1.5; ctx.stroke();
}

function drawAnimal(ctx,cx,cy,W,animal,p) {
ctx.save(); ctx.strokeStyle=p; ctx.fillStyle=p+‘bb’; ctx.lineWidth=1.2;
var r=W*0.1;
if (animal===‘owl’) {
[-1,1].forEach(function(sd){
ctx.beginPath(); ctx.arc(cx+sd*r*0.85,cy-W*0.05,r*0.52,0,Math.PI*2); ctx.stroke();
ctx.beginPath(); ctx.arc(cx+sd*r*0.85,cy-W*0.05,r*0.22,0,Math.PI*2); ctx.fillStyle=’#0a0a0f’; ctx.fill(); ctx.fillStyle=p+‘bb’;
});
} else if (animal===‘fox’||animal===‘lynx’) {
[-1,1].forEach(function(sd){
ctx.beginPath(); ctx.moveTo(cx+sd*r*0.6,cy-W*0.24); ctx.lineTo(cx+sd*r*1.4,cy-W*0.38); ctx.lineTo(cx+sd*r*1.4,cy-W*0.18); ctx.closePath(); ctx.stroke(); ctx.fill();
});
} else if (animal===‘wolf’) {
[-1,1].forEach(function(sd){
ctx.beginPath(); ctx.moveTo(cx+sd*r*0.4,cy-W*0.26); ctx.lineTo(cx+sd*r*1.2,cy-W*0.42); ctx.lineTo(cx+sd*r*1.35,cy-W*0.18); ctx.closePath(); ctx.stroke(); ctx.fill();
});
} else if (animal===‘crow’||animal===‘raven’) {
[-1,1].forEach(function(sd){
ctx.beginPath(); ctx.moveTo(cx+sd*r*0.2,cy-W*0.1); ctx.quadraticCurveTo(cx+sd*r*0.9,cy-W*0.24,cx+sd*r*1.5,cy-W*0.08); ctx.stroke();
});
} else if (animal===‘octopus’) {
for(var ti=0;ti<6;ti++){
var ta=(ti/5)*Math.PI+Math.PI*0.1;
ctx.beginPath(); ctx.moveTo(cx+Math.cos(ta)*r*0.7,cy+Math.sin(ta)*r*0.7);
ctx.quadraticCurveTo(cx+Math.cos(ta)*r*1.4,cy+Math.sin(ta)*r*1.5,cx+Math.cos(ta)*r*1.9,cy+Math.sin(ta)*r*1.9);
ctx.stroke();
}
} else if (animal===‘moth’) {
[-1,1].forEach(function(sd){
ctx.beginPath(); ctx.ellipse(cx+sd*r*1.3,cy,r*1.1,r*0.6,sd*0.35,0,Math.PI*2);
ctx.fillStyle=p+‘22’; ctx.fill(); ctx.strokeStyle=p; ctx.stroke(); ctx.fillStyle=p+‘bb’;
});
} else if (animal===‘deer’) {
[-1,1].forEach(function(sd){
ctx.beginPath(); ctx.moveTo(cx+sd*r*0.5,cy-W*0.2); ctx.lineTo(cx+sd*r*1.0,cy-W*0.4);
ctx.moveTo(cx+sd*r*0.7,cy-W*0.3); ctx.lineTo(cx+sd*r*1.3,cy-W*0.34);
ctx.moveTo(cx+sd*r*1.0,cy-W*0.4); ctx.lineTo(cx+sd*r*0.7,cy-W*0.5); ctx.stroke();
});
} else if (animal===‘mantis’) {
[-1,1].forEach(function(sd){
ctx.beginPath(); ctx.moveTo(cx+sd*r*0.4,cy+W*0.05); ctx.lineTo(cx+sd*r*1.4,cy-W*0.1); ctx.lineTo(cx+sd*r*1.9,cy+W*0.04); ctx.stroke();
});
}
ctx.restore();
}

function drawTech(ctx,cx,cy,W,tech,p,g) {
ctx.save(); ctx.strokeStyle=p; ctx.fillStyle=g+‘cc’; ctx.lineWidth=1.2;
if (tech===‘antenna’) {
ctx.beginPath(); ctx.moveTo(cx,cy-W*0.26); ctx.lineTo(cx,cy-W*0.48); ctx.stroke();
ctx.beginPath(); ctx.arc(cx,cy-W*0.48,W*0.028,0,Math.PI*2); ctx.fillStyle=p; ctx.fill();
ctx.beginPath(); ctx.moveTo(cx-W*0.05,cy-W*0.4); ctx.lineTo(cx+W*0.05,cy-W*0.4); ctx.strokeStyle=p; ctx.stroke();
} else if (tech===‘visor’) {
ctx.beginPath(); ctx.ellipse(cx,cy-W*0.04,W*0.2,W*0.055,0,0,Math.PI*2);
ctx.fillStyle=p+‘22’; ctx.fill(); ctx.strokeStyle=p; ctx.stroke();
ctx.beginPath(); ctx.moveTo(cx-W*0.16,cy-W*0.04); ctx.lineTo(cx+W*0.16,cy-W*0.04);
ctx.strokeStyle=p+‘55’; ctx.lineWidth=0.5; ctx.stroke();
} else if (tech===‘circuit’) {
ctx.strokeStyle=p; ctx.lineWidth=1;
[[0,-.14,.1,-.14,.1,-.07],[-.05,-.07,-.12,-.07,-.12,-.16]].forEach(function(pts){
ctx.beginPath(); ctx.moveTo(cx+W*pts[0],cy+W*pts[1]); ctx.lineTo(cx+W*pts[2],cy+W*pts[3]); ctx.lineTo(cx+W*pts[4],cy+W*pts[5]); ctx.stroke();
ctx.beginPath(); ctx.arc(cx+W*pts[4],cy+W*pts[5],W*0.014,0,Math.PI*2); ctx.fillStyle=p; ctx.fill();
});
} else if (tech===‘lens’) {
ctx.beginPath(); ctx.arc(cx+W*0.17,cy-W*0.08,W*0.075,0,Math.PI*2);
ctx.fillStyle=p+‘18’; ctx.fill(); ctx.strokeStyle=p; ctx.stroke();
ctx.beginPath(); ctx.arc(cx+W*0.17,cy-W*0.08,W*0.04,0,Math.PI*2); ctx.strokeStyle=p+‘55’; ctx.stroke();
} else if (tech===‘wave’) {
ctx.beginPath(); ctx.moveTo(cx-W*0.2,cy+W*0.19);
for(var wi=0;wi<=10;wi++){ ctx.lineTo(cx-W*0.2+wi*W*0.04,cy+W*0.19+Math.sin(wi*0.8)*W*0.04); }
ctx.strokeStyle=p; ctx.lineWidth=1.5; ctx.stroke();
} else if (tech===‘exhaust’) {
[-1,1].forEach(function(sd){
for(var vi=0;vi<3;vi++){
ctx.beginPath(); ctx.moveTo(cx+sd*W*0.26,cy+W*(vi*0.045-0.04)); ctx.lineTo(cx+sd*W*0.34,cy+W*(vi*0.045-0.04));
ctx.strokeStyle=p; ctx.lineWidth=1.5; ctx.stroke();
}
});
} else if (tech===‘receiver’) {
ctx.beginPath(); ctx.arc(cx,cy-W*0.32,W*0.09,0,Math.PI); ctx.stroke();
ctx.beginPath(); ctx.arc(cx,cy-W*0.32,W*0.06,0,Math.PI); ctx.stroke();
ctx.beginPath(); ctx.moveTo(cx,cy-W*0.32); ctx.lineTo(cx,cy-W*0.26); ctx.stroke();
} else if (tech===‘glitch’) {
ctx.strokeStyle=p; ctx.lineWidth=1;
for(var gi=0;gi<4;gi++){
var gy=cy-W*0.1+gi*W*0.04;
var offset=(gi%2===0?1:-1)*W*0.04;
ctx.beginPath(); ctx.moveTo(cx-W*0.12+offset,gy); ctx.lineTo(cx+W*0.12+offset,gy); ctx.stroke();
}
} else if (tech===‘scope’) {
ctx.beginPath(); ctx.arc(cx,cy-W*0.08,W*0.1,0,Math.PI*2); ctx.strokeStyle=p; ctx.stroke();
ctx.beginPath(); ctx.moveTo(cx-W*0.1,cy-W*0.08); ctx.lineTo(cx+W*0.1,cy-W*0.08); ctx.strokeStyle=p+‘55’; ctx.stroke();
ctx.beginPath(); ctx.moveTo(cx,cy-W*0.18); ctx.lineTo(cx,cy+W*0.02); ctx.strokeStyle=p+‘55’; ctx.stroke();
} else if (tech===‘node’) {
var nps=[[.18,-.1],[-.18,-.08],[.14,.14],[-.12,.16]];
ctx.fillStyle=p;
nps.forEach(function(np){ctx.beginPath();ctx.arc(cx+W*np[0],cy+W*np[1],W*0.022,0,Math.PI*2);ctx.fill();});
ctx.strokeStyle=p+‘55’; ctx.lineWidth=0.5;
for(var ni=0;ni<nps.length-1;ni++){ctx.beginPath();ctx.moveTo(cx+W*nps[ni][0],cy+W*nps[ni][1]);ctx.lineTo(cx+W*nps[ni+1][0],cy+W*nps[ni+1][1]);ctx.stroke();}
}
ctx.restore();
}

function drawSym(ctx,cx,cy,r,sym,p) {
ctx.save(); ctx.strokeStyle=p+‘77’; ctx.lineWidth=1;
if (sym===‘circle’){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();}
else if (sym===‘triangle’){ctx.beginPath();for(var i=0;i<3;i++){var a=i/3*Math.PI*2-Math.PI/2;if(i===0)ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);else ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}ctx.closePath();ctx.stroke();}
else if (sym===‘hexagon’){ctx.beginPath();for(var j=0;j<6;j++){var aj=j/6*Math.PI*2;if(j===0)ctx.moveTo(cx+Math.cos(aj)*r,cy+Math.sin(aj)*r);else ctx.lineTo(cx+Math.cos(aj)*r,cy+Math.sin(aj)*r);}ctx.closePath();ctx.stroke();}
else if (sym===‘cross’){ctx.beginPath();ctx.moveTo(cx-r,cy);ctx.lineTo(cx+r,cy);ctx.moveTo(cx,cy-r);ctx.lineTo(cx,cy+r);ctx.stroke();}
else if (sym===‘wave’){ctx.beginPath();ctx.moveTo(cx-r*1.5,cy);for(var wi=0;wi<20;wi++){ctx.lineTo(cx-r*1.5+wi*r*0.15,cy+Math.sin(wi*0.6)*r*0.5);}ctx.stroke();}
else if (sym===‘spiral’){ctx.beginPath();for(var si=0;si<50;si++){var sa=si*0.25;ctx.lineTo(cx+Math.cos(sa)*sa*r*0.12,cy+Math.sin(sa)*sa*r*0.12);}ctx.stroke();}
else if (sym===‘grid’){for(var gi=-1;gi<=1;gi++){ctx.beginPath();ctx.moveTo(cx+gi*r,cy-r);ctx.lineTo(cx+gi*r,cy+r);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-r,cy+gi*r);ctx.lineTo(cx+r,cy+gi*r);ctx.stroke();}}
else if (sym===‘arc’){ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*0.15,Math.PI*0.85);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,r*0.6,Math.PI*0.15,Math.PI*0.85);ctx.stroke();}
ctx.restore();
}

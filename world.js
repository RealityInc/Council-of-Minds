// ── WORLD GAME ──
function getSlider(id, def) {
var el = document.getElementById(id);
return el ? parseInt(el.value) || def : def;
}
var BASE_METRICS = null;

var INTERDEP_RULES = [
{ fn: function(s){ return s.land > 40 && s.food < 70; },
msg: ‘<strong>Tension:</strong> Expanding protected land may constrain food production unless efficiency gains or redistribution compensates.’ },
{ fn: function(s){ return s.ren > 70 && s.kl < 20; },
msg: ‘<strong>Implementation gap:</strong> High renewable targets need major public investment. Without redirecting military spend, debt may destabilize.’ },
{ fn: function(s){ return s.wealth > 60 && s.kl < 15; },
msg: ‘<strong>Historical pattern:</strong> Rapid wealth redistribution without governance investment correlates with short-term instability (Quigley).’ },
{ fn: function(s){ return s.food > 90 && s.wealth < 20; },
msg: ‘<strong>Access problem:</strong> Food production can increase while hunger persists if wealth inequality stays high. Hunger is about access, not supply.’ }
];

function getSliders() {
return {
ren:   getSlider(‘sl-ren’,   34),
food:  getSlider(‘sl-food’,  72),
kl:    getSlider(‘sl-kl’,    8),
land:  getSlider(‘sl-land’,  17),
water: getSlider(‘sl-water’, 74),
wealth:getSlider(‘sl-wealth’,12)
};
}

function computeMetrics(s) {
var foodEff = s.food * (0.5 + 0.5 * Math.min(1, s.wealth / 50));
var renStab = s.ren > 60 ? -((s.ren - 60) * 0.15) : 0;
var wShock  = s.wealth > 50 ? -((s.wealth - 50) * 0.1) : 0;
var fl = Math.min(99, Math.max(1, Math.round(
foodEff*0.24 + s.water*0.20 + s.wealth*0.20 + s.kl*0.18 + s.ren*0.10 + s.land*0.05 + wShock
)));
var ec = Math.min(99, Math.max(1, Math.round(
s.ren*0.38 + s.land*0.34 + s.kl*0.14 + (s.food < 80 ? 8 : 4) + (s.ren > 80 ? 4 : 0)
)));
var st = Math.min(99, Math.max(1, Math.round(
s.food*0.24 + s.kl*0.22 + s.wealth*0.18 + s.ren*0.14 + s.water*0.14 + renStab + wShock*0.5
)));
return { fl:fl, ec:ec, st:st };
}

function showDelta(id, d) {
var el = document.getElementById(id);
if (!el) return;
if (d === 0) { el.textContent = ‘’; return; }
el.textContent = (d > 0 ? ‘+’ : ‘’) + d;
el.style.color = d > 0 ? ‘#2a9060’ : ‘#c04020’;
}

function checkInterdeps() {
var el = document.getElementById(‘interdepAlert’);
if (!el) return;
var s = getSliders();
var hit = null;
for (var i = 0; i < INTERDEP_RULES.length; i++) {
if (INTERDEP_RULES[i].fn(s)) { hit = INTERDEP_RULES[i]; break; }
}
if (hit) { el.innerHTML = hit.msg; el.style.display = ‘block’; }
else el.style.display = ‘none’;
}

function recalc() {
var s = getSliders();
var m = computeMetrics(s);

document.getElementById(‘metFl’).textContent = m.fl;
document.getElementById(‘metEc’).textContent = m.ec;
document.getElementById(‘metSt’).textContent = m.st;
document.getElementById(‘fillFl’).style.width = m.fl + ‘%’;
document.getElementById(‘fillEc’).style.width = m.ec + ‘%’;
document.getElementById(‘fillSt’).style.width = m.st + ‘%’;

// Sync to home screen
var hFl = document.getElementById(‘homeFl’);
var hEc = document.getElementById(‘homeEc’);
var hSt = document.getElementById(‘homeSt’);
if (hFl) hFl.textContent = m.fl;
if (hEc) hEc.textContent = m.ec;
if (hSt) hSt.textContent = m.st;

if (BASE_METRICS) {
showDelta(‘deltaFl’, m.fl - BASE_METRICS.fl);
showDelta(‘deltaEc’, m.ec - BASE_METRICS.ec);
showDelta(‘deltaSt’, m.st - BASE_METRICS.st);
}

checkInterdeps();
}

function askCouncil() {
var ren = getSlider(‘sl-ren’, 32);
var food = getSlider(‘sl-food’, 61);
var fl = document.getElementById(‘metFl’).textContent;
var ec = document.getElementById(‘metEc’).textContent;
problem = ’World Game scenario: renewable energy ’ + ren + ’%, food distribution ’ + food + ’%, flourishing ’ + fl + ’/100, ecological ’ + ec + ‘/100. What are the philosophical and ethical implications?’;
document.getElementById(‘forumInput’).value = problem;
show(‘forum’);
setTimeout(startDebate, 100);
}

function makeArt() {
var ren = getSlider(‘sl-ren’, 32);
var food = getSlider(‘sl-food’, 61);
var theme = ’the current state of the world: renewable energy at ’ + ren + ’%, food distribution at ’ + food + ‘%’;
document.getElementById(‘createTheme’).value = theme;
show(‘create’);
}

// ── GALLERY ──
var galleryItems = [
{id:1,type:‘creative’,title:‘On the Weight of Water’,content:‘The river does not ask permission to find its way to sea. A collective poem on resource equity.’,date:‘Apr 2026’,appreciations:12},
{id:2,type:‘insight’,title:“Fuller’s Ephemeralization in the Age of AI”,content:‘We built a working World Game in under an hour. The question is no longer whether we can do more with less. The question is whether we will.’,date:‘Apr 2026’,appreciations:8},
{id:3,type:‘debate’,title:‘Should AI replace human decision-making in resource allocation?’,content:‘Jung noted the shadow of optimization: efficiency without wisdom produces systems that are perfectly wrong.’,date:‘Apr 2026’,appreciations:15}
];
var galleryFilter = ‘all’;

function filterGallery(type, btn) {
galleryFilter = type;
var btns = document.getElementById(‘galleryFilters’).getElementsByTagName(‘button’);
for (var i = 0; i < btns.length; i++) {
btns[i].style.borderColor = ‘’;
btns[i].style.color = ‘’;
}
if (btn) { btn.style.borderColor = ‘#b8922a’; btn.style.color = ‘#b8922a’; }
renderGallery();
}

function renderGallery() {
var grid = document.getElementById(‘galleryGrid’);
var empty = document.getElementById(‘galleryEmpty’);
if (!grid) return;
var items = galleryFilter === ‘all’ ? galleryItems : galleryItems.filter(function(i) { return i.type === galleryFilter; });
if (items.length === 0) { grid.innerHTML = ‘’; empty.style.display = ‘block’; return; }
empty.style.display = ‘none’;
var html = ‘’;
for (var i = 0; i < items.length; i++) {
var item = items[i];
var typeColor = {creative:’#7060c0’,debate:’#b8922a’,insight:’#c04020’,scenario:’#1a6b4a’}[item.type] || ‘#8a8580’;
html += ‘<div style="background:#fff;border:1px solid #e8e4dc;border-radius:12px;overflow:hidden">’;
html += ‘<div style="padding:10px 14px;border-bottom:1px solid #e8e4dc;display:flex;justify-content:space-between;align-items:center">’;
html += ‘<span style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:'+typeColor+'">’+item.type+’</span>’;
html += ‘<span style="font-size:11px;color:#b8b4ae">’+item.date+’</span></div>’;
html += ‘<div style="padding:14px"><div style="font-size:15px;font-weight:600;color:#1a1814;margin-bottom:6px">’+item.title+’</div>’;
html += ‘<div style="font-size:13px;color:#8a8580;line-height:1.5">’+item.content+’</div></div>’;
html += ‘<div style="padding:8px 14px;border-top:1px solid #e8e4dc;display:flex;justify-content:space-between;align-items:center">’;
html += ‘<span style="font-size:11px;color:#b8b4ae">’+( item.appreciations || 0)+’ appreciations</span>’;
html += ‘<button class="btn btn-outline" style="font-size:11px;padding:4px 12px" onclick="appreciateItem('+item.id+')">Appreciate</button>’;
html += ‘</div></div>’;
}
grid.innerHTML = html;
}

function appreciateItem(id) {
for (var i = 0; i < galleryItems.length; i++) {
if (galleryItems[i].id === id) { galleryItems[i].appreciations = (galleryItems[i].appreciations || 0) + 1; break; }
}
renderGallery();
}

function shareToGallery(type, title, content) {
var id = Date.now();
galleryItems.unshift({id:id, type:type, title:title, content:content.substring(0,200), date:new Date().toLocaleDateString(), appreciations:0});
show(‘gallery’);
}

// ── SHARE HELPERS ──
var lastSynthText = ‘’;
var lastCreateTheme = ‘’;
var lastCreateText = ‘’;

function shareForumToGallery() {
shareToGallery(‘debate’, problem.substring(0, 60), lastSynthText.substring(0, 300));
}

function shareCreateToGallery() {
shareToGallery(‘creative’, lastCreateTheme.substring(0, 60), lastCreateText.substring(0, 300));
}

// ── WORLD MAP (LEAFLET) ──
var leafletMap = null;
var countryLayer = null;
var subLayer = null;
var selectedPlace = { name:‘Global’, code:null, iso3:null, type:‘world’ };
var wbCache = {};
var subCache = {};
var geoCache = {};

// ISO2 to ISO3 (for geoBoundaries API which needs ISO3)
var ISO2_TO_ISO3 = {
‘AF’:‘AFG’,‘AL’:‘ALB’,‘DZ’:‘DZA’,‘AD’:‘AND’,‘AO’:‘AGO’,‘AG’:‘ATG’,‘AR’:‘ARG’,
‘AM’:‘ARM’,‘AU’:‘AUS’,‘AT’:‘AUT’,‘AZ’:‘AZE’,‘BS’:‘BHS’,‘BH’:‘BHR’,‘BD’:‘BGD’,
‘BB’:‘BRB’,‘BY’:‘BLR’,‘BE’:‘BEL’,‘BZ’:‘BLZ’,‘BJ’:‘BEN’,‘BT’:‘BTN’,‘BO’:‘BOL’,
‘BA’:‘BIH’,‘BW’:‘BWA’,‘BR’:‘BRA’,‘BN’:‘BRN’,‘BG’:‘BGR’,‘BF’:‘BFA’,‘BI’:‘BDI’,
‘CV’:‘CPV’,‘KH’:‘KHM’,‘CM’:‘CMR’,‘CA’:‘CAN’,‘CF’:‘CAF’,‘TD’:‘TCD’,‘CL’:‘CHL’,
‘CN’:‘CHN’,‘CO’:‘COL’,‘KM’:‘COM’,‘CG’:‘COG’,‘CD’:‘COD’,‘CR’:‘CRI’,‘CI’:‘CIV’,
‘HR’:‘HRV’,‘CU’:‘CUB’,‘CY’:‘CYP’,‘CZ’:‘CZE’,‘DK’:‘DNK’,‘DJ’:‘DJI’,‘DM’:‘DMA’,
‘DO’:‘DOM’,‘EC’:‘ECU’,‘EG’:‘EGY’,‘SV’:‘SLV’,‘GQ’:‘GNQ’,‘ER’:‘ERI’,‘EE’:‘EST’,
‘SZ’:‘SWZ’,‘ET’:‘ETH’,‘FJ’:‘FJI’,‘FI’:‘FIN’,‘FR’:‘FRA’,‘GA’:‘GAB’,‘GM’:‘GMB’,
‘GE’:‘GEO’,‘DE’:‘DEU’,‘GH’:‘GHA’,‘GR’:‘GRC’,‘GD’:‘GRD’,‘GT’:‘GTM’,‘GN’:‘GIN’,
‘GW’:‘GNB’,‘GY’:‘GUY’,‘HT’:‘HTI’,‘HN’:‘HND’,‘HU’:‘HUN’,‘IS’:‘ISL’,‘IN’:‘IND’,
‘ID’:‘IDN’,‘IR’:‘IRN’,‘IQ’:‘IRQ’,‘IE’:‘IRL’,‘IL’:‘ISR’,‘IT’:‘ITA’,‘JM’:‘JAM’,
‘JP’:‘JPN’,‘JO’:‘JOR’,‘KZ’:‘KAZ’,‘KE’:‘KEN’,‘KI’:‘KIR’,‘KP’:‘PRK’,‘KR’:‘KOR’,
‘KW’:‘KWT’,‘KG’:‘KGZ’,‘LA’:‘LAO’,‘LV’:‘LVA’,‘LB’:‘LBN’,‘LS’:‘LSO’,‘LR’:‘LBR’,
‘LY’:‘LBY’,‘LI’:‘LIE’,‘LT’:‘LTU’,‘LU’:‘LUX’,‘MG’:‘MDG’,‘MW’:‘MWI’,‘MY’:‘MYS’,
‘MV’:‘MDV’,‘ML’:‘MLI’,‘MT’:‘MLT’,‘MH’:‘MHL’,‘MR’:‘MRT’,‘MU’:‘MUS’,‘MX’:‘MEX’,
‘FM’:‘FSM’,‘MD’:‘MDA’,‘MC’:‘MCO’,‘MN’:‘MNG’,‘ME’:‘MNE’,‘MA’:‘MAR’,‘MZ’:‘MOZ’,
‘MM’:‘MMR’,‘NA’:‘NAM’,‘NR’:‘NRU’,‘NP’:‘NPL’,‘NL’:‘NLD’,‘NZ’:‘NZL’,‘NI’:‘NIC’,
‘NE’:‘NER’,‘NG’:‘NGA’,‘NO’:‘NOR’,‘OM’:‘OMN’,‘PK’:‘PAK’,‘PW’:‘PLW’,‘PA’:‘PAN’,
‘PG’:‘PNG’,‘PY’:‘PRY’,‘PE’:‘PER’,‘PH’:‘PHL’,‘PL’:‘POL’,‘PT’:‘PRT’,‘QA’:‘QAT’,
‘RO’:‘ROU’,‘RU’:‘RUS’,‘RW’:‘RWA’,‘KN’:‘KNA’,‘LC’:‘LCA’,‘VC’:‘VCT’,‘WS’:‘WSM’,
‘SM’:‘SMR’,‘ST’:‘STP’,‘SA’:‘SAU’,‘SN’:‘SEN’,‘RS’:‘SRB’,‘SC’:‘SYC’,‘SL’:‘SLE’,
‘SG’:‘SGP’,‘SK’:‘SVK’,‘SI’:‘SVN’,‘SB’:‘SLB’,‘SO’:‘SOM’,‘ZA’:‘ZAF’,‘SS’:‘SSD’,
‘ES’:‘ESP’,‘LK’:‘LKA’,‘SD’:‘SDN’,‘SR’:‘SUR’,‘SE’:‘SWE’,‘CH’:‘CHE’,‘SY’:‘SYR’,
‘TW’:‘TWN’,‘TJ’:‘TJK’,‘TZ’:‘TZA’,‘TH’:‘THA’,‘TL’:‘TLS’,‘TG’:‘TGO’,‘TO’:‘TON’,
‘TT’:‘TTO’,‘TN’:‘TUN’,‘TR’:‘TUR’,‘TM’:‘TKM’,‘TV’:‘TUV’,‘UG’:‘UGA’,‘UA’:‘UKR’,
‘AE’:‘ARE’,‘GB’:‘GBR’,‘US’:‘USA’,‘UY’:‘URY’,‘UZ’:‘UZB’,‘VU’:‘VUT’,‘VE’:‘VEN’,
‘VN’:‘VNM’,‘YE’:‘YEM’,‘ZM’:‘ZMB’,‘ZW’:‘ZWE’
};

var ISO3_TO_ISO2 = {};
for (var k in ISO2_TO_ISO3) { ISO3_TO_ISO2[ISO2_TO_ISO3[k]] = k; }

var NAME_TO_ISO2 = {
‘UNITED STATES OF AMERICA’:‘US’,‘UNITED STATES’:‘US’,‘USA’:‘US’,
‘UNITED KINGDOM’:‘GB’,‘UK’:‘GB’,‘SOUTH KOREA’:‘KR’,‘NORTH KOREA’:‘KP’,
‘RUSSIA’:‘RU’,‘RUSSIAN FEDERATION’:‘RU’,‘IRAN’:‘IR’,‘TAIWAN’:‘TW’,
‘CZECHIA’:‘CZ’,‘CZECH REPUBLIC’:‘CZ’,‘IVORY COAST’:‘CI’,
‘DEMOCRATIC REPUBLIC OF THE CONGO’:‘CD’,‘DR CONGO’:‘CD’,‘CONGO, DEM. REP.’:‘CD’,
‘REPUBLIC OF CONGO’:‘CG’,‘TANZANIA’:‘TZ’,‘UNITED REPUBLIC OF TANZANIA’:‘TZ’,
‘SOUTH AFRICA’:‘ZA’,‘VIETNAM’:‘VN’,‘VIET NAM’:‘VN’,‘MYANMAR’:‘MM’,‘BURMA’:‘MM’,
‘EGYPT’:‘EG’,‘ETHIOPIA’:‘ET’,‘KENYA’:‘KE’,‘NIGERIA’:‘NG’,‘GHANA’:‘GH’,
‘SOUTH SUDAN’:‘SS’,‘SUDAN’:‘SD’,‘ANGOLA’:‘AO’,‘MOZAMBIQUE’:‘MZ’,‘ZAMBIA’:‘ZM’,
‘ZIMBABWE’:‘ZW’,‘MADAGASCAR’:‘MG’,‘CAMEROON’:‘CM’,‘SENEGAL’:‘SN’,‘MALI’:‘ML’,
‘ALGERIA’:‘DZ’,‘MOROCCO’:‘MA’,‘TUNISIA’:‘TN’,‘LIBYA’:‘LY’,
‘SAUDI ARABIA’:‘SA’,‘IRAQ’:‘IQ’,‘YEMEN’:‘YE’,‘JORDAN’:‘JO’,‘LEBANON’:‘LB’,
‘ISRAEL’:‘IL’,‘UNITED ARAB EMIRATES’:‘AE’,‘KUWAIT’:‘KW’,‘QATAR’:‘QA’,‘OMAN’:‘OM’,
‘AFGHANISTAN’:‘AF’,‘PAKISTAN’:‘PK’,‘BANGLADESH’:‘BD’,‘SRI LANKA’:‘LK’,‘NEPAL’:‘NP’,
‘THAILAND’:‘TH’,‘MALAYSIA’:‘MY’,‘INDONESIA’:‘ID’,‘PHILIPPINES’:‘PH’,
‘SINGAPORE’:‘SG’,‘CAMBODIA’:‘KH’,‘BRAZIL’:‘BR’,‘ARGENTINA’:‘AR’,‘CHILE’:‘CL’,
‘COLOMBIA’:‘CO’,‘PERU’:‘PE’,‘ECUADOR’:‘EC’,‘PARAGUAY’:‘PY’,‘URUGUAY’:‘UY’,
‘MEXICO’:‘MX’,‘CUBA’:‘CU’,‘GUATEMALA’:‘GT’,‘GERMANY’:‘DE’,‘FRANCE’:‘FR’,
‘ITALY’:‘IT’,‘SPAIN’:‘ES’,‘PORTUGAL’:‘PT’,‘NETHERLANDS’:‘NL’,‘BELGIUM’:‘BE’,
‘SWITZERLAND’:‘CH’,‘AUSTRIA’:‘AT’,‘SWEDEN’:‘SE’,‘NORWAY’:‘NO’,‘DENMARK’:‘DK’,
‘FINLAND’:‘FI’,‘POLAND’:‘PL’,‘HUNGARY’:‘HU’,‘ROMANIA’:‘RO’,‘BULGARIA’:‘BG’,
‘GREECE’:‘GR’,‘CROATIA’:‘HR’,‘UKRAINE’:‘UA’,‘TURKEY’:‘TR’,‘TURKIYE’:‘TR’,
‘CANADA’:‘CA’,‘AUSTRALIA’:‘AU’,‘NEW ZEALAND’:‘NZ’,‘JAPAN’:‘JP’,‘CHINA’:‘CN’,
‘INDIA’:‘IN’,‘KAZAKHSTAN’:‘KZ’,‘UZBEKISTAN’:‘UZ’,‘VENEZUELA’:‘VE’,‘BOLIVIA’:‘BO’
};

function getISO2(props) {
var code = props.ISO_A2 || props.iso_a2 || props.ISO2 || props.iso2 || ‘’;
if (code && code !== ‘-99’ && code !== ‘-1’ && code.length === 2) return code.toUpperCase();
var code3 = props.ISO_A3 || props.iso_a3 || props.adm0_a3 || props.ISO3 || ‘’;
if (code3 && ISO3_TO_ISO2[code3.toUpperCase()]) return ISO3_TO_ISO2[code3.toUpperCase()];
var names = [props.ADMIN||’’,props.admin||’’,props.name||’’,props.NAME||’’,props.NAME_LONG||’’];
for (var i = 0; i < names.length; i++) {
var n = names[i].toUpperCase().trim();
if (n && NAME_TO_ISO2[n]) return NAME_TO_ISO2[n];
}
return ‘’;
}

// US state FIPS
var US_STATE_FIPS = {
‘Alabama’:‘01’,‘Alaska’:‘02’,‘Arizona’:‘04’,‘Arkansas’:‘05’,‘California’:‘06’,
‘Colorado’:‘08’,‘Connecticut’:‘09’,‘Delaware’:‘10’,‘Florida’:‘12’,‘Georgia’:‘13’,
‘Hawaii’:‘15’,‘Idaho’:‘16’,‘Illinois’:‘17’,‘Indiana’:‘18’,‘Iowa’:‘19’,
‘Kansas’:‘20’,‘Kentucky’:‘21’,‘Louisiana’:‘22’,‘Maine’:‘23’,‘Maryland’:‘24’,
‘Massachusetts’:‘25’,‘Michigan’:‘26’,‘Minnesota’:‘27’,‘Mississippi’:‘28’,‘Missouri’:‘29’,
‘Montana’:‘30’,‘Nebraska’:‘31’,‘Nevada’:‘32’,‘New Hampshire’:‘33’,‘New Jersey’:‘34’,
‘New Mexico’:‘35’,‘New York’:‘36’,‘North Carolina’:‘37’,‘North Dakota’:‘38’,‘Ohio’:‘39’,
‘Oklahoma’:‘40’,‘Oregon’:‘41’,‘Pennsylvania’:‘42’,‘Rhode Island’:‘44’,‘South Carolina’:‘45’,
‘South Dakota’:‘46’,‘Tennessee’:‘47’,‘Texas’:‘48’,‘Utah’:‘49’,‘Vermont’:‘50’,
‘Virginia’:‘51’,‘Washington’:‘53’,‘West Virginia’:‘54’,‘Wisconsin’:‘55’,‘Wyoming’:‘56’,
‘District of Columbia’:‘11’,‘Puerto Rico’:‘72’
};

function initWorldMap() {
if (typeof L === ‘undefined’) { setTimeout(initWorldMap, 500); return; }
if (leafletMap) { leafletMap.remove(); leafletMap = null; countryLayer = null; subLayer = null; }

leafletMap = L.map(‘leafletMap’, {
center:[20,0], zoom:2, minZoom:2, maxZoom:14, zoomControl:true
});

L.tileLayer(‘https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png’, {
attribution:‘OpenStreetMap, CartoDB’, subdomains:‘abcd’, maxZoom:19
}).addTo(leafletMap);

loadCountryLayer();

// When zooming in past threshold on a selected country, load sub-national
leafletMap.on(‘zoomend’, function() {
var z = leafletMap.getZoom();
if (z >= 3 && selectedPlace.code && selectedPlace.type === ‘country’) {
if (selectedPlace.code === ‘US’) {
loadUSStateLayer();
} else if (selectedPlace.iso3) {
loadSubLayer(selectedPlace.code, selectedPlace.iso3, selectedPlace.name);
}
}
});

leafletMap.on(‘click’, function(e) {
var z = leafletMap.getZoom();
if (z >= 4 && selectedPlace.code) {
reverseGeocode(e.latlng.lat, e.latlng.lng);
}
});
}

function loadCountryLayer() {
setMapStatus(‘Loading map…’);
fetch(‘https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson’)
.then(function(r) { return r.json(); })
.then(function(data) {
countryLayer = L.geoJSON(data, {
style: function() {
return { fillColor:’#2a9060’, fillOpacity:0.08, color:’#2a9060’, weight:0.8, opacity:0.4 };
},
onEachFeature: function(feature, layer) {
layer.on(‘click’, function(e) {
var z = leafletMap.getZoom();
var props = feature.properties;
var name = props.ADMIN || props.name || props.NAME || ‘Unknown’;
var iso2 = getISO2(props);
var iso3 = ISO2_TO_ISO3[iso2] || ‘’;
// If zoomed in and already on this country, use reverse geocode for region
if (z >= 5 && selectedPlace.code === iso2) {
L.DomEvent.stopPropagation(e);
reverseGeocode(e.latlng.lat, e.latlng.lng);
return;
}
L.DomEvent.stopPropagation(e);
onCountryClick(iso2, iso3, name, e.latlng);
});
layer.on(‘mouseover’, function() {
layer.setStyle({ fillOpacity:0.22, weight:1.5, color:’#1a6b4a’ });
});
layer.on(‘mouseout’, function() {
layer.setStyle({ fillOpacity:0.08, weight:0.8, color:’#2a9060’ });
});
}
}).addTo(leafletMap);
setMapStatus(‘Tap any country for real data. Zoom in for regions.’);
})
.catch(function() { setMapStatus(‘Tap to explore. Country layer loading…’); });
}

// Load sub-national boundaries via per-country GeoJSON from GADM CDN
function loadSubLayer(iso2, iso3, countryName) {
if (!iso2) { setMapStatus(’No region code for ’ + countryName); return; }
if (iso2 === ‘US’) { loadUSStateLayer(); return; }
if (subLayer && subLayer._countryISO3 === iso3) return;

var cacheKey = ‘geo_’ + iso3;
if (geoCache[cacheKey]) {
renderSubLayer(geoCache[cacheKey], iso2, iso3, countryName);
return;
}

setMapStatus(’Loading regions for ’ + countryName + ‘…’);

// Use gadm.org CDN - serves per-country GeoJSON, excellent CORS
// URL: https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_{ISO3}*1.json
var gadmUrl = ’https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41*’ + iso3 + ‘_1.json’;

fetch(gadmUrl)
.then(function(r) {
if (!r.ok) throw new Error(‘GADM ’ + r.status);
return r.json();
})
.then(function(data) {
if (!data || !data.features || data.features.length === 0) throw new Error(‘Empty’);
geoCache[cacheKey] = data;
renderSubLayer(data, iso2, iso3, countryName);
})
.catch(function(e1) {
// Fallback: try Natural Earth via jsDelivr (different CDN, better CORS)
var neUrl = ‘https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_1_states_provinces.geojson’;
if (geoCache[’_ne_adm1’]) {
var filtered = filterByISO(geoCache[’_ne_adm1’], iso2, iso3);
if (filtered.features.length > 0) {
geoCache[cacheKey] = filtered;
renderSubLayer(filtered, iso2, iso3, countryName);
} else {
setMapStatus(countryName + ’ — zoom in and tap any region to see local data.’);
}
return;
}
fetch(neUrl)
.then(function(r) { return r.json(); })
.then(function(data) {
geoCache[’_ne_adm1’] = data;
var filtered = filterByISO(data, iso2, iso3);
if (filtered.features.length > 0) {
geoCache[cacheKey] = filtered;
renderSubLayer(filtered, iso2, iso3, countryName);
} else {
setMapStatus(countryName + ’ — zoom in to see regions on the base map.’);
}
})
.catch(function() {
setMapStatus(countryName + ’ — zoom in to see regions. Tap any area for local data.’);
});
});
}

// Separate clean filter function for Natural Earth
function filterByISO(data, iso2, iso3) {
var i2 = (iso2||’’).toUpperCase();
var i3 = (iso3||’’).toUpperCase();
var features = (data.features||[]).filter(function(f) {
var p = f.properties||{};
// GADM uses GID_0 for country ISO3
if (p.GID_0 && p.GID_0.toUpperCase() === i3) return true;
// Natural Earth uses adm0_a3
if (p.adm0_a3 && p.adm0_a3.toUpperCase() === i3) return true;
if (p.ADM0_A3 && p.ADM0_A3.toUpperCase() === i3) return true;
// ISO2 fallbacks
if (p.iso_a2 && p.iso_a2.toUpperCase() === i2) return true;
if (p.ISO_A2 && p.ISO_A2.toUpperCase() === i2) return true;
return false;
});
return { type:‘FeatureCollection’, features: features };
}

function filterADM1(data, iso2, iso3) {
if (!data || !data.features) return { type:‘FeatureCollection’, features:[] };
var iso2up = (iso2 || ‘’).toUpperCase();
var iso3up = (iso3 || ‘’).toUpperCase();

var features = data.features.filter(function(f) {
var p = f.properties || {};
// Scan every string property for ISO3 match (broadest possible search)
var keys = Object.keys(p);
for (var i = 0; i < keys.length; i++) {
var val = p[keys[i]];
if (typeof val === ‘string’) {
var vup = val.toUpperCase().trim();
if (iso3up && vup === iso3up) return true;
if (iso2up && vup === iso2up && val.length === 2) return true;
}
}
// Country name match
var nameChecks = [p.admin, p.ADMIN, p.adm0_name, p.ADM0_NAME, p.geonunit, p.sovereignt, p.name, p.NAME];
for (var k = 0; k < nameChecks.length; k++) {
if (nameChecks[k] && NAME_TO_ISO2[nameChecks[k].toUpperCase()] === iso2up) return true;
}
return false;
});

if (features.length === 0 && data.features.length > 0) {
var fp = data.features[0].properties;
var propKeys = Object.keys(fp).join(’, ’);
var sample = JSON.stringify(fp).substring(0, 200);
console.log(‘ADM1 miss for’, iso2up, iso3up, ‘| Props:’, propKeys, ‘| Sample:’, sample);
// Show diagnostic in map status
setMapStatus(’No regions for ’ + iso2up + ‘/’ + iso3up + ’. File has ’ + data.features.length + ’ features. Keys: ’ + propKeys.substring(0,60));
}
return { type:‘FeatureCollection’, features: features };
}

function renderSubLayer(geojson, iso2, iso3, countryName) {
if (subLayer) { leafletMap.removeLayer(subLayer); subLayer = null; }
subLayer = L.geoJSON(geojson, {
style: function() {
return { fillColor:’#5040a0’, fillOpacity:0.06, color:’#5040a0’, weight:1, opacity:0.5 };
},
onEachFeature: function(feature, layer) {
var regionName = feature.properties.shapeName ||
feature.properties.NAME_1 ||
feature.properties.name ||
feature.properties.NAME || ‘Region’;
layer.bindTooltip(regionName, { permanent:false, direction:‘center’, className:‘state-tooltip’ });
layer.on(‘click’, function(e) {
L.DomEvent.stopPropagation(e);
onRegionClick(regionName, iso2, iso3, countryName, e.latlng);
});
layer.on(‘mouseover’, function() { layer.setStyle({ fillOpacity:0.2, weight:2 }); });
layer.on(‘mouseout’, function() { layer.setStyle({ fillOpacity:0.06, weight:1 }); });
}
}).addTo(leafletMap);
subLayer._countryISO3 = iso3;
setMapStatus(countryName + ’ regions loaded. Tap a region for data.’);
}

function loadUSStateLayer() {
if (subLayer && subLayer._countryISO3 === ‘USA’) return;
setMapStatus(‘Loading US states…’);
var cacheKey = ‘geo_USA’;
if (geoCache[cacheKey]) { renderUSStates(geoCache[cacheKey]); return; }
fetch(‘https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json’)
.then(function(r) { return r.json(); })
.then(function(data) { geoCache[cacheKey] = data; renderUSStates(data); })
.catch(function() { setMapStatus(‘State boundaries unavailable.’); });
}

function renderUSStates(data) {
if (subLayer) { leafletMap.removeLayer(subLayer); subLayer = null; }
subLayer = L.geoJSON(data, {
style: function() {
return { fillColor:’#5040a0’, fillOpacity:0.06, color:’#5040a0’, weight:1, opacity:0.5 };
},
onEachFeature: function(feature, layer) {
var stateName = feature.properties.name || feature.properties.NAME || ‘’;
layer.bindTooltip(stateName, { permanent:false, direction:‘center’, className:‘state-tooltip’ });
layer.on(‘click’, function(e) {
L.DomEvent.stopPropagation(e);
onStateClick(stateName, e.latlng);
});
layer.on(‘mouseover’, function() { layer.setStyle({ fillOpacity:0.2, weight:2, color:’#3020a0’ }); });
layer.on(‘mouseout’, function() { layer.setStyle({ fillOpacity:0.06, weight:1, color:’#5040a0’ }); });
}
}).addTo(leafletMap);
subLayer._countryISO3 = ‘USA’;
setMapStatus(‘Tap a state for Census data. Zoom in for counties.’);
}

// ── CLICK HANDLERS ──

function onCountryClick(iso2, iso3, name, latlng) {
selectedPlace = { name:name, code:iso2, iso3:iso3, type:‘country’ };
document.getElementById(‘viewingLabel’).textContent = name;
showDataPanel(name, ‘<div style="color:#8a8580;font-size:13px">Fetching World Bank data…</div>’);
L.popup().setLatLng(latlng)
.setContent(’<div class="popup-title">’ + name + ‘</div><div style="color:#8a8580;font-size:12px">Loading…</div>’)
.openOn(leafletMap);

// Always start loading sub-layer in background
if (iso2 === ‘US’) {
setMapStatus(name + ’ — zoom in to see states, or tap map’);
loadUSStateLayer();
} else if (iso3) {
setMapStatus(‘Loading regions for ’ + name + ‘…’);
loadSubLayer(iso2, iso3, name);
} else {
setMapStatus(name + ’ — no ISO3 code, cannot load regions’);
}
fetchWorldBankData(iso2, name, latlng);
}

function onRegionClick(regionName, iso2, iso3, countryName, latlng) {
var fullName = regionName + ’, ’ + countryName;
selectedPlace = { name:fullName, code:iso2, iso3:iso3, type:‘region’ };
document.getElementById(‘viewingLabel’).textContent = fullName;
showDataPanel(fullName, ‘<div style="color:#8a8580;font-size:13px">Fetching regional data…</div>’);
fetchRegionData(regionName, iso2, countryName, latlng);
}

function onStateClick(stateName, latlng) {
var fips = US_STATE_FIPS[stateName] || ‘’;
selectedPlace = { name:stateName+’, USA’, code:‘US’, iso3:‘USA’, type:‘state’, fips:fips };
document.getElementById(‘viewingLabel’).textContent = stateName + ‘, USA’;
showDataPanel(stateName + ‘, USA’, ‘<div style="color:#8a8580;font-size:13px">Fetching Census data…</div>’);
if (fips) loadCountyLayer(fips, stateName);
fetchStateData(stateName, fips, latlng);
}

function onCountyClick(countyName, fips, stateName, stateFips, latlng) {
var fullName = countyName + ’ County, ’ + stateName;
selectedPlace = { name:fullName, code:‘US’, type:‘county’ };
document.getElementById(‘viewingLabel’).textContent = fullName;
showDataPanel(fullName, ‘<div style="color:#8a8580;font-size:13px">Fetching Census data…</div>’);
fetchCountyData(countyName, fips, stateFips, latlng);
}

function loadCountyLayer(stateFips, stateName) {
var countyLayerKey = ‘counties_’ + stateFips;
// Remove previous county layer if different state
if (subLayer && subLayer._countyFips && subLayer._countyFips !== stateFips) {
leafletMap.removeLayer(subLayer);
subLayer = null;
}
if (subLayer && subLayer._countyFips === stateFips) return;

fetch(‘https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json’)
.then(function(r) { return r.json(); })
.then(function(data) {
var filtered = { type:‘FeatureCollection’, features: data.features.filter(function(f) {
return f.id && f.id.toString().substring(0,2) === stateFips;
})};
if (filtered.features.length === 0) return;
var cl = L.geoJSON(filtered, {
style: function() { return { fillColor:’#c04020’, fillOpacity:0.05, color:’#c04020’, weight:0.6, opacity:0.4 }; },
onEachFeature: function(feature, layer) {
layer.on(‘click’, function(e) {
L.DomEvent.stopPropagation(e);
var name = feature.properties.NAME || feature.properties.name || ‘’;
onCountyClick(name, feature.id||’’, stateName, stateFips, e.latlng);
});
layer.on(‘mouseover’, function() { layer.setStyle({ fillOpacity:0.18, weight:1 }); });
layer.on(‘mouseout’, function() { layer.setStyle({ fillOpacity:0.05, weight:0.6 }); });
}
}).addTo(leafletMap);
cl._countyFips = stateFips;
setMapStatus(‘Tap a county for detailed data.’);
})
.catch(function() {});
}

// ── REVERSE GEOCODE ──
function reverseGeocode(lat, lng) {
var z = leafletMap.getZoom();
var zl = z >= 9 ? 10 : z >= 6 ? 8 : 5;
fetch(‘https://nominatim.openstreetmap.org/reverse?lat=’+lat+’&lon=’+lng+’&format=json&zoom=’+zl, {
headers: {‘Accept-Language’:‘en’}
})
.then(function(r) { return r.json(); })
.then(function(d) {
if (!d || !d.address) return;
var addr = d.address;
var cc = (addr.country_code||’’).toUpperCase();

```
if (z >= 9 && cc === 'US' && addr.county) {
  var county = addr.county.replace(' County','').replace(' Parish','');
  onCountyClick(county, '', addr.state||'', US_STATE_FIPS[addr.state]||'', {lat:lat,lng:lng});
} else if (z >= 4 && cc === 'US' && addr.state) {
  onStateClick(addr.state, {lat:lat,lng:lng});
} else if (z >= 4 && addr.state && cc !== selectedPlace.code) {
  // Tapped into a region of a country
  onRegionClick(addr.state, cc, ISO2_TO_ISO3[cc]||'', addr.country||'', {lat:lat,lng:lng});
} else if (z >= 4 && addr.state) {
  onRegionClick(addr.state, cc, ISO2_TO_ISO3[cc]||'', addr.country||'', {lat:lat,lng:lng});
}
```

})
.catch(function() {});
}

// ── WORLD BANK DATA ──
function fetchWorldBankData(code, name, latlng) {
if (!code) { showNoData(name); return; }
var cacheKey = ‘wb_’ + code;
if (wbCache[cacheKey]) { displayCountryData(wbCache[cacheKey], name, latlng); return; }

var inds = [‘EG.ELC.RNEW.ZS’,‘SN.ITK.DEFC.ZS’,‘SH.H2O.SMDW.ZS’,‘ER.LND.PTLD.ZS’,‘SI.POV.GINI’,‘NY.GDP.PCAP.CD’];
var results = {};
var pending = inds.length;

var tid = setTimeout(function() {
if (pending > 0) { pending = 0; wbCache[cacheKey] = results; displayCountryData(results, name, latlng); }
}, 8000);

inds.forEach(function(ind) {
fetch(‘https://api.worldbank.org/v2/country/’+code+’/indicator/’+ind+’?format=json&mrv=5&per_page=5’)
.then(function(r) { return r.json(); })
.then(function(data) {
var val = null;
if (data && data[1]) {
for (var i = 0; i < data[1].length; i++) {
if (data[1][i].value !== null) {
val = { value: Math.round(data[1][i].value*10)/10, year: data[1][i].date };
break;
}
}
}
results[ind] = val; pending–;
if (pending <= 0) { clearTimeout(tid); wbCache[cacheKey] = results; displayCountryData(results, name, latlng); }
})
.catch(function() {
results[ind] = null; pending–;
if (pending <= 0) { clearTimeout(tid); wbCache[cacheKey] = results; displayCountryData(results, name, latlng); }
});
});
}

// Region data - try World Bank subnational, fall back to country data
function fetchRegionData(regionName, iso2, countryName, latlng) {
// Show region name, use country-level data as context
var cacheKey = ‘wb_’ + iso2;
if (wbCache[cacheKey]) {
displayRegionData(regionName, countryName, wbCache[cacheKey], latlng);
} else {
// Fetch country data first then display with region context
fetchWorldBankData(iso2, countryName, null);
// Show interim message
var html = ‘<div style="font-size:13px;color:#4a4640;margin-bottom:10px">’;
html += ’Region-level statistics are limited for most countries. ’;
html += ‘Showing national data for ’ + countryName + ’ as context.</div>’;
showDataPanel(regionName + ‘, ’ + countryName, html + ‘<div style="color:#8a8580;font-size:13px">Loading national data…</div>’);
// After a delay, show whatever we have
setTimeout(function() {
if (wbCache[cacheKey]) displayRegionData(regionName, countryName, wbCache[cacheKey], latlng);
}, 4000);
}
setMapStatus(regionName + ’ — showing available data’);
}

function fetchStateData(stateName, fips, latlng) {
if (!fips) { showNoData(stateName); return; }
var cacheKey = ‘state_’ + fips;
if (subCache[cacheKey]) { displayStateData(subCache[cacheKey], stateName, latlng); return; }
fetch(‘https://api.census.gov/data/2022/acs/acs5?get=NAME,B19013_001E,B17001_002E,B01003_001E,B15003_022E&for=state:’ + fips)
.then(function(r) { return r.json(); })
.then(function(d) {
if (!d || d.length < 2) { showNoData(stateName); return; }
var r = d[1];
var data = { name:r[0], medianIncome:parseInt(r[1])||null, poverty:parseInt(r[2])||null, pop:parseInt(r[3])||null, bachelors:parseInt(r[4])||null };
subCache[cacheKey] = data;
displayStateData(data, stateName, latlng);
})
.catch(function() { showNoData(stateName); });
}

function fetchCountyData(countyName, fips, stateFips, latlng) {
if (!stateFips) { showNoData(countyName+’ County’); return; }
var cacheKey = ‘county_’ + stateFips + ‘_’ + countyName;
if (subCache[cacheKey]) { displayCountyData(subCache[cacheKey], countyName, latlng); return; }
fetch(‘https://api.census.gov/data/2022/acs/acs5?get=NAME,B19013_001E,B17001_002E,B01003_001E&for=county:*&in=state:’+stateFips)
.then(function(r) { return r.json(); })
.then(function(d) {
if (!d || d.length < 2) { showNoData(countyName); return; }
var match = null;
for (var i = 1; i < d.length; i++) {
if (d[i][0] && d[i][0].toLowerCase().indexOf(countyName.toLowerCase()) >= 0) { match = d[i]; break; }
}
if (!match) match = d[1];
var data = { name:match[0], medianIncome:parseInt(match[1])||null, poverty:parseInt(match[2])||null, pop:parseInt(match[3])||null };
subCache[cacheKey] = data;
displayCountyData(data, countyName, latlng);
})
.catch(function() { showNoData(countyName+’ County’); });
}

// ── DISPLAY ──
function displayCountryData(data, name, latlng) {
var ren = data[‘EG.ELC.RNEW.ZS’], hunger = data[‘SN.ITK.DEFC.ZS’];
var water = data[‘SH.H2O.SMDW.ZS’], land = data[‘ER.LND.PTLD.ZS’];
var gini = data[‘SI.POV.GINI’], gdp = data[‘NY.GDP.PCAP.CD’];

if (ren) setSlider(‘sl-ren’, ren.value, ‘sv-ren’);
if (hunger) setSlider(‘sl-food’, Math.max(0,100-hunger.value), ‘sv-food’);
if (water) setSlider(‘sl-water’, water.value, ‘sv-water’);
if (land) setSlider(‘sl-land’, land.value, ‘sv-land’);
if (gini) setSlider(‘sl-wealth’, Math.max(0,100-gini.value), ‘sv-wealth’);
BASE_METRICS = computeMetrics(getSliders());
recalc();

var hasAny = ren || hunger || water || land || gini || gdp;
if (!hasAny) { showNoData(name); return; }

var html = ‘’;
if (ren) html += dataRow(‘Renewable electricity’, ren.value+’%’, ren.year);
if (hunger) html += dataRow(‘Food secure’, Math.round(100-hunger.value)+’%’, hunger.year);
if (water) html += dataRow(‘Safe water’, water.value+’%’, water.year);
if (land) html += dataRow(‘Protected land’, land.value+’%’, land.year);
if (gini) html += dataRow(‘Gini coefficient’, gini.value, gini.year);
if (gdp) html += dataRow(‘GDP per capita’, ‘$’+Math.round(gdp.value).toLocaleString(), gdp.year);
html += ‘<div style="font-size:10px;color:#b8b4ae;margin-top:10px;padding-top:6px;border-top:1px solid #f0ece4">World Bank Open Data. Most recent year shown.</div>’;
showDataPanel(name, html);

if (latlng && leafletMap) {
var ph = ‘<div class="popup-title">’+name+’</div>’;
if (ren) ph += ‘<div class="popup-row"><span class="popup-label">Renewables</span><span class="popup-val">’+ren.value+’%</span></div>’;
if (water) ph += ‘<div class="popup-row"><span class="popup-label">Safe water</span><span class="popup-val">’+water.value+’%</span></div>’;
if (gdp) ph += ‘<div class="popup-row"><span class="popup-label">GDP/capita</span><span class="popup-val">$’+Math.round(gdp.value/1000)+‘k</span></div>’;
ph += ‘<div class="popup-source">World Bank</div>’;
L.popup().setLatLng(latlng).setContent(ph).openOn(leafletMap);
}
setMapStatus(name + ’ data loaded. Sliders updated. Zoom in for regions.’);
// Add start project button
addStartProjectBtn(name, data, ‘World Bank’);
// Sub-national boundaries: US uses GeoJSON overlay, others use base map + reverse geocode
if (leafletMap && selectedPlace.code === ‘US’) {
loadUSStateLayer();
}
}

function buildProjectBaseline(countryData) {
var ren = countryData[‘EG.ELC.RNEW.ZS’];
var hunger = countryData[‘SN.ITK.DEFC.ZS’];
var water = countryData[‘SH.H2O.SMDW.ZS’];
var land = countryData[‘ER.LND.PTLD.ZS’];
var gini = countryData[‘SI.POV.GINI’];
var renVal = ren ? ren.value : 34;
var foodVal = hunger ? Math.max(0,100-hunger.value) : 72;
var waterVal = water ? water.value : 74;
var landVal = land ? land.value : 17;
var wealthVal = gini ? Math.max(0,100-gini.value) : 50;
var fl = Math.min(100,Math.round(foodVal*0.25+waterVal*0.2+wealthVal*0.2+8*0.2+renVal*0.1+landVal*0.05));
var ec = Math.min(100,Math.round(renVal*0.4+landVal*0.35+8*0.15));
var st = Math.min(100,Math.round(foodVal*0.25+8*0.25+wealthVal*0.2+renVal*0.15+waterVal*0.15));
return {energy:renVal,water:waterVal,food:foodVal,land:landVal,wealth:wealthVal,conflict:8,
flourishing:fl,ecological:ec,stability:st};
}

function addStartProjectBtn(title, countryData, source) {
var slot = document.getElementById(‘startProjectSlot’);
if (!slot) return;
window.currentPlaceBaseline = (countryData && countryData.flourishing)
? countryData : buildProjectBaseline(countryData || {});
window.currentPlaceTitle = title;
window.currentPlaceSource = source || ‘World Bank’;
var btn = document.createElement(‘button’);
btn.className = ‘btn btn-dark btn-full’;
btn.style.marginTop = ‘12px’;
btn.textContent = ‘Start a Project Here’;
btn.onclick = function() {
startProject(window.currentPlaceTitle, window.currentPlaceBaseline, window.currentPlaceSource);
};
slot.innerHTML = ‘’;
slot.appendChild(btn);
}

function displayRegionData(regionName, countryName, countryData, latlng) {
var ren = countryData[‘EG.ELC.RNEW.ZS’];
var hunger = countryData[‘SN.ITK.DEFC.ZS’];
var water = countryData[‘SH.H2O.SMDW.ZS’];
var gdp = countryData[‘NY.GDP.PCAP.CD’];

var html = ‘<div style="font-size:11px;color:#8a8580;margin-bottom:10px;padding:6px 8px;background:#f8f6f2;border-radius:6px">’;
html += ‘Sub-national data limited. Showing national figures for ’ + countryName + ‘.</div>’;
if (ren) html += dataRow(‘Renewable electricity’, ren.value+’%’, ren.year);
if (hunger) html += dataRow(‘Food secure’, Math.round(100-hunger.value)+’%’, hunger.year);
if (water) html += dataRow(‘Safe water’, water.value+’%’, water.year);
if (gdp) html += dataRow(‘GDP per capita’, ‘$’+Math.round(gdp.value).toLocaleString(), gdp.year);
html += ‘<div style="font-size:10px;color:#b8b4ae;margin-top:8px">World Bank national data. Regional breakdown not available.</div>’;
showDataPanel(regionName + ‘, ’ + countryName, html);
setMapStatus(regionName + ’ — national data shown as context.’);
}

function displayStateData(data, stateName, latlng) {
if (data.medianIncome) setSlider(‘sl-wealth’, Math.min(100,Math.round(data.medianIncome/1200)), ‘sv-wealth’);
if (data.poverty && data.pop) setSlider(‘sl-food’, Math.max(0,Math.round(100-(data.poverty/data.pop*100)*2)), ‘sv-food’);
recalc();
var html = ‘’;
if (data.pop) html += dataRow(‘Population’, data.pop.toLocaleString(), ‘2022’);
if (data.medianIncome) html += dataRow(‘Median household income’, ‘$’+data.medianIncome.toLocaleString(), ‘2022’);
if (data.poverty && data.pop) html += dataRow(‘Poverty rate’, (data.poverty/data.pop*100).toFixed(1)+’%’, ‘2022’);
html += ‘<div style="font-size:11px;color:#8a8580;margin-top:10px;padding:8px;background:#f8f6f2;border-radius:6px">Zoom in and tap a county for local data.</div>’;
html += ‘<div style="font-size:10px;color:#b8b4ae;margin-top:6px">US Census ACS 5-year estimates 2022.</div>’;
showDataPanel(stateName+’, USA’, html);
setMapStatus(stateName+’ loaded. Tap a county for more detail.’);
// Add start project button
var stateBaseline = {
energy: 34, water: 95, food: 90, land: 17, wealth: 60, conflict: 5,
flourishing: data.medianIncome ? Math.min(100,Math.round(data.medianIncome/1200)) : 65,
ecological: 45, stability: 70
};
if (data.medianIncome) stateBaseline.wealth = Math.min(100,Math.round(data.medianIncome/1200));
addStartProjectBtn(stateName + ‘, USA’, stateBaseline, ‘US Census 2022’);
}

function displayCountyData(data, countyName, latlng) {
if (data.medianIncome) setSlider(‘sl-wealth’, Math.min(100,Math.round(data.medianIncome/1200)), ‘sv-wealth’);
recalc();
var html = ‘’;
if (data.pop) html += dataRow(‘Population’, data.pop.toLocaleString(), ‘2022’);
if (data.medianIncome) html += dataRow(‘Median household income’, ‘$’+data.medianIncome.toLocaleString(), ‘2022’);
if (data.poverty && data.pop) html += dataRow(‘Poverty rate’, (data.poverty/data.pop*100).toFixed(1)+’%’, ‘2022’);
html += ‘<div style="font-size:10px;color:#b8b4ae;margin-top:8px">US Census ACS 5-year estimates 2022.</div>’;
showDataPanel(data.name||countyName+’ County’, html);
setMapStatus(countyName+’ County data loaded.’);
var countyBaseline = {
energy:34, water:95, food:85, land:10, wealth:data.medianIncome?Math.min(100,Math.round(data.medianIncome/1200)):55, conflict:5,
flourishing:data.medianIncome?Math.min(100,Math.round(data.medianIncome/1200)):55, ecological:40, stability:65
};
addStartProjectBtn((data.name||countyName+’ County’), countyBaseline, ‘US Census 2022’);
}

function showNoData(name) {
showDataPanel(name, ‘<div style="color:#8a8580;font-size:13px;padding:6px 0">No data available for ‘+name+’. World Bank or Census data may not cover this area.</div>’);
setMapStatus(name+’ — no data available’);
}

// ── HELPERS ──
function showDataPanel(title, html) {
document.getElementById(‘dataPanel’).style.display = ‘block’;
document.getElementById(‘dataPanelTitle’).textContent = title;
// Always include project button slot at bottom
document.getElementById(‘dataPanelContent’).innerHTML = html +
‘<div id="startProjectSlot"></div>’;
}

function dataRow(label, value, year) {
var yr = year ? ’ <span style="color:#b8b4ae;font-size:10px">(’+year+’)</span>’ : ‘’;
return ‘<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f4f0e8"><span style="font-size:13px;color:#8a8580">’+label+’</span><span style="font-size:13px;font-weight:600;color:#1a1814">’+value+yr+’</span></div>’;
}

function setMapStatus(msg) {
var el = document.getElementById(‘mapStatus’);
if (el) el.textContent = msg;
}

function setSlider(id, val, labelId) {
var s = document.getElementById(id);
var l = document.getElementById(labelId);
if (s && val !== null && !isNaN(val)) {
s.value = Math.round(val);
if (l) l.textContent = Math.round(val)+’%’;
}
}

function resetMapView() {
if (leafletMap) { leafletMap.setView([20,0], 2); }
if (subLayer) { leafletMap.removeLayer(subLayer); subLayer = null; }
selectedPlace = { name:‘Global’, code:null, iso3:null, type:‘world’ };
document.getElementById(‘viewingLabel’).textContent = ‘Global Average’;
document.getElementById(‘dataPanel’).style.display = ‘none’;
resetSliders();
}

function resetSliders() {
setSlider(‘sl-ren’,34,‘sv-ren’); setSlider(‘sl-food’,72,‘sv-food’);
setSlider(‘sl-kl’,8,‘sv-kl’); setSlider(‘sl-land’,17,‘sv-land’);
setSlider(‘sl-water’,74,‘sv-water’); setSlider(‘sl-wealth’,12,‘sv-wealth’);
recalc();
document.getElementById(‘viewingLabel’).textContent = ‘Global Average’;
}

// ── GLOBE ──

function initGlobe() {
var canvas = document.getElementById(‘globeCanvas’);
if (!canvas) return;
var ctx = canvas.getContext(‘2d’);
var cx = 60, cy = 60, r = 52;
var angle = 0;

function draw() {
ctx.clearRect(0, 0, 120, 120);
ctx.beginPath();
ctx.arc(cx, cy, r, 0, Math.PI * 2);
ctx.strokeStyle = ‘rgba(184,146,42,0.25)’;
ctx.lineWidth = 1.5;
ctx.stroke();

```
ctx.strokeStyle = 'rgba(184,146,42,0.15)';
ctx.lineWidth = 0.75;
var lat;
for (lat = -60; lat <= 60; lat += 30) {
  var latRad = lat * Math.PI / 180;
  var ry = r * Math.cos(latRad);
  var yPos = cy - r * Math.sin(latRad);
  if (ry > 0) {
    ctx.beginPath();
    ctx.ellipse(cx, yPos, ry, ry * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

ctx.strokeStyle = 'rgba(184,146,42,0.12)';
var lon;
for (lon = 0; lon < 360; lon += 40) {
  var lonRad = (lon + angle) * Math.PI / 180;
  ctx.beginPath();
  var started = false;
  var lt;
  for (lt = -90; lt <= 90; lt += 5) {
    var ltRad = lt * Math.PI / 180;
    var x = cx + r * Math.cos(ltRad) * Math.sin(lonRad);
    var y = cy - r * Math.sin(ltRad);
    var z = Math.cos(ltRad) * Math.cos(lonRad);
    if (z > 0) {
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    } else { started = false; }
  }
  ctx.stroke();
}

// Highlighted meridian
ctx.strokeStyle = 'rgba(184,146,42,0.4)';
ctx.lineWidth = 1;
var lonRad2 = angle * Math.PI / 180;
ctx.beginPath();
var s2 = false;
for (var lt2 = -90; lt2 <= 90; lt2 += 3) {
  var ltRad2 = lt2 * Math.PI / 180;
  var x2 = cx + r * Math.cos(ltRad2) * Math.sin(lonRad2);
  var y2 = cy - r * Math.sin(ltRad2);
  var z2 = Math.cos(ltRad2) * Math.cos(lonRad2);
  if (z2 > 0) {
    if (!s2) { ctx.moveTo(x2, y2); s2 = true; }
    else ctx.lineTo(x2, y2);
  } else { s2 = false; }
}
ctx.stroke();

angle += 0.3;
requestAnimationFrame(draw);
```

}
draw();
}

// ── FLOATING COUNCIL CHAT ──
var chatOpen = false;
var chatHistory = [];
var chatLoading = false;

function toggleCouncilChat() {
chatOpen = !chatOpen;
var panel = document.getElementById(‘councilChatPanel’);
if (chatOpen) {
panel.classList.add(‘open’);
updateChatContext();
updateChatCouncilNames();
setTimeout(function() {
var input = document.getElementById(‘chatInput’);
if (input) input.focus();
}, 100);
} else {
panel.classList.remove(‘open’);
}
}

function updateChatCouncilNames() {
var el = document.getElementById(‘chatCouncilNames’);
if (!el) return;
var names = council.slice(0,4).map(function(m){return m.name;}).join(’, ‘);
if (council.length > 4) names += ’ +’ + (council.length-4) + ’ more’;
el.textContent = names;
}

function updateChatContext() {
var bar = document.getElementById(‘chatContextBar’);
if (!bar) return;
var ctx = ‘’;
if (selectedPlace && selectedPlace.name && selectedPlace.name !== ‘Global’) {
ctx = ’Context: ’ + selectedPlace.name;
}
if (activeProblem) {
ctx = ctx ? ctx + ’ — ’ + activeProblem.substring(0,50) : activeProblem.substring(0,60);
}
if (ctx) {
bar.style.display = ‘block’;
bar.textContent = ctx;
} else {
bar.style.display = ‘none’;
}
}

function addChatMsg(role, text, speaker) {
var msgs = document.getElementById(‘chatMessages’);
if (!msgs) return;
var div = document.createElement(‘div’);
if (role === ‘user’) {
div.className = ‘chat-msg-user’;
div.textContent = text;
} else {
div.className = ‘chat-msg-council’;
if (speaker) {
var spk = document.createElement(‘div’);
spk.className = ‘chat-msg-speaker’;
spk.textContent = speaker.toUpperCase();
div.appendChild(spk);
}
div.innerHTML = (speaker ? ‘<div class="chat-msg-speaker">’+speaker.toUpperCase()+’</div>’ : ‘’) +
‘<div>’ + text + ‘</div>’;
}
msgs.appendChild(div);
msgs.scrollTop = msgs.scrollHeight;
}

function addChatThinking(speakerName) {
var msgs = document.getElementById(‘chatMessages’);
if (!msgs) return;
var div = document.createElement(‘div’);
div.className = ‘chat-msg-council’;
div.id = ‘chatThinking’;
div.innerHTML = ‘<div class="chat-msg-speaker">’ + (speakerName||‘COUNCIL’).toUpperCase() + ‘</div>’ +
‘<div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
msgs.appendChild(div);
msgs.scrollTop = msgs.scrollHeight;
}

function removeChatThinking() {
var el = document.getElementById(‘chatThinking’);
if (el) el.parentNode.removeChild(el);
}

function sendChat() {
var input = document.getElementById(‘chatInput’);
if (!input || chatLoading) return;
var text = input.value.trim();
if (!text) return;
input.value = ‘’;
chatLoading = true;
addChatMsg(‘user’, text);
chatHistory.push({ role:‘user’, content: text });

// Pick a speaker
var speakers = council.filter(function(m){return !m.isClaude;});
var speaker = speakers[Math.floor(Math.random() * speakers.length)] || council[0];

addChatThinking(speaker.name);

// Build context
var ctx = ‘’;
if (selectedPlace && selectedPlace.name !== ‘Global’) ctx += ’The user is currently viewing ’ + selectedPlace.name + ’ on the World Game map. ’;
if (activeProblem) ctx += ‘The forum is debating: “’ + activeProblem + ’”. ’;

// Recent history
var recentHist = chatHistory.slice(-6).map(function(m){
return (m.role===‘user’ ? ‘User: ’ : speaker.name+’: ‘) + m.content;
}).join(’\n’);

var sys = ‘You are ’ + speaker.name + ’ (’ + speaker.era + ’), known for: ’ + speaker.domain + ’. ’ +
’You are part of a council advising this person. Be direct, specific, and true to your voice. ’ +
’2-4 sentences. No preamble. ’ +
(ctx ? ctx : ‘’) +
(recentHist ? ‘Conversation so far:\n’ + recentHist : ‘’);

fetch(’/api/chat’, {
method: ‘POST’,
headers: { ‘Content-Type’:‘application/json’ },
body: JSON.stringify({ system:sys, user:text, maxTokens:300 })
})
.then(function(r){ return r.json(); })
.then(function(d) {
chatLoading = false;
removeChatThinking();
if (d.error) {
addChatMsg(‘council’, d.error, ‘Error’);
} else {
addChatMsg(‘council’, d.text, speaker.name);
chatHistory.push({ role:‘assistant’, content: d.text });
}
})
.catch(function(e) {
chatLoading = false;
removeChatThinking();
addChatMsg(‘council’, e.message, ‘Error’);
});
}

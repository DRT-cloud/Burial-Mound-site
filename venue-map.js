/* Interactive venue map for The Burial Mound — Location & Directions page.
   Leaflet, satellite/topo basemaps, category filters, click-for-detail panel.
   Coordinates are real-world from the venue survey. */
(function () {
  'use strict';
  var el = document.getElementById('venue-leaflet');
  if (!el || typeof L === 'undefined') return;

  // Directions deep-links per gate (match the gate cards above)
  var GATE_DIRECTIONS = {
    'Gate 1 West (Main Gate)': 'https://maps.app.goo.gl/Usn8ewQWbAGJDSsU6',
    'Gate 2 West': 'https://maps.app.goo.gl/CzUq7n9scBnKXJFJ9',
    'Gate 3 East': 'https://maps.app.goo.gl/gP8JHFhsDqEnNzHa9',
    'Gate 4 East': 'https://maps.app.goo.gl/BQJ4NPmfzZ1gDJaUA'
  };

  var DATA = {
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "properties": { "name": "Gate 2 West", "category": "gate", "description": "Entrance to shooting bays" }, "geometry": { "type": "Point", "coordinates": [-96.8549722, 36.4059444] } },
      { "type": "Feature", "properties": { "name": "Gate 1 West (Main Gate)", "category": "gate", "description": "Entrance to west parking" }, "geometry": { "type": "Point", "coordinates": [-96.85344845745283, 36.40095199682817] } },
      { "type": "Feature", "properties": { "name": "Gate 3 East", "category": "gate", "description": "Entrance to east lower parking" }, "geometry": { "type": "Point", "coordinates": [-96.8354444280992, 36.39974581112712] } },
      { "type": "Feature", "properties": { "name": "Gate 4 East", "category": "gate", "description": "Entrance to east upper parking" }, "geometry": { "type": "Point", "coordinates": [-96.83541784103139, 36.395485593103515] } },
      { "type": "Feature", "properties": { "name": "Shooting Bays", "category": "bay", "description": "2 shooting bays" }, "geometry": { "type": "Polygon", "coordinates": [[[-96.85642769088773, 36.40501742424678], [-96.85621160630122, 36.404367906302156], [-96.855148822924, 36.40475477829989], [-96.85547515474944, 36.40539364527267], [-96.85642769088773, 36.40501742424678]]] } },
      { "type": "Feature", "properties": { "name": "West Parking", "category": "parking", "description": "West main parking" }, "geometry": { "type": "Polygon", "coordinates": [[[-96.85544371732982, 36.4019431535239], [-96.85546100425455, 36.401442255445815], [-96.85400025910688, 36.401831843118956], [-96.85399593737587, 36.40194663197134], [-96.85544371732982, 36.4019431535239]]] } },
      { "type": "Feature", "properties": { "name": "Gate 3 Parking A", "category": "parking", "description": "East gate 3 parking" }, "geometry": { "type": "Polygon", "coordinates": [[[-96.83545880058179, 36.399978745219656], [-96.83545880058179, 36.399851713187346], [-96.83512112973843, 36.39957401453401], [-96.83510644839708, 36.399978745219656], [-96.83545880058179, 36.399978745219656]]] } },
      { "type": "Feature", "properties": { "name": "Gate 3 Parking B", "category": "parking", "description": "East gate 3 parking" }, "geometry": { "type": "Polygon", "coordinates": [[[-96.83502657087624, 36.39914591462326], [-96.83502418799864, 36.39875464479027], [-96.83476445433017, 36.39876039877335], [-96.83477160296351, 36.3989138381467], [-96.83502657087624, 36.39914591462326]]] } },
      { "type": "Feature", "properties": { "name": "Gate 4 Parking B", "category": "parking", "description": "East gate 4 parking" }, "geometry": { "type": "Polygon", "coordinates": [[[-96.83547545002966, 36.39592357237677], [-96.83546473117764, 36.39507322986188], [-96.83467867402014, 36.39508267363168], [-96.83467867402014, 36.39519757274354], [-96.83527701603546, 36.395189702947064], [-96.8352828821339, 36.39543838813876], [-96.83512058675053, 36.3955942094677], [-96.83512254211652, 36.39577678759683], [-96.83547545002966, 36.39592357237677]]] } },
      { "type": "Feature", "properties": { "name": "Gate 4 Parking A", "category": "parking", "description": "East gate 4 parking" }, "geometry": { "type": "Polygon", "coordinates": [[[-96.83492166798706, 36.39613252078725], [-96.83456476524812, 36.39567233446533], [-96.83427395560922, 36.395938338452154], [-96.8345350233535, 36.39618572134232], [-96.83492166798706, 36.39613252078725]]] } }
    ]
  };

  var CAT_COLOR = { gate: '#C29F5A', parking: '#4a90d9', bay: '#E63621' };
  var CAT_LABEL = { gate: 'Gate', parking: 'Parking', bay: 'Shooting Bay' };

  var map = L.map(el, { scrollWheelZoom: false, attributionControl: true });

  var sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics'
  });
  var topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, attribution: 'Topo &copy; Esri'
  });
  sat.addTo(map);
  var currentBase = sat;

  var layers = { gate: L.layerGroup(), parking: L.layerGroup(), bay: L.layerGroup() };

  var detailEl = document.getElementById('venue-detail');
  function showDetail(p) {
    var dir = GATE_DIRECTIONS[p.name];
    var html = '<p class="venuemap__detail-name">' + p.name + '</p>';
    html += '<span class="venuemap__detail-cat">' + (CAT_LABEL[p.category] || p.category) + '</span>';
    if (p.description) html += '<p class="venuemap__detail-desc">' + p.description + '</p>';
    if (dir) html += '<a href="' + dir + '" class="btn-gold btn-gold--sm" target="_blank" rel="noopener noreferrer">Directions</a>';
    detailEl.innerHTML = html;
  }

  var allLatLngs = [];

  DATA.features.forEach(function (f) {
    var cat = f.properties.category;
    var color = CAT_COLOR[cat] || '#C29F5A';
    var lyr;
    if (f.geometry.type === 'Point') {
      var c = f.geometry.coordinates; // [lng, lat]
      var ll = [c[1], c[0]];
      allLatLngs.push(ll);
      lyr = L.circleMarker(ll, { radius: 9, color: '#000', weight: 2, fillColor: color, fillOpacity: 1 });
    } else if (f.geometry.type === 'Polygon') {
      var ring = f.geometry.coordinates[0].map(function (pt) { return [pt[1], pt[0]]; });
      ring.forEach(function (ll) { allLatLngs.push(ll); });
      lyr = L.polygon(ring, { color: color, weight: 2, fillColor: color, fillOpacity: 0.30 });
    }
    if (!lyr) return;
    lyr.bindPopup('<strong>' + f.properties.name + '</strong>' + (f.properties.description ? '<br>' + f.properties.description : ''));
    lyr.on('click', function () { showDetail(f.properties); });
    (layers[cat] || layers.gate).addLayer(lyr);
  });

  Object.keys(layers).forEach(function (k) { layers[k].addTo(map); });

  if (allLatLngs.length) {
    map.fitBounds(L.latLngBounds(allLatLngs).pad(0.25));
  } else {
    map.setView([36.402360, -96.854434], 15);
  }

  // Category filter chips
  document.querySelectorAll('.vm-chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-cat');
      var on = btn.getAttribute('aria-pressed') === 'true';
      var next = !on;
      btn.setAttribute('aria-pressed', String(next));
      if (next) { map.addLayer(layers[cat]); } else { map.removeLayer(layers[cat]); }
    });
  });

  // Basemap toggle
  document.querySelectorAll('.vm-base').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var base = btn.getAttribute('data-base');
      var target = base === 'topo' ? topo : sat;
      if (target === currentBase) return;
      map.removeLayer(currentBase);
      target.addTo(map);
      currentBase = target;
      document.querySelectorAll('.vm-base').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
    });
  });

  // Re-enable scroll-zoom only after a click into the map (prevents page-scroll hijack)
  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur', function () { map.scrollWheelZoom.disable(); });

  // Copy-coordinates buttons on the gate cards
  document.querySelectorAll('.gate-card__copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var txt = btn.getAttribute('data-coords') || '';
      var done = function () {
        var orig = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = orig; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  });
})();

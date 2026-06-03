(() => {
  const registry = new Map();

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function buildTravelMarkerHtml({
    iconType = "dot",
    color = "#14556b",
    accent = "#dd7046"
  } = {}) {
    if (iconType === "plane") {
      return `
        <div class="map-marker map-marker--plane" style="--marker-color: ${color}; --marker-accent: ${accent};">
          <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path d="M11 38l40-6 2 4-12 4-3 11-4 1 1-11-11 1-5 7-4-1 3-8-8-1 1-4z" fill="currentColor" opacity="0.22" />
            <path d="M12 38l15-4 5-14 5-1 1 13 14 1 1 5-14 2-1 13-5 1-5-13-15-3z" fill="currentColor" />
            <path d="M24 21l6 7" stroke="white" stroke-width="3" stroke-linecap="round" />
            <path d="M13 44h11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 4" />
            <path d="M42 35h9" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 4" />
          </svg>
        </div>
      `;
    }

    if (iconType === "family") {
      return `
        <div class="map-marker map-marker--party map-marker--family" style="--marker-color: ${color}; --marker-accent: ${accent};">
          <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle cx="22" cy="18" r="7" fill="currentColor" />
            <circle cx="42" cy="18" r="7" fill="currentColor" />
            <circle cx="32" cy="24" r="5" fill="var(--marker-accent)" />
            <path d="M14 52c0-8 4-15 8-15s8 7 8 15" fill="currentColor" opacity="0.92" />
            <path d="M34 52c0-8 4-15 8-15s8 7 8 15" fill="currentColor" opacity="0.92" />
            <path d="M25 54c0-6 3-11 7-11s7 5 7 11" fill="var(--marker-accent)" opacity="0.88" />
          </svg>
        </div>
      `;
    }

    if (iconType === "couple") {
      return `
        <div class="map-marker map-marker--party map-marker--couple" style="--marker-color: ${color}; --marker-accent: ${accent};">
          <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle cx="24" cy="20" r="8" fill="currentColor" />
            <circle cx="40" cy="20" r="8" fill="currentColor" opacity="0.92" />
            <path d="M16 54c0-10 4-18 8-18s8 8 8 18" fill="currentColor" opacity="0.9" />
            <path d="M32 54c0-10 4-18 8-18s8 8 8 18" fill="var(--marker-accent)" opacity="0.88" />
          </svg>
        </div>
      `;
    }

    if (iconType === "single") {
      return `
        <div class="map-marker map-marker--party map-marker--single" style="--marker-color: ${color}; --marker-accent: ${accent};">
          <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle cx="32" cy="20" r="9" fill="currentColor" />
            <path d="M20 54c0-11 5-19 12-19s12 8 12 19" fill="var(--marker-accent)" opacity="0.9" />
          </svg>
        </div>
      `;
    }

    return `
      <div class="map-marker map-marker--dot" style="--marker-color: ${color}; --marker-accent: ${accent};">
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle cx="24" cy="24" r="10" fill="currentColor" />
        </svg>
      </div>
    `;
  }

  function buildMiniMapBadge({
    title = "",
    origin = "",
    destination = "",
    mode = "package",
    accent = "#14556b",
    iconType = "",
    partyType = ""
  }) {
    const titleLabel = escapeHtml(title);
    const originLabel = escapeHtml(origin);
    const destinationLabel = escapeHtml(destination);
    const routeColor = mode === "hotel" ? "#1a7c64" : accent;
    const pinColor = mode === "hotel" ? "#dd7046" : "#0e4051";
    const badgeIcon = iconType || partyType || (mode === "hotel" ? "single" : "plane");
    const iconColor = badgeIcon === "plane" ? routeColor : pinColor;

    return `
      <svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${titleLabel}">
        <defs>
          <linearGradient id="bg-${mode}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#eff7fa"/>
            <stop offset="100%" stop-color="#fff3ea"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="160" rx="24" fill="url(#bg-${mode})" />
        <g opacity="0.22" stroke="${routeColor}" stroke-width="2">
          <path d="M22 28H298" />
          <path d="M22 56H298" />
          <path d="M22 84H298" />
          <path d="M22 112H298" />
          <path d="M34 18V142" />
          <path d="M98 18V142" />
          <path d="M162 18V142" />
          <path d="M226 18V142" />
          <path d="M290 18V142" />
        </g>
        <path d="M42 114C84 84 116 76 154 82C198 90 220 58 258 42" fill="none" stroke="${routeColor}" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 10" />
        <circle cx="54" cy="110" r="12" fill="${pinColor}" />
        <circle cx="54" cy="110" r="5" fill="#fff" />
        <circle cx="264" cy="42" r="16" fill="${routeColor}" opacity="0.96" />
        <circle cx="264" cy="42" r="6" fill="#fff" />
        <g transform="translate(24 96)">
          <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.92)" />
          <g transform="translate(-8 -8) scale(0.5)">
            ${badgeIcon === "plane" ? `
              <path d="M11 26l22-4 1 2-6 2-2 6-2 1 1-6-6 1-3 4-2-1 1-4-5-1 1-2z" fill="${iconColor}" />
            ` : badgeIcon === "family" ? `
              <circle cx="10" cy="8" r="4.5" fill="${iconColor}" />
              <circle cx="22" cy="8" r="4.5" fill="${iconColor}" />
              <circle cx="16" cy="13" r="3.5" fill="${routeColor}" />
            ` : badgeIcon === "couple" ? `
              <circle cx="11" cy="9" r="5" fill="${iconColor}" />
              <circle cx="21" cy="9" r="5" fill="${routeColor}" />
            ` : `
              <circle cx="16" cy="9" r="5" fill="${iconColor}" />
            `}
          </g>
        </g>
        <rect x="180" y="106" width="116" height="28" rx="14" fill="rgba(255,255,255,0.88)" stroke="rgba(20,85,107,0.1)" />
        <text x="188" y="124" fill="#0e4051" font-size="14" font-family="Manrope, sans-serif" font-weight="700">${originLabel}</text>
        <text x="188" y="146" fill="#5d6c75" font-size="12" font-family="Manrope, sans-serif">${destinationLabel}</text>
        <text x="20" y="28" fill="#0e4051" font-size="16" font-family="Manrope, sans-serif" font-weight="800">${titleLabel}</text>
      </svg>
    `;
  }

  function ensureLeafletMap(containerId, options = {}) {
    if (!window.L) return null;
    const existing = registry.get(containerId);
    if (existing?.map) return existing;

    const container = document.getElementById(containerId);
    if (!container) return null;

    const map = L.map(containerId, {
      worldCopyJump: true,
      minZoom: 2,
      zoomControl: false,
      attributionControl: false
    }).setView(options.center || [16, 0], options.zoom || 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    registry.set(containerId, {
      map,
      layers: {
        markers: L.layerGroup().addTo(map),
        routes: L.layerGroup().addTo(map)
      }
    });

    return registry.get(containerId);
  }

  function clearMiniMap(containerId) {
    const entry = registry.get(containerId);
    if (!entry) return;
    entry.layers.markers.clearLayers();
    entry.layers.routes.clearLayers();
  }

  function renderMiniMap(containerId, { points = [], center = null, zoom = 2, showRoutes = true } = {}) {
    const entry = ensureLeafletMap(containerId, { center, zoom });
    if (!entry) return null;

    clearMiniMap(containerId);

    const bounds = [];
    points.forEach((point) => {
      const lat = Number(point.lat);
      const lng = Number(point.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      if (point.iconType || point.markerType || point.icon) {
        const iconType = point.iconType || point.markerType || point.icon;
        const icon = L.divIcon({
          className: "travel-map-marker-wrap",
          html: buildTravelMarkerHtml({
            iconType,
            color: point.color || "#14556b",
            accent: point.accent || "#dd7046"
          }),
          iconSize: [56, 56],
          iconAnchor: [28, 28]
        });
        L.marker([lat, lng], { icon })
          .bindTooltip(point.label || "")
          .addTo(entry.layers.markers);
      } else {
        L.circleMarker([lat, lng], {
          radius: point.radius || 7,
          color: "#ffffff",
          weight: 1,
          fillColor: point.color || "#14556b",
          fillOpacity: 0.84
        })
          .bindTooltip(point.label || "")
          .addTo(entry.layers.markers);
      }

      bounds.push([lat, lng]);
    });

    if (showRoutes && points.length > 1) {
      const routePoints = points
        .filter((point) => Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng)))
        .map((point) => [Number(point.lat), Number(point.lng)]);
      if (routePoints.length > 1) {
        L.polyline(routePoints, {
          color: "#dd7046",
          weight: 2,
          opacity: 0.78,
          dashArray: "8 6"
        }).addTo(entry.layers.routes);
      }
    }

    if (bounds.length) {
      if (bounds.length === 1) {
        entry.map.setView(bounds[0], Math.max(4, zoom), { animate: false });
      } else {
        entry.map.fitBounds(bounds, { animate: false, padding: [18, 18] });
      }
    }

    window.requestAnimationFrame(() => entry.map.invalidateSize());
    return entry.map;
  }

  function invalidateMiniMap(containerId) {
    const entry = registry.get(containerId);
    if (!entry) return;
    window.requestAnimationFrame(() => entry.map.invalidateSize());
  }

  window.TravelMapWidgets = {
    escapeHtml,
    buildTravelMarkerHtml,
    buildMiniMapBadge,
    ensureLeafletMap,
    renderMiniMap,
    invalidateMiniMap,
    clearMiniMap
  };
})();

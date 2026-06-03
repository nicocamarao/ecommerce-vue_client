(() => {
  const travelData = window.TravelData || {};
  const travelAffiliate = window.TravelAffiliateLinks || {};

  const {
    airportCatalog = {},
    countryCatalog = [],
    defaultPackages = [],
    hotelCityCatalog = []
  } = travelData;

  const { buildAffiliateLink = (item) => item.link || "#" } = travelAffiliate;

  const STORAGE_KEY = "travel_site_packages_v4";
  const LEGACY_STORAGE_KEYS = ["travel_site_packages_v3", "travel_site_packages_v2", "travel_site_packages_v1"];
  const PROVIDER_SETTINGS_KEY = "travel_site_provider_settings_v1";
  const ADMIN_PASSWORD = "1234";
  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

  const providerOptionsByType = {
    Hotel: ["booking", "expedia", "agoda"],
    Pasaje: ["skyscanner", "expedia"],
    Crucero: ["cruisedirect"]
  };

  const dom = {
    adminLoginPanel: document.getElementById("adminLoginPanel"),
    adminPassword: document.getElementById("adminPassword"),
    adminUnlockButton: document.getElementById("adminUnlockButton"),
    adminApp: document.getElementById("adminApp"),
    panelButtons: Array.from(document.querySelectorAll("[data-panel-target]")),
    panels: Array.from(document.querySelectorAll(".admin-panel")),
    wizardForm: document.getElementById("wizardForm"),
    wizardItemId: document.getElementById("wizardItemId"),
    wizardType: document.getElementById("wizardType"),
    wizardProvider: document.getElementById("wizardProvider"),
    wizardTitle: document.getElementById("wizardTitle"),
    wizardVisibleLinkLabel: document.getElementById("wizardVisibleLinkLabel"),
    wizardStartDate: document.getElementById("wizardStartDate"),
    wizardEndDate: document.getElementById("wizardEndDate"),
    wizardBasePrice: document.getElementById("wizardBasePrice"),
    wizardFinalPrice: document.getElementById("wizardFinalPrice"),
    wizardOriginCode: document.getElementById("wizardOriginCode"),
    wizardDestinationCode: document.getElementById("wizardDestinationCode"),
    wizardCountry: document.getElementById("wizardCountry"),
    wizardCity: document.getElementById("wizardCity"),
    wizardRegion: document.getElementById("wizardRegion"),
    wizardAdults: document.getElementById("wizardAdults"),
    wizardChildren: document.getElementById("wizardChildren"),
    wizardRooms: document.getElementById("wizardRooms"),
    wizardHotelName: document.getElementById("wizardHotelName"),
    wizardBoardBasis: document.getElementById("wizardBoardBasis"),
    wizardAirline: document.getElementById("wizardAirline"),
    wizardDuration: document.getElementById("wizardDuration"),
    wizardScales: document.getElementById("wizardScales"),
    wizardSummary: document.getElementById("wizardSummary"),
    wizardHighlights: document.getElementById("wizardHighlights"),
    wizardImageUrls: document.getElementById("wizardImageUrls"),
    wizardGenerateLink: document.getElementById("wizardGenerateLink"),
    wizardGeneratedLink: document.getElementById("wizardGeneratedLink"),
    wizardOpenLink: document.getElementById("wizardOpenLink"),
    wizardReset: document.getElementById("wizardReset"),
    wizardGroups: Array.from(document.querySelectorAll("[data-type-group]")),
    adminItemsGrid: document.getElementById("adminItemsGrid"),
    cfgBookingAid: document.getElementById("cfgBookingAid"),
    cfgExpediaCid: document.getElementById("cfgExpediaCid"),
    cfgAgodaCid: document.getElementById("cfgAgodaCid"),
    cfgSkyscannerPartner: document.getElementById("cfgSkyscannerPartner"),
    cfgCruiseAffiliate: document.getElementById("cfgCruiseAffiliate"),
    cfgCampaign: document.getElementById("cfgCampaign"),
    saveProviderSettings: document.getElementById("saveProviderSettings"),
    exportJsonButton: document.getElementById("exportJsonButton"),
    importJsonButton: document.getElementById("importJsonButton"),
    importJsonInput: document.getElementById("importJsonInput"),
    restoreDefaultsButton: document.getElementById("restoreDefaultsButton"),
    storageStatus: document.getElementById("storageStatus"),
    toast: document.getElementById("toast"),
    countrySuggestions: document.getElementById("countrySuggestions"),
    citySuggestions: document.getElementById("citySuggestions"),
    airportSuggestions: document.getElementById("airportSuggestions")
  };

  const state = {
    adminUnlocked: false,
    packages: loadPackages(),
    providerSettings: loadProviderSettings(),
    editingId: null
  };

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("is-open");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      dom.toast.classList.remove("is-open");
    }, 2200);
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function parseLines(value) {
    return String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function parseScales(value) {
    return parseLines(value).map((line) => {
      const [code, label] = line.split("|").map((part) => part.trim());
      return { code: (code || "").toUpperCase(), label: label || code || "" };
    });
  }

  function sanitizePackage(item) {
    return {
      id: item.id || crypto.randomUUID(),
      type: item.type || "Hotel",
      title: item.title || "Promo sin título",
      visibleLinkLabel: item.visibleLinkLabel || "Abrir promo",
      link: item.link || "#",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      basePrice: item.basePrice || item.price || "",
      finalPrice: item.finalPrice || item.price || "",
      originCity: item.originCity || "",
      originCountry: item.originCountry || "",
      originCode: (item.originCode || "").toUpperCase(),
      destinationCode: (item.destinationCode || "").toUpperCase(),
      continent: item.continent || "America del Sur",
      country: item.country || "",
      city: item.city || "",
      region: item.region || "",
      lat: Number.isFinite(Number(item.lat)) ? Number(item.lat) : "",
      lng: Number.isFinite(Number(item.lng)) ? Number(item.lng) : "",
      airline: item.airline || "",
      duration: item.duration || "",
      scales: Array.isArray(item.scales) ? item.scales : [],
      maxAdults: Number(item.maxAdults || 4),
      maxChildren: Number(item.maxChildren || 2),
      childAgeLimit: Number(item.childAgeLimit || 17),
      hotelName: item.hotelName || "",
      boardBasis: item.boardBasis || "",
      themeTag: item.themeTag || "",
      summary: item.summary || "",
      highlights: Array.isArray(item.highlights) ? item.highlights.filter(Boolean) : [],
      images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
      referral: {
        provider: item.referral?.provider || "custom",
        kind: item.referral?.kind || "search",
        affiliateId: item.referral?.affiliateId || "",
        hotelSlug: item.referral?.hotelSlug || "",
        destinationId: item.referral?.destinationId || "",
        destinationType: item.referral?.destinationType || "city",
        rooms: Number(item.referral?.rooms || 1),
        campaign: item.referral?.campaign || "",
        baseUrl: item.referral?.baseUrl || "",
        customParams: item.referral?.customParams || {}
      }
    };
  }

  function isStablePackageList(list) {
    if (!Array.isArray(list) || !list.length) return false;
    return list.every((item) => item && typeof item === "object" && typeof item.title === "string");
  }

  function getDefaultPackages() {
    return defaultPackages.map(sanitizePackage);
  }

  function loadPackages() {
    const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : parsed?.packages;
        if (!isStablePackageList(list)) continue;
        return list.map(sanitizePackage);
      } catch (error) {
        continue;
      }
    }
    return getDefaultPackages();
  }

  function savePackages() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.packages));
    renderStorageStatus();
  }

  function loadProviderSettings() {
    const defaults = {
      bookingAid: "",
      expediaCid: "",
      agodaCid: "",
      skyscannerPartner: "",
      cruiseAffiliate: "",
      campaign: "travel_site_admin"
    };

    try {
      const raw = localStorage.getItem(PROVIDER_SETTINGS_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    } catch (error) {
      return defaults;
    }
  }

  function saveProviderSettings() {
    localStorage.setItem(PROVIDER_SETTINGS_KEY, JSON.stringify(state.providerSettings));
  }

  function fillProviderSettingsForm() {
    dom.cfgBookingAid.value = state.providerSettings.bookingAid;
    dom.cfgExpediaCid.value = state.providerSettings.expediaCid;
    dom.cfgAgodaCid.value = state.providerSettings.agodaCid;
    dom.cfgSkyscannerPartner.value = state.providerSettings.skyscannerPartner;
    dom.cfgCruiseAffiliate.value = state.providerSettings.cruiseAffiliate;
    dom.cfgCampaign.value = state.providerSettings.campaign;
  }

  function renderStorageStatus() {
    dom.storageStatus.textContent = `${state.packages.length} promos guardadas`;
  }

  function setAdminVisibility() {
    dom.adminApp.classList.toggle("is-hidden", !state.adminUnlocked);
    dom.adminLoginPanel.style.display = state.adminUnlocked ? "none" : "grid";
  }

  function setActivePanel(panelId) {
    dom.panelButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.panelTarget === panelId);
    });
    dom.panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === panelId);
    });
  }

  function getProviderLabel(provider) {
    const labels = {
      booking: "Booking",
      expedia: "Expedia",
      agoda: "Agoda",
      skyscanner: "Skyscanner",
      cruisedirect: "CruiseDirect"
    };
    return labels[provider] || provider;
  }

  function updateProviderOptions() {
    const type = dom.wizardType.value;
    const providers = providerOptionsByType[type] || ["booking"];
    dom.wizardProvider.innerHTML = providers
      .map((provider) => `<option value="${provider}">${getProviderLabel(provider)}</option>`)
      .join("");
  }

  function updateTypeVisibility() {
    const type = dom.wizardType.value;
    dom.wizardGroups.forEach((group) => {
      group.classList.toggle("is-active", group.dataset.typeGroup === type);
    });
  }

  function getCountryByName(name) {
    const target = normalizeText(name);
    return countryCatalog.find((entry) => normalizeText(entry.name) === target);
  }

  function resolveCoords({ city, country, destinationCode }) {
    const code = String(destinationCode || "").toUpperCase();
    if (code && airportCatalog[code]) return [airportCatalog[code].lat, airportCatalog[code].lng];

    const cityMatch = hotelCityCatalog.find(
      (entry) => normalizeText(entry.city) === normalizeText(city) && normalizeText(entry.country) === normalizeText(country)
    );
    if (cityMatch) return [cityMatch.lat, cityMatch.lng];

    const countryMatch = getCountryByName(country);
    if (countryMatch?.latlng?.length >= 2) return [countryMatch.latlng[0], countryMatch.latlng[1]];

    return ["", ""];
  }

  function getReferralFromWizard(type, provider) {
    const settings = state.providerSettings;
    const rooms = Number(dom.wizardRooms.value || 1);

    if (type === "Hotel" && provider === "booking") {
      return {
        provider,
        kind: "search",
        affiliateId: settings.bookingAid || "",
        destinationId: "",
        destinationType: "city",
        rooms,
        campaign: settings.campaign || "travel_site_admin",
        baseUrl: ""
      };
    }

    if (type === "Hotel" && provider === "expedia") {
      return {
        provider,
        kind: "hotel",
        affiliateId: settings.expediaCid || "",
        destinationId: "",
        destinationType: "city",
        rooms,
        campaign: settings.campaign || "travel_site_admin",
        baseUrl: ""
      };
    }

    if (type === "Hotel" && provider === "agoda") {
      return {
        provider,
        kind: "hotel",
        affiliateId: settings.agodaCid || "",
        destinationId: "",
        destinationType: "city",
        rooms,
        campaign: settings.campaign || "travel_site_admin",
        baseUrl: ""
      };
    }

    if (type === "Pasaje" && provider === "skyscanner") {
      return {
        provider,
        kind: "flight",
        affiliateId: settings.skyscannerPartner || "",
        destinationId: "",
        destinationType: "city",
        rooms: 1,
        campaign: settings.campaign || "travel_site_admin",
        baseUrl: ""
      };
    }

    if (type === "Pasaje" && provider === "expedia") {
      return {
        provider,
        kind: "flight",
        affiliateId: settings.expediaCid || "",
        destinationId: "",
        destinationType: "city",
        rooms: 1,
        campaign: settings.campaign || "travel_site_admin",
        baseUrl: "https://www.expedia.com/Flights-Search"
      };
    }

    return {
      provider: "cruisedirect",
      kind: "cruise",
      affiliateId: settings.cruiseAffiliate || "",
      destinationId: "",
      destinationType: "region",
      rooms: 1,
      campaign: settings.campaign || "travel_site_admin",
      baseUrl: ""
    };
  }

  function buildDraftItem() {
    const type = dom.wizardType.value;
    const provider = dom.wizardProvider.value;
    const [lat, lng] = resolveCoords({
      city: dom.wizardCity.value,
      country: dom.wizardCountry.value,
      destinationCode: dom.wizardDestinationCode.value
    });

    return sanitizePackage({
      id: state.editingId || crypto.randomUUID(),
      type,
      title: dom.wizardTitle.value.trim(),
      visibleLinkLabel: dom.wizardVisibleLinkLabel.value.trim() || `LINK ${provider.toUpperCase()}`,
      link: dom.wizardGeneratedLink.value.trim() || "#",
      startDate: dom.wizardStartDate.value,
      endDate: dom.wizardEndDate.value,
      basePrice: dom.wizardBasePrice.value.trim(),
      finalPrice: dom.wizardFinalPrice.value.trim(),
      originCity: "",
      originCountry: "",
      originCode: dom.wizardOriginCode.value.trim().toUpperCase(),
      destinationCode: dom.wizardDestinationCode.value.trim().toUpperCase(),
      continent: "America del Sur",
      country: dom.wizardCountry.value.trim(),
      city: dom.wizardCity.value.trim(),
      region: dom.wizardRegion.value.trim(),
      lat,
      lng,
      airline: dom.wizardAirline.value.trim(),
      duration: dom.wizardDuration.value.trim(),
      scales: parseScales(dom.wizardScales.value),
      maxAdults: Number(dom.wizardAdults.value || 4),
      maxChildren: Number(dom.wizardChildren.value || 2),
      childAgeLimit: 17,
      hotelName: dom.wizardHotelName.value.trim(),
      boardBasis: dom.wizardBoardBasis.value.trim(),
      themeTag: type,
      summary: dom.wizardSummary.value.trim(),
      highlights: parseLines(dom.wizardHighlights.value),
      images: parseLines(dom.wizardImageUrls.value),
      referral: getReferralFromWizard(type, provider)
    });
  }

  function fallbackBookingShortcut(item) {
    const url = new URL("https://www.booking.com/searchresults.html");
    if (item.city || item.country) url.searchParams.set("ss", [item.city, item.country].filter(Boolean).join(", "));
    if (item.startDate) url.searchParams.set("checkin", item.startDate);
    if (item.endDate) url.searchParams.set("checkout", item.endDate);
    url.searchParams.set("group_adults", String(Math.max(1, Number(dom.wizardAdults.value || 2))));
    if (Number(dom.wizardChildren.value || 0) > 0) {
      url.searchParams.set("group_children", String(Number(dom.wizardChildren.value || 0)));
    }
    url.searchParams.set("no_rooms", String(Math.max(1, Number(dom.wizardRooms.value || 1))));
    return url.toString();
  }

  function generateWizardLink() {
    const item = buildDraftItem();
    const search = {
      startDate: item.startDate,
      endDate: item.endDate,
      adults: Number(dom.wizardAdults.value || 2),
      children: Number(dom.wizardChildren.value || 0)
    };

    let link = buildAffiliateLink(item, search) || item.link;
    if (!link || link === "#") {
      if (dom.wizardProvider.value === "booking") link = fallbackBookingShortcut(item);
    }

    dom.wizardGeneratedLink.value = link;
    dom.wizardOpenLink.href = link || "#";
    return link;
  }

  function clearWizard() {
    dom.wizardForm.reset();
    state.editingId = null;
    dom.wizardItemId.value = "";
    dom.wizardVisibleLinkLabel.value = "";
    dom.wizardGeneratedLink.value = "";
    dom.wizardOpenLink.href = "#";
    dom.wizardAdults.value = "2";
    dom.wizardChildren.value = "0";
    dom.wizardRooms.value = "1";
    dom.wizardType.value = "Hotel";
    updateProviderOptions();
    updateTypeVisibility();
  }

  function fillWizard(item) {
    state.editingId = item.id;
    dom.wizardItemId.value = item.id;
    dom.wizardType.value = item.type === "Crucero" || item.type === "Pasaje" || item.type === "Hotel" ? item.type : "Hotel";
    updateProviderOptions();
    dom.wizardProvider.value = item.referral?.provider || dom.wizardProvider.value;
    updateTypeVisibility();
    dom.wizardTitle.value = item.title;
    dom.wizardVisibleLinkLabel.value = item.visibleLinkLabel || "";
    dom.wizardStartDate.value = item.startDate || "";
    dom.wizardEndDate.value = item.endDate || "";
    dom.wizardBasePrice.value = item.basePrice || "";
    dom.wizardFinalPrice.value = item.finalPrice || "";
    dom.wizardOriginCode.value = item.originCode || "";
    dom.wizardDestinationCode.value = item.destinationCode || "";
    dom.wizardCountry.value = item.country || "";
    dom.wizardCity.value = item.city || "";
    dom.wizardRegion.value = item.region || "";
    dom.wizardAdults.value = String(item.maxAdults || 2);
    dom.wizardChildren.value = String(item.maxChildren || 0);
    dom.wizardRooms.value = String(item.referral?.rooms || 1);
    dom.wizardHotelName.value = item.hotelName || "";
    dom.wizardBoardBasis.value = item.boardBasis || "";
    dom.wizardAirline.value = item.airline || "";
    dom.wizardDuration.value = item.duration || "";
    dom.wizardScales.value = (item.scales || []).map((scale) => `${scale.code}${scale.label ? ` | ${scale.label}` : ""}`).join("\n");
    dom.wizardSummary.value = item.summary || "";
    dom.wizardHighlights.value = (item.highlights || []).join("\n");
    dom.wizardImageUrls.value = (item.images || []).join("\n");
    dom.wizardGeneratedLink.value = item.link || "";
    dom.wizardOpenLink.href = item.link || "#";
    setActivePanel("wizardPanel");
  }

  function renderItems() {
    if (!state.packages.length) {
      dom.adminItemsGrid.innerHTML = `<div class="empty-state">No hay promos cargadas.</div>`;
      return;
    }

    dom.adminItemsGrid.innerHTML = state.packages
      .map((item) => {
        return `
          <article class="admin-card">
            <div class="card-visual">
              <img src="${item.images?.[0] || PLACEHOLDER_IMAGE}" alt="${item.title}" />
              <div class="card-badge">${item.type}</div>
            </div>
            <div class="card-meta">${item.city || "-"}, ${item.country || "-"}</div>
            <h3>${item.title}</h3>
            <p>${item.finalPrice || item.basePrice || "-"} · ${(item.referral?.provider || "custom").toUpperCase()}</p>
            <div class="package-links">
              <a class="is-primary is-link-cta" href="${item.link}" target="_blank" rel="noreferrer">${item.visibleLinkLabel || "Abrir link"}</a>
            </div>
            <div class="admin-card__actions">
              <button type="button" class="mini-button mini-button--edit" data-edit-id="${item.id}">Editar</button>
              <button type="button" class="mini-button mini-button--delete" data-delete-id="${item.id}">Borrar</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function exportPackages() {
    const payload = {
      exportedAt: new Date().toISOString(),
      packages: state.packages
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "travel-site-promos.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Exportación lista.");
  }

  async function importPackages(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed?.packages;
      if (!Array.isArray(list)) throw new Error("Formato inválido");
      state.packages = list.map(sanitizePackage);
      savePackages();
      renderItems();
      showToast("Importación completada.");
    } catch (error) {
      showToast("No se pudo importar JSON.");
    }
  }

  function restoreDefaults() {
    state.packages = getDefaultPackages();
    savePackages();
    renderItems();
    showToast("Ejemplos restaurados.");
  }

  function bindEvents() {
    dom.adminUnlockButton.addEventListener("click", () => {
      if (dom.adminPassword.value !== ADMIN_PASSWORD) {
        showToast("Password incorrecta.");
        return;
      }
      state.adminUnlocked = true;
      setAdminVisibility();
      showToast("Admin desbloqueado.");
    });

    dom.adminPassword.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        dom.adminUnlockButton.click();
      }
    });

    dom.panelButtons.forEach((button) => {
      button.addEventListener("click", () => setActivePanel(button.dataset.panelTarget));
    });

    dom.wizardType.addEventListener("change", () => {
      updateProviderOptions();
      updateTypeVisibility();
      generateWizardLink();
    });

    dom.wizardProvider.addEventListener("change", generateWizardLink);

    [
      dom.wizardStartDate,
      dom.wizardEndDate,
      dom.wizardOriginCode,
      dom.wizardDestinationCode,
      dom.wizardCountry,
      dom.wizardCity,
      dom.wizardAdults,
      dom.wizardChildren,
      dom.wizardRooms
    ].forEach((input) => {
      input.addEventListener("input", generateWizardLink);
    });

    dom.wizardGenerateLink.addEventListener("click", () => {
      const link = generateWizardLink();
      if (!link || link === "#") showToast("No se pudo generar link.");
      else showToast("Link generado.");
    });

    dom.wizardReset.addEventListener("click", clearWizard);

    dom.wizardForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const link = dom.wizardGeneratedLink.value.trim() || generateWizardLink();
      const payload = buildDraftItem();
      payload.link = link || payload.link;

      if (!payload.title || !payload.city || !payload.country) {
        showToast("Completa título, país y ciudad.");
        return;
      }

      const index = state.packages.findIndex((entry) => entry.id === payload.id);
      if (index >= 0) state.packages[index] = payload;
      else state.packages.unshift(payload);

      savePackages();
      renderItems();
      clearWizard();
      setActivePanel("listPanel");
      showToast(index >= 0 ? "Promo actualizada." : "Promo creada.");
    });

    document.body.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-id]");
      if (editButton) {
        const item = state.packages.find((entry) => entry.id === editButton.dataset.editId);
        if (item) fillWizard(item);
        return;
      }

      const deleteButton = event.target.closest("[data-delete-id]");
      if (deleteButton) {
        const id = deleteButton.dataset.deleteId;
        state.packages = state.packages.filter((entry) => entry.id !== id);
        savePackages();
        renderItems();
        showToast("Promo eliminada.");
      }
    });

    dom.saveProviderSettings.addEventListener("click", () => {
      state.providerSettings = {
        bookingAid: dom.cfgBookingAid.value.trim(),
        expediaCid: dom.cfgExpediaCid.value.trim(),
        agodaCid: dom.cfgAgodaCid.value.trim(),
        skyscannerPartner: dom.cfgSkyscannerPartner.value.trim(),
        cruiseAffiliate: dom.cfgCruiseAffiliate.value.trim(),
        campaign: dom.cfgCampaign.value.trim() || "travel_site_admin"
      };
      saveProviderSettings();
      generateWizardLink();
      showToast("Configuración guardada.");
    });

    dom.exportJsonButton.addEventListener("click", exportPackages);
    dom.importJsonButton.addEventListener("click", () => dom.importJsonInput.click());
    dom.importJsonInput.addEventListener("change", async (event) => {
      await importPackages(event.target.files?.[0]);
      dom.importJsonInput.value = "";
    });
    dom.restoreDefaultsButton.addEventListener("click", restoreDefaults);
  }

  function renderSuggestions() {
    dom.countrySuggestions.innerHTML = countryCatalog.map((country) => `<option value="${country.name}"></option>`).join("");
    dom.citySuggestions.innerHTML = hotelCityCatalog.map((city) => `<option value="${city.city}">${city.country}</option>`).join("");
    dom.airportSuggestions.innerHTML = Object.values(airportCatalog)
      .map((airport) => `<option value="${airport.code}">${airport.city}, ${airport.country}</option>`)
      .join("");
  }

  function init() {
    renderSuggestions();
    setAdminVisibility();
    updateProviderOptions();
    updateTypeVisibility();
    fillProviderSettingsForm();
    renderItems();
    renderStorageStatus();
    bindEvents();
    clearWizard();
    savePackages();
  }

  init();
})();

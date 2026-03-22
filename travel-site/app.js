(() => {
const travelData = window.TravelData || {};
const travelAffiliateLinks = window.TravelAffiliateLinks || {};
const travelI18n = window.TravelI18n || {};

const {
  airportCatalog = {},
  bookingQuickHotels = [],
  countryCatalog = [],
  defaultPackages = [],
  exoticPlaces = [],
  hotelCityCatalog = [],
  themes = {},
  tips = []
} = travelData;

const {
  buildAffiliateLink = (item) => item.link || "#",
  inspectAffiliateLink = () => ({ provider: "Custom", kind: "search", url: "#", hostname: "", pathname: "", params: {} }),
  referralProviders = {}
} = travelAffiliateLinks;

const { translations = { es: {} } } = travelI18n;

const STORAGE_KEY = "travel_site_packages_v4";
const LEGACY_STORAGE_KEYS = ["travel_site_packages_v3", "travel_site_packages_v2", "travel_site_packages_v1"];
const SETTINGS_KEY = "travel_site_settings_v2";
const ADMIN_PASSWORD = "1234";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

const state = {
  packages: loadPackages(),
  filteredPackages: [],
  countries: normalizeCountries(countryCatalog),
  countryFilter: "All",
  countrySearch: "",
  adminUnlocked: false,
  editingId: null,
  editingImages: [],
  settings: loadSettings(),
  map: null,
  layers: {
    packages: null,
    countries: null,
    routes: null
  }
};

const dom = {
  languageSelect: document.getElementById("languageSelect"),
  themeSwatches: Array.from(document.querySelectorAll("[data-theme]")),
  heroPackagesCount: document.getElementById("heroPackagesCount"),
  heroCountriesCount: document.getElementById("heroCountriesCount"),
  searchOrigin: document.getElementById("searchOrigin"),
  searchDestination: document.getElementById("searchDestination"),
  searchStartDate: document.getElementById("searchStartDate"),
  searchEndDate: document.getElementById("searchEndDate"),
  searchAdults: document.getElementById("searchAdults"),
  searchChildren: document.getElementById("searchChildren"),
  childrenAges: document.getElementById("childrenAges"),
  clearSearchButton: document.getElementById("clearSearchButton"),
  bookingShortcutButton: document.getElementById("bookingShortcutButton"),
  searchSummary: document.getElementById("searchSummary"),
  miniBookingDestination: document.getElementById("miniBookingDestination"),
  miniBookingCountry: document.getElementById("miniBookingCountry"),
  miniBookingCheckin: document.getElementById("miniBookingCheckin"),
  miniBookingCheckout: document.getElementById("miniBookingCheckout"),
  miniBookingAdults: document.getElementById("miniBookingAdults"),
  miniBookingChildren: document.getElementById("miniBookingChildren"),
  miniBookingRooms: document.getElementById("miniBookingRooms"),
  miniBookingProvider: document.getElementById("miniBookingProvider"),
  miniBookingDestId: document.getElementById("miniBookingDestId"),
  miniBookingReset: document.getElementById("miniBookingReset"),
  miniBookingSummary: document.getElementById("miniBookingSummary"),
  miniBookingResults: document.getElementById("miniBookingResults"),
  bookingQuickGrid: document.getElementById("bookingQuickGrid"),
  resultsCount: document.getElementById("resultsCount"),
  packagesGrid: document.getElementById("packagesGrid"),
  mapSidebar: document.getElementById("mapSidebar"),
  exoticGrid: document.getElementById("exoticGrid"),
  tipsGrid: document.getElementById("tipsGrid"),
  continentFilters: document.getElementById("continentFilters"),
  countrySearch: document.getElementById("countrySearch"),
  countriesGrid: document.getElementById("countriesGrid"),
  togglePackagesLayer: document.getElementById("togglePackagesLayer"),
  toggleCountriesLayer: document.getElementById("toggleCountriesLayer"),
  toggleRoutesLayer: document.getElementById("toggleRoutesLayer"),
  adminLoginPanel: document.getElementById("adminLoginPanel"),
  adminPassword: document.getElementById("adminPassword"),
  adminUnlockButton: document.getElementById("adminUnlockButton"),
  adminApp: document.getElementById("adminApp"),
  newItemButton: document.getElementById("newItemButton"),
  saveStorageButton: document.getElementById("saveStorageButton"),
  exportJsonButton: document.getElementById("exportJsonButton"),
  importJsonButton: document.getElementById("importJsonButton"),
  importJsonInput: document.getElementById("importJsonInput"),
  restoreDefaultsButton: document.getElementById("restoreDefaultsButton"),
  storageStatus: document.getElementById("storageStatus"),
  countrySuggestions: document.getElementById("countrySuggestions"),
  citySuggestions: document.getElementById("citySuggestions"),
  airportSuggestions: document.getElementById("airportSuggestions"),
  adminForm: document.getElementById("adminForm"),
  imagePreview: document.getElementById("imagePreview"),
  adminList: document.getElementById("adminList"),
  modal: document.getElementById("modal"),
  toast: document.getElementById("toast")
};

dom.childrenAgesField = dom.childrenAges?.closest(".field") || null;

const fields = {
  itemId: document.getElementById("itemId"),
  itemType: document.getElementById("itemType"),
  itemTitle: document.getElementById("itemTitle"),
  itemVisibleLinkLabel: document.getElementById("itemVisibleLinkLabel"),
  itemLink: document.getElementById("itemLink"),
  itemStartDate: document.getElementById("itemStartDate"),
  itemEndDate: document.getElementById("itemEndDate"),
  itemBasePrice: document.getElementById("itemBasePrice"),
  itemFinalPrice: document.getElementById("itemFinalPrice"),
  itemOriginCity: document.getElementById("itemOriginCity"),
  itemOriginCountry: document.getElementById("itemOriginCountry"),
  itemOriginCode: document.getElementById("itemOriginCode"),
  itemDestinationCode: document.getElementById("itemDestinationCode"),
  itemContinent: document.getElementById("itemContinent"),
  itemCountry: document.getElementById("itemCountry"),
  itemCity: document.getElementById("itemCity"),
  itemRegion: document.getElementById("itemRegion"),
  itemLat: document.getElementById("itemLat"),
  itemLng: document.getElementById("itemLng"),
  itemAirline: document.getElementById("itemAirline"),
  itemDuration: document.getElementById("itemDuration"),
  itemScales: document.getElementById("itemScales"),
  itemReferralProvider: document.getElementById("itemReferralProvider"),
  itemReferralKind: document.getElementById("itemReferralKind"),
  itemAffiliateId: document.getElementById("itemAffiliateId"),
  itemReferralHotelSlug: document.getElementById("itemReferralHotelSlug"),
  itemReferralDestinationId: document.getElementById("itemReferralDestinationId"),
  itemReferralDestinationType: document.getElementById("itemReferralDestinationType"),
  itemReferralRooms: document.getElementById("itemReferralRooms"),
  itemReferralCampaign: document.getElementById("itemReferralCampaign"),
  itemReferralBaseUrl: document.getElementById("itemReferralBaseUrl"),
  itemMaxAdults: document.getElementById("itemMaxAdults"),
  itemMaxChildren: document.getElementById("itemMaxChildren"),
  itemChildAgeLimit: document.getElementById("itemChildAgeLimit"),
  itemHotelName: document.getElementById("itemHotelName"),
  itemBoardBasis: document.getElementById("itemBoardBasis"),
  itemThemeTag: document.getElementById("itemThemeTag"),
  itemSummary: document.getElementById("itemSummary"),
  itemHighlights: document.getElementById("itemHighlights"),
  itemImageUrls: document.getElementById("itemImageUrls"),
  itemImages: document.getElementById("itemImages"),
  itemReplaceImages: document.getElementById("itemReplaceImages"),
  resetFormButton: document.getElementById("resetFormButton")
};

function loadPackages() {
  const storageKeys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];

  for (const key of storageKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed?.packages;
      if (!Array.isArray(list) || !list.length) continue;
      if (!isStablePackageList(list)) continue;
      const sanitized = list.map(sanitizePackage).filter((item) => item.title && item.link !== undefined);
      if (sanitized.length) return sanitized;
    } catch (error) {
      continue;
    }
  }

  return getDefaultPackages();
}

function isStablePackageList(list) {
  if (!Array.isArray(list) || !list.length) return false;
  return list.every((item) => {
    if (!item || typeof item !== "object") return false;
    const hasTitle = typeof item.title === "string" && item.title.trim().length > 0;
    const hasLink = typeof item.link === "string" || typeof item.link === "undefined";
    const hasLocation = typeof item.city === "string" || typeof item.country === "string" || typeof item.destinationCode === "string";
    return hasTitle && hasLink && hasLocation;
  });
}

function getDefaultPackages() {
  return defaultPackages.map(sanitizePackage);
}

function loadSettings() {
  const browserLang = (navigator.language || "es").toLowerCase();
  const autoLang = browserLang.startsWith("pt") ? "pt" : browserLang.startsWith("en") ? "en" : "es";
  const validLangs = new Set(["es", "en", "pt"]);

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const lang = validLangs.has(parsed?.lang) ? parsed.lang : autoLang;
    const theme = parsed?.theme && themes[parsed.theme] ? parsed.theme : "ocean";
    return {
      lang,
      theme
    };
  } catch (error) {
    return { lang: autoLang, theme: "ocean" };
  }
}

function savePackages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.packages));
  renderStorageStatus();
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function sanitizePackage(item) {
  return {
    id: item.id || crypto.randomUUID(),
    type: item.type || "Paquete",
    title: item.title || "Promo sin título",
    visibleLinkLabel: item.visibleLinkLabel || "Abrir link",
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
    scales: normalizeScales(item.scales),
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

function normalizeScales(scales) {
  if (!Array.isArray(scales)) return [];
  return scales
    .map((item) => {
      if (typeof item === "string") {
        const [code, label] = item.split("|").map((part) => part.trim());
        return {
          code: (code || "").toUpperCase(),
          label: label || code || ""
        };
      }
      return {
        code: (item.code || "").toUpperCase(),
        label: item.label || item.code || ""
      };
    })
    .filter((item) => item.code || item.label);
}

function normalizeCountries(rawList) {
  return rawList
    .map((entry) => {
      const name = typeof entry.name === "string" ? entry.name : entry.name?.common;
      if (!name) return null;
      return {
        name,
        cca2: entry.cca2 || "",
        region: entry.region || "Other",
        subregion: entry.subregion || "",
        capital: Array.isArray(entry.capital) ? entry.capital : [],
        latlng: Array.isArray(entry.latlng) ? entry.latlng : [0, 0],
        flags: entry.flags || {},
        translations: entry.translations || {}
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getTranslation(key) {
  return translations[state.settings.lang]?.[key] || translations.es[key] || key;
}

function applyTranslations() {
  document.documentElement.lang = state.settings.lang;
  dom.languageSelect.value = state.settings.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = getTranslation(node.dataset.i18n);
  });
  applyTranslatedPlaceholders();
}

function applyTranslatedPlaceholders() {
  dom.searchOrigin.placeholder = state.settings.lang === "en" ? "Ex: Montevideo or MVD" : state.settings.lang === "pt" ? "Ex: Montevidéu ou MVD" : "Ej: Montevideo o MVD";
  dom.searchDestination.placeholder = state.settings.lang === "en" ? "Ex: Rio, Chile, Madrid" : state.settings.lang === "pt" ? "Ex: Rio, Chile, Madri" : "Ej: Rio, Chile, Madrid";
  dom.countrySearch.placeholder = state.settings.lang === "en" ? "Ex: Peru, Tokyo, Oceania" : state.settings.lang === "pt" ? "Ex: Peru, Tóquio, Oceania" : "Ej: Peru, Tokyo, Oceania";
  dom.miniBookingDestination.placeholder = state.settings.lang === "en" ? "Ex: Madrid, Punta del Este, Bangkok" : state.settings.lang === "pt" ? "Ex: Madri, Punta del Este, Bangkok" : "Ej: Madrid, Punta del Este, Bangkok";
  dom.miniBookingCountry.placeholder = state.settings.lang === "en" ? "Ex: Spain" : state.settings.lang === "pt" ? "Ex: Espanha" : "Ej: España";
  dom.miniBookingDestId.placeholder = state.settings.lang === "en" ? "Ex: -390625. If missing, ss text is used." : state.settings.lang === "pt" ? "Ex: -390625. Se faltar, usa ss por texto." : "Ej: -390625. Si falta, se usa ss con texto.";
}

function applyTheme() {
  const theme = themes[state.settings.theme] || themes.ocean;
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  dom.themeSwatches.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === state.settings.theme);
  });
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "Fechas a definir";
  if (startDate && endDate) return `${startDate} → ${endDate}`;
  return startDate || endDate;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function encodeImageList(images) {
  return encodeURIComponent(JSON.stringify(images));
}

function decodeImageList(raw) {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw || ""));
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function updateImageCarousel(node, index) {
  if (!node) return;
  const images = decodeImageList(node.dataset.images);
  if (!images.length) return;
  const safeIndex = (index + images.length) % images.length;
  node.dataset.index = String(safeIndex);
  const image = node.querySelector("[data-carousel-image]");
  if (image) image.src = images[safeIndex];
  const counter = node.querySelector("[data-carousel-counter]");
  if (counter) counter.textContent = `${safeIndex + 1} / ${images.length}`;
}

function moveImageCarousel(node, step) {
  if (!node) return;
  const current = Number(node.dataset.index || 0);
  updateImageCarousel(node, current + step);
}

function buildBookingSearchUrl({
  destinationText,
  destinationId = "",
  checkin = "",
  checkout = "",
  adults = 2,
  children = 0,
  rooms = 1
}) {
  const url = new URL("https://www.booking.com/searchresults.html");
  if (destinationId) {
    url.searchParams.set("dest_id", destinationId);
    url.searchParams.set("dest_type", "city");
  } else if (destinationText) {
    url.searchParams.set("ss", destinationText);
  }
  if (checkin) url.searchParams.set("checkin", checkin);
  if (checkout) url.searchParams.set("checkout", checkout);
  url.searchParams.set("group_adults", String(Math.max(1, Number(adults || 1))));
  if (Number(children || 0) > 0) {
    url.searchParams.set("group_children", String(Number(children || 0)));
  }
  url.searchParams.set("no_rooms", String(Math.max(1, Number(rooms || 1))));
  return url.toString();
}

function getSearchState() {
  const childInputs = Array.from(dom.childrenAges.querySelectorAll("input"));
  return {
    origin: normalizeText(dom.searchOrigin.value),
    destination: normalizeText(dom.searchDestination.value),
    startDate: dom.searchStartDate.value,
    endDate: dom.searchEndDate.value,
    adults: Number(dom.searchAdults.value || 1),
    children: Number(dom.searchChildren.value || 0),
    childAges: childInputs.map((input) => Number(input.value || 0)).filter((value) => Number.isFinite(value))
  };
}

function buildChildAgeInputs() {
  const count = Number(dom.searchChildren.value || 0);
  if (dom.childrenAgesField) {
    dom.childrenAgesField.classList.toggle("is-hidden", count < 1);
  }
  dom.childrenAges.innerHTML = "";
  for (let index = 0; index < count; index += 1) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "18";
    input.placeholder = `Edad ${index + 1}`;
    input.dataset.childAge = String(index);
    input.addEventListener("input", renderAll);
    dom.childrenAges.appendChild(input);
  }
}

function buildBookingShortcutUrl() {
  const filters = getSearchState();
  const destination = dom.searchDestination.value.trim();
  return buildBookingSearchUrl({
    destinationText: destination,
    checkin: filters.startDate,
    checkout: filters.endDate,
    adults: filters.adults,
    children: filters.children,
    rooms: 1
  });
}

function packageMatchesFilters(item, filters) {
  const originHaystack = normalizeText([item.originCity, item.originCountry, item.originCode].join(" "));
  const destinationHaystack = normalizeText([item.city, item.country, item.region, item.title, item.destinationCode].join(" "));

  if (filters.origin && !originHaystack.includes(filters.origin)) return false;
  if (filters.destination && !destinationHaystack.includes(filters.destination)) return false;

  if (filters.startDate) {
    if (item.startDate && item.startDate > filters.startDate) return false;
    if (item.endDate && item.endDate < filters.startDate) return false;
  }

  if (filters.endDate) {
    if (item.startDate && item.startDate > filters.endDate) return false;
    if (item.endDate && item.endDate < filters.endDate) return false;
  }

  if (filters.adults > item.maxAdults) return false;
  if (filters.children > item.maxChildren) return false;
  if (filters.childAges.some((age) => age > item.childAgeLimit)) return false;

  return true;
}

function resolvePackageCoords(item) {
  if (Number.isFinite(item.lat) && Number.isFinite(item.lng) && item.lat !== "" && item.lng !== "") {
    return [item.lat, item.lng];
  }

  if (item.destinationCode && airportCatalog[item.destinationCode]) {
    return [airportCatalog[item.destinationCode].lat, airportCatalog[item.destinationCode].lng];
  }

  const hotelCity = hotelCityCatalog.find((entry) =>
    normalizeText(entry.city) === normalizeText(item.city) &&
    normalizeText(entry.country) === normalizeText(item.country)
  );
  if (hotelCity) return [hotelCity.lat, hotelCity.lng];

  const country = state.countries.find((entry) => normalizeText(entry.name) === normalizeText(item.country));
  if (country?.latlng?.length >= 2) return [country.latlng[0], country.latlng[1]];

  return null;
}

function resolveRoutePoints(item) {
  const points = [];
  const originCode = item.originCode?.toUpperCase();
  if (originCode && airportCatalog[originCode]) {
    points.push([airportCatalog[originCode].lat, airportCatalog[originCode].lng]);
  } else if (item.originCountry) {
    const originCountry = state.countries.find((entry) => normalizeText(entry.name) === normalizeText(item.originCountry));
    if (originCountry?.latlng?.length >= 2) {
      points.push([originCountry.latlng[0], originCountry.latlng[1]]);
    }
  }

  item.scales.forEach((scale) => {
    if (scale.code && airportCatalog[scale.code]) {
      points.push([airportCatalog[scale.code].lat, airportCatalog[scale.code].lng]);
    }
  });

  const destinationCode = item.destinationCode?.toUpperCase();
  if (destinationCode && airportCatalog[destinationCode]) {
    points.push([airportCatalog[destinationCode].lat, airportCatalog[destinationCode].lng]);
  } else {
    const destinationCoords = resolvePackageCoords(item);
    if (destinationCoords) points.push(destinationCoords);
  }

  return points.filter((point) => Array.isArray(point) && point.every((value) => Number.isFinite(value)));
}

function getLocalizedCountryName(country) {
  if (state.settings.lang === "pt") return country.translations?.por?.common || country.name;
  if (state.settings.lang === "en") return country.name;
  return country.translations?.spa?.common || country.name;
}

function buildSearchSummary(filters) {
  const bits = [];
  if (filters.origin) bits.push(`${getTranslation("field_origin")}: ${dom.searchOrigin.value.trim()}`);
  if (filters.destination) bits.push(`${getTranslation("field_destination")}: ${dom.searchDestination.value.trim()}`);
  if (filters.startDate || filters.endDate) bits.push(`${formatDateRange(filters.startDate, filters.endDate)}`);
  bits.push(`${filters.adults} ${getTranslation("field_adults").toLowerCase()}`);
  if (filters.children) bits.push(`${filters.children} ${getTranslation("field_children").toLowerCase()}`);
  return bits.join(" · ");
}

function getMiniBookingState() {
  return {
    destination: dom.miniBookingDestination.value.trim(),
    country: dom.miniBookingCountry.value.trim(),
    checkin: dom.miniBookingCheckin.value,
    checkout: dom.miniBookingCheckout.value,
    adults: Number(dom.miniBookingAdults.value || 2),
    children: Number(dom.miniBookingChildren.value || 0),
    rooms: Number(dom.miniBookingRooms.value || 1),
    provider: dom.miniBookingProvider.value,
    bookingDestId: dom.miniBookingDestId.value.trim()
  };
}

function buildMiniBookingItems() {
  const search = getMiniBookingState();
  const destinationText = [search.destination, search.country].filter(Boolean).join(", ");
  renderBookingQuickGrid(search);

  if (!destinationText) {
    dom.miniBookingSummary.textContent = getTranslation("mini_booking_incomplete_summary");
    dom.miniBookingResults.innerHTML = `<div class="empty-state">${getTranslation("mini_booking_incomplete_body")}</div>`;
    return;
  }

  dom.miniBookingSummary.textContent = `${destinationText} ${search.checkin && search.checkout ? `· ${search.checkin} → ${search.checkout}` : ""} · ${search.adults} ${getTranslation("field_adults").toLowerCase()} · ${search.rooms} ${getTranslation("mini_booking_rooms").toLowerCase()}`;

  const providerModels = [
    {
      provider: "booking",
      title: "Booking hotel search",
      referral: {
        provider: "booking",
        kind: "search",
        affiliateId: "",
        destinationId: search.bookingDestId,
        destinationType: "city",
        rooms: search.rooms,
        campaign: "mini_booking_panel",
        baseUrl: ""
      }
    },
    {
      provider: "expedia",
      title: "Expedia hotel search",
      referral: {
        provider: "expedia",
        kind: "hotel",
        affiliateId: "",
        destinationId: "",
        destinationType: "city",
        rooms: search.rooms,
        campaign: "mini_booking_panel",
        baseUrl: ""
      }
    },
    {
      provider: "agoda",
      title: "Agoda hotel search",
      referral: {
        provider: "agoda",
        kind: "hotel",
        affiliateId: "",
        destinationId: "",
        destinationType: "city",
        rooms: search.rooms,
        campaign: "mini_booking_panel",
        baseUrl: ""
      }
    }
  ];

  const items = providerModels.map((entry) => ({
    ...entry,
    item: sanitizePackage({
      title: entry.title,
      city: search.destination,
      country: search.country,
      startDate: search.checkin,
      endDate: search.checkout,
      originCode: "",
      destinationCode: "",
      referral: entry.referral,
      link: "#"
    })
  }));

  const activeSearch = {
    startDate: search.checkin,
    endDate: search.checkout,
    adults: search.adults,
    children: search.children
  };

  dom.miniBookingResults.innerHTML = items.map((entry) => {
    const canBuild = entry.provider === "booking" || (search.checkin && search.checkout);
    const url = canBuild ? buildAffiliateLink(entry.item, activeSearch) : "";
    const inspection = inspectAffiliateLink(entry.item, activeSearch);
    const isPrimary = entry.provider === search.provider;
    return `
      <article class="provider-card">
        <div class="provider-card__meta">${isPrimary ? getTranslation("mini_booking_primary") : getTranslation("mini_booking_alternative")}</div>
        <h3>${referralProviders[entry.provider]?.label || entry.provider}</h3>
        <div class="card-meta">${inspection.hostname}${inspection.pathname}</div>
        <span class="link-hint">${url || "Completa check-in y check-out para este proveedor."}</span>
        <div class="provider-card__actions">
          <a class="button ${isPrimary ? "button--primary" : "button--secondary"} button--tiny ${url ? "" : "is-disabled"}" href="${url || "#"}" target="_blank" rel="noreferrer">${getTranslation("mini_booking_open")}</a>
          <button class="button button--secondary button--tiny" type="button" data-mini-inspect='${JSON.stringify(inspection).replace(/'/g, "&apos;")}'>${getTranslation("mini_booking_inspect")}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderBookingQuickGrid(search) {
  if (!dom.bookingQuickGrid) return;
  if (!Array.isArray(bookingQuickHotels) || !bookingQuickHotels.length) {
    dom.bookingQuickGrid.innerHTML = "";
    return;
  }

  dom.bookingQuickGrid.innerHTML = bookingQuickHotels.map((entry) => {
    const destinationText = `${entry.city}, ${entry.country}`;
    const url = buildBookingSearchUrl({
      destinationText,
      destinationId: entry.destinationId || "",
      checkin: search.checkin,
      checkout: search.checkout,
      adults: search.adults || 2,
      children: search.children || 0,
      rooms: search.rooms || 1
    });

    return `
      <article class="provider-card booking-quick-card">
        <div class="card-visual">
          <img src="${entry.image}" alt="${destinationText}" />
          <div class="card-badge">Booking</div>
        </div>
        <h3>${entry.city}</h3>
        <div class="card-meta">${entry.region} · ${entry.country}</div>
        <p class="card-copy">${entry.summary}</p>
        <span class="link-hint">${url}</span>
        <div class="provider-card__actions">
          <a class="button button--primary button--tiny" href="${url}" target="_blank" rel="noreferrer">Abrir Booking</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderPackages() {
  const filters = getSearchState();
  if (!Array.isArray(state.packages) || !state.packages.length) {
    state.packages = getDefaultPackages();
    savePackages();
  }
  state.filteredPackages = state.packages.filter((item) => packageMatchesFilters(item, filters));
  dom.heroPackagesCount.textContent = String(state.packages.length);
  dom.resultsCount.textContent = String(state.filteredPackages.length);
  dom.searchSummary.textContent = buildSearchSummary(filters);

  if (!state.filteredPackages.length) {
    dom.packagesGrid.innerHTML = `<div class="empty-state">${getTranslation("fallback_no_results")}</div>`;
    return;
  }

  dom.packagesGrid.innerHTML = state.filteredPackages.map((item) => {
    const images = item.images.length ? item.images : [PLACEHOLDER_IMAGE];
    const routeLabel = `${item.originCode || item.originCity || "Origen"} → ${item.destinationCode || item.city || "Destino"}`;
    const scaleLabel = item.scales.length
      ? `${item.scales.length} escala${item.scales.length > 1 ? "s" : ""}: ${item.scales.map((scale) => scale.label || scale.code).join(", ")}`
      : "";
    const requestedLabel = state.settings.lang === "en" ? "Requested" : state.settings.lang === "pt" ? "Solicitado" : "Solicitado";
    const requestedPax = `${requestedLabel}: ${filters.adults} ${getTranslation("field_adults").toLowerCase()}${filters.children ? ` · ${filters.children} ${getTranslation("field_children").toLowerCase()}` : ""}`;
    const resolvedLink = buildAffiliateLink(item, filters);
    const providerLabel = item.referral?.provider && item.referral.provider !== "custom"
      ? referralProviders[item.referral.provider]?.label || item.referral.provider
      : getTranslation("package_manual_link");
    return `
      <article class="package-card">
        <div class="package-card__image image-carousel" data-image-carousel data-index="0" data-images="${encodeImageList(images)}">
          <img src="${images[0]}" alt="${item.title}" data-carousel-image />
          ${images.length > 1 ? `
            <button class="carousel-arrow carousel-arrow--prev" type="button" data-carousel-prev aria-label="Imagen anterior">‹</button>
            <button class="carousel-arrow carousel-arrow--next" type="button" data-carousel-next aria-label="Imagen siguiente">›</button>
            <div class="carousel-counter" data-carousel-counter>1 / ${images.length}</div>
          ` : ""}
          <div class="card-badge">${item.type}</div>
        </div>
        <div class="package-card__body">
          <div class="package-route">${routeLabel}</div>
          <div class="card-meta">${item.city}, ${item.country} · ${formatDateRange(item.startDate, item.endDate)}</div>
          <h3 class="package-card__title">${item.title}</h3>
          <p class="card-copy">${item.summary || "Sin descripción."}</p>
          <ul class="package-highlights">
            ${item.highlights.slice(0, 4).map((line) => `<li>${line}</li>`).join("")}
          </ul>
          <div class="card-meta">${item.airline ? `${item.airline} · ` : ""}${item.duration || ""}</div>
          ${scaleLabel ? `<div class="card-meta">${scaleLabel}</div>` : ""}
          <div class="card-meta">${getTranslation("package_provider_label")}: ${providerLabel}</div>
          <div class="card-meta">${requestedPax}</div>
          <div class="package-footer">
            <div class="package-price">
              <span>${getTranslation("package_base_label")}: ${item.basePrice || "-"}</span>
              <strong>${item.finalPrice || item.basePrice || "-"}</strong>
            </div>
            <div class="package-links">
              <button class="button button--secondary button--tiny" type="button" data-open-package="${item.id}">${getTranslation("package_detail")}</button>
              <a class="is-primary is-link-cta" href="${resolvedLink}" target="_blank" rel="noreferrer">${item.visibleLinkLabel || "Abrir link"}</a>
            </div>
          </div>
          <span class="link-hint">${resolvedLink}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderEditorial() {
  dom.exoticGrid.innerHTML = exoticPlaces.map((item) => `
    <article class="tip-card">
      <div class="card-visual">
        <img src="${item.image}" alt="${item.title}" />
        <div class="card-badge">Editorial</div>
      </div>
      <h3>${item.title}</h3>
      <p class="card-copy">${item.summary}</p>
    </article>
  `).join("");

  dom.tipsGrid.innerHTML = tips.map((item) => `
    <article class="tip-card">
      <div class="card-meta">${item.source}</div>
      <h3>${item.title}</h3>
      <p class="card-copy">${item.body}</p>
    </article>
  `).join("");
}

function renderCountryFilters() {
  const continents = ["All", ...new Set(state.countries.map((entry) => entry.region || "Other"))];
  dom.continentFilters.innerHTML = continents.map((region) => `
    <button class="chip ${state.countryFilter === region ? "is-active" : ""}" type="button" data-country-filter="${region}">
      ${region === "All" ? "Todos" : region}
    </button>
  `).join("");
}

function getFilteredCountries() {
  const term = normalizeText(state.countrySearch);
  return state.countries.filter((country) => {
    const regionMatch = state.countryFilter === "All" || country.region === state.countryFilter;
    const haystack = normalizeText([
      country.name,
      getLocalizedCountryName(country),
      country.region,
      country.subregion,
      (country.capital || []).join(" ")
    ].join(" "));
    const searchMatch = !term || haystack.includes(term);
    return regionMatch && searchMatch;
  });
}

function renderCountries() {
  const list = getFilteredCountries();
  dom.heroCountriesCount.textContent = String(state.countries.length);

  if (!list.length) {
    dom.countriesGrid.innerHTML = `<div class="empty-state">${getTranslation("fallback_no_countries")}</div>`;
    return;
  }

  dom.countriesGrid.innerHTML = list.map((country) => `
    <article class="country-card">
      <div class="country-head">
        <div>
          <div class="country-meta">${country.region}${country.subregion ? ` · ${country.subregion}` : ""}</div>
          <h3>${getLocalizedCountryName(country)}</h3>
        </div>
        <div class="flag-box">
          <img src="${country.flags?.png || ""}" alt="${getLocalizedCountryName(country)}" />
        </div>
      </div>
      <p>${buildCountryDescription(country)}</p>
      <ul class="country-list">
        <li>Capital: ${(country.capital || []).join(", ") || "Sin dato"}</li>
        <li>Centro geográfico: ${country.latlng?.[0] ?? "-"}, ${country.latlng?.[1] ?? "-"}</li>
        <li>Continente: ${country.region}</li>
      </ul>
      <button class="button button--secondary button--tiny" type="button" data-open-country="${country.cca2}">Ver ficha</button>
    </article>
  `).join("");
}

function buildCountryDescription(country) {
  const capital = (country.capital || []).join(", ") || "capital no informada";
  const region = country.subregion || country.region || "región no informada";
  return `${getLocalizedCountryName(country)} se muestra como referencia geográfica dentro de ${region}. Capital principal: ${capital}.`;
}

function initializeMap() {
  if (!window.L) return;
  state.map = L.map("leafletMap", {
    worldCopyJump: true,
    minZoom: 2
  }).setView([16, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(state.map);

  state.layers.packages = L.layerGroup().addTo(state.map);
  state.layers.countries = L.layerGroup().addTo(state.map);
  state.layers.routes = L.layerGroup().addTo(state.map);
}

function renderMap() {
  if (!state.map) return;
  state.layers.packages.clearLayers();
  state.layers.countries.clearLayers();
  state.layers.routes.clearLayers();

  const packageBounds = [];
  const countryBounds = [];
  const routeBounds = [];
  const packageList = state.filteredPackages.length ? state.filteredPackages : state.packages;

  if (dom.togglePackagesLayer.checked) {
    packageList.forEach((item) => {
      const coords = resolvePackageCoords(item);
      if (!coords) return;
      const [lat, lng] = coords;
      const marker = L.marker([lat, lng]).bindPopup(`
        <strong>${item.title}</strong><br />
        ${item.city}, ${item.country}<br />
        ${item.finalPrice || item.basePrice || "-"}
      `);
      marker.on("click", () => openPackageModal(item.id));
      marker.addTo(state.layers.packages);
      packageBounds.push([lat, lng]);
    });
  }

  if (dom.toggleCountriesLayer.checked) {
    getFilteredCountries().forEach((country) => {
      const lat = country.latlng?.[0];
      const lng = country.latlng?.[1];
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      L.circleMarker([lat, lng], {
        radius: 4,
        color: "#ffffff",
        weight: 1,
        fillColor: "#14556b",
        fillOpacity: 0.7
      })
        .bindTooltip(getLocalizedCountryName(country))
        .addTo(state.layers.countries);
      countryBounds.push([lat, lng]);
    });
  }

  if (dom.toggleRoutesLayer.checked) {
    packageList.forEach((item) => {
      const points = resolveRoutePoints(item);
      if (points.length < 2) return;
      L.polyline(points, {
        color: "#dd7046",
        weight: 2,
        opacity: 0.72,
        dashArray: "8 6"
      }).addTo(state.layers.routes);
      points.forEach((point) => routeBounds.push(point));
    });
  }

  let preferredBounds = [];
  if (dom.togglePackagesLayer.checked && packageBounds.length) preferredBounds = packageBounds;
  else if (dom.toggleRoutesLayer.checked && routeBounds.length) preferredBounds = routeBounds;
  else if (dom.toggleCountriesLayer.checked && countryBounds.length) preferredBounds = countryBounds;

  if (preferredBounds.length) {
    if (preferredBounds.length === 1) {
      state.map.setView(preferredBounds[0], 6, { animate: false });
    } else {
      const latLngBounds = L.latLngBounds(preferredBounds);
      state.map.fitBounds(latLngBounds.pad(0.25), { animate: false });
    }
  }

  renderMapSidebar(packageList);
}

function renderMapSidebar(list) {
  const filters = getSearchState();
  if (!list.length) {
    dom.mapSidebar.innerHTML = `<div class="empty-state">${getTranslation("fallback_no_map_items")}</div>`;
    return;
  }

  dom.mapSidebar.innerHTML = list.map((item) => `
    <article class="map-sidebar-card">
      <small>${item.type} · ${item.originCode || item.originCity || "Origen"} → ${item.destinationCode || item.city || "Destino"}</small>
      <h3 class="package-card__title">${item.title}</h3>
      <p>${item.city}, ${item.country}</p>
      <div class="package-links">
        <button class="button button--secondary button--tiny" type="button" data-open-package="${item.id}">Ver detalle</button>
        <a class="is-primary is-link-cta" href="${buildAffiliateLink(item, filters)}" target="_blank" rel="noreferrer">${item.visibleLinkLabel || "Abrir link"}</a>
      </div>
    </article>
  `).join("");
}

function renderStorageStatus() {
  if (!dom.storageStatus) return;
  dom.storageStatus.textContent = `${state.packages.length} promos guardadas en localStorage`;
}

function renderSuggestions() {
  dom.countrySuggestions.innerHTML = state.countries
    .map((country) => `<option value="${country.name}"></option>`)
    .join("");

  dom.citySuggestions.innerHTML = hotelCityCatalog
    .map((city) => `<option value="${city.city}">${city.country}</option>`)
    .join("");

  dom.airportSuggestions.innerHTML = Object.values(airportCatalog)
    .map((airport) => `<option value="${airport.code}">${airport.city}, ${airport.country}</option>`)
    .join("");
}

function setAdminVisibility() {
  if (!dom.adminApp || !dom.adminLoginPanel) return;
  dom.adminApp.classList.toggle("is-hidden", !state.adminUnlocked);
  dom.adminLoginPanel.style.display = state.adminUnlocked ? "none" : "grid";
}

function renderAdminList() {
  if (!dom.adminList) return;
  if (!state.adminUnlocked) return;
  if (!state.packages.length) {
    dom.adminList.innerHTML = `<div class="empty-state">${getTranslation("fallback_no_admin_items")}</div>`;
    return;
  }

  dom.adminList.innerHTML = state.packages.map((item) => `
    <article class="admin-card">
      <div class="card-visual">
        <img src="${item.images[0] || PLACEHOLDER_IMAGE}" alt="${item.title}" />
        <div class="card-badge">${item.type}</div>
      </div>
      <div class="card-meta">${item.originCode || item.originCity || "Origen"} → ${item.destinationCode || item.city || "Destino"}</div>
      <h3>${item.title}</h3>
      <p>${item.finalPrice || item.basePrice || "-"} · ${formatDateRange(item.startDate, item.endDate)}</p>
      <div class="package-links">
        <a href="${item.link}" target="_blank" rel="noreferrer">${item.visibleLinkLabel || "Abrir link"}</a>
      </div>
      <div class="admin-card__actions">
        <button class="mini-button mini-button--edit" type="button" data-edit-item="${item.id}">Editar</button>
        <button class="mini-button mini-button--delete" type="button" data-delete-item="${item.id}">Borrar</button>
      </div>
    </article>
  `).join("");
}

function resetAdminForm() {
  if (!dom.adminForm) return;
  dom.adminForm.reset();
  fields.itemType.value = "Paquete";
  fields.itemContinent.value = "America del Sur";
  fields.itemReferralProvider.value = "custom";
  fields.itemReferralKind.value = "search";
  fields.itemReferralHotelSlug.value = "";
  fields.itemReferralDestinationType.value = "city";
  fields.itemReferralRooms.value = "1";
  fields.itemReferralBaseUrl.value = "";
  fields.itemMaxAdults.value = "4";
  fields.itemMaxChildren.value = "2";
  fields.itemChildAgeLimit.value = "17";
  fields.itemVisibleLinkLabel.value = "Abrir promo";
  dom.imagePreview.innerHTML = `<div class="empty-state">Sin imágenes todavía.</div>`;
  state.editingId = null;
  state.editingImages = [];
}

function fillAdminForm(item) {
  fields.itemId.value = item.id;
  fields.itemType.value = item.type;
  fields.itemTitle.value = item.title;
  fields.itemVisibleLinkLabel.value = item.visibleLinkLabel;
  fields.itemLink.value = item.link;
  fields.itemStartDate.value = item.startDate;
  fields.itemEndDate.value = item.endDate;
  fields.itemBasePrice.value = item.basePrice;
  fields.itemFinalPrice.value = item.finalPrice;
  fields.itemOriginCity.value = item.originCity;
  fields.itemOriginCountry.value = item.originCountry;
  fields.itemOriginCode.value = item.originCode;
  fields.itemDestinationCode.value = item.destinationCode;
  fields.itemContinent.value = item.continent;
  fields.itemCountry.value = item.country;
  fields.itemCity.value = item.city;
  fields.itemRegion.value = item.region;
  fields.itemLat.value = item.lat;
  fields.itemLng.value = item.lng;
  fields.itemAirline.value = item.airline;
  fields.itemDuration.value = item.duration;
  fields.itemScales.value = item.scales.map((scale) => `${scale.code}${scale.label ? ` | ${scale.label}` : ""}`).join("\n");
  fields.itemReferralProvider.value = item.referral?.provider || "custom";
  fields.itemReferralKind.value = item.referral?.kind || "search";
  fields.itemAffiliateId.value = item.referral?.affiliateId || "";
  fields.itemReferralHotelSlug.value = item.referral?.hotelSlug || "";
  fields.itemReferralDestinationId.value = item.referral?.destinationId || "";
  fields.itemReferralDestinationType.value = item.referral?.destinationType || "city";
  fields.itemReferralRooms.value = String(item.referral?.rooms || 1);
  fields.itemReferralCampaign.value = item.referral?.campaign || "";
  fields.itemReferralBaseUrl.value = item.referral?.baseUrl || "";
  fields.itemMaxAdults.value = String(item.maxAdults);
  fields.itemMaxChildren.value = String(item.maxChildren);
  fields.itemChildAgeLimit.value = String(item.childAgeLimit);
  fields.itemHotelName.value = item.hotelName;
  fields.itemBoardBasis.value = item.boardBasis;
  fields.itemThemeTag.value = item.themeTag;
  fields.itemSummary.value = item.summary;
  fields.itemHighlights.value = item.highlights.join("\n");
  fields.itemImageUrls.value = item.images.filter((src) => src.startsWith("http")).join("\n");
  fields.itemReplaceImages.checked = false;
  state.editingId = item.id;
  state.editingImages = [...item.images];
  buildAdminPreview();
  document.getElementById("admin").scrollIntoView({ behavior: "smooth", block: "start" });
}

function parseLines(value) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function parseScaleLines(value) {
  return parseLines(value).map((line) => {
    const [code, label] = line.split("|").map((part) => part.trim());
    return {
      code: (code || "").toUpperCase(),
      label: label || code || ""
    };
  }).filter((item) => item.code || item.label);
}

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

async function buildAdminPreview() {
  const urlImages = parseLines(fields.itemImageUrls.value);
  const fileImages = await Promise.all(Array.from(fields.itemImages.files || []).map(fileToDataUrl));
  const baseImages = fields.itemReplaceImages.checked ? [] : state.editingImages;
  const images = [...new Set([...baseImages, ...urlImages, ...fileImages].filter(Boolean))];
  dom.imagePreview.innerHTML = images.length
    ? images.map((src) => `<img src="${src}" alt="Preview" />`).join("")
    : `<div class="empty-state">Sin imágenes todavía.</div>`;
  return images;
}

function buildPackagePayload(images) {
  return sanitizePackage({
    id: state.editingId || crypto.randomUUID(),
    type: fields.itemType.value.trim(),
    title: fields.itemTitle.value.trim(),
    visibleLinkLabel: fields.itemVisibleLinkLabel.value.trim() || "Abrir promo",
    link: fields.itemLink.value.trim(),
    startDate: fields.itemStartDate.value,
    endDate: fields.itemEndDate.value,
    basePrice: fields.itemBasePrice.value.trim(),
    finalPrice: fields.itemFinalPrice.value.trim(),
    originCity: fields.itemOriginCity.value.trim(),
    originCountry: fields.itemOriginCountry.value.trim(),
    originCode: fields.itemOriginCode.value.trim().toUpperCase(),
    destinationCode: fields.itemDestinationCode.value.trim().toUpperCase(),
    continent: fields.itemContinent.value.trim(),
    country: fields.itemCountry.value.trim(),
    city: fields.itemCity.value.trim(),
    region: fields.itemRegion.value.trim(),
    lat: fields.itemLat.value,
    lng: fields.itemLng.value,
    airline: fields.itemAirline.value.trim(),
    duration: fields.itemDuration.value.trim(),
    scales: parseScaleLines(fields.itemScales.value),
    referral: {
      provider: fields.itemReferralProvider.value,
      kind: fields.itemReferralKind.value,
      affiliateId: fields.itemAffiliateId.value.trim(),
      hotelSlug: fields.itemReferralHotelSlug.value.trim(),
      destinationId: fields.itemReferralDestinationId.value.trim(),
      destinationType: fields.itemReferralDestinationType.value,
      rooms: Number(fields.itemReferralRooms.value || 1),
      campaign: fields.itemReferralCampaign.value.trim(),
      baseUrl: fields.itemReferralBaseUrl.value.trim(),
      customParams: {}
    },
    maxAdults: Number(fields.itemMaxAdults.value || 4),
    maxChildren: Number(fields.itemMaxChildren.value || 2),
    childAgeLimit: Number(fields.itemChildAgeLimit.value || 17),
    hotelName: fields.itemHotelName.value.trim(),
    boardBasis: fields.itemBoardBasis.value.trim(),
    themeTag: fields.itemThemeTag.value.trim(),
    summary: fields.itemSummary.value.trim(),
    highlights: parseLines(fields.itemHighlights.value),
    images
  });
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
    resetAdminForm();
    renderAll();
    showToast("Importación completada.");
  } catch (error) {
    showToast("No se pudo importar el JSON.");
  }
}

function restoreDefaults() {
  state.packages = getDefaultPackages();
  savePackages();
  resetAdminForm();
  renderAll();
  showToast("Ejemplos restaurados.");
}

function deletePackage(id) {
  state.packages = state.packages.filter((item) => item.id !== id);
  savePackages();
  if (state.editingId === id) resetAdminForm();
  renderAll();
  showToast("Promo eliminada.");
}

function openModal(html) {
  dom.modal.innerHTML = html;
  dom.modal.classList.add("is-open");
  dom.modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  dom.modal.classList.remove("is-open");
  dom.modal.setAttribute("aria-hidden", "true");
  dom.modal.innerHTML = "";
}

function openPackageModal(id) {
  const item = state.packages.find((entry) => entry.id === id);
  if (!item) return;
  const images = item.images.length ? item.images : [PLACEHOLDER_IMAGE];
  const routeLabel = `${item.originCode || item.originCity || "Origen"} → ${item.destinationCode || item.city || "Destino"}`;
  const resolvedLink = buildAffiliateLink(item, getSearchState());
  const inspection = inspectAffiliateLink(item, getSearchState());
  const scalesLine = item.scales.length
    ? `<li>Escalas: ${item.scales.map((scale) => scale.label || scale.code).join(", ")}</li>`
    : "";
  openModal(`
    <div class="modal__card">
      <button class="modal__close" type="button" data-close-modal>×</button>
      <div class="image-carousel image-carousel--modal" data-image-carousel data-index="0" data-images="${encodeImageList(images)}">
        <img class="modal__cover" src="${images[0]}" alt="${item.title}" data-carousel-image />
        ${images.length > 1 ? `
          <button class="carousel-arrow carousel-arrow--prev carousel-arrow--modal" type="button" data-carousel-prev aria-label="Imagen anterior">‹</button>
          <button class="carousel-arrow carousel-arrow--next carousel-arrow--modal" type="button" data-carousel-next aria-label="Imagen siguiente">›</button>
          <div class="carousel-counter carousel-counter--modal" data-carousel-counter>1 / ${images.length}</div>
        ` : ""}
      </div>
      <div class="modal__body">
        <div class="card-meta">${item.type} · ${routeLabel}</div>
        <h3 class="subhead" style="margin: 0;">${item.title}</h3>
        <div class="card-meta">${item.city}, ${item.country} · ${item.region || "Destino principal"} · ${formatDateRange(item.startDate, item.endDate)}</div>
        <p class="card-copy">${item.summary || "Sin descripción."}</p>
        <ul class="detail-list">
          <li>Precio base: ${item.basePrice || "-"}</li>
          <li>Precio final: ${item.finalPrice || item.basePrice || "-"}</li>
          <li>Aerolínea: ${item.airline || "Sin dato"}</li>
          <li>Duración: ${item.duration || "Sin dato"}</li>
          ${scalesLine}
          <li>Hotel: ${item.hotelName || "No aplica"}</li>
          <li>Proveedor referido: ${referralProviders[item.referral?.provider]?.label || "Custom"}</li>
          <li>Tipo de link: ${inspection.kind}</li>
          <li>Link resuelto: ${resolvedLink}</li>
        </ul>
        <div class="tip-card">
          <h3 style="margin: 0 0 10px;">Inspección técnica del link</h3>
          <div class="card-meta">${inspection.hostname}${inspection.pathname}</div>
          <ul class="detail-list">
            ${Object.entries(inspection.params).map(([key, value]) => `<li>${key}: ${value}</li>`).join("") || "<li>Sin query params</li>"}
          </ul>
        </div>
        <ul class="detail-list">
          ${item.highlights.map((line) => `<li>${line}</li>`).join("")}
        </ul>
        <div class="package-links">
          <a class="is-primary is-link-cta" href="${resolvedLink}" target="_blank" rel="noreferrer">${item.visibleLinkLabel || "Abrir promo"}</a>
          <button class="button button--secondary button--tiny" type="button" data-focus-package="${item.id}">Ir al mapa</button>
        </div>
      </div>
    </div>
  `);
}

function openCountryModal(code) {
  const country = state.countries.find((entry) => entry.cca2 === code);
  if (!country) return;
  openModal(`
    <div class="modal__card">
      <button class="modal__close" type="button" data-close-modal>×</button>
      <img class="modal__cover" src="${country.flags?.png || PLACEHOLDER_IMAGE}" alt="${getLocalizedCountryName(country)}" />
      <div class="modal__body">
        <div class="card-meta">${country.region}${country.subregion ? ` · ${country.subregion}` : ""}</div>
        <h3 class="subhead" style="margin: 0;">${getLocalizedCountryName(country)}</h3>
        <p class="card-copy">${buildCountryDescription(country)}</p>
        <ul class="detail-list">
          <li>Capital: ${(country.capital || []).join(", ") || "Sin dato"}</li>
          <li>Código: ${country.cca2 || "-"}</li>
          <li>Centro aproximado: ${country.latlng?.[0] ?? "-"}, ${country.latlng?.[1] ?? "-"}</li>
        </ul>
      </div>
    </div>
  `);
}

function focusPackageOnMap(id) {
  const item = state.packages.find((entry) => entry.id === id);
  if (!item || !state.map) return;
  const coords = resolvePackageCoords(item);
  state.map.setView(coords, 5, { animate: true });
  closeModal();
  document.getElementById("mapa").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("is-open");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    dom.toast.classList.remove("is-open");
  }, 2400);
}

function renderAll() {
  try {
    renderPackages();
    buildMiniBookingItems();
    renderEditorial();
    renderCountryFilters();
    renderCountries();
    renderMap();
    if (dom.adminList) renderAdminList();
    if (dom.storageStatus) renderStorageStatus();
  } catch (error) {
    console.error("travel-site render error", error);
    if (!state.packages.length) {
      state.packages = getDefaultPackages();
      savePackages();
      renderPackages();
    }
  }
}

function bindEvents() {
  dom.languageSelect.addEventListener("change", (event) => {
    state.settings.lang = event.target.value;
    saveSettings();
    applyTranslations();
    renderAll();
  });

  dom.themeSwatches.forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.theme = button.dataset.theme;
      saveSettings();
      applyTheme();
    });
  });

  [
    dom.searchOrigin,
    dom.searchDestination,
    dom.searchStartDate,
    dom.searchEndDate,
    dom.searchAdults
  ].forEach((input) => {
    input.addEventListener("input", renderAll);
  });

  dom.searchChildren.addEventListener("input", () => {
    buildChildAgeInputs();
    renderAll();
  });

  dom.clearSearchButton.addEventListener("click", () => {
    dom.searchOrigin.value = "";
    dom.searchDestination.value = "";
    dom.searchStartDate.value = "";
    dom.searchEndDate.value = "";
    dom.searchAdults.value = "1";
    dom.searchChildren.value = "0";
    buildChildAgeInputs();
    renderAll();
  });

  if (dom.bookingShortcutButton) {
    dom.bookingShortcutButton.addEventListener("click", () => {
      const destination = dom.searchDestination.value.trim();
      if (!destination) {
        showToast("Ingresa destino para abrir Booking.");
        return;
      }
      window.open(buildBookingShortcutUrl(), "_blank", "noopener,noreferrer");
    });
  }

  [
    dom.miniBookingDestination,
    dom.miniBookingCountry,
    dom.miniBookingCheckin,
    dom.miniBookingCheckout,
    dom.miniBookingAdults,
    dom.miniBookingChildren,
    dom.miniBookingRooms,
    dom.miniBookingProvider,
    dom.miniBookingDestId
  ].forEach((input) => {
    input.addEventListener("input", buildMiniBookingItems);
    input.addEventListener("change", buildMiniBookingItems);
  });

  dom.miniBookingReset.addEventListener("click", () => {
    dom.miniBookingDestination.value = "";
    dom.miniBookingCountry.value = "";
    dom.miniBookingCheckin.value = "";
    dom.miniBookingCheckout.value = "";
    dom.miniBookingAdults.value = "2";
    dom.miniBookingChildren.value = "0";
    dom.miniBookingRooms.value = "1";
    dom.miniBookingProvider.value = "booking";
    dom.miniBookingDestId.value = "";
    buildMiniBookingItems();
  });

  dom.countrySearch.addEventListener("input", (event) => {
    state.countrySearch = event.target.value;
    renderAll();
  });

  [dom.togglePackagesLayer, dom.toggleCountriesLayer, dom.toggleRoutesLayer].forEach((input) => {
    input.addEventListener("change", renderMap);
  });

  if (dom.adminUnlockButton && dom.adminPassword && dom.adminForm) {
    dom.adminUnlockButton.addEventListener("click", () => {
      if (dom.adminPassword.value !== ADMIN_PASSWORD) {
        showToast("Password incorrecta.");
        return;
      }
      state.adminUnlocked = true;
      setAdminVisibility();
      renderAdminList();
      showToast("Admin desbloqueado.");
    });

    dom.adminPassword.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        dom.adminUnlockButton.click();
      }
    });

    dom.newItemButton?.addEventListener("click", resetAdminForm);
    dom.saveStorageButton?.addEventListener("click", () => {
      savePackages();
      showToast("localStorage actualizado.");
    });
    dom.exportJsonButton?.addEventListener("click", exportPackages);
    dom.importJsonButton?.addEventListener("click", () => dom.importJsonInput?.click());
    dom.importJsonInput?.addEventListener("change", async (event) => {
      await importPackages(event.target.files?.[0]);
      dom.importJsonInput.value = "";
    });
    dom.restoreDefaultsButton?.addEventListener("click", restoreDefaults);
    fields.resetFormButton?.addEventListener("click", resetAdminForm);
    fields.itemImageUrls?.addEventListener("input", () => {
      buildAdminPreview();
    });
    fields.itemImages?.addEventListener("change", () => {
      buildAdminPreview();
    });
    fields.itemReplaceImages?.addEventListener("change", () => {
      buildAdminPreview();
    });

    dom.adminForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const images = await buildAdminPreview();
      const payload = buildPackagePayload(images);
      const index = state.packages.findIndex((item) => item.id === payload.id);
      if (index >= 0) state.packages[index] = payload;
      else state.packages.unshift(payload);
      savePackages();
      resetAdminForm();
      renderAll();
      showToast(index >= 0 ? "Promo actualizada." : "Promo creada.");
    });
  }

  document.body.addEventListener("click", (event) => {
    const carouselPrev = event.target.closest("[data-carousel-prev]");
    if (carouselPrev) {
      const carousel = carouselPrev.closest("[data-image-carousel]");
      moveImageCarousel(carousel, -1);
      return;
    }

    const carouselNext = event.target.closest("[data-carousel-next]");
    if (carouselNext) {
      const carousel = carouselNext.closest("[data-image-carousel]");
      moveImageCarousel(carousel, 1);
      return;
    }

    const packageTrigger = event.target.closest("[data-open-package]");
    if (packageTrigger) {
      openPackageModal(packageTrigger.dataset.openPackage);
      return;
    }

    const countryTrigger = event.target.closest("[data-open-country]");
    if (countryTrigger) {
      openCountryModal(countryTrigger.dataset.openCountry);
      return;
    }

    const filterTrigger = event.target.closest("[data-country-filter]");
    if (filterTrigger) {
      state.countryFilter = filterTrigger.dataset.countryFilter;
      renderAll();
      return;
    }

    const editTrigger = event.target.closest("[data-edit-item]");
    if (editTrigger) {
      const item = state.packages.find((entry) => entry.id === editTrigger.dataset.editItem);
      if (item) fillAdminForm(item);
      return;
    }

    const deleteTrigger = event.target.closest("[data-delete-item]");
    if (deleteTrigger) {
      deletePackage(deleteTrigger.dataset.deleteItem);
      return;
    }

    const focusTrigger = event.target.closest("[data-focus-package]");
    if (focusTrigger) {
      focusPackageOnMap(focusTrigger.dataset.focusPackage);
      return;
    }

    const miniInspect = event.target.closest("[data-mini-inspect]");
    if (miniInspect) {
      const inspection = JSON.parse(miniInspect.getAttribute("data-mini-inspect").replace(/&apos;/g, "'"));
      openModal(`
        <div class="modal__card">
          <button class="modal__close" type="button" data-close-modal>×</button>
          <div class="modal__body">
            <div class="card-meta">${inspection.provider} · ${inspection.kind}</div>
            <h3 class="subhead" style="margin: 0;">Inspección mini booking</h3>
            <p class="card-copy">${inspection.url}</p>
            <ul class="detail-list">
              ${Object.entries(inspection.params).map(([key, value]) => `<li>${key}: ${value}</li>`).join("") || "<li>Sin query params</li>"}
            </ul>
          </div>
        </div>
      `);
      return;
    }

    if (event.target.matches("[data-close-modal]") || event.target === dom.modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dom.modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function init() {
  if (!window.TravelData || !window.TravelAffiliateLinks || !window.TravelI18n) {
    console.error("travel-site bootstrap error: faltan scripts base");
    return;
  }
  if (!Array.isArray(state.packages) || !state.packages.length) {
    state.packages = getDefaultPackages();
  }
  applyTheme();
  applyTranslations();
  buildChildAgeInputs();
  initializeMap();
  renderSuggestions();
  if (dom.adminForm) resetAdminForm();
  if (dom.adminApp) setAdminVisibility();
  bindEvents();
  savePackages();
  renderAll();
}

init();
})();

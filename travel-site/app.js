(() => {
const travelData = window.TravelData || {};
const travelAffiliateLinks = window.TravelAffiliateLinks || {};
const travelI18n = window.TravelI18n || {};
const travelTabs = window.TravelTabs || {};
const travelMapWidgets = window.TravelMapWidgets || {};
const travelConfig = window.TravelConfig || {};

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
const COUNTRIES_API_URL = "https://restcountries.com/v3.1/all?fields=name,cca2,region,subregion,capital,latlng,flags,translations";
const HOTEL_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
];
const TIMEZONE_CITY_FALLBACKS = [
  { match: "Montevideo", city: "Montevideo" },
  { match: "Buenos_Aires", city: "Buenos Aires" },
  { match: "Santiago", city: "Santiago" },
  { match: "Asuncion", city: "Asunción" },
  { match: "Sao_Paulo", city: "Sao Paulo" },
  { match: "Rio", city: "Rio de Janeiro" },
  { match: "New_York", city: "New York" },
  { match: "Chicago", city: "Chicago" },
  { match: "Denver", city: "Denver" },
  { match: "Los_Angeles", city: "Los Angeles" },
  { match: "Mexico_City", city: "Mexico City" },
  { match: "Madrid", city: "Madrid" },
  { match: "Lisbon", city: "Lisboa" },
  { match: "Paris", city: "París" }
];
const BOOKING_PROXY_URL = typeof travelConfig.bookingProxyUrl === "string" ? travelConfig.bookingProxyUrl : "";

const state = {
  packages: loadPackages(),
  filteredPackages: [],
  countries: normalizeCountries(countryCatalog),
  countryFilter: "All",
  countrySearch: "",
  activeTab: "home",
  hotelFocus: null,
  countryLoadDone: false,
  adminUnlocked: false,
  editingId: null,
  editingImages: [],
  settings: loadSettings(),
  map: null,
  layers: {
    packages: null,
    countries: null,
    routes: null
  },
  home: {
    mode: "flight-hotel",
    transport: false
  },
  bookingHotels: new Map(),
  logEntries: []
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
  homeCity: document.getElementById("homeCity"),
  homeAdults: document.getElementById("homeAdults"),
  homeChildren: document.getElementById("homeChildren"),
  homeModeFlightHotel: document.getElementById("homeModeFlightHotel"),
  homeModeHotelOnly: document.getElementById("homeModeHotelOnly"),
  homeAirportTransport: document.getElementById("homeAirportTransport"),
  homeOrigin: document.getElementById("homeOrigin"),
  homeDepartureDate: document.getElementById("homeDepartureDate"),
  homeReturnDate: document.getElementById("homeReturnDate"),
  homeCheckin: document.getElementById("homeCheckin"),
  homeCheckout: document.getElementById("homeCheckout"),
  homeFlightsCount: document.getElementById("homeFlightsCount"),
  homeFlightsGrid: document.getElementById("homeFlightsGrid"),
  homeHotelsCount: document.getElementById("homeHotelsCount"),
  homeHotelsSummary: document.getElementById("homeHotelsSummary"),
  homeHotelsGrid: document.getElementById("homeHotelsGrid"),
  homeTripMap: document.getElementById("homeTripMap"),
  homeTripSummary: document.getElementById("homeTripSummary"),
  homeFlightFields: document.querySelector("[data-home-flight-fields]"),
  homeHotelFields: document.querySelector("[data-home-hotel-fields]"),
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
  hotelSuggestionsSummary: document.getElementById("hotelSuggestionsSummary"),
  hotelSuggestionsGrid: document.getElementById("hotelSuggestionsGrid"),
  resultsCount: document.getElementById("resultsCount"),
  packagesGrid: document.getElementById("packagesGrid"),
  packagesMiniMap: document.getElementById("packagesMiniMap"),
  hotelMiniMap: document.getElementById("hotelMiniMap"),
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
  toast: document.getElementById("toast"),
  travelCursor: document.getElementById("travelCursor"),
  chatbot: document.getElementById("offerChatbot"),
  chatbotToggle: document.getElementById("chatbotToggle"),
  chatbotClose: document.getElementById("chatbotClose"),
  chatbotMessages: document.getElementById("chatbotMessages"),
  chatbotForm: document.getElementById("chatbotForm"),
  chatbotInput: document.getElementById("chatbotInput"),
  logFeed: document.getElementById("logFeed"),
  logClearButton: document.getElementById("logClearButton"),
  logStatus: document.getElementById("logStatus")
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

function mergeCountryLists(primaryList, secondaryList) {
  const map = new Map();
  [...primaryList, ...secondaryList].forEach((entry) => {
    const key = (entry.cca2 || entry.name || "").toUpperCase();
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, entry);
      return;
    }
    const existing = map.get(key);
    map.set(key, {
      ...existing,
      ...entry,
      translations: {
        ...(existing.translations || {}),
        ...(entry.translations || {})
      }
    });
  });
  return Array.from(map.values());
}

async function loadGlobalCountries() {
  try {
    const response = await fetch(COUNTRIES_API_URL, { cache: "force-cache" });
    if (!response.ok) throw new Error(`Countries API status ${response.status}`);
    const data = await response.json();
    const remoteCountries = Array.isArray(data) ? data : [];
    const normalized = normalizeCountries(mergeCountryLists(remoteCountries, countryCatalog));
    if (normalized.length) {
      state.countries = normalized;
      state.countryLoadDone = true;
      renderSuggestions();
      renderCountryFilters();
      renderCountries();
      renderMap();
      return;
    }
  } catch (error) {
    console.warn("Countries API fallback", error);
  }

  state.countries = normalizeCountries(countryCatalog);
  state.countryLoadDone = true;
  renderSuggestions();
  renderCountryFilters();
  renderCountries();
  renderMap();
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
  renderHotelMiniMap();
  buildHotelSuggestions();

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
        <div class="mini-map-badge">
          ${travelMapWidgets.buildMiniMapBadge({
            title: destinationText,
            origin: search.country || "Hotel",
            destination: entry.provider,
            mode: "hotel"
          })}
        </div>
        <div class="provider-card__actions">
          <a class="button ${isPrimary ? "button--primary" : "button--secondary"} button--tiny ${url ? "" : "is-disabled"}" href="${url || "#"}" target="_blank" rel="noreferrer">${getTranslation("mini_booking_open")}</a>
          <button class="button button--secondary button--tiny" type="button" data-mini-inspect='${JSON.stringify(inspection).replace(/'/g, "&apos;")}'>${getTranslation("mini_booking_inspect")}</button>
        </div>
      </article>
    `;
  }).join("");
  renderHotelMiniMap();
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
          <div class="mini-map-badge">
            ${travelMapWidgets.buildMiniMapBadge({
              title: entry.city,
              origin: entry.country,
              destination: entry.region,
              mode: "hotel"
            })}
          </div>
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

function getPackageMiniPoints(list) {
  return list
    .map((item) => {
      const coords = resolvePackageCoords(item);
      if (!coords) return null;
      const [lat, lng] = coords;
      return {
        lat,
        lng,
        label: `${item.city || item.title}`,
        color: item.type === "Crucero" ? "#1a7c64" : "#14556b"
      };
    })
    .filter(Boolean);
}

function renderPackagesMiniMap() {
  if (!dom.packagesMiniMap || !travelMapWidgets.renderMiniMap) return;
  const points = getPackageMiniPoints(state.filteredPackages.length ? state.filteredPackages : state.packages);
  travelMapWidgets.renderMiniMap("packagesMiniMap", {
    points,
    center: points[0] ? [points[0].lat, points[0].lng] : [16, 0],
    zoom: points.length === 1 ? 5 : 2,
    showRoutes: false
  });
}

function findHotelCityMatch(query) {
  const text = normalizeText(query);
  if (!text) return null;
  return hotelCityCatalog.find((city) => normalizeText([city.city, city.country].join(" ")).includes(text))
    || countryCatalog.find((country) => normalizeText(country.name).includes(text));
}

function renderHotelMiniMap() {
  if (!dom.hotelMiniMap || !travelMapWidgets.renderMiniMap) return;
  const query = dom.miniBookingDestination?.value?.trim() || dom.miniBookingCountry?.value?.trim() || "";
  const city = findHotelCityMatch(query);
  const partyType = getPartyIconType(dom.miniBookingAdults?.value, dom.miniBookingChildren?.value);
  const points = [];

  if (city && Number.isFinite(city.lat) && Number.isFinite(city.lng)) {
    points.push({
      lat: city.lat,
      lng: city.lng,
      label: `${city.city}, ${city.country}`,
      color: "#dd7046",
      iconType: partyType
    });
  }

  if (!points.length) {
    hotelCityCatalog.slice(0, 4).forEach((entry, index) => {
      points.push({
        lat: entry.lat,
        lng: entry.lng,
        label: `${entry.city}, ${entry.country}`,
        color: index % 2 === 0 ? "#14556b" : "#1a7c64"
      });
    });
  }

  travelMapWidgets.renderMiniMap("hotelMiniMap", {
    points,
    center: points[0] ? [points[0].lat, points[0].lng] : [-15, -20],
    zoom: points.length === 1 ? 6 : 2,
    showRoutes: false
  });
}

function findCatalogCityMatch(query) {
  const text = normalizeText(query);
  if (!text) return null;
  return hotelCityCatalog.find((city) => normalizeText([city.city, city.country].join(" ")).includes(text))
    || state.countries.find((country) => normalizeText([country.name, getLocalizedCountryName(country), ...(country.capital || [])].join(" ")).includes(text))
    || null;
}

function resolveHotelPriceLabel(item, cityLabel, index = 0) {
  if (item?.finalPrice || item?.basePrice) {
    return {
      nightly: item.basePrice || item.finalPrice,
      total: item.finalPrice || item.basePrice
    };
  }
  return formatHotelPrice(cityLabel || item?.city || "Destino", index);
}

function buildHotelListingCards(query, context = {}) {
  const cityEntry = context.cityEntry || findCatalogCityMatch(query);
  const queryText = normalizeText(query);
  const cityLabel = cityEntry?.city || context.cityLabel || query || "";
  const countryLabel = cityEntry?.country || context.countryLabel || "";
  const activeSearch = {
    startDate: context.checkin || "",
    endDate: context.checkout || "",
    adults: Number(context.adults || 2),
    children: Number(context.children || 0),
    rooms: Number(context.rooms || 1)
  };

  const packageHotels = state.packages
    .filter((item) => normalizeText(item.type) === "hotel" || normalizeText(item.referral?.kind) === "hotel")
    .filter((item) => {
      if (!queryText) return Boolean(cityLabel);
      return normalizeText([
        item.title,
        item.city,
        item.country,
        item.region,
        item.hotelName,
        item.summary
      ].join(" ")).includes(queryText);
    })
    .map((item, index) => ({
      key: item.id,
      title: item.title,
      city: item.city || cityLabel,
      country: item.country || countryLabel,
      neighborhood: item.region || cityEntry?.airport || "Ubicación destacada",
      summary: item.summary || `Hotel en ${item.city || cityLabel}.`,
      images: item.images.length ? item.images : buildHotelImageSet(cityLabel || item.city || query || "Destino", index),
      price: resolveHotelPriceLabel(item, cityLabel, index),
      link: buildAffiliateLink(item, activeSearch),
      provider: referralProviders[item.referral?.provider]?.label || item.referral?.provider || "Hotel",
      mode: "package"
    }));

  const quickHotels = bookingQuickHotels
    .filter((entry) => !queryText || normalizeText([entry.city, entry.country, entry.region, entry.summary].join(" ")).includes(queryText))
    .map((entry, index) => ({
      key: entry.id,
      title: `${entry.city} ${entry.region}`,
      city: entry.city,
      country: entry.country,
      neighborhood: entry.region,
      summary: entry.summary,
      images: [entry.image, ...buildHotelImageSet(entry.city, index + 1)].slice(0, 3),
      price: formatHotelPrice(entry.city, index),
      link: buildBookingSearchUrl({
        destinationText: `${entry.city}, ${entry.country}`,
        destinationId: entry.destinationId || "",
        checkin: activeSearch.startDate,
        checkout: activeSearch.endDate,
        adults: activeSearch.adults,
        children: activeSearch.children,
        rooms: activeSearch.rooms
      }),
      provider: "Booking",
      mode: "booking"
    }));

  return [...packageHotels, ...quickHotels].slice(0, 10);
}

function renderHotelListingCards(container, items, { emptyText = "No hay resultados.", badgeIconType = "" } = {}) {
  if (!container) return "";
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return "";
  }

  container.innerHTML = items.map((hotel) => `
    <article class="hotel-card hotel-card--listing">
      <div class="hotel-card__carousel image-carousel" data-image-carousel data-index="0" data-images="${encodeImageList(hotel.images)}">
        <img src="${hotel.images[0]}" alt="${hotel.title}" data-carousel-image />
        <div class="hotel-card__badge">${hotel.provider}</div>
        <div class="hotel-card__nav">
          <button type="button" data-carousel-prev aria-label="Imagen anterior">‹</button>
          <button type="button" data-carousel-next aria-label="Imagen siguiente">›</button>
        </div>
      </div>
      <div class="hotel-card__body">
        <div class="card-meta">${hotel.neighborhood}</div>
        <h3>${hotel.title}</h3>
        <p class="card-copy">${hotel.summary}</p>
        <div class="hotel-card__price">
          <span>Noche desde</span>
          <strong>${hotel.price.nightly}</strong>
        </div>
        <div class="hotel-card__price">
          <span>Total estimado</span>
          <strong>${hotel.price.total}</strong>
        </div>
        <div class="mini-map-badge">
          ${travelMapWidgets.buildMiniMapBadge({
            title: hotel.city,
            origin: hotel.country || "Hotel",
            destination: hotel.neighborhood,
            mode: "hotel",
            partyType: badgeIconType
          })}
        </div>
        <div class="provider-card__actions">
          <a class="button button--primary button--tiny" href="${hotel.link}" target="_blank" rel="noreferrer">Ver hotel</a>
        </div>
      </div>
    </article>
  `).join("");

  return container.innerHTML;
}

function renderHomeModeVisibility() {
  const hotelFlow = state.home.mode === "hotel-only" || state.home.transport;
  dom.homeFlightFields?.classList.toggle("is-hidden", hotelFlow);
  dom.homeHotelFields?.classList.toggle("is-hidden", !hotelFlow);
}

function getHomeSearchState() {
  return {
    city: dom.homeCity?.value.trim() || "",
    adults: Number(dom.homeAdults?.value || 2),
    children: Number(dom.homeChildren?.value || 0),
    mode: dom.homeModeHotelOnly?.checked ? "hotel-only" : "flight-hotel",
    transport: Boolean(dom.homeAirportTransport?.checked),
    origin: dom.homeOrigin?.value.trim() || "",
    departureDate: dom.homeDepartureDate?.value || "",
    returnDate: dom.homeReturnDate?.value || "",
    checkin: dom.homeCheckin?.value || "",
    checkout: dom.homeCheckout?.value || ""
  };
}

function collectFlightSuggestions(query, context) {
  const queryText = normalizeText(query);
  const activeSearch = {
    startDate: context.departureDate || context.checkin || "",
    endDate: context.returnDate || context.checkout || "",
    adults: context.adults || 2,
    children: context.children || 0
  };

  const flights = state.packages
    .filter((item) => ["pasaje", "vuelo", "flight"].includes(normalizeText(item.type)) || normalizeText(item.summary).includes("vuelo"))
    .filter((item) => {
      if (!queryText) return true;
      return normalizeText([
        item.title,
        item.city,
        item.country,
        item.summary,
        item.originCity,
        item.originCountry,
        item.destinationCode
      ].join(" ")).includes(queryText);
    })
    .slice(0, 4);

  const sourceFlights = flights.length ? flights : state.packages.filter((item) => normalizeText(item.type) === "pasaje").slice(0, 4);

  return sourceFlights.map((item) => ({
    key: item.id,
    title: item.title,
    route: `${item.originCity || item.originCode || "Origen"} → ${item.city || item.destinationCode || "Destino"}`,
    city: item.city,
    country: item.country,
    summary: item.summary || "Vuelo listo para abrir.",
    image: item.images[0] || PLACEHOLDER_IMAGE,
    price: item.finalPrice || item.basePrice || "Precio a definir",
    link: buildAffiliateLink(item, activeSearch),
    scales: item.scales || [],
    item
  }));
}

function renderHomeWorkbench() {
  const context = getHomeSearchState();
  state.home.mode = context.mode;
  state.home.transport = context.transport;
  renderHomeModeVisibility();
  const partyType = getPartyIconType(context.adults, context.children);

  if (!context.city) {
    if (dom.homeFlightsCount) dom.homeFlightsCount.textContent = "0";
    if (dom.homeHotelsCount) dom.homeHotelsCount.textContent = "0";
    if (dom.homeHotelsSummary) {
      dom.homeHotelsSummary.textContent = "Escribe una ciudad y al salir del campo cargamos hoteles.";
    }
    if (dom.homeFlightsGrid) {
      dom.homeFlightsGrid.innerHTML = `<div class="empty-state">Escribe una ciudad para ver vuelos.</div>`;
    }
    if (dom.homeHotelsGrid) {
      dom.homeHotelsGrid.innerHTML = `<div class="empty-state">Escribe una ciudad para ver hoteles.</div>`;
    }
    if (dom.homeTripSummary) {
      dom.homeTripSummary.textContent = "Escribe una ciudad y al salir del campo cargamos vuelos, hoteles y mapa.";
    }
    if (dom.homeTripMap) {
      travelMapWidgets.renderMiniMap("homeTripMap", {
        points: [],
        center: [16, 0],
        zoom: 2,
        showRoutes: false
      });
    }
    return;
  }

  const cityEntry = findCatalogCityMatch(context.city);
  const hotelCards = buildHotelListingCards(context.city, {
    cityEntry,
    cityLabel: cityEntry?.city || context.city,
    countryLabel: cityEntry?.country || "",
    adults: context.adults,
    children: context.children,
    rooms: context.transport ? 1 : 1,
    checkin: context.transport || context.mode === "hotel-only" ? context.checkin : context.departureDate,
    checkout: context.transport || context.mode === "hotel-only" ? context.checkout : context.returnDate
  });
  const flightCards = context.mode === "flight-hotel" && !context.transport ? collectFlightSuggestions(context.city, context) : [];
  const badgeIconType = partyType;
  pushLog("Home ciudad lista", `${cityEntry?.city || context.city}${cityEntry?.country ? `, ${cityEntry.country}` : ""}`);

  if (dom.homeFlightsCount) dom.homeFlightsCount.textContent = String(flightCards.length);
  if (dom.homeHotelsCount) dom.homeHotelsCount.textContent = String(hotelCards.length);
  if (dom.homeHotelsSummary) {
    dom.homeHotelsSummary.textContent = `Mostrando ${hotelCards.length} hoteles para ${cityEntry?.city || context.city}${cityEntry?.country ? `, ${cityEntry.country}` : ""}.`;
  }
  if (dom.homeTripSummary) {
    dom.homeTripSummary.textContent = context.city
      ? `${context.city}${cityEntry?.country ? `, ${cityEntry.country}` : ""} · ${context.mode === "flight-hotel" ? "vuelo + hotel" : "solo hotel"}${context.transport ? " · transporte desde el aeropuerto" : ""}`
      : "Escribe una ciudad para ver vuelos, hoteles y mapa.";
  }

  renderHotelListingCards(dom.homeHotelsGrid, hotelCards, {
    emptyText: "Escribe una ciudad y sal del campo para ver hoteles.",
    badgeIconType
  });

  void fetchBookingHotelSuggestions({
    query: context.city,
    cityEntry,
    cityLabel: cityEntry?.city || context.city,
    countryLabel: cityEntry?.country || "",
    checkin: context.transport || context.mode === "hotel-only" ? context.checkin : context.departureDate,
    checkout: context.transport || context.mode === "hotel-only" ? context.checkout : context.returnDate,
    adults: context.adults,
    children: context.children,
    rooms: 1
  }).then((bookingHotels) => {
    if (!bookingHotels.length || dom.homeCity?.value.trim() !== context.city) return;
    const bookingCards = bookingHotels.map((hotel, index) => ({
      key: `home-booking-${index}-${hotel.title}`,
      title: hotel.title,
      city: cityEntry?.city || context.city,
      country: cityEntry?.country || "",
      neighborhood: hotel.area || "Booking",
      summary: hotel.rating ? `Rating ${hotel.rating} · ${hotel.area || "Booking"}` : hotel.area || "Hotel encontrado en Booking.",
      images: hotel.image ? [hotel.image, ...buildHotelImageSet(cityEntry?.city || context.city || "Destino", index)].slice(0, 3) : buildHotelImageSet(cityEntry?.city || context.city || "Destino", index),
      price: {
        nightly: hotel.price || "Precio Booking",
        total: hotel.price || "Precio Booking"
      },
      link: hotel.url || "#",
      provider: "Booking",
      mode: "booking"
    }));
    renderHotelListingCards(dom.homeHotelsGrid, [...bookingCards, ...hotelCards].slice(0, 10), {
      emptyText: "Escribe una ciudad y sal del campo para ver hoteles.",
      badgeIconType
    });
    pushLog("Home Booking listo", `${bookingCards.length} resultados`);
  });

  if (dom.homeFlightsGrid) {
    if (!flightCards.length) {
      dom.homeFlightsGrid.innerHTML = context.mode === "flight-hotel"
        ? `<div class="empty-state">Todavía no hay vuelos para este destino.</div>`
        : `<div class="empty-state">Elegiste solo hotel, por eso los vuelos quedan ocultos.</div>`;
    } else {
      dom.homeFlightsGrid.innerHTML = flightCards.map((flight) => `
        <article class="flight-card">
          <div class="card-visual flight-card__visual">
            <img src="${flight.image}" alt="${flight.title}" />
            <div class="card-badge">Vuelo</div>
            <div class="mini-map-badge">
              ${travelMapWidgets.buildMiniMapBadge({
                title: flight.route,
                origin: flight.item.originCity || flight.item.originCode || "Origen",
                destination: flight.city || flight.item.destinationCode || "Destino",
                mode: "package",
                iconType: "plane"
              })}
            </div>
          </div>
          <div class="provider-card__body">
            <div class="card-meta">${flight.route}</div>
            <h3>${flight.title}</h3>
            <p class="card-copy">${flight.summary}</p>
            <div class="package-price"><span>Precio</span><strong>${flight.price}</strong></div>
            <div class="provider-card__actions">
              <a class="button button--primary button--tiny" href="${flight.link}" target="_blank" rel="noreferrer">Abrir vuelo</a>
            </div>
          </div>
        </article>
      `).join("");
    }
  }

  if (dom.homeTripMap) {
    const points = [];
    if (context.mode === "hotel-only" || context.transport) {
      if (cityEntry?.lat && cityEntry?.lng) {
        points.push({
          lat: cityEntry.lat,
          lng: cityEntry.lng,
          label: `${cityEntry.city}, ${cityEntry.country}`,
          color: "#dd7046",
          iconType: partyType
        });
      }
    } else {
      const sourceFlight = flightCards[0]?.item || null;
      if (sourceFlight) {
        const routePoints = resolveRoutePoints(sourceFlight);
        routePoints.forEach((point, index) => {
          points.push({
            lat: point[0],
            lng: point[1],
            label: index === 0 ? `${sourceFlight.originCity || sourceFlight.originCode || "Origen"}` : index === routePoints.length - 1 ? `${sourceFlight.city || sourceFlight.destinationCode || "Destino"}` : `Escala ${index}`,
            color: index === 0 ? "#1a7c64" : index === routePoints.length - 1 ? "#dd7046" : "#14556b"
          });
        });
        if (routePoints.length >= 2) {
          const first = routePoints[0];
          const last = routePoints[routePoints.length - 1];
          points.push({
            lat: (first[0] + last[0]) / 2,
            lng: (first[1] + last[1]) / 2,
            label: "Avión en ruta",
            color: "#dd7046",
            iconType: "plane"
          });
        }
      } else {
        const originAirport = airportCatalog[context.origin?.toUpperCase?.() || ""];
        const originEntry = findCatalogCityMatch(context.origin);
        if (originAirport) {
          points.push({
            lat: originAirport.lat,
            lng: originAirport.lng,
            label: `${originAirport.city}, ${originAirport.country}`,
            color: "#1a7c64"
          });
        } else if (originEntry?.lat && originEntry?.lng) {
          points.push({
            lat: originEntry.lat,
            lng: originEntry.lng,
            label: `${originEntry.city}, ${originEntry.country}`,
            color: "#1a7c64"
          });
        }
        if (cityEntry?.lat && cityEntry?.lng) {
          points.push({
            lat: cityEntry.lat,
            lng: cityEntry.lng,
            label: `${cityEntry.city}, ${cityEntry.country}`,
            color: "#dd7046",
            iconType: "plane"
          });
        }
      }
    }

    travelMapWidgets.renderMiniMap("homeTripMap", {
      points,
      center: points[0] ? [points[0].lat, points[0].lng] : [16, 0],
      zoom: points.length === 1 ? 5 : 3,
      showRoutes: true
    });
  }
}

function hashText(text) {
  return normalizeText(text)
    .split("")
    .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
}

function buildHotelImageSet(cityLabel, index) {
  const seed = Math.abs(hashText(`${cityLabel}-${index}`));
  return HOTEL_IMAGE_POOL.slice(0, 3).map((url, imageIndex) => `${url}&sig=${seed + imageIndex * 11}`);
}

function formatHotelPrice(baseCity, index) {
  const citySeed = Math.abs(hashText(baseCity));
  const nightly = 68 + ((citySeed % 7) * 14) + (index * 11);
  const total = nightly * 3;
  return {
    nightly: `USD ${nightly}`,
    total: `USD ${total}`
  };
}

function getPartyIconType(adults = 2, children = 0) {
  const adultCount = Number(adults || 0);
  const childCount = Number(children || 0);
  if (childCount > 0 || adultCount > 2) return "family";
  if (adultCount === 2) return "couple";
  return "single";
}

function getDefaultOriginCity() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const hit = TIMEZONE_CITY_FALLBACKS.find((entry) => timezone.includes(entry.match));
  return hit?.city || "Montevideo";
}

async function resolveCityFromCoordinates(lat, lng) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      }
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.municipality || data?.address?.county || "";
  } catch (error) {
    return "";
  }
}

async function prefillHomeOrigin() {
  if (!dom.homeOrigin || dom.homeOrigin.value.trim()) return;

  const applyValue = (value) => {
    if (!value || dom.homeOrigin.value.trim()) return;
    dom.homeOrigin.value = value;
    renderHomeWorkbench();
  };

  if (!navigator.geolocation) {
    applyValue(getDefaultOriginCity());
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const city = await resolveCityFromCoordinates(position.coords.latitude, position.coords.longitude);
    applyValue(city || getDefaultOriginCity());
  }, () => {
    applyValue(getDefaultOriginCity());
  }, {
    enableHighAccuracy: false,
    timeout: 3000,
    maximumAge: 86400000
  });
}

function resolveHotelSearchContext() {
  const destination = dom.miniBookingDestination.value.trim();
  const country = dom.miniBookingCountry.value.trim();
  const query = destination || country;
  const cityEntry = findHotelCityMatch(query);
  const cityLabel = cityEntry?.city || destination || country || "";
  const countryLabel = cityEntry?.country || country || "";
  return {
    query,
    cityEntry,
    cityLabel,
    countryLabel
  };
}

async function fetchBookingHotelSuggestions(search) {
  const key = [
    search.query,
    search.cityEntry?.city || "",
    search.cityEntry?.country || "",
    search.checkin || "",
    search.checkout || "",
    search.adults || 2,
    search.children || 0,
    search.rooms || 1
  ].join("|");
  if (state.bookingHotels.has(key)) return state.bookingHotels.get(key);
  if (!BOOKING_PROXY_URL) {
    state.bookingHotels.set(key, []);
    return [];
  }

  try {
    pushLog("Blur detectado, consultando Booking", search.query || search.cityEntry?.city || "");
    const params = new URLSearchParams();
    if (search.cityEntry?.city || search.query) params.set("destination", search.cityEntry?.city || search.query);
    if (search.cityEntry?.country) params.set("country", search.cityEntry.country);
    if (search.checkin) params.set("checkin", search.checkin);
    if (search.checkout) params.set("checkout", search.checkout);
    params.set("adults", String(search.adults || 2));
    params.set("children", String(search.children || 0));
    params.set("rooms", String(search.rooms || 1));
    if (search.cityEntry?.bookingDestId) params.set("destId", search.cityEntry.bookingDestId);
    const response = await fetch(`${BOOKING_PROXY_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const hotels = Array.isArray(data?.hotels) ? data.hotels : [];
    state.bookingHotels.set(key, hotels);
    pushLog(hotels.length ? "Booking devolvió hoteles" : "Booking sin resultados", `${hotels.length} resultados`);
    // eslint-disable-next-line no-console
    console.log("[travel-site] booking-hotels", {
      query: search.query,
      city: search.cityEntry?.city || search.query || "",
      country: search.cityEntry?.country || "",
      fetched: Boolean(data?.fetched),
      count: hotels.length,
      source: data?.source || "booking"
    });
    return hotels;
  } catch (error) {
    pushLog("Error en Booking, sin datos remotos", String(error?.message || error));
    // eslint-disable-next-line no-console
    console.log("[travel-site] booking-hotels-error", {
      query: search.query,
      city: search.cityEntry?.city || search.query || "",
      error: String(error?.message || error)
    });
    state.bookingHotels.set(key, []);
    return [];
  }
}

async function buildHotelSuggestions() {
  if (!dom.hotelSuggestionsGrid || !dom.hotelSuggestionsSummary) return;
  const { query, cityEntry, cityLabel, countryLabel } = resolveHotelSearchContext();
  const badgeIconType = getPartyIconType(dom.miniBookingAdults?.value, dom.miniBookingChildren?.value);
  let hotelCards = buildHotelListingCards(query, {
    cityEntry,
    cityLabel,
    countryLabel,
    adults: Number(dom.miniBookingAdults.value || 2),
    children: Number(dom.miniBookingChildren.value || 0),
    rooms: Number(dom.miniBookingRooms.value || 1),
    checkin: dom.miniBookingCheckin.value,
    checkout: dom.miniBookingCheckout.value
  });

  if (!query) {
    pushLog("Blur sin ciudad", "No se disparó búsqueda");
    dom.hotelSuggestionsSummary.textContent = "Selecciona una ciudad y al salir del campo cargaremos 10 hoteles.";
    dom.hotelSuggestionsGrid.innerHTML = `<div class="empty-state">Escribe una ciudad para ver hoteles sugeridos.</div>`;
    return;
  }

  pushLog("Ciudad destino lista", `${cityLabel || query}${countryLabel ? `, ${countryLabel}` : ""}`);
  dom.hotelSuggestionsSummary.textContent = `Buscando hoteles para ${cityLabel || query}${countryLabel ? `, ${countryLabel}` : ""}...`;
  renderHotelListingCards(dom.hotelSuggestionsGrid, hotelCards, {
    emptyText: "No hay hoteles sugeridos para este destino.",
    badgeIconType
  });

  const bookingHotels = await fetchBookingHotelSuggestions({
    query,
    cityEntry,
    cityLabel,
    countryLabel,
    checkin: dom.miniBookingCheckin.value,
    checkout: dom.miniBookingCheckout.value,
    adults: Number(dom.miniBookingAdults.value || 2),
    children: Number(dom.miniBookingChildren.value || 0),
    rooms: Number(dom.miniBookingRooms.value || 1)
  });

  if (bookingHotels.length) {
    const bookingCards = bookingHotels.map((hotel, index) => ({
      key: `booking-${index}-${hotel.title}`,
      title: hotel.title,
      city: cityLabel || query,
      country: countryLabel,
      neighborhood: hotel.area || "Booking",
      summary: hotel.rating ? `Rating ${hotel.rating} · ${hotel.area || "Booking"}` : hotel.area || "Hotel encontrado en Booking.",
      images: hotel.image ? [hotel.image, ...buildHotelImageSet(cityLabel || query || "Destino", index)].slice(0, 3) : buildHotelImageSet(cityLabel || query || "Destino", index),
      price: {
        nightly: hotel.price || "Precio Booking",
        total: hotel.price || "Precio Booking"
      },
      link: hotel.url || "#",
      provider: "Booking",
      mode: "booking"
    }));
    hotelCards = [...bookingCards, ...hotelCards].slice(0, 10);
  } else if (!hotelCards.length) {
    dom.hotelSuggestionsSummary.textContent = `No hay hoteles locales para ${cityLabel || query}${countryLabel ? `, ${countryLabel}` : ""}.`;
    renderHotelListingCards(dom.hotelSuggestionsGrid, [], {
      emptyText: "No hay hoteles sugeridos para este destino.",
      badgeIconType
    });
    return;
  }

  if (!bookingHotels.length && hotelCards.length) {
    dom.hotelSuggestionsSummary.textContent = `Mostrando ${hotelCards.length} hoteles locales para ${cityLabel || query}${countryLabel ? `, ${countryLabel}` : ""}.`;
    renderHotelListingCards(dom.hotelSuggestionsGrid, hotelCards, {
      emptyText: "No hay hoteles sugeridos para este destino.",
      badgeIconType
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.log("[travel-site] hotel-suggestions-render", {
    query,
    city: cityLabel || query,
    country: countryLabel,
    cards: hotelCards.length,
    bookingCards: bookingHotels.length
  });

  dom.hotelSuggestionsSummary.textContent = `Mostrando ${hotelCards.length} hoteles para ${cityLabel || query}${countryLabel ? `, ${countryLabel}` : ""}.`;
  renderHotelListingCards(dom.hotelSuggestionsGrid, hotelCards, {
    emptyText: "No hay hoteles sugeridos para este destino.",
    badgeIconType
  });
}

function searchOfferByQuery(query) {
  const normalized = normalizeText(query);
  if (!normalized) return null;
  return state.packages.find((item) => normalizeText([
    item.title,
    item.city,
    item.country,
    item.summary,
    item.themeTag,
    ...(item.highlights || [])
  ].join(" ")).includes(normalized)) || null;
}

function renderChatbot() {
  if (!dom.chatbotMessages) return;
  dom.chatbotMessages.innerHTML = `
    <div class="chatbot__bubble chatbot__bubble--bot">Escribe una ciudad o país. Si hay una promo cargada, te la muestro enseguida.</div>
  `;
}

function appendChatbotMessage(text, kind = "bot") {
  if (!dom.chatbotMessages) return;
  const bubble = document.createElement("div");
  bubble.className = `chatbot__bubble chatbot__bubble--${kind}`;
  bubble.textContent = text;
  dom.chatbotMessages.appendChild(bubble);
  dom.chatbotMessages.scrollTop = dom.chatbotMessages.scrollHeight;
}

function renderOfferResultCard(item, query) {
  if (!dom.chatbotMessages) return;
  const resolvedLink = buildAffiliateLink(item, getSearchState());
  const result = document.createElement("div");
  result.className = "chatbot__bubble chatbot__bubble--bot chatbot__result";
  result.innerHTML = `
    <strong>Encontré esta oferta para ti</strong>
    <span>${item.title}</span>
    <span>${item.city}, ${item.country} · ${item.finalPrice || item.basePrice || "-"}</span>
    <span>${item.summary || "Sin descripción."}</span>
    <a class="button button--primary button--tiny chatbot__result-link" href="${resolvedLink}" target="_blank" rel="noreferrer">Abrir oferta</a>
  `;
  dom.chatbotMessages.appendChild(result);
  dom.chatbotMessages.scrollTop = dom.chatbotMessages.scrollHeight;
}

function handleChatbotSearch(rawQuery) {
  const query = rawQuery.trim();
  if (!query) return;
  appendChatbotMessage(query, "user");
  const offer = searchOfferByQuery(query);
  if (offer) {
    renderOfferResultCard(offer, query);
  } else {
    appendChatbotMessage("No encontré una promo cargada para esa búsqueda.", "bot");
  }
}

function renderPackageDetailMap(item) {
  const container = document.getElementById("packageDetailMap");
  if (!container || !travelMapWidgets.renderMiniMap) return;
  const origin = item.originCode && airportCatalog[item.originCode] ? airportCatalog[item.originCode] : null;
  const destination = resolvePackageCoords(item);
  const points = [];

  if (origin) {
    points.push({
      lat: origin.lat,
      lng: origin.lng,
      label: `${origin.city}, ${origin.country}`,
      color: "#1a7c64"
    });
  }

  if (destination) {
    points.push({
      lat: destination[0],
      lng: destination[1],
      label: `${item.city}, ${item.country}`,
      color: "#dd7046"
    });
  }

  travelMapWidgets.renderMiniMap("packageDetailMap", {
    points,
    center: points[0] ? [points[0].lat, points[0].lng] : [16, 0],
    zoom: points.length === 1 ? 5 : 3,
    showRoutes: true
  });
}

function renderPackages() {
  const filters = getSearchState();
  if (!Array.isArray(state.packages) || !state.packages.length) {
    state.packages = getDefaultPackages();
    savePackages();
  }
  state.filteredPackages = state.packages.filter((item) => packageMatchesFilters(item, filters));
  if (dom.heroPackagesCount) dom.heroPackagesCount.textContent = String(state.packages.length);
  dom.resultsCount.textContent = String(state.filteredPackages.length);
  dom.searchSummary.textContent = buildSearchSummary(filters);

  if (!state.filteredPackages.length) {
    dom.packagesGrid.innerHTML = `<div class="empty-state">${getTranslation("fallback_no_results")}</div>`;
    renderPackagesMiniMap();
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
          <div class="mini-map-badge">
            ${travelMapWidgets.buildMiniMapBadge({
              title: item.city || item.title,
              origin: item.originCity || item.originCode || "Origen",
              destination: item.destinationCode || item.city || "Destino",
              mode: "package"
            })}
          </div>
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
  renderPackagesMiniMap();
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
  if (dom.heroCountriesCount) dom.heroCountriesCount.textContent = String(state.countries.length);

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
        <div id="packageDetailMap" class="mini-map-frame mini-map-frame--modal"></div>
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
  renderPackageDetailMap(item);
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
  travelTabs.setActiveTab?.("cruises");
  state.map.setView(coords, 5, { animate: true });
  closeModal();
  refreshVisibleMaps();
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("is-open");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    dom.toast.classList.remove("is-open");
  }, 2400);
}

function pushLog(text, meta = "") {
  const item = { time: new Date().toLocaleTimeString(), text, meta };
  state.logEntries.unshift(item);
  state.logEntries = state.logEntries.slice(0, 24);
  if (dom.logFeed) {
    dom.logFeed.innerHTML = state.logEntries.map((entry) => `
      <article class="log-entry">
        <div class="log-entry__meta">${entry.time}${entry.meta ? ` · ${entry.meta}` : ""}</div>
        <div class="log-entry__text">${entry.text}</div>
      </article>
    `).join("");
  }
  if (dom.logStatus) dom.logStatus.textContent = `${state.logEntries.length} eventos visibles`;
}

function setupTravelCursor() {
  if (!dom.travelCursor) return;
  const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)");
  if (!finePointer.matches) return;

  document.body.classList.add("has-custom-cursor");

  const cursor = dom.travelCursor;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let rafId = 0;
  let visible = false;
  let sparkleTimer = 0;
  let spinTimer = 0;
  let spinFrameId = 0;

  const step = () => {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    cursor.style.setProperty("--cursor-x", `${currentX - 28}px`);
    cursor.style.setProperty("--cursor-y", `${currentY - 28}px`);
    if (visible) {
      cursor.classList.add("is-visible");
      rafId = window.requestAnimationFrame(step);
      return;
    }
    rafId = 0;
  };

  const handlePointerMove = (event) => {
    if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    targetX = event.clientX;
    targetY = event.clientY;
    visible = true;
    if (!rafId) {
      rafId = window.requestAnimationFrame(step);
    }
  };

  const showCursor = () => {
    visible = true;
    cursor.classList.add("is-visible");
  };

  const hideCursor = () => {
    visible = false;
    cursor.classList.remove("is-visible");
    cursor.classList.remove("is-clicking");
  };

  const handleDown = () => cursor.classList.add("is-clicking");
  const handleUp = () => cursor.classList.remove("is-clicking");

  const triggerSparkleSpin = () => {
    if (!visible) return;
    cursor.classList.add("is-spinning");
    cursor.classList.add("is-sparkling");
    const plane = cursor.querySelector(".travel-cursor__plane");
    if (!plane) return;
    const start = performance.now();
    const duration = 900;

    const spin = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const angle = progress * 360;
      plane.style.transform = `rotate(${angle}deg)`;
      if (progress < 1 && visible) {
        spinFrameId = window.requestAnimationFrame(spin);
        return;
      }
      plane.style.transform = "";
      cursor.classList.remove("is-spinning");
      window.setTimeout(() => cursor.classList.remove("is-sparkling"), 300);
    };

    if (spinFrameId) window.cancelAnimationFrame(spinFrameId);
    spinFrameId = window.requestAnimationFrame(spin);
  };

  const scheduleSparkleSpin = () => {
    window.clearInterval(spinTimer);
    spinTimer = window.setInterval(triggerSparkleSpin, 10000);
  };

  document.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.addEventListener("pointerdown", handleDown, { passive: true });
  document.addEventListener("pointerup", handleUp, { passive: true });
  document.addEventListener("pointerleave", hideCursor);
  window.addEventListener("blur", hideCursor);
  window.addEventListener("focus", showCursor);
  document.addEventListener("mouseenter", showCursor, { passive: true });
  document.addEventListener("mouseleave", hideCursor, { passive: true });

  window.addEventListener("scroll", () => {
    if (visible) cursor.classList.add("is-visible");
  }, { passive: true });

  window.addEventListener("blur", () => {
    visible = false;
    cursor.classList.remove("is-visible");
    cursor.classList.remove("is-clicking");
  });

  sparkleTimer = window.setTimeout(() => {
    scheduleSparkleSpin();
    triggerSparkleSpin();
  }, 10000);

  window.addEventListener("focus", () => {
    if (!spinTimer) scheduleSparkleSpin();
  });
}

function renderAll() {
  try {
    renderHomeWorkbench();
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

function refreshVisibleMaps() {
  renderHomeWorkbench();
  renderPackagesMiniMap();
  renderHotelMiniMap();
  void buildHotelSuggestions();
  if (state.map) {
    window.requestAnimationFrame(() => state.map.invalidateSize());
  }
  travelMapWidgets.invalidateMiniMap?.("packagesMiniMap");
  travelMapWidgets.invalidateMiniMap?.("hotelMiniMap");
}

function bindEvents() {
  window.addEventListener("travel:tabchange", (event) => {
    state.activeTab = event.detail?.tab || "home";
    refreshVisibleMaps();
  });

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

  [
    dom.homeCity,
    dom.homeAdults,
    dom.homeChildren,
    dom.homeOrigin,
    dom.homeDepartureDate,
    dom.homeReturnDate,
    dom.homeCheckin,
    dom.homeCheckout
  ].forEach((input) => {
    input?.addEventListener("input", renderHomeWorkbench);
    input?.addEventListener("blur", () => {
      if (input === dom.homeCity && dom.homeCity?.value.trim()) {
        pushLog("Home ciudad seleccionada", dom.homeCity.value.trim());
      }
      renderHomeWorkbench();
    });
    input?.addEventListener("change", () => {
      if (input === dom.homeCity && dom.homeCity?.value.trim()) {
        pushLog("Home ciudad cambiada", dom.homeCity.value.trim());
      }
      renderHomeWorkbench();
    });
  });

  [dom.homeModeFlightHotel, dom.homeModeHotelOnly, dom.homeAirportTransport].forEach((input) => {
    input?.addEventListener("change", () => {
      state.home.mode = dom.homeModeHotelOnly?.checked ? "hotel-only" : "flight-hotel";
      state.home.transport = Boolean(dom.homeAirportTransport?.checked);
      renderHomeModeVisibility();
      renderHomeWorkbench();
    });
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

  [dom.miniBookingDestination, dom.miniBookingCountry].forEach((input) => {
    input.addEventListener("blur", () => {
      if (dom.miniBookingDestination.value.trim() || dom.miniBookingCountry.value.trim()) {
        pushLog("Hotel ciudad seleccionada", [dom.miniBookingDestination.value.trim(), dom.miniBookingCountry.value.trim()].filter(Boolean).join(", "));
      }
      renderHotelMiniMap();
      void buildHotelSuggestions();
      refreshVisibleMaps();
    });
  });

  Array.from(document.querySelectorAll("[data-hotel-provider]")).forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.dataset.hotelProvider;
      dom.miniBookingProvider.value = provider;
      const search = getMiniBookingState();
      const destinationText = [search.destination, search.country].filter(Boolean).join(", ");
      if (!destinationText) {
        showToast("Completa destino para abrir el proveedor.");
        return;
      }

      const activeSearch = {
        startDate: search.checkin,
        endDate: search.checkout,
        adults: search.adults,
        children: search.children
      };

      const providerItem = sanitizePackage({
        title: `${referralProviders[provider]?.label || provider} hotel search`,
        city: search.destination,
        country: search.country,
        startDate: search.checkin,
        endDate: search.checkout,
        referral: {
          provider,
          kind: provider === "booking" ? "search" : "hotel",
          affiliateId: "",
          destinationId: search.bookingDestId,
          destinationType: "city",
          rooms: search.rooms,
          campaign: "hotel_tab_action",
          baseUrl: ""
        },
        link: "#"
      });

      const url = buildAffiliateLink(providerItem, activeSearch);
      if (!url) {
        showToast("Completa check-in y check-out para abrir ese proveedor.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });
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

  if (dom.chatbotForm && dom.chatbotInput) {
    dom.chatbotForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleChatbotSearch(dom.chatbotInput.value);
      dom.chatbotInput.value = "";
    });
  }

  if (dom.chatbotClose && dom.chatbot) {
    dom.chatbotClose.addEventListener("click", () => {
      dom.chatbot.classList.add("is-collapsed");
    });
  }

  dom.logClearButton?.addEventListener("click", () => {
    state.logEntries = [];
    if (dom.logFeed) dom.logFeed.innerHTML = "";
    if (dom.logStatus) dom.logStatus.textContent = "0 eventos visibles";
  });

  if (dom.chatbotToggle && dom.chatbot) {
    dom.chatbotToggle.addEventListener("click", () => {
      dom.chatbot.classList.remove("is-collapsed");
      dom.chatbotInput?.focus();
    });
  }

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
  renderChatbot();
  if (dom.adminForm) resetAdminForm();
  if (dom.adminApp) setAdminVisibility();
  bindEvents();
  setupTravelCursor();
  prefillHomeOrigin();
  travelTabs.initTabs?.("home");
  loadGlobalCountries();
  savePackages();
  renderAll();
}

init();
})();

function compactObject(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function ensureUrl(input, fallback) {
  try {
    return new URL(input || fallback);
  } catch (error) {
    return new URL(fallback);
  }
}

function addTracking(url, referral) {
  const tracking = compactObject({
    utm_source: "app",
    utm_medium: "affiliate",
    utm_campaign: referral.campaign || "travel_site"
  });

  Object.entries(tracking).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

function addCustomParams(url, referral) {
  const customParams = referral.customParams || {};
  Object.entries(customParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

function formatSkyscannerDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${year.slice(-2)}${month}${day}`;
}

function formatExpediaDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${month}/${day}/${year}`;
}

function buildBookingLink(payload) {
  if (payload.kind === "hotel" && payload.hotelSlug) {
    const normalizedSlug = payload.hotelSlug.startsWith("http")
      ? payload.hotelSlug
      : `https://www.booking.com/${payload.hotelSlug.replace(/^\/+/, "")}`;
    const url = ensureUrl(normalizedSlug, "https://www.booking.com/");
    if (payload.affiliateId) url.searchParams.set("aid", payload.affiliateId);
    if (payload.checkin) url.searchParams.set("checkin", payload.checkin);
    if (payload.checkout) url.searchParams.set("checkout", payload.checkout);
    if (payload.adults) url.searchParams.set("group_adults", String(payload.adults));
    if (payload.rooms) url.searchParams.set("no_rooms", String(payload.rooms));
    addCustomParams(url, payload);
    return addTracking(url, payload);
  }

  if (!payload.checkin || !payload.checkout) return "";
  const url = ensureUrl(payload.baseUrl, "https://www.booking.com/searchresults.html");
  if (payload.affiliateId) url.searchParams.set("aid", payload.affiliateId);
  url.searchParams.set("checkin", payload.checkin);
  url.searchParams.set("checkout", payload.checkout);
  if (payload.destinationId) {
    url.searchParams.set("dest_id", payload.destinationId);
    url.searchParams.set("dest_type", payload.destinationType || "city");
  } else if (payload.destinationText) {
    url.searchParams.set("ss", payload.destinationText);
  } else {
    return "";
  }
  url.searchParams.set("group_adults", String(payload.adults || 1));
  if (payload.children) url.searchParams.set("group_children", String(payload.children));
  url.searchParams.set("no_rooms", String(payload.rooms || 1));
  addCustomParams(url, payload);
  return addTracking(url, payload);
}

function buildSkyscannerLink(payload) {
  if (!payload.originCode || !payload.destinationCode || !payload.checkin) return "";
  const departure = formatSkyscannerDate(payload.checkin);
  const returning = formatSkyscannerDate(payload.checkout);
  const path = returning
    ? `https://www.skyscanner.net/transport/flights/${payload.originCode.toLowerCase()}/${payload.destinationCode.toLowerCase()}/${departure}/${returning}/`
    : `https://www.skyscanner.net/transport/flights/${payload.originCode.toLowerCase()}/${payload.destinationCode.toLowerCase()}/${departure}/`;
  const url = ensureUrl(payload.baseUrl || path, path);
  url.searchParams.set("adults", String(payload.adults || 1));
  if (payload.affiliateId) url.searchParams.set("partner", payload.affiliateId);
  addCustomParams(url, payload);
  return addTracking(url, payload);
}

function buildExpediaLink(payload) {
  if (!payload.destinationText) return "";
  const fallbackBase = payload.kind === "flight"
    ? "https://www.expedia.com/Flights-Search"
    : payload.kind === "package"
      ? "https://www.expedia.com/Packages"
      : "https://www.expedia.com/Hotel-Search";
  const url = ensureUrl(payload.baseUrl, fallbackBase);
  if (payload.kind === "flight") {
    const departureDate = formatExpediaDate(payload.checkin);
    const returnDate = formatExpediaDate(payload.checkout);
    url.searchParams.set("trip", payload.checkout ? "roundtrip" : "oneway");
    if (payload.originCode) {
      url.searchParams.set(
        "leg1",
        `from:${String(payload.originCode).toUpperCase()},to:${String(payload.destinationCode || payload.destinationText).toUpperCase()},departure:${departureDate}`
      );
    }
    if (payload.checkout) {
      url.searchParams.set(
        "leg2",
        `from:${String(payload.destinationCode || payload.destinationText).toUpperCase()},to:${String(payload.originCode).toUpperCase()},departure:${returnDate}`
      );
    }
    url.searchParams.set("passengers", `adults:${payload.adults || 1}`);
  } else {
    url.searchParams.set("destination", payload.destinationText);
    if (payload.checkin) url.searchParams.set("startDate", payload.checkin);
    if (payload.checkout) url.searchParams.set("endDate", payload.checkout);
    url.searchParams.set("adults", String(payload.adults || 1));
    url.searchParams.set("rooms", String(payload.rooms || 1));
  }
  if (payload.affiliateId) url.searchParams.set("cid", payload.affiliateId);
  addCustomParams(url, payload);
  return addTracking(url, payload);
}

function buildCruiseDirectLink(payload) {
  if (!payload.destinationText || !payload.cruiseMonth) return "";
  const url = ensureUrl(payload.baseUrl, "https://www.cruisedirect.com/search");
  url.searchParams.set("destination", payload.destinationText);
  url.searchParams.set("date", payload.cruiseMonth);
  if (payload.affiliateId) url.searchParams.set("affiliate_id", payload.affiliateId);
  addCustomParams(url, payload);
  return addTracking(url, payload);
}

function buildAgodaLink(payload) {
  if (!payload.destinationCity || !payload.checkin || !payload.checkout) return "";
  const url = ensureUrl(payload.baseUrl, "https://www.agoda.com/search");
  url.searchParams.set("city", payload.destinationCity);
  url.searchParams.set("checkIn", payload.checkin);
  url.searchParams.set("checkOut", payload.checkout);
  if (payload.affiliateId) url.searchParams.set("cid", payload.affiliateId);
  addCustomParams(url, payload);
  return addTracking(url, payload);
}

const referralProviders = {
  custom: {
    label: "Custom",
    build() {
      return "";
    }
  },
  booking: {
    label: "Booking",
    build: buildBookingLink
  },
  skyscanner: {
    label: "Skyscanner",
    build: buildSkyscannerLink
  },
  expedia: {
    label: "Expedia",
    build: buildExpediaLink
  },
  cruisedirect: {
    label: "CruiseDirect",
    build: buildCruiseDirectLink
  },
  agoda: {
    label: "Agoda",
    build: buildAgodaLink
  }
};

function buildReferralPayload(item, search) {
  const referral = item.referral || {};
  const checkin = search.startDate || item.startDate;
  const checkout = search.endDate || item.endDate;
  const cruiseMonth = checkin ? checkin.slice(0, 7) : "";

  return {
    provider: referral.provider || "custom",
    kind: referral.kind || "search",
    affiliateId: referral.affiliateId || "",
    hotelSlug: referral.hotelSlug || "",
    destinationId: referral.destinationId || "",
    destinationType: referral.destinationType || "city",
    destinationText: item.city || item.country || item.title,
    destinationCity: item.city || "",
    originCode: item.originCode || "",
    destinationCode: item.destinationCode || "",
    checkin,
    checkout,
    adults: search.adults || 1,
    children: search.children || 0,
    rooms: referral.rooms || 1,
    cruiseMonth,
    campaign: referral.campaign || "",
    baseUrl: referral.baseUrl || "",
    customParams: referral.customParams || {}
  };
}

function buildAffiliateLink(item, search) {
  const referral = item.referral || {};
  if (!referral.provider || referral.provider === "custom") return item.link;
  const provider = referralProviders[referral.provider];
  if (!provider) return item.link;
  const payload = buildReferralPayload(item, search);
  const built = provider.build(payload);
  return built || item.link;
}

function inspectAffiliateLink(item, search) {
  const payload = buildReferralPayload(item, search);
  const provider = referralProviders[payload.provider];
  const url = provider ? provider.build(payload) || item.link : item.link;
  try {
    const parsed = new URL(url);
    return {
      provider: provider?.label || "Custom",
      kind: payload.kind,
      url,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      params: Object.fromEntries(parsed.searchParams.entries())
    };
  } catch (error) {
    return {
      provider: provider?.label || "Custom",
      kind: payload.kind,
      url,
      hostname: "",
      pathname: "",
      params: {}
    };
  }
}

window.TravelAffiliateLinks = {
  referralProviders,
  buildReferralPayload,
  buildAffiliateLink,
  inspectAffiliateLink
};

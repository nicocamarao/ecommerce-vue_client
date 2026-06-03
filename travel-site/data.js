const themes = {
  ocean: {
    "--primary": "#14556b",
    "--primary-strong": "#0e4051",
    "--accent": "#dd7046",
    "--accent-soft": "#f1bb87",
    "--bg": "#f4efe5",
    "--bg-soft": "#fffaf3"
  },
  sunset: {
    "--primary": "#8d4a28",
    "--primary-strong": "#6a3218",
    "--accent": "#ea6c4a",
    "--accent-soft": "#f6c08a",
    "--bg": "#f8eee6",
    "--bg-soft": "#fff7f0"
  },
  forest: {
    "--primary": "#21564b",
    "--primary-strong": "#173f37",
    "--accent": "#97ad5d",
    "--accent-soft": "#d4d79a",
    "--bg": "#eef2ea",
    "--bg-soft": "#f7fbf4"
  }
};

const tips = [
  {
    title: "Revisa reglas antes de vender la tarifa",
    body: "Cambios, equipaje, tasas y política de cancelación deberían quedar claros antes de pasar el link final.",
    source: "Operación comercial"
  },
  {
    title: "Deja visible si el vuelo tiene escalas",
    body: "Cuando la app muestra escala, aerolínea y duración, baja mucho la fricción antes del clic.",
    source: "UX de viajes"
  },
  {
    title: "Pide edades de niños desde el buscador",
    body: "Ese dato permite filtrar mejor y luego construir links reales para proveedores que lo necesitan.",
    source: "Diseño futuro de links"
  },
  {
    title: "Usa ciudades, aeropuertos y barrio",
    body: "El mapa y la ficha se entienden mejor si mezclas ubicación general con el detalle operativo del producto.",
    source: "Contenido geográfico"
  },
  {
    title: "No escondas el link final",
    body: "El enlace visible es parte central del sitio porque el objetivo comercial es que el usuario lo abra con confianza.",
    source: "Conversión"
  },
  {
    title: "Mantén JSON de respaldo",
    body: "Exportar e importar te da un mini sistema de backups y un puente natural hacia backend cuando decidas migrar.",
    source: "Mantenimiento"
  }
];

const exoticPlaces = [
  {
    title: "Socotra, Yemen",
    summary: "Isla remota con árboles drago y un paisaje casi alienígena. Funciona muy bien como apertura editorial fuerte.",
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Wadi Rum, Jordania",
    summary: "Desierto rojo, campamentos boutique y narrativa de aventura premium para viajeros de alto interés visual.",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Raja Ampat, Indonesia",
    summary: "Archipiélago icónico de buceo y agua transparente. Excelente para dar tono aspiracional al sitio.",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Salar de Uyuni, Bolivia",
    summary: "Minimalismo puro, reflejos y estética inconfundible para una sección de inspiración de alto impacto.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  }
];

const airportCatalog = {
  MVD: { code: "MVD", city: "Montevideo", country: "Uruguay", lat: -34.8384, lng: -56.0308 },
  PDP: { code: "PDP", city: "Punta del Este", country: "Uruguay", lat: -34.8551, lng: -55.0943 },
  GIG: { code: "GIG", city: "Rio de Janeiro", country: "Brasil", lat: -22.809, lng: -43.2506 },
  SDU: { code: "SDU", city: "Rio de Janeiro", country: "Brasil", lat: -22.9105, lng: -43.1631 },
  SCL: { code: "SCL", city: "Santiago", country: "Chile", lat: -33.3929, lng: -70.7858 },
  MAD: { code: "MAD", city: "Madrid", country: "España", lat: 40.4983, lng: -3.5676 },
  LIM: { code: "LIM", city: "Lima", country: "Perú", lat: -12.0219, lng: -77.1143 },
  PTY: { code: "PTY", city: "Panamá", country: "Panamá", lat: 9.0714, lng: -79.3835 },
  GRU: { code: "GRU", city: "Sao Paulo", country: "Brasil", lat: -23.4356, lng: -46.4731 },
  EZE: { code: "EZE", city: "Buenos Aires", country: "Argentina", lat: -34.8222, lng: -58.5358 },
  BRC: { code: "BRC", city: "Bariloche", country: "Argentina", lat: -41.1512, lng: -71.1575 },
  AEP: { code: "AEP", city: "Buenos Aires", country: "Argentina", lat: -34.5592, lng: -58.4156 },
  ASU: { code: "ASU", city: "Asunción", country: "Paraguay", lat: -25.2399, lng: -57.5191 },
  FLN: { code: "FLN", city: "Florianópolis", country: "Brasil", lat: -27.6703, lng: -48.5525 }
};

const countryCatalog = [
  {
    name: "Uruguay",
    cca2: "UY",
    region: "Americas",
    subregion: "South America",
    capital: ["Montevideo"],
    latlng: [-32.5228, -55.7658],
    flags: { png: "https://flagcdn.com/w320/uy.png" },
    translations: {
      spa: { common: "Uruguay" },
      por: { common: "Uruguai" }
    }
  },
  {
    name: "Argentina",
    cca2: "AR",
    region: "Americas",
    subregion: "South America",
    capital: ["Buenos Aires"],
    latlng: [-34, -64],
    flags: { png: "https://flagcdn.com/w320/ar.png" },
    translations: {
      spa: { common: "Argentina" },
      por: { common: "Argentina" }
    }
  },
  {
    name: "Brasil",
    cca2: "BR",
    region: "Americas",
    subregion: "South America",
    capital: ["Brasília"],
    latlng: [-10.3333, -53.2],
    flags: { png: "https://flagcdn.com/w320/br.png" },
    translations: {
      spa: { common: "Brasil" },
      por: { common: "Brasil" }
    }
  },
  {
    name: "Paraguay",
    cca2: "PY",
    region: "Americas",
    subregion: "South America",
    capital: ["Asunción"],
    latlng: [-23.4425, -58.4438],
    flags: { png: "https://flagcdn.com/w320/py.png" },
    translations: {
      spa: { common: "Paraguay" },
      por: { common: "Paraguai" }
    }
  },
  {
    name: "Chile",
    cca2: "CL",
    region: "Americas",
    subregion: "South America",
    capital: ["Santiago"],
    latlng: [-30, -71],
    flags: { png: "https://flagcdn.com/w320/cl.png" },
    translations: {
      spa: { common: "Chile" },
      por: { common: "Chile" }
    }
  },
  {
    name: "Perú",
    cca2: "PE",
    region: "Americas",
    subregion: "South America",
    capital: ["Lima"],
    latlng: [-9.19, -75.0152],
    flags: { png: "https://flagcdn.com/w320/pe.png" },
    translations: {
      spa: { common: "Perú" },
      por: { common: "Peru" }
    }
  },
  {
    name: "Panamá",
    cca2: "PA",
    region: "Americas",
    subregion: "Central America",
    capital: ["Ciudad de Panamá"],
    latlng: [8.538, -80.7821],
    flags: { png: "https://flagcdn.com/w320/pa.png" },
    translations: {
      spa: { common: "Panamá" },
      por: { common: "Panamá" }
    }
  },
  {
    name: "México",
    cca2: "MX",
    region: "Americas",
    subregion: "North America",
    capital: ["Ciudad de México"],
    latlng: [23.6345, -102.5528],
    flags: { png: "https://flagcdn.com/w320/mx.png" },
    translations: {
      spa: { common: "México" },
      por: { common: "México" }
    }
  },
  {
    name: "Estados Unidos",
    cca2: "US",
    region: "Americas",
    subregion: "North America",
    capital: ["Washington D.C."],
    latlng: [39.3813, -97.9222],
    flags: { png: "https://flagcdn.com/w320/us.png" },
    translations: {
      spa: { common: "Estados Unidos" },
      por: { common: "Estados Unidos" }
    }
  },
  {
    name: "Canadá",
    cca2: "CA",
    region: "Americas",
    subregion: "North America",
    capital: ["Ottawa"],
    latlng: [56.1304, -106.3468],
    flags: { png: "https://flagcdn.com/w320/ca.png" },
    translations: {
      spa: { common: "Canadá" },
      por: { common: "Canadá" }
    }
  },
  {
    name: "España",
    cca2: "ES",
    region: "Europe",
    subregion: "Southern Europe",
    capital: ["Madrid"],
    latlng: [40, -4],
    flags: { png: "https://flagcdn.com/w320/es.png" },
    translations: {
      spa: { common: "España" },
      por: { common: "Espanha" }
    }
  },
  {
    name: "Portugal",
    cca2: "PT",
    region: "Europe",
    subregion: "Southern Europe",
    capital: ["Lisboa"],
    latlng: [39.3999, -8.2245],
    flags: { png: "https://flagcdn.com/w320/pt.png" },
    translations: {
      spa: { common: "Portugal" },
      por: { common: "Portugal" }
    }
  },
  {
    name: "Francia",
    cca2: "FR",
    region: "Europe",
    subregion: "Western Europe",
    capital: ["París"],
    latlng: [46.2276, 2.2137],
    flags: { png: "https://flagcdn.com/w320/fr.png" },
    translations: {
      spa: { common: "Francia" },
      por: { common: "França" }
    }
  },
  {
    name: "Italia",
    cca2: "IT",
    region: "Europe",
    subregion: "Southern Europe",
    capital: ["Roma"],
    latlng: [41.8719, 12.5674],
    flags: { png: "https://flagcdn.com/w320/it.png" },
    translations: {
      spa: { common: "Italia" },
      por: { common: "Itália" }
    }
  },
  {
    name: "Reino Unido",
    cca2: "GB",
    region: "Europe",
    subregion: "Northern Europe",
    capital: ["Londres"],
    latlng: [55.3781, -3.436],
    flags: { png: "https://flagcdn.com/w320/gb.png" },
    translations: {
      spa: { common: "Reino Unido" },
      por: { common: "Reino Unido" }
    }
  },
  {
    name: "Japón",
    cca2: "JP",
    region: "Asia",
    subregion: "Eastern Asia",
    capital: ["Tokyo"],
    latlng: [36, 138],
    flags: { png: "https://flagcdn.com/w320/jp.png" },
    translations: {
      spa: { common: "Japón" },
      por: { common: "Japão" }
    }
  },
  {
    name: "Tailandia",
    cca2: "TH",
    region: "Asia",
    subregion: "South-Eastern Asia",
    capital: ["Bangkok"],
    latlng: [15.87, 100.9925],
    flags: { png: "https://flagcdn.com/w320/th.png" },
    translations: {
      spa: { common: "Tailandia" },
      por: { common: "Tailândia" }
    }
  },
  {
    name: "Emiratos Árabes Unidos",
    cca2: "AE",
    region: "Asia",
    subregion: "Western Asia",
    capital: ["Abu Dhabi"],
    latlng: [23.4241, 53.8478],
    flags: { png: "https://flagcdn.com/w320/ae.png" },
    translations: {
      spa: { common: "Emiratos Árabes Unidos" },
      por: { common: "Emirados Árabes Unidos" }
    }
  },
  {
    name: "Turquía",
    cca2: "TR",
    region: "Asia",
    subregion: "Western Asia",
    capital: ["Ankara"],
    latlng: [38.9637, 35.2433],
    flags: { png: "https://flagcdn.com/w320/tr.png" },
    translations: {
      spa: { common: "Turquía" },
      por: { common: "Turquia" }
    }
  },
  {
    name: "Marruecos",
    cca2: "MA",
    region: "Africa",
    subregion: "Northern Africa",
    capital: ["Rabat"],
    latlng: [31.7917, -7.0926],
    flags: { png: "https://flagcdn.com/w320/ma.png" },
    translations: {
      spa: { common: "Marruecos" },
      por: { common: "Marrocos" }
    }
  },
  {
    name: "Egipto",
    cca2: "EG",
    region: "Africa",
    subregion: "Northern Africa",
    capital: ["El Cairo"],
    latlng: [26.8206, 30.8025],
    flags: { png: "https://flagcdn.com/w320/eg.png" },
    translations: {
      spa: { common: "Egipto" },
      por: { common: "Egito" }
    }
  },
  {
    name: "Sudáfrica",
    cca2: "ZA",
    region: "Africa",
    subregion: "Southern Africa",
    capital: ["Pretoria"],
    latlng: [-30.5595, 22.9375],
    flags: { png: "https://flagcdn.com/w320/za.png" },
    translations: {
      spa: { common: "Sudáfrica" },
      por: { common: "África do Sul" }
    }
  },
  {
    name: "Australia",
    cca2: "AU",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    capital: ["Canberra"],
    latlng: [-25.2744, 133.7751],
    flags: { png: "https://flagcdn.com/w320/au.png" },
    translations: {
      spa: { common: "Australia" },
      por: { common: "Austrália" }
    }
  },
  {
    name: "Nueva Zelanda",
    cca2: "NZ",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    capital: ["Wellington"],
    latlng: [-40.9006, 174.886],
    flags: { png: "https://flagcdn.com/w320/nz.png" },
    translations: {
      spa: { common: "Nueva Zelanda" },
      por: { common: "Nova Zelândia" }
    }
  }
];

const hotelCityCatalog = [
  { city: "Montevideo", country: "Uruguay", countryCode: "UY", lat: -34.9011, lng: -56.1645, airport: "MVD" },
  { city: "Punta del Este", country: "Uruguay", countryCode: "UY", lat: -34.968, lng: -54.95, airport: "PDP" },
  { city: "Salto", country: "Uruguay", countryCode: "UY", lat: -31.3833, lng: -57.9667, airport: "" },
  { city: "Colonia del Sacramento", country: "Uruguay", countryCode: "UY", lat: -34.4714, lng: -57.8442, airport: "" },
  { city: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.6037, lng: -58.3816, airport: "EZE" },
  { city: "Bariloche", country: "Argentina", countryCode: "AR", lat: -41.1335, lng: -71.3103, airport: "BRC" },
  { city: "Mendoza", country: "Argentina", countryCode: "AR", lat: -32.8895, lng: -68.8458, airport: "" },
  { city: "Rio de Janeiro", country: "Brasil", countryCode: "BR", lat: -22.9068, lng: -43.1729, airport: "GIG" },
  { city: "Sao Paulo", country: "Brasil", countryCode: "BR", lat: -23.5505, lng: -46.6333, airport: "GRU" },
  { city: "Florianópolis", country: "Brasil", countryCode: "BR", lat: -27.5949, lng: -48.5482, airport: "FLN" },
  { city: "Salvador", country: "Brasil", countryCode: "BR", lat: -12.9777, lng: -38.5016, airport: "" },
  { city: "Santiago", country: "Chile", countryCode: "CL", lat: -33.4489, lng: -70.6693, airport: "SCL" },
  { city: "Valparaíso", country: "Chile", countryCode: "CL", lat: -33.0472, lng: -71.6127, airport: "" },
  { city: "Lima", country: "Perú", countryCode: "PE", lat: -12.0464, lng: -77.0428, airport: "LIM" },
  { city: "Cusco", country: "Perú", countryCode: "PE", lat: -13.5319, lng: -71.9675, airport: "" },
  { city: "Asunción", country: "Paraguay", countryCode: "PY", lat: -25.2637, lng: -57.5759, airport: "ASU" },
  { city: "Ciudad de Panamá", country: "Panamá", countryCode: "PA", lat: 8.9824, lng: -79.5199, airport: "PTY" },
  { city: "Madrid", country: "España", countryCode: "ES", lat: 40.4168, lng: -3.7038, airport: "MAD" },
  { city: "Barcelona", country: "España", countryCode: "ES", lat: 41.3874, lng: 2.1686, airport: "" },
  { city: "Sevilla", country: "España", countryCode: "ES", lat: 37.3891, lng: -5.9845, airport: "" },
  { city: "Lisboa", country: "Portugal", countryCode: "PT", lat: 38.7223, lng: -9.1393, airport: "" },
  { city: "Porto", country: "Portugal", countryCode: "PT", lat: 41.1579, lng: -8.6291, airport: "" },
  { city: "París", country: "Francia", countryCode: "FR", lat: 48.8566, lng: 2.3522, airport: "" },
  { city: "Niza", country: "Francia", countryCode: "FR", lat: 43.7102, lng: 7.262, airport: "" },
  { city: "Roma", country: "Italia", countryCode: "IT", lat: 41.9028, lng: 12.4964, airport: "" },
  { city: "Milán", country: "Italia", countryCode: "IT", lat: 45.4642, lng: 9.19, airport: "" },
  { city: "Londres", country: "Reino Unido", countryCode: "GB", lat: 51.5072, lng: -0.1276, airport: "" },
  { city: "Tokio", country: "Japón", countryCode: "JP", lat: 35.6762, lng: 139.6503, airport: "" },
  { city: "Kioto", country: "Japón", countryCode: "JP", lat: 35.0116, lng: 135.7681, airport: "" },
  { city: "Bangkok", country: "Tailandia", countryCode: "TH", lat: 13.7563, lng: 100.5018, airport: "" },
  { city: "Phuket", country: "Tailandia", countryCode: "TH", lat: 7.8804, lng: 98.3923, airport: "" },
  { city: "Dubai", country: "Emiratos Árabes Unidos", countryCode: "AE", lat: 25.2048, lng: 55.2708, airport: "" },
  { city: "Estambul", country: "Turquía", countryCode: "TR", lat: 41.0082, lng: 28.9784, airport: "" },
  { city: "Marrakech", country: "Marruecos", countryCode: "MA", lat: 31.6295, lng: -7.9811, airport: "" },
  { city: "El Cairo", country: "Egipto", countryCode: "EG", lat: 30.0444, lng: 31.2357, airport: "" },
  { city: "Ciudad del Cabo", country: "Sudáfrica", countryCode: "ZA", lat: -33.9249, lng: 18.4241, airport: "" },
  { city: "Sidney", country: "Australia", countryCode: "AU", lat: -33.8688, lng: 151.2093, airport: "" },
  { city: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.8136, lng: 144.9631, airport: "" },
  { city: "Auckland", country: "Nueva Zelanda", countryCode: "NZ", lat: -36.8509, lng: 174.7645, airport: "" }
];

const bookingQuickHotels = [
  {
    id: "booking-salto-dayman",
    city: "Salto",
    country: "Uruguay",
    region: "Termas del Dayman",
    destinationId: "",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    summary: "Termas del Dayman y escapada de relax en litoral uruguayo."
  },
  {
    id: "booking-buenos-aires",
    city: "Buenos Aires",
    country: "Argentina",
    region: "Centro",
    destinationId: "",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80",
    summary: "Ciudad urbana con cultura, gastronomía y hotelería de alta rotación."
  },
  {
    id: "booking-sao-paulo",
    city: "Sao Paulo",
    country: "Brasil",
    region: "Paulista",
    destinationId: "",
    image: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=1200&q=80",
    summary: "Negocios y escapadas urbanas en la mayor ciudad de Brasil."
  },
  {
    id: "booking-rio-de-janeiro",
    city: "Rio de Janeiro",
    country: "Brasil",
    region: "Copacabana",
    destinationId: "",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    summary: "Zona de playa, ciudad icónica y gran volumen de búsquedas hoteleras."
  },
  {
    id: "booking-madrid",
    city: "Madrid",
    country: "España",
    region: "Centro",
    destinationId: "-390625",
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80",
    summary: "Base ideal para city break en España con inventario hotelero amplio."
  },
  {
    id: "booking-barcelona",
    city: "Barcelona",
    country: "España",
    region: "Eixample",
    destinationId: "",
    image: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1200&q=80",
    summary: "Destino europeo premium con combinación playa + ciudad."
  }
];

const fallbackCountries = countryCatalog;

const defaultPackages = [
  {
    id: "cruise-caribbean-miami",
    type: "Crucero",
    title: "Crucero Caribe desde Miami",
    visibleLinkLabel: "LINK AFILIADO CRUCERO",
    link: "https://www.cruisedirect.com/search?destination=Caribbean&date=2026-07&affiliate_id=abc123",
    startDate: "2026-07-08",
    endDate: "2026-07-15",
    basePrice: "USD 1280",
    finalPrice: "USD 1390 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "",
    continent: "America del Norte",
    country: "Estados Unidos",
    city: "Miami",
    region: "Puerto de salida",
    lat: 25.7617,
    lng: -80.1918,
    airline: "A coordinar",
    duration: "7 noches",
    scales: [],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "Cabina exterior",
    boardBasis: "Pension completa",
    themeTag: "Caribe",
    summary: "Crucero clasico por el Caribe con salida desde Miami y paquete pensado para venta rapida.",
    highlights: [
      "7 noches en Caribe",
      "Pension completa",
      "Ideal para primera experiencia en crucero",
      "Link afiliado visible"
    ],
    referral: {
      provider: "cruisedirect",
      kind: "cruise",
      affiliateId: "abc123",
      hotelSlug: "",
      destinationId: "",
      destinationType: "region",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cruise-mediterranean-barcelona",
    type: "Crucero",
    title: "Crucero Mediterraneo desde Barcelona",
    visibleLinkLabel: "LINK AFILIADO CRUCERO",
    link: "https://www.cruisedirect.com/search?destination=Mediterranean&date=2026-09&affiliate_id=abc123",
    startDate: "2026-09-06",
    endDate: "2026-09-13",
    basePrice: "USD 1540",
    finalPrice: "USD 1690 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "MAD",
    continent: "Europa",
    country: "Espana",
    city: "Barcelona",
    region: "Puerto de Barcelona",
    lat: 41.3874,
    lng: 2.1686,
    airline: "Iberia + operador crucero",
    duration: "7 noches",
    scales: [{ code: "MAD", label: "Madrid" }],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "Cabina balcon",
    boardBasis: "Pension completa",
    themeTag: "Mediterraneo",
    summary: "Circuito mediterraneo con salida en Barcelona y escalas clasicas para primera venta europea.",
    highlights: [
      "7 noches Mediterraneo",
      "Salida desde Barcelona",
      "Escala aerea simple",
      "Link afiliado visible"
    ],
    referral: {
      provider: "cruisedirect",
      kind: "cruise",
      affiliateId: "abc123",
      hotelSlug: "",
      destinationId: "",
      destinationType: "region",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cruise-brazil-rio",
    type: "Crucero",
    title: "Crucero Costa Brasil desde Rio",
    visibleLinkLabel: "LINK AFILIADO CRUCERO",
    link: "https://www.cruisedirect.com/search?destination=Brazil&date=2026-12&affiliate_id=abc123",
    startDate: "2026-12-03",
    endDate: "2026-12-08",
    basePrice: "USD 990",
    finalPrice: "USD 1120 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "GIG",
    continent: "America del Sur",
    country: "Brasil",
    city: "Rio de Janeiro",
    region: "Puerto de Rio",
    lat: -22.9068,
    lng: -43.1729,
    airline: "LATAM",
    duration: "5 noches",
    scales: [],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "Cabina interior",
    boardBasis: "Pension completa",
    themeTag: "Brasil",
    summary: "Salida regional corta para vender crucero en temporada alta con logica de link afiliado.",
    highlights: [
      "5 noches por costa Brasil",
      "Salida Rio de Janeiro",
      "Producto rapido para temporada",
      "Link afiliado visible"
    ],
    referral: {
      provider: "cruisedirect",
      kind: "cruise",
      affiliateId: "abc123",
      hotelSlug: "",
      destinationId: "",
      destinationType: "region",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "hotel-madrid-centro",
    type: "Hotel",
    title: "Hotel Madrid Centro 4*",
    visibleLinkLabel: "LINK AFILIADO HOTEL",
    link: "https://www.booking.com/searchresults.html?aid=1234567&checkin=2026-10-10&checkout=2026-10-15&dest_id=-390625&dest_type=city&group_adults=2&no_rooms=1",
    startDate: "2026-10-10",
    endDate: "2026-10-15",
    basePrice: "USD 590",
    finalPrice: "USD 670 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "MAD",
    continent: "Europa",
    country: "Espana",
    city: "Madrid",
    region: "Centro",
    lat: 40.4168,
    lng: -3.7038,
    airline: "",
    duration: "5 noches",
    scales: [],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "Hotel Gran Via Prime",
    boardBasis: "Desayuno",
    themeTag: "Hotel urbano",
    summary: "Hotel centrico en Madrid con booking afiliado y datos listos para usar en mini booking.",
    highlights: [
      "Hotel 4 estrellas",
      "Ubicacion centrica",
      "Ideal city break",
      "Link afiliado visible"
    ],
    referral: {
      provider: "booking",
      kind: "search",
      affiliateId: "1234567",
      hotelSlug: "",
      destinationId: "-390625",
      destinationType: "city",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "hotel-rio-copacabana",
    type: "Hotel",
    title: "Hotel Rio Copacabana 4*",
    visibleLinkLabel: "LINK AFILIADO HOTEL",
    link: "https://www.agoda.com/search?city=Rio%20de%20Janeiro&checkIn=2026-11-06&checkOut=2026-11-11&rooms=1&adults=2&cid=123456",
    startDate: "2026-11-06",
    endDate: "2026-11-11",
    basePrice: "USD 520",
    finalPrice: "USD 610 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "GIG",
    continent: "America del Sur",
    country: "Brasil",
    city: "Rio de Janeiro",
    region: "Copacabana",
    lat: -22.9068,
    lng: -43.1729,
    airline: "",
    duration: "5 noches",
    scales: [],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "Copacabana Urban Stay",
    boardBasis: "Desayuno",
    themeTag: "Hotel playa",
    summary: "Hotel en zona de playa con afiliado Agoda para test de links y conversion visual.",
    highlights: [
      "Zona Copacabana",
      "Desayuno incluido",
      "Ideal parejas o familia",
      "Link afiliado visible"
    ],
    referral: {
      provider: "agoda",
      kind: "hotel",
      affiliateId: "123456",
      hotelSlug: "",
      destinationId: "",
      destinationType: "city",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "hotel-punta-del-este",
    type: "Hotel",
    title: "Hotel Punta del Este premium",
    visibleLinkLabel: "LINK AFILIADO HOTEL",
    link: "https://www.expedia.com/Hotel-Search?destination=Punta%20del%20Este&startDate=2026-12-12&endDate=2026-12-16&adults=2&rooms=1&cid=999999",
    startDate: "2026-12-12",
    endDate: "2026-12-16",
    basePrice: "USD 460",
    finalPrice: "USD 540 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "PDP",
    continent: "America del Sur",
    country: "Uruguay",
    city: "Punta del Este",
    region: "Peninsula",
    lat: -34.968,
    lng: -54.95,
    airline: "",
    duration: "4 noches",
    scales: [],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "Punta Resort Spa",
    boardBasis: "Desayuno",
    themeTag: "Escapada costera",
    summary: "Hotel de costa en Uruguay con Expedia afiliado para conversion directa.",
    highlights: [
      "Costa de Uruguay",
      "Hotel premium",
      "Escapada corta",
      "Link afiliado visible"
    ],
    referral: {
      provider: "expedia",
      kind: "hotel",
      affiliateId: "999999",
      hotelSlug: "",
      destinationId: "",
      destinationType: "city",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "pasaje-mvd-aep",
    type: "Pasaje",
    title: "Pasaje Montevideo a Buenos Aires",
    visibleLinkLabel: "LINK AFILIADO PASAJE",
    link: "https://www.skyscanner.net/transport/flights/mvd/aep/260910/260914/?adults=2&partner=tu_partner",
    startDate: "2026-09-10",
    endDate: "2026-09-14",
    basePrice: "USD 320",
    finalPrice: "USD 360 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "AEP",
    continent: "America del Sur",
    country: "Argentina",
    city: "Buenos Aires",
    region: "Palermo",
    lat: -34.6037,
    lng: -58.3816,
    airline: "Aerolineas Argentinas",
    duration: "0h 55m",
    scales: [],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "",
    boardBasis: "",
    themeTag: "Pasaje directo",
    summary: "Pasaje regional directo para flujo rapido de compra con afiliado de vuelos.",
    highlights: [
      "Vuelo directo",
      "Precio final claro",
      "Ruta lista para mapear",
      "Link afiliado visible"
    ],
    referral: {
      provider: "skyscanner",
      kind: "flight",
      affiliateId: "tu_partner",
      hotelSlug: "",
      destinationId: "",
      destinationType: "city",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "pasaje-mvd-scl",
    type: "Pasaje",
    title: "Pasaje Montevideo a Santiago",
    visibleLinkLabel: "LINK AFILIADO PASAJE",
    link: "https://www.skyscanner.net/transport/flights/mvd/scl/261003/261008/?adults=2&partner=tu_partner",
    startDate: "2026-10-03",
    endDate: "2026-10-08",
    basePrice: "USD 470",
    finalPrice: "USD 525 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "SCL",
    continent: "America del Sur",
    country: "Chile",
    city: "Santiago",
    region: "Aeropuerto SCL",
    lat: -33.4489,
    lng: -70.6693,
    airline: "Sky Airline",
    duration: "2h 40m",
    scales: [],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "",
    boardBasis: "",
    themeTag: "Pasaje regional",
    summary: "Pasaje regional a Chile con estructura de vuelo simple y conversion por link afiliado.",
    highlights: [
      "Ruta directa",
      "Precio final claro",
      "Producto de alta rotacion",
      "Link afiliado visible"
    ],
    referral: {
      provider: "skyscanner",
      kind: "flight",
      affiliateId: "tu_partner",
      hotelSlug: "",
      destinationId: "",
      destinationType: "city",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: ""
    },
    images: [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "pasaje-mvd-mad",
    type: "Pasaje",
    title: "Pasaje Montevideo a Madrid",
    visibleLinkLabel: "LINK AFILIADO PASAJE",
    link: "https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from:MVD,to:MAD,departure:11/05/2026&leg2=from:MAD,to:MVD,departure:11/16/2026&passengers=adults:2&cid=999999",
    startDate: "2026-11-05",
    endDate: "2026-11-16",
    basePrice: "USD 1190",
    finalPrice: "USD 1320 final",
    originCity: "Montevideo",
    originCountry: "Uruguay",
    originCode: "MVD",
    destinationCode: "MAD",
    continent: "Europa",
    country: "Espana",
    city: "Madrid",
    region: "Centro",
    lat: 40.4168,
    lng: -3.7038,
    airline: "Iberia + LATAM",
    duration: "14h 30m",
    scales: [{ code: "GRU", label: "Sao Paulo" }],
    maxAdults: 4,
    maxChildren: 2,
    childAgeLimit: 17,
    hotelName: "",
    boardBasis: "",
    themeTag: "Pasaje internacional",
    summary: "Pasaje internacional con escala clara y motor de link afiliado de vuelos para pruebas de conversion.",
    highlights: [
      "Vuelo internacional",
      "Escala informada",
      "Precio final visible",
      "Link afiliado visible"
    ],
    referral: {
      provider: "expedia",
      kind: "flight",
      affiliateId: "999999",
      hotelSlug: "",
      destinationId: "",
      destinationType: "city",
      rooms: 1,
      campaign: "travel_suite_default",
      baseUrl: "https://www.expedia.com/Flights-Search"
    },
    images: [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

window.TravelData = {
  themes,
  tips,
  exoticPlaces,
  airportCatalog,
  countryCatalog,
  hotelCityCatalog,
  bookingQuickHotels,
  fallbackCountries,
  defaultPackages
};

// Maps currency codes (ISO 4217) to representative flag asset codes (ISO 3166-1 alpha-2 or regional)
// The assets are expected in `/public/flags/<code>.svg` (lowercase), e.g. `/flags/us.svg`.
// Not all currencies map 1:1 to a single country; for regional/multi-country currencies we pick the most common/representative flag.

const currencyToFlagCode: Record<string, string> = {
  // Existing currencies
  dkk: "dk",    // Danish Krone -> Denmark
  usd: "us",   // US Dollar -> United States
  eur: "eu",   // Euro -> European Union
  gbp: "gb",   // British Pound -> Great Britain
  jpy: "jp",   // Japanese Yen -> Japan
  cad: "ca",   // Canadian Dollar -> Canada
  aud: "au",   // Australian Dollar -> Australia
  chf: "ch",   // Swiss Franc -> Switzerland
  sek: "se",   // Swedish Krona -> Sweden
  nok: "no",   // Norwegian Krone -> Norway
  btc: "",      // Bitcoin -> No flag file (will use emoji)
  
  // New currencies
  aed: "ae",   // UAE Dirham -> United Arab Emirates
  afn: "af",   // Afghan Afghani -> Afghanistan
  all: "al",   // Albanian Lek -> Albania
  amd: "am",   // Armenian Dram -> Armenia
  ang: "an",   // Netherlands Antillean Guilder -> Netherlands Antilles
  aoa: "ao",   // Angolan Kwanza -> Angola
  ars: "ar",   // Argentine Peso -> Argentina
  awg: "aw",   // Aruban Florin -> Aruba
  azn: "az",   // Azerbaijani Manat -> Azerbaijan
  bam: "ba",   // Bosnia-Herzegovina Mark -> Bosnia and Herzegovina
  bbd: "bb",   // Barbadian Dollar -> Barbados
  bdt: "bd",   // Bangladeshi Taka -> Bangladesh
  bgn: "bg",   // Bulgarian Lev -> Bulgaria
  bhd: "bh",   // Bahraini Dinar -> Bahrain
  bif: "bi",   // Burundian Franc -> Burundi
  bmd: "bm",   // Bermudian Dollar -> Bermuda
  bnd: "bn",   // Brunei Dollar -> Brunei
  bob: "bo",   // Bolivian Boliviano -> Bolivia
  brl: "br",   // Brazilian Real -> Brazil
  bsd: "bs",   // Bahamian Dollar -> Bahamas
  btn: "bt",   // Bhutanese Ngultrum -> Bhutan
  bwp: "bw",   // Botswanan Pula -> Botswana
  byn: "by",   // Belarusian Ruble -> Belarus
  byr: "by",   // Belarusian Ruble (old) -> Belarus -- TODO 
  bzd: "bz",   // Belize Dollar -> Belize
  cdf: "cd",   // Congolese Franc -> Democratic Republic of the Congo
  clf: "cl",   // Chilean Unit of Account -> Chile
  clp: "cl",   // Chilean Peso -> Chile
  cny: "cn",   // Chinese Yuan -> China
  cnh: "cn",   // Chinese Yuan (offshore) -> China
  cop: "co",   // Colombian Peso -> Colombia
  crc: "cr",   // Costa Rican Colón -> Costa Rica
  cuc: "cu",   // Cuban Convertible Peso -> Cuba
  cup: "cu",   // Cuban Peso -> Cuba
  cve: "cv",   // Cape Verdean Escudo -> Cape Verde
  czk: "cz",   // Czech Koruna -> Czech Republic
  djf: "dj",   // Djiboutian Franc -> Djibouti
  dop: "do",   // Dominican Peso -> Dominican Republic
  dzd: "dz",   // Algerian Dinar -> Algeria
  egp: "eg",   // Egyptian Pound -> Egypt
  ern: "er",   // Eritrean Nakfa -> Eritrea
  etb: "et",   // Ethiopian Birr -> Ethiopia
  fjd: "fj",   // Fijian Dollar -> Fiji
  fkp: "fk",   // Falkland Islands Pound -> Falkland Islands
  gel: "ge",   // Georgian Lari -> Georgia
  ggp: "gg",   // Guernsey Pound -> Guernsey
  ghs: "gh",   // Ghanaian Cedi -> Ghana
  gip: "gi",   // Gibraltar Pound -> Gibraltar
  gmd: "gm",   // Gambian Dalasi -> Gambia
  gnf: "gn",   // Guinean Franc -> Guinea
  gtq: "gt",   // Guatemalan Quetzal -> Guatemala
  gyd: "gy",   // Guyanaese Dollar -> Guyana
  hkd: "hk",   // Hong Kong Dollar -> Hong Kong
  hnl: "hn",   // Honduran Lempira -> Honduras
  hrk: "hr",   // Croatian Kuna -> Croatia
  htg: "ht",   // Haitian Gourde -> Haiti
  huf: "hu",   // Hungarian Forint -> Hungary
  idr: "id",   // Indonesian Rupiah -> Indonesia
  ils: "il",   // Israeli New Shekel -> Israel
  imp: "im",   // Manx Pound -> Isle of Man
  inr: "in",   // Indian Rupee -> India
  iqd: "iq",   // Iraqi Dinar -> Iraq
  irr: "ir",   // Iranian Rial -> Iran
  isk: "is",   // Icelandic Króna -> Iceland
  jep: "je",   // Jersey Pound -> Jersey
  jmd: "jm",   // Jamaican Dollar -> Jamaica
  jod: "jo",   // Jordanian Dinar -> Jordan
  kes: "ke",   // Kenyan Shilling -> Kenya
  kgs: "kg",   // Kyrgystani Som -> Kyrgyzstan
  khr: "kh",   // Cambodian Riel -> Cambodia
  kmf: "km",   // Comorian Franc -> Comoros
  kpw: "kp",   // North Korean Won -> North Korea
  krw: "kr",   // South Korean Won -> South Korea
  kwd: "kw",   // Kuwaiti Dinar -> Kuwait
  kyd: "ky",   // Cayman Islands Dollar -> Cayman Islands
  kzt: "kz",   // Kazakhstani Tenge -> Kazakhstan
  lak: "la",   // Laotian Kip -> Laos
  lbp: "lb",   // Lebanese Pound -> Lebanon
  lkr: "lk",   // Sri Lankan Rupee -> Sri Lanka
  lrd: "lr",   // Liberian Dollar -> Liberia
  lsl: "ls",   // Lesotho Loti -> Lesotho
  ltl: "lt",   // Lithuanian Litas -> Lithuania
  lvl: "lv",   // Latvian Lats -> Latvia
  lyd: "ly",   // Libyan Dinar -> Libya
  mad: "ma",   // Moroccan Dirham -> Morocco
  mdl: "md",   // Moldovan Leu -> Moldova
  mga: "mg",   // Malagasy Ariary -> Madagascar
  mkd: "mk",   // Macedonian Denar -> North Macedonia
  mmk: "mm",   // Myanma Kyat -> Myanmar
  mnt: "mn",   // Mongolian Tugrik -> Mongolia
  mop: "mo",   // Macanese Pataca -> Macau
  mru: "mr",   // Mauritanian Ouguiya -> Mauritania
  mur: "mu",   // Mauritian Rupee -> Mauritius
  mvr: "mv",   // Maldivian Rufiyaa -> Maldives
  mwk: "mw",   // Malawian Kwacha -> Malawi
  mxn: "mx",   // Mexican Peso -> Mexico
  myr: "my",   // Malaysian Ringgit -> Malaysia
  mzn: "mz",   // Mozambican Metical -> Mozambique
  nad: "na",   // Namibian Dollar -> Namibia
  ngn: "ng",   // Nigerian Naira -> Nigeria
  nio: "ni",   // Nicaraguan Córdoba -> Nicaragua
  npr: "np",   // Nepalese Rupee -> Nepal
  nzd: "nz",   // New Zealand Dollar -> New Zealand
  omr: "om",   // Omani Rial -> Oman
  pab: "pa",   // Panamanian Balboa -> Panama
  pen: "pe",   // Peruvian Nuevo Sol -> Peru
  pgk: "pg",   // Papua New Guinean Kina -> Papua New Guinea
  php: "ph",   // Philippine Peso -> Philippines
  pkr: "pk",   // Pakistani Rupee -> Pakistan
  pln: "pl",   // Polish Zloty -> Poland
  pyg: "py",   // Paraguayan Guarani -> Paraguay
  qar: "qa",   // Qatari Rial -> Qatar
  ron: "ro",   // Romanian Leu -> Romania
  rsd: "rs",   // Serbian Dinar -> Serbia
  rub: "ru",   // Russian Ruble -> Russia
  rwf: "rw",   // Rwandan Franc -> Rwanda
  sar: "sa",   // Saudi Riyal -> Saudi Arabia
  sbd: "sb",   // Solomon Islands Dollar -> Solomon Islands
  scr: "sc",   // Seychellois Rupee -> Seychelles
  sdg: "sd",   // Sudanese Pound -> Sudan
  sgd: "sg",   // Singapore Dollar -> Singapore
  shp: "sh",   // Saint Helena Pound -> Saint Helena
  sle: "sl",   // Sierra Leonean Leone -> Sierra Leone
  sll: "sl",   // Sierra Leonean Leone (old) -> Sierra Leone
  sos: "so",   // Somali Shilling -> Somalia
  srd: "sr",   // Surinamese Dollar -> Suriname
  std: "st",   // São Tomé and Príncipe Dobra (old) -> São Tomé and Príncipe
  stn: "st",   // São Tomé and Príncipe Dobra -> São Tomé and Príncipe
  svc: "sv",   // Salvadoran Colón -> El Salvador
  syp: "sy",   // Syrian Pound -> Syria
  szl: "sz",   // Swazi Lilangeni -> Eswatini
  thb: "th",   // Thai Baht -> Thailand
  tjs: "tj",   // Tajikistani Somoni -> Tajikistan
  tmt: "tm",   // Turkmenistani Manat -> Turkmenistan
  tnd: "tn",   // Tunisian Dinar -> Tunisia
  top: "to",   // Tongan Pa'anga -> Tonga
  try: "tr",   // Turkish Lira -> Turkey
  ttd: "tt",   // Trinidad and Tobago Dollar -> Trinidad and Tobago
  twd: "tw",   // New Taiwan Dollar -> Taiwan
  tzs: "tz",   // Tanzanian Shilling -> Tanzania
  uah: "ua",   // Ukrainian Hryvnia -> Ukraine
  ugx: "ug",   // Ugandan Shilling -> Uganda
  uyu: "uy",   // Uruguayan Peso -> Uruguay
  uzs: "uz",   // Uzbekistan Som -> Uzbekistan
  ves: "ve",   // Venezuelan Bolívar -> Venezuela
  vnd: "vn",   // Vietnamese Dong -> Vietnam
  vuv: "vu",   // Vanuatu Vatu -> Vanuatu
  wst: "ws",   // Samoan Tala -> Samoa
  xaf: "cm",   // Central African CFA Franc -> Central African Republic (represents CFA zone)
  xag: "",     // Silver (precious metal) -> No country
  xau: "",     // Gold (precious metal) -> No country
  xcd: "ag",   // East Caribbean Dollar -> Antigua and Barbuda (represents ECCU)
  xcg: "",     // Unknown/Uncommon -> Leave empty
  xdr: "",     // Special Drawing Rights (IMF) -> No country
  xof: "sn",   // West African CFA Franc -> Senegal (represents CFA zone)
  xpf: "pf",   // CFP Franc -> French Polynesia (represents French Pacific territories)
  yer: "ye",   // Yemeni Rial -> Yemen
  zar: "za",   // South African Rand -> South Africa
  zmk: "zm",   // Zambian Kwacha (old) -> Zambia
  zmw: "zm",   // Zambian Kwacha -> Zambia
  zwl: "zw",   // Zimbabwean Dollar -> Zimbabwe
};

export function getFlagCodeForCurrency(currencyCode: string): string | null {
  const lower = currencyCode?.toLowerCase();
  const flagCode = currencyToFlagCode[lower];
  // Return null if not found or if flag code is empty string
  return flagCode && flagCode.length > 0 ? flagCode : null;
}

export function getFlagSrcForCurrency(currencyCode: string): string | null {
  const code = getFlagCodeForCurrency(currencyCode);
  return code ? `/flags/${code}.svg` : null;
}



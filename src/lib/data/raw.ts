import type { Body, Condition, Fuel, Gearbox, VehicleKind } from "@/lib/types";

export interface RawListing {
  id: string;
  kind: VehicleKind;
  make: string;
  model: string;
  version: string;
  year: number;
  km: number;
  price: number;
  fuel: Fuel;
  gearbox: Gearbox;
  body: Body;
  cv: number;
  conso: number;
  city: string;
  cond: Condition;
  cc?: number;
  doors?: number;
}

/** لائحة الإعلانات — أسعار وكيلومترات قريبة من واقع السوق المغربي */
export const RAW: RawListing[] = [
  { id: "c001", kind: "car", make: "Dacia", model: "Logan", version: "1.5 dCi Ambiance", year: 2015, km: 187000, price: 86000, fuel: "diesel", gearbox: "manuelle", body: "berline", cv: 6, conso: 4.5, city: "casablanca", cond: "bon", doors: 4 },
  { id: "c002", kind: "car", make: "Dacia", model: "Sandero", version: "Stepway 1.5 dCi", year: 2019, km: 96000, price: 139000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 6, conso: 4.3, city: "rabat", cond: "tres-bon", doors: 5 },
  { id: "c003", kind: "car", make: "Dacia", model: "Duster", version: "1.5 dCi 4x2 Prestige", year: 2018, km: 118000, price: 178000, fuel: "diesel", gearbox: "manuelle", body: "suv", cv: 7, conso: 5.1, city: "marrakech", cond: "tres-bon", doors: 5 },
  { id: "c004", kind: "car", make: "Dacia", model: "Dokker", version: "1.5 dCi Ambiance", year: 2017, km: 142000, price: 112000, fuel: "diesel", gearbox: "manuelle", body: "utilitaire", cv: 6, conso: 4.8, city: "fes", cond: "bon", doors: 5 },
  { id: "c005", kind: "car", make: "Dacia", model: "Lodgy", version: "1.5 dCi 7 places", year: 2016, km: 165000, price: 118000, fuel: "diesel", gearbox: "manuelle", body: "break", cv: 6, conso: 5.0, city: "agadir", cond: "bon", doors: 5 },
  { id: "c006", kind: "car", make: "Renault", model: "Clio 4", version: "1.5 dCi Business", year: 2017, km: 128000, price: 124000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.9, city: "casablanca", cond: "tres-bon", doors: 5 },
  { id: "c007", kind: "car", make: "Renault", model: "Symbol", version: "1.5 dCi Life", year: 2016, km: 158000, price: 94000, fuel: "diesel", gearbox: "manuelle", body: "berline", cv: 6, conso: 4.2, city: "tanger", cond: "bon", doors: 4 },
  { id: "c008", kind: "car", make: "Renault", model: "Mégane", version: "1.5 dCi Intens", year: 2018, km: 104000, price: 158000, fuel: "diesel", gearbox: "automatique", body: "berline", cv: 7, conso: 4.4, city: "rabat", cond: "excellent", doors: 5 },
  { id: "c009", kind: "car", make: "Renault", model: "Kangoo", version: "1.5 dCi Confort", year: 2016, km: 178000, price: 96000, fuel: "diesel", gearbox: "manuelle", body: "utilitaire", cv: 6, conso: 5.2, city: "settat", cond: "moyen", doors: 4 },
  { id: "c010", kind: "car", make: "Renault", model: "Captur", version: "1.5 dCi Zen", year: 2019, km: 88000, price: 172000, fuel: "diesel", gearbox: "manuelle", body: "suv", cv: 6, conso: 4.4, city: "mohammedia", cond: "tres-bon", doors: 5 },
  { id: "c011", kind: "car", make: "Peugeot", model: "208", version: "1.6 BlueHDi Active", year: 2018, km: 112000, price: 132000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.8, city: "casablanca", cond: "tres-bon", doors: 5 },
  { id: "c012", kind: "car", make: "Peugeot", model: "301", version: "1.6 HDi Allure", year: 2017, km: 146000, price: 116000, fuel: "diesel", gearbox: "manuelle", body: "berline", cv: 6, conso: 4.1, city: "meknes", cond: "bon", doors: 4 },
  { id: "c013", kind: "car", make: "Peugeot", model: "3008", version: "1.5 BlueHDi GT Line", year: 2019, km: 92000, price: 268000, fuel: "diesel", gearbox: "automatique", body: "suv", cv: 7, conso: 4.9, city: "rabat", cond: "excellent", doors: 5 },
  { id: "c014", kind: "car", make: "Peugeot", model: "Partner", version: "1.6 HDi Pro", year: 2018, km: 134000, price: 126000, fuel: "diesel", gearbox: "manuelle", body: "utilitaire", cv: 6, conso: 5.0, city: "kenitra", cond: "bon", doors: 4 },
  { id: "c015", kind: "car", make: "Citroën", model: "C-Elysée", version: "1.6 HDi Feel", year: 2018, km: 121000, price: 112000, fuel: "diesel", gearbox: "manuelle", body: "berline", cv: 6, conso: 4.0, city: "oujda", cond: "bon", doors: 4 },
  { id: "c016", kind: "car", make: "Citroën", model: "C3", version: "1.5 BlueHDi Shine", year: 2019, km: 79000, price: 138000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.9, city: "tetouan", cond: "tres-bon", doors: 5 },
  { id: "c017", kind: "car", make: "Volkswagen", model: "Golf 7", version: "1.6 TDI Confortline", year: 2016, km: 149000, price: 176000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 6, conso: 4.3, city: "casablanca", cond: "tres-bon", doors: 5 },
  { id: "c018", kind: "car", make: "Volkswagen", model: "Polo", version: "1.6 TDI Trendline", year: 2018, km: 98000, price: 162000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 4.0, city: "marrakech", cond: "tres-bon", doors: 5 },
  { id: "c019", kind: "car", make: "Volkswagen", model: "Passat", version: "2.0 TDI Highline", year: 2015, km: 196000, price: 172000, fuel: "diesel", gearbox: "automatique", body: "berline", cv: 8, conso: 5.1, city: "fes", cond: "bon", doors: 4 },
  { id: "c020", kind: "car", make: "Volkswagen", model: "Tiguan", version: "2.0 TDI Carat", year: 2019, km: 86000, price: 298000, fuel: "diesel", gearbox: "automatique", body: "suv", cv: 8, conso: 5.6, city: "rabat", cond: "excellent", doors: 5 },
  { id: "c021", kind: "car", make: "Hyundai", model: "i10", version: "1.0 Essence Confort", year: 2019, km: 74000, price: 108000, fuel: "essence", gearbox: "manuelle", body: "citadine", cv: 5, conso: 5.2, city: "casablanca", cond: "tres-bon", doors: 5 },
  { id: "c022", kind: "car", make: "Hyundai", model: "Accent", version: "1.5 CRDi GLS", year: 2016, km: 152000, price: 96000, fuel: "diesel", gearbox: "manuelle", body: "berline", cv: 6, conso: 4.6, city: "safi", cond: "bon", doors: 4 },
  { id: "c023", kind: "car", make: "Hyundai", model: "Tucson", version: "2.0 CRDi Executive", year: 2018, km: 108000, price: 245000, fuel: "diesel", gearbox: "automatique", body: "suv", cv: 8, conso: 5.8, city: "tanger", cond: "tres-bon", doors: 5 },
  { id: "c024", kind: "car", make: "Kia", model: "Picanto", version: "1.0 Essence Motion", year: 2018, km: 82000, price: 97000, fuel: "essence", gearbox: "manuelle", body: "citadine", cv: 5, conso: 5.0, city: "sale", cond: "tres-bon", doors: 5 },
  { id: "c025", kind: "car", make: "Kia", model: "Rio", version: "1.4 CRDi Active", year: 2017, km: 118000, price: 113000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 4.1, city: "el-jadida", cond: "bon", doors: 5 },
  { id: "c026", kind: "car", make: "Kia", model: "Sportage", version: "1.7 CRDi Style", year: 2019, km: 94000, price: 242000, fuel: "diesel", gearbox: "automatique", body: "suv", cv: 7, conso: 5.4, city: "casablanca", cond: "excellent", doors: 5 },
  { id: "c027", kind: "car", make: "Toyota", model: "Yaris", version: "1.4 D-4D Luna", year: 2017, km: 124000, price: 133000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.9, city: "agadir", cond: "tres-bon", doors: 5 },
  { id: "c028", kind: "car", make: "Toyota", model: "Corolla", version: "1.8 Hybride Dynamic", year: 2020, km: 68000, price: 236000, fuel: "hybride", gearbox: "automatique", body: "berline", cv: 7, conso: 4.2, city: "rabat", cond: "excellent", doors: 4 },
  { id: "c029", kind: "car", make: "Toyota", model: "Hilux", version: "2.4 D-4D 4x4 Double Cab", year: 2018, km: 156000, price: 328000, fuel: "diesel", gearbox: "manuelle", body: "utilitaire", cv: 9, conso: 7.6, city: "errachidia", cond: "bon", doors: 4 },
  { id: "c030", kind: "car", make: "Ford", model: "Fiesta", version: "1.5 TDCi Trend", year: 2016, km: 138000, price: 104000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.8, city: "khouribga", cond: "bon", doors: 5 },
  { id: "c031", kind: "car", make: "Ford", model: "Focus", version: "1.5 TDCi Titanium", year: 2017, km: 129000, price: 134000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 6, conso: 4.2, city: "casablanca", cond: "bon", doors: 5 },
  { id: "c032", kind: "car", make: "Fiat", model: "Punto", version: "1.3 Multijet Easy", year: 2014, km: 172000, price: 68000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 4.0, city: "beni-mellal", cond: "moyen", doors: 5 },
  { id: "c033", kind: "car", make: "Fiat", model: "Tipo", version: "1.3 Multijet Lounge", year: 2019, km: 91000, price: 142000, fuel: "diesel", gearbox: "manuelle", body: "berline", cv: 6, conso: 4.1, city: "nador", cond: "tres-bon", doors: 4 },
  { id: "c034", kind: "car", make: "Seat", model: "Ibiza", version: "1.6 TDI Style", year: 2018, km: 106000, price: 148000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 4.0, city: "temara", cond: "tres-bon", doors: 5 },
  { id: "c035", kind: "car", make: "Seat", model: "Leon", version: "1.6 TDI FR", year: 2017, km: 132000, price: 168000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 6, conso: 4.3, city: "casablanca", cond: "tres-bon", doors: 5 },
  { id: "c036", kind: "car", make: "Skoda", model: "Octavia", version: "1.6 TDI Ambition", year: 2018, km: 114000, price: 189000, fuel: "diesel", gearbox: "automatique", body: "berline", cv: 6, conso: 4.4, city: "rabat", cond: "tres-bon", doors: 5 },
  { id: "c037", kind: "car", make: "Skoda", model: "Fabia", version: "1.4 TDI Active", year: 2017, km: 127000, price: 118000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.9, city: "meknes", cond: "bon", doors: 5 },
  { id: "c038", kind: "car", make: "Mercedes", model: "Classe C", version: "220 d Avantgarde", year: 2016, km: 148000, price: 322000, fuel: "diesel", gearbox: "automatique", body: "berline", cv: 9, conso: 5.2, city: "casablanca", cond: "tres-bon", doors: 4 },
  { id: "c039", kind: "car", make: "Mercedes", model: "Classe A", version: "180 d AMG Line", year: 2018, km: 96000, price: 305000, fuel: "diesel", gearbox: "automatique", body: "citadine", cv: 7, conso: 4.5, city: "marrakech", cond: "excellent", doors: 5 },
  { id: "c040", kind: "car", make: "Mercedes", model: "Classe E", version: "220 CDI Executive", year: 2014, km: 214000, price: 285000, fuel: "diesel", gearbox: "automatique", body: "berline", cv: 10, conso: 5.6, city: "tanger", cond: "bon", doors: 4 },
  { id: "c041", kind: "car", make: "BMW", model: "Série 3", version: "320d Sport Line", year: 2016, km: 154000, price: 288000, fuel: "diesel", gearbox: "automatique", body: "berline", cv: 9, conso: 4.9, city: "casablanca", cond: "tres-bon", doors: 4 },
  { id: "c042", kind: "car", make: "BMW", model: "X1", version: "sDrive18d xLine", year: 2017, km: 126000, price: 302000, fuel: "diesel", gearbox: "automatique", body: "suv", cv: 8, conso: 5.1, city: "rabat", cond: "tres-bon", doors: 5 },
  { id: "c043", kind: "car", make: "BMW", model: "Série 1", version: "116d Urban", year: 2015, km: 168000, price: 186000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 6, conso: 4.3, city: "fes", cond: "bon", doors: 5 },
  { id: "c044", kind: "car", make: "Audi", model: "A3", version: "2.0 TDI S line", year: 2017, km: 134000, price: 252000, fuel: "diesel", gearbox: "automatique", body: "citadine", cv: 8, conso: 4.6, city: "casablanca", cond: "tres-bon", doors: 5 },
  { id: "c045", kind: "car", make: "Audi", model: "Q3", version: "2.0 TDI quattro", year: 2016, km: 158000, price: 268000, fuel: "diesel", gearbox: "automatique", body: "suv", cv: 9, conso: 5.5, city: "agadir", cond: "bon", doors: 5 },
  { id: "c046", kind: "car", make: "Audi", model: "A4", version: "2.0 TDI Design", year: 2018, km: 112000, price: 325000, fuel: "diesel", gearbox: "automatique", body: "berline", cv: 9, conso: 4.7, city: "rabat", cond: "excellent", doors: 4 },
  { id: "c047", kind: "car", make: "Nissan", model: "Qashqai", version: "1.5 dCi Acenta", year: 2017, km: 122000, price: 212000, fuel: "diesel", gearbox: "manuelle", body: "suv", cv: 6, conso: 4.5, city: "casablanca", cond: "tres-bon", doors: 5 },
  { id: "c048", kind: "car", make: "Nissan", model: "Micra", version: "1.5 dCi Acenta", year: 2016, km: 141000, price: 94000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.8, city: "kenitra", cond: "bon", doors: 5 },
  { id: "c049", kind: "car", make: "Opel", model: "Corsa", version: "1.3 CDTi Enjoy", year: 2017, km: 116000, price: 109000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 3.9, city: "mohammedia", cond: "bon", doors: 5 },
  { id: "c050", kind: "car", make: "Jeep", model: "Compass", version: "1.6 MultiJet Limited", year: 2019, km: 89000, price: 292000, fuel: "diesel", gearbox: "manuelle", body: "suv", cv: 7, conso: 5.0, city: "casablanca", cond: "excellent", doors: 5 },
  { id: "c051", kind: "car", make: "Land Rover", model: "Range Rover Evoque", version: "2.0 eD4 Pure", year: 2015, km: 162000, price: 378000, fuel: "diesel", gearbox: "automatique", body: "suv", cv: 9, conso: 5.9, city: "marrakech", cond: "bon", doors: 5 },
  { id: "c052", kind: "car", make: "Suzuki", model: "Swift", version: "1.2 Essence GL", year: 2018, km: 87000, price: 121000, fuel: "essence", gearbox: "manuelle", body: "citadine", cv: 5, conso: 5.1, city: "tetouan", cond: "tres-bon", doors: 5 },
  { id: "c053", kind: "car", make: "Chevrolet", model: "Spark", version: "1.0 Essence LS", year: 2014, km: 158000, price: 63000, fuel: "essence", gearbox: "manuelle", body: "citadine", cv: 4, conso: 5.4, city: "oujda", cond: "moyen", doors: 5 },
  { id: "c054", kind: "car", make: "Mitsubishi", model: "L200", version: "2.4 DI-D 4x4 Intense", year: 2017, km: 168000, price: 256000, fuel: "diesel", gearbox: "manuelle", body: "utilitaire", cv: 9, conso: 7.2, city: "laayoune", cond: "bon", doors: 4 },
  { id: "c055", kind: "car", make: "Tesla", model: "Model 3", version: "Standard Range Plus", year: 2021, km: 54000, price: 468000, fuel: "electrique", gearbox: "automatique", body: "berline", cv: 8, conso: 15.5, city: "casablanca", cond: "excellent", doors: 4 },
  { id: "c056", kind: "car", make: "Toyota", model: "Yaris", version: "1.5 Hybride Dynamic", year: 2020, km: 62000, price: 192000, fuel: "hybride", gearbox: "automatique", body: "citadine", cv: 5, conso: 3.6, city: "rabat", cond: "excellent", doors: 5 },
  { id: "c057", kind: "car", make: "Dacia", model: "Logan", version: "1.0 SCe Essentiel", year: 2021, km: 46000, price: 128000, fuel: "essence", gearbox: "manuelle", body: "berline", cv: 5, conso: 5.6, city: "beni-mellal", cond: "excellent", doors: 4 },
  { id: "c058", kind: "car", make: "Peugeot", model: "208", version: "1.2 PureTech Allure", year: 2021, km: 41000, price: 178000, fuel: "essence", gearbox: "automatique", body: "citadine", cv: 6, conso: 5.3, city: "casablanca", cond: "excellent", doors: 5 },
  { id: "c059", kind: "car", make: "Volkswagen", model: "Golf 8", version: "2.0 TDI Life", year: 2021, km: 58000, price: 285000, fuel: "diesel", gearbox: "automatique", body: "citadine", cv: 7, conso: 4.2, city: "tanger", cond: "excellent", doors: 5 },
  { id: "c060", kind: "car", make: "Hyundai", model: "i20", version: "1.4 CRDi Intuitive", year: 2019, km: 78000, price: 129000, fuel: "diesel", gearbox: "manuelle", body: "citadine", cv: 5, conso: 4.0, city: "safi", cond: "tres-bon", doors: 5 },

  { id: "m001", kind: "moto", make: "Yamaha", model: "MT-07", version: "ABS", year: 2019, km: 24000, price: 79000, fuel: "essence", gearbox: "manuelle", body: "roadster", cv: 8, conso: 4.3, city: "casablanca", cond: "tres-bon", cc: 689 },
  { id: "m002", kind: "moto", make: "Yamaha", model: "Tracer 700", version: "GT", year: 2020, km: 19000, price: 96000, fuel: "essence", gearbox: "manuelle", body: "trail", cv: 8, conso: 4.5, city: "rabat", cond: "excellent", cc: 689 },
  { id: "m003", kind: "moto", make: "Honda", model: "CB500X", version: "ABS", year: 2019, km: 28000, price: 73000, fuel: "essence", gearbox: "manuelle", body: "trail", cv: 6, conso: 3.6, city: "marrakech", cond: "tres-bon", cc: 471 },
  { id: "m004", kind: "moto", make: "Honda", model: "PCX 125", version: "ABS", year: 2021, km: 14000, price: 33000, fuel: "essence", gearbox: "automatique", body: "scooter", cv: 2, conso: 2.3, city: "casablanca", cond: "excellent", cc: 125 },
  { id: "m005", kind: "moto", make: "KTM", model: "Duke 390", version: "ABS", year: 2020, km: 17000, price: 62000, fuel: "essence", gearbox: "manuelle", body: "roadster", cv: 5, conso: 3.3, city: "tanger", cond: "tres-bon", cc: 373 },
  { id: "m006", kind: "moto", make: "Royal Enfield", model: "Classic 500", version: "EFI", year: 2018, km: 21000, price: 47000, fuel: "essence", gearbox: "manuelle", body: "custom", cv: 5, conso: 3.5, city: "rabat", cond: "bon", cc: 499 },
  { id: "m007", kind: "moto", make: "Kawasaki", model: "Z650", version: "ABS", year: 2019, km: 22000, price: 71000, fuel: "essence", gearbox: "manuelle", body: "roadster", cv: 7, conso: 4.1, city: "agadir", cond: "tres-bon", cc: 649 },
  { id: "m008", kind: "moto", make: "BMW", model: "R 1200 GS", version: "Adventure", year: 2015, km: 62000, price: 132000, fuel: "essence", gearbox: "manuelle", body: "trail", cv: 11, conso: 5.2, city: "casablanca", cond: "bon", cc: 1170 },
  { id: "m009", kind: "moto", make: "Suzuki", model: "GSX-R 600", version: "L6", year: 2016, km: 34000, price: 74000, fuel: "essence", gearbox: "manuelle", body: "sportive", cv: 9, conso: 5.8, city: "fes", cond: "bon", cc: 599 },
  { id: "m010", kind: "moto", make: "Vespa", model: "Primavera 125", version: "iGet", year: 2020, km: 11000, price: 39000, fuel: "essence", gearbox: "automatique", body: "scooter", cv: 2, conso: 2.4, city: "rabat", cond: "excellent", cc: 125 },
  { id: "m011", kind: "moto", make: "SYM", model: "Symphony 125", version: "ST", year: 2021, km: 16000, price: 18500, fuel: "essence", gearbox: "automatique", body: "scooter", cv: 2, conso: 2.6, city: "casablanca", cond: "tres-bon", cc: 125 },
  { id: "m012", kind: "moto", make: "Peugeot", model: "Kisbee", version: "50 4T", year: 2020, km: 12000, price: 9200, fuel: "essence", gearbox: "automatique", body: "scooter", cv: 1, conso: 2.1, city: "meknes", cond: "bon", cc: 50 },
  { id: "m013", kind: "moto", make: "MBK", model: "Booster", version: "Naked", year: 2018, km: 19000, price: 8600, fuel: "essence", gearbox: "automatique", body: "scooter", cv: 1, conso: 2.8, city: "sale", cond: "moyen", cc: 50 },
  { id: "m014", kind: "moto", make: "Docker", model: "Star", version: "125", year: 2021, km: 23000, price: 12000, fuel: "essence", gearbox: "manuelle", body: "roadster", cv: 2, conso: 2.5, city: "khouribga", cond: "bon", cc: 125 },
  { id: "m015", kind: "moto", make: "Bajaj", model: "Boxer", version: "150 BM", year: 2020, km: 31000, price: 14000, fuel: "essence", gearbox: "manuelle", body: "roadster", cv: 2, conso: 2.4, city: "el-jadida", cond: "bon", cc: 150 },
  { id: "m016", kind: "moto", make: "Haojue", model: "DK 150", version: "HJ150", year: 2021, km: 18000, price: 13500, fuel: "essence", gearbox: "manuelle", body: "roadster", cv: 2, conso: 2.5, city: "nador", cond: "tres-bon", cc: 150 },
  { id: "m017", kind: "moto", make: "Yamaha", model: "Aerox", version: "155 VVA", year: 2022, km: 9000, price: 34000, fuel: "essence", gearbox: "automatique", body: "scooter", cv: 2, conso: 2.5, city: "casablanca", cond: "excellent", cc: 155 },
  { id: "m018", kind: "moto", make: "Honda", model: "Africa Twin", version: "CRF1000L DCT", year: 2018, km: 46000, price: 148000, fuel: "essence", gearbox: "automatique", body: "trail", cv: 11, conso: 5.0, city: "marrakech", cond: "tres-bon", cc: 998 },
  { id: "m019", kind: "moto", make: "Harley-Davidson", model: "Iron 883", version: "Sportster", year: 2017, km: 27000, price: 106000, fuel: "essence", gearbox: "manuelle", body: "custom", cv: 9, conso: 4.9, city: "casablanca", cond: "tres-bon", cc: 883 },
  { id: "m020", kind: "moto", make: "Benelli", model: "TRK 502", version: "X", year: 2021, km: 15000, price: 63000, fuel: "essence", gearbox: "manuelle", body: "trail", cv: 6, conso: 4.4, city: "tetouan", cond: "excellent", cc: 500 },
  { id: "m021", kind: "moto", make: "Yamaha", model: "NMAX", version: "155 ABS", year: 2021, km: 13000, price: 36000, fuel: "essence", gearbox: "automatique", body: "scooter", cv: 2, conso: 2.4, city: "agadir", cond: "tres-bon", cc: 155 },
  { id: "m022", kind: "moto", make: "KTM", model: "790 Adventure", version: "R", year: 2020, km: 25000, price: 118000, fuel: "essence", gearbox: "manuelle", body: "trail", cv: 10, conso: 4.8, city: "rabat", cond: "tres-bon", cc: 799 },
];

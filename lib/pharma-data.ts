import type { PharmaRecord } from "@/types/dashboard";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const regions = ["North", "South", "East", "West", "Central"];
const territories = {
  North: ["Alexandria", "Delta", "Mansoura"],
  South: ["Assiut", "Luxor", "Aswan"],
  East: ["Suez", "Ismailia", "Port Said"],
  West: ["Giza", "6th October", "Fayoum"],
  Central: ["Cairo A", "Cairo B", "Cairo C"]
};

const brands = [
  { brand: "Cardiovex", productLine: "Cardiology", price: 95, margin: 0.38 },
  { brand: "Glucofine", productLine: "Diabetes", price: 82, margin: 0.34 },
  { brand: "Oncora", productLine: "Oncology", price: 220, margin: 0.46 },
  { brand: "Respira", productLine: "Respiratory", price: 76, margin: 0.31 },
  { brand: "Neurocil", productLine: "CNS", price: 130, margin: 0.41 },
  { brand: "Immunex", productLine: "Immunology", price: 185, margin: 0.43 }
];

const reps = [
  { name: "Mona Nabil", manager: "Dina Salem", region: "North" },
  { name: "Omar Hassan", manager: "Dina Salem", region: "North" },
  { name: "Laila Farouk", manager: "Tarek Amin", region: "South" },
  { name: "Hany Adel", manager: "Tarek Amin", region: "South" },
  { name: "Nour Khaled", manager: "Maya Riad", region: "East" },
  { name: "Youssef Sami", manager: "Maya Riad", region: "East" },
  { name: "Sara Mostafa", manager: "Karim Zaki", region: "West" },
  { name: "Ali Maher", manager: "Karim Zaki", region: "West" },
  { name: "Mariam Fathy", manager: "Rana Helmy", region: "Central" },
  { name: "Ahmed Nasser", manager: "Rana Helmy", region: "Central" }
];

const customerTypes = ["Hospitals", "Clinics", "Pharmacies", "Key Accounts"];
const channels = ["Retail", "Tender", "Private", "E-commerce"];

function quarterFor(index: number) {
  return `Q${Math.floor(index / 3) + 1}`;
}

export const pharmaRecords: PharmaRecord[] = [];

for (const year of [2024, 2025, 2026]) {
  months.forEach((month, monthIndex) => {
    regions.forEach((region, regionIndex) => {
      brands.forEach((brand, brandIndex) => {
        const repPool = reps.filter((rep) => rep.region === region);
        const rep = repPool[(monthIndex + brandIndex) % repPool.length];
        const territoryList = territories[region as keyof typeof territories];
        const territory = territoryList[(monthIndex + brandIndex + regionIndex) % territoryList.length];
        const customerType = customerTypes[(brandIndex + monthIndex + regionIndex) % customerTypes.length];
        const channel = channels[(brandIndex + regionIndex) % channels.length];
        const seasonality = 1 + Math.sin((monthIndex + brandIndex) / 1.9) * 0.09;
        const yearLift = year === 2026 ? 1.18 : year === 2025 ? 1.09 : 1;
        const regionLift = 1 + regionIndex * 0.035;
        const brandLift = 1 + brandIndex * 0.055;
        const baseUnits = Math.round((760 + monthIndex * 26 + regionIndex * 45 + brandIndex * 62) * seasonality * yearLift * regionLift);
        const sales = Math.round(baseUnits * brand.price * brandLift);
        const target = Math.round(sales * (0.94 + ((monthIndex + brandIndex + regionIndex) % 7) * 0.018));
        const forecast = Math.round(sales * (0.97 + Math.cos(monthIndex + brandIndex) * 0.04));
        const marketSize = Math.round(sales * (3.4 + ((regionIndex + brandIndex) % 5) * 0.28));
        const imsSales = Math.round(sales * (1.02 + Math.sin(regionIndex + brandIndex) * 0.05));
        const priorImsSales = Math.round(imsSales / (1.04 + brandIndex * 0.012 + monthIndex * 0.003));
        const prescriptions = Math.round(baseUnits * (1.32 + brandIndex * 0.04));
        const priorPrescriptions = Math.round(prescriptions / (1.03 + regionIndex * 0.008 + monthIndex * 0.004));
        const customers = 85 + regionIndex * 8 + brandIndex * 5 + (monthIndex % 4) * 4;
        const activeCustomers = Math.round(customers * (0.68 + ((brandIndex + regionIndex) % 4) * 0.055));
        const plannedCalls = 175 + regionIndex * 12 + brandIndex * 7;
        const calls = Math.round(plannedCalls * (0.78 + ((monthIndex + brandIndex) % 5) * 0.045));

        pharmaRecords.push({
          id: `${year}-${month}-${region}-${brand.brand}`,
          year,
          quarter: quarterFor(monthIndex),
          month,
          monthIndex,
          region,
          territory,
          productLine: brand.productLine,
          brand: brand.brand,
          medicalRep: rep.name,
          manager: rep.manager,
          customerType,
          channel,
          sales,
          target,
          forecast,
          units: baseUnits,
          customers,
          activeCustomers,
          calls,
          plannedCalls,
          prescriptions,
          priorPrescriptions,
          imsSales,
          priorImsSales,
          marketSize,
          competitorA: Math.round(marketSize * (0.24 + brandIndex * 0.006)),
          competitorB: Math.round(marketSize * (0.18 + regionIndex * 0.008)),
          competitorC: Math.round(marketSize * (0.13 + monthIndex * 0.002)),
          margin: Math.round(sales * brand.margin)
        });
      });
    });
  });
}

export const filterOptions = {
  year: ["All", "2026", "2025", "2024"],
  quarter: ["All", "Q1", "Q2", "Q3", "Q4"],
  month: ["All", ...months],
  region: ["All", ...regions],
  territory: ["All", ...Object.values(territories).flat()],
  productLine: ["All", ...Array.from(new Set(brands.map((brand) => brand.productLine)))],
  brand: ["All", ...brands.map((brand) => brand.brand)],
  medicalRep: ["All", ...reps.map((rep) => rep.name)],
  manager: ["All", ...Array.from(new Set(reps.map((rep) => rep.manager)))],
  customerType: ["All", ...customerTypes],
  channel: ["All", ...channels]
};

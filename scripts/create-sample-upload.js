const XLSX = require('xlsx');
const data = [
  {
    Year: 2026,
    Quarter: 'Q1',
    Month: 'Jan',
    Region: 'North',
    Territory: 'Riyadh',
    'Product Line': 'Cardiology',
    Brand: 'CardioMax',
    'Medical Rep': 'Aisha',
    Manager: 'Khalid',
    'Customer Type': 'Hospital',
    Channel: 'Institutional',
    Sales: 1250000,
    Target: 1300000,
    Forecast: 1280000,
    Units: 4500,
    Customers: 120,
    'Active Customers': 98,
    Calls: 210,
    'Planned Calls': 240,
    Prescriptions: 1050,
    'Prior Prescriptions': 980,
    'IMS Sales': 1180000,
    'Prior IMS Sales': 1110000,
    'Market Size': 8000000,
    'Competitor A': 2200000,
    'Competitor B': 1800000,
    'Competitor C': 1400000,
    Margin: 0.32
  },
  {
    Year: 2026,
    Quarter: 'Q1',
    Month: 'Feb',
    Region: 'West',
    Territory: 'Jeddah',
    'Product Line': 'Diabetes',
    Brand: 'GlucoCare',
    'Medical Rep': 'Mina',
    Manager: 'Sami',
    'Customer Type': 'Clinic',
    Channel: 'Retail',
    Sales: 980000,
    Target: 1050000,
    Forecast: 1000000,
    Units: 3800,
    Customers: 90,
    'Active Customers': 76,
    Calls: 180,
    'Planned Calls': 200,
    Prescriptions: 820,
    'Prior Prescriptions': 770,
    'IMS Sales': 930000,
    'Prior IMS Sales': 890000,
    'Market Size': 6000000,
    'Competitor A': 1900000,
    'Competitor B': 1450000,
    'Competitor C': 1300000,
    Margin: 0.25
  }
];
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'SalesData');
XLSX.writeFile(wb, 'sample-pharma-upload.xlsx');
console.log('Created sample-pharma-upload.xlsx');

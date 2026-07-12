export const dashboardMetrics = [
  { label: "Vehicles", value: "18", note: "14 available" },
  { label: "Drivers", value: "22", note: "17 available" },
  { label: "Active Trips", value: "5", note: "2 dispatch-ready" },
  { label: "Monthly Spend", value: "$8.4k", note: "Fuel and expenses" },
];

export const vehicles = [
  {
    id: 1,
    registration_no: "VAN-05",
    vehicle_name: "Ford Transit",
    model: "Transit",
    vehicle_type: "Van",
    max_load_capacity: "500.00",
    odometer: "42100.00",
    acquisition_cost: "25000.00",
    region: "North",
    status: "Available",
  },
  {
    id: 2,
    registration_no: "TRK-11",
    vehicle_name: "Tata Ultra",
    model: "Ultra",
    vehicle_type: "Truck",
    max_load_capacity: "2500.00",
    odometer: "86320.00",
    acquisition_cost: "64000.00",
    region: "Central",
    status: "On Trip",
  },
  {
    id: 3,
    registration_no: "BUS-02",
    vehicle_name: "Eicher Pro",
    model: "Pro",
    vehicle_type: "Mini Truck",
    max_load_capacity: "1200.00",
    odometer: "60990.00",
    acquisition_cost: "42000.00",
    region: "West",
    status: "In Shop",
  },
];

export const drivers = [
  {
    id: 1,
    name: "Alex Carter",
    license_no: "DL-AX-9021",
    license_category: "LMV",
    license_expiry: "2027-05-20",
    phone: "+91 90000 11111",
    safety_score: "94.00",
    status: "Available",
  },
  {
    id: 2,
    name: "Riya Shah",
    license_no: "DL-RS-2044",
    license_category: "HMV",
    license_expiry: "2028-02-14",
    phone: "+91 90000 22222",
    safety_score: "88.00",
    status: "On Trip",
  },
  {
    id: 3,
    name: "Kabir Khan",
    license_no: "DL-KK-7881",
    license_category: "HMV",
    license_expiry: "2025-01-08",
    phone: "+91 90000 33333",
    safety_score: "73.00",
    status: "Suspended",
  },
];

export const trips = [
  {
    id: 1,
    code: "TRIP-1001",
    vehicle: "TRK-11",
    driver: "Riya Shah",
    source: "Warehouse A",
    destination: "Retail Hub 4",
    cargo_weight: "1800.00",
    planned_distance: "120.00",
    status: "Dispatched",
  },
  {
    id: 2,
    code: "TRIP-1002",
    vehicle: "VAN-05",
    driver: "Alex Carter",
    source: "Depot North",
    destination: "Client Site 7",
    cargo_weight: "450.00",
    planned_distance: "52.00",
    status: "Draft",
  },
];

export const maintenanceLogs = [
  {
    id: 1,
    vehicle: "BUS-02",
    maintenance_type: "Oil Change",
    cost: "180.00",
    status: "Active",
    start_date: "2026-07-12",
  },
  {
    id: 2,
    vehicle: "VAN-03",
    maintenance_type: "Brake Service",
    cost: "430.00",
    status: "Closed",
    start_date: "2026-07-08",
  },
];

export const fuelLogs = [
  {
    id: 1,
    vehicle: "TRK-11",
    trip: "TRIP-1001",
    liters: 82,
    cost: "6150.00",
    fuel_date: "2026-07-12",
    source: "Trip Completion",
  },
  {
    id: 2,
    vehicle: "VAN-05",
    trip: "TRIP-1002",
    liters: 28,
    cost: "2100.00",
    fuel_date: "2026-07-11",
    source: "Manual Entry",
  },
];

export const expenses = [
  {
    id: 1,
    vehicle: "TRK-11",
    trip: "TRIP-1001",
    category: "Tolls",
    amount: "950.00",
    expense_date: "2026-07-12",
    source: "Manual Entry",
  },
  {
    id: 2,
    vehicle: "VAN-05",
    trip: "TRIP-1002",
    category: "Other",
    amount: "180.00",
    expense_date: "2026-07-11",
    source: "Manual Entry",
  },
];

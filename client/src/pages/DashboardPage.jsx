import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboardApi.js";
import { tripsApi } from "../api/tripsApi.js";
import { vehiclesApi } from "../api/vehiclesApi.js";
import DataTable from "../components/DataTable.jsx";
import InlineError from "../components/feedback/InlineError.jsx";
import KpiCard from "../components/KpiCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { dashboardMetrics, trips, vehicles } from "../data/mockData.js";
import { formatCurrency } from "../utils/formatters.js";
import { unwrapApiData, unwrapApiList } from "../utils/unwrapApiData.js";

const tripColumns = [
  { key: "id", label: "Trip", render: (row) => row.code ?? String(row.id).slice(0, 8) },
  { key: "vehicle_name", label: "Vehicle", render: (row) => row.vehicle_name ?? row.vehicle ?? "-" },
  { key: "license_no", label: "Driver", render: (row) => row.license_no ?? row.driver ?? "-" },
  { key: "destination", label: "Destination" },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

const vehicleColumns = [
  { key: "registration_no", label: "Vehicle" },
  { key: "vehicle_name", label: "Name" },
  { key: "region", label: "Region" },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function buildMetrics(stats) {
  if (!stats?.kpis) {
    return dashboardMetrics;
  }

  return [
    { label: "Available Vehicles", value: stats.kpis.available_vehicles, note: `${stats.kpis.in_shop_vehicles} in shop` },
    { label: "Active Trips", value: stats.kpis.active_trips, note: "Currently dispatched" },
    { label: "Revenue", value: formatCurrency(stats.kpis.total_revenue), note: "Completed trips" },
    { label: "Net Profit", value: formatCurrency(stats.kpis.net_profit), note: `${formatCurrency(stats.kpis.total_expenses)} expenses` },
  ];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(dashboardMetrics);
  const [tripRows, setTripRows] = useState(trips);
  const [vehicleRows, setVehicleRows] = useState(vehicles);
  const [loadNotice, setLoadNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [dashboardResponse, tripsResponse, vehiclesResponse] = await Promise.all([
          dashboardApi.stats(),
          tripsApi.list({ status: "Dispatched" }),
          vehiclesApi.list(),
        ]);

        if (!isMounted) {
          return;
        }

        const dashboardData = unwrapApiData(dashboardResponse, {});
        setMetrics(buildMetrics(dashboardData));
        setTripRows(unwrapApiList(tripsResponse, []));
        setVehicleRows(unwrapApiList(vehiclesResponse, []));
        setLoadNotice("");
      } catch {
        if (isMounted) {
          setMetrics(dashboardMetrics);
          setTripRows(trips);
          setVehicleRows(vehicles);
          setLoadNotice("Using local demo dashboard data until the backend starts cleanly.");
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Fleet Overview"
        description="Monitor vehicle availability, active trips, driver readiness, and fleet costs."
      />
      {loadNotice ? <InlineError message={loadNotice} /> : null}
      <section className="grid kpi-grid">
        {metrics.map((metric) => (
          <KpiCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="grid two-column-grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Active Trip Watchlist</h3>
          <DataTable columns={tripColumns} rows={tripRows} emptyMessage="No trips found." />
        </div>
        <div className="card">
          <h3>Vehicle Availability</h3>
          <DataTable columns={vehicleColumns} rows={vehicleRows} emptyMessage="No vehicles found." />
        </div>
      </section>
    </>
  );
}

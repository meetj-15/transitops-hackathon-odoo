import { useEffect, useState } from "react";
import { fuelApi } from "../api/fuelApi.js";
import { tripsApi } from "../api/tripsApi.js";
import { vehiclesApi } from "../api/vehiclesApi.js";
import DataTable from "../components/DataTable.jsx";
import InlineError from "../components/feedback/InlineError.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Modal from "../components/ui/Modal.jsx";
import { fuelLogs, trips, vehicles } from "../data/mockData.js";
import { fuelSchema } from "../schemas/fuelSchema.js";
import { formatCurrency, formatDate, formatNumber } from "../utils/formatters.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { normalizeNumber } from "../utils/normalizeNumber.js";
import { unwrapApiData, unwrapApiList } from "../utils/unwrapApiData.js";

const columns = [
  { key: "vehicle_label", label: "Vehicle", render: (row) => row.vehicle_name ?? row.vehicle ?? row.registration_no ?? "-" },
  { key: "trip_id", label: "Trip", render: (row) => row.trip ?? (row.trip_id ? String(row.trip_id).slice(0, 8) : "-") },
  { key: "liters", label: "Liters", render: (row) => formatNumber(normalizeNumber(row.liters)) },
  { key: "cost", label: "Cost", render: (row) => formatCurrency(row.cost) },
  { key: "fuel_date", label: "Logged", render: (row) => formatDate(row.fuel_date ?? row.date) },
  { key: "source", label: "Source", render: (row) => row.source ?? "Manual Entry" },
];

const initialFuelValues = {
  vehicle_id: "",
  trip_id: "",
  liters: "",
  cost: "",
  fuel_date: new Date().toISOString().slice(0, 10),
};

export default function FuelPage() {
  const [records, setRecords] = useState(fuelLogs);
  const [vehicleOptions, setVehicleOptions] = useState(vehicles);
  const [tripOptions, setTripOptions] = useState(trips);
  const [isLoading, setIsLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialFuelValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFuelLogs() {
      try {
        const [fuelResponse, vehiclesResponse, tripsResponse] = await Promise.all([
          fuelApi.list(),
          vehiclesApi.list(),
          tripsApi.list(),
        ]);

        if (isMounted) {
          setRecords(unwrapApiList(fuelResponse, []));
          setVehicleOptions(unwrapApiList(vehiclesResponse, []));
          setTripOptions(unwrapApiList(tripsResponse, []));
          setLoadNotice("");
        }
      } catch {
        if (isMounted) {
          setRecords(fuelLogs);
          setVehicleOptions(vehicles);
          setTripOptions(trips);
          setLoadNotice("Using local demo fuel logs until the backend starts cleanly.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFuelLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  function openModal() {
    setFormValues({
      ...initialFuelValues,
      vehicle_id: vehicleOptions[0]?.id ? String(vehicleOptions[0].id) : "",
    });
    setFieldErrors({});
    setFormError("");
    setIsModalOpen(true);
  }

  function updateField(field, value) {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const parsed = fuelSchema.safeParse(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fuelApi.create(parsed.data);
      const createdLog = unwrapApiData(response, parsed.data);
      const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === parsed.data.vehicle_id);

      setRecords((currentRecords) => [
        {
          ...createdLog,
          vehicle_name: createdLog.vehicle_name ?? selectedVehicle?.vehicle_name,
          registration_no: createdLog.registration_no ?? selectedVehicle?.registration_no,
        },
        ...currentRecords,
      ]);
      setLoadNotice("");
      setIsModalOpen(false);
    } catch (error) {
      if (error.response) {
        setFormError(getApiErrorMessage(error, "Could not create fuel log."));
        return;
      }

      const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === parsed.data.vehicle_id);
      setRecords((currentRecords) => [
        {
          id: `local-fuel-${Date.now()}`,
          vehicle: selectedVehicle?.registration_no ?? selectedVehicle?.vehicle_name ?? parsed.data.vehicle_id,
          trip: parsed.data.trip_id || "-",
          liters: parsed.data.liters.toFixed(2),
          cost: parsed.data.cost.toFixed(2),
          fuel_date: parsed.data.fuel_date,
          source: "Manual Entry",
        },
        ...currentRecords,
      ]);
      setLoadNotice("Backend unavailable, so this fuel log was added locally for demo only.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Fuel Logs"
        description="Record fuel quantity, cost, date, and trip association without duplicate expense entries."
        action={<button className="button" type="button" onClick={openModal}>Add Fuel Log</button>}
      />
      <section className="card">
        {loadNotice ? <InlineError message={loadNotice} /> : null}
        <DataTable columns={columns} rows={isLoading ? [] : records} emptyMessage={isLoading ? "Loading fuel logs..." : "No fuel logs found."} />
      </section>
      <Modal isOpen={isModalOpen} title="Add Fuel Log" onClose={() => setIsModalOpen(false)}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <InlineError message={formError} />
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="fuel_vehicle_id">Vehicle</label>
              <select
                className="select"
                id="fuel_vehicle_id"
                value={formValues.vehicle_id}
                onChange={(event) => updateField("vehicle_id", event.target.value)}
              >
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_no ?? vehicle.vehicle_name} - {vehicle.vehicle_name}
                  </option>
                ))}
              </select>
              {!vehicleOptions.length ? <p className="field-hint warning">No vehicles available for fuel logging.</p> : null}
              <InlineError message={fieldErrors.vehicle_id?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="fuel_trip_id">Trip optional</label>
              <select
                className="select"
                id="fuel_trip_id"
                value={formValues.trip_id}
                onChange={(event) => updateField("trip_id", event.target.value)}
              >
                <option value="">No trip</option>
                {tripOptions.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {(trip.code ?? String(trip.id).slice(0, 8))} - {trip.destination ?? "Trip"}
                  </option>
                ))}
              </select>
              <InlineError message={fieldErrors.trip_id?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="liters">Liters</label>
              <input className="input" id="liters" min="0" type="number" value={formValues.liters} onChange={(event) => updateField("liters", event.target.value)} />
              <InlineError message={fieldErrors.liters?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="fuel_cost">Cost</label>
              <input className="input" id="fuel_cost" min="0" type="number" value={formValues.cost} onChange={(event) => updateField("cost", event.target.value)} />
              <InlineError message={fieldErrors.cost?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="fuel_date">Date</label>
              <input className="input" id="fuel_date" type="date" value={formValues.fuel_date} onChange={(event) => updateField("fuel_date", event.target.value)} />
              <InlineError message={fieldErrors.fuel_date?.[0]} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={isSubmitting || !vehicleOptions.length}>
              {isSubmitting ? "Saving..." : "Save Fuel Log"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

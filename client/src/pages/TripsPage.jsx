import { useEffect, useState } from "react";
import { driversApi } from "../api/driversApi.js";
import { tripsApi } from "../api/tripsApi.js";
import { vehiclesApi } from "../api/vehiclesApi.js";
import DataTable from "../components/DataTable.jsx";
import InlineError from "../components/feedback/InlineError.jsx";
import ModuleToolbar from "../components/ModuleToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { drivers, trips, vehicles } from "../data/mockData.js";
import { useRecordFilter } from "../hooks/useRecordFilter.js";
import { tripSchema } from "../schemas/tripSchema.js";
import { formatNumber } from "../utils/formatters.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { normalizeNumber } from "../utils/normalizeNumber.js";
import { unwrapApiData, unwrapApiList } from "../utils/unwrapApiData.js";

const initialTripValues = {
  vehicle_id: "",
  driver_id: "",
  source: "",
  destination: "",
  cargo_weight: "",
  planned_distance: "",
  revenue: "0",
};

export default function TripsPage() {
  const [records, setRecords] = useState(trips);
  const [vehicleOptions, setVehicleOptions] = useState(vehicles);
  const [driverOptions, setDriverOptions] = useState(drivers);
  const [isLoading, setIsLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialTripValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filter = useRecordFilter(records, ["code", "vehicle", "vehicle_name", "registration_no", "license_no", "source", "destination"]);
  const availableVehicles = vehicleOptions.filter((vehicle) => vehicle.status === "Available");
  const availableDrivers = driverOptions.filter((driver) => driver.status === "Available");

  useEffect(() => {
    let isMounted = true;

    async function loadTrips() {
      try {
        const [tripsResponse, vehiclesResponse, driversResponse] = await Promise.all([
          tripsApi.list(),
          vehiclesApi.list(),
          driversApi.available(),
        ]);

        if (isMounted) {
          setRecords(unwrapApiList(tripsResponse, []));
          setVehicleOptions(unwrapApiList(vehiclesResponse, []));
          setDriverOptions(unwrapApiList(driversResponse, []));
          setLoadNotice("");
        }
      } catch {
        if (isMounted) {
          setRecords(trips);
          setVehicleOptions(vehicles);
          setDriverOptions(drivers.filter((driver) => driver.status === "Available"));
          setLoadNotice("Using local demo trips until the backend starts cleanly.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  function openModal() {
    setFormValues({
      ...initialTripValues,
      vehicle_id: availableVehicles[0]?.id ? String(availableVehicles[0].id) : "",
      driver_id: availableDrivers[0]?.id ? String(availableDrivers[0].id) : "",
    });
    setFieldErrors({});
    setFormError("");
    setIsModalOpen(true);
  }

  function updateField(field, value) {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function mergeTrip(updatedTrip) {
    setRecords((currentRecords) => currentRecords.map((trip) => (trip.id === updatedTrip.id ? { ...trip, ...updatedTrip } : trip)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const parsed = tripSchema.safeParse(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await tripsApi.create(parsed.data);
      const createdTrip = unwrapApiData(response, parsed.data);
      const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === parsed.data.vehicle_id);
      const selectedDriver = driverOptions.find((driver) => String(driver.id) === parsed.data.driver_id);

      setRecords((currentRecords) => [
        {
          ...createdTrip,
          vehicle_name: createdTrip.vehicle_name ?? selectedVehicle?.vehicle_name,
          registration_no: createdTrip.registration_no ?? selectedVehicle?.registration_no,
          license_no: createdTrip.license_no ?? selectedDriver?.license_no,
        },
        ...currentRecords,
      ]);
      setLoadNotice("");
      setIsModalOpen(false);
    } catch (error) {
      if (error.response) {
        setFormError(getApiErrorMessage(error, "Could not create trip."));
        return;
      }

      const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === parsed.data.vehicle_id);
      const selectedDriver = driverOptions.find((driver) => String(driver.id) === parsed.data.driver_id);

      setRecords((currentRecords) => [
        {
          id: `local-trip-${Date.now()}`,
          ...parsed.data,
          vehicle: selectedVehicle?.registration_no ?? selectedVehicle?.vehicle_name ?? parsed.data.vehicle_id,
          driver: selectedDriver?.name ?? selectedDriver?.license_no ?? parsed.data.driver_id,
          status: "Draft",
        },
        ...currentRecords,
      ]);
      setLoadNotice("Backend unavailable, so this trip was added locally for demo only.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDispatch(row) {
    try {
      const response = await tripsApi.dispatch(row.id);
      mergeTrip(unwrapApiData(response, row));
      setLoadNotice("");
    } catch {
      mergeTrip({ ...row, status: "Dispatched" });
      setLoadNotice("Backend unavailable, so the trip status changed locally for demo only.");
    }
  }

  async function handleComplete(row) {
    const actualDistance = window.prompt("Actual distance travelled");
    const endOdometer = window.prompt("End odometer reading");

    if (!actualDistance || !endOdometer) {
      return;
    }

    try {
      const response = await tripsApi.complete(row.id, {
        actual_distance: Number(actualDistance),
        end_odometer: Number(endOdometer),
      });
      mergeTrip(unwrapApiData(response, row));
      setLoadNotice("");
    } catch {
      mergeTrip({ ...row, status: "Completed" });
      setLoadNotice("Backend unavailable, so the trip was completed locally for demo only.");
    }
  }

  async function handleCancel(row) {
    try {
      const response = await tripsApi.cancel(row.id);
      mergeTrip(unwrapApiData(response, row));
      setLoadNotice("");
    } catch {
      mergeTrip({ ...row, status: "Cancelled" });
      setLoadNotice("Backend unavailable, so the trip was cancelled locally for demo only.");
    }
  }

  const columns = [
    { key: "trip_label", label: "Trip", render: (row) => row.code ?? String(row.id).slice(0, 8) },
    { key: "vehicle_label", label: "Vehicle", render: (row) => row.vehicle_name ?? row.vehicle ?? row.registration_no ?? "-" },
    { key: "driver_label", label: "Driver", render: (row) => row.driver ?? row.license_no ?? "-" },
    { key: "source", label: "Source" },
    { key: "destination", label: "Destination" },
    { key: "cargo_weight", label: "Cargo", render: (row) => `${formatNumber(normalizeNumber(row.cargo_weight))} kg` },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="table-actions">
          {row.status === "Draft" ? <button className="link-button" type="button" onClick={() => handleDispatch(row)}>Dispatch</button> : null}
          {row.status === "Dispatched" ? <button className="link-button" type="button" onClick={() => handleComplete(row)}>Complete</button> : null}
          {row.status !== "Completed" && row.status !== "Cancelled" ? (
            <button className="link-button danger" type="button" onClick={() => handleCancel(row)}>Cancel</button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Trips"
        description="Create draft trips, validate resources, dispatch safely, and complete deliveries."
        action={<button className="button" type="button" onClick={openModal}>Create Trip</button>}
      />
      <section className="card">
        {loadNotice ? <InlineError message={loadNotice} /> : null}
        <ModuleToolbar
          searchValue={filter.searchValue}
          onSearchChange={filter.setSearchValue}
          filterValue={filter.filterValue}
          onFilterChange={filter.setFilterValue}
        />
        <DataTable
          columns={columns}
          rows={isLoading ? [] : filter.filteredRecords}
          emptyMessage={isLoading ? "Loading trips..." : "No trips match the current filters."}
        />
      </section>
      <Modal isOpen={isModalOpen} title="Create Trip" onClose={() => setIsModalOpen(false)}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <InlineError message={formError} />
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="trip_vehicle_id">Vehicle</label>
              <select
                className="select"
                id="trip_vehicle_id"
                value={formValues.vehicle_id}
                onChange={(event) => updateField("vehicle_id", event.target.value)}
              >
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_no ?? vehicle.vehicle_name} - {vehicle.vehicle_name}
                  </option>
                ))}
              </select>
              {!availableVehicles.length ? <p className="field-hint warning">No available vehicles. Close trips or maintenance first.</p> : null}
              <InlineError message={fieldErrors.vehicle_id?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="trip_driver_id">Driver</label>
              <select
                className="select"
                id="trip_driver_id"
                value={formValues.driver_id}
                onChange={(event) => updateField("driver_id", event.target.value)}
              >
                {availableDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name ?? driver.license_no}
                  </option>
                ))}
              </select>
              {!availableDrivers.length ? <p className="field-hint warning">No available drivers. Add a driver or complete an active trip first.</p> : null}
              <InlineError message={fieldErrors.driver_id?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="source">Source</label>
              <input className="input" id="source" value={formValues.source} onChange={(event) => updateField("source", event.target.value)} />
              <InlineError message={fieldErrors.source?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="destination">Destination</label>
              <input className="input" id="destination" value={formValues.destination} onChange={(event) => updateField("destination", event.target.value)} />
              <InlineError message={fieldErrors.destination?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="cargo_weight">Cargo weight kg</label>
              <input className="input" id="cargo_weight" min="0" type="number" value={formValues.cargo_weight} onChange={(event) => updateField("cargo_weight", event.target.value)} />
              <InlineError message={fieldErrors.cargo_weight?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="planned_distance">Planned distance km</label>
              <input className="input" id="planned_distance" min="0" type="number" value={formValues.planned_distance} onChange={(event) => updateField("planned_distance", event.target.value)} />
              <InlineError message={fieldErrors.planned_distance?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="revenue">Revenue</label>
              <input className="input" id="revenue" min="0" type="number" value={formValues.revenue} onChange={(event) => updateField("revenue", event.target.value)} />
              <InlineError message={fieldErrors.revenue?.[0]} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={isSubmitting || !availableVehicles.length || !availableDrivers.length}>
              {isSubmitting ? "Saving..." : "Save Trip"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

import { useEffect, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import InlineError from "../components/feedback/InlineError.jsx";
import ModuleToolbar from "../components/ModuleToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { vehiclesApi } from "../api/vehiclesApi.js";
import { vehicles } from "../data/mockData.js";
import { useRecordFilter } from "../hooks/useRecordFilter.js";
import { vehicleSchema } from "../schemas/vehicleSchema.js";
import { formatNumber } from "../utils/formatters.js";
import { normalizeNumber } from "../utils/normalizeNumber.js";

const columns = [
  { key: "vehicle_name", label: "Vehicle" },
  { key: "registration_no", label: "Registration" },
  { key: "vehicle_type", label: "Type" },
  {
    key: "max_load_capacity",
    label: "Capacity",
    render: (row) => `${formatNumber(normalizeNumber(row.max_load_capacity))} kg`,
  },
  { key: "odometer", label: "Odometer", render: (row) => `${formatNumber(normalizeNumber(row.odometer))} km` },
  { key: "region", label: "Region" },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

const initialFormValues = {
  registration_no: "",
  vehicle_name: "",
  model: "",
  vehicle_type: "Van",
  max_load_capacity: "",
  odometer: "0",
  acquisition_cost: "",
  region: "",
};

export default function VehiclesPage() {
  const [records, setRecords] = useState(vehicles);
  const [isLoading, setIsLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const filter = useRecordFilter(records, ["registration_no", "vehicle_name", "model", "vehicle_type", "region"]);

  useEffect(() => {
    let isMounted = true;

    async function loadVehicles() {
      try {
        const response = await vehiclesApi.list();
        const nextRecords = response.data.data ?? [];

        if (isMounted) {
          setRecords(nextRecords);
          setLoadNotice("");
        }
      } catch {
        if (isMounted) {
          setRecords(vehicles);
          setLoadNotice("Using local demo vehicles until the backend is running and you are signed in with a real token.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

  function openModal() {
    setFormValues(initialFormValues);
    setFieldErrors({});
    setFormError("");
    setIsModalOpen(true);
  }

  function updateField(field, value) {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const parsed = vehicleSchema.safeParse(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    const duplicateRegistration = records.some(
      (vehicle) => vehicle.registration_no?.toUpperCase() === parsed.data.registration_no
    );

    if (duplicateRegistration) {
      setFormError("A vehicle with this registration number already exists.");
      return;
    }

    const payload = {
      ...parsed.data,
      max_load_capacity: Number(parsed.data.max_load_capacity),
      odometer: Number(parsed.data.odometer),
      acquisition_cost: Number(parsed.data.acquisition_cost),
    };

    vehiclesApi
      .create(payload)
      .then((response) => {
        setRecords((currentRecords) => [response.data.data, ...currentRecords]);
        setLoadNotice("");
        setIsModalOpen(false);
      })
      .catch((error) => {
        if (error.response) {
          setFormError(error.response.data?.message ?? "Could not create vehicle.");
          return;
        }

        setRecords((currentRecords) => [
          ...currentRecords,
          {
            id: `local-${Date.now()}`,
            ...payload,
            max_load_capacity: payload.max_load_capacity.toFixed(2),
            odometer: payload.odometer.toFixed(2),
            acquisition_cost: payload.acquisition_cost.toFixed(2),
            status: "Available",
          },
        ]);
        setLoadNotice("Backend unavailable, so this vehicle was added locally for demo only.");
        setIsModalOpen(false);
      });
  }

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Manage vehicle registration, capacity, availability, mileage, and lifecycle."
        action={<button className="button" type="button" onClick={openModal}>Add Vehicle</button>}
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
          emptyMessage={isLoading ? "Loading vehicles..." : "No vehicles match the current filters."}
        />
      </section>
      <Modal isOpen={isModalOpen} title="Add Vehicle" onClose={() => setIsModalOpen(false)}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <InlineError message={formError} />
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="registration_no">Registration number</label>
              <input
                className="input"
                id="registration_no"
                value={formValues.registration_no}
                onChange={(event) => updateField("registration_no", event.target.value)}
              />
              <InlineError message={fieldErrors.registration_no?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="vehicle_name">Vehicle name</label>
              <input
                className="input"
                id="vehicle_name"
                value={formValues.vehicle_name}
                onChange={(event) => updateField("vehicle_name", event.target.value)}
              />
              <InlineError message={fieldErrors.vehicle_name?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="model">Model optional</label>
              <input
                className="input"
                id="model"
                value={formValues.model}
                onChange={(event) => updateField("model", event.target.value)}
              />
              <InlineError message={fieldErrors.model?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="vehicle_type">Vehicle type</label>
              <select
                className="select"
                id="vehicle_type"
                value={formValues.vehicle_type}
                onChange={(event) => updateField("vehicle_type", event.target.value)}
              >
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Car">Car</option>
                <option value="Semi-Trailer">Semi-Trailer</option>
              </select>
              <InlineError message={fieldErrors.vehicle_type?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="region">Region</label>
              <input
                className="input"
                id="region"
                value={formValues.region}
                onChange={(event) => updateField("region", event.target.value)}
              />
              <InlineError message={fieldErrors.region?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="max_load_capacity">Max load capacity kg</label>
              <input
                className="input"
                id="max_load_capacity"
                min="0"
                type="number"
                value={formValues.max_load_capacity}
                onChange={(event) => updateField("max_load_capacity", event.target.value)}
              />
              <InlineError message={fieldErrors.max_load_capacity?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="odometer">Odometer km</label>
              <input
                className="input"
                id="odometer"
                min="0"
                type="number"
                value={formValues.odometer}
                onChange={(event) => updateField("odometer", event.target.value)}
              />
              <InlineError message={fieldErrors.odometer?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="acquisition_cost">Acquisition cost</label>
              <input
                className="input"
                id="acquisition_cost"
                min="0"
                type="number"
                value={formValues.acquisition_cost}
                onChange={(event) => updateField("acquisition_cost", event.target.value)}
              />
              <InlineError message={fieldErrors.acquisition_cost?.[0]} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="button" type="submit">
              Save Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

import { useEffect, useState } from "react";
import { maintenanceApi } from "../api/maintenanceApi.js";
import { vehiclesApi } from "../api/vehiclesApi.js";
import DataTable from "../components/DataTable.jsx";
import InlineError from "../components/feedback/InlineError.jsx";
import ModuleToolbar from "../components/ModuleToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { maintenanceLogs, vehicles } from "../data/mockData.js";
import { useRecordFilter } from "../hooks/useRecordFilter.js";
import { maintenanceSchema } from "../schemas/maintenanceSchema.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { unwrapApiData, unwrapApiList } from "../utils/unwrapApiData.js";

const initialMaintenanceValues = {
  vehicle_id: "",
  maintenance_type: "Inspection",
  description: "",
  cost: "0",
  start_date: new Date().toISOString().slice(0, 10),
};

export default function MaintenancePage() {
  const [records, setRecords] = useState(maintenanceLogs);
  const [vehicleOptions, setVehicleOptions] = useState(vehicles);
  const [isLoading, setIsLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialMaintenanceValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filter = useRecordFilter(records, ["vehicle", "vehicle_name", "registration_no", "type", "maintenance_type"]);
  const serviceableVehicles = vehicleOptions.filter((vehicle) => vehicle.status !== "On Trip");

  useEffect(() => {
    let isMounted = true;

    async function loadMaintenance() {
      try {
        const [maintenanceResponse, vehiclesResponse] = await Promise.all([
          maintenanceApi.list(),
          vehiclesApi.list(),
        ]);

        if (isMounted) {
          setRecords(unwrapApiList(maintenanceResponse, []));
          setVehicleOptions(unwrapApiList(vehiclesResponse, []));
          setLoadNotice("");
        }
      } catch {
        if (isMounted) {
          setRecords(maintenanceLogs);
          setVehicleOptions(vehicles);
          setLoadNotice("Using local demo maintenance records until the backend starts cleanly.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMaintenance();

    return () => {
      isMounted = false;
    };
  }, []);

  function openModal() {
    setFormValues({
      ...initialMaintenanceValues,
      vehicle_id: serviceableVehicles[0]?.id ? String(serviceableVehicles[0].id) : "",
    });
    setFieldErrors({});
    setFormError("");
    setIsModalOpen(true);
  }

  function updateField(field, value) {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function mergeMaintenance(updatedLog) {
    setRecords((currentRecords) => currentRecords.map((record) => (record.id === updatedLog.id ? { ...record, ...updatedLog } : record)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const parsed = maintenanceSchema.safeParse(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await maintenanceApi.create(parsed.data);
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
        setFormError(getApiErrorMessage(error, "Could not open maintenance record."));
        return;
      }

      const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === parsed.data.vehicle_id);

      setRecords((currentRecords) => [
        {
          id: `local-maintenance-${Date.now()}`,
          ...parsed.data,
          vehicle: selectedVehicle?.registration_no ?? selectedVehicle?.vehicle_name ?? parsed.data.vehicle_id,
          status: "Active",
        },
        ...currentRecords,
      ]);
      setLoadNotice("Backend unavailable, so this maintenance record was added locally for demo only.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClose(row) {
    try {
      const response = await maintenanceApi.close(row.id);
      mergeMaintenance(unwrapApiData(response, row));
      setLoadNotice("");
    } catch {
      mergeMaintenance({ ...row, status: "Completed", end_date: new Date().toISOString().slice(0, 10) });
      setLoadNotice("Backend unavailable, so this maintenance record was closed locally for demo only.");
    }
  }

  const columns = [
    { key: "vehicle_label", label: "Vehicle", render: (row) => row.vehicle_name ?? row.vehicle ?? row.registration_no ?? "-" },
    { key: "maintenance_type", label: "Type", render: (row) => row.maintenance_type ?? row.type },
    { key: "cost", label: "Cost", render: (row) => formatCurrency(row.cost) },
    { key: "start_date", label: "Started", render: (row) => formatDate(row.start_date) },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        row.status === "Active" ? <button className="link-button" type="button" onClick={() => handleClose(row)}>Close</button> : null
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Open service records, close repairs, and control vehicle dispatch availability."
        action={<button className="button" type="button" onClick={openModal}>Open Maintenance</button>}
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
          emptyMessage={isLoading ? "Loading maintenance records..." : "No maintenance records match the current filters."}
        />
      </section>
      <Modal isOpen={isModalOpen} title="Open Maintenance" onClose={() => setIsModalOpen(false)}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <InlineError message={formError} />
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="maintenance_vehicle_id">Vehicle</label>
              <select
                className="select"
                id="maintenance_vehicle_id"
                value={formValues.vehicle_id}
                onChange={(event) => updateField("vehicle_id", event.target.value)}
              >
                {serviceableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_no ?? vehicle.vehicle_name} - {vehicle.status}
                  </option>
                ))}
              </select>
              {!serviceableVehicles.length ? <p className="field-hint warning">No serviceable vehicles. Vehicles on trip cannot be moved to maintenance.</p> : null}
              <InlineError message={fieldErrors.vehicle_id?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="maintenance_type">Maintenance type</label>
              <select
                className="select"
                id="maintenance_type"
                value={formValues.maintenance_type}
                onChange={(event) => updateField("maintenance_type", event.target.value)}
              >
                <option value="Inspection">Inspection</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Brake Service">Brake Service</option>
                <option value="Repair">Repair</option>
              </select>
              <InlineError message={fieldErrors.maintenance_type?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="maintenance_cost">Cost</label>
              <input className="input" id="maintenance_cost" min="0" type="number" value={formValues.cost} onChange={(event) => updateField("cost", event.target.value)} />
              <InlineError message={fieldErrors.cost?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="maintenance_start_date">Start date</label>
              <input className="input" id="maintenance_start_date" type="date" value={formValues.start_date} onChange={(event) => updateField("start_date", event.target.value)} />
              <InlineError message={fieldErrors.start_date?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="maintenance_description">Description optional</label>
              <input className="input" id="maintenance_description" value={formValues.description} onChange={(event) => updateField("description", event.target.value)} />
              <InlineError message={fieldErrors.description?.[0]} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={isSubmitting || !serviceableVehicles.length}>
              {isSubmitting ? "Saving..." : "Save Maintenance"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

import { useEffect, useState } from "react";
import { driversApi } from "../api/driversApi.js";
import DataTable from "../components/DataTable.jsx";
import InlineError from "../components/feedback/InlineError.jsx";
import ModuleToolbar from "../components/ModuleToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { drivers } from "../data/mockData.js";
import { useRecordFilter } from "../hooks/useRecordFilter.js";
import { driverSchema } from "../schemas/driverSchema.js";
import { formatDate } from "../utils/formatters.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { normalizeNumber } from "../utils/normalizeNumber.js";
import { unwrapApiData, unwrapApiList } from "../utils/unwrapApiData.js";

const columns = [
  { key: "driver_label", label: "Driver", render: (row) => row.name ?? row.license_no },
  { key: "license_no", label: "Licence", render: (row) => row.license_no ?? row.license_number },
  { key: "license_category", label: "Category" },
  { key: "license_expiry", label: "Expiry", render: (row) => formatDate(row.license_expiry ?? row.license_expiry_date) },
  { key: "phone", label: "Phone", render: (row) => row.phone ?? row.contact_number ?? "-" },
  { key: "safety_score", label: "Safety Score", render: (row) => `${normalizeNumber(row.safety_score)}/100` },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

const initialDriverValues = {
  license_no: "",
  license_category: "LMV",
  license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
  phone: "",
  safety_score: "100",
};

export default function DriversPage() {
  const [records, setRecords] = useState(drivers);
  const [isLoading, setIsLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialDriverValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filter = useRecordFilter(records, ["name", "license_no", "license_number", "license_category", "phone", "contact_number"]);

  useEffect(() => {
    let isMounted = true;

    async function loadDrivers() {
      try {
        const response = await driversApi.list();

        if (isMounted) {
          setRecords(unwrapApiList(response, []));
          setLoadNotice("");
        }
      } catch {
        if (isMounted) {
          setRecords(drivers);
          setLoadNotice("Using local demo drivers until the backend starts cleanly.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDrivers();

    return () => {
      isMounted = false;
    };
  }, []);

  function openModal() {
    setFormValues(initialDriverValues);
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

    const parsed = driverSchema.safeParse(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await driversApi.create(parsed.data);
      setRecords((currentRecords) => [unwrapApiData(response, parsed.data), ...currentRecords]);
      setLoadNotice("");
      setIsModalOpen(false);
    } catch (error) {
      if (error.response) {
        setFormError(getApiErrorMessage(error, "Could not create driver."));
        return;
      }

      setRecords((currentRecords) => [
        {
          id: `local-driver-${Date.now()}`,
          ...parsed.data,
          status: "Available",
        },
        ...currentRecords,
      ]);
      setLoadNotice("Backend unavailable, so this driver was added locally for demo only.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Drivers"
        description="Track licence validity, safety scores, compliance status, and driver availability."
        action={<button className="button" type="button" onClick={openModal}>Add Driver</button>}
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
          emptyMessage={isLoading ? "Loading drivers..." : "No drivers match the current filters."}
        />
      </section>
      <Modal isOpen={isModalOpen} title="Add Driver" onClose={() => setIsModalOpen(false)}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <InlineError message={formError} />
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="license_no">Licence number</label>
              <input
                className="input"
                id="license_no"
                value={formValues.license_no}
                onChange={(event) => updateField("license_no", event.target.value)}
              />
              <InlineError message={fieldErrors.license_no?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="license_category">Licence category</label>
              <select
                className="select"
                id="license_category"
                value={formValues.license_category}
                onChange={(event) => updateField("license_category", event.target.value)}
              >
                <option value="LMV">LMV</option>
                <option value="HMV">HMV</option>
                <option value="Commercial">Commercial</option>
              </select>
              <InlineError message={fieldErrors.license_category?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="license_expiry">Licence expiry</label>
              <input
                className="input"
                id="license_expiry"
                type="date"
                value={formValues.license_expiry}
                onChange={(event) => updateField("license_expiry", event.target.value)}
              />
              <InlineError message={fieldErrors.license_expiry?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone optional</label>
              <input
                className="input"
                id="phone"
                value={formValues.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
              <InlineError message={fieldErrors.phone?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="safety_score">Safety score</label>
              <input
                className="input"
                id="safety_score"
                max="100"
                min="0"
                type="number"
                value={formValues.safety_score}
                onChange={(event) => updateField("safety_score", event.target.value)}
              />
              <InlineError message={fieldErrors.safety_score?.[0]} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Driver"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

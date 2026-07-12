import { useEffect, useState } from "react";
import { expensesApi } from "../api/expensesApi.js";
import { tripsApi } from "../api/tripsApi.js";
import { vehiclesApi } from "../api/vehiclesApi.js";
import DataTable from "../components/DataTable.jsx";
import InlineError from "../components/feedback/InlineError.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Modal from "../components/ui/Modal.jsx";
import { expenses, trips, vehicles } from "../data/mockData.js";
import { expenseSchema } from "../schemas/expenseSchema.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { unwrapApiData, unwrapApiList } from "../utils/unwrapApiData.js";

const columns = [
  { key: "expense_date", label: "Date", render: (row) => formatDate(row.expense_date ?? row.date) },
  { key: "category", label: "Category", render: (row) => row.category ?? row.type },
  { key: "vehicle_label", label: "Vehicle", render: (row) => row.vehicle_name ?? row.vehicle ?? row.registration_no ?? "-" },
  { key: "trip_id", label: "Trip", render: (row) => row.trip ?? (row.trip_id ? String(row.trip_id).slice(0, 8) : "-") },
  { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
  { key: "source", label: "Source", render: (row) => row.source ?? "Manual Entry" },
];

const initialExpenseValues = {
  category: "Tolls",
  vehicle_id: "",
  trip_id: "",
  amount: "",
  description: "",
  expense_date: new Date().toISOString().slice(0, 10),
};

export default function ExpensesPage() {
  const [records, setRecords] = useState(expenses);
  const [vehicleOptions, setVehicleOptions] = useState(vehicles);
  const [tripOptions, setTripOptions] = useState(trips);
  const [isLoading, setIsLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialExpenseValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadExpenses() {
      try {
        const [expensesResponse, vehiclesResponse, tripsResponse] = await Promise.all([
          expensesApi.list(),
          vehiclesApi.list(),
          tripsApi.list(),
        ]);

        if (isMounted) {
          setRecords(unwrapApiList(expensesResponse, []));
          setVehicleOptions(unwrapApiList(vehiclesResponse, []));
          setTripOptions(unwrapApiList(tripsResponse, []));
          setLoadNotice("");
        }
      } catch {
        if (isMounted) {
          setRecords(expenses);
          setVehicleOptions(vehicles);
          setTripOptions(trips);
          setLoadNotice("Using local demo expenses until the backend starts cleanly.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadExpenses();

    return () => {
      isMounted = false;
    };
  }, []);

  function openModal() {
    setFormValues(initialExpenseValues);
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

    const parsed = expenseSchema.safeParse(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await expensesApi.create(parsed.data);
      const createdExpense = unwrapApiData(response, parsed.data);
      const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === parsed.data.vehicle_id);

      setRecords((currentRecords) => [
        {
          ...createdExpense,
          vehicle_name: createdExpense.vehicle_name ?? selectedVehicle?.vehicle_name,
          registration_no: createdExpense.registration_no ?? selectedVehicle?.registration_no,
        },
        ...currentRecords,
      ]);
      setLoadNotice("");
      setIsModalOpen(false);
    } catch (error) {
      if (error.response) {
        setFormError(getApiErrorMessage(error, "Could not create expense."));
        return;
      }

      const selectedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === parsed.data.vehicle_id);
      setRecords((currentRecords) => [
        {
          id: `local-expense-${Date.now()}`,
          category: parsed.data.category,
          vehicle: selectedVehicle?.registration_no ?? selectedVehicle?.vehicle_name ?? "-",
          trip: parsed.data.trip_id || "-",
          description: parsed.data.description || "-",
          amount: parsed.data.amount.toFixed(2),
          expense_date: parsed.data.expense_date,
          source: "Manual Entry",
        },
        ...currentRecords,
      ]);
      setLoadNotice("Backend unavailable, so this expense was added locally for demo only.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Capture tolls, parking, maintenance, fuel, and other operational costs."
        action={<button className="button" type="button" onClick={openModal}>Add Expense</button>}
      />
      <section className="card">
        {loadNotice ? <InlineError message={loadNotice} /> : null}
        <DataTable columns={columns} rows={isLoading ? [] : records} emptyMessage={isLoading ? "Loading expenses..." : "No expenses found."} />
      </section>
      <Modal isOpen={isModalOpen} title="Add Expense" onClose={() => setIsModalOpen(false)}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <InlineError message={formError} />
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="expense_category">Category</label>
              <select className="select" id="expense_category" value={formValues.category} onChange={(event) => updateField("category", event.target.value)}>
                <option value="Tolls">Tolls</option>
                <option value="Parking">Parking</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Fuel">Fuel</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
              <InlineError message={fieldErrors.category?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="expense_vehicle_id">Vehicle optional</label>
              <select className="select" id="expense_vehicle_id" value={formValues.vehicle_id} onChange={(event) => updateField("vehicle_id", event.target.value)}>
                <option value="">No vehicle</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_no ?? vehicle.vehicle_name} - {vehicle.vehicle_name}
                  </option>
                ))}
              </select>
              <InlineError message={fieldErrors.vehicle_id?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="expense_trip_id">Trip optional</label>
              <select className="select" id="expense_trip_id" value={formValues.trip_id} onChange={(event) => updateField("trip_id", event.target.value)}>
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
              <label htmlFor="expense_amount">Amount</label>
              <input className="input" id="expense_amount" min="0" type="number" value={formValues.amount} onChange={(event) => updateField("amount", event.target.value)} />
              <InlineError message={fieldErrors.amount?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="expense_date">Date</label>
              <input className="input" id="expense_date" type="date" value={formValues.expense_date} onChange={(event) => updateField("expense_date", event.target.value)} />
              <InlineError message={fieldErrors.expense_date?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="expense_description">Description optional</label>
              <input className="input" id="expense_description" placeholder="Highway toll" value={formValues.description} onChange={(event) => updateField("description", event.target.value)} />
              <InlineError message={fieldErrors.description?.[0]} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

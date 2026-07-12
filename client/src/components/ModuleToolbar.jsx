export default function ModuleToolbar({ searchValue, onSearchChange, filterValue, onFilterChange }) {
  return (
    <div className="toolbar">
      <input
        className="input"
        placeholder="Search records"
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <select
        className="select"
        value={filterValue}
        onChange={(event) => onFilterChange(event.target.value)}
      >
        <option value="ALL">All statuses</option>
        <option value="Available">Available</option>
        <option value="Draft">Draft</option>
        <option value="Dispatched">Dispatched</option>
        <option value="On Trip">On trip</option>
        <option value="In Shop">In shop</option>
        <option value="Active">Active</option>
        <option value="Closed">Closed</option>
      </select>
    </div>
  );
}

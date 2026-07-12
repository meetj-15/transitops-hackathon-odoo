export default function KpiCard({ label, value, note }) {
  return (
    <section className="card kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </section>
  );
}

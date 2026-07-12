export default function PageLoader({ message = "Loading" }) {
  return (
    <main className="centered-page">
      <div className="loader-card">
        <div className="spinner" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </main>
  );
}

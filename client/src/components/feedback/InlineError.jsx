export default function InlineError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="inline-error" role="alert">
      {message}
    </div>
  );
}

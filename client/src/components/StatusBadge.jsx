import { formatStatus } from "../utils/formatters.js";
import { getStatusTone } from "../utils/getStatusTone.js";

export default function StatusBadge({ status }) {
  const tone = getStatusTone(status);

  return (
    <span className={`status-badge status-${tone}`}>
      {formatStatus(status)}
    </span>
  );
}

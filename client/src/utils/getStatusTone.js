const statusToneMap = {
  Available: "success",
  Active: "success",
  Completed: "success",
  Dispatched: "info",
  "On Trip": "info",
  Draft: "warning",
  "In Shop": "warning",
  Suspended: "danger",
  Retired: "muted",
  Cancelled: "danger",
  Closed: "success",
};

export function getStatusTone(status) {
  return statusToneMap[status] ?? "muted";
}

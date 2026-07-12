import { useMemo, useState } from "react";

export function useRecordFilter(records, searchableFields) {
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("ALL");

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const safeRecords = Array.isArray(records) ? records : [];

    return safeRecords.filter((record) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableFields.some((field) =>
          String(record[field] ?? "")
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesFilter = filterValue === "ALL" || record.status === filterValue;

      return matchesSearch && matchesFilter;
    });
  }, [filterValue, records, searchValue, searchableFields]);

  return {
    filteredRecords,
    filterValue,
    searchValue,
    setFilterValue,
    setSearchValue,
  };
}

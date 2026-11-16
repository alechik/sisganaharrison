import type { GroupBase, StylesConfig } from "react-select";

export const creatableSelectStyles = <Option>(
  isDark: boolean
): StylesConfig<Option, false, GroupBase<Option>> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: isDark ? "#101828" : "transparent",
    borderColor: state.isFocused ? "#465fff" : isDark ? "#344054" : "#d0d5dd",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(70, 95, 255, 0.12)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#465fff" : isDark ? "#475467" : "#98a2b3",
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 12px" }),
  input: (base) => ({ ...base, color: isDark ? "#f2f4f7" : "#1d2939", margin: 0 }),
  singleValue: (base) => ({ ...base, color: isDark ? "#f2f4f7" : "#1d2939" }),
  placeholder: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
    backgroundColor: isDark ? "#101828" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e4e7ec",
    borderRadius: 8,
    overflow: "hidden",
  }),
  menuList: (base) => ({ ...base, padding: 4 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 6,
    backgroundColor: state.isFocused ? (isDark ? "rgba(255,255,255,0.06)" : "#f2f4f7") : "transparent",
    color: isDark ? "#f2f4f7" : "#344054",
    cursor: "pointer",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  clearIndicator: (base) => ({ ...base, color: isDark ? "#667085" : "#98a2b3" }),
  noOptionsMessage: (base) => ({ ...base, color: isDark ? "#98a2b3" : "#667085" }),
  loadingMessage: (base) => ({ ...base, color: isDark ? "#98a2b3" : "#667085" }),
});

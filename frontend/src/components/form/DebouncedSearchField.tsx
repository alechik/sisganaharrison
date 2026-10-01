import { useEffect, useRef, useState } from "react";

import ListRefreshIndicator from "@/components/common/ListRefreshIndicator";
import InputField from "@/components/form/input/InputField";
import { useListRefreshing } from "@/hooks/useListRequest";

export const SEARCH_DEBOUNCE_MS = 400;

interface DebouncedSearchFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  delayMs?: number;
}

export default function DebouncedSearchField({
  value,
  onValueChange,
  placeholder,
  disabled = false,
  delayMs = SEARCH_DEBOUNCE_MS,
}: DebouncedSearchFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const onValueChangeRef = useRef(onValueChange);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const isRefreshing = useListRefreshing();

  onValueChangeRef.current = onValueChange;

  useEffect(() => {
    const input = inputWrapRef.current?.querySelector("input");

    if (input && document.activeElement === input) {
      return;
    }

    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (localValue === value) {
      return;
    }

    const timer = window.setTimeout(() => {
      onValueChangeRef.current(localValue);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [localValue, value, delayMs]);

  return (
    <div ref={inputWrapRef} className="relative">
      <InputField
        type="text"
        placeholder={placeholder}
        value={localValue}
        disabled={disabled}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      <ListRefreshIndicator active={isRefreshing || localValue !== value} />
    </div>
  );
}

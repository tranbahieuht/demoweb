"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { Ref } from "react";
export type SelectOption = { value: string; label: string };
const empty = "__maison_any__";
export function Select({
  value,
  onValueChange,
  options,
  label,
  className = "",
  displayValue,
  name,
  onBlur,
  triggerRef,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  className?: string;
  displayValue?: string;
  name?: string;
  onBlur?: () => void;
  triggerRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value || empty}
      onValueChange={(next) => onValueChange(next === empty ? "" : next)}
      name={name}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={`select-trigger ${className}`}
        aria-label={label}
        onBlur={onBlur}
        ref={triggerRef}
      >
        <SelectPrimitive.Value>{displayValue}</SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="select-content"
          position="popper"
          sideOffset={8}
          collisionPadding={16}
          data-lenis-prevent
        >
          <SelectPrimitive.ScrollUpButton className="select-scroll">
            <ChevronUp size={15} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value || empty}
                data-value={option.value}
                className="select-option"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check size={14} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="select-scroll">
            <ChevronDown size={15} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

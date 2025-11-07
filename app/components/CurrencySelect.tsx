"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getFlagSrcForCurrency } from "@/lib/currency-flags";

interface CurrencySelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

export default function CurrencySelect({
  value,
  options,
  onChange,
  className = "",
}: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedFlagSrc = getFlagSrcForCurrency(value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border rounded px-2 py-1 bg-white text-black dark:bg-white dark:text-black min-w-[120px] justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-1">
          {selectedFlagSrc && (
            <Image
              src={selectedFlagSrc}
              alt={`${value} flag`}
              width={20}
              height={14}
              className="rounded-sm border"
            />
          )}
          <span>{value}</span>
        </div>
        <span className="text-xs opacity-60">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
          {options.map((code) => {
            const flagSrc = getFlagSrcForCurrency(code);
            const isSelected = code === value;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onChange(code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-100 ${
                  isSelected ? "bg-blue-50 font-semibold" : ""
                }`}
              >
                {flagSrc ? (
                  <Image
                    src={flagSrc}
                    alt={`${code} flag`}
                    width={20}
                    height={14}
                    className="rounded-sm border flex-shrink-0"
                  />
                ) : (
                  <div className="w-5 h-3.5 flex-shrink-0" />
                )}
                <span className="text-black">{code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


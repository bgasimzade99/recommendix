"use client";

import { useState } from "react";
import { loadAllData } from "@/lib/data-loader";
import type { Customer } from "@/types";
import { ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerPickerProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
}

export function CustomerPicker({ selectedCustomer, onSelect }: CustomerPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { customers } = loadAllData();
  const customerList = Array.from(customers.values());

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-zinc-800/50",
          !selectedCustomer && "text-zinc-500"
        )}
      >
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-zinc-400" />
          <span className={cn("text-sm font-medium", !selectedCustomer && "text-zinc-500")}>
            {selectedCustomer ? selectedCustomer.name : "Select a customer..."}
          </span>
          {selectedCustomer?.country && (
            <span className="text-xs text-zinc-500">
              ({selectedCustomer.country})
            </span>
          )}
        </div>
        <ChevronDown
          className={cn("h-5 w-5 text-zinc-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <>
          <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl backdrop-blur-xl">
            <div className="max-h-64 overflow-y-auto">
              {customerList.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    onSelect(customer);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-800/50",
                    selectedCustomer?.id === customer.id && "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-l-2 border-purple-500"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {customer.name}
                      </div>
                      {customer.country && (
                        <div className="text-xs text-zinc-500">
                          {customer.country}
                        </div>
                      )}
                    </div>
                    {customer.tags && customer.tags.length > 0 && (
                      <div className="flex gap-1">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}


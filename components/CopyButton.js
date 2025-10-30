"use client";

import { useToast } from "@/contexts/ToastProvider";

export default function CopyButton({ text, label = "Copy", success = "Copied!", className = "btn btn-ghost" }) {
  const { show } = useToast();
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      show(success);
    } catch (e) {
      show("Copy failed");
    }
  }
  return (
    <button className={className} onClick={onCopy} title="Copy to clipboard">
      {label}
    </button>
  );
}

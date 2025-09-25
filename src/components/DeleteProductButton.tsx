"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: number | string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3008/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || res.statusText || `HTTP ${res.status}`);
      }
      router.push("/products");
    } catch (e: any) {
      alert("Delete failed: " + (e?.message || e));
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="ml-2 px-3 py-1 bg-red-600 text-white rounded"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}

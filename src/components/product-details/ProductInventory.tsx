import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProductInventory({ product }: { product: any }) {
  if (!product?.product_quantity?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {product.product_quantity.map((q: any) => (
          <div key={q.id} className="border rounded p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="font-medium">Color</div>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="w-6 h-6 rounded"
                    style={{ background: q?.color?.hexCode ?? "#eee" }}
                  />
                  <div>
                    <div>{q?.color?.name ?? q.colorId}</div>
                    <div className="text-xs text-muted-foreground">
                      {q?.color?.hexCode ?? ""}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-medium">Size</div>
                <div className="mt-2">
                  <div>{q?.size?.value ?? q.sizeId}</div>
                  <div className="text-xs text-muted-foreground">
                    {q?.size?.system ?? ""}
                  </div>
                </div>
              </div>
              <div>
                <div className="font-medium">Stock & Meta</div>
                <div className="mt-2 space-y-1 text-sm">
                  <div>Available: {q.available_quantity}</div>
                  <div>Reserved: {q.reserved_quantity}</div>
                  <div>Min threshold: {q.minimum_threshold}</div>
                  {q.maximum_capacity != null && (
                    <div>Maximum capacity: {q.maximum_capacity}</div>
                  )}
                  <div>Active: {q.is_active ? "Yes" : "No"}</div>
                  {q.notes && <div>Notes: {q.notes}</div>}
                  <div className="text-xs text-muted-foreground">
                    Created:{" "}
                    {q.createdAt ? new Date(q.createdAt).toLocaleString() : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated:{" "}
                    {q.updatedAt ? new Date(q.updatedAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

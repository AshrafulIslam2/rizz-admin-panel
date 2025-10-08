"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Plus, Save, X, Loader2, Trash2, Power } from "lucide-react";
import shipmentApi, { DeliveryArea } from "@/lib/api/shipment";

export default function ShipmentSettingPage() {
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    charge: 0,
    isActive: true,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newArea, setNewArea] = useState({
    name: "",
    charge: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all delivery areas on mount
  useEffect(() => {
    fetchDeliveryAreas();
  }, []);

  const fetchDeliveryAreas = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      const areas = await shipmentApi.getAllDeliveryAreas();
      setDeliveryAreas(areas);
    } catch (err) {
      console.error("Error fetching delivery areas:", err);
      setError("Failed to load delivery areas. Please try again.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (area: DeliveryArea) => {
    setEditingId(area.id);
    setEditForm({
      name: area.areaName || area.name || "",
      charge: area.charge,
      isActive: area.isActive ?? true,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", charge: 0, isActive: true });
  };

  const handleSaveEdit = async (id: number) => {
    if (!editForm.name || editForm.charge <= 0) {
      alert("Please fill in all fields with valid values");
      return;
    }

    try {
      setLoading(true);
      const updatedArea = await shipmentApi.updateDeliveryArea(id, editForm);

      setDeliveryAreas(
        deliveryAreas.map((area) => (area.id === id ? updatedArea : area))
      );
      setEditingId(null);
      setEditForm({ name: "", charge: 0, isActive: true });
    } catch (err) {
      console.error("Error updating delivery area:", err);
      alert("Failed to update delivery area");
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = async () => {
    if (!newArea.name || newArea.charge <= 0) {
      alert("Please fill in all fields with valid values");
      return;
    }

    try {
      setLoading(true);
      const createdArea = await shipmentApi.createDeliveryArea(newArea);

      setDeliveryAreas([...deliveryAreas, createdArea]);
      setNewArea({ name: "", charge: 0, isActive: true });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Error adding delivery area:", err);
      alert("Failed to add delivery area");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this delivery area?")) {
      return;
    }

    try {
      setLoading(true);
      await shipmentApi.deleteDeliveryArea(id);

      setDeliveryAreas(deliveryAreas.filter((area) => area.id !== id));
    } catch (err) {
      console.error("Error deleting delivery area:", err);
      alert("Failed to delete delivery area");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setLoading(true);
      const updatedArea = await shipmentApi.toggleDeliveryAreaStatus(id);

      setDeliveryAreas(
        deliveryAreas.map((area) => (area.id === id ? updatedArea : area))
      );
    } catch (err) {
      console.error("Error toggling delivery area status:", err);
      alert("Failed to toggle delivery area status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipment Settings</h1>
          <p className="text-gray-500">
            Manage delivery areas and their charges
          </p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md flex items-center gap-2">
            {error}
            <Button size="sm" variant="outline" onClick={fetchDeliveryAreas}>
              Retry
            </Button>
          </div>
        )}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Delivery Area
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Delivery Area</DialogTitle>
              <DialogDescription>
                Create a new delivery area with its charge amount
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-area-name">Area Name</Label>
                <Input
                  id="new-area-name"
                  placeholder="e.g., Inside Sylhet"
                  value={newArea.name}
                  onChange={(e) =>
                    setNewArea({ ...newArea, name: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-area-charge">Delivery Charge (৳)</Label>
                <Input
                  id="new-area-charge"
                  type="number"
                  placeholder="e.g., 80"
                  value={newArea.charge || ""}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      charge: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddArea} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Area
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Areas</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Area Name</TableHead>
                  <TableHead>Delivery Charge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryAreas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500 py-8"
                    >
                      No delivery areas found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveryAreas.map((area, index) => (
                    <TableRow key={area.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {editingId === area.id ? (
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            disabled={loading}
                            className="max-w-xs"
                          />
                        ) : (
                          <span className="font-medium">
                            {area.areaName || area.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === area.id ? (
                          <div className="flex items-center gap-2 max-w-xs">
                            <span className="text-gray-500">৳</span>
                            <Input
                              type="number"
                              value={editForm.charge || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  charge: parseFloat(e.target.value) || 0,
                                })
                              }
                              disabled={loading}
                              className="w-32"
                            />
                          </div>
                        ) : (
                          <span className="font-semibold text-green-600">
                            ৳{area.charge.toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {area.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === area.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(area.id)}
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(area.id)}
                              disabled={loading}
                              title={area.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(area)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(area.id)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            • Delivery areas are used when creating orders to calculate shipping
            costs.
          </p>
          <p>
            • Edit an area by clicking the "Edit" button (pencil icon), then
            modify the name or charge.
          </p>
          <p>
            • Toggle an area's status by clicking the "Power" button - inactive
            areas won't be available for selection.
          </p>
          <p>
            • Add new delivery areas using the "Add Delivery Area" button above.
          </p>
          <p>
            • Charges are in BDT (৳) and will be automatically applied to
            orders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

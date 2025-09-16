"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductFormStep2Props {
  initialData?: any;
  onComplete: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProductFormStep2({
  initialData,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep2Props) {
  const [selectedSizes] = useState<number[]>([]);

  const handleNext = () => {
    onComplete({ selectedSizes });
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Size Selection</CardTitle>
        <CardDescription>Choose or create product sizes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Size selection component will be implemented here</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button onClick={handleNext}>Next: Select Categories</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

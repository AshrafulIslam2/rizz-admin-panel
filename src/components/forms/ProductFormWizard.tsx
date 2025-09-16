"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { ProductFormStep1 } from "./ProductFormStep1";
import { ProductFormStep2Enhanced as ProductFormStep2 } from "./ProductFormStep2Enhanced";
import { ProductFormStep3 } from "./ProductFormStep3";
import { ProductFormStep4 } from "./ProductFormStep4";
import { ProductFormStep5 } from "./ProductFormStep5";
import { ProductFormStep6 } from "./ProductFormStep6";
import { ProductFormStep7 } from "./ProductFormStep7";
import { ProductFormStep8 } from "./ProductFormStep8";
import { ProductFormStep9 } from "./ProductFormStep9";
import { ProductFormStep10 } from "./ProductFormStep10";
import type {
  CreateProductStep1FormData,
  CreateProductStep2FormData,
  CreateProductStep3FormData,
  CreateProductStep4FormData,
  CreateProductStep5FormData,
  CreateProductStep6FormData,
  CreateProductStep7FormData,
  CreateProductStep8FormData,
  CreateProductStep9FormData,
  CreateProductStep10FormData,
  CompleteProductFormData,
} from "@/types/validation";

const steps = [
  {
    id: 1,
    title: "Basic",
    description: "Product details, pricing, and specifications",
  },
  {
    id: 2,
    title: "Size",
    description: "Choose or create product sizes",
  },
  {
    id: 3,
    title: "Category",
    description: "Choose or create product categories",
  },
  {
    id: 4,
    title: "Color",
    description: "Choose or create product colors",
  },
  {
    id: 5,
    title: "Pricing",
    description: "Set quantity-based pricing tiers",
  },
  {
    id: 6,
    title: "Images",
    description: "Upload and manage product images",
  },
  {
    id: 7,
    title: "Videos",
    description: "Upload demonstration and process videos",
  },
  {
    id: 8,
    title: "Features",
    description: "Highlight key features and benefits",
  },
  {
    id: 9,
    title: "SEO & Meta Tags",
    description: "Optimize for search engines and social media",
  },
  {
    id: 10,
    title: "FAQ",
    description: "Add frequently asked questions",
  },
];

export function ProductFormWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CompleteProductFormData>>(
    {}
  );
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepComplete = (step: number, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [`step${step}`]: data,
    }));
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    // Allow navigation to any step that's completed or the current step
    if (completedSteps.has(step) || step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting product data:", formData);
      // Here you would submit the data to your API
      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product. Please try again.");
    }
  };

  const renderStepContent = () => {
    console.log(currentStep, formData);
    switch (currentStep) {
      case 1:
        return (
          <ProductFormStep1
            initialData={formData.step1}
            onComplete={(data) => handleStepComplete(1, data)}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ProductFormStep2
            initialData={formData.step2}
            onComplete={(data) => handleStepComplete(2, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <ProductFormStep3
            initialData={formData.step3}
            onComplete={(data) => handleStepComplete(3, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ProductFormStep4
            initialData={formData.step4}
            onComplete={(data) => handleStepComplete(4, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <ProductFormStep5
            initialData={formData.step5}
            onComplete={(data) => handleStepComplete(5, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <ProductFormStep6
            initialData={formData.step6}
            onComplete={(data) => handleStepComplete(6, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 7:
        return (
          <ProductFormStep7
            initialData={formData.step7}
            onComplete={(data) => handleStepComplete(7, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 8:
        return (
          <ProductFormStep8
            initialData={formData.step8}
            onComplete={(data) => handleStepComplete(8, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 9:
        return (
          <ProductFormStep9
            initialData={formData.step9}
            onComplete={(data) => handleStepComplete(9, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 10:
        return (
          <ProductFormStep10
            initialData={formData.step10}
            onComplete={(data) => handleStepComplete(10, data)}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            Complete all steps to create a new product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step indicator */}
          <div className="mb-8">
            {/* Desktop view - full layout */}
            <div className="hidden xl:flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center cursor-pointer ${
                      completedSteps.has(step.id) || currentStep >= step.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full  flex items-center justify-center text-xs font-medium ${
                        completedSteps.has(step.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : currentStep === step.id
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {completedSteps.has(step.id) ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="ml-1">
                      <div className="text-xs font-medium">{step.title}</div>
                      {/* <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div> */}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-3 h-px w-8 ${
                        completedSteps.has(step.id) ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Tablet and large mobile - compact circles only */}
            <div className="hidden sm:flex xl:hidden items-center justify-center">
              <div className="flex items-center space-x-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                        completedSteps.has(step.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : currentStep === step.id
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground hover:border-primary/50"
                      }`}
                      onClick={() => handleStepClick(step.id)}
                      title={step.title}
                    >
                      {completedSteps.has(step.id) ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-4 h-px mx-2 ${
                          completedSteps.has(step.id)
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile - dots only */}
            <div className="sm:hidden">
              <div className="flex items-center justify-center space-x-2 mb-3">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                      completedSteps.has(step.id)
                        ? "bg-primary"
                        : currentStep === step.id
                        ? "bg-primary/60"
                        : "bg-muted hover:bg-muted-foreground/30"
                    }`}
                    onClick={() => handleStepClick(step.id)}
                  />
                ))}
              </div>
            </div>

            {/* Current step display for tablet and mobile */}
            <div className="xl:hidden text-center mb-4">
              <Badge variant="outline" className="mb-2">
                Step {currentStep} of {steps.length}
              </Badge>
              <div className="text-sm font-medium">
                {steps[currentStep - 1].title}
              </div>
              <div className="text-xs text-muted-foreground">
                {steps[currentStep - 1].description}
              </div>
            </div>

            {/* Progress bar for all devices */}
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Step content */}
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
}

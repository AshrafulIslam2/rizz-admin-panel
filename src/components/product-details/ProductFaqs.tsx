import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function ProductFaqs({ product }: { product: any }) {
  if (!product?.product_faq?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> FAQs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {product.product_faq.map((f: any, i: number) => (
          <div key={i}>
            <div className="font-semibold">{f.question}</div>
            <div className="text-sm text-muted-foreground">{f.answer}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

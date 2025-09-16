"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  HelpCircle,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import {
  createProductStep10Schema,
  CreateProductStep10FormData,
} from "@/types/validation";

interface ProductFormStep10Props {
  initialData?: CreateProductStep10FormData;
  onComplete: (data: CreateProductStep10FormData) => void;
  onSubmit: () => void;
  onPrevious: () => void;
}

export function ProductFormStep10({
  initialData,
  onComplete,
  onSubmit,
  onPrevious,
}: ProductFormStep10Props) {
  const form = useForm<CreateProductStep10FormData>({
    resolver: zodResolver(createProductStep10Schema),
    defaultValues: {
      faqs: initialData?.faqs || [
        {
          question: "",
          answer: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const handleFormSubmit = (data: CreateProductStep10FormData) => {
    onComplete(data);
    onSubmit();
  };

  const addFaq = () => {
    append({
      question: "",
      answer: "",
    });
  };

  const commonFaqSuggestions = [
    "What materials is this product made from?",
    "How do I care for and maintain this product?",
    "What are the dimensions and weight?",
    "Do you offer international shipping?",
    "What is your return and exchange policy?",
    "How long does shipping typically take?",
    "Is this product suitable for outdoor use?",
    "Are there any assembly requirements?",
    "What warranty do you provide?",
    "Can I track my order?",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6" />
          Frequently Asked Questions
        </CardTitle>
        <CardDescription>
          Add common questions and answers to help customers make informed
          decisions about your product. Good FAQs reduce support inquiries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">FAQ List</h3>
                  <p className="text-sm text-muted-foreground">
                    Add questions and answers that help customers understand
                    your product
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFaq}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No FAQs added yet</p>
                  <p className="text-sm">Click "Add FAQ" to get started</p>
                </div>
              )}

              <div className="space-y-6">
                {fields.map((field, index) => {
                  const question = form.watch(`faqs.${index}.question`);
                  const answer = form.watch(`faqs.${index}.answer`);

                  return (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">FAQ {index + 1}</h4>
                            <p className="text-sm text-muted-foreground">
                              Question and answer pair
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {question && answer && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`faqs.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="What is your question?"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`faqs.${index}.answer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Answer</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide a clear and helpful answer..."
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Be specific and helpful in your answer
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* FAQ Suggestions */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-medium">Common FAQ Topics</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Here are some commonly asked questions you might want to
                address:
              </p>
              <div className="grid gap-2">
                {commonFaqSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto p-2 text-left"
                    onClick={() => {
                      append({
                        question: suggestion,
                        answer: "",
                      });
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ Guidelines */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-medium">FAQ Writing Tips</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Questions:
                  </h4>
                  <ul className="space-y-1">
                    <li>• Use customer language</li>
                    <li>• Be specific and clear</li>
                    <li>• Start with question words</li>
                    <li>• Address real concerns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Answers:</h4>
                  <ul className="space-y-1">
                    <li>• Provide complete information</li>
                    <li>• Use simple language</li>
                    <li>• Include helpful details</li>
                    <li>• Link to resources when needed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Final Summary */}
            {fields.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-3">FAQ Summary</h3>
                <div className="text-sm text-muted-foreground">
                  <p>
                    {fields.length} FAQ{fields.length !== 1 ? "s" : ""} added
                  </p>
                  <p>
                    {
                      fields.filter((_, index) => {
                        const question = form.watch(`faqs.${index}.question`);
                        const answer = form.watch(`faqs.${index}.answer`);
                        return question && answer;
                      }).length
                    }{" "}
                    complete
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: SEO & Meta Tags
              </Button>
              <Button
                type="submit"
                disabled={fields.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Product
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

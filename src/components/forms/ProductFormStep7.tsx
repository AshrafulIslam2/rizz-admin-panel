"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Video,
  Play,
  FileVideo,
  Star,
  Scissors,
  Settings,
  Package,
  CheckCircle,
} from "lucide-react";
import {
  createProductStep7Schema,
  CreateProductStep7FormData,
} from "@/types/validation";

interface ProductFormStep7Props {
  initialData?: CreateProductStep7FormData;
  productId: number;
  onComplete: (data: CreateProductStep7FormData, productId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProductFormStep7({
  initialData,
  productId,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep7Props) {
  const form = useForm<CreateProductStep7FormData>({
    resolver: zodResolver(createProductStep7Schema),
    defaultValues: {
      mainVideo: initialData?.mainVideo || {
        url: "",
        title: "",
        isMain: true,
      },
      cuttingVideo: initialData?.cuttingVideo || {
        url: "",
        title: "Cutting Process",
        isMain: false,
      },
      stitchingVideo: initialData?.stitchingVideo || {
        url: "",
        title: "Stitching Process",
        isMain: false,
      },
      assemblyVideo: initialData?.assemblyVideo || {
        url: "",
        title: "Assembly Process",
        isMain: false,
      },
      finishingVideo: initialData?.finishingVideo || {
        url: "",
        title: "Finishing Process",
        isMain: false,
      },
    },
  });

  const handleFormSubmit = (data: CreateProductStep7FormData) => {
    onComplete(data, productId);
    onNext();
  };

  const videoSections = [
    {
      key: "mainVideo" as const,
      title: "Main Product Video",
      description: "Primary video showcasing your product",
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      placeholder: "Enter main video title...",
    },
    {
      key: "cuttingVideo" as const,
      title: "Cutting Process",
      description: "Video showing the cutting/preparation process",
      icon: <Scissors className="w-5 h-5 text-blue-500" />,
      placeholder: "Enter cutting video title...",
    },
    {
      key: "stitchingVideo" as const,
      title: "Stitching Process",
      description: "Video demonstrating stitching techniques",
      icon: <Settings className="w-5 h-5 text-green-500" />,
      placeholder: "Enter stitching video title...",
    },
    {
      key: "assemblyVideo" as const,
      title: "Assembly Process",
      description: "Video showing product assembly",
      icon: <Package className="w-5 h-5 text-purple-500" />,
      placeholder: "Enter assembly video title...",
    },
    {
      key: "finishingVideo" as const,
      title: "Finishing Process",
      description: "Video showing final finishing touches",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      placeholder: "Enter finishing video title...",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-6 h-6" />
          Product Videos
        </CardTitle>
        <CardDescription>
          Upload videos showcasing your product and manufacturing process. These
          videos help customers understand your product better.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {videoSections.map((section) => (
                <Card key={section.key} className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    {section.icon}
                    <div>
                      <h3 className="font-medium">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name={`${section.key}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={section.placeholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${section.key}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="https://example.com/video.mp4"
                                {...field}
                              />
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="w-4 h-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a video file or enter a video URL
                          </FormDescription>
                          <FormMessage />
                          {field.value && (
                            <div className="mt-2">
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1 w-fit"
                              >
                                <Play className="w-3 h-3" />
                                Video Added
                              </Badge>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileVideo className="w-5 h-5" />
                <h3 className="font-medium">Video Requirements</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Supported formats: MP4, MOV, AVI, WebM</li>
                <li>• Maximum file size: 100MB per video</li>
                <li>• Recommended resolution: 1080p (1920x1080)</li>
                <li>• Duration: 30 seconds to 5 minutes</li>
                <li>
                  • Videos should clearly show the processes and product details
                </li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Images
              </Button>
              <Button type="submit">Next: Features</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

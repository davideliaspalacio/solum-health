"use client";

import { useState } from "react";
import { FileText, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SourceDocument } from "@/types";

interface DocumentViewerProps {
  documents: SourceDocument[];
}

export function DocumentViewer({ documents }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<SourceDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  if (documents.length === 0) return null;

  const allPages = selectedDoc?.image_urls ?? [];

  return (
    <div className="animate-slide-in-right">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Source Documents
      </h3>

      <div className="space-y-2">
        {documents.map((doc) => (
          <Dialog key={doc.id}>
            <div className="group rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md">
              {/* Thumbnail preview */}
              {doc.image_urls.length > 0 && (
                <DialogTrigger
                  className="relative w-full aspect-[4/3] overflow-hidden bg-muted cursor-pointer block"
                  onClick={() => {
                    setSelectedDoc(doc);
                    setCurrentPage(0);
                  }}
                >
                  <img
                    src={doc.image_urls[0]}
                    alt={doc.filename}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  {doc.page_count > 1 && (
                    <span className="absolute top-2 right-2 rounded-md bg-foreground/70 px-1.5 py-0.5 text-[10px] font-semibold text-background">
                      {doc.page_count} pages
                    </span>
                  )}
                </DialogTrigger>
              )}

              {/* File info */}
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {doc.filename}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {doc.doc_type.replace(/_/g, " ")} &middot;{" "}
                      {doc.page_count} page{doc.page_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-5 pb-0">
                <DialogTitle className="text-sm font-semibold">
                  {doc.filename}
                </DialogTitle>
              </DialogHeader>
              <div className="relative flex-1 overflow-auto p-4">
                {allPages.length > 0 && (
                  <img
                    src={allPages[currentPage]}
                    alt={`${doc.filename} — page ${currentPage + 1}`}
                    className="w-full rounded-md border"
                  />
                )}
                {allPages.length > 1 && (
                  <div className="sticky bottom-4 flex items-center justify-center gap-3 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium text-muted-foreground">
                      {currentPage + 1} / {allPages.length}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === allPages.length - 1}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}

import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Loader2, IdCard } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { PatientIdCard } from "./PatientIdCard";

interface IdCardDialogProps {
  patient: any;
  patientId: string;
  trigger?: React.ReactNode;
}

export function IdCardDialog({ patient, patientId, trigger }: IdCardDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate Image from DOM
  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      setIsProcessing(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // Keep transparency if any
      });
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png", 1.0);
      });
    } catch (error) {
      console.error("Error generating card image:", error);
      toast.error("Failed to generate ID Card image.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Share (Web Share API for Mobile/supported browsers)
  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], `${patient.full_name?.replace(/\s+/g, '_') || 'Patient'}_ID_Card.png`, { type: "image/png" });

    // Check if Web Share API and file sharing is supported
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'E2Care Patient ID Card',
          text: `Patient ID Card for ${patient.full_name}`,
          files: [file]
        });
        toast.success("Shared successfully");
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Error sharing:", error);
          toast.error("Failed to share image.");
        }
      }
    } else {
      // Fallback: If sharing files is not supported (like some desktop browsers), just download it
      toast.info("Direct sharing not supported on this browser. Downloading instead...");
      handleDownload(blob);
    }
  };

  // Handle Download (Fallback or direct action)
  const handleDownload = async (blobData?: Blob) => {
    const blob = blobData || await generateImage();
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${patient.full_name?.replace(/\s+/g, '_') || 'Patient'}_ID_Card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (!blobData) toast.success("ID Card downloaded successfully!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="outline" size="sm" className="gap-1.5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
            <IdCard className="w-4 h-4" />
            <span className="hidden sm:inline">ID Card</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-zinc-50 dark:bg-zinc-950 border-border">
        <DialogHeader>
          <DialogTitle>Digital Patient ID</DialogTitle>
          <DialogDescription>
            Share this digital ID card via WhatsApp or download it for your records.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex justify-center bg-gray-100/50 dark:bg-black/20 rounded-xl overflow-hidden relative">
           {/* The actual Card we will convert to canvas */}
           <div className="w-full relative px-4">
             <PatientIdCard ref={cardRef} patient={patient} patientId={patientId} />
           </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2" 
            onClick={() => handleDownload()}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Image
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={handleShare}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Share Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

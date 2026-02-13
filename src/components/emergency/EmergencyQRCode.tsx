import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Copy, Check, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmergencyQRCodeProps {
  medicalId: string | null;
  pinCode: string | null;
  patientName: string | null;
}

export default function EmergencyQRCode({ medicalId, pinCode, patientName }: EmergencyQRCodeProps) {
  const [copied, setCopied] = useState(false);

  if (!medicalId || !pinCode) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center py-8 text-center">
          <QrCode className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Complete your profile to generate an emergency QR code.
          </p>
        </CardContent>
      </Card>
    );
  }

  const emergencyUrl = `${window.location.origin}/emergency-access/${medicalId}`;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Medical Profile — ${patientName || "Patient"}`,
          text: `Emergency access PIN: ${pinCode}`,
          url: emergencyUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(`${emergencyUrl}\nPIN: ${pinCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Emergency QR
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleShare}>
            <Share2 className="mr-1 h-3 w-3" />
            Share
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button className="mx-auto flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-background p-4 transition-colors hover:bg-muted/50">
              <QRCodeSVG
                value={emergencyUrl}
                size={120}
                bgColor="transparent"
                fgColor="hsl(215, 25%, 15%)"
                level="M"
              />
              <span className="text-[10px] text-muted-foreground">Tap to enlarge</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">Emergency QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-2xl border-2 border-border bg-white p-6">
                <QRCodeSVG
                  value={emergencyUrl}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                  level="H"
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Paramedics scan this QR code and enter the PIN below to view critical medical info.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* PIN display */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Access PIN</p>
            <p className="font-mono text-lg font-bold tracking-[0.3em] text-foreground">{pinCode}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyPin}>
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

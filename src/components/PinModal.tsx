import { useState, useRef, useEffect, forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MERCHANT_PIN = "1234";

interface PinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PinModalContent = forwardRef<HTMLDivElement, PinModalProps>(
  ({ open, onClose, onSuccess }, ref) => {
    const [pin, setPin] = useState(["", "", "", ""]);
    const [error, setError] = useState(false);
    const refs = [
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
      if (open) {
        setPin(["", "", "", ""]);
        setError(false);
        setTimeout(() => refs[0].current?.focus(), 100);
      }
    }, [open]);

    const handleInput = (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newPin = [...pin];
      newPin[index] = value.slice(-1);
      setPin(newPin);
      setError(false);

      if (value && index < 3) {
        refs[index + 1].current?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !pin[index] && index > 0) {
        refs[index - 1].current?.focus();
      }
    };

    const submit = () => {
      const entered = pin.join("");
      if (entered.length < 4) return;

      if (entered === MERCHANT_PIN) {
        onSuccess();
        onClose();
        toast.success("Stamp added! ✨");
      } else {
        setError(true);
        setPin(["", "", "", ""]);
        refs[0].current?.focus();
      }
    };

    return (
      <div ref={ref}>
        <DialogHeader>
          <DialogTitle className="font-display text-center">Merchant PIN</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Ask your barber to enter the PIN
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-3 my-4">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-14 text-center text-2xl font-display rounded-xl border-2 bg-background outline-none transition-colors ${
                error
                  ? "border-destructive"
                  : "border-border focus:border-primary"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-destructive text-xs text-center">
            Incorrect PIN. Please try again.
          </p>
        )}

        <Button onClick={submit} className="w-full py-5 font-semibold rounded-xl">
          Confirm
        </Button>
      </div>
    );
  }
);

PinModalContent.displayName = "PinModalContent";

const PinModal = ({ open, onClose, onSuccess }: PinModalProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-xs mx-auto rounded-2xl">
      <PinModalContent open={open} onClose={onClose} onSuccess={onSuccess} />
    </DialogContent>
  </Dialog>
);

export default PinModal;

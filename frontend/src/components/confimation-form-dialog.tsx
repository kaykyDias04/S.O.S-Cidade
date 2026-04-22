import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isPending: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isPending,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
}: ConfirmationModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button
            variant="default" 
            className="cursor-pointer dark:text-white dark:border-white dark:border dark:bg-transparent dark:hover:bg-gray-800"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Salvando..." : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
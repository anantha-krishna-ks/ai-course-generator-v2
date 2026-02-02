import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  contactName: string;
  email: string;
}

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onConfirmDelete: (customerId: number) => void;
}

export const DeleteCustomerDialog = ({ open, onOpenChange, customer, onConfirmDelete }: DeleteCustomerDialogProps) => {
  const { toast } = useToast();

  const handleDelete = () => {
    if (!customer) return;
    
    onConfirmDelete(customer.id);
    toast({
      title: "Customer Deleted",
      description: `${customer.name} has been removed successfully.`,
    });
    onOpenChange(false);
  };

  if (!customer) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the customer and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">
            Are you sure you want to delete this customer?
          </p>
          <div className="bg-muted/50 rounded-lg p-3 mt-3 space-y-1">
            <p className="text-sm font-medium">{customer.name}</p>
            <p className="text-xs text-muted-foreground">Contact: {customer.contactName}</p>
            <p className="text-xs text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete Customer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

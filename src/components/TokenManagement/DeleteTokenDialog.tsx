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

interface Token {
  id: number;
  date: string;
  openingBalance: number;
  tokensCount: number;
  consumedTokens: number;
  balance: number;
  state: string;
  expiryDate: string;
  user: string;
  customerId: number;
}

interface DeleteTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: Token | null;
  onConfirmDelete: (tokenId: number) => void;
  customerName: string;
}

export const DeleteTokenDialog = ({ 
  open, 
  onOpenChange, 
  token, 
  onConfirmDelete,
  customerName 
}: DeleteTokenDialogProps) => {
  const { toast } = useToast();

  const handleDelete = () => {
    if (!token) return;
    
    onConfirmDelete(token.id);
    toast({
      title: "Token Deleted",
      description: `Token for ${customerName} has been removed successfully.`,
    });
    onOpenChange(false);
  };

  if (!token) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the token allocation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">
            Are you sure you want to delete this token?
          </p>
          <div className="bg-muted/50 rounded-lg p-3 mt-3 space-y-1">
            <p className="text-sm font-medium">{customerName}</p>
            <p className="text-xs text-muted-foreground">User: {token.user}</p>
            <p className="text-xs text-muted-foreground">Tokens: {token.tokensCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Balance: {token.balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Expiry: {token.expiryDate}</p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete Token
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

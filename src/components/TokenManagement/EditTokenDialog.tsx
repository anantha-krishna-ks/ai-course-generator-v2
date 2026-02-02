import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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

interface EditTokenDialogProps {
  open: boolean;
  onClose: () => void;
  token: Token | null;
  onSave: (token: Token) => void;
  customerName: string;
}

const mockUsers = ["User1", "User2", "User3", "User4"];

export const EditTokenDialog = ({ open, onClose, token, onSave, customerName }: EditTokenDialogProps) => {
  const [formData, setFormData] = useState({
    customerName: "",
    issueDate: new Date(),
    tokensCount: "",
    expiryDate: new Date(),
    user: "",
  });

  useEffect(() => {
    if (token) {
      setFormData({
        customerName: customerName,
        issueDate: new Date(token.date),
        tokensCount: token.tokensCount.toString(),
        expiryDate: new Date(token.expiryDate),
        user: token.user,
      });
    }
  }, [token, customerName]);

  const handleSave = () => {
    if (!token) return;

    if (!formData.tokensCount || parseInt(formData.tokensCount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid token count",
        variant: "destructive",
      });
      return;
    }

    if (!formData.user) {
      toast({
        title: "Validation Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    const updatedToken = {
      ...token,
      date: format(formData.issueDate, "dd-MMM-yyyy"),
      tokensCount: parseInt(formData.tokensCount),
      expiryDate: format(formData.expiryDate, "dd-MMM-yyyy"),
      user: formData.user,
    };

    onSave(updatedToken);
    toast({
      title: "Success",
      description: "Token updated successfully",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Edit Token</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update token allocation details and settings
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Customer Information Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Customer Information
              </h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Customer Name
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
          </section>

          {/* Token Details Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Token Details
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-sm font-medium">
                  Token Issue Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="issueDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !formData.issueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.issueDate ? format(formData.issueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.issueDate}
                      onSelect={(date) => date && setFormData({ ...formData, issueDate: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokensCount" className="text-sm font-medium">
                  Tokens Count
                </Label>
                <Input
                  id="tokensCount"
                  type="number"
                  value={formData.tokensCount}
                  onChange={(e) => setFormData({ ...formData, tokensCount: e.target.value })}
                  placeholder="Enter token count"
                  className="h-11"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium">
                  Token Expiry Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="expiryDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !formData.expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate ? format(formData.expiryDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => date && setFormData({ ...formData, expiryDate: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user" className="text-sm font-medium">
                  User
                </Label>
                <Select value={formData.user} onValueChange={(value) => setFormData({ ...formData, user: value })}>
                  <SelectTrigger id="user" className="h-11">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="min-w-[100px]"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

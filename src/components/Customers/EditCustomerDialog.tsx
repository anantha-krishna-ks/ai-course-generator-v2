import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { brandingService } from "@/services/brandingService";

const customerSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(100),
  contactName: z.string().trim().min(1, "Contact name is required").max(100),
  address: z.string().trim().min(1, "Address is required").max(500),
  contactNo: z.string().trim().min(10, "Valid contact number is required").max(15),
  email: z.string().trim().email("Valid email is required").max(255),
  numberOfUsers: z.string().trim().min(1, "Number of users is required"),
  brandingLogo: z.enum(["customer", "excelsoft", "both"]),
  tokenAllotmentBy: z.string().min(1, "Token allotment is required"),
  enableBlueprint: z.boolean(),
  level1: z.string().trim().min(1, "Level 1 is required"),
  level2: z.string().trim().min(1, "Level 2 is required"),
  level3: z.string().trim().min(1, "Level 3 is required"),
  level4: z.string().trim().min(1, "Level 4 is required"),
  level5: z.string().trim().min(1, "Level 5 is required"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Customer {
  id: number;
  name: string;
  contactName: string;
  contactNo: string;
  address: string;
  email: string;
  users: number;
}

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export const EditCustomerDialog = ({ open, onOpenChange, customer }: EditCustomerDialogProps) => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      brandingLogo: "both",
      tokenAllotmentBy: "user",
      enableBlueprint: true,
    },
  });

  const brandingLogo = watch("brandingLogo");
  const enableBlueprint = watch("enableBlueprint");

  // Populate form with customer data when dialog opens
  useEffect(() => {
    if (customer && open) {
      setValue("customerName", customer.name);
      setValue("contactName", customer.contactName);
      setValue("contactNo", customer.contactNo);
      setValue("address", customer.address);
      setValue("email", customer.email);
      setValue("numberOfUsers", customer.users.toString());
      
      // Check if there are existing branding settings for this customer
      const currentBranding = brandingService.getCurrentBranding();
      if (currentBranding && currentBranding.customerId === customer.id) {
        setValue("brandingLogo", currentBranding.brandingOption);
        if (currentBranding.customerLogo) {
          setLogoPreview(currentBranding.customerLogo);
        }
      } else {
        // Set default values for other fields
        setValue("brandingLogo", "both");
        setLogoPreview("");
      }
      
      setValue("tokenAllotmentBy", "user");
      setValue("enableBlueprint", true);
      setValue("level1", "Region");
      setValue("level2", "Division");
      setValue("level3", "Department");
      setValue("level4", "Team");
      setValue("level5", "Sub-team");
    }
  }, [customer, open, setValue]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: CustomerFormData) => {
    console.log("Updated form data:", data);
    console.log("Logo file:", logoFile);
    
    // Update branding settings in localStorage
    if (customer) {
      brandingService.setBranding({
        customerId: customer.id,
        customerName: data.customerName,
        customerLogo: logoPreview || null,
        brandingOption: data.brandingLogo,
      });
    }
    
    toast({
      title: "Customer updated successfully",
      description: `${data.customerName} branding has been applied.`,
    });
    
    reset();
    setLogoFile(null);
    setLogoPreview("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    reset();
    setLogoFile(null);
    setLogoPreview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold">Edit Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h3 className="text-lg font-bold text-foreground">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    {...register("customerName")}
                    className={errors.customerName ? "border-destructive" : ""}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">{errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-sm font-medium">
                    Contact Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="Enter contact person name"
                    {...register("contactName")}
                    className={errors.contactName ? "border-destructive" : ""}
                  />
                  {errors.contactName && (
                    <p className="text-xs text-destructive">{errors.contactName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo" className="text-sm font-medium">
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactNo"
                    placeholder="Enter phone number"
                    {...register("contactNo")}
                    className={errors.contactNo ? "border-destructive" : ""}
                  />
                  {errors.contactNo && (
                    <p className="text-xs text-destructive">{errors.contactNo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  {...register("address")}
                  rows={3}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Configuration Section */}
            <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h3 className="text-lg font-bold text-foreground">
                  Configuration
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Company Logo <span className="text-destructive">*</span>
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                    {logoPreview ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center h-24">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview("");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => document.getElementById("logo")?.click()}
                        >
                          Choose File
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Branding Logo</Label>
                    <RadioGroup
                      value={brandingLogo}
                      onValueChange={(value) => setValue("brandingLogo", value as any)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="customer" id="customer" />
                        <Label htmlFor="customer" className="font-normal cursor-pointer flex-1">
                          Customer Logo Only
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="excelsoft" id="excelsoft" />
                        <Label htmlFor="excelsoft" className="font-normal cursor-pointer flex-1">
                          Excelsoft Logo Only
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both" className="font-normal cursor-pointer flex-1">
                          Both Logos
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Users & Tokens */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfUsers" className="text-sm font-medium">
                      Number of Users <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="numberOfUsers"
                      type="number"
                      placeholder="Enter number of users"
                      {...register("numberOfUsers")}
                      className={errors.numberOfUsers ? "border-destructive" : ""}
                    />
                    {errors.numberOfUsers && (
                      <p className="text-xs text-destructive">{errors.numberOfUsers.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenAllotmentBy" className="text-sm font-medium">
                      Token Allotment By <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch("tokenAllotmentBy")}
                      onValueChange={(value) => setValue("tokenAllotmentBy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select allotment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/20">
                    <Checkbox
                      id="enableBlueprint"
                      checked={enableBlueprint}
                      onCheckedChange={(checked) => setValue("enableBlueprint", !!checked)}
                    />
                    <Label htmlFor="enableBlueprint" className="font-normal cursor-pointer flex-1">
                      Enable Blueprint Feature
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Hierarchy Levels Section */}
            <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Organizational Hierarchy
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Define the organizational structure levels
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level1" className="text-sm font-medium">
                    Level 1 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level1"
                    placeholder="e.g., Region"
                    {...register("level1")}
                    className={errors.level1 ? "border-destructive" : ""}
                  />
                  {errors.level1 && (
                    <p className="text-xs text-destructive">{errors.level1.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level2" className="text-sm font-medium">
                    Level 2 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level2"
                    placeholder="e.g., Division"
                    {...register("level2")}
                    className={errors.level2 ? "border-destructive" : ""}
                  />
                  {errors.level2 && (
                    <p className="text-xs text-destructive">{errors.level2.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level3" className="text-sm font-medium">
                    Level 3 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level3"
                    placeholder="e.g., Department"
                    {...register("level3")}
                    className={errors.level3 ? "border-destructive" : ""}
                  />
                  {errors.level3 && (
                    <p className="text-xs text-destructive">{errors.level3.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level4" className="text-sm font-medium">
                    Level 4 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level4"
                    placeholder="e.g., Team"
                    {...register("level4")}
                    className={errors.level4 ? "border-destructive" : ""}
                  />
                  {errors.level4 && (
                    <p className="text-xs text-destructive">{errors.level4.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level5" className="text-sm font-medium">
                    Level 5 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level5"
                    placeholder="e.g., Sub-team"
                    {...register("level5")}
                    className={errors.level5 ? "border-destructive" : ""}
                  />
                  {errors.level5 && (
                    <p className="text-xs text-destructive">{errors.level5.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Sticky Footer */}
          <div className="sticky bottom-0 bg-background border-t pt-4 pb-2 flex justify-end gap-3 mt-8">
            <Button type="button" variant="outline" onClick={handleCancel} size="lg">
              Cancel
            </Button>
            <Button type="submit" size="lg">Update Customer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

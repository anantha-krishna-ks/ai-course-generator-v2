import { useState } from "react";
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
import { Upload, Building2, User, Phone, Mail, MapPin, Settings, Shield, Network } from "lucide-react";

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

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddCustomerDialog = ({ open, onOpenChange }: AddCustomerDialogProps) => {
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
    console.log("Form data:", data);
    console.log("Logo file:", logoFile);
    
    toast({
      title: "Customer added successfully",
      description: `${data.customerName} has been added to the system.`,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-muted-foreground" />
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    {...register("customerName")}
                    className={errors.customerName ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">{errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-sm flex items-center gap-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    Contact Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="Enter contact person name"
                    {...register("contactName")}
                    className={errors.contactName ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.contactName && (
                    <p className="text-xs text-destructive">{errors.contactName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo" className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactNo"
                    placeholder="Enter phone number"
                    {...register("contactNo")}
                    className={errors.contactNo ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.contactNo && (
                    <p className="text-xs text-destructive">{errors.contactNo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register("email")}
                    className={errors.email ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="address" className="text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  {...register("address")}
                  rows={3}
                  className={errors.address ? "border-2 border-destructive" : "border-2"}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Configuration Section */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </h3>

              <div className="space-y-6">
                {/* Branding & Logo Subsection */}
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    Branding & Logo
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm">
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
                    </div>

                    {/* Branding Options */}
                    <div className="space-y-3">
                      <Label className="text-sm">
                        Logo Display Options <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Choose how logos will be displayed in the application
                      </p>
                      <RadioGroup
                        value={brandingLogo}
                        onValueChange={(value) => setValue("brandingLogo", value as any)}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2 p-3 rounded-lg border-2 hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="customer" id="customer" />
                          <Label htmlFor="customer" className="font-normal cursor-pointer flex-1">
                            <div className="font-medium">Customer Logo Only</div>
                            <p className="text-xs text-muted-foreground">Show only customer branding</p>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border-2 hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="excelsoft" id="excelsoft" />
                          <Label htmlFor="excelsoft" className="font-normal cursor-pointer flex-1">
                            <div className="font-medium">Excelsoft Logo Only</div>
                            <p className="text-xs text-muted-foreground">Show only Excelsoft branding</p>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border-2 hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="both" id="both" />
                          <Label htmlFor="both" className="font-normal cursor-pointer flex-1">
                            <div className="font-medium">Both Logos</div>
                            <p className="text-xs text-muted-foreground">Display both customer and Excelsoft logos</p>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* User Settings Subsection */}
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    User & Token Settings
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numberOfUsers" className="text-sm flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        Number of Users <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="numberOfUsers"
                        type="number"
                        placeholder="Enter number of users"
                        {...register("numberOfUsers")}
                        className={errors.numberOfUsers ? "border-2 border-destructive" : "border-2"}
                      />
                      {errors.numberOfUsers && (
                        <p className="text-xs text-destructive">{errors.numberOfUsers.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Total user accounts allowed for this customer
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tokenAllotmentBy" className="text-sm flex items-center gap-1">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        Token Allotment By <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={watch("tokenAllotmentBy")}
                        onValueChange={(value) => setValue("tokenAllotmentBy", value)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Select allotment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Per User</SelectItem>
                          <SelectItem value="customer">Per Customer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        How tokens will be distributed and managed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Subsection */}
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    Feature Access
                  </h4>
                  
                  <div className="flex items-start space-x-3 p-4 rounded-lg border-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                    <Checkbox
                      id="enableBlueprint"
                      checked={enableBlueprint}
                      onCheckedChange={(checked) => setValue("enableBlueprint", !!checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="enableBlueprint" className="font-medium cursor-pointer flex items-center gap-2">
                        Enable Blueprint Feature
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Allow this customer to access and use blueprint functionality for course creation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hierarchy Levels Section */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Organizational Hierarchy
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Define the organizational structure levels
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level1" className="text-sm">
                    Level 1 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level1"
                    placeholder="e.g., Region"
                    {...register("level1")}
                    className={errors.level1 ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.level1 && (
                    <p className="text-xs text-destructive">{errors.level1.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level2" className="text-sm">
                    Level 2 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level2"
                    placeholder="e.g., Division"
                    {...register("level2")}
                    className={errors.level2 ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.level2 && (
                    <p className="text-xs text-destructive">{errors.level2.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level3" className="text-sm">
                    Level 3 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level3"
                    placeholder="e.g., Department"
                    {...register("level3")}
                    className={errors.level3 ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.level3 && (
                    <p className="text-xs text-destructive">{errors.level3.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level4" className="text-sm">
                    Level 4 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level4"
                    placeholder="e.g., Team"
                    {...register("level4")}
                    className={errors.level4 ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.level4 && (
                    <p className="text-xs text-destructive">{errors.level4.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level5" className="text-sm">
                    Level 5 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level5"
                    placeholder="e.g., Sub-team"
                    {...register("level5")}
                    className={errors.level5 ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.level5 && (
                    <p className="text-xs text-destructive">{errors.level5.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Customer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

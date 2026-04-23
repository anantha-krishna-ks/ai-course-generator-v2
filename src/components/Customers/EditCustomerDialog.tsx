import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Upload,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Settings,
  Shield,
  Network,
  ImageIcon,
  Pencil,
  X,
} from "lucide-react";
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

const sectionCardClass =
  "rounded-2xl border border-border/70 bg-card p-6 space-y-5 transition-shadow hover:shadow-sm";
const fieldHeadingClass =
  "text-base font-semibold text-foreground mb-2 block";
const inputBaseClass =
  "h-10 rounded-full border-2 border-border/80 bg-background focus:border-primary/50 focus-visible:ring-primary/20 px-4";

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

  useEffect(() => {
    if (customer && open) {
      setValue("customerName", customer.name);
      setValue("contactName", customer.contactName);
      setValue("contactNo", customer.contactNo);
      setValue("address", customer.address);
      setValue("email", customer.email);
      setValue("numberOfUsers", customer.users.toString());

      const currentBranding = brandingService.getCurrentBranding();
      if (currentBranding && currentBranding.customerId === customer.id) {
        setValue("brandingLogo", currentBranding.brandingOption);
        if (currentBranding.customerLogo) {
          setLogoPreview(currentBranding.customerLogo);
        }
      } else {
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
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: CustomerFormData) => {
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

  const brandingOptions: { value: "customer" | "excelsoft" | "both"; title: string; desc: string }[] = [
    { value: "customer", title: "Customer Logo Only", desc: "Show only customer branding" },
    { value: "excelsoft", title: "Excelsoft Logo Only", desc: "Show only Excelsoft branding" },
    { value: "both", title: "Both Logos", desc: "Display customer and Excelsoft logos" },
  ];

  const levels: { key: "level1" | "level2" | "level3" | "level4" | "level5"; label: string; placeholder: string }[] = [
    { key: "level1", label: "Level 1", placeholder: "e.g., Region" },
    { key: "level2", label: "Level 2", placeholder: "e.g., Division" },
    { key: "level3", label: "Level 3", placeholder: "e.g., Department" },
    { key: "level4", label: "Level 4", placeholder: "e.g., Team" },
    { key: "level5", label: "Level 5", placeholder: "e.g., Sub-team" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] sm:h-[85vh] p-0 overflow-hidden flex flex-col rounded-2xl border border-border/70 bg-background gap-0">
        {/* Header */}
        <DialogHeader className="px-7 py-5 border-b border-border/60 bg-card">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Pencil className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle
                className="text-xl font-semibold tracking-[-0.02em] text-foreground"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Edit Customer
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Update {customer?.name ?? "this customer"}'s details, branding and hierarchy.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 bg-muted/60">
            {/* Basic Information */}
            <div className={sectionCardClass}>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                <h3 className="text-[15px] font-semibold text-foreground">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className={fieldHeadingClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                      Customer Name <span className="text-destructive">*</span>
                    </span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    {...register("customerName")}
                    className={`${inputBaseClass} ${errors.customerName ? "border-destructive" : ""}`}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">{errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className={fieldHeadingClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                      Contact Name <span className="text-destructive">*</span>
                    </span>
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="Enter contact person name"
                    {...register("contactName")}
                    className={`${inputBaseClass} ${errors.contactName ? "border-destructive" : ""}`}
                  />
                  {errors.contactName && (
                    <p className="text-xs text-destructive">{errors.contactName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo" className={fieldHeadingClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                      Contact Number <span className="text-destructive">*</span>
                    </span>
                  </Label>
                  <Input
                    id="contactNo"
                    placeholder="Enter phone number"
                    {...register("contactNo")}
                    className={`${inputBaseClass} ${errors.contactNo ? "border-destructive" : ""}`}
                  />
                  {errors.contactNo && (
                    <p className="text-xs text-destructive">{errors.contactNo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={fieldHeadingClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                      Email Address <span className="text-destructive">*</span>
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register("email")}
                    className={`${inputBaseClass} ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className={fieldHeadingClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                    Address <span className="text-destructive">*</span>
                  </span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  {...register("address")}
                  rows={3}
                  className={`rounded-2xl border-2 border-border/80 bg-background focus:border-primary/50 focus-visible:ring-primary/20 px-4 py-3 ${errors.address ? "border-destructive" : ""}`}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Branding & Logo */}
            <div className={sectionCardClass}>
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                <h3 className="text-[15px] font-semibold text-foreground">Branding & Logo</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className={fieldHeadingClass}>
                    Company Logo <span className="text-destructive">*</span>
                  </Label>
                  <div className="rounded-2xl border-2 border-dashed border-border/80 p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                    {logoPreview ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center h-24 rounded-xl bg-background border border-border/60 p-3">
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
                          className="rounded-full gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                        </div>
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          aria-label="Upload company logo"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("logo")?.click()}
                          className="rounded-full"
                        >
                          Choose File
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2.5">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className={fieldHeadingClass}>
                      Logo Display Options <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose how logos will be displayed in the application
                    </p>
                  </div>
                  <RadioGroup
                    value={brandingLogo}
                    onValueChange={(value) => setValue("brandingLogo", value as "customer" | "excelsoft" | "both")}
                    className="space-y-2"
                  >
                    {brandingOptions.map((opt) => {
                      const selected = brandingLogo === opt.value;
                      return (
                        <Label
                          key={opt.value}
                          htmlFor={`branding-${opt.value}`}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selected
                              ? "border-primary/50 bg-primary/5"
                              : "border-border/70 hover:border-border bg-background"
                          }`}
                        >
                          <RadioGroupItem value={opt.value} id={`branding-${opt.value}`} />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{opt.title}</div>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* User & Token Settings */}
            <div className={sectionCardClass}>
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                <h3 className="text-[15px] font-semibold text-foreground">User & Token Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfUsers" className={fieldHeadingClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                      Number of Users <span className="text-destructive">*</span>
                    </span>
                  </Label>
                  <Input
                    id="numberOfUsers"
                    type="number"
                    placeholder="Enter number of users"
                    {...register("numberOfUsers")}
                    className={`${inputBaseClass} ${errors.numberOfUsers ? "border-destructive" : ""}`}
                  />
                  {errors.numberOfUsers && (
                    <p className="text-xs text-destructive">{errors.numberOfUsers.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenAllotmentBy" className={fieldHeadingClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                      Token Allotment By <span className="text-destructive">*</span>
                    </span>
                  </Label>
                  <Select
                    value={watch("tokenAllotmentBy")}
                    onValueChange={(value) => setValue("tokenAllotmentBy", value)}
                  >
                    <SelectTrigger
                      aria-label="Token allotment method"
                      className="h-10 rounded-full border-2 border-border/80 bg-background px-4"
                    >
                      <SelectValue placeholder="Select allotment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Per User</SelectItem>
                      <SelectItem value="customer">Per Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Label
                htmlFor="enableBlueprint"
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  enableBlueprint
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/70 hover:border-border bg-background"
                }`}
              >
                <Checkbox
                  id="enableBlueprint"
                  checked={enableBlueprint}
                  onCheckedChange={(checked) => setValue("enableBlueprint", !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Enable Blueprint Feature</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow this customer to access blueprint functionality for course creation
                  </p>
                </div>
              </Label>
            </div>

            {/* Hierarchy Levels */}
            <div className={sectionCardClass}>
              <div className="flex items-center gap-2.5">
                <Network className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">Organizational Hierarchy</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define the organizational structure levels
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                {levels.map((lvl) => (
                  <div key={lvl.key} className="space-y-2">
                    <Label htmlFor={lvl.key} className={fieldHeadingClass}>
                      {lvl.label} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={lvl.key}
                      placeholder={lvl.placeholder}
                      {...register(lvl.key)}
                      className={`${inputBaseClass} ${errors[lvl.key] ? "border-destructive" : ""}`}
                    />
                    {errors[lvl.key] && (
                      <p className="text-xs text-destructive">{errors[lvl.key]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="px-7 py-4 border-t border-border/60 bg-card flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-primary hover:bg-primary/90 rounded-full shadow-[0px_4px_20px_2px_rgba(0,90,200,0.15)] hover:shadow-[0px_6px_24px_4px_rgba(0,90,200,0.2)] transition-all"
            >
              Update Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

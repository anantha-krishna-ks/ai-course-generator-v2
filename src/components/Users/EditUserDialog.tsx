import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Mail, Phone, Lock, MapPin, Shield } from "lucide-react";

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  contactNo: string;
  username: string;
  email: string;
  role: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customer: "101abc1",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    contactNo: "",
    address: "",
    role: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        customer: "101abc1", // Default customer
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        password: "", // Password is optional for edit
        contactNo: user.contactNo,
        address: user.address,
        role: user.role,
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer) newErrors.customer = "Customer is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    // Password is optional for edit, but if provided, must be valid
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = "Contact number must be 10 digits";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual user update logic
    toast({
      title: "User Updated",
      description: `${formData.firstName} ${formData.lastName} has been updated successfully.`,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setErrors({});
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
          <DialogDescription>
            Update user information for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Customer
              <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.customer} onValueChange={(value) => setFormData({ ...formData, customer: value })}>
              <SelectTrigger className={errors.customer ? "border-2 border-destructive" : "border-2"}>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="101abc1">101abc1</SelectItem>
                <SelectItem value="1258c11">1258c11</SelectItem>
                <SelectItem value="56785555">56785555</SelectItem>
                <SelectItem value="66y">66y</SelectItem>
                <SelectItem value="9test">9test</SelectItem>
              </SelectContent>
            </Select>
            {errors.customer && <p className="text-sm text-destructive">{errors.customer}</p>}
          </div>

          {/* Personal Information Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  className={errors.firstName ? "border-2 border-destructive" : "border-2"}
                />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  className={errors.lastName ? "border-2 border-destructive" : "border-2"}
                />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
              </div>
            </div>
          </div>

          {/* Account Credentials Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Account Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  className={errors.username ? "border-2 border-destructive" : "border-2"}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className={errors.password ? "border-2 border-destructive" : "border-2"}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the current password
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className={errors.email ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo" className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactNo"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="1234567890"
                    className={errors.contactNo ? "border-2 border-destructive" : "border-2"}
                  />
                  {errors.contactNo && <p className="text-sm text-destructive">{errors.contactNo}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  className={errors.address ? "border-2 border-destructive" : "border-2"}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Role Selection Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Role & Permissions
            </h3>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm">
                User Role <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className={errors.role ? "border-2 border-destructive" : "border-2"}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Customer Admin">Customer Admin</SelectItem>
                  <SelectItem value="Course Creator">Course Creator</SelectItem>
                  <SelectItem value="Learner">Learner</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
              <p className="text-xs text-muted-foreground">
                Select the appropriate role to define user permissions and access levels.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

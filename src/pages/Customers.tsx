import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Pencil, Trash2, FileText, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AddCustomerDialog } from "@/components/Customers/AddCustomerDialog";
import { EditCustomerDialog } from "@/components/Customers/EditCustomerDialog";
import { DeleteCustomerDialog } from "@/components/Customers/DeleteCustomerDialog";
import { Badge } from "@/components/ui/badge";
import { brandingService } from "@/services/brandingService";

// Mock data
const initialMockCustomers = [
  { id: 1, name: "101abc1", contactName: "101abc1", contactNo: "9876698766", address: "101abc", email: "101abc@a.com", users: 5 },
  { id: 2, name: "1258c11", contactName: "1258c11", contactNo: "9687593421", address: "szrtyj,k", email: "1258c11@a.com", users: 5 },
  { id: 3, name: "56785555", contactName: "78962222", contactNo: "5678945678", address: "add1 dsfdsfs", email: "ddd@dd.com", users: 500 },
  { id: 4, name: "66y", contactName: "765", contactNo: "5467867854", address: "add", email: "123@456.com", users: 9999 },
  { id: 5, name: "9test", contactName: "new", contactNo: "4356756743", address: "address1", email: "ddd@dd.co", users: 999 },
];

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(initialMockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof initialMockCustomers[0] | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentBrandingId, setCurrentBrandingId] = useState<number | null>(null);

  // Load current branding customer and subscribe to changes
  useEffect(() => {
    const branding = brandingService.getCurrentBranding();
    if (branding) {
      setCurrentBrandingId(branding.customerId);
    }

    const unsubscribe = brandingService.subscribe((newBranding) => {
      setCurrentBrandingId(newBranding?.customerId || null);
    });

    return unsubscribe;
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contactNo.includes(searchQuery) ||
    customer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: any = a[sortColumn as keyof typeof a];
    let bValue: any = b[sortColumn as keyof typeof b];
    
    // Convert to lowercase for string comparison
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalCustomers = sortedCustomers.length;
  const totalPages = Math.ceil(totalCustomers / recordsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

  const handleEdit = (id: number) => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setSelectedCustomer(customer);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = (customerId: number) => {
    setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
    setIsDeleteDialogOpen(false);
  };

  const handleView = (id: number) => {
    navigate("/token-management", { state: { customerId: id } });
  };

  const handleAddCustomer = () => {
    setIsAddDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-module")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Module
        </Button>

        <div className="flex items-start justify-between gap-8 mb-8 flex-wrap">
          {/* Left side - Heading */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Customers</h1>
            <p className="text-muted-foreground">Manage customer records and details</p>
          </div>

          {/* Right side - Search and Add Customer */}
          <div className="flex items-center gap-4 flex-wrap flex-1 justify-end">
            <div className="relative flex-1 max-w-md min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, contact..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-11 h-12 text-base border-2 border-border hover:border-primary/50 focus-visible:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            <Button onClick={handleAddCustomer} size="lg" className="gap-2 h-12">
              <Plus className="w-5 h-5" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("contactName")}
                  >
                    <div className="flex items-center gap-2">
                      Contact Name
                      {getSortIcon("contactName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("contactNo")}
                  >
                    <div className="flex items-center gap-2">
                      Contact No.
                      {getSortIcon("contactNo")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("address")}
                  >
                    <div className="flex items-center gap-2">
                      Address
                      {getSortIcon("address")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email Id
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("users")}
                  >
                    <div className="flex items-center gap-2">
                      No. of Users
                      {getSortIcon("users")}
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCustomers.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage).map((customer) => (
                  <TableRow key={customer.id} className={currentBrandingId === customer.id ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium py-3">
                      <div className="flex items-center gap-2">
                        {customer.name}
                        {currentBrandingId === customer.id && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">{customer.contactName}</TableCell>
                    <TableCell className="py-3">{customer.contactNo}</TableCell>
                    <TableCell className="py-3">{customer.address}</TableCell>
                    <TableCell className="py-3">{customer.email}</TableCell>
                    <TableCell className="py-3">{customer.users}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(customer.id)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(customer.id)}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Total Customers: <span className="font-semibold text-foreground">{totalCustomers}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Records Per Page:</span>
                  <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AddCustomerDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
        />
        
        <EditCustomerDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          customer={selectedCustomer}
        />
        
        <DeleteCustomerDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen}
          customer={selectedCustomer}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default Customers;

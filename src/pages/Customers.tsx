import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users as UsersIcon,
  Building2,
  TrendingUp,
  ListFilter,
} from "lucide-react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

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
  const [brandingFilter, setBrandingFilter] = useState<string>("all");

  useEffect(() => {
    const branding = brandingService.getCurrentBranding();
    if (branding) setCurrentBrandingId(branding.customerId);
    const unsubscribe = brandingService.subscribe((newBranding) => {
      setCurrentBrandingId(newBranding?.customerId || null);
    });
    return unsubscribe;
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactNo.includes(searchQuery) ||
      customer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranding =
      brandingFilter === "all" ||
      (brandingFilter === "active" && currentBrandingId === customer.id) ||
      (brandingFilter === "inactive" && currentBrandingId !== customer.id);

    return matchesSearch && matchesBranding;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortColumn) return 0;
    let aValue: any = a[sortColumn as keyof typeof a];
    let bValue: any = b[sortColumn as keyof typeof b];
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const hasActiveFilters = searchQuery !== "" || brandingFilter !== "all";
  const clearFilters = () => {
    setSearchQuery("");
    setBrandingFilter("all");
    setCurrentPage(1);
  };

  const totalCustomers = sortedCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalCustomers / recordsPerPage));
  const totalUsers = customers.reduce((sum, c) => sum + c.users, 0);

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
      return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" aria-hidden="true" focusable="false" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-primary" aria-hidden="true" focusable="false" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" aria-hidden="true" focusable="false" />
    );
  };

  const handleEdit = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setSelectedCustomer(customer);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = (customerId: number) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setIsDeleteDialogOpen(false);
  };

  const handleView = (id: number) => {
    navigate("/token-management", { state: { customerId: id } });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-module")}
            className="mb-6 rounded-full hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
            Back to Admin Module
          </Button>
        </motion.div>

        {/* Hero / Welcome banner */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 px-7 py-6">
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                </div>
                <div>
                  <h1
                    className="text-[26px] font-semibold tracking-[-0.03em] leading-tight text-foreground"
                    style={{ fontFamily: "'Geist', sans-serif" }}
                  >
                    Customers
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage customer records, contacts and team allocations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background rounded-full px-4 py-2 border border-border/60 self-start lg:self-auto">
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>
                    <span className="font-semibold text-foreground">{customers.length}</span> customers
                  </span>
                </div>
                <span className="w-px h-3.5 bg-border" aria-hidden="true" />
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <UsersIcon className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>
                    <span className="font-semibold text-foreground">{totalUsers.toLocaleString()}</span> users
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toolbar: search + filters + add */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none"
                aria-hidden="true"
                focusable="false"
              />
              <Input
                type="search"
                placeholder="Search by name, email, contact..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search customers"
                className="pl-10 h-10 rounded-full border-2 border-border/80 bg-card focus:border-primary/50 focus-visible:ring-primary/20"
              />
            </div>

            <span
              className="hidden sm:block w-px h-6 bg-border/80"
              aria-hidden="true"
            />

            <Select
              value={brandingFilter}
              onValueChange={(v) => { setBrandingFilter(v); setCurrentPage(1); }}
            >
              <SelectTrigger
                aria-label="Filter customers"
                className="h-10 w-full sm:w-[210px] rounded-full border-2 border-border/80 bg-card pl-3.5"
              >
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                  <SelectValue placeholder="All Customers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active Customers</SelectItem>
                <SelectItem value="inactive">Inactive Customers</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                Clear filters
              </Button>
            )}
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90 rounded-full shadow-[0px_4px_20px_2px_rgba(0,90,200,0.15)] hover:shadow-[0px_6px_24px_4px_rgba(0,90,200,0.2)] transition-all shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
            Add Customer
          </Button>
        </motion.div>

        {/* Table card */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted border-b-2 border-border">
                      {[
                        { key: "name", label: "Name" },
                        { key: "contactName", label: "Contact Name" },
                        { key: "contactNo", label: "Contact No." },
                        { key: "address", label: "Address" },
                        { key: "email", label: "Email Id" },
                        { key: "users", label: "No. of Users" },
                      ].map((col) => (
                        <TableHead
                          key={col.key}
                          className="font-semibold text-foreground cursor-pointer group select-none"
                          onClick={() => handleSort(col.key)}
                        >
                          <div className="flex items-center gap-2">
                            {col.label}
                            {getSortIcon(col.key)}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-muted-foreground" aria-hidden="true" focusable="false" />
                            </div>
                            <p className="text-sm">No customers match your search.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedCustomers
                        .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                        .map((customer) => (
                          <TableRow
                            key={customer.id}
                            className={`transition-colors ${
                              currentBrandingId === customer.id ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"
                            }`}
                          >
                            <TableCell className="font-medium py-3">
                              <div className="flex items-center gap-2">
                                <span>{customer.name}</span>
                                {currentBrandingId === customer.id && (
                                  <Badge variant="secondary" className="text-xs rounded-full bg-primary/10 text-primary border-primary/20">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">{customer.contactName}</TableCell>
                            <TableCell className="py-3 text-muted-foreground">{customer.contactNo}</TableCell>
                            <TableCell className="py-3 text-muted-foreground">{customer.address}</TableCell>
                            <TableCell className="py-3 text-muted-foreground">{customer.email}</TableCell>
                            <TableCell className="py-3">
                              <Badge variant="outline" className="rounded-full border-border bg-muted/40 font-medium">
                                {customer.users.toLocaleString()}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(customer.id)}
                                  className="rounded-full text-primary hover:text-primary hover:bg-primary/10 h-9 w-9"
                                  aria-label={`Edit ${customer.name}`}
                                >
                                  <Pencil className="w-4 h-4" aria-hidden="true" focusable="false" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(customer.id)}
                                  className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                                  aria-label={`Delete ${customer.name}`}
                                >
                                  <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleView(customer.id)}
                                  className="rounded-full text-foreground hover:text-primary hover:bg-primary/10 h-9 w-9"
                                  aria-label={`View tokens for ${customer.name}`}
                                >
                                  <FileText className="w-4 h-4" aria-hidden="true" focusable="false" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="border-t border-border/60 p-4 bg-muted/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <span className="text-sm text-muted-foreground">
                    Total Customers: <span className="font-semibold text-foreground">{totalCustomers}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Records Per Page:</span>
                    <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
                      <SelectTrigger className="w-20 h-9 rounded-full" aria-label="Records per page">
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

                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center overflow-x-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="shrink-0 rounded-full"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 overflow-x-auto px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 shrink-0 rounded-full ${
                          currentPage === page
                            ? "shadow-[0px_4px_14px_0px_rgba(0,90,200,0.25)]"
                            : "hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="shrink-0 rounded-full"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <AddCustomerDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
        <EditCustomerDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} customer={selectedCustomer} />
        <DeleteCustomerDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          customer={selectedCustomer}
          onConfirmDelete={handleConfirmDelete}
        />
      </main>
    </div>
  );
};

export default Customers;

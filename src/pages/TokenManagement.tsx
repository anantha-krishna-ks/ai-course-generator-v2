import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Coins,
  ListFilter,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import { ViewTokensDialog } from "@/components/TokenManagement/ViewTokensDialog";
import { EditTokenDialog } from "@/components/TokenManagement/EditTokenDialog";
import { DeleteTokenDialog } from "@/components/TokenManagement/DeleteTokenDialog";
import { AddTokenDialog } from "@/components/TokenManagement/AddTokenDialog";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// Mock customers data
const mockCustomers = [
  { id: 1, name: "101abc1" },
  { id: 2, name: "1258c11" },
  { id: 3, name: "56785555" },
  { id: 4, name: "66y" },
  { id: 5, name: "9test" },
];

// Mock token data
const initialMockTokens = [
  { id: 1, date: "13-Oct-2025", openingBalance: 0, tokensCount: 1000, consumedTokens: 0, balance: 1000, state: "Active", expiryDate: "14-Oct-2025", user: "User1", customerId: 1 },
  { id: 2, date: "12-Oct-2025", openingBalance: 0, tokensCount: 2000, consumedTokens: 0, balance: 2000, state: "Active", expiryDate: "31-Oct-2025", user: "User2", customerId: 2 },
  { id: 3, date: "10-Oct-2025", openingBalance: -817, tokensCount: 1000, consumedTokens: 967, balance: -784, state: "Inactive", expiryDate: "12-Oct-2025", user: "User3", customerId: 1 },
  { id: 4, date: "08-Oct-2025", openingBalance: 0, tokensCount: 150, consumedTokens: 967, balance: -817, state: "Inactive", expiryDate: "11-Oct-2025", user: "User1", customerId: 3 },
  { id: 5, date: "08-Oct-2025", openingBalance: 0, tokensCount: 500, consumedTokens: 101719, balance: -101219, state: "Inactive", expiryDate: "11-Oct-2025", user: "User4", customerId: 2 },
];

const TokenManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tokens, setTokens] = useState(initialMockTokens);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [viewTokensDialogOpen, setViewTokensDialogOpen] = useState(false);
  const [addTokenDialogOpen, setAddTokenDialogOpen] = useState(false);
  const [editTokenDialogOpen, setEditTokenDialogOpen] = useState(false);
  const [deleteTokenDialogOpen, setDeleteTokenDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<typeof initialMockTokens[0] | null>(null);

  // Pre-select customer if navigated from Customers page
  useEffect(() => {
    const state = location.state as { customerId?: number } | null;
    if (state?.customerId) {
      setSelectedCustomer(state.customerId.toString());
    }
  }, [location.state]);

  // Filter tokens based on search query and selected customer
  const filteredTokens = tokens.filter(token => {
    const matchesSearch = 
      token.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.openingBalance.toString().includes(searchQuery) ||
      token.tokensCount.toString().includes(searchQuery) ||
      token.consumedTokens.toString().includes(searchQuery) ||
      token.balance.toString().includes(searchQuery) ||
      token.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.expiryDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomer = 
      selectedCustomer === "all" || 
      token.customerId === parseInt(selectedCustomer);
    
    return matchesSearch && matchesCustomer;
  });

  // Sort filtered tokens
  const sortedTokens = [...filteredTokens].sort((a, b) => {
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

  const totalTokens = sortedTokens.length;
  const totalPages = Math.ceil(totalTokens / recordsPerPage);

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

  const totalActiveTokens = tokens
    .filter((t) => t.state === "Active")
    .reduce((sum, t) => sum + t.balance, 0);
  const totalConsumed = tokens.reduce((sum, t) => sum + t.consumedTokens, 0);

  const handleEdit = (id: number) => {
    const token = tokens.find(t => t.id === id);
    if (token) {
      setSelectedToken(token);
      setEditTokenDialogOpen(true);
    }
  };

  const handleAddToken = (newToken: typeof initialMockTokens[0]) => {
    setTokens(prevTokens => [...prevTokens, newToken]);
  };

  const handleSaveToken = (updatedToken: typeof initialMockTokens[0]) => {
    setTokens(prevTokens => prevTokens.map(t => t.id === updatedToken.id ? updatedToken : t));
  };

  const handleDelete = (id: number) => {
    const token = tokens.find(t => t.id === id);
    if (token) {
      setSelectedToken(token);
      setDeleteTokenDialogOpen(true);
    }
  };

  const handleConfirmDelete = (id: number) => {
    setTokens(prevTokens => prevTokens.filter(t => t.id !== id));
  };

  const selectedCustomerName =
    selectedCustomer === "all"
      ? "All Customers"
      : mockCustomers.find((c) => c.id.toString() === selectedCustomer)?.name ?? "All Customers";

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
                  <Coins className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                </div>
                <div>
                  <h1
                    className="text-[26px] font-semibold tracking-[-0.03em] leading-tight text-foreground"
                    style={{ fontFamily: "'Geist', sans-serif" }}
                  >
                    Token Management
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and manage token allocations across customers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background rounded-full px-4 py-2 border border-border/60 self-start lg:self-auto">
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>
                    <span className="font-semibold text-foreground">{totalActiveTokens.toLocaleString()}</span> active balance
                  </span>
                </div>
                <span className="w-px h-3.5 bg-border" aria-hidden="true" />
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Coins className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>
                    <span className="font-semibold text-foreground">{totalConsumed.toLocaleString()}</span> consumed
                  </span>
                </div>
                <span className="w-px h-3.5 bg-border" aria-hidden="true" />
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <UsersIcon className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>
                    <span className="font-semibold text-foreground">{mockCustomers.length}</span> customers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toolbar: search + filter + actions */}
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
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search tokens"
                className="pl-10 h-10 rounded-full border-2 border-border/80 bg-card focus:border-primary/50 focus-visible:ring-primary/20"
              />
            </div>

            <span className="hidden sm:block w-px h-6 bg-border/80" aria-hidden="true" />

            <Select
              value={selectedCustomer}
              onValueChange={(value) => {
                setSelectedCustomer(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Filter by customer"
                className="h-10 w-full sm:w-[220px] rounded-full border-2 border-border/80 bg-card pl-3.5"
              >
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                  <SelectValue placeholder="All Customers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {mockCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => setViewTokensDialogOpen(true)}
              className="gap-2 rounded-full border-border bg-card hover:bg-muted/60"
            >
              <Eye className="w-4 h-4" aria-hidden="true" focusable="false" />
              View Tokens
            </Button>

            <Button
              onClick={() => setAddTokenDialogOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 rounded-full shadow-[0px_4px_20px_2px_rgba(0,90,200,0.15)] hover:shadow-[0px_6px_24px_4px_rgba(0,90,200,0.2)] transition-all"
            >
              <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
              Add Tokens
            </Button>
          </div>
        </motion.div>

        {/* Active filter chip */}
        {selectedCustomer !== "all" && (
          <motion.div custom={2.5} variants={fadeUp} initial="hidden" animate="visible" className="mb-4">
            <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-primary/20 gap-1.5">
              Customer: {selectedCustomerName}
            </Badge>
          </motion.div>
        )}

        {/* Tokens Table */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted border-b-2 border-border">
                      {[
                        { key: "date", label: "Date" },
                        { key: "openingBalance", label: "Opening Balance" },
                        { key: "tokensCount", label: "Tokens Count" },
                        { key: "consumedTokens", label: "Consumed Tokens" },
                        { key: "balance", label: "Balance" },
                        { key: "state", label: "State" },
                        { key: "expiryDate", label: "Expiry Date" },
                        { key: "user", label: "User" },
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
                    {sortedTokens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          No tokens match your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedTokens
                        .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                        .map((token) => (
                          <TableRow key={token.id} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="font-medium py-3">{token.date}</TableCell>
                            <TableCell className="py-3 text-muted-foreground">{token.openingBalance.toLocaleString()}</TableCell>
                            <TableCell className="py-3">{token.tokensCount.toLocaleString()}</TableCell>
                            <TableCell className="py-3 text-muted-foreground">{token.consumedTokens.toLocaleString()}</TableCell>
                            <TableCell className={`py-3 font-medium ${token.balance < 0 ? "text-destructive" : "text-foreground"}`}>
                              {token.balance.toLocaleString()}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge
                                variant="outline"
                                className={`rounded-full font-medium ${
                                  token.state === "Active"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-muted/40 text-muted-foreground border-border"
                                }`}
                              >
                                {token.state}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 text-muted-foreground">{token.expiryDate}</TableCell>
                            <TableCell className="py-3">{token.user}</TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(token.id)}
                                  aria-label="Edit token"
                                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <Pencil className="w-4 h-4" aria-hidden="true" focusable="false" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(token.id)}
                                  aria-label="Delete token"
                                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
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
                    Total Tokens: <span className="font-semibold text-foreground">{totalTokens}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Records Per Page:</span>
                    <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
                      <SelectTrigger aria-label="Records per page" className="w-20 rounded-full h-9 border-border bg-card">
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

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center overflow-x-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="shrink-0 rounded-full"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 shrink-0 rounded-full ${currentPage === page ? "" : "border-border bg-card"}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="shrink-0 rounded-full"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      <ViewTokensDialog 
        open={viewTokensDialogOpen} 
        onClose={() => setViewTokensDialogOpen(false)} 
      />

      <AddTokenDialog
        open={addTokenDialogOpen}
        onClose={() => setAddTokenDialogOpen(false)}
        onAdd={handleAddToken}
        customers={mockCustomers}
      />

      <EditTokenDialog
        open={editTokenDialogOpen}
        onClose={() => setEditTokenDialogOpen(false)}
        token={selectedToken}
        onSave={handleSaveToken}
        customerName={selectedToken ? mockCustomers.find(c => c.id === selectedToken.customerId)?.name || "" : ""}
      />

      <DeleteTokenDialog
        open={deleteTokenDialogOpen}
        onOpenChange={setDeleteTokenDialogOpen}
        token={selectedToken}
        onConfirmDelete={handleConfirmDelete}
        customerName={selectedToken ? mockCustomers.find(c => c.id === selectedToken.customerId)?.name || "" : ""}
      />
    </div>
  );
};

export default TokenManagement;

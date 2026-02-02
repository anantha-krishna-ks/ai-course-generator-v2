import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Pencil, Trash2, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { ViewTokensDialog } from "@/components/TokenManagement/ViewTokensDialog";
import { EditTokenDialog } from "@/components/TokenManagement/EditTokenDialog";
import { DeleteTokenDialog } from "@/components/TokenManagement/DeleteTokenDialog";
import { AddTokenDialog } from "@/components/TokenManagement/AddTokenDialog";

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
      return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Token Management</h1>
            <p className="text-muted-foreground">View and manage token allocations</p>
          </div>

          {/* Right side - Customer Filter, Search and Buttons */}
          <div className="flex items-center gap-4 flex-wrap flex-1 justify-end">
            <Select value={selectedCustomer} onValueChange={(value) => {
              setSelectedCustomer(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[200px] h-12 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors bg-white">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all" className="cursor-pointer hover:bg-accent">All Customers</SelectItem>
                {mockCustomers.map((customer) => (
                  <SelectItem 
                    key={customer.id} 
                    value={customer.id.toString()}
                    className="cursor-pointer hover:bg-accent"
                  >
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative flex-1 max-w-md min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tokens..."
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
            
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => setViewTokensDialogOpen(true)}
            >
              <Eye className="w-5 h-5" />
              View Tokens
            </Button>
            
            <Button 
              size="lg" 
              className="gap-2 h-12"
              onClick={() => setAddTokenDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add Tokens
            </Button>
          </div>
        </div>

        {/* Tokens Table */}
        <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80 hover:bg-muted/80 border-b-2">
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("openingBalance")}
                  >
                    <div className="flex items-center gap-2">
                      Opening Balance
                      {getSortIcon("openingBalance")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("tokensCount")}
                  >
                    <div className="flex items-center gap-2">
                      Tokens Count
                      {getSortIcon("tokensCount")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("consumedTokens")}
                  >
                    <div className="flex items-center gap-2">
                      Consumed Tokens
                      {getSortIcon("consumedTokens")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("balance")}
                  >
                    <div className="flex items-center gap-2">
                      Balance
                      {getSortIcon("balance")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("state")}
                  >
                    <div className="flex items-center gap-2">
                      State
                      {getSortIcon("state")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("expiryDate")}
                  >
                    <div className="flex items-center gap-2">
                      Expiry Date
                      {getSortIcon("expiryDate")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("user")}
                  >
                    <div className="flex items-center gap-2">
                      User
                      {getSortIcon("user")}
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTokens.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage).map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium py-3">{token.date}</TableCell>
                    <TableCell className="py-3">{token.openingBalance.toLocaleString()}</TableCell>
                    <TableCell className="py-3">{token.tokensCount.toLocaleString()}</TableCell>
                    <TableCell className="py-3">{token.consumedTokens.toLocaleString()}</TableCell>
                    <TableCell className="py-3">{token.balance.toLocaleString()}</TableCell>
                    <TableCell className="py-3">{token.state}</TableCell>
                    <TableCell className="py-3">{token.expiryDate}</TableCell>
                    <TableCell className="py-3">{token.user}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(token.id)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(token.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="border-t p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground">
                  Total Courses: <span className="font-semibold text-foreground">{totalTokens}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Records Per Page:</span>
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

              <div className="flex items-center gap-2 w-full sm:w-auto justify-center overflow-x-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="shrink-0"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10 shrink-0"
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
                  className="shrink-0"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

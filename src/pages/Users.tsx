import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Pencil, Trash2, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AddUserDialog } from "@/components/Users/AddUserDialog";
import { EditUserDialog } from "@/components/Users/EditUserDialog";
import { DeleteUserDialog } from "@/components/Users/DeleteUserDialog";

// Mock customers data
const mockCustomers = [
  { id: 1, name: "101abc1" },
  { id: 2, name: "1258c11" },
  { id: 3, name: "56785555" },
  { id: 4, name: "66y" },
  { id: 5, name: "9test" },
];

// Mock data
const initialMockUsers = [
  { id: 1, firstName: "123", lastName: "1", address: "dsfghfx", contactNo: "9865741968", username: "123", email: "123@e.com", role: "Customer Admin", customerId: 1 },
  { id: 2, firstName: "16101", lastName: "16101", address: "add", contactNo: "7654563456", username: "16101", email: "ddd@dd.com", role: "Customer Admin", customerId: 2 },
  { id: 3, firstName: "16102", lastName: "16102", address: "add", contactNo: "7654563456", username: "16102", email: "ddd@dd.com", role: "Super Admin", customerId: 1 },
  { id: 4, firstName: "16103", lastName: "1610", address: "add", contactNo: "8765456789", username: "16103", email: "ddd@dd.com", role: "Course Creator", customerId: 3 },
  { id: 5, firstName: "1acca", lastName: "acca", address: "add", contactNo: "4356787654", username: "1acca", email: "ddd@dd.com", role: "Customer Admin", customerId: 2 },
];

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialMockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof initialMockUsers[0] | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter users based on search query and selected customer
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.contactNo.includes(searchQuery) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomer = 
      selectedCustomer === "all" || 
      user.customerId === parseInt(selectedCustomer);
    
    return matchesSearch && matchesCustomer;
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
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

  const totalUsers = sortedUsers.length;
  const totalPages = Math.ceil(totalUsers / recordsPerPage);

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
    const user = users.find(u => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = (userId: number) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    setIsDeleteDialogOpen(false);
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
            <p className="text-muted-foreground">Add, remove, or update user access</p>
          </div>

          {/* Right side - Customer Filter, Search and Add User */}
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
                placeholder="Search by name, username, email..."
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
            <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="gap-2 h-12">
              <Plus className="w-5 h-5" />
              Add User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80 hover:bg-muted/80 border-b-2">
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("firstName")}
                  >
                    <div className="flex items-center gap-2">
                      First Name
                      {getSortIcon("firstName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("lastName")}
                  >
                    <div className="flex items-center gap-2">
                      Last Name
                      {getSortIcon("lastName")}
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
                    onClick={() => handleSort("contactNo")}
                  >
                    <div className="flex items-center gap-2">
                      Contact No
                      {getSortIcon("contactNo")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center gap-2">
                      Username
                      {getSortIcon("username")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email id
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer group"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-2">
                      Role
                      {getSortIcon("role")}
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium py-3">{user.firstName}</TableCell>
                    <TableCell className="py-3">{user.lastName}</TableCell>
                    <TableCell className="py-3">{user.address}</TableCell>
                    <TableCell className="py-3">{user.contactNo}</TableCell>
                    <TableCell className="py-3">{user.username}</TableCell>
                    <TableCell className="py-3">{user.email}</TableCell>
                    <TableCell className="py-3">{user.role}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user.id)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
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
                  Total Users: <span className="font-semibold text-foreground">{totalUsers}</span>
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

        <AddUserDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
        />
        
        <EditUserDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          user={selectedUser}
        />
        
        <DeleteUserDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen}
          user={selectedUser}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default Users;

import { useState } from "react";
import { useReports } from "@/hooks/use-reports";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { ReportCard } from "@/components/ReportCard";
import { CreateReportDialog } from "@/components/CreateReportDialog";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FilterX, FolderOpen, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [adminTab, setAdminTab] = useState<"reports" | "users">("reports");

  const { data: reports, isLoading } = useReports();
  const { users: allUsers, isLoading: usersLoading } = useUsers();

  const filteredReports = reports?.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;
    const matchesOwner =
      user?.role === "admin" || report.reporterId === user?.id;

    return matchesSearch && matchesStatus && matchesCategory && matchesOwner;
  });

  const clearFilters = () => {
    setFilterStatus("all");
    setSearchTerm("");
    setCategoryFilter("all");
  };

  const hasActiveFilters =
    filterStatus !== "all" || searchTerm !== "" || categoryFilter !== "all";

  return (
    <div className="space-y-8 animate-enter">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === "admin" ? "Admin Dashboard" : "My Reports"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === "admin"
              ? "Manage incidents, reports, and users."
              : "Track status of your submitted incidents."}
          </p>
        </div>
        <div className="flex-shrink-0">
          {user?.role === "admin" ? (
            <CreateUserDialog />
          ) : (
            <CreateReportDialog />
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      {user?.role === "admin" ? (
        <Tabs
          value={adminTab}
          onValueChange={(v) => setAdminTab(v as "reports" | "users")}
        >
          <TabsList>
            <TabsTrigger value="reports" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {/* Filters Section */}
            <div className="bg-card rounded-xl border p-4 shadow-sm space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Theft">Theft</SelectItem>
                        <SelectItem value="Vandalism">Vandalism</SelectItem>
                        <SelectItem value="Assault">Assault</SelectItem>
                        <SelectItem value="Suspicious Activity">
                          Suspicious Activity
                        </SelectItem>
                        <SelectItem value="Noise Complaint">
                          Noise Complaint
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Tabs
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                      className="flex-1"
                    >
                      <TabsList className="grid w-full grid-cols-4 h-auto">
                        <TabsTrigger
                          value="all"
                          className="text-xs md:text-sm py-1"
                        >
                          All
                        </TabsTrigger>
                        <TabsTrigger
                          value="pending"
                          className="text-yellow-600 text-xs md:text-sm py-1"
                        >
                          Pending
                        </TabsTrigger>
                        <TabsTrigger
                          value="reviewed"
                          className="text-blue-600 text-xs md:text-sm py-1"
                        >
                          Reviewed
                        </TabsTrigger>
                        <TabsTrigger
                          value="closed"
                          className="text-green-600 text-xs md:text-sm py-1"
                        >
                          Closed
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearFilters}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        title="Clear Filters"
                        data-testid="button-clear-filters"
                      >
                        <FilterX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredReports && filteredReports.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-2xl border border-dashed">
                <div className="p-4 rounded-full bg-muted">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">No reports found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {hasActiveFilters
                      ? "Try adjusting your filters or search terms."
                      : "No reports available."}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {usersLoading ? (
              <Skeleton className="h-[300px] w-full rounded-xl" />
            ) : (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers && allUsers.length > 0 ? (
                      allUsers.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.username}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.role === "admin" ? "default" : "secondary"
                              }
                            >
                              {u.role === "admin" ? "Admin" : "Reporter"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Reporter View */
        <>
          {/* Filters Section */}
          <div className="bg-card rounded-xl border p-4 shadow-sm space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search reports..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Theft">Theft</SelectItem>
                      <SelectItem value="Vandalism">Vandalism</SelectItem>
                      <SelectItem value="Assault">Assault</SelectItem>
                      <SelectItem value="Suspicious Activity">
                        Suspicious Activity
                      </SelectItem>
                      <SelectItem value="Noise Complaint">
                        Noise Complaint
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 items-center">
                  <Tabs
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                    className="flex-1"
                  >
                    <TabsList className="grid w-full grid-cols-4 h-auto">
                      <TabsTrigger
                        value="all"
                        className="text-xs md:text-sm py-1"
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="text-yellow-600 text-xs md:text-sm py-1"
                      >
                        Pending
                      </TabsTrigger>
                      <TabsTrigger
                        value="reviewed"
                        className="text-blue-600 text-xs md:text-sm py-1"
                      >
                        Reviewed
                      </TabsTrigger>
                      <TabsTrigger
                        value="closed"
                        className="text-green-600 text-xs md:text-sm py-1"
                      >
                        Closed
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFilters}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      title="Clear Filters"
                      data-testid="button-clear-filters"
                    >
                      <FilterX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[125px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReports && filteredReports.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-2xl border border-dashed">
              <div className="p-4 rounded-full bg-muted">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No reports found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {hasActiveFilters
                    ? "Try adjusting your filters or search terms."
                    : "You haven't submitted any reports yet."}
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

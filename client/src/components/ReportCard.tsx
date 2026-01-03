import { format } from "date-fns";
import { Report } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpdateReportStatus, useDeleteReport } from "@/hooks/use-reports";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateReportStatus();
  const { mutate: deleteReport, isPending: isDeleting } = useDeleteReport();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-500/20 dark:bg-yellow-500/30",
          text: "text-yellow-700 dark:text-yellow-400",
          border: "border-yellow-300 dark:border-yellow-400",
        };
      case "reviewed":
        return {
          bg: "bg-blue-500/20 dark:bg-blue-500/30",
          text: "text-blue-700 dark:text-blue-400",
          border: "border-blue-300 dark:border-blue-400",
        };
      case "closed":
        return {
          bg: "bg-green-500/20 dark:bg-green-500/30",
          text: "text-green-700 dark:text-green-400",
          border: "border-green-300 dark:border-green-400",
        };
      default:
        return {
          bg: "bg-gray-500/20 dark:bg-gray-500/30",
          text: "text-gray-700 dark:text-gray-400",
          border: "border-gray-300 dark:border-gray-400",
        };
    }
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4 mr-1.5" />,
    reviewed: <CheckCircle2 className="w-4 h-4 mr-1.5" />,
    closed: <XCircle className="w-4 h-4 mr-1.5" />,
  };

  const colors = getStatusColor(report.status);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 relative">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {report.title}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              ID: #{report.id} •{" "}
              {format(new Date(report.createdAt!), "MMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>

          <div
            className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-1.5 rounded-full text-sm font-semibold flex items-center capitalize whitespace-nowrap shrink-0`}
          >
            {statusIcons[report.status as keyof typeof statusIcons]}
            {report.status}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs font-normal">
            {report.category}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-normal bg-background"
          >
            📍 {report.location}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {report.description}
        </p>
      </CardContent>

      {isAdmin && (
        <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between items-center">
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 ml-auto"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    updateStatus({ id: report.id, status: "pending" })
                  }
                  disabled={report.status === "pending" || isUpdating}
                >
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateStatus({ id: report.id, status: "reviewed" })
                  }
                  disabled={report.status === "reviewed" || isUpdating}
                >
                  Mark as Reviewed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateStatus({ id: report.id, status: "closed" })
                  }
                  disabled={report.status === "closed" || isUpdating}
                >
                  Mark as Closed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Report
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  report #{report.id}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteReport(report.id)}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}

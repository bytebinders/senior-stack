import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateReport } from "@/hooks/use-reports";
import { insertReportSchema } from "@shared/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for the form - remove status as it defaults to pending
const formSchema = insertReportSchema.omit({ status: true });

const CATEGORIES = [
  "Theft",
  "Vandalism",
  "Assault",
  "Suspicious Activity",
  "Noise Complaint",
  "Other",
];

export function CreateReportDialog() {
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<z.infer<
    typeof formSchema
  > | null>(null);
  const { mutate: createReport, isPending } = useCreateReport();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setPendingSubmit(values);
    setShowConfirmation(true);
  }

  function confirmSubmit() {
    if (pendingSubmit) {
      createReport(pendingSubmit, {
        onSuccess: () => {
          setOpen(false);
          setShowConfirmation(false);
          setPendingSubmit(null);
          form.reset();
        },
      });
    }
  }

  const { toast } = useToast();

  async function useMyLocation() {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported by your browser" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          // Try to get address from coordinates using reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          if (response.ok) {
            const data = await response.json();
            const address =
              data.address?.road ||
              data.address?.county ||
              data.address?.city ||
              `${lat.toFixed(6)},${lng.toFixed(6)}`;
            const fullLocation = `${address} (${lat.toFixed(6)}, ${lng.toFixed(
              6
            )})`;
            form.setValue("location", fullLocation, { shouldValidate: true });
            toast({
              title: "Location set",
              description: fullLocation,
            });
          } else {
            // Fallback to coordinates if reverse geocoding fails
            const val = `${lat.toFixed(6)},${lng.toFixed(6)}`;
            form.setValue("location", val, { shouldValidate: true });
            toast({ title: "Location set (coordinates)", description: val });
          }
        } catch (error) {
          // Fallback if reverse geocoding fails
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const val = `${lat.toFixed(6)},${lng.toFixed(6)}`;
          form.setValue("location", val, { shouldValidate: true });
          toast({ title: "Location set (coordinates)", description: val });
        }
      },
      (err) => {
        toast({ title: "Could not get location", description: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg hover:shadow-primary/20 transition-all gap-2">
          <PlusCircle className="h-4 w-4" />
          New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>File a Report</DialogTitle>
          <DialogDescription>
            Submit details about an incident. This will be reviewed by
            administrators.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary of incident" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location/Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Where did this incident occur?"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={useMyLocation}
                    >
                      Use my location
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of what happened..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[100px]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Report Submission</AlertDialogTitle>
              <AlertDialogDescription>
                Please review your report details before submitting. This action
                cannot be edited after submission.
                {pendingSubmit && (
                  <div className="mt-4 space-y-2 text-sm text-foreground">
                    <p>
                      <strong>Title:</strong> {pendingSubmit.title}
                    </p>
                    <p>
                      <strong>Category:</strong> {pendingSubmit.category}
                    </p>
                    <p>
                      <strong>Location:</strong> {pendingSubmit.location}
                    </p>
                    <p>
                      <strong>Description:</strong> {pendingSubmit.description}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSubmit} disabled={isPending}>
                {isPending ? "Submitting..." : "Confirm & Submit"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

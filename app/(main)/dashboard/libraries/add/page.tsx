"use client";
import { useSetAtom } from "jotai";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  AddLibraryFormValues,
  defaultAddLibraryFormValues,
  addLibraryFormSchema,
} from "@/src/form-schemas/libraries/add";
import { addLibrary } from "@/src/actions/media";
import { LibraryForm } from "@/src/components/add-dashboard-libraries/library-form";
import { buildLibraryOptions } from "@/src/lib/library-form-helpers";
import { useLibraryLookups } from "@/src/lib/use-library-lookups";
import { useLibraryOptionsLoader } from "@/src/lib/use-library-options-loader";
import { useRouter } from "next/navigation";

export default function AddLibraryPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const router = useRouter();

  const form = useForm<AddLibraryFormValues>({
    resolver: zodResolver(addLibraryFormSchema) as any,
    defaultValues: defaultAddLibraryFormValues,
  });

  const collectionType = useWatch({
    control: form.control,
    name: "CollectionType",
  });

  const { cultures, countries } = useLibraryLookups({
    setLoading: setDashboardLoading,
  });

  useLibraryOptionsLoader({
    collectionType,
    form,
    setLoading: setDashboardLoading,
  });

  async function onSubmit(data: AddLibraryFormValues) {
    setDashboardLoading(true);
    try {
      const libraryOptions = buildLibraryOptions(data);

      await addLibrary(
        data.Name,
        data.CollectionType,
        data.Paths,
        libraryOptions,
      );

      toast.success("Library added successfully");
      router.push("/dashboard/libraries");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add library");
    } finally {
      setDashboardLoading(false);
    }
  }

  return (
    <LibraryForm
      form={form}
      cultures={cultures}
      countries={countries}
      onSubmit={onSubmit}
      onCancel={() => router.push("/dashboard/libraries")}
    />
  );
}

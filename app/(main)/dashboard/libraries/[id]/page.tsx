"use client";
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import {
  AddLibraryFormValues,
  addLibraryFormSchema,
  defaultAddLibraryFormValues,
} from "@/src/form-schemas/libraries/add";
import {
  buildFormValuesFromLibrary,
  buildLibraryOptions,
} from "@/src/lib/library-form-helpers";
import { LibraryForm } from "@/src/components/add-dashboard-libraries/library-form";
import { useLibraryLookups } from "@/src/lib/use-library-lookups";
import {
  fetchLibraryOptionsInfo,
  fetchVirtualFolders,
  renameVirtualFolder,
  updateLibraryOptions,
} from "@/src/actions/media";
import { VirtualFolderInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { useParams, useRouter } from "next/navigation";

export default function EditLibraryPage() {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [library, setLibrary] = useState<VirtualFolderInfo | null>(null);
  const [originalName, setOriginalName] = useState<string>("");

  const form = useForm<AddLibraryFormValues>({
    resolver: zodResolver(addLibraryFormSchema) as any,
    defaultValues: defaultAddLibraryFormValues,
  });

  const { cultures, countries } = useLibraryLookups({
    setLoading: setDashboardLoading,
  });

  useEffect(() => {
    if (!id) return;

    const loadLibrary = async () => {
      setDashboardLoading(true);
      try {
        const libraries = await fetchVirtualFolders();
        const current = libraries.find((item) => item.ItemId === id);
        if (!current) {
          toast.error("Library not found");
          router.push("/dashboard/libraries");
          return;
        }

        const collectionType = (current.CollectionType ?? "movies")
          .toString()
          .toLowerCase();
        const availableOptions = await fetchLibraryOptionsInfo(
          collectionType,
          false,
        );

        form.reset(buildFormValuesFromLibrary(current, availableOptions));
        setLibrary(current);
        setOriginalName(current.Name || "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load library");
      } finally {
        setDashboardLoading(false);
      }
    };

    loadLibrary();
  }, [form, id, router, setDashboardLoading]);

  async function onSubmit(data: AddLibraryFormValues) {
    if (!library || !id) return;
    setDashboardLoading(true);
    try {
      const libraryOptions = buildLibraryOptions(data);
      const optionsWithPaths = {
        ...libraryOptions,
        PathInfos: data.Paths.map((path) => ({ Path: path })),
      };

      if (originalName && data.Name && data.Name !== originalName) {
        await renameVirtualFolder(originalName, data.Name, true);
      }

      await updateLibraryOptions(id, optionsWithPaths);

      toast.success("Library updated successfully");
      router.push("/dashboard/libraries");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update library");
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
      submitLabel="Save Changes"
      hideGeneralInfoSection
    />
  );
}

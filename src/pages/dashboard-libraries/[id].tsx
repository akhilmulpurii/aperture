import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dashboardLoadingAtom } from "../../lib/atoms";
import {
  AddLibraryFormValues,
  addLibraryFormSchema,
  defaultAddLibraryFormValues,
} from "./add/scheme";
import {
  buildFormValuesFromLibrary,
  buildLibraryOptions,
} from "./add/lib/library-form-helpers";
import { LibraryForm } from "./add/components/library-form";
import { useLibraryLookups } from "./add/lib/use-library-lookups";
import {
  fetchLibraryOptionsInfo,
  fetchVirtualFolders,
  renameVirtualFolder,
  updateLibraryOptions,
} from "../../actions/media";
import { VirtualFolderInfo } from "@jellyfin/sdk/lib/generated-client/models";

export default function EditLibraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
          navigate("/dashboard/libraries");
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
  }, [form, id, navigate, setDashboardLoading]);

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
      navigate("/dashboard/libraries");
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
      onCancel={() => navigate("/dashboard/libraries")}
      submitLabel="Save Changes"
      hideGeneralInfoSection
    />
  );
}

"use client";
import { useFieldArray, useWatch, UseFormReturn } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import {
  CountryInfo,
  CultureDto,
} from "@jellyfin/sdk/lib/generated-client/models";
import { AddLibraryFormValues } from "@/src/form-schemas/libraries/add";
import { GeneralInfoSection } from "./sections/general-info-section";
import { FoldersSection } from "./sections/folders-section";
import { LibrarySettingsSection } from "./sections/library-settings-section";
import { MovieOptionsSection } from "./sections/movie-options-section";
import { MetadataDownloadersSection } from "./sections/metadata-downloaders-section";
import { MetadataSaversSection } from "./sections/metadata-savers-section";
import { ImageFetchersSection } from "./sections/image-fetchers-section";
import { MediaSegmentProvidersSection } from "./sections/media-segment-providers-section";
import { TrickplaySection } from "./sections/trickplay-section";
import { ChapterImagesSection } from "./sections/chapter-images-section";
import { SubtitleDownloadsSection } from "./sections/subtitle-downloads-section";

interface LibraryFormProps {
  form: UseFormReturn<AddLibraryFormValues>;
  cultures: CultureDto[];
  countries: CountryInfo[];
  onSubmit: (data: AddLibraryFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  hideGeneralInfoSection?: boolean;
}

export function LibraryForm({
  form,
  cultures,
  countries,
  onSubmit,
  onCancel,
  submitLabel = "Add Library",
  cancelLabel = "Cancel",
  hideGeneralInfoSection = false,
}: LibraryFormProps) {
  const collectionType = useWatch({
    control: form.control,
    name: "CollectionType",
  });
  const enableEmbeddedTitles = useWatch({
    control: form.control,
    name: "MovieOptions.EnableEmbeddedTitles",
  });

  const {
    fields: pathFields,
    append: appendPath,
    remove: removePath,
  } = useFieldArray({
    control: form.control as any,
    name: "Paths" as any,
  }) as {
    fields: Array<{ id: string }>;
    append: (value: string) => void;
    remove: (index: number) => void;
  };

  return (
    <div className="w-full max-w-3xl space-y-8 pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {!hideGeneralInfoSection && <GeneralInfoSection form={form} />}

          {collectionType && (
            <>
              <FoldersSection
                form={form}
                pathFields={pathFields}
                appendPath={appendPath}
                removePath={removePath}
              />

              <LibrarySettingsSection
                form={form}
                collectionType={collectionType}
                cultures={cultures}
                countries={countries}
              />

              {(collectionType === "movies" ||
                collectionType === "tvshows") && (
                <MovieOptionsSection
                  form={form}
                  collectionType={collectionType}
                  enableEmbeddedTitles={enableEmbeddedTitles}
                />
              )}

              <MetadataDownloadersSection
                form={form}
                collectionType={collectionType}
              />

              <MetadataSaversSection form={form} />

              <ImageFetchersSection
                form={form}
                collectionType={collectionType}
              />

              <MediaSegmentProvidersSection form={form} />

              <TrickplaySection form={form} />

              <ChapterImagesSection form={form} />

              <SubtitleDownloadsSection form={form} cultures={cultures} />
            </>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

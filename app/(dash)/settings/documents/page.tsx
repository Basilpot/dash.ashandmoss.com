"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@repo/ui";
import { EmptyState } from "@repo/ui";
import { Input } from "@repo/ui";
import {
  FileUploadLabel,
  FormSkeleton,
  RemoveBtn,
  SaveBar,
  Section,
  useSiteConfig,
  useUpload,
  type SiteConfig,
} from "@repo/ui";

type DocumentRow = { title: string; key: string; path: string };

function sliceFrom(config: SiteConfig): DocumentRow[] {
  return config.documents;
}

export default function DocumentsPage() {
  const { config, loading, saving, save } = useSiteConfig();
  const { uploadingField, upload } = useUpload();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [synced, setSynced] = useState(false);

  if (config && !synced) {
    setSynced(true);
    setDocuments(sliceFrom(config));
    return <FormSkeleton />;
  }

  if (loading) return <FormSkeleton />;

  const addDocument = () =>
    setDocuments((docs) => [...docs, { title: "", key: "", path: "" }]);

  const update = (i: number, patch: Partial<DocumentRow>) =>
    setDocuments((docs) => docs.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save({ documents });
        }}
      >
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Add the brochures and policy files customers can download from the storefront."
            action={
              <Button type="button" onClick={addDocument}>
                <Plus className="mr-1 size-4" /> Add your first document
              </Button>
            }
          />
        ) : (
        <Section title="Documents">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={doc.title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Title (e.g. Terms & Conditions)"
                className="w-56"
              />
              <Input
                value={doc.path}
                onChange={(e) => update(i, { path: e.target.value })}
                placeholder="File URL"
              />
              <FileUploadLabel
                fieldPath={`doc-${i}`}
                busy={uploadingField === `doc-${i}`}
                accept=".pdf"
                onUpload={(_, file) => upload(`doc-${i}`, file, (key, value) =>
                  update(i, { path: value }),
                )}
              />
              <RemoveBtn
                onClick={() =>
                  setDocuments((docs) => docs.filter((_, j) => j !== i))
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDocument}
          >
            <Plus className="mr-1 h-4 w-4" /> Add document
          </Button>
        </Section>
        )}

        <SaveBar
          saving={saving}
          onDiscard={() => config && setDocuments(sliceFrom(config))}
        />
      </form>
    </>
  );
}

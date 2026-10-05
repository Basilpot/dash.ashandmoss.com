"use client";

import { useState } from "react";
import { Input } from "@repo/ui";
import { Textarea } from "@repo/ui";
import {
  Field,
  FormSkeleton,
  SaveBar,
  Section,
  useSiteConfig,
  type SiteConfig,
} from "@repo/ui";

const SLICE = [
  "name",
  "established",
  "logo",
  "image",
  "description",
  "url",
  "experience",
  "openHours",
] as const;
type Slice = Record<(typeof SLICE)[number], string>;

function pick(c: SiteConfig): Slice {
  return {
    name: c.name,
    established: c.established,
    logo: c.logo,
    image: c.image,
    description: c.description,
    url: c.url,
    experience: c.experience,
    openHours: c.openHours,
  };
}

export default function BrandPage() {
  const { config, loading, saving, save } = useSiteConfig();
  const [values, setValues] = useState<Slice>({
    name: "",
    established: "",
    logo: "",
    image: "",
    description: "",
    url: "",
    experience: "",
    openHours: "",
  });
  const [synced, setSynced] = useState(false);

  if (config && !synced) {
    setSynced(true);
    setValues({
      ...pick(config),
      name: config.name || "",
      logo: config.logo || "",
    });
    return <FormSkeleton />;
  }

  if (loading) return <FormSkeleton />;

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save(values);
  };

  const handleDiscard = () => {
    if (!config) return;
    setValues(pick(config));
  };

  return (
    <form onSubmit={handleSave}>
      <Section title="Brand identity">
          <Field label="Business name">
            <Input
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Tasche"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Established">
              <Input
                value={values.established}
                onChange={(e) => set("established", e.target.value)}
                placeholder="2015"
              />
            </Field>
            <Field label="Tagline">
              <Input
                value={values.experience}
                onChange={(e) => set("experience", e.target.value)}
                placeholder="Custom furniture, cut to your room."
              />
            </Field>
          </div>
      </Section>

      <Section title="Introduction">
          <Field label="Short description">
            <Textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="What makes this business special?"
            />
          </Field>
      </Section>

      <SaveBar saving={saving} onDiscard={handleDiscard} />
    </form>
  );
}

import { ElodyViewers } from "@/generated-types/queries";

const viewerByType: Record<string, ElodyViewers> = {
  image: ElodyViewers.Iiif,
  audio: ElodyViewers.Audio,
  video: ElodyViewers.Video,
  text: ElodyViewers.Text,
};

export const splitMimetype = (
  value: unknown,
): { type: string; subtype: string } => {
  if (typeof value !== "string") return { type: "", subtype: "" };
  const [type = "", subtype = ""] = value
    .toLowerCase()
    .split(";")[0]
    .split("/")
    .map((part) => part.trim());
  return subtype ? { type, subtype } : { type: "", subtype: "" };
};

export const getViewerForMimetype = (
  value: unknown,
): ElodyViewers | undefined => {
  const { type, subtype } = splitMimetype(value);
  if (subtype === "pdf") return ElodyViewers.Pdf;
  return viewerByType[type];
};

import { CommonNoteExtraInfo, NoteData, NoteResource } from "./api.types";
import { ApiFetcher } from "./ApiFetcher";
import {
  NoteContents,
  NoteEntity,
  ResourceEntity,
  TextNode,
  Node,
  NodeWithChildren,
} from "./types";

export function getNoteResources(
  resources: NoteResource[],
  fetcher: ApiFetcher
) {
  return Promise.all(
    resources.map(async (r) =>
      isSupportedResource(r.mimeType)
        ? mapToResourceEntity(
            r,
            await fetcher.getResource(r.fileId, "note_img")
          )
        : mapToResourceEntity(r)
    )
  );
}

function isSupportedResource(mimeType: string) {
  return mimeType.startsWith("image/");
}

function mapToResourceEntity(
  resource: NoteResource,
  data?: ArrayBuffer
): ResourceEntity {
  return {
    fileId: resource.fileId,
    mime: resource.mimeType,
    data,
  };
}

export function mapNoteDataWithResourcesEntityToNoteEntity(
  note: NoteData,
  resources: ResourceEntity[]
): NoteEntity {
  const noteExtraInfo = JSON.parse(note.extraInfo) as CommonNoteExtraInfo;

  return {
    title: noteExtraInfo.title,
    contents: parseNoteContents(note.content, resources),
    resources,
  };
}

export function parseNoteContents(
  contents: string,
  resources: ResourceEntity[]
): NoteContents {
  const noteContents: NoteContents = [];
  let currentNodeContext = noteContents;
  let parentNodeContexts: NoteContents[] = [];
  let nextTagIndex;

  while ((nextTagIndex = contents.indexOf("<")) !== -1) {
    if (nextTagIndex > 0) {
      // Add text before next tag as text node:
      const text = contents.substring(0, nextTagIndex);

      currentNodeContext.push({
        node: "text",
        value: text,
      });

      // Trim the content so we start string from that tag:
      contents = contents.substring(nextTagIndex);
    }

    // Regex perf.: 11 + 3 * n where n is number of chars in 2nd capture group.
    const tagMatch = contents.match(/<([a-zA-Z0-9-]+)\s?(.*?)\/?>/);
    const closingTagMatch = contents.match(/<\/[a-zA-Z0-9-]+>/);

    if (!tagMatch && !closingTagMatch) {
      throw new Error(
        "Parser found tag name but couldn't parse it. That shouldn't happen"
      );
    }

    if (tagMatch) {
      const node = tagMatch[1] as Node["node"];
      const params = getTagParameters(tagMatch[2]);
      const nodesContext: Node[] = [];

      currentNodeContext.push({
        node: node,
        params,
        nodes: nodesContext,
      } as any);

      // Go to nested context:
      parentNodeContexts.push(currentNodeContext);
      currentNodeContext = nodesContext;
      contents = contents.substring(tagMatch[0].length);
    } else if (closingTagMatch) {
      // Go to parent context:
      currentNodeContext = parentNodeContexts.pop()!;

      if (currentNodeContext === undefined) {
        throw new Error(
          "There are more closing tags than opening tags. That shouldn't happen"
        );
      }

      contents = contents.substring(closingTagMatch[0].length);
    }
  }

  if (contents.length > 0) {
    // Put leftover contents into the text tag:
    noteContents.push({
      node: "text",
      value: contents,
    } satisfies TextNode);
  }

  return noteContents;
}

function getTagParameters<T extends object>(paramString: string): T {
  console.log(`'${paramString}'`);

  const matches = [...paramString.matchAll(/([a-zA-Z0-9-]+)(="(.*?)")?/g)];
  const returnObject: Record<string, unknown> = {};

  for (const match of matches) {
    const paramName = match[1];
    let paramValue: unknown = match[3] ?? true;

    if (paramValue === "true") {
      paramValue = true;
    } else if (paramValue === "false") {
      paramValue = false;
    }

    returnObject[paramName] = paramValue;
  }

  return returnObject as T;
}

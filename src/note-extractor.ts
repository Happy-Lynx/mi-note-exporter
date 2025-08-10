import { writeFileSync } from "fs";
import mime from "mime-types";
import { NoteResource } from "./note.types";
import { note } from "./test-data";

function normalizeNoteContent(content: string, resources?: NoteResource[]) {
  const isNewFormat = content.startsWith("<new-format/>");

  if (isNewFormat) {
    // Note: There is difference between note created via phone and via browser - upon editing its contents change
    throw new Error("New format not (yet) supported");
  }

  // Replace Resources in content:
  if (resources) {
    for (const resource of resources) {
      const isImage = resource.mimeType.startsWith("image/");
      const isAudio = resource.mimeType.startsWith("audio/");

      if (!isImage && !isAudio) {
        throw new Error(`Not supported resource type: ${resource.mimeType}`);
      }

      switch (true) {
        case isImage:
          content = content.replaceAll(
            `☺ ${resource.fileId}<0/></>`,
            `<img src="https://us.i.mi.com/file/full?type=note_img&fileid=${resource.fileId}" />`
          );
          break;
        case isAudio:
          content = content.replaceAll(
            `<sound fileid="${resource.fileId}" />`,
            "<i>There is a recording file, but it's not yet supported</i>"
          );
          break;
      }
    }
  }

  return content;
}

async function convertNoteContentToMarkdown(content: string) {
  const fetchResourcesMap = [
    [
      /<img .*?src="(https:\/\/us.i.mi.com\/file\/full\?type=note_img&fileid=(.*?))".*?>/,
      1,
      "![$2]($resourceUrl)",
    ],
  ] as const;

  for (const [regex, resourceKey, replacementRegex] of fetchResourcesMap) {
    let match;

    while ((match = content.match(regex)) !== null) {
      const resourceUrl = await fetchResource(match[resourceKey]);
      const replacement = replacementRegex.replaceAll(
        "$resourceUrl",
        resourceUrl
      );

      content = content.replace(regex, replacement);
    }
  }

  const markdownReplacements = {
    "<b>": "**",
    "</b>": "**",
    "<u>": "_", // Note: No official support for this
    "</u>": "_",
    "<i>": "*",
    "</i>": "*",
    '<input type="checkbox" />': "[ ] ",
    '<input type="checkbox" checked="true" />': "[*] ",
    "<size>": "## ",
    "</size>": "",
    "<mid-size>": "### ",
    "</mid-size>": "",
  };

  for (const key in markdownReplacements) {
    const value =
      markdownReplacements[key as keyof typeof markdownReplacements];

    content = content.replaceAll(key, value);
  }

  return content;
}

async function fetchResource(url: string) {
  const request = await fetch(url, {
    method: "GET",
    headers: {
      Cookie: "serviceToken=you_wish_i_left_something_here",
    },
  });

  const imageData = await request.arrayBuffer();

  const fileId = url.match(/fileid=(.*?)($|&)/)?.[1] ?? Date.now();
  const fileExtension =
    mime.extension(request.headers.get("content-type") ?? "") || "unknown";

  const filePath = `./assets/${fileId}.${fileExtension}`;

  writeFileSync(filePath, Buffer.from(imageData));

  return filePath;
}

(async () => {
  const normalizedContent = normalizeNoteContent(
    note.data.entry.content,
    note.data.entry.setting.data
  );
  const markdownContent = await convertNoteContentToMarkdown(normalizedContent);

  console.log(markdownContent);
})();

import { parseNoteContents } from "./note-fetcher.utils";
import { NoteContents } from "./types";

describe("Note fetcher utils", () => {
  describe("parseNoteContents", () => {
    it("Should parse plain text contents", () => {
      const result = parseNoteContents("test content", []);

      expect(result).toStrictEqual([
        { node: "text", value: "test content" },
      ] satisfies NoteContents);
    });

    it("Should parse text with bold tag", () => {
      const result = parseNoteContents("test <b>content</b> test2", []);

      expect(result).toStrictEqual([
        { node: "text", value: "test " },
        { node: "b", params: {}, nodes: [{ node: "text", value: "content" }] },
        { node: "text", value: " test2" },
      ] satisfies NoteContents);
    });

    it("Should parse text with nested tags", () => {
      const result = parseNoteContents(
        "test <b>some <u>content</u></b> test2",
        []
      );

      expect(result).toStrictEqual([
        { node: "text", value: "test " },
        {
          node: "b",
          params: {},
          nodes: [
            { node: "text", value: "some " },
            {
              node: "u",
              params: {},
              nodes: [{ node: "text", value: "content" }],
            },
          ],
        },
        { node: "text", value: " test2" },
      ] satisfies NoteContents);
    });

    it("Should add params of the tags if there are any", () => {
      const result = parseNoteContents(
        `<b param1="paramValue" param2="true" param3="false" param-4="999" enabled>some content</b>`,
        []
      );

      console.log(result);

      expect(result).toStrictEqual([
        {
          node: "b",
          params: {
            param1: "paramValue",
            param2: true,
            param3: false,
            "param-4": "999",
            enabled: true,
          },
          nodes: [{ node: "text", value: "some content" }],
        },
      ] satisfies NoteContents);
    });
  });
});

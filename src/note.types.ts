enum Color {
  TRANSPARENT = 0,
}

enum Theme {
  IDK_YET = 13,
}

type NoteStatus = "normal";

type NoteType = "note";

export type NoteResource = {
  digest: string;
  mimeType: string;
  fileId: string;
};

export type NoteData = {
  snippet: string;
  modifyDate: number;
  colorId: Color;
  subject: string;
  alertDate: number;
  type: NoteType;
  folderId: number;
  content: string;
  setting: {
    data: NoteResource[];
    themeId: Theme;
    stickyTime: number;
    version: number;
  };
  deleteTime: number;
  alertTag: number;
  id: string; // numeric string
  tag: string; // numeric string
  createDate: number;
  status: NoteStatus;
  extraInfo: string; // '{"note_content_type":"common","mind_content_plain_text":"","title":"Super notatka ","mind_content":""}',
};

export type NoteResponse = {
  result: "ok";
  retriable: boolean;
  code: number;
  data: {
    entry: NoteData;
  };
  description: string;
  ts: number;
};

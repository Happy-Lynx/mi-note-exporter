enum Color {
  TRANSPARENT = 0,
}

enum Theme {
  IDK_YET = 13,
}

type EntityStatus = "normal";

type EntityType = "folder" | "note";

export type NoteResource = {
  digest: string;
  mimeType: string;
  fileId: string;
};

type EntitySetting = {
  data?: NoteResource[];
  themeId: Theme;
  stickyTime: number;
  version: number;
};

export type NoteData = {
  snippet: string;
  modifyDate: number;
  colorId: Color;
  subject: string;
  alertDate: number;
  type: Extract<EntityType, "note">;
  folderId: number;
  content: string;
  setting: EntitySetting;
  deleteTime: number;
  alertTag: number;
  id: string; // numeric string
  tag: string; // numeric string
  createDate: number;
  status: EntityStatus;
  extraInfo: string; // '{"note_content_type":"common","mind_content_plain_text":"","title":"Super notatka ","mind_content":""}',
};

export type CommonNoteExtraInfo = {
  note_content_type: "common";
  mind_content_plain_text: "";
  mind_content: string;
  title: string;
};

export type ApiResponse = {
  result: "ok";
  retriable: boolean;
  code: number;
  data: unknown;
  description: string;
  ts: number;
};

export type NoteDetailsResponse = ApiResponse & {
  data: {
    entry: NoteData;
  };
};

type Folder = {
  snippet: string;
  modifyDate: number;
  colorId: Color;
  subject: string;
  alertDate: number;
  type: Extract<EntityType, "folder">;
  folderId: number;
  setting: EntitySetting;
  deleteTime: number;
  alertTag: number;
  id: string;
  tag: string;
  createDate: number;
  status: EntityStatus;
};

export type NotesInformationsResponse = ApiResponse & {
  data: {
    entries: Omit<NoteData, "content">[];
    folders: Folder[];
    lastPage: boolean;
    syncTag: string;
  };
};

export type ResourceType = "note_img";

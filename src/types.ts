export type ResourceEntity = {
  fileId: string;
  mime: string;
  data?: ArrayBuffer;
};

export type NoteEntity = {
  title: string;
  contents: NoteContents;
  resources: ResourceEntity[];
};

export type NoteContents = Node[];

export type Node = TextNode | BoldNode | UnderlineNode;

export type NodeWithChildren = {
  node: unknown; // Needs to be declared
  nodes: Node[];
  params: object;
};

export type TextNode = {
  node: "text";
  value: string;
};

type BoldNode = NodeWithChildren & {
  node: "b";
};

type UnderlineNode = NodeWithChildren & {
  node: "u";
};

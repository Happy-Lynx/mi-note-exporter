import querystring from "querystring";
import {
  ApiResponse,
  NoteDetailsResponse,
  NotesInformationsResponse,
  ResourceType,
} from "./api.types";
import { APIResponse } from "playwright/test";

type TMethod = "GET" | "POST";

export class ApiFetcher {
  constructor(private readonly token: string) {}

  getNotesInformations(limit: number = 200000) {
    return this.fetchData<NotesInformationsResponse["data"]>(
      "note/full/page",
      "GET",
      {
        limit,
      }
    );
  }

  getNotesDetails(noteId: string) {
    return this.fetchData<NoteDetailsResponse["data"]>(
      `note/note/${noteId}/`,
      "GET",
      {}
    );
  }

  getResource(fileId: string, type: ResourceType = "note_img") {
    return this.fetchData<ArrayBuffer>(
      "file/full",
      "GET",
      {
        type,
        fileid: fileId,
      },
      true
    );
  }

  private async fetchData<
    TResponse extends object = {},
    TData extends querystring.ParsedUrlQueryInput = {}
  >(
    endpoint: string,
    method: TMethod,
    data: TData,
    asBuffer: boolean = false
  ): Promise<TResponse> {
    const queryString =
      method === "GET" ? `?${querystring.stringify(data)}` : "";

    const request = await fetch(
      `https://us.i.mi.com/${endpoint}${queryString}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Cookie: `serviceToken=${this.token}`,
        },
        body: method === "GET" ? undefined : JSON.stringify(data),
      }
    );

    if (!request.ok) {
      throw new Error(`Request failed with code ${request.status}`);
    }

    if (asBuffer) {
      const buffer = await request.arrayBuffer();

      return Buffer.from(buffer) as TResponse;
    } else {
      const response = (await request.json()) as ApiResponse;

      if (response.result === "ok") {
        throw new Error(`Request failed with response code ${response.code}`);
      }

      return response.data as TResponse;
    }
  }
}

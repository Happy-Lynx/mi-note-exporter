import { chromium } from "@playwright/test";
import { waitForEnter } from "./utils";
import { ApiFetcher } from "./ApiFetcher";
import {
  getNoteResources,
  mapNoteDataWithResourcesEntityToNoteEntity,
} from "./note-fetcher.utils";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://us.i.mi.com/note/h5#/");

  await waitForEnter("Sign in to your account and press enter...");

  const cookies = await page.context().cookies("https://us.i.mi.com");
  const token = cookies.find((c) => c.name === "serviceToken")?.value;

  if (!token) {
    console.error("Unable to find user session token");

    return;
  }

  const fetcher = new ApiFetcher(token);

  const notesList = await fetcher.getNotesInformations();

  const foldersList = notesList.folders;

  // @TODO make a queue
  for (const note of notesList.entries) {
    const { entry: noteDetails } = await fetcher.getNotesDetails(note.id);
    const resources = noteDetails.setting.data
      ? await getNoteResources(noteDetails.setting.data, fetcher)
      : [];

    const noteEntity = mapNoteDataWithResourcesEntityToNoteEntity(
      noteDetails,
      resources
    );
  }

  // await browser.close();
}

main().then((data) => console.log(data));

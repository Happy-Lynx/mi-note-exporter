import { chromium } from "@playwright/test";
import { waitForEnter } from "./test-utils";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://us.i.mi.com/note/h5#/");

  await waitForEnter("Sign in to your account and press enter...");

  await browser.close();
}

main().then((data) => console.log(data));

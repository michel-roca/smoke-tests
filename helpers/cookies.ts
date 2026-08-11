import {
  expect,
  Page,
} from '@playwright/test';

async function hideSleakIfPresent(
  page: Page,
): Promise<void> {
  await page
    .addStyleTag({
      content: `
        #sleak-html,
        #sleak-html *,
        .sleak-popup-embed-container {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `,
    })
    .catch(() => {
      /*
       * Geen probleem wanneer de pagina net navigeert.
       */
    });
}

export async function acceptCookiesIfVisible(
  page: Page,
): Promise<void> {
  await hideSleakIfPresent(page);

  const cookieBanner = page
    .locator('.wsa-cookielaw')
    .first();

  const acceptButton = cookieBanner
    .locator(
      'a[href*="/cookielaw/optIn/"]',
    )
    .first();

  /*
   * De cookiebanner wordt soms vertraagd geladen.
   */
  const bannerAppeared = await acceptButton
    .waitFor({
      state: 'visible',
      timeout: 5_000,
    })
    .then(() => true)
    .catch(() => false);

  if (!bannerAppeared) {
    return;
  }

  /*
   * DOM-click bewust gebruikt omdat externe widgets
   * zoals Sleak soms pointer-events onderscheppen.
   */
  await acceptButton.evaluate((element) => {
    (element as HTMLElement).click();
  });

  await page.waitForLoadState(
    'domcontentloaded',
  );

  await expect(
    cookieBanner,
  ).toBeHidden({
    timeout: 15_000,
  });
}
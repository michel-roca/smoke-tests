import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export type CartTexts = {
  addedToCart: RegExp;
  goToCart: RegExp;
};

export type CheckoutTexts = {
  heading: RegExp;
  billingAddress: RegExp;
  shippingMethod: RegExp;
  paymentMethods: RegExp;
};

/*
 * Voert een DOM-click uit.
 *
 * Dit wordt alleen gebruikt voor knoppen die door sticky elementen
 * of configuratorlagen worden onderschept.
 */
export async function clickElementWithDom(
  locator: Locator,
): Promise<void> {
  await expect(locator).toBeVisible();

  await locator.evaluate((element) => {
    (element as HTMLElement).click();
  });
}

/*
 * Controleert de bevestigingsmodal en opent vervolgens de cart.
 */
export async function openCartFromConfirmation(
  page: Page,
  texts: CartTexts,
): Promise<Locator> {
  const confirmationMessage = page
    .getByText(
      texts.addedToCart,
    )
    .first();

  await expect(
    confirmationMessage,
  ).toBeVisible({
    timeout: 15_000,
  });

  const continueToCartButton = page
    .locator(
      'a:visible, button:visible',
    )
    .filter({
      hasText:
        texts.goToCart,
    })
    .first();

  await expect(
    continueToCartButton,
  ).toBeVisible({
    timeout: 15_000,
  });

  await Promise.all([
    page.waitForURL(
      /\/cart\//i,
      {
        timeout: 20_000,
      },
    ),

    continueToCartButton.evaluate((element) => {
      (element as HTMLElement).click();
    }),
  ]);

  await expect(page).toHaveURL(
    /\/cart\//i,
  );

  const cartMain = page
    .locator('main')
    .first();

  await expect(cartMain).toBeVisible({
    timeout: 15_000,
  });

  return cartMain;
}

/*
 * Zoekt de productrij in de cart.
 */
export function getCartProductRow(
  cartMain: Locator,
  productTitle: RegExp,
): Locator {
  return cartMain
    .getByRole('row', {
      name: productTitle,
    })
    .first();
}

/*
 * Controleert of handelingskosten wel of niet aanwezig zijn.
 */
export async function assertHandlingFee(
  cartMain: Locator,
  expected: boolean,
  expectedPrice: RegExp | undefined,
  handlingFeeText: RegExp,
): Promise<void> {
  const handlingFeeRow = cartMain
    .getByRole('row', {
      name: handlingFeeText,
    })
    .first();

  if (!expected) {
    await expect(
      handlingFeeRow,
    ).toHaveCount(0);

    return;
  }

  await expect(
    handlingFeeRow,
  ).toBeVisible({
    timeout: 15_000,
  });

  await expect(
    handlingFeeRow,
  ).toContainText(
    handlingFeeText,
  );

  if (expectedPrice) {
    await expect(
      handlingFeeRow,
    ).toContainText(
      expectedPrice,
    );
  }
}

/*
 * Opent de checkout en controleert of de belangrijkste
 * checkoutonderdelen geladen zijn.
 */
export async function openAndCheckCheckout(
  page: Page,
  cartMain: Locator,
  checkoutButtonSelector: string,
  checkoutTexts: CheckoutTexts,
): Promise<Locator> {
  const checkoutButton = cartMain
    .locator(
      checkoutButtonSelector,
    )
    .first();

  await expect(
    checkoutButton,
  ).toBeVisible({
    timeout: 15_000,
  });

  await Promise.all([
    page.waitForURL(
      /\/checkout\//i,
      {
        waitUntil:
          'domcontentloaded',

        timeout:
          20_000,
      },
    ),

    checkoutButton.click(),
  ]);

  await expect(page).toHaveURL(
    /\/checkout\//i,
  );

  const checkoutMain = page
    .locator('main')
    .first();

  await expect(
    checkoutMain,
  ).toBeVisible({
    timeout: 15_000,
  });

  await expect(
    checkoutMain.getByRole('heading', {
      name:
        checkoutTexts.heading,
    }),
  ).toBeVisible({
    timeout: 15_000,
  });

  await expect(
    checkoutMain,
  ).toContainText(
    checkoutTexts.billingAddress,
  );

  await expect(
    checkoutMain,
  ).toContainText(
    checkoutTexts.shippingMethod,
  );

  await expect(
    checkoutMain,
  ).toContainText(
    checkoutTexts.paymentMethods,
  );

  return checkoutMain;
}

/*
 * Maakt tekst geschikt voor gebruik in een RegExp.
 */
export function escapeRegExp(value: string): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
}
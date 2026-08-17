import {
  test,
  expect,
} from '@playwright/test';

import {
  shops,
} from '../config/shops';

import {
  acceptCookiesIfVisible,
} from '../helpers/cookies';

import {
  assertHandlingFee,
  clickElementWithDom,
  getCartProductRow,
  openAndCheckCheckout,
  openCartFromConfirmation,
} from '../helpers/cart';

import {
  runConfigurator,
} from '../helpers/configurator';

import {
  completeCheckoutUntilSubmitEnabled,
} from '../helpers/checkout';

import {
  expectDataLayerEvent,
  installDataLayerTracker,
} from '../helpers/analytics';

for (const shop of shops) {
  test.describe(
    `${shop.name} smoke tests`,
    () => {

      const configurableProduct =
        shop.testProducts.configurable;

      const standardProduct =
        shop.testProducts.standard;

      if (configurableProduct) {
        test(
          'configurabel testproduct kan worden geconfigureerd en besteld',
          async ({ page }) => {
            const product =
              configurableProduct;

            await test.step(
              'Productpagina openen',
              async () => {
                await page.goto(
                  shop.baseUrl + product.path,
                );

                await acceptCookiesIfVisible(
                  page,
                );

                await expect(
                  page.locator('h1'),
                ).toContainText(
                  product.pageTitle,
                );
              },
            );

            const dataLayerEvents =
              await installDataLayerTracker(page);

            const configurator = page
              .locator(
                shop.selectors.configurator,
              )
              .first();

            await test.step(
              'Alle configuratiestappen doorlopen',
              async () => {
                await expect(
                  configurator,
                ).toBeVisible({
                  timeout: 15_000,
                });

                await runConfigurator(
                  configurator,
                  product.steps,
                );
              },
            );

            await test.step(
              'Product toevoegen aan cart',
              async () => {
                const addToCartButton =
                  page
                    .locator(
                      shop.selectors
                        .addToCartButton,
                    )
                    .first();

                await clickElementWithDom(
                  addToCartButton,
                );
              },
            );

            const cartMain =
              await openCartFromConfirmation(
                page,
                shop.texts.cart,
              );
            
            await test.step(
              'Conversie-event add_to_cart controleren',
              async () => {
                await expectDataLayerEvent(
                  dataLayerEvents,
                  'add_to_cart',
                );
              },
            );

            await test.step(
              'Product en configuratie in cart controleren',
              async () => {
                const productRow =
                  getCartProductRow(
                    cartMain,
                    product.cartTitle,
                  );

                await expect(
                  productRow,
                ).toBeVisible();

                await expect(
                  productRow,
                ).toContainText(
                  product.cartTitle,
                );

                /*
                * Alle verwachte configuratiewaarden controleren:
                *
                * - lengte
                * - RAL-kleur
                * - coating
                * - zaagsnede
                */
                for (
                  const step of product.steps
                ) {
                  await expect(
                    productRow,
                  ).toContainText(
                    step.expectedCartText,
                  );
                }

                /*
                * Prijs alleen controleren wanneer deze
                * in shops.ts is ingesteld.
                */
                if (
                  product.expectedUnitPrice
                ) {
                  await expect(
                    productRow,
                  ).toContainText(
                    product.expectedUnitPrice,
                  );
                }
              },
            );

            await test.step(
              'Cartregels controleren',
              async () => {
                await assertHandlingFee(
                  cartMain,
                  product.expectHandlingFee,
                  product.expectedHandlingFee,
                  shop.texts.handlingFee,
                );
              },
            );

            await test.step(
              'Checkout openen',
              async () => {
                await openAndCheckCheckout(
                  page,
                  cartMain,
                  shop.selectors.checkoutButton,
                  shop.texts.checkout,
                );
              },
            );

            await test.step(
              'Conversie-event begin_checkout controleren',
              async () => {
                await expectDataLayerEvent(
                  dataLayerEvents,
                  'begin_checkout',
                );
              },
            );

          },
        );
      }
      
      if (standardProduct) {
        test(
          'standaard testproduct kan met aangepast aantal aan cart worden toegevoegd',
          async ({ page }) => {
            const product = standardProduct;

            await test.step('Productpagina openen', async () => {
              await page.goto(shop.baseUrl + product.path);
              await acceptCookiesIfVisible(page);

              await expect(page.locator('h1')).toContainText(
                product.pageTitle,
              );
            });

            const dataLayerEvents =
              await installDataLayerTracker(page);

            const variantRow = await test.step(
              'Variantregel zoeken',
              async () => {
                const row = page
                  .locator('main tbody tr:visible')
                  .filter({
                    hasText:
                      product.variantTitle,
                  })
                  .first();

                await expect(
                  row,
                ).toBeVisible({
                  timeout:
                    10_000,
                });

                await expect(
                  row,
                ).toContainText(
                  product.expectedUnitPrice,
                );

                return row;
              },
            );

            await test.step(
              'Aantal van gekozen productvariant aanpassen',
              async () => {
                const quantityInput = variantRow
                  .getByRole('textbox')
                  .last();

                await expect(
                  quantityInput,
                ).toBeVisible({
                  timeout:
                    10_000,
                });

                const increaseButton = variantRow
                  .getByRole('link', {
                    name:
                      /waarde verhogen|wert erhöhen/i,
                  })
                  .first();

                await expect(
                  increaseButton,
                ).toBeVisible({
                  timeout:
                    10_000,
                });

                await quantityInput.scrollIntoViewIfNeeded();

                for (
                  let expectedValue = 1;
                  expectedValue <= product.quantity;
                  expectedValue += 1
                ) {
                  let quantityChanged = false;

                  for (
                    let attempt = 0;
                    attempt < 3;
                    attempt += 1
                  ) {
                    await increaseButton.scrollIntoViewIfNeeded();

                    await increaseButton.click();

                    quantityChanged = await expect
                      .poll(
                        async () =>
                          await quantityInput.inputValue(),
                        {
                          timeout:
                            2_000,
                        },
                      )
                      .toBe(
                        String(expectedValue),
                      )
                      .then(() => true)
                      .catch(() => false);

                    if (quantityChanged) {
                      break;
                    }
                  }

                  await expect(
                    quantityInput,
                  ).toHaveValue(
                    String(expectedValue),
                    {
                      timeout:
                        5_000,
                    },
                  );
                }

                await expect(
                  quantityInput,
                ).toHaveValue(
                  String(product.quantity),
                );

                if (product.expectedCartLinePrice) {
                  await expect(
                    page.locator('main'),
                  ).toContainText(
                    product.expectedCartLinePrice,
                  );
                }
              },
            );

            await test.step(
              'Product toevoegen aan winkelwagen',
              async () => {
                const rowAddToCartButton = variantRow
                  .locator(shop.selectors.addToCartButton)
                  .first();

                const buttonIsInsideVariantRow =
                  await rowAddToCartButton
                    .waitFor({
                      state:
                        'visible',

                      timeout:
                        1_000,
                    })
                    .then(() => true)
                    .catch(() => false);

                const addToCartButton =
                  buttonIsInsideVariantRow
                    ? rowAddToCartButton
                    : page
                        .locator('main')
                        .getByRole('link', {
                          name:
                            /in mijn winkelwagen|in den warenkorb/i,
                        })
                        .first();

                await expect(
                  addToCartButton,
                ).toBeVisible({
                  timeout:
                    10_000,
                });

                await clickElementWithDom(
                  addToCartButton,
                );
              },
            );

            const cartMain =
              await openCartFromConfirmation(
                page,
                shop.texts.cart,
              );
            
            await test.step(
              'Conversie-event add_to_cart controleren',
              async () => {
                await expectDataLayerEvent(
                  dataLayerEvents,
                  'add_to_cart',
                );
              },
            );

            await test.step(
              'Product en aantal in winkelwagen controleren',
              async () => {
                const productRow = getCartProductRow(
                  cartMain,
                  product.cartTitle,
                );

                await expect(productRow).toBeVisible();

                await expect(productRow).toContainText(
                  product.cartTitle,
                );

                const cartQuantityInput = productRow
                  .getByRole('textbox')
                  .first();

                await expect(cartQuantityInput).toHaveValue(
                  String(product.quantity),
                );

                if (product.expectedCartLinePrice) {
                  await expect(productRow).toContainText(
                    product.expectedCartLinePrice,
                  );
                }
              },
            );

            await test.step(
              'Cartregels controleren',
              async () => {
                await assertHandlingFee(
                  cartMain,
                  product.expectHandlingFee,
                  product.expectedHandlingFee,
                  shop.texts.handlingFee,
                );
              },
            );

            const checkoutMain = await test.step(
              'Checkout openen',
              async () => {
                return await openAndCheckCheckout(
                  page,
                  cartMain,
                  shop.selectors.checkoutButton,
                  shop.texts.checkout,
                );
              },
            );

            await test.step(
              'Conversie-event begin_checkout controleren',
              async () => {
                await expectDataLayerEvent(
                  dataLayerEvents,
                  'begin_checkout',
                  20_000,
                );
              },
            );

            await test.step(
              'Checkout kan tot aan actieve bestelknop worden doorlopen',
              async () => {
                await completeCheckoutUntilSubmitEnabled(
                  page,
                  checkoutMain,
                  shop.checkoutFlow.texts,
                  shop.checkoutFlow.customer,
                );
              },
            );

          },
        );
      }
    },
  );
}
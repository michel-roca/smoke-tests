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
  expectDataLayerEvent,
  installDataLayerTracker,
} from '../helpers/analytics';

for (const shop of shops) {
  test.describe(
    `${shop.name} smoke tests`,
    () => {
      test(
        'configurabel testproduct kan worden geconfigureerd en besteld',
        async ({ page }) => {
          const product =
            shop.testProducts.configurable;

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
            'Handelingskosten controleren',
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

      test(
        'standaard testproduct kan met aangepast aantal aan cart worden toegevoegd',
        async ({ page }) => {
          const product = shop.testProducts.standard;

          await test.step('Productpagina openen', async () => {
            await page.goto(shop.baseUrl + product.path);
            await acceptCookiesIfVisible(page);

            await expect(page.locator('h1')).toContainText(
              product.pageTitle,
            );
          });

          const dataLayerEvents =
            await installDataLayerTracker(page);

          await test.step(
            'Aantal van gekozen productvariant aanpassen',
            async () => {
              const variantRow = page
                .getByRole('row', {
                  name: product.variantTitle,
                })
                .first();

              await expect(variantRow).toBeVisible();

              await expect(variantRow).toContainText(
                product.expectedUnitPrice,
              );

              const quantityInput = variantRow
                .getByRole('textbox')
                .first();

              await expect(quantityInput).toBeVisible();

              const increaseButton = variantRow
                .getByRole('link', {
                  name: /waarde verhogen/i,
                })
                .first();

              await expect(increaseButton).toBeVisible();

              for (
                let index = 0;
                index < product.quantity;
                index += 1
              ) {
                await increaseButton.click();
              }

              await expect(quantityInput).toHaveValue(
                String(product.quantity),
              );

              await expect(
                page.locator('main'),
              ).toContainText(
                /€\s*24[,.]00/i,
              );
            },
          );

          await test.step(
            'Product toevoegen aan winkelwagen',
            async () => {
              const addToCartButton = page
                .locator(shop.selectors.addToCartButton)
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
            'Handelingskosten controleren',
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
    },
  );
}
import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export type CheckoutFlowTexts = {
  fields: {
    email: RegExp;
    firstName: RegExp;
    lastName: RegExp;
    postalCode: RegExp;
    houseNumber: RegExp;
    street?: RegExp;
    city?: RegExp;
    phone?: RegExp;
  };

  buttons: {
    continue: RegExp;
    submitOrder: RegExp;
  };

  sections: {
    shippingMethod: RegExp;
    paymentMethod: RegExp;
  };

  terms?: RegExp;
};

export type CheckoutCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  houseNumber: string;
  street?: string;
  city?: string;
  phone?: string;
};

export async function completeCheckoutUntilSubmitEnabled(
  page: Page,
  checkoutMain: Locator,
  texts: CheckoutFlowTexts,
  customer: CheckoutCustomer,
): Promise<void> {
  const billingAddress = checkoutMain
    .getByRole('group', {
      name:
        /factuuradres|rechnungsadresse/i,
    })
    .first();

  await expect(
    billingAddress,
  ).toBeVisible({
    timeout: 20_000,
  });

  await billingAddress
    .getByRole('textbox', {
      name:
        texts.fields.firstName,
    })
    .fill(customer.firstName);

  await billingAddress
    .getByRole('textbox', {
      name:
        texts.fields.lastName,
    })
    .fill(customer.lastName);

  await billingAddress
    .getByRole('textbox', {
      name:
        texts.fields.email,
    })
    .fill(customer.email);

  if (texts.fields.phone && customer.phone) {
    await billingAddress
      .getByRole('textbox', {
        name:
          texts.fields.phone,
      })
      .fill(customer.phone);
  }

  await billingAddress
    .getByRole('textbox', {
      name:
        texts.fields.postalCode,
    })
    .fill(customer.postalCode);

  await billingAddress
    .getByRole('textbox', {
      name:
        texts.fields.houseNumber,
    })
    .fill(customer.houseNumber);

  if (texts.fields.street && customer.street) {
    await billingAddress
      .getByRole('textbox', {
        name:
          texts.fields.street,
      })
      .fill(customer.street);
  }

  if (texts.fields.city && customer.city) {
    await billingAddress
      .getByRole('textbox', {
        name:
          texts.fields.city,
      })
      .fill(customer.city);
  }

    await expect(
    checkoutMain,
  ).toContainText(
    texts.sections.shippingMethod,
    {
      timeout: 20_000,
    },
  );

  const shippingMethod = checkoutMain
    .locator('fieldset, .gui-checkout-steps, main')
    .filter({
      hasText:
        texts.sections.shippingMethod,
    })
    .first()
    .locator('label:visible, a:visible, div:visible')
    .filter({
      hasText:
        /bezorgen|afhalen|verzenden|delivery|pickup|versand|abholung/i,
    })
    .first();

  await expect(
    shippingMethod,
  ).toBeVisible({
    timeout: 20_000,
  });

  await shippingMethod.click();

  await expect(
    checkoutMain,
  ).toContainText(
    texts.sections.paymentMethod,
    {
      timeout: 20_000,
    },
  );

  const paymentMethod = checkoutMain
    .locator('fieldset, .gui-checkout-steps, main')
    .filter({
      hasText:
        texts.sections.paymentMethod,
    })
    .first()
    .locator('label:visible, a:visible, div:visible')
    .filter({
      hasText:
        /ideal|wero|creditcard|bancontact|bankoverschrijving|bank transfer|überweisung|kreditkarte/i,
    })
    .first();

  await expect(
    paymentMethod,
  ).toBeVisible({
    timeout: 20_000,
  });

  await paymentMethod.click();

  const submitOrderButton = checkoutMain
    .getByRole('button', {
      name:
        texts.buttons.submitOrder,
    })
    .first();

  await expect(
    submitOrderButton,
  ).toBeVisible({
    timeout: 20_000,
  });

  await expect(
    submitOrderButton,
  ).toBeEnabled({
    timeout: 20_000,
  });
}

async function clickContinue(
  checkoutMain: Locator,
  continueText: RegExp,
): Promise<void> {
  const continueButton = checkoutMain
    .getByRole('button', {
      name: continueText,
    })
    .first();

  await expect(
    continueButton,
  ).toBeVisible({
    timeout: 15_000,
  });

  await expect(
    continueButton,
  ).toBeEnabled({
    timeout: 15_000,
  });

  await continueButton.click();
}
import type {
  CheckoutCustomer,
  CheckoutFlowTexts,
} from '../helpers/checkout';

export type BaseTestProduct = {
  sku: string;
  path: string;

  pageTitle: RegExp;
  cartTitle: RegExp;

  expectedUnitPrice?: RegExp;
  expectHandlingFee: boolean;
  expectedHandlingFee?: RegExp;
};

export type TextConfiguratorStep = {
  type: 'text';

  /*
   * Tekst waarmee we controleren dat de juiste stap zichtbaar is.
   */
  stepTitle: RegExp;

  /*
   * Accessible name van het invoerveld.
   */
  fieldName: RegExp;

  /*
   * Waarde die in het veld wordt ingevoerd.
   */
  value: string;

  /*
   * Tekst die uiteindelijk in de cart moet staan.
   */
  expectedCartText: RegExp;
};

export type ChoiceConfiguratorStep = {
  type: 'choice';

  stepTitle: RegExp;

  optionText?: RegExp;
  optionSelector?: string;
  optionImageName?: RegExp;

  expectedCartText: RegExp;
};

export type ConfiguratorStep =
  | TextConfiguratorStep
  | ChoiceConfiguratorStep;

export type ConfigurableTestProduct =
  BaseTestProduct & {
    type: 'configurable';

    /*
     * De stappen worden in deze volgorde doorlopen.
     */
    steps: ConfiguratorStep[];
  };

export type StandardTestProduct =
  BaseTestProduct & {
    type: 'standard';
    variantTitle?: RegExp;
    quantity: number;
    expectedUnitPrice: RegExp;
    expectedCartLinePrice?: RegExp;
  };

export type CartPolicy =
  | {
      type: 'handlingFee';
      label: RegExp;
    }
  | {
      type: 'minimumOrderValue';
      minimumAmount: number;
      label: RegExp;
    }
  | {
      type: 'none';
    };

export type ShopConfig = {
  id: string,
  name: string;
  baseUrl: string;
  categoryPath: string;
  cartPath: string;
  
  branch:
    | 'aluminium'
    | 'hout'
    | 'eiken'
    | 'natuursteen'
    | 'leuning'
    | 'staal';
  
  locale:
    | 'nl'
    | 'be'
    | 'de'
    | 'fr';

  cartPolicy: CartPolicy;

  selectors: {
    configurator: string;
    addToCartButton: string;
    standardQuantityInput: string;
    checkoutButton: string;
  };

  texts: {
    configurator: {
      nextStep: RegExp;
    };

    product: {
      increaseQuantity: RegExp;
    };

    cart: {
      addedToCart: RegExp;
      goToCart: RegExp;
    };

    handlingFee: RegExp;

    checkout: {
      heading: RegExp;
      billingAddress: RegExp;
      shippingMethod: RegExp;
      paymentMethods: RegExp;
    };
  };

  checkoutFlow: {
    customer: CheckoutCustomer;
    texts: CheckoutFlowTexts;
  };

  testProducts: {
    configurable?: ConfigurableTestProduct;
    standard?: StandardTestProduct;
  };
};

const allShops: ShopConfig[] = [
  {
    id:
      'aluminiumvakman-nl',

    name:
      'ALUMINIUMvakman.nl',

    baseUrl:
      'https://www.aluminiumvakman.nl',

    categoryPath:
      '/aluminium-profielen/aluminium-hoekprofiel/',

    cartPath:
      '/cart/',

    cartPolicy: {
      type: 'handlingFee',
      label:
        /handelingskosten/i,
    },

    branch:
      'aluminium',

    locale:
      'nl',

    selectors: {
      configurator:
        'main .product-configure-module:visible',

      addToCartButton:
        'main a.add-cart.cart-btn:visible',

      standardQuantityInput:
        'main input[name="quantity"]:visible',

      checkoutButton:
        'a[href*="/checkout"]:visible, a[href*="/cart/checkout"]:visible, a:has-text("Afrekenen"):visible, button:has-text("Afrekenen"):visible',
    },

    texts: {
      configurator: {
        nextStep:
          /volgende stap/i,
      },

      product: {
        increaseQuantity:
          /waarde verhogen/i,
      },

      cart: {
        addedToCart:
          /dit product is toegevoegd aan de winkelwagen/i,
        
        goToCart:
          /^(verder naar bestellen|naar de winkelwagen|bekijk de winkelwagen)$/i,
      },

      handlingFee:
        /handelingskosten/i,
      
      checkout: {
        heading:
          /^bestellen$/i,
        
        billingAddress:
          /factuuradres/i,
        
        shippingMethod:
          /verzendmethode/i,
        
        paymentMethods:
          /betaalmethoden/i,
      },
    },

    checkoutFlow: {
      customer: {
        email:
          'test+playwright@rocaonline.nl',

        firstName:
          'Playwright',

        lastName:
          'Test',

        postalCode:
          '5804AN',

        houseNumber:
          '10',

        street:
          'Teststraat',

        city:
          'Venray',

        phone:
          '0612345678',
      },

      texts: {
        fields: {
          email:
            /^e-?mail:\s*\*?$/i,

          firstName:
            /^voornaam:\s*\*?$/i,

          lastName:
            /^achternaam:\s*\*?$/i,

          postalCode:
            /^postcode:\s*\*?$/i,

          houseNumber:
            /^nr:\s*\*?$|^huisnummer:\s*\*?$/i,

          street:
            /^straatnaam:\s*\*?$|^straat:\s*\*?$/i,

          city:
            /^plaats:\s*\*?$|^woonplaats:\s*\*?$/i,

          phone:
            /^telefoon:\s*\*?$/i,
        },

        buttons: {
          continue:
            /doorgaan|verder|volgende/i,

          submitOrder:
            /kopen|bestelling plaatsen|afrekenen|plaats bestelling/i,
        },

        sections: {
          shippingMethod:
            /verzendmethode/i,

          paymentMethod:
            /betaalmethode|betaalmethoden/i,
        },

        terms:
          /algemene voorwaarden|voorwaarden/i,
      },
    },

    testProducts: {
      configurable: {
        type:
          'configurable',

        sku:
          'hoek-30x30x2-ral9004',

        path:
          '/hoekprofiel-aluminium-30x30x2-mm-zwart.html',

        pageTitle:
          /aluminium hoekprofiel.*30x30x2 mm/i,

        cartTitle:
          /aluminium hoekprofiel.*30x30x2 mm/i,

        /*
         * Zet deze prijs pas vast wanneer de uiteindelijke
         * testconfiguratie en prijs definitief zijn.
         *
         * Bijvoorbeeld:
         * expectedUnitPrice: /€\s*29[,.]90/i,
         */
        expectedUnitPrice:
          /€\s*29[,.]90/i,

        expectHandlingFee:
          true,

        expectedHandlingFee:
          /€\s*17[,.]95/i,

        steps: [
          /*
           * Stap 1 - lengte
           */
          {
            type:
              'text',

            stepTitle:
              /lengte in millimeters/i,

            fieldName:
              /lengte/i,

            value:
              '100',

            expectedCartText:
              /lengte:\s*100/i,
          },

          /*
           * Stap 2 - RAL-kleur
           */
          {
            type:
              'choice',

            stepTitle:
              /kies uw ral kleur/i,

            optionImageName:
              /ral\s+9005/i,

            expectedCartText:
              /ral\s+9005/i,
          },

          /*
           * Stap 3 - coating
           */
          {
            type:
              'choice',

            stepTitle:
              /coating voor binnen of buiten/i,

            optionText:
              /^voor binnen - standaard$/i,

            expectedCartText:
              /voor binnen - standaard/i,
          },

          /*
           * Stap 4 - zaagsnede
           *
           * Door recht afgezaagd te kiezen worden de
           * conditionele verstekstappen niet geopend.
           */
          {
            type:
              'choice',

            stepTitle:
              /kies uw zaagsnede/i,

            optionImageName:
              /^recht afgezaagd \(standaard\)$/i,

            expectedCartText:
              /recht afgezaagd/i,
          },
        ],
      },

      standard: {
        type:
          'standard',

        sku:
          'Lakstift-9016',

        path:
          '/lakstift-tbv-coating-20-ml-lak.html',

        pageTitle:
          /lakstift.*20 ml/i,
        
        cartTitle:
          /lakstift.*20 ml/i,
        
        variantTitle:
          /ral 9005.*gitzwart/i,

        quantity:
          2,

        expectedUnitPrice:
          /€\s*12[,.]00/i,

        expectHandlingFee:
          true,
        
        expectedHandlingFee:
          /€\s*17[,.]95/i,
      },
    },
  },
  {
    id:
      'aluminiumexperte-de',

    name:
      'AluminiumExperte.de',

    baseUrl:
      'https://www.aluminiumexperte.de',

    categoryPath:
      '/aluprofile/aluwinkel/alu-winkelprofil-gleichschenklig/',

    cartPath:
      '/cart/',

    cartPolicy: {
      type: 'handlingFee',
      label:
        /bearbeitungskosten/i,
    },

    branch:
      'aluminium',

    locale:
      'de',

    selectors: {
      configurator:
        'main .product-configure-module:visible',

      addToCartButton:
        'main a.add-cart.cart-btn:visible',

      standardQuantityInput:
        'main input[name="quantity"]:visible',

      checkoutButton:
        'a[href*="/checkout"]:visible, a[href*="/cart/checkout"]:visible, a:has-text("Zur Kasse"):visible, a:has-text("Weiter zur Bestellung"):visible, button:has-text("Zur Kasse"):visible',
    },

    texts: {
      configurator: {
        nextStep:
          /weiter|nächster schritt/i,
      },

      product: {
        increaseQuantity:
          /wert erhöhen|menge erhöhen/i,
      },

      cart: {
        addedToCart:
          /dieses produkt wurde in den warenkorb gelegt|wurde.*warenkorb|zum warenkorb hinzugefügt|in den warenkorb/i,

        goToCart:
          /^(weiter zur bestellung|weiter zur kasse|zum warenkorb|warenkorb ansehen|zur kasse)$/i,
      },

      handlingFee:
        /bearbeitungskosten|mindermengenzuschlag|handlungskosten|mindermenge/i,

      checkout: {
        heading:
          /^(bestellen|kasse)$/i,

        billingAddress:
          /rechnungsadresse/i,

        shippingMethod:
          /versandart|versandmethode/i,

        paymentMethods:
          /zahlungsart|zahlungsmethoden|zahlungsweisen/i,
      },
    },

    checkoutFlow: {
      customer: {
        email:
          'test+playwright@rocaonline.nl',

        firstName:
          'Playwright',

        lastName:
          'Test',

        postalCode:
          '47533',

        houseNumber:
          '10',

        street:
          'Teststraße',

        city:
          'Kleve',

        phone:
          '015123456789',
      },

      texts: {
        fields: {
          email:
            /^e-mail:\s*\*?$/i,

          firstName:
            /^vorname:\s*\*?$/i,

          lastName:
            /^nachname:\s*\*?$/i,

          postalCode:
            /^postleitzahl:\s*\*?$|^plz:\s*\*?$/i,

          houseNumber:
            /^nr:\s*\*?$|^hausnummer:\s*\*?$/i,

          street:
            /^straßenname:\s*\*?$|^strassenname:\s*\*?$|^straße:\s*\*?$|^strasse:\s*\*?$/i,

          city:
            /^ort:\s*\*?$|^stadt:\s*\*?$/i,

          phone:
            /^telefon:\s*\*?$/i,
        },

        buttons: {
          continue:
            /weiter|fortfahren/i,

          submitOrder:
            /zahlungspflichtig bestellen|bestellung abschließen|kaufen/i,
        },

        sections: {
          shippingMethod:
            /versandart|versandmethode/i,

          paymentMethod:
            /zahlungsart|zahlungsmethode|zahlungsweise/i,
        },

        terms:
          /allgemeine geschäftsbedingungen|agb/i,
      },
    },

    testProducts: {
      configurable: {
        type:
          'configurable',

        sku:
          'hoek-30x30x2-ral9004',

        path:
          '/alu-winkelprofil-schwarz-30-x-30-x-2-mm.html',

        pageTitle:
          /alu winkelprofil.*30\s*x\s*30\s*x\s*2\s*mm/i,

        cartTitle:
          /alu winkelprofil.*30\s*x\s*30\s*x\s*2\s*mm/i,

        expectedUnitPrice:
          /29[,.]90\s*€/i,

        expectHandlingFee:
          true,

        expectedHandlingFee:
          /17[,.]95\s*€/i,

        steps: [
          {
            type:
              'text',

            stepTitle:
              /länge/i,

            fieldName:
              /länge/i,

            value:
              '100',

            expectedCartText:
              /länge:\s*100/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /ral|farbe/i,

            optionImageName:
              /ral\s+9005/i,

            expectedCartText:
              /ral\s+9005/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /beschichtung|innen|außen/i,

            optionText:
              /innen|standard/i,

            expectedCartText:
              /innen|standard/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /schnittoption|schnitt/i,

            optionImageName:
              /^gerade \(standard\)$/i,

            expectedCartText:
              /gerade \(standard\)|gerade/i,
          },
        ],
      },

      standard: {
        type:
          'standard',

        sku:
          'Lakstift-9016',

        path:
          '/lackstift-zum-pulverbeschichtung-20-ml-lack.html',

        pageTitle:
          /lackstift.*20 ml/i,

        cartTitle:
          /lackstift.*20 ml/i,

        variantTitle:
          /ral\s*9005.*schwarz/i,

        quantity:
          2,

        expectedUnitPrice:
          /12[,.]00\s*€/i,

        expectHandlingFee:
          true,

        expectedHandlingFee:
          /17[,.]95\s*€/i,
      },
    },
  },
  {
    id:
      'houtvakman-nl',
    
    name:
      'HOUTvakman.nl',
    
    baseUrl:
      'https://www.houtvakman.nl',
    
    categoryPath:
      '/eiken/',
    
    cartPath:
      '/cart/',
    
    branch:
      'hout',
    
    locale:
      'nl',
    
    cartPolicy: {
      type:
        'minimumOrderValue',
      
      minimumAmount:
        150,
      
      label:
        /minimale orderwaarde|minimale bestelwaarde/i,
    },

    selectors: {
      configurator:
        'main',

      addToCartButton:
        'main a:visible, main button:visible',

      standardQuantityInput:
        'input',

      checkoutButton:
        'a:has-text("Bestellen"), a:has-text("Afrekenen"), a:has-text("Naar checkout"), a:has-text("Bestelling afronden")',
    },

    texts: {
      configurator: {
        nextStep:
          /volgende stap/i,
      },

      product: {
        increaseQuantity:
          /waarde verhogen/i,
      },

      cart: {
        addedToCart:
          /dit product is toegevoegd aan de winkelwagen|toegevoegd aan uw winkelwagen|toegevoegd aan de winkelwagen/i,

        goToCart:
          /ga naar winkelwagen|verder naar bestellen|naar de winkelwagen|bekijk de winkelwagen/i,
      },

      handlingFee:
        /handelingskosten/i,

      checkout: {
        heading:
          /^bestellen$/i,
        
        billingAddress:
          /factuuradres/i,
        
        shippingMethod:
          /verzendmethode/i,
        
        paymentMethods:
          /betaalmethoden/i,
      },
    },

    checkoutFlow: {
      customer: {
        email:
          'test+playwright@rocaonline.nl',
        
        firstName:
          'Playwright',
        
        lastName:
          'Test',
        
        postalCode:
          '5804AN',
        
        houseNumber:
          '10',

        street:
          'Nieuwhuisweg',
        
        city:
          'Venray',

        phone:
          ',06123456789',
      },

      texts: {
        fields: {
          email:
            /^e-?mail:\s*\*?$/i,

          firstName:
            /^voornaam:\s*\*?$/i,

          lastName:
            /^achternaam:\s*\*?$/i,

          postalCode:
            /^postcode:\s*\*?$/i,

          houseNumber:
            /^nr:\s*\*?$|^huisnummer:\s*\*?$/i,

          street:
            /^straatnaam:\s*\*?$|^straat:\s*\*?$/i,

          city:
            /^plaats:\s*\*?$|^woonplaats:\s*\*?$/i,

          phone:
            /^telefoon:\s*\*?$/i,
        },

        buttons: {
          continue:
            /doorgaan|verder|volgende/i,

          submitOrder:
            /kopen|bestelling plaatsen|afrekenen|plaats bestelling/i,
        },

        sections: {
          shippingMethod:
            /verzendmethode/i,

          paymentMethod:
            /betaalmethode|betaalmethoden/i,
        },

        terms:
          /algemene voorwaarden|voorwaarden/i,
      },
    },

    testProducts: {
      configurable: {
        type:
          'configurable',

        sku:
          'eiken-blad-op-maat-4-cm-1-laags-brede-lamellen-rustiek',        

        path:
          '/eiken-blad-op-maat-4-cm-dik-1-laags-bred-148477431.html',

        pageTitle:
          /eiken blad.*op maat.*4 cm.*brede lamellen.*rustiek/i,

        cartTitle:
          /eiken blad.*op maat.*4 cm.*rustiek/i,

        expectedUnitPrice:
          /[0-9]+[,.][0-9]{2}/i,

        expectHandlingFee:
          false,

        steps: [
          {
            type:
              'choice',

            stepTitle:
              /lengte/i,

            optionText:
              /160\s*cm/i,

            expectedCartText:
              /lengte:\s*160\b/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /breedte/i,

            optionText:
              /80\s*cm/i,

            expectedCartText:
              /breedte:\s*80\b/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /noesten gevuld/i,

            optionText:
              /noesten open laten|open laten/i,

            expectedCartText:
              /noesten.*open|open laten/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /geschuurd|opgeborsteld/i,

            optionText:
              /geschuurd|standaard/i,

            expectedCartText:
              /geschuurd|standaard/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /inclusief behandeling/i,

            optionImageName:
              /^nee$/i,

            expectedCartText:
              /behandeling.*nee|inclusief behandeling.*nee|\bnee\b/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /speciale.*randen|hoeken/i,

            optionText:
              /geen|standaard|rechte randen/i,

            expectedCartText:
              /geen|standaard|rechte randen/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /afgeschuinde randen/i,

            optionText:
              /scherpe randen/i,

            expectedCartText:
              /scherpe randen/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /staalprofielen/i,

            optionText:
              /nee|zonder|geen/i,

            expectedCartText:
              /nee|zonder|geen/i,
          },
        ],
      },

      standard: {
        sku:
          'oude-eiken-balk-140x140-mm-geborsteld-ad',
        
        type:
          'standard',

        path:
          '/oude-eiken-balk-140x140-mm-geborsteld-ad.html',

        pageTitle:
          /oude eiken balk.*140x140 mm.*geborsteld/i,

        variantTitle:
           /250\s*cm/i,

        cartTitle:
          /oude eiken balk.*140x140 mm.*geborsteld/i,

        quantity:
          2,

        expectedUnitPrice:
          /€\s*190,60|190,60/i,

        expectedCartLinePrice:
          /€\s*381,20|381,20/i,

        expectHandlingFee:
          false,
      },
    },
  },
  {
    id:
      'houtvakman-be',
    
    name:
      'HOUTvakman.be',
    
    baseUrl:
      'https://www.houtvakman.be',
    
    categoryPath:
      '/eiken/',
    
    cartPath:
      '/cart/',
    
    branch:
      'hout',
    
    locale:
      'be',
    
    cartPolicy: {
      type:
        'minimumOrderValue',
      
      minimumAmount:
        150,
      
      label:
        /minimale orderwaarde|minimale bestelwaarde/i,
    },

    selectors: {
      configurator:
        'main',

      addToCartButton:
        'main a:visible, main button:visible',

      standardQuantityInput:
        'input',

      checkoutButton:
        'a:has-text("Bestellen"), a:has-text("Afrekenen"), a:has-text("Naar checkout"), a:has-text("Bestelling afronden")',
    },

    texts: {
      configurator: {
        nextStep:
          /volgende stap/i,
      },

      product: {
        increaseQuantity:
          /waarde verhogen/i,
      },

      cart: {
        addedToCart:
          /dit product is toegevoegd aan de winkelwagen|toegevoegd aan uw winkelwagen|toegevoegd aan de winkelwagen/i,

        goToCart:
          /ga naar winkelwagen|verder naar bestellen|naar de winkelwagen|bekijk de winkelwagen/i,
      },

      handlingFee:
        /handelingskosten/i,

      checkout: {
        heading:
          /^bestellen$/i,
        
        billingAddress:
          /factuuradres/i,
        
        shippingMethod:
          /verzendmethode/i,
        
        paymentMethods:
          /betaalmethoden/i,
      },
    },

    checkoutFlow: {
      customer: {
        email:
          'test+playwright@rocaonline.nl',
        
        firstName:
          'Playwright',
        
        lastName:
          'Test',
        
        postalCode:
          '2000',
        
        houseNumber:
          '1',

        street:
          'Meir',
        
        city:
          'Antwerpen',

        phone:
          ',0470123456',
      },

      texts: {
        fields: {
          email:
            /^e-?mail:\s*\*?$/i,

          firstName:
            /^voornaam:\s*\*?$/i,

          lastName:
            /^achternaam:\s*\*?$/i,

          postalCode:
            /^postcode:\s*\*?$/i,

          houseNumber:
            /^nr:\s*\*?$|^huisnummer:\s*\*?$/i,

          street:
            /^straatnaam:\s*\*?$|^straat:\s*\*?$/i,

          city:
            /^plaats:\s*\*?$|^woonplaats:\s*\*?$/i,

          phone:
            /^telefoon:\s*\*?$/i,
        },

        buttons: {
          continue:
            /doorgaan|verder|volgende/i,

          submitOrder:
            /kopen|bestelling plaatsen|afrekenen|plaats bestelling/i,
        },

        sections: {
          shippingMethod:
            /verzendmethode/i,

          paymentMethod:
            /betaalmethode|betaalmethoden/i,
        },

        terms:
          /algemene voorwaarden|voorwaarden/i,
      },
    },

    testProducts: {
      configurable: {
        type:
          'configurable',

        sku:
          'eiken-blad-op-maat-foutvrij-eikenhout-brede-lamellen-27-cm',        

        path:
          '/eiken-blad-op-maat-foutvrij-eikenhout-br-148538514.html',

        pageTitle:
          /eiken blad.*op maat.*foutvrij eikenhout.*2,7 cm.*brede lamellen/i,

        cartTitle:
          /eiken blad.*op maat.*foutvrij eikenhout.*brede lamellen/i,

        expectedUnitPrice:
          /[0-9]+[,.][0-9]{2}/i,

        expectHandlingFee:
          false,

        steps: [
          {
            type:
              'choice',

            stepTitle:
              /lengte/i,

            optionText:
              /160\s*cm/i,

            expectedCartText:
              /lengte:\s*160\b/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /breedte/i,

            optionText:
              /80\s*cm/i,

            expectedCartText:
              /breedte:\s*80\b/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /geschuurd|opgeborsteld/i,

            optionText:
              /geschuurd|standaard/i,

            expectedCartText:
              /geschuurd|standaard/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /inclusief behandeling/i,

            optionImageName:
              /^nee$/i,

            expectedCartText:
              /behandeling.*nee|inclusief behandeling.*nee|\bnee\b/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /speciale.*randen|hoeken/i,

            optionText:
              /geen|standaard|rechte randen/i,

            expectedCartText:
              /geen|standaard|rechte randen/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /afgeschuinde randen/i,

            optionText:
              /scherpe randen/i,

            expectedCartText:
              /scherpe randen/i,
          },

          {
            type:
              'choice',

            stepTitle:
              /staalprofielen/i,

            optionText:
              /nee|zonder|geen/i,

            expectedCartText:
              /nee|zonder|geen/i,
          },
        ],
      },

      /*standard: {
        sku:
          'oude-eiken-balk-140x140-mm-geborsteld-ad',
        
        type:
          'standard',

        path:
          '/oude-eiken-balk-140x140-mm-geborsteld-ad.html',

        pageTitle:
          /oude eiken balk.*140x140 mm.*geborsteld/i,

        variantTitle:
           /250\s*cm/i,

        cartTitle:
          /oude eiken balk.*140x140 mm.*geborsteld/i,

        quantity:
          2,

        expectedUnitPrice:
          /€\s*190,60|190,60/i,

        expectedCartLinePrice:
          /€\s*381,20|381,20/i,

        expectHandlingFee:
          false,
      },*/
    },
  },
];

const selectedShop =
  process.env.SHOP;

export const shops =
  selectedShop 
    ? allShops.filter(
      (shop) =>
        shop.id === selectedShop
    )
  : allShops;

if (
  selectedShop &&
  shops.length === 0
) {
  throw new Error(
    `Geen shopconfig gevonden voor SHOP="${selectedShop}".`,
  );
}
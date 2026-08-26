# Lightspeed smoke tests

Deze repository bevat Playwright smoke tests voor de Lightspeed webshops van Roca Online.

De tests controleren per shop minimaal de belangrijkste aankoopflow:

1. productpagina openen;
2. product configureren of standaardproduct selecteren;
3. product toevoegen aan de winkelwagen;
4. winkelwagen controleren;
5. checkout openen;
6. checkout invullen tot aan de actieve bestelknop.

De tests plaatsen geen echte bestelling.

## Shopselectie

Een shop wordt lokaal gekozen met de `SHOP` environment variable.

```bash
SHOP=eikenvakman-be npx playwright test tests/lightspeed-smoke.spec.ts --project=chromium --workers=1
```

Voor een headed run:

```bash
SHOP=eikenvakman-be npx playwright test tests/lightspeed-smoke.spec.ts --project=chromium --headed --workers=1
```

TypeScript controleren:

```bash
npx tsc -p tsconfig.json --noEmit
```

## Configuratie per shop

Alle shop-specifieke instellingen staan in:

```text
config/shops.ts
```

Daarin staan onder andere:

- shop ID;
- basis-URL;
- taal/locale;
- selectors;
- checkoutteksten;
- testproducten;
- cart policy.

`config/shops.ts` is de bron van waarheid voor de actuele shoplogica.

## Testproducten

Per shop kunnen twee soorten testproducten worden ingesteld:

```ts
testProducts: {
  configurable: {
    // configureerbaar product
  },

  standard: {
    // standaardproduct
  },
}
```

### Configureerbaar product

Een configureerbaar product doorloopt de configurator stap voor stap. Per stap wordt vastgelegd welke optie gekozen moet worden en welke tekst later in de winkelwagen verwacht wordt.

Voorbeelden van configuratorstappen:

```ts
{
  type: 'text',
  stepTitle: /afmeting/i,
  fieldName: /aantal/i,
  inputIndex: 0,
  value: '240',
  expectedCartText: /lengte:\s*240\b/i,
  advanceAfter: false,
}
```

```ts
{
  type: 'choice',
  stepTitle: /behandeld/i,
  optionImageName: /white.*olie|olie.*white/i,
  expectedCartText: /white.*olie|olie.*white/i,
}
```

Gebruik `advanceAfter: false` alleen wanneer meerdere invoervelden of opties binnen dezelfde actieve configuratorstap zitten.

### Standaardproduct

Een standaardproduct is direct bestelbaar en heeft geen volledige configuratorflow.

Voor standaardproducten zonder varianttabel wordt geen `variantTitle` gebruikt. Deze producten worden getest met `quantity: 1`.

```ts
standard: {
  sku: 'x-tafelpoten-zwart-metaal-10x10-cm-breedte-78-cm-h',
  type: 'standard',
  path: '/x-tafelpoten-zwart-metaal-10x10-cm-breedte-78-cm-h.html',
  pageTitle: /x[- ]?tafelpoten.*zwart.*set.*metaal.*10x10 cm.*78 cm.*72 cm/i,
  cartTitle: /x[- ]?tafelpoten.*zwart.*set|x[- ]?tafelpoten.*zwart.*metaal/i,
  quantity: 1,
  expectedUnitPrice: /161[,.]60/i,
  expectedCartLinePrice: /161[,.]60/i,
  expectHandlingFee: false,
}
```

## Cart policies per shop

Niet iedere shop gebruikt dezelfde winkelwagenregels. Sommige shops rekenen handelingskosten bij een lage orderwaarde, sommige shops werken met een minimale orderwaarde en andere shops hebben geen extra cart policy.

De smoke tests houden hier per shop rekening mee via `cartPolicy` in `config/shops.ts`.

Ondersteunde cart policies:

```ts
cartPolicy: {
  type: 'none',
}
```

Gebruik dit voor shops zonder handelingskosten en zonder minimale orderwaarde.

```ts
cartPolicy: {
  type: 'handlingFee',
  label: /handelingskosten/i,
}
```

Gebruik dit voor shops waarbij handelingskosten als aparte cartregel kunnen verschijnen. Per testproduct wordt met `expectHandlingFee` bepaald of deze kosten wel of niet verwacht worden.

```ts
cartPolicy: {
  type: 'minimumOrderValue',
  minimumAmount: 150,
  label: /minimale orderwaarde|minimale bestelwaarde/i,
}
```

Gebruik dit voor shops waarbij een minimale orderwaarde geldt in plaats van handelingskosten.

Bij het toevoegen van een nieuwe shop moet altijd eerst worden gecontroleerd welke cart policy van toepassing is. Kies daarnaast testproducten bewust boven of onder relevante grensbedragen, zodat de cartcontrole voorspelbaar blijft.

## Huidige shopstatus

| Shop | Configurabel | Standaard | Cart policy | Nightly |
|---|---:|---:|---|---:|
| ALUMINIUMvakman.nl | ✅ | ✅ | Handelingskosten | ✅ |
| ALUMINIUMvakman.de | ✅ | ✅ | Handelingskosten | ✅ |
| HOUTvakman.nl | ✅ | ✅ | Minimale orderwaarde | ✅ |
| HOUTvakman.be | ✅ | ✅ | Minimale orderwaarde | ✅ |
| EIKENvakman.nl | ✅ | ✅ | Geen | ✅ |
| EIKENvakman.be | ✅ | ✅ | Geen | ✅ |

## Aanpak bij nieuwe shops

Voeg nieuwe shops bij voorkeur stapsgewijs toe.

Aanbevolen workflow:

1. nieuwe branch vanaf `main`;
2. shopconfig toevoegen;
3. configurabel testproduct toevoegen;
4. lokaal testen;
5. handmatige GitHub Action draaien;
6. PR maken en mergen;
7. standaardproduct toevoegen;
8. opnieuw lokaal en via GitHub Actions testen;
9. pas daarna toevoegen aan de nightly workflow.

Voor eenvoudige shops kunnen configurabel en standaard eventueel in één branch, maar bij nieuwe of afwijkende flows is opsplitsen overzichtelijker.

## Lokale checks voor commit

Gebruik voor iedere wijziging minimaal:

```bash
git status
npx tsc -p tsconfig.json --noEmit
SHOP=<shop-id> npx playwright test tests/lightspeed-smoke.spec.ts --project=chromium --workers=1
```

Voorbeeld:

```bash
SHOP=eikenvakman-be npx playwright test tests/lightspeed-smoke.spec.ts --project=chromium --workers=1
```

## Git workflow

Nieuwe branch maken:

```bash
git checkout main
git pull
git checkout -b add-shop-name-smoke-tests
```

Committen:

```bash
git status
git add config/shops.ts
git commit -m "Add shop name smoke test"
git push -u origin add-shop-name-smoke-tests
```

Na merge lokaal opschonen:

```bash
git checkout main
git pull
git status
git branch -d add-shop-name-smoke-tests
git push origin --delete add-shop-name-smoke-tests
git fetch --prune
```

`git fetch --prune` verwijdert lokale verwijzingen naar remote branches die op GitHub niet meer bestaan. Het verwijdert geen lokale commits of bestanden.

## Playwright reports en artifacts

Om artifacts compact te houden, staan video en screenshots bij voorkeur uit. Traces blijven nuttig voor debugging bij failures.

Aanbevolen Playwright-instelling:

```ts
use: {
  trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  video: 'off',
  screenshot: 'off',
}
```

Let op: Playwright kan bij failures een groot `error-context.md` bestand genereren. Dat bestand kan veel groter worden wanneer productafbeeldingen als `data:image` in de snapshot terechtkomen.

In GitHub Actions kan dit vóór artifact upload worden opgeschoond:

```yaml
- name: Remove bulky Playwright error context
  if: always()
  run: |
    find test-results -name "error-context.md" -delete || true
    find playwright-report -type f -name "*.md" -size +200k -delete || true
```

## Volgende shops

Na de EIKEN-shops is de volgende logische kandidaat:

```text
Eichenholzprofi.de
```

Daarna volgen onder andere:

- natuursteenvakman.nl;
- composietvakman.be;
- kompositprofi.de;
- rvsvakman.nl;
- inoxvakman.be;
- handlaufexperte.de;
- artisanmaincourante.fr;
- holzhandelonline.de.

`holzhandelonline.de` wordt vermoedelijk pas later toegevoegd, omdat deze shop eerst naar een andere codebase verhuist.
import {
  expect,
  Page,
} from '@playwright/test';

export type TrackedDataLayerEvent = {
  event: string;
  payload: unknown;
  url: string;
  timestamp: string;
};

type WindowWithDataLayer = Window & {
  dataLayer?: unknown[];
  __rocaDataLayerTrackerInstalled?: boolean;
  __rocaTrackDataLayerEvent?: (
    payload: TrackedDataLayerEvent,
  ) => void;
};

function installTrackerInBrowser(): void {
  const win =
    window as WindowWithDataLayer;

  win.dataLayer =
    win.dataLayer || [];

  const dataLayer =
    win.dataLayer;

  const report = (
    item: unknown,
  ): void => {
    if (
      !item ||
      typeof item !== 'object'
    ) {
      return;
    }

    const eventName = (
      item as {
        event?: unknown;
      }
    ).event;

    if (
      typeof eventName !== 'string'
    ) {
      return;
    }

    win.__rocaTrackDataLayerEvent?.({
      event:
        eventName,

      payload:
        item,

      url:
        win.location.href,

      timestamp:
        new Date()
          .toISOString(),
    });
  };

  /*
   * Bestaande dataLayer-events ook meenemen.
   */
  dataLayer.forEach(report);

  if (
    win.__rocaDataLayerTrackerInstalled
  ) {
    return;
  }

  const originalPush =
    dataLayer.push.bind(
      dataLayer,
    );

  dataLayer.push = (
    ...items: unknown[]
  ): number => {
    items.forEach(report);

    return originalPush(
      ...items,
    );
  };

  win.__rocaDataLayerTrackerInstalled =
    true;
}

export async function installDataLayerTracker(
  page: Page,
): Promise<TrackedDataLayerEvent[]> {
  const events:
    TrackedDataLayerEvent[] = [];

  await page.exposeFunction(
    '__rocaTrackDataLayerEvent',
    (
      payload:
        TrackedDataLayerEvent,
    ) => {
      events.push(payload);
    },
  );

  /*
   * Voor toekomstige navigaties.
   */
  await page.addInitScript(
    installTrackerInBrowser,
  );

  /*
   * Voor de pagina waarop de test al staat.
   */
  await page
    .evaluate(
      installTrackerInBrowser,
    )
    .catch(() => {
      /*
       * Geen probleem wanneer de pagina
       * net navigeert of nog niet klaar is.
       */
    });

  return events;
}

export async function expectDataLayerEvent(
  events: TrackedDataLayerEvent[],
  eventName: string,
  timeout = 10_000,
): Promise<void> {
  await expect
    .poll(
      () =>
        events.some(
          (event) =>
            event.event ===
            eventName,
        ),
      {
        timeout,
        message:
          `DataLayer event "${eventName}" niet gevonden.`,
      },
    )
    .toBe(true);
}

export function getDataLayerEvents(
  events: TrackedDataLayerEvent[],
  eventName: string,
): TrackedDataLayerEvent[] {
  return events.filter(
    (event) =>
      event.event === eventName,
  );
}
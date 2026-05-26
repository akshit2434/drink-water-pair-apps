type PushTicket =
  | { status: 'ok'; id?: string }
  | { status: 'error'; message?: string; details?: { error?: string } };

type ExpoPushResponse = {
  data?: PushTicket | PushTicket[];
  errors?: Array<{ message?: string }>;
};

export type SendPushResult =
  | { status: 'sent'; ticketId?: string }
  | { status: 'failed'; reason: string };

export type SendDrinkWaterPushOptions = {
  token: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function sendDrinkWaterPush({
  token,
  fetcher = fetch,
  timeoutMs = 10000,
}: SendDrinkWaterPushOptions): Promise<SendPushResult> {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    return { status: 'failed', reason: 'Receiver token is missing.' };
  }

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out.')), timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetcher(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: trimmedToken,
          title: 'Drink water',
          body: 'Time for water.',
          sound: 'default',
          priority: 'high',
          channelId: 'water-reminders',
          data: { kind: 'drink-water' },
        }),
      }),
      timeout,
    ]);

    if (!response.ok) {
      return { status: 'failed', reason: `Expo request failed (${response.status}).` };
    }

    const payload = (await response.json()) as ExpoPushResponse;
    const firstTicket = Array.isArray(payload.data) ? payload.data[0] : payload.data;

    if (firstTicket?.status === 'ok') {
      return { status: 'sent', ticketId: firstTicket.id };
    }

    const reason =
      firstTicket?.status === 'error'
        ? firstTicket.message ?? firstTicket.details?.error ?? 'Expo rejected the notification.'
        : payload.errors?.[0]?.message ?? 'Expo did not return a ticket.';

    return { status: 'failed', reason };
  } catch (error) {
    return {
      status: 'failed',
      reason: error instanceof Error ? error.message : 'Could not send notification.',
    };
  }
}

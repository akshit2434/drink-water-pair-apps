import { sendDrinkWaterPush } from '../src/sendPush';

describe('sendDrinkWaterPush', () => {
  it('returns sent when Expo accepts a single notification ticket object', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { status: 'ok', id: 'ticket-single' },
      }),
    });

    const result = await sendDrinkWaterPush({
      token: 'ExponentPushToken[abc]',
      fetcher,
      timeoutMs: 1000,
    });

    expect(result).toEqual({ status: 'sent', ticketId: 'ticket-single' });
  });

  it('returns sent when Expo accepts the notification ticket', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ status: 'ok', id: 'ticket-1' }],
      }),
    });

    const result = await sendDrinkWaterPush({
      token: 'ExponentPushToken[abc]',
      fetcher,
      timeoutMs: 1000,
    });

    expect(result).toEqual({ status: 'sent', ticketId: 'ticket-1' });
    expect(fetcher).toHaveBeenCalledWith(
      'https://exp.host/--/api/v2/push/send',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      }),
    );
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body).toMatchObject({
      to: 'ExponentPushToken[abc]',
      title: 'Drink water',
      body: 'Time for water.',
      priority: 'high',
      channelId: 'water-reminders',
    });
  });

  it('returns failed when the receiver token is blank', async () => {
    const result = await sendDrinkWaterPush({
      token: '   ',
      fetcher: jest.fn(),
      timeoutMs: 1000,
    });

    expect(result).toEqual({
      status: 'failed',
      reason: 'Receiver token is missing.',
    });
  });

  it('returns failed when Expo rejects the ticket', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ status: 'error', message: 'DeviceNotRegistered' }],
      }),
    });

    const result = await sendDrinkWaterPush({
      token: 'ExponentPushToken[old]',
      fetcher,
      timeoutMs: 1000,
    });

    expect(result).toEqual({
      status: 'failed',
      reason: 'DeviceNotRegistered',
    });
  });

  it('returns failed when the network request throws', async () => {
    const result = await sendDrinkWaterPush({
      token: 'ExponentPushToken[abc]',
      fetcher: jest.fn().mockRejectedValue(new Error('Network down')),
      timeoutMs: 1000,
    });

    expect(result).toEqual({ status: 'failed', reason: 'Network down' });
  });
});

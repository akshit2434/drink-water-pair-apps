import { getVariantConfig } from '../src/variant';

describe('getVariantConfig', () => {
  it('selects the sender app metadata', () => {
    expect(getVariantConfig('sender')).toMatchObject({
      variant: 'sender',
      name: 'Drink Water Button',
      packageName: 'dev.drinkwater.sender',
    });
  });

  it('selects the receiver app metadata', () => {
    expect(getVariantConfig('receiver')).toMatchObject({
      variant: 'receiver',
      name: 'Drink Water Reminder',
      packageName: 'dev.drinkwater.receiver',
    });
  });

  it('defaults to sender for unknown values', () => {
    expect(getVariantConfig('anything').variant).toBe('sender');
  });
});

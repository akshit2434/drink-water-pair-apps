export type AppVariant = 'sender' | 'receiver';

export type VariantConfig = {
  variant: AppVariant;
  name: string;
  slug: string;
  packageName: string;
};

const configs: Record<AppVariant, VariantConfig> = {
  sender: {
    variant: 'sender',
    name: 'Drink Water Button',
    slug: 'drink-water-button',
    packageName: 'dev.drinkwater.sender',
  },
  receiver: {
    variant: 'receiver',
    name: 'Drink Water Reminder',
    slug: 'drink-water-reminder',
    packageName: 'dev.drinkwater.receiver',
  },
};

export function getVariantConfig(value?: string): VariantConfig {
  return value === 'receiver' ? configs.receiver : configs.sender;
}

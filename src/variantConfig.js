const configs = {
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

function getVariantConfig(value) {
  return value === 'receiver' ? configs.receiver : configs.sender;
}

module.exports = { getVariantConfig };

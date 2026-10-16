// Address as it was at the moment an order was placed (later edits don't change past orders).
export type DeliveryAddressSnapshot = {
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

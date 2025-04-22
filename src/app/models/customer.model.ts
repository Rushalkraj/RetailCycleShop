export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress?: Address;
  billingAddress?: Address;
}
export interface Address {
  addressId: number;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AddressCreateDto {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface AddressUpdateDto extends AddressCreateDto {
  addressId: number;
}

export interface CustomerCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress: AddressCreateDto;
}

export interface CustomerUpdateDto {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress: AddressUpdateDto;
}
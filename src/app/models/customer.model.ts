// customer.model.ts


export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string; // Added this
  phone: string; // Added this
  billingAddressId?: number;
  shippingAddressId?: number;
  createdAt: string;
  updatedAt: string;

  billingAddress?: Address;
  shippingAddress?: Address;
}
export interface Address {
  addressId: number;
  customerId?: number;
  streetLine1: string;
  streetLine2?: string; // Added this
  city: string; // Added this
  state: string; // Added this
  postalCode: string; // Added this
  country: string; // Added this
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;

  customer?: Customer;
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
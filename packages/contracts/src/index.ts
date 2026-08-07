export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
}

export interface CreateCustomerResponse {
  customer: CustomerDto;
}

export interface HealthCheckResponse {
  status: 'ok';
  service: 'api';
  timestamp: string;
}

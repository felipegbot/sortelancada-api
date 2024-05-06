export interface MercadoPagoPixResponse {
  id: number;
  status: string;
  status_detail: string;
  transaction_details: TransactionDetails;
  point_of_interaction: PointOfInteraction;
}

interface TransactionDetails {
  net_received_amount: number;
  total_paid_amount: number;
  overpaid_amount: number;
  external_resource_url: string | null;
  installment_amount: number;
  financial_institution: string | null;
}

interface PointOfInteraction {
  type: string;
  sub_type: string | null;
  application_data: ApplicationData;
  transaction_data: TransactionData;
}

interface ApplicationData {
  name: string;
  version: string;
}

interface TransactionData {
  qr_code_base64: string;
  qr_code: string;
  ticket_url: string;
}

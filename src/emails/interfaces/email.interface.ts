export interface EmailConfig {
  user: string;
  pass: string;
  from: string;
}

export interface EmailContext {
  chain: string;
  price: number;
  dollar: number;
}

export interface ICreateUser {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  hospcode: string;
  enabled: boolean;
  email: string;
}
export interface IUpdateUser {
  first_name: string;
  last_name: string;
  hospcode: string;
  ingress_zone: string;
  enabled: boolean;
  province_code: string;
  email: string;
}
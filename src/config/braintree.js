import braintree from 'braintree';
import { ENV, MERCHANT, PUBLIC_KEY, PRIV_KEY_BT } from './index.js';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment[ENV],
  merchantId: MERCHANT,
  publicKey: PUBLIC_KEY,
  privateKey: PRIV_KEY_BT
});

export default gateway;

import * as bip39 from "bip39";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";

export async function generateWallet() {
  await cryptoWaitReady();
  const mnemonic = bip39.generateMnemonic(12);
  const keyring = new Keyring({ type: "sr25519" }); // Bittensor uses sr25519
  const pair = keyring.addFromMnemonic(mnemonic);
  return {
    mnemonic,
    address: pair.address,
  };
}

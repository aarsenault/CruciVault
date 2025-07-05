import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { waitReady } from "@polkadot/wasm-crypto";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import { ApiPromise, WsProvider } from "@polkadot/api";

export async function generateWallet() {
  try {
    await waitReady();
    console.log("waitReady resolved");
  } catch (e) {
    console.error("waitReady failed", e);
    throw e;
  }
  try {
    await cryptoWaitReady();
    console.log("cryptoWaitReady resolved");
  } catch (e) {
    console.error("cryptoWaitReady failed", e);
    throw e;
  }
  const mnemonic = generateMnemonic(wordlist, 128);
  const keyring = new Keyring({ type: "sr25519" }); // Bittensor uses sr25519
  const pair = keyring.addFromMnemonic(mnemonic);
  return {
    mnemonic,
    address: pair.address,
  };
}

export async function getAddressFromMnemonic(
  mnemonic: string
): Promise<string> {
  console.log("Bittensor: Starting address derivation...");
  try {
    console.log("Bittensor: Waiting for waitReady...");
    await waitReady();
    console.log("Bittensor: waitReady completed");
  } catch (e) {
    console.error("Bittensor: waitReady failed", e);
    throw e;
  }
  try {
    console.log("Bittensor: Waiting for cryptoWaitReady...");
    await cryptoWaitReady();
    console.log("Bittensor: cryptoWaitReady completed");
  } catch (e) {
    console.error("Bittensor: cryptoWaitReady failed", e);
    throw e;
  }
  console.log("Bittensor: Creating keyring...");
  const keyring = new Keyring({ type: "sr25519" }); // Bittensor uses sr25519
  console.log("Bittensor: Adding pair from mnemonic...");
  const pair = keyring.addFromMnemonic(mnemonic);
  console.log("Bittensor: Address derived successfully:", pair.address);
  return pair.address;
}

export async function getTaoBalance(address: string): Promise<string> {
  console.log("Bittensor: Starting balance fetch for address:", address);

  // Add timeout to prevent hanging
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Balance fetch timeout")), 5000)
  );

  try {
    console.log("Bittensor: Creating WebSocket provider...");
    const wsProvider = new WsProvider(
      "wss://entrypoint-finney.opentensor.ai:443"
    );

    console.log("Bittensor: Creating API promise...");
    const apiPromise = ApiPromise.create({ provider: wsProvider });

    // Race between API creation and timeout
    const api = await Promise.race([apiPromise, timeoutPromise]);
    console.log("Bittensor: API created successfully");

    console.log("Bittensor: Querying account info...");
    const accountInfo = await Promise.race([
      api.query.system.account(address),
      timeoutPromise,
    ]);
    console.log("Bittensor: Account info retrieved");

    const balance = (accountInfo as any).data.free;
    const tao = Number(balance) / 1e9;

    console.log("Bittensor: Disconnecting API...");
    await api.disconnect();
    console.log("Bittensor: Balance fetch completed successfully");

    return tao.toLocaleString(undefined, { maximumFractionDigits: 9 });
  } catch (error) {
    console.error("Bittensor: Balance fetch failed:", error);
    // Return a default value instead of throwing
    return "0.000000000";
  }
}

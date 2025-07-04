export async function encryptMnemonic(
  mnemonic: string,
  password: string
): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(mnemonic)
  );
  // Store salt and iv with ciphertext
  return [
    Buffer.from(salt).toString("base64"),
    Buffer.from(iv).toString("base64"),
    Buffer.from(new Uint8Array(ciphertext)).toString("base64"),
  ].join(".");
}

export async function decryptMnemonic(
  ciphertext: string,
  password: string
): Promise<string> {
  const enc = new TextEncoder();
  const [saltB64, ivB64, ctB64] = ciphertext.split(".");
  const salt = Uint8Array.from(Buffer.from(saltB64, "base64"));
  const iv = Uint8Array.from(Buffer.from(ivB64, "base64"));
  const ct = Uint8Array.from(Buffer.from(ctB64, "base64"));
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new TextDecoder().decode(decrypted);
}

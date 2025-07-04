import React, { useState } from "react";
import { generateWallet } from "./lib/bittensor";
import { encryptMnemonic, decryptMnemonic } from "./lib/crypto";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { NetBackground } from "./components/NetBackground";

const App: React.FC = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [password] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleGenerate = async () => {
    const wallet = await generateWallet();
    setMnemonic(wallet.mnemonic);
    setAddress(wallet.address);
    setShowMnemonic(true);
  };

  const handleSave = async () => {
    if (!mnemonic || !password) return;
    const encrypted = await encryptMnemonic(mnemonic, password);
    localStorage.setItem("bittensor_wallet", encrypted);
    setSaved(encrypted);
    setShowMnemonic(false);
  };

  const handleRestore = async () => {
    if (!password) return;
    const encrypted = localStorage.getItem("bittensor_wallet");
    if (!encrypted) return;
    const m = await decryptMnemonic(encrypted, password);
    setMnemonic(m);
    setShowMnemonic(true);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden bg-gray-950"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* full‐screen net effect behind */}
      <div className="absolute inset-0 z-0">
        <NetBackground />
      </div>

      {/* Full-height sidebar layout */}
      <Card className="relative z-10 w-full min-h-screen px-0 py-0 bg-transparent border-none rounded-none shadow-none flex flex-col">
        <CardContent className="flex flex-col h-full p-0">
          <h1 className="text-2xl font-bold text-white mb-4 pt-8 px-8">
            Bittensor Wallet
          </h1>

          {/* Controls area absolutely positioned 2/3 down the sidebar */}
          <div
            className="w-full flex flex-col items-center"
            style={{
              position: "absolute",
              top: "66%",
              left: 0,
              right: 0,
              transform: "translateY(-33%)",
              zIndex: 20,
              pointerEvents: "auto",
            }}
          >
            <div className="w-[90%] max-w-md backdrop-blur bg-white/10 rounded-xl p-4 shadow-lg">
              {!mnemonic && (
                <>
                  <Button
                    className="w-full mb-2 border-2 border-white !border-white text-lg"
                    onClick={handleGenerate}
                  >
                    Generate new Wallet
                  </Button>
                  <div className="text-center text-white mb-4">or</div>
                  <Button
                    className="w-full mb-4 border-2 border-white !border-white text-lg"
                    onClick={handleRestore}
                  >
                    Restore an Existing Wallet.
                  </Button>
                  <a
                    href="https://learnbittensor.org/"  
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center underline transition mb-2 text-yellow-300 hover:text-yellow-400"
                    style={{ fontSize: "1rem", marginTop: "0.5rem" }}
                  >
                    Learn Bittensor
                  </a>
                </>
              )}

              {address && (
                <div className="mb-2 break-all text-white">
                  <span className="font-semibold">Address:</span> {address}
                </div>
              )}

              {showMnemonic && mnemonic && (
                <div className="mb-4 p-2 rounded bg-yellow-500 bg-opacity-20 text-yellow-200 text-center">
                  <span className="font-semibold">Mnemonic:</span>
                  <br />
                  {mnemonic}
                </div>
              )}

              {mnemonic && (
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-white !border-white"
                    onClick={handleSave}
                  >
                    Save Encrypted
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 border-2 border-white !border-white"
                    onClick={handleRestore}
                  >
                    Restore an Existing Wallet.
                  </Button>
                </div>
              )}

              {saved && (
                <div className="mt-2 text-xs text-gray-300">
                  Wallet saved (encrypted). Use password to restore.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;

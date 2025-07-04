import React, { useState } from "react";
import { generateWallet } from "./lib/bittensor";
import { encryptMnemonic, decryptMnemonic } from "./lib/crypto";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { NetBackground } from "./components/NetBackground";

const App: React.FC = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [password, setPassword] = useState("");
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950">
      {/* full‐screen net effect behind */}
      <div className="absolute inset-0 z-0">
        <NetBackground />
      </div>

      {/* phone-sized UI card, reduced height, minimal blur */}
      <Card className="relative z-10 w-[375px] h-[567px] px-6 py-8 bg-transparent border border-white border-opacity-30 rounded-2xl shadow-2xl">
        <CardContent className="flex flex-col h-full p-0">
          <h1 className="text-2xl font-bold text-white mb-4">
            Bittensor Wallet
          </h1>
          <div className="flex-1" />

          {/* Main wallet controls area, now blurred and semi-transparent, spanning the popup width */}
          <div className="w-full px-0 pb-0">
            <div className="w-full backdrop-blur bg-white/10 rounded-xl p-4 shadow-lg">
              {!mnemonic && (
                <>
                  <Button
                    className="w-full mb-2 border-2 border-white !border-white"
                    onClick={handleGenerate}
                  >
                    Generate new Wallet
                  </Button>
                  <div className="text-center text-white mb-4">or</div>
                  <Button
                    className="w-full mb-4 border-2 border-white !border-white"
                    onClick={handleRestore}
                  >
                    Restore an Existing Wallet.
                  </Button>
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

              <Input
                type="password"
                placeholder="Enter password"
                className="mb-4 bg-white bg-opacity-80 text-white placeholder-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

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

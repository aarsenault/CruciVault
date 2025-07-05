import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storage } from "lib/storage";

interface LocationState {
  mnemonic: string;
  address: string;
}

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: string;
  address: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = (location.state as LocationState) || {};

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      navigate("/onboarding/warning");
      return;
    }

    // Load transactions from storage
    loadTransactions();
  }, [address, navigate]);

  const loadTransactions = async () => {
    try {
      const stored = await storage.get(["transactions"]);
      const transactions = stored.transactions as
        | Record<string, Transaction[]>
        | undefined;
      if (transactions && transactions[address]) {
        setTransactions(transactions[address]);
      } else {
        // For now, show some sample transactions
        const sampleTransactions: Transaction[] = [
          {
            id: "1",
            type: "receive",
            amount: "10.5",
            address: "5F...abc123",
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: "confirmed",
          },
          {
            id: "2",
            type: "send",
            amount: "2.3",
            address: "5F...def456",
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: "confirmed",
          },
        ];
        setTransactions(sampleTransactions);

        // Save sample data
        const allTransactions = transactions || {};
        allTransactions[address] = sampleTransactions;
        await storage.set({ transactions: allTransactions });
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "send" ? "↗️" : "↙️";
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!address) {
    navigate("/onboarding/warning");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 items-center">
        <div className="text-white text-center text-xl">
          Loading transactions...
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="">
      <h2 className="text-white text-2xl font-bold mb-6">
        Transaction History
      </h2>

      {transactions.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No transactions found
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getTypeIcon(tx.type)}</div>
                <div>
                  <div className="text-white font-medium">
                    {tx.type === "send" ? "Sent" : "Received"} {tx.amount} TAO
                  </div>
                  <div className="text-gray-400 text-sm">{tx.address}</div>
                  <div className="text-gray-500 text-xs">
                    {formatDate(tx.timestamp)}
                  </div>
                </div>
              </div>
              <div
                className={`text-sm font-medium ${getStatusColor(tx.status)}`}
              >
                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

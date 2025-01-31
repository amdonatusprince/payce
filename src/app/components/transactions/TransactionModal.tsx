import { Dialog } from "@headlessui/react";
import {
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Types } from "@requestnetwork/request-client.js";
import { format } from "date-fns";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { handlePayRequest, RequestStatus } from "@/app/requests/PayRequest";
import { useState } from "react";
import { getTransactionStatus } from "@/app/requests/utils/transactionStatus";
import { SolanaInvoice } from "@/app/hooks/useSolanaInvoices";
import { SolanaTransaction } from "@/app/hooks/useSolanaTransactions";
import { payInvoice } from "@/app/requests/solana/PayInvoice";
import { useAppKitNetwork, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'


interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Types.IRequestData | SolanaTransaction | SolanaInvoice | null;
  isSolanaTransaction?: boolean;
}

export function TransactionModal({
  isOpen,
  onClose,
  transaction,
  isSolanaTransaction,
}: TransactionModalProps) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [paymentStatus, setPaymentStatus] = useState<RequestStatus>("checking");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { caipNetwork } = useAppKitNetwork();
  const { address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const isSolanaNetwork = caipNetwork?.name?.toLowerCase().includes('solana');
  const network = caipNetwork?.name?.toLowerCase().includes('devnet') ? 'devnet' : 'mainnet';

  if (!transaction) return null;

  const isSolanaInvoice = (tx: any): tx is SolanaInvoice => 
    tx.contentData?.transactionType === 'invoice';

  const isSolanaTx = (tx: any): tx is SolanaTransaction => 
    tx.type === 'payment' || (tx.transactionType === 'normal' && "sender" in tx);

  const getStatus = (tx: any) => {
    if (isSolanaInvoice(tx)) {
      return tx.status?.toLowerCase() || 'pending';
    }
    if (isSolanaTx(tx)) {
      return "completed";
    }
    return getTransactionStatus(tx as Types.IRequestData);
  };

  const isPayer = isSolanaInvoice(transaction)
    ? address === transaction.payerAddress
    : isSolanaTx(transaction)
    ? address === transaction.sender
    : address?.toLowerCase() === transaction.payer?.value?.toLowerCase();

  const getAmount = (tx: any) => {
    if (isSolanaInvoice(tx)) {
      return `${tx.expectedAmount} ${tx.currency}`;
    }
    if (isSolanaTx(tx)) {
      return `${tx.amount} ${tx.currency}`;
    }
    return `${tx.expectedAmount} ${tx.currency?.value || tx.currency}`;
  };

  const getReason = (tx: any) => {
    if (isSolanaInvoice(tx)) {
      return tx.reason || tx.contentData?.invoiceDetails?.items?.[0]?.description || 'No reason provided';
    }
    if (isSolanaTx(tx)) {
      return tx.reason || 'No reason provided';
    }
    return tx.contentData?.reason || 'No reason provided';
  };

  const getBusinessDetails = (tx: any) => {
    if (isSolanaInvoice(tx)) {
      return tx.contentData?.businessDetails || {};
    }
    return {};
  };

  const getClientDetails = (tx: any) => {
    if (isSolanaInvoice(tx)) {
      return tx.contentData?.clientDetails || {};
    }
    return {};
  };

  const getFormattedDate = (tx: any) => {
    if (tx.date) return format(new Date(tx.date), "PPP p");
    if (tx.createdAt) return format(new Date(tx.createdAt), "PPP p");
    if (tx.timestamp) return format(new Date(tx.timestamp * 1000), "PPP p");
    return "N/A";
  };

  const handlePayNow = async () => {
    if (!address || !publicClient || !walletClient) return;

    setError(null);
    setPaymentStatus("checking");
    setIsProcessing(true);

    try {
      if (isSolanaInvoice(transaction)) {
        // Handle Solana payment logic here
        console.log("Solana payment not implemented yet");
      } else if (isSolanaTx(transaction)) {
        // Handle Solana transaction payment logic here
        console.log("Solana transaction payment not implemented yet");
      } else {
        const result = await handlePayRequest(
          (transaction as Types.IRequestData).requestId,
          address,
          publicClient,
          walletClient,
          (status) => setPaymentStatus(status)
        );

        if (result.status === "completed") {
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            onClose();
          }, 3000);
        } else if (result.error) {
          setError(result.error);
          setPaymentStatus("checking");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setPaymentStatus("checking");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!address) return;

    setError(null);
    setPaymentStatus("checking");
    setIsProcessing(true);

  const refreshPage = () => {
    window.location.reload();
  };

    try {
      const result = await payInvoice(
        transaction,
        connection,
        walletProvider,
        network || 'mainnet'
      );

      if (result.status === "completed") {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          onClose();
          refreshPage();
        }, 3000);
      } else if (result.error) {
        setError(result.error);
        setPaymentStatus("checking");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setPaymentStatus("checking");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDetails = () => {
    if (isSolanaInvoice(transaction)) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Details */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Business Details
              </h3>
              <div className="space-y-2">
                {Object.entries(getBusinessDetails(transaction)).map(([key, value]: [string, any]) => (
                  <p key={key} className="text-sm text-gray-600">
                    <span className="font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:{' '}
                    </span>
                    {String(value) || 'N/A'}
                  </p>
                ))}
              </div>
            </div>
            {/* Client Details */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Client Details
              </h3>
              <div className="space-y-2">
                {Object.entries(getClientDetails(transaction))
                  .slice(0, 3)
                  .map(([key, value]: [string, any]) => (
                    <p key={key} className="text-sm text-gray-600">
                      <span className="font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1)}:{' '}
                      </span>
                      {String(value) || 'N/A'}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </>
      );
    }
    // For normal Solana transactions, don't render business/client details
    return null;
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-y-auto max-h-[95vh]">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <Dialog.Title className="text-lg sm:text-xl font-semibold text-white">
                  Transaction Details
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Amount and Status */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {getAmount(transaction)}
                </div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    getStatus(transaction) === 'paid' || getStatus(transaction) === 'completed'
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {getStatus(transaction)}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Pay Now Button */}
              {isPayer && (
                (isSolanaNetwork && isSolanaInvoice(transaction) && getStatus(transaction) === 'pending') || 
                (!isSolanaNetwork && getStatus(transaction) !== "paid")
              ) && (
                <div className="flex justify-center">
                  <button
                    onClick={isSolanaNetwork ? handlePayInvoice : handlePayNow}
                    disabled={isProcessing}
                    className="w-full sm:w-auto btn-primary text-sm px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Pay Now"
                    )}
                  </button>
                </div>
              )}

              {/* Transaction Summary */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Transaction Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-sm font-medium break-all p-3 bg-white rounded-lg border border-gray-100">
                      {isSolanaInvoice(transaction) 
                        ? transaction.payerAddress 
                        : isSolanaTx(transaction)
                        ? transaction.sender
                        : transaction.payer?.value || 'Unknown'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">To</p>
                    <p className="text-sm font-medium break-all p-3 bg-white rounded-lg border border-gray-100">
                      {isSolanaInvoice(transaction) 
                        ? transaction.payeeAddress 
                        : isSolanaTx(transaction)
                        ? transaction.recipient
                        : transaction.payee?.value || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business and Client Details */}
              {renderDetails()}

              {/* Transaction Details */}
              {isSolanaTx(transaction) &&
                (() => {
                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-900 mb-3">
                            Transaction Details
                          </h3>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Reason: </span>
                              {getReason(transaction)}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Network: </span>
                              {transaction.network || 'Solana'}
                            </p>
                            <a
                              href={transaction.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                            >
                              View on Explorer
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-900 mb-3">
                            Participant Details
                          </h3>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Recipient Name:{" "}
                              </span>
                              {transaction.recipientName || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <dt className="text-xs font-medium text-gray-500">
                              Date & Time
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {getFormattedDate(transaction)}
                            </dd>
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <dt className="text-xs font-medium text-gray-500">
                              Transaction ID
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 break-all">
                              {transaction.transactionId}
                            </dd>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

              {isSolanaInvoice(transaction) &&
                (() => {
                  return (
                    <>
                      <div className="p-4 sm:p-6 space-y-6">
                        {/* Payment Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                              Payment Details
                            </h3>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Due Date: </span>
                                {transaction.dueDate ? format(new Date(transaction.dueDate), 'PPP') : 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason: </span>
                                {getReason(transaction)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Network: </span>
                                {transaction.network}
                              </p>
                              {transaction.status === 'paid' && transaction.explorerUrl && (
                                <a
                                  href={transaction.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                                >
                                  View on Explorer
                                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                              Transaction Info
                            </h3>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">
                                  Date Created:{" "}
                                </span>
                                {getFormattedDate(transaction)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">
                                  Transaction ID:{" "}
                                </span>
                                {transaction.transactionId}
                              </p>
                              {transaction.explorerUrl && (
                                <a
                                  href={transaction.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                                >
                                  View on Explorer
                                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-green-50/90 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
                Payment Successful!
              </Dialog.Title>
              <p className="text-sm text-gray-500 text-center">
                Your transaction has been processed successfully.
              </p>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

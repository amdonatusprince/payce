import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Types } from "@requestnetwork/request-client.js";
import { format } from 'date-fns';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { handlePayRequest, RequestStatus } from '@/app/requests/PayRequest';
import { useState } from 'react';
import { EscrowOperations } from '@/app/requests/EscrowPayment';
import { getTransactionStatus } from '@/app/requests/utils/transactionStatus';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Types.IRequestData;
}

export function TransactionModal({ isOpen, onClose, transaction }: TransactionModalProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const isPayer = address?.toLowerCase() === transaction.payer?.value.toLowerCase();
  const [paymentStatus, setPaymentStatus] = useState<RequestStatus>('checking');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (currency: string) => currency.split('-')[0];
  const formatAmount = (amount: string | number, decimals: number = 18) => 
    parseFloat(formatUnits(BigInt(amount.toString()), decimals));

  const getStatus = (tx: Types.IRequestData) => getTransactionStatus(tx);

  const handlePayNow = async () => {
    if (!address || !publicClient || !walletClient) return;
    
    setError(null);
    setPaymentStatus('checking');
    setIsProcessing(true);
    
    try {
      const result = await handlePayRequest(
        transaction.requestId,
        address,
        publicClient,
        walletClient,
        (status) => setPaymentStatus(status)
      );

      if (result.status === 'completed') {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          onClose();
        }, 3000);
      } else if (result.error) {
        setError(result.error);
        setPaymentStatus('checking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('checking');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <Dialog.Panel className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-y-auto max-h-[90vh]">
            <div className="p-3 sm:p-6">
              {/* Header with Pay/Release button */}
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <Dialog.Title className="text-base sm:text-xl font-semibold text-gray-900">
                  Transaction Details
                </Dialog.Title>
                <div className="flex items-center gap-2 sm:gap-4">
                  {isPayer && getStatus(transaction) !== 'paid' && (
                    <>
                      {transaction.contentData?.transactionType === 'escrow_payment' ? (
                        <button 
                          onClick={() => EscrowOperations.releasePayment(transaction, walletClient)}
                          disabled={isProcessing}
                          className="btn-primary text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                              Processing...
                            </>
                          ) : (
                            'Release Payment'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handlePayNow}
                          disabled={isProcessing}
                          className="btn-primary text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                              Processing...
                            </>
                          ) : (
                            'Pay Now'
                          )}
                        </button>
                      )}
                    </>
                  )}
                  <button 
                    onClick={onClose} 
                    className="rounded-full p-1.5 sm:p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
                {transaction.contentData?.transactionType === 'escrow_payment' ? (
                  <>
                    {/* Project Details */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">Project Details</h3>
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-gray-900">
                          <span className="font-medium">Title: </span>
                          {transaction.contentData?.projectDetails?.title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-900">
                          <span className="font-medium">Description: </span>
                          {transaction.contentData?.projectDetails?.description}
                        </p>
                      </div>
                    </div>
                    {/* Milestones */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">Milestones</h3>
                      <div className="space-y-2">
                        {transaction.contentData?.projectDetails?.milestones.map((milestone: any, index: number) => (
                          <div key={index} className="text-xs sm:text-sm text-gray-900">
                            <p className="font-medium">Milestone {index + 1}:</p>
                            <p>{milestone.description}</p>
                            <p className="text-gray-500">Due: {format(new Date(milestone.dueDate), 'PPP')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Business Details */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">Business Details</h3>
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-gray-900">
                          <span className="font-medium">Name: </span>
                          {transaction.contentData?.businessDetails?.name ?? 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-900">
                          <span className="font-medium">Email: </span>
                          {transaction.contentData?.businessDetails?.email ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                    {/* Client Details */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">Client Details</h3>
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-gray-900">
                          <span className="font-medium">Name: </span>
                          {transaction.contentData?.clientDetails?.name ?? 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-900">
                          <span className="font-medium">Email: </span>
                          {transaction.contentData?.clientDetails?.email ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Transaction Details List */}
              <div className="border-t border-gray-100 pt-3 sm:pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    {
                      label: "Date & Time",
                      value: format(new Date(transaction.timestamp * 1000), 'PPP p')
                    },
                    {
                      label: "Status",
                      value: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getStatus(transaction) === 'paid' ? 'bg-green-100 text-green-800' :
                        getStatus(transaction) === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{getStatus(transaction)}</span>
                    },
                    {
                      label: "Amount",
                      value: (
                        <span className={`${
                          address?.toLowerCase() === transaction.payee?.value.toLowerCase() 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {address?.toLowerCase() === transaction.payee?.value.toLowerCase() ? '+' : '-'}
                          {formatAmount(transaction.expectedAmount)} {formatCurrency(transaction.currency)}
                        </span>
                      )
                    },
                    {
                      label: "Due Date",
                      value: transaction.contentData?.dueDate 
                        ? format(new Date(transaction.contentData.dueDate), 'PPP')
                        : 'No due date'
                    },
                    {
                      label: "Request ID",
                      value: (
                        <a 
                          href={`https://scan.request.network/request/${transaction.requestId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 break-all text-xs sm:text-sm"
                        >
                          {transaction.requestId}
                          <ArrowTopRightOnSquareIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        </a>
                      )
                    }
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="p-2 sm:p-3 rounded-lg bg-gray-50/50"
                    >
                      <dt className="text-xs sm:text-sm font-medium text-gray-500">{item.label}</dt>
                      <dd className="mt-1 text-xs sm:text-sm text-gray-900">{item.value}</dd>
                    </div>
                  ))}
                </div>
              </div>
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
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mb-3 sm:mb-4" />
              <Dialog.Title className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Payment Successful!
              </Dialog.Title>
              <p className="text-xs sm:text-sm text-gray-500">
                Your transaction has been processed successfully.
              </p>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
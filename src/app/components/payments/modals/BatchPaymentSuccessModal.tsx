import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface BatchPaymentSuccessModalProps {
  onClose: () => void;
  successCount: number;
  totalCount: number;
}

export const BatchPaymentSuccessModal = ({ 
  onClose, 
  successCount, 
  totalCount,
}: BatchPaymentSuccessModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        {/* <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div> */}
        
        <div className="text-center mt-2">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Payment Completed
          </h3>
          
          <div className="mt-4 text-sm text-gray-600">
            {successCount === totalCount ? (
              <p>All payment were sent successful 🎉</p>
            ) : (
              <div className="space-y-1">
                <p className="text-green-600">{successCount} payments successful</p>
                <p className="text-red-600">{totalCount - successCount} payments failed</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
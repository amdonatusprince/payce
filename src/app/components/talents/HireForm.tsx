import { useState } from 'react';
import { supportedCurrencies } from '@/lib/constants';
import { EscrowOperations } from '@/app/requests/EscrowPayment';
import { useAccount, useWalletClient } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { CurrencyTypes } from "@requestnetwork/types";

import type { Talent } from './TalentCard';

interface HireFormProps {
  talent:  Talent;
  onClose: () => void;
}

export const HireForm: React.FC<HireFormProps> = ({ talent, onClose }) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const defaultCurrency = Object.keys(supportedCurrencies)[0];

  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    amount: '',
    currency: defaultCurrency,
    duration: 'less_than_week',
    talentAddress: '',
  });

  const [milestones, setMilestones] = useState([{ description: '', dueDate: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingStatus('Preparing escrow payment...');
    setError(null);

    try {
      if (!address || !walletClient) {
        throw new Error('Please connect your wallet first');
      }

      if (!formData.talentAddress || !formData.projectTitle || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      const [, ...networkParts] = formData.currency.split('-');
      const network = networkParts.join('-').split('-')[0];

      const params = {
        walletClient,
        payerAddress: address,
        expectedAmount: formData.amount,
        currency: {
          type: Types.RequestLogic.CURRENCY.ETH as const,
          value: 'ETH',
          network: network.toLowerCase() as CurrencyTypes.ChainName,
          decimals: supportedCurrencies[formData.currency as keyof typeof supportedCurrencies].decimals,
        },
        recipientAddress: formData.talentAddress,
        contentData: {
          transactionType: 'escrow_payment',
          projectDetails: {
            title: formData.projectTitle,
            description: formData.projectDescription,
            duration: formData.duration,
            milestones: milestones,
          },
          metadata: {
            createdAt: new Date().toISOString(),
            builderId: "payce-finance",
            version: "1.0.0",
            createdBy: address,
          }
        },
        onEscrowStatus: (status: string) => {
          setLoadingStatus(status);
        }
      };

      console.log('Submitting Escrow Payment with params:', params);

      await EscrowOperations.createAndPayEscrow(params);
      setShowModal(true);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Error creating escrow payment:', error);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const resetForm = () => {
    setFormData({
      projectTitle: '',
      projectDescription: '',
      amount: '',
      currency: defaultCurrency,
      duration: 'less_than_week',
      talentAddress: '',
    });
    setMilestones([{ description: '', dueDate: '' }]);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Hire Talent</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Talent Address</label>
          <input
            type="text"
            value={formData.talentAddress}
            onChange={(e) => setFormData({ ...formData, talentAddress: e.target.value })}
            className="w-full p-3 border rounded-lg"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Title</label>
          <input
            type="text"
            value={formData.projectTitle}
            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter project title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Description</label>
          <textarea
            value={formData.projectDescription}
            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows={4}
            placeholder="Describe your project requirements..."
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Details</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Amount"
                />
              </div>
              <div>
                <select 
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  {Object.keys(supportedCurrencies).map((currency) => {
                    const [token, network] = currency.split('-');
                    const displayText = network === 'sepolia-sepolia' 
                      ? `${token} - Sepolia`
                      : `${token} - ${network.charAt(0).toUpperCase() + network.slice(1)}`;
                    
                    return (
                      <option key={currency} value={currency}>
                        {displayText}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="less_than_week">Less than a week</option>
              <option value="1_2_weeks">1-2 weeks</option>
              <option value="2_4_weeks">2-4 weeks</option>
              <option value="1_3_months">1-3 months</option>
              <option value="3_plus_months">3+ months</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Milestones</label>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <input
                  type="text"
                  value={milestone.description}
                  onChange={(e) => {
                    const newMilestones = [...milestones];
                    newMilestones[index].description = e.target.value;
                    setMilestones(newMilestones);
                  }}
                  className="w-full p-3 border rounded-lg mb-4"
                  placeholder="Milestone description"
                />
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[index].dueDate = e.target.value;
                      setMilestones(newMilestones);
                    }}
                    className="w-48 p-3 border rounded-lg"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMilestones([...milestones, { description: '', dueDate: '' }])}
              className="text-primary-600 hover:text-primary-700"
            >
              + Add Milestone
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !address}
          className={`w-full btn-primary flex items-center justify-center ${!address ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span>{loadingStatus}</span>
              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
            </div>
          ) : !address ? (
            'Connect Wallet to Submit'
          ) : (
            'Submit Escrow Payment'
          )}
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-2">Escrow Payment Created</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your escrow payment has been created and funded successfully.
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                onClose();
              }}
              className="w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 
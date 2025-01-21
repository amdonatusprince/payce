'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';
import { NetworkSelector } from './NetworkSelector';

export const SecuritySettings = () => {
    const { address, connector } = useAccount();
    const { disconnect } = useDisconnect();
    const [copied, setCopied] = useState(false);

    // Helper function to shorten address
    const shortenAddress = (address: string | undefined) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Add copy function
    const copyAddress = async () => {
        if (address) {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            {/* <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
             */}
            <div className="space-y-6">
                {/* <div>
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>
                    </div>
                </div> */}

                {/* 2FA Section */}
                {/* <div className="pt-3 sm:pt-4 border-t">
                    <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Two-Factor Authentication</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Add an extra layer of security to your account
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Currently: <span className="text-red-600">Disabled</span>
                            </p>
                        </div>
                        <button className="btn-secondary text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">
                            Enable 2FA
                        </button>
                    </div>
                </div> */}

                <div className="pt-4 border-t">
                    {address ? (
                        // Show connected wallet
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">
                                    {connector?.name || 'Wallet'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-600">
                                        {shortenAddress(address)}
                                    </p>
                                    <button
                                        onClick={copyAddress}
                                        className="text-primary hover:text-primary/80"
                                        title="Copy address"
                                    >
                                        {copied ? (
                                            <span className="text-green-600 text-sm">Copied!</span>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => disconnect()}
                                className="text-red-600 hover:text-red-700"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        // Show NetworkSelector when no wallet is connected
                        <NetworkSelector />
                    )}
                </div>
            </div>
        </div>
    );
};
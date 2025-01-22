'use client';
import { useState } from 'react';
import { NetworkSelector } from './NetworkSelector';

export const SecuritySettings = () => {

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
                    <NetworkSelector />
                </div>
            </div>
        </div>
    );
};
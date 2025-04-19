// src/components/ResendLink.tsx
import React from 'react';

interface ResendLinkProps {
    isDisabled: boolean;
    cooldown: number;
    attempts: number;
    maxAttempts: number;
    formatTime: (seconds: number) => string;
    onResend: () => void;
    label?: string;
}

export const ResendLink: React.FC<ResendLinkProps> = ({
    isDisabled,
    cooldown,
    attempts,
    maxAttempts,
    formatTime,
    onResend,
    label = 'Resend verification email',
}) => {
    return (
        <div className="space-y-1">
            {attempts < maxAttempts && (
                <button
                    onClick={onResend}
                    disabled={isDisabled || attempts >= maxAttempts}
                    className={`text-sm font-medium ${(isDisabled || attempts >= maxAttempts)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-700'
                        } transition-colors`}
                >
                    {isDisabled ? (
                        `Resend available in ${formatTime(cooldown)}`
                    ) : (
                        label
                    )}
                </button>
            )}
            <div className="text-xs text-gray-400">
                {attempts > 0 && `Remaining resend attempts: ${maxAttempts - attempts}/${maxAttempts}`}
            </div>
        </div>
    );
};
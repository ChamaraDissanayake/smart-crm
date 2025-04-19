import { useState, useEffect } from 'react';

export const useResendTimer = (maxAttempts = 3, cooldownDuration = 120) => {
    const [attempts, setAttempts] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const startCooldown = () => {
        setIsDisabled(true);
        setCooldown(cooldownDuration);
        setAttempts(prev => prev + 1);
    };

    const resetTimer = () => {
        setIsDisabled(false);
        setCooldown(0);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isDisabled && cooldown > 0 && attempts < maxAttempts) {
            timer = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [isDisabled, cooldown, attempts, maxAttempts]);

    return {
        attempts,
        isDisabled,
        cooldown,
        remainingAttempts: maxAttempts - attempts,
        maxAttempts,
        formatTime,
        startCooldown,
        resetTimer,
    };
};
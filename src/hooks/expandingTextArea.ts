import { useEffect, useRef } from "react";

export const useAutoResizeTextarea = (value: string) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to get the correct scrollHeight
            textareaRef.current.style.height = 'auto';
            // Set the height to scrollHeight
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return textareaRef;
};
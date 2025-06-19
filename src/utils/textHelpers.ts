export const truncateMiddle = (str: string, maxLength = 50): string => {
    if (str.length <= maxLength) return str;
    const partLength = Math.floor((maxLength - 3) / 2);
    return str.slice(0, partLength) + '...' + str.slice(-partLength);
};

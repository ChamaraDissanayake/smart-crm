export const COMPANY_SIZES = [
    { value: 1, label: "1-10" },
    { value: 2, label: "11-50" },
    { value: 3, label: "51-200" },
    { value: 4, label: "201-1000" },
    { value: 5, label: "1000+" }
];

export const INDUSTRIES = [
    { value: 1, label: "Technology" },
    { value: 2, label: "Finance" },
    { value: 3, label: "Healthcare" },
    { value: 4, label: "Education" },
    { value: 5, label: "Retail" },
    { value: 6, label: "Manufacturing" },
    { value: 7, label: "Real Estate" },
    { value: 8, label: "Other" }
];

// Helper to get size label from value
export const getSizeLabel = (value: number): string =>
    COMPANY_SIZES.find(size => size.value === value)?.label || '';

// Helper to get industry label from value
export const getIndustryLabel = (value: number): string =>
    INDUSTRIES.find(industry => industry.value === value)?.label || '';

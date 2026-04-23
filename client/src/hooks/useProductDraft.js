import { useState, useEffect } from 'react';

const DRAFT_KEY = 'mystore_product_draft';

export const useProductDraft = (initialState) => {
    const [draft, setDraft] = useState(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load draft", e);
        }
        return initialState;
    });

    // Auto save to local storage
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }, 1000); 
        return () => clearTimeout(timeout);
    }, [draft]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraft(initialState);
    };

    return [draft, setDraft, clearDraft];
};

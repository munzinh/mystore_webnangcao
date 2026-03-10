export const filterAndSortProducts = (products, category, filters, sort) => {
    let result = [...products];

    // Filter by category
    if (category && category !== 'all') {
        result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by price
    if (filters.price) {
        result = result.filter(p => {
            const price = p.offerPrice || p.price;
            switch (filters.price) {
                case 'under_5': return price < 5000000;
                case '5_10': return price >= 5000000 && price <= 10000000;
                case '10_20': return price > 10000000 && price <= 20000000;
                case 'over_20': return price > 20000000;
                default: return true;
            }
        });
    }

    // Filter by rating (assuming dummyProducts have no rating, defaulting to 4 in UI)
    if (filters.rating > 0) {
        result = result.filter(p => {
            const rating = p.rating || 4; // default fake rating
            return rating >= filters.rating;
        });
    }

    // Sort
    switch (sort) {
        case 'price_asc':
            result.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
            break;
        case 'price_desc':
            result.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
            break;
        case 'best_selling':
            result.sort((a, b) => (b.sold || 0) - (a.sold || 0)); // Assuming 'sold' field might exist
            break;
        case 'top_rated':
            result.sort((a, b) => (b.rating || 4) - (a.rating || 4));
            break;
        case 'newest':
            result.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            });
            break;
        default:
            break;
    }

    return result;
};

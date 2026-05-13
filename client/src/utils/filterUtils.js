export const filterAndSortProducts = (products, category, filters, sort) => {
    let result = [...products];

    // Filter by category
    if (category && category !== 'all') {
        const targets = new Set(
            (Array.isArray(category) ? category : [category])
                .filter(Boolean)
                .map(item => item.toString().toLowerCase())
        );

        result = result.filter(p => {
            const productCategory = p.category || {};
            const values = [
                productCategory.slug,
                productCategory._id,
                productCategory.name,
                typeof productCategory === 'string' ? productCategory : '',
            ].filter(Boolean);

            return values.some(value => targets.has(value.toString().toLowerCase()));
        });
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

    // Filter by rating - only show products that have been rated AND meet the threshold
    if (filters.rating > 0) {
        result = result.filter(p => {
            const rating = p.avgRating || 0;
            return rating > 0 && rating === filters.rating;
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
            result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
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

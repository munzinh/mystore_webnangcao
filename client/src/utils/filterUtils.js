const getProductScore = (product) => {
    const sold = Number(product.sold || 0);
    const rating = Number(product.avgRating || 0);
    const reviews = Number(product.totalReviews || 0);
    const price = Number(product.price || 0);
    const offerPrice = Number(product.offerPrice || product.price || 0);
    const discount = price > offerPrice && price > 0
        ? Math.round(((price - offerPrice) / price) * 100)
        : 0;
    const createdAt = product.createdAt ? new Date(product.createdAt).getTime() : 0;
    const ageInDays = createdAt ? (Date.now() - createdAt) / (1000 * 60 * 60 * 24) : 365;
    const freshness = Math.max(0, 30 - ageInDays) / 30;

    return (
        sold * 8 +
        rating * 12 +
        Math.min(reviews, 50) * 0.8 +
        Math.min(discount, 40) * 0.5 +
        freshness * 6
    );
};

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
        case 'recommended':
            result.sort((a, b) => {
                const scoreDiff = getProductScore(b) - getProductScore(a);
                if (scoreDiff !== 0) return scoreDiff;

                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            });
            break;
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

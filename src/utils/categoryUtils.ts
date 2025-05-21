import { Listing } from "@/services/listingService";

/**
 * Counts the number of listings in each category
 * @param listings Array of listings
 * @returns Object with category names as keys and counts as values
 */
export function categorizeListings(listings: Listing[]): { [key: string]: number } {
  const categoryCounts: { [key: string]: number } = {};
  
  listings.forEach(listing => {
    const category = listing.categoryName || 'أخرى';
    if (categoryCounts[category]) {
      categoryCounts[category]++;
    } else {
      categoryCounts[category] = 1;
    }
  });
  
  return categoryCounts;
} 
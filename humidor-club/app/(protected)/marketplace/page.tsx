import { TrendingUp, Plus, Filter } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Buy, sell, and trade with the community
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors min-h-[48px]">
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px]">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Create Listing</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <button className="px-4 py-2 font-medium border-b-2 border-primary text-primary whitespace-nowrap">
          All Listings
        </button>
        <button className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
          For Sale
        </button>
        <button className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
          Wanted
        </button>
        <button className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
          Trades
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-card border rounded-xl p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-muted inline-block">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No listings yet</h3>
          <p className="text-muted-foreground">
            Be the first to create a listing! Start buying, selling, or trading cigars with the community.
          </p>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] mt-4">
            <Plus className="h-5 w-5" />
            Create First Listing
          </button>
        </div>
      </div>
    </div>
  );
}


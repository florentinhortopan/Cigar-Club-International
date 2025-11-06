import Link from 'next/link';
import { Cigarette, Shield, Users, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo/Icon */}
          <div className="p-6 rounded-full bg-primary/10">
            <Cigarette className="h-16 w-16 text-primary" />
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome to <span className="text-primary">Cigar Club International</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              A private community for cigar enthusiasts to collect, rate, and trade premium cigars
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto min-w-[280px]">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors min-h-[56px]"
            >
              Sign In
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-8 py-4 text-lg font-semibold hover:bg-primary/10 transition-colors min-h-[56px]"
            >
              Learn More
            </Link>
          </div>

          {/* Age Gate Notice */}
          <p className="text-sm text-muted-foreground max-w-md">
            <Shield className="inline h-4 w-4 mr-1" />
            21+ only. By entering, you confirm you meet age requirements.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border">
            <div className="p-4 rounded-full bg-primary/10">
              <Cigarette className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Digital Humidor</h3>
            <p className="text-muted-foreground">
              Track your collection, add tasting notes, and manage your inventory with ease
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border">
            <div className="p-4 rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Private Marketplace</h3>
            <p className="text-muted-foreground">
              Buy, sell, and trade with trusted members in a secure, invite-only community
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border">
            <div className="p-4 rounded-full bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Market Intelligence</h3>
            <p className="text-muted-foreground">
              Real-time pricing data and valuations powered by marketplace activity
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Cigar Club International. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/guidelines" className="text-muted-foreground hover:text-foreground">
                Guidelines
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

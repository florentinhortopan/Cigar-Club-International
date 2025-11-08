import Link from 'next/link';
import { Cigarette, Shield, Users, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface BranchPageProps {
  params: Promise<{
    'branch-slug': string;
  }>;
}

export default async function BranchPage({ params }: BranchPageProps) {
  const { 'branch-slug': branchSlug } = await params;
  const branch = await prisma.branch.findUnique({
    where: { slug: branchSlug },
    include: {
      created_by: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!branch || !branch.is_active) {
    notFound();
  }

  const memberCount = branch._count.members;
  const joinParams = new URLSearchParams({
    branchId: branch.id,
    branchSlug: branch.slug,
  });
  if (branch.name) {
    joinParams.set('branchName', branch.name);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Branch Logo/Banner */}
          {branch.banner_url ? (
            <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden">
              <img
                src={branch.banner_url}
                alt={branch.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="p-6 rounded-full bg-primary/10">
              <Cigarette className="h-16 w-16 text-primary" />
            </div>
          )}

          {/* Branch Heading */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              {branch.city && <span>{branch.city}</span>}
              {branch.region && <span>, {branch.region}</span>}
              {branch.country && <span>, {branch.country}</span>}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-primary">{branch.name}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              {branch.description || 'A local chapter of Cigar Club International'}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{memberCount} {memberCount === 1 ? 'Member' : 'Members'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Est. {new Date(branch.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto min-w-[280px]">
            <Link
              href={`/join?${joinParams.toString()}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors min-h-[56px]"
            >
              Join This Branch
            </Link>
            <Link
              href="#about"
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

      {/* Custom Homepage Content */}
      {branch.homepage_content && (
        <div id="about" className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto bg-card border rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6">About {branch.name}</h2>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: branch.homepage_content }}
            />
          </div>
        </div>
      )}

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
            <h3 className="text-xl font-semibold">Local Community</h3>
            <p className="text-muted-foreground">
              Connect with fellow enthusiasts in {branch.city || 'your area'}
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
              © {new Date().getFullYear()} {branch.name} - Cigar Club International. All rights reserved.
            </p>
            {branch.contact_email && (
              <div className="flex gap-6 text-sm">
                <a href={`mailto:${branch.contact_email}`} className="text-muted-foreground hover:text-foreground">
                  Contact
                </a>
                {branch.website && (
                  <a href={branch.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}


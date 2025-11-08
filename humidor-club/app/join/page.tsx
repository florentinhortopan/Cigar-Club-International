import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

interface JoinPageProps {
  searchParams?: {
    branchId?: string;
    branchSlug?: string;
    branchName?: string;
  };
}

const FALLBACK_ROUTE = '/dashboard';

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const branchId = searchParams?.branchId;
  const branchSlugParam = searchParams?.branchSlug;
  const branchNameParam = searchParams?.branchName;

  if (!branchId) {
    redirect(FALLBACK_ROUTE);
  }

  const session = await getServerSession(authOptions);
  const callbackParams = new URLSearchParams();
  callbackParams.set('branchId', branchId);
  if (branchSlugParam) callbackParams.set('branchSlug', branchSlugParam);
  if (branchNameParam) callbackParams.set('branchName', branchNameParam);

  const callbackUrl = `/join?${callbackParams.toString()}`;

  if (!session?.user?.id) {
    const signInParams = new URLSearchParams();
    signInParams.set('callbackUrl', callbackUrl);
    signInParams.set('branchId', branchId);
    if (branchSlugParam) signInParams.set('branchSlug', branchSlugParam);
    if (branchNameParam) signInParams.set('branchName', branchNameParam);
    redirect(`/sign-in?${signInParams.toString()}`);
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch || !branch.is_active) {
    redirect(FALLBACK_ROUTE);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { branch_id: true },
  });

  if (user?.branch_id !== branchId) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { branch_id: branchId },
    });

    const newBranchMemberCount = await prisma.user.count({
      where: { branch_id: branchId },
    });

    await prisma.branch.update({
      where: { id: branchId },
      data: { member_count: newBranchMemberCount },
    });

    if (user?.branch_id && user.branch_id !== branchId) {
      const previousBranchMemberCount = await prisma.user.count({
        where: { branch_id: user.branch_id },
      });

      await prisma.branch.update({
        where: { id: user.branch_id },
        data: { member_count: previousBranchMemberCount },
      });
    }
  }

  const destination = branchSlugParam ? `/${branchSlugParam}` : '/dashboard';
  redirect(destination);
}


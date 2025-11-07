import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const FIELD_MAP: Record<
  string,
  {
    column: keyof Prisma.CigarSelect;
    scalar: Prisma.CigarScalarFieldEnum;
  }
> = {
  vitola: { column: 'vitola', scalar: Prisma.CigarScalarFieldEnum.vitola },
  country: { column: 'country', scalar: Prisma.CigarScalarFieldEnum.country },
  origin: { column: 'country', scalar: Prisma.CigarScalarFieldEnum.country },
  wrapper: { column: 'wrapper', scalar: Prisma.CigarScalarFieldEnum.wrapper },
  binder: { column: 'binder', scalar: Prisma.CigarScalarFieldEnum.binder },
  filler: { column: 'filler', scalar: Prisma.CigarScalarFieldEnum.filler },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const fieldParam = searchParams.get('field');
    const search = searchParams.get('search')?.trim() ?? '';
    const fieldConfig = fieldParam ? FIELD_MAP[fieldParam] : undefined;

    if (!fieldConfig) {
      return NextResponse.json(
        { success: false, error: 'Unsupported field' },
        { status: 400 }
      );
    }

    const whereClauses: Prisma.CigarWhereInput[] = [];

    whereClauses.push({
      [fieldConfig.column]: {
        not: null,
      },
    } as Prisma.CigarWhereInput);

    if (search) {
      whereClauses.push({
        [fieldConfig.column]: {
          contains: search,
          mode: 'insensitive',
        },
      } as Prisma.CigarWhereInput);
    }

    const rawResults = await prisma.cigar.findMany({
      where: { AND: whereClauses },
      select: {
        [fieldConfig.column]: true,
      },
      distinct: [fieldConfig.scalar],
      orderBy: {
        [fieldConfig.column]: 'asc',
      },
      take: 25,
    } as Prisma.CigarFindManyArgs);

    const results = rawResults as unknown as Array<Record<string, string | null>>;

    const suggestions = results
      .map((item) => {
        const value = item[fieldConfig.column as string];
        return typeof value === 'string' && value.trim().length > 0 ? value : null;
      })
      .filter((value): value is string => value !== null);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Error in GET /api/cigars/suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}



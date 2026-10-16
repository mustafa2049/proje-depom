import { Prisma, type CEFRLevel, type PrismaClient, type User } from '@prisma/client';

import { ConflictError, NotFoundError, UnauthorizedError } from '../lib/errors';
import { hashPassword, verifyPassword } from '../lib/password';
import type { TokenPair, TokenService } from '../lib/tokens';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  currentLevel: CEFRLevel;
  dailyGoalCards: number;
  streakCount: number;
  lastStudyDate: Date | null;
  createdAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    currentLevel: user.currentLevel,
    dailyGoalCards: user.dailyGoalCards,
    streakCount: user.streakCount,
    lastStudyDate: user.lastStudyDate,
    createdAt: user.createdAt,
  };
}

export interface AuthResult extends TokenPair {
  user: PublicUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  currentLevel: CEFRLevel;
  dailyGoalCards: number;
}

export interface AuthContext {
  db: PrismaClient;
  tokens: TokenService;
}

/** Kullanıcı bulunamadığında da hash karşılaştırması yapmak için (zamanlama saldırısını zorlaştırır). */
let dummyHashPromise: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword('dummy-password-for-timing');
  return dummyHashPromise;
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function registerUser(ctx: AuthContext, input: RegisterInput): Promise<AuthResult> {
  const existing = await ctx.db.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) {
    throw new ConflictError('Bu e-posta adresi zaten kayıtlı');
  }

  const passwordHash = await hashPassword(input.password);

  let user: User;
  try {
    user = await ctx.db.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        currentLevel: input.currentLevel,
        dailyGoalCards: input.dailyGoalCards,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('Bu e-posta adresi zaten kayıtlı');
    }
    throw error;
  }

  return { user: toPublicUser(user), ...ctx.tokens.issue(user.id) };
}

export async function loginUser(ctx: AuthContext, email: string, password: string): Promise<AuthResult> {
  const user = await ctx.db.user.findUnique({ where: { email } });

  const valid = await verifyPassword(password, user ? user.passwordHash : await getDummyHash());
  if (!user || !valid) {
    throw new UnauthorizedError('E-posta veya şifre hatalı');
  }

  return { user: toPublicUser(user), ...ctx.tokens.issue(user.id) };
}

export async function refreshSession(ctx: AuthContext, refreshToken: string): Promise<AuthResult> {
  const userId = ctx.tokens.verifyRefreshToken(refreshToken);

  const user = await ctx.db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedError('Oturum geçersiz');
  }

  return { user: toPublicUser(user), ...ctx.tokens.issue(user.id) };
}

export async function getCurrentUser(db: PrismaClient, userId: string): Promise<PublicUser> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('Kullanıcı bulunamadı');
  }
  return toPublicUser(user);
}

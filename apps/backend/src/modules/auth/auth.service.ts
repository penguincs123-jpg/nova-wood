// =============================================================
// Nova Wood — Auth Module: Service
// Business logic for registration, login, token management
// =============================================================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@config/database';
import { env } from '@config/env';
import { ConflictError, UnauthorizedError, NotFoundError } from '@core/errors';
import type { AuthTokens, JwtPayload, Role } from '@nova-wood/types';
import type { RegisterDto, LoginDto } from './auth.schema';

const BCRYPT_ROUNDS = 12;

export class AuthService {
  /** Register a new customer account */
  async register(dto: RegisterDto): Promise<{ user: object; tokens: AuthTokens }> {
    // Check for existing email
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Create user + profile in a transaction
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: 'CUSTOMER',
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            preferredLocale: env.DEFAULT_LOCALE,
          },
        },
      },
      include: { profile: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role as Role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /** Authenticate user and return tokens */
  async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<{ user: object; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been suspended');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role as Role, userAgent, ipAddress);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /** Generate a new access token using a valid refresh token */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Verify the token signature
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', 'TOKEN_EXPIRED');
    }

    // Check token exists in DB and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token is no longer valid', 'TOKEN_EXPIRED');
    }

    // Revoke old token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new token pair
    return this.generateTokens(payload.sub, payload.email, payload.role as Role);
  }

  /** Revoke a refresh token (logout) */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  /** Get user profile by ID */
  async getProfile(userId: string): Promise<object> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new NotFoundError('User');

    return this.sanitizeUser(user);
  }

  // ---- Private Helpers ----

  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthTokens> {
    const jti = uuidv4();

    const accessToken = jwt.sign(
      { sub: userId, email, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { sub: userId, email, role, jti },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Persist refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /** Remove sensitive fields from user object */
  private sanitizeUser(user: { id: string; email: string; role: string; avatar: string | null; isActive: boolean; createdAt: Date; profile?: unknown }) {
    const { ...safe } = user;
    return safe;
  }
}

export const authService = new AuthService();

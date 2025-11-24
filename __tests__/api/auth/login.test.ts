/**
 * Tests Unitarios: API Route - POST /api/auth/login
 * Prioridad: CRÍTICA
 * Cobertura: Autenticación, validación, seguridad
 */

import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';
import { db } from '@/config/db';
import { usersTable, userCompaniesTable, rolesTable } from '@/config/schema';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';

// Mocks
jest.mock('@/config/db');
jest.mock('@/lib/auth');
jest.mock('bcryptjs');

describe('POST /api/auth/login', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    isActive: true,
    emailVerified: true,
  };

  const mockUserCompany = {
    id: 'uc-123',
    userId: 'user-123',
    companyId: 'company-123',
    roleId: 'role-123',
    isActive: true,
  };

  const mockRole = {
    id: 'role-123',
    name: 'admin',
    permissions: ['courses:read', 'courses:write'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ Casos de Éxito', () => {
    it('debería autenticar usuario con credenciales válidas', async () => {
      // Arrange
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      (db.select as jest.Mock) = mockDb.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockResolvedValue('access-token');
      (generateRefreshToken as jest.Mock).mockResolvedValue('refresh-token');

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('exitoso');
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('debería establecer cookies de autenticación', async () => {
      // Arrange
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      (db.select as jest.Mock) = mockDb.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockResolvedValue('access-token');
      (generateRefreshToken as jest.Mock).mockResolvedValue('refresh-token');

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);

      // Assert
      const cookies = response.headers.get('set-cookie');
      expect(cookies).toBeDefined();
      expect(cookies).toContain('accessToken');
      expect(cookies).toContain('refreshToken');
    });
  });

  describe('❌ Casos de Error - Validación', () => {
    it('debería rechazar request sin email', async () => {
      // Arrange
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });

    it('debería rechazar request sin password', async () => {
      // Arrange
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('password');
    });

    it('debería rechazar email con formato inválido', async () => {
      // Arrange
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('debería rechazar password vacío', async () => {
      // Arrange
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('❌ Casos de Error - Autenticación', () => {
    it('debería rechazar usuario inexistente', async () => {
      // Arrange
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]), // Usuario no encontrado
      };

      (db.select as jest.Mock) = mockDb.select;

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Credenciales');
    });

    it('debería rechazar contraseña incorrecta', async () => {
      // Arrange
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      (db.select as jest.Mock) = mockDb.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Contraseña incorrecta

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword!',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('debería rechazar usuario inactivo', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([inactiveUser]),
      };

      (db.select as jest.Mock) = mockDb.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('inactivo');
    });
  });

  describe('🔒 Seguridad', () => {
    it('no debería revelar si el usuario existe o no', async () => {
      // Arrange - Usuario no existe
      const mockDb1 = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      (db.select as jest.Mock) = mockDb1.select;

      const req1 = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const response1 = await POST(req1);
      const data1 = await response1.json();

      // Arrange - Usuario existe pero contraseña incorrecta
      const mockDb2 = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      (db.select as jest.Mock) = mockDb2.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const req2 = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword!',
        }),
      });

      const response2 = await POST(req2);
      const data2 = await response2.json();

      // Assert - Ambos errores deberían ser genéricos e iguales
      expect(data1.error).toBe(data2.error);
      expect(response1.status).toBe(response2.status);
    });

    it('debería sanitizar input de usuario', async () => {
      // Arrange
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '<script>alert("xss")</script>@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(400);
      // El email debe ser validado y rechazado por formato inválido
    });

    it('debería prevenir timing attacks en comparación de contraseñas', async () => {
      // Este test verifica que usamos bcrypt.compare que es timing-safe
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      (db.select as jest.Mock) = mockDb.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      await POST(req);

      // Assert - Verificar que se usó bcrypt.compare (timing-safe)
      expect(bcrypt.compare).toHaveBeenCalledWith('Test1234!', mockUser.passwordHash);
    });
  });

  describe('⚡ Performance', () => {
    it('debería responder en menos de 500ms', async () => {
      // Arrange
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      (db.select as jest.Mock) = mockDb.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockResolvedValue('access-token');
      (generateRefreshToken as jest.Mock).mockResolvedValue('refresh-token');

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const startTime = Date.now();
      await POST(req);
      const endTime = Date.now();

      // Assert
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('🔄 Edge Cases', () => {
    it('debería manejar JSON malformado', async () => {
      // Arrange
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: 'invalid json',
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(400);
    });

    it('debería manejar error de base de datos', async () => {
      // Arrange
      (db.select as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(500);
    });

    it('debería manejar campos extra en el body', async () => {
      // Arrange
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      (db.select as jest.Mock) = mockDb.select;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockResolvedValue('access-token');
      (generateRefreshToken as jest.Mock).mockResolvedValue('refresh-token');

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234!',
          extraField: 'should be ignored',
          maliciousData: '<script>alert("xss")</script>',
        }),
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(200);
      // Los campos extra deben ser ignorados
    });
  });
});


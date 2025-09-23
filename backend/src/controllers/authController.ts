import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    numeroEmpleado: string;
    rol: string;
  };
  token: string;
  refreshToken?: string;
}

export class AuthController {
  
  static async login(req: Request, res: Response): Promise<void> {
    console.log("🔐 Login attempt received");
    console.log("Body:", req.body);
    
    try {
      const { email, password }: LoginDto = req.body;

      console.log("Email:", email, "Password length:", password?.length);

      if (!email || !password) {
        console.log("❌ Missing email or password");
        res.status(400).json({
          error: 'Email y contraseña son requeridos'
        });
        return;
      }

      console.log("🔍 Searching user in database...");
      // Buscar usuario por email
      const userQuery = 'SELECT * FROM usuarios WHERE email = $1 AND activo = true';
      const userResult = await pool.query(userQuery, [email]);

      console.log("User query result:", userResult.rows.length, "rows");

      if (userResult.rows.length === 0) {
        console.log("❌ User not found");
        res.status(401).json({
          error: 'Credenciales inválidas'
        });
        return;
      }

      const user = userResult.rows[0];
      console.log("✅ User found:", user.email);

      // Verificar contraseña
      console.log("🔐 Verifying password...");
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log("Password valid:", isPasswordValid);
      
      if (!isPasswordValid) {
        console.log("❌ Invalid password");
        res.status(401).json({
          error: 'Credenciales inválidas'
        });
        return;
      }

      // Generar tokens
      console.log("🔑 Generating tokens...");
      const jwtSecret = process.env.JWT_SECRET;
      const refreshSecret = process.env.JWT_REFRESH_SECRET;

      console.log("JWT_SECRET exists:", !!jwtSecret);
      console.log("JWT_REFRESH_SECRET exists:", !!refreshSecret);

      if (!jwtSecret || !refreshSecret) {
        console.log("❌ JWT configuration missing");
        res.status(500).json({
          error: 'Configuración de JWT no válida'
        });
        return;
      }

      const tokenPayload = { 
        id: user.id,
        userId: user.id, 
        email: user.email, 
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        dias_disponibles: user.dias_disponibles
      };

      console.log("Token payload:", tokenPayload);

      const token = jwt.sign(tokenPayload, jwtSecret, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
      } as any);

      const refreshToken = jwt.sign({ userId: user.id }, refreshSecret, { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' 
      } as any);

      console.log("✅ Tokens generated successfully");

      // Remover password del objeto usuario
      const { password_hash: _, ...userWithoutPassword } = user;

      const authResponse: AuthResponse = {
        user: userWithoutPassword,
        token,
        refreshToken
      };

      console.log("✅ Sending successful response");
      res.status(200).json({
        message: 'Login exitoso',
        data: authResponse
      });

    } catch (error) {
      console.error('💥 Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Refresh token requerido'
        });
        return;
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, async (err: any, decoded: any) => {
        if (err) {
          res.status(403).json({
            error: 'Refresh token inválido'
          });
          return;
        }

        // Buscar usuario
        const userQuery = 'SELECT * FROM usuarios WHERE id = $1 AND activo = true';
        const userResult = await pool.query(userQuery, [decoded.userId]);

        if (userResult.rows.length === 0) {
          res.status(404).json({
            error: 'Usuario no encontrado'
          });
          return;
        }

        const user = userResult.rows[0];

        // Generar nuevo token
        const newToken = jwt.sign(
          { 
            id: user.id,
            userId: user.id, 
            email: user.email, 
            nombre: user.nombre,
            apellido: user.apellido,
            rol: user.rol,
            dias_disponibles: user.dias_disponibles
          },
          process.env.JWT_SECRET as string,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
        );

        res.status(200).json({
          message: 'Token renovado exitosamente',
          data: { token: newToken }
        });
      });

    } catch (error) {
      console.error('Error en refresh token:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'No autenticado'
        });
        return;
      }

      const userQuery = 'SELECT * FROM usuarios WHERE id = $1 AND activo = true';
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        res.status(404).json({
          error: 'Usuario no encontrado'
        });
        return;
      }

      const user = userResult.rows[0];
      const { password_hash: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: 'Perfil obtenido exitosamente',
        data: userWithoutPassword
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (userId) {
        // Actualizar último acceso del usuario
        await pool.query(
          'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );
      }

      // En un sistema más complejo, aquí invalidaríamos el token en una blacklist
      // Por ahora, simplemente enviamos una respuesta exitosa
      res.status(200).json({
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  static async validateToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
        return;
      }

      const userQuery = 'SELECT id, email, nombre, apellido, rol, activo FROM usuarios WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0 || !userResult.rows[0].activo) {
        res.status(401).json({
          success: false,
          message: 'Usuario no válido'
        });
        return;
      }

      const user = userResult.rows[0];

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            rol: user.rol
          }
        },
        message: 'Token válido'
      });

    } catch (error) {
      console.error('Error validando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
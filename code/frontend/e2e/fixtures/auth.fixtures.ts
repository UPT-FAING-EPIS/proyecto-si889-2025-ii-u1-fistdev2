/**
 * Fixtures para pruebas de autenticación
 */

export const testUsers = {
  admin: {
    email: 'admin@devflow.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin'
  },
  user: {
    email: 'usuario@devflow.com',
    password: 'usuario123',
    name: 'Usuario Regular',
    role: 'user'
  },
  projectManager: {
    email: 'pm@devflow.com',
    password: 'manager123',
    name: 'Project Manager',
    role: 'project_manager'
  }
};

export const invalidCredentials = {
  email: 'noexiste@devflow.com',
  password: 'passwordinvalida'
};

export const registrationData = {
  validUser: {
    email: 'nuevo@devflow.com',
    password: 'Nuevo123!',
    name: 'Usuario Nuevo',
    confirmPassword: 'Nuevo123!'
  },
  invalidEmail: {
    email: 'correo-invalido',
    password: 'Nuevo123!',
    name: 'Usuario Inválido',
    confirmPassword: 'Nuevo123!'
  },
  passwordMismatch: {
    email: 'otro@devflow.com',
    password: 'Password1!',
    name: 'Usuario Contraseña',
    confirmPassword: 'Password2!'
  },
  weakPassword: {
    email: 'debil@devflow.com',
    password: '12345',
    name: 'Usuario Débil',
    confirmPassword: '12345'
  }
};
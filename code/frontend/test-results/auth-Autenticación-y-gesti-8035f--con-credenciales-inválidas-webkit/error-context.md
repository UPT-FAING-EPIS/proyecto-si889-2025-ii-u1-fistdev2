# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]: DevFlow
      - heading "Iniciar Sesión" [level=2] [ref=e7]
      - paragraph [ref=e8]: Accede a tu cuenta DevFlow
    - paragraph [ref=e10]: 💡 Solo el administrador tiene acceso completo al sistema y FastAPI
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Email
        - textbox "Email" [active] [ref=e15]
      - generic [ref=e16]:
        - generic [ref=e17]: Contraseña
        - textbox "Contraseña" [ref=e18]: passwordinvalida
      - button "Iniciar Sesión" [ref=e20] [cursor=pointer]
      - generic [ref=e22]:
        - text: ¿No tienes cuenta?
        - link "Regístrate aquí" [ref=e23]:
          - /url: /auth/register
    - paragraph [ref=e25]: DevFlow System v1.0 - Sistema de Gestión de Proyectos
  - alert [ref=e26]
```
# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]: DevFlow
      - heading "Iniciar Sesión" [level=2] [ref=e8]
      - paragraph [ref=e9]: Accede a tu cuenta DevFlow
    - paragraph [ref=e11]: 💡 Solo el administrador tiene acceso completo al sistema y FastAPI
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: Email
        - textbox "Email" [ref=e16]
      - generic [ref=e17]:
        - generic [ref=e18]: Contraseña
        - textbox "Contraseña" [ref=e19]
      - button "Iniciar Sesión" [ref=e21] [cursor=pointer]
      - generic [ref=e23]:
        - text: ¿No tienes cuenta?
        - link "Regístrate aquí" [ref=e24] [cursor=pointer]:
          - /url: /auth/register
    - paragraph [ref=e26]: DevFlow System v1.0 - Sistema de Gestión de Proyectos
```
# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e5]:
      - heading "Crear Cuenta" [level=2] [ref=e6]
      - paragraph [ref=e7]: Regístrate en DevFlow System
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Nombre completo
          - textbox "Nombre completo" [active] [ref=e12]
        - generic [ref=e13]:
          - generic [ref=e14]: Email
          - textbox "Email" [ref=e15]: correo-invalido
        - generic [ref=e16]:
          - generic [ref=e17]: Nombre de usuario
          - textbox "Nombre de usuario" [ref=e18]
        - generic [ref=e19]:
          - generic [ref=e20]: Contraseña
          - textbox "Contraseña" [ref=e21]: Nuevo123!
        - generic [ref=e22]:
          - generic [ref=e23]: Confirmar contraseña
          - textbox "Confirmar contraseña" [ref=e24]: Nuevo123!
      - button "Crear Cuenta" [ref=e26] [cursor=pointer]
      - generic [ref=e27]:
        - paragraph [ref=e28]:
          - text: ¿Ya tienes cuenta?
          - link "Inicia sesión aquí" [ref=e29]:
            - /url: /auth/login
        - paragraph [ref=e30]:
          - link "← Volver al Dashboard" [ref=e31]:
            - /url: /dashboard
    - generic [ref=e32]:
      - heading "ℹ️ Información:" [level=3] [ref=e33]
      - paragraph [ref=e34]: Este es un sistema de desarrollo. Los datos se almacenan en modo simulado.
  - alert [ref=e35]
```
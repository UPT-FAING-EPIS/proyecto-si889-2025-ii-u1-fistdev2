from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import jwt
import uvicorn
import os
from datetime import datetime

# Configuración
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-here')
ALGORITHM = "HS256"

app = FastAPI(
    title="DevFlow Admin API",
    description="API de administración exclusiva para usuarios con permisos de administrador",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # URLs del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Esquemas Pydantic
class AdminInfo(BaseModel):
    message: str
    admin_user: Dict[str, Any]
    timestamp: str

class SystemStatus(BaseModel):
    status: str
    services: Dict[str, str]
    uptime: float
    environment: str
    fastapi_version: str

class LogEntry(BaseModel):
    level: str
    message: str
    timestamp: str
    service: str

# Seguridad
security = HTTPBearer()

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verificar que el token JWT sea válido y que el usuario sea administrador
    """
    try:
        # Decodificar el token JWT
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        
        # Verificar que el usuario sea administrador
        if payload.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: Se requieren permisos de administrador"
            )
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

@app.get("/")
async def root():
    """
    Endpoint raíz - información básica de la API
    """
    return {
        "message": "DevFlow Admin API",
        "version": "1.0.0",
        "description": "API exclusiva para administradores del sistema DevFlow",
        "docs": "/docs",
        "redoc": "/redoc",
        "access": "admin-only"
    }

@app.get("/admin/verify", response_model=AdminInfo)
async def verify_admin(admin_user: dict = Depends(verify_admin_token)):
    """
    Verificar el acceso de administrador
    """
    return AdminInfo(
        message="Acceso de administrador verificado correctamente",
        admin_user={
            "id": admin_user.get("sub"),
            "email": admin_user.get("email"),
            "nombre": admin_user.get("nombre"),
            "role": admin_user.get("role")
        },
        timestamp=datetime.now().isoformat()
    )

@app.get("/admin/system-status", response_model=SystemStatus)
async def get_system_status(admin_user: dict = Depends(verify_admin_token)):
    """
    Obtener el estado completo del sistema
    Solo accesible para administradores
    """
    import psutil
    import time
    
    return SystemStatus(
        status="operational",
        services={
            "fastapi": "running",
            "nestjs_backend": "running",
            "nextjs_frontend": "running",
            "database": "in-memory",
            "authentication": "active"
        },
        uptime=time.time(),
        environment=os.getenv("ENVIRONMENT", "development"),
        fastapi_version="0.104.1"
    )

@app.get("/admin/logs")
async def get_system_logs(
    limit: int = 50,
    level: Optional[str] = None,
    admin_user: dict = Depends(verify_admin_token)
):
    """
    Obtener logs del sistema
    Solo accesible para administradores
    """
    # En producción, esto se conectaría a un sistema de logs real
    sample_logs = [
        LogEntry(
            level="INFO",
            message="Sistema iniciado correctamente",
            timestamp=datetime.now().isoformat(),
            service="DevFlow-System"
        ),
        LogEntry(
            level="INFO",
            message=f"Usuario admin {admin_user.get('email')} accedió a FastAPI",
            timestamp=datetime.now().isoformat(),
            service="FastAPI-Admin"
        ),
        LogEntry(
            level="INFO",
            message="Autenticación JWT validada correctamente",
            timestamp=datetime.now().isoformat(),
            service="Auth-Service"
        )
    ]
    
    if level:
        sample_logs = [log for log in sample_logs if log.level.lower() == level.lower()]
    
    return {
        "logs": sample_logs[:limit],
        "total": len(sample_logs),
        "requested_by": admin_user.get("email"),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/admin/users")
async def get_all_users(admin_user: dict = Depends(verify_admin_token)):
    """
    Obtener lista de todos los usuarios del sistema
    Solo accesible para administradores
    """
    # En producción, esto consultaría la base de datos real
    mock_users = [
        {
            "id": "admin-001",
            "email": "admin@devflow.com",
            "nombre": "Administrador DevFlow",
            "role": "admin",
            "isActive": True,
            "createdAt": "2024-01-01T00:00:00Z"
        },
        {
            "id": "user-001",
            "email": "user@devflow.com",
            "nombre": "Usuario Demo",
            "role": "user",
            "isActive": True,
            "createdAt": "2024-01-01T00:00:00Z"
        }
    ]
    
    return {
        "users": mock_users,
        "total": len(mock_users),
        "admin_query_by": admin_user.get("email"),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/admin/system/restart")
async def restart_system(admin_user: dict = Depends(verify_admin_token)):
    """
    Simular reinicio del sistema
    Solo accesible para administradores
    """
    return {
        "message": "Comando de reinicio del sistema ejecutado",
        "status": "scheduled",
        "executed_by": admin_user.get("email"),
        "timestamp": datetime.now().isoformat(),
        "note": "En producción, esto ejecutaría un reinicio real del sistema"
    }

if __name__ == "__main__":
    port = int(os.getenv("FASTAPI_PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

# Dockerfile para FastAPI Admin Service
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Actualizar pip
RUN pip install --upgrade pip

# Copiar archivos de requirements
COPY requirements.txt .

# Instalar dependencias de Python con timeout extendido
RUN pip install --no-cache-dir --timeout 300 -r requirements.txt

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

# Exponer puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

-- Script de inicialización de base de datos para DevFlow
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

\echo 'Iniciando configuración de base de datos DevFlow...'

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear esquemas adicionales si es necesario
-- CREATE SCHEMA IF NOT EXISTS analytics;
-- CREATE SCHEMA IF NOT EXISTS audit;

-- Configurar timezone
SET timezone TO 'UTC';

-- Crear índices adicionales para optimización
-- (Los índices principales se crean automáticamente por Prisma)

\echo 'Configuración inicial completada.'

-- Crear usuario adicional para lecturas (opcional)
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'devflow_reader') THEN
--         CREATE ROLE devflow_reader WITH LOGIN PASSWORD 'reader_password';
--         GRANT CONNECT ON DATABASE devflow TO devflow_reader;
--         GRANT USAGE ON SCHEMA public TO devflow_reader;
--         GRANT SELECT ON ALL TABLES IN SCHEMA public TO devflow_reader;
--         ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO devflow_reader;
--     END IF;
-- END
-- $$;

-- Configuraciones de performance para PostgreSQL
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Configuración de logging (simplificada para Docker)
-- ALTER SYSTEM SET log_destination = 'stderr';
-- ALTER SYSTEM SET logging_collector = on;
-- ALTER SYSTEM SET log_directory = '/var/log/postgresql';
-- ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
-- ALTER SYSTEM SET log_statement = 'mod';
-- ALTER SYSTEM SET log_min_duration_statement = 1000;

\echo 'Base de datos DevFlow configurada exitosamente.'

-- =============================================
-- TABLA DE CERTIFICADOS - Ejecutar en Supabase
-- =============================================

-- Crear tabla de certificados
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certificate_number TEXT UNIQUE NOT NULL,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver sus propios certificados
CREATE POLICY "Users can view own certificates" ON certificates
    FOR SELECT
    USING (auth.uid() = user_id);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);

-- =============================================
-- FUNCIÓN PARA GENERAR NÚMERO DE CERTIFICADO
-- =============================================

CREATE OR REPLACE FUNCTION generate_certificate_number(course_id UUID, user_id UUID)
RETURNS TEXT AS $$
DECLARE
    course_prefix TEXT;
    year_text TEXT;
    random_part TEXT;
    result TEXT;
BEGIN
    -- Obtener prefijo del curso (primeras 3 letras del título en mayúsculas)
    SELECT UPPER(LEFT(title, 3)) INTO course_prefix
    FROM courses
    WHERE id = course_id;
    
    -- Año actual
    year_text := TO_CHAR(NOW(), 'YY');
    
    -- Parte aleatoria
    random_part := UPPER(MD5(RANDOM()::TEXT || NOW()::TEXT))[1:6];
    
    -- Combinar
    result := course_prefix || '-' || year_text || '-' || random_part;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN PARA VERIFICAR SI EXISTE CERTIFICADO
-- =============================================

CREATE OR REPLACE FUNCTION has_certificate(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    exists_cert BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM certificates 
        WHERE user_id = has_certificate.user_id 
        AND course_id = has_certificate.course_id
    ) INTO exists_cert;
    
    RETURN exists_cert;
END;
$$ LANGUAGE plpgsql;
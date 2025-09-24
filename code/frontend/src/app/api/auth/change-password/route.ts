import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const body = await request.json();

    // Validar que se proporcionen las contraseñas
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva contraseña son requeridas' },
        { status: 400 }
      );
    }

    // Reenviar la solicitud al backend
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/change-password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Error cambiando contraseña' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en API de cambio de contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
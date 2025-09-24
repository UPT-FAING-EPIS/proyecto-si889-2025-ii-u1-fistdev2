// API route para validar usuarios
// /api/auth/validate-user/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        exists: false,
        message: 'Formato de email inválido'
      });
    }

    // Consultar el backend real para validar el usuario
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/find-user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return NextResponse.json({
          exists: true,
          name: userData.name || userData.username,
          email: userData.email,
          id: userData.id
        });
      } else if (response.status === 404) {
        return NextResponse.json({
          exists: false,
          message: 'Usuario no encontrado'
        });
      } else {
        throw new Error('Error del servidor');
      }
    } catch (fetchError) {
      console.error('Error consultando backend:', fetchError);
      return NextResponse.json({
        exists: false,
        message: 'Error verificando usuario'
      });
    }

  } catch (error) {
    console.error('Error validating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

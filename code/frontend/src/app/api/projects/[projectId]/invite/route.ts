// API route para manejar invitaciones de proyecto
// /api/projects/[projectId]/invite/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await request.json();
    const { emails, role = 'MEMBER' } = body;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      );
    }

    // Validar formato de emails
    const validEmails = emails.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid emails provided' },
        { status: 400 }
      );
    }

    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Enviar invitaciones al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/projects/${projectId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: validEmails,
          role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
        return NextResponse.json(errorData, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (fetchError) {
      console.error('Error enviando invitaciones al backend:', fetchError);
      return NextResponse.json(
        { error: 'Error enviando invitaciones' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

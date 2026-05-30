import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.SITE_PASSWORD || 'bomboaccess';

    if (password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      
      // Set the authorization cookie for 30 days
      response.cookies.set('site_authorized', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Código de acceso incorrecto.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno en el servidor.' },
      { status: 500 }
    );
  }
}

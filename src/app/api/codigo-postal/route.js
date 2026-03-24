import { NextResponse } from 'next/server';
import { provinciaDesdeCodigoPostal } from '@/lib/provinciaPorCodigoPostal';

// Localidad vía API pública; provincia según prefijo oficial del CP (no comunidad autónoma).
const ZIPPOPOTAM_ES = 'https://api.zippopotam.us/es';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const digits = (searchParams.get('cp') || '').replace(/\D/g, '');

    if (digits.length !== 5) {
      return NextResponse.json(
        { error: 'El código postal debe tener 5 dígitos.' },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${ZIPPOPOTAM_ES}/${digits}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Código postal no encontrado.' },
        { status: 404 }
      );
    }

    const data = await upstream.json();
    const place = data?.places?.[0];
    if (!place) {
      return NextResponse.json(
        { error: 'Sin datos para este código postal.' },
        { status: 404 }
      );
    }

    const localidad = place['place name']?.trim() || '';
    const provincia =
      provinciaDesdeCodigoPostal(digits) ||
      (place.state || '').trim() ||
      '';

    return NextResponse.json({
      localidad,
      provincia,
    });
  } catch (error) {
    console.error('GET /api/codigo-postal:', error);
    return NextResponse.json(
      { error: 'No se pudo consultar el código postal.' },
      { status: 502 }
    );
  }
}

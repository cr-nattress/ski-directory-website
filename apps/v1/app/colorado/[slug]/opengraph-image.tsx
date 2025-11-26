import { ImageResponse } from 'next/og';
import { getResortBySlug } from '@/lib/mock-data';

export const runtime = 'edge';
export const alt = 'Resort Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const resort = getResortBySlug(params.slug);

  if (!resort) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e40af',
          }}
        >
          <div style={{ fontSize: 48, color: 'white' }}>Resort Not Found</div>
        </div>
      ),
      { ...size }
    );
  }

  // Determine pass color
  const hasEpic = resort.passAffiliations.includes('epic');
  const hasIkon = resort.passAffiliations.includes('ikon');
  const passText = hasEpic ? 'Epic Pass' : hasIkon ? 'Ikon Pass' : '';
  const passColor = hasEpic ? '#dc2626' : hasIkon ? '#f97316' : '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e40af',
          padding: '60px',
        }}
      >
        {/* Top section with logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <span style={{ fontSize: 36, marginRight: 12 }}>⛷️</span>
          <span style={{ fontSize: 28, color: '#93c5fd', fontWeight: 600 }}>
            Ski Colorado
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Resort name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}
          >
            {resort.name}
          </div>

          {/* Location */}
          <div
            style={{
              fontSize: 32,
              color: '#93c5fd',
              marginBottom: '30px',
            }}
          >
            {resort.nearestCity}, Colorado
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 40, fontWeight: 'bold', color: 'white' }}>
                {resort.stats.skiableAcres.toLocaleString()}
              </span>
              <span style={{ fontSize: 18, color: '#93c5fd' }}>Skiable Acres</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 40, fontWeight: 'bold', color: 'white' }}>
                {resort.stats.verticalDrop.toLocaleString()}'
              </span>
              <span style={{ fontSize: 18, color: '#93c5fd' }}>Vertical Drop</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 40, fontWeight: 'bold', color: 'white' }}>
                {resort.stats.runsCount}
              </span>
              <span style={{ fontSize: 18, color: '#93c5fd' }}>Runs</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 40, fontWeight: 'bold', color: '#4ade80' }}>
                ★ {resort.rating}
              </span>
              <span style={{ fontSize: 18, color: '#93c5fd' }}>Rating</span>
            </div>
          </div>
        </div>

        {/* Bottom section with pass badge */}
        {passText && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: passColor,
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {passText}
            </div>
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}

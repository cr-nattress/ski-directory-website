import { ImageResponse } from 'next/og';
import { getResortBySlug } from '@/lib/services/resort-service';

export const runtime = 'edge';
export const alt = 'Ski Resort Information';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getPassColor(pass: string): string {
  switch (pass) {
    case 'epic':
      return '#dc2626';
    case 'ikon':
      return '#f97316';
    case 'indy':
      return '#22c55e';
    case 'mountain-collective':
      return '#10b981';
    default:
      return '#3b82f6';
  }
}

function getPassLabel(pass: string): string {
  switch (pass) {
    case 'epic':
      return 'Epic';
    case 'ikon':
      return 'Ikon';
    case 'mountain-collective':
      return 'Mtn Collective';
    default:
      return pass.charAt(0).toUpperCase() + pass.slice(1);
  }
}

export default async function Image({
  params,
}: {
  params: { country: string; state: string; slug: string };
}) {
  const resortData = await getResortBySlug(params.slug);

  if (!resortData) {
    // Return default OG image for not found
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 64,
            fontWeight: 'bold',
          }}
        >
          Ski Directory
        </div>
      ),
      { ...size }
    );
  }

  const stateName = resortData.state_name || params.state;
  const nearestCity = resortData.nearest_city || '';
  const skiableAcres = resortData.stats?.skiableAcres || 0;
  const runsCount = resortData.stats?.runsCount || 0;
  const verticalDrop = resortData.stats?.verticalDrop || 0;
  const liftsCount = resortData.stats?.liftsCount || 0;
  const passAffiliations = (resortData.pass_affiliations || []) as string[];

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Resort Name and Location */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                marginBottom: 8,
                lineHeight: 1.1,
              }}
            >
              {resortData.name}
            </div>
            <div
              style={{
                fontSize: 28,
                opacity: 0.8,
              }}
            >
              {nearestCity ? `${nearestCity}, ` : ''}
              {stateName}
            </div>
          </div>

          {/* Pass Badges */}
          <div style={{ display: 'flex', gap: 8 }}>
            {passAffiliations.slice(0, 2).map((pass) => (
              <div
                key={pass}
                style={{
                  background: getPassColor(pass),
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {getPassLabel(pass)}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row - centered in the middle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 'auto',
            marginBottom: 'auto',
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          {/* Skiable Acres */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>
              {skiableAcres.toLocaleString()}
            </div>
            <div style={{ fontSize: 18, opacity: 0.7, marginTop: 4 }}>
              Skiable Acres
            </div>
          </div>

          {/* Runs */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>{runsCount}</div>
            <div style={{ fontSize: 18, opacity: 0.7, marginTop: 4 }}>Runs</div>
          </div>

          {/* Vertical Drop */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>
              {verticalDrop.toLocaleString()}&apos;
            </div>
            <div style={{ fontSize: 18, opacity: 0.7, marginTop: 4 }}>
              Vertical Drop
            </div>
          </div>

          {/* Lifts */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>{liftsCount}</div>
            <div style={{ fontSize: 18, opacity: 0.7, marginTop: 4 }}>Lifts</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 22, opacity: 0.6 }}>skidirectory.org</div>
          {/* Mountain icon or logo placeholder */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 22,
              opacity: 0.8,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
            </svg>
            Ski Directory
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

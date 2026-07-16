/**
 * Shown at /studio before a Sanity project is connected.
 *
 * Styles are inline on purpose: this route never loads the site's Tailwind
 * bundle (the Studio ships its own styling), so the notice has to stand alone.
 * Colours are the logo palette: navy #0B1425, gold #BC8F43, sand #FEFEFE.
 */

const code: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  background: '#071023',
  border: '1px solid #1E2C42',
  color: '#DFB764',
  padding: '2px 6px',
  borderRadius: 6,
  fontSize: 13,
};

export function StudioNotConfigured() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(120% 120% at 50% 0%, #142033 0%, #0B1425 55%, #071023 100%)',
        color: '#FEFEFE',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 640, width: '100%' }}>
        <p
          style={{
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontSize: 12,
            color: '#BC8F43',
            margin: '0 0 12px',
          }}
        >
          Rise · Content Studio
        </p>
        <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: '0 0 16px', fontWeight: 700 }}>
          Connect a Sanity project to start editing
        </h1>
        <p style={{ color: '#94A0B4', lineHeight: 1.7, margin: '0 0 28px' }}>
          The site is currently serving its bundled demo portfolio, so everything
          works — but this dashboard needs a Sanity project before it can save
          anything.
        </p>

        <ol style={{ color: '#C3CAD6', lineHeight: 2, paddingInlineStart: 20, margin: '0 0 28px' }}>
          <li>
            Create a free project at{' '}
            <a href="https://sanity.io/manage" style={{ color: '#DFB764' }}>
              sanity.io/manage
            </a>
          </li>
          <li>
            Copy <span style={code}>.env.example</span> to{' '}
            <span style={code}>.env.local</span>
          </li>
          <li>
            Set <span style={code}>NEXT_PUBLIC_SANITY_PROJECT_ID</span> to your project ID
          </li>
          <li>
            Add <span style={code}>http://localhost:3000</span> under the project&apos;s
            CORS origins (with credentials allowed)
          </li>
          <li>
            Restart the dev server, then run <span style={code}>npm run seed</span> to
            load the demo properties
          </li>
        </ol>

        <div
          style={{
            borderTop: '1px solid #1E2C42',
            paddingTop: 20,
            fontSize: 13,
            color: '#5C6B85',
          }}
        >
          Full walkthrough in <span style={code}>README.md</span>.
        </div>
      </div>
    </main>
  );
}

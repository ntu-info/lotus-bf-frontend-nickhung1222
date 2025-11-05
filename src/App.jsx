import { useCallback, useRef, useState } from 'react'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { Terms } from './components/Terms'
import { QueryBuilder } from './components/QueryBuilder'
import { Studies } from './components/Studies'
import { NiiViewer } from './components/NiiViewer'
import { useUrlQueryState } from './hooks/useUrlQueryState'
import './App.css'

export default function App () {
  const [query, setQuery] = useUrlQueryState('q')
  const [isTermsVisible, setIsTermsVisible] = useState(true)

  const handlePickTerm = useCallback((t) => {
    setQuery((q) => (q ? `${q} ${t}` : t))
  }, [setQuery])

  const resetLayout = () => setSizes([28, 44, 28])

  // --- resizable panes state ---
  const gridRef = useRef(null)
  const [sizes, setSizes] = useState([28, 44, 28]) // [left, middle, right]
  const MIN_PX = 240

  const startDrag = (which, e) => {
    e.preventDefault()
    const startX = e.clientX
    const rect = gridRef.current.getBoundingClientRect()
    const total = rect.width
    const curPx = sizes.map(p => (p / 100) * total)

    const onMouseMove = (ev) => {
      const dx = ev.clientX - startX
      if (which === 0) {
        let newLeft = curPx[0] + dx
        let newMid = curPx[1] - dx
        if (newLeft < MIN_PX) { newMid -= (MIN_PX - newLeft); newLeft = MIN_PX }
        if (newMid < MIN_PX) { newLeft -= (MIN_PX - newMid); newMid = MIN_PX }
        const s0 = (newLeft / total) * 100
        const s1 = (newMid / total) * 100
        const s2 = 100 - s0 - s1
        setSizes([s0, s1, Math.max(s2, 0)])
      } else {
        let newMid = curPx[1] + dx
        let newRight = curPx[2] - dx
        if (newMid < MIN_PX) { newRight -= (MIN_PX - newMid); newMid = MIN_PX }
        if (newRight < MIN_PX) { newMid -= (MIN_PX - newRight); newRight = MIN_PX }
        const s1 = (newMid / total) * 100
        const s2 = (newRight / total) * 100
        const s0 = (curPx[0] / total) * 100
        setSizes([s0, s1, Math.max(s2, 0)])
      }
    }
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div className="app">
      {/* Inline style injection to enforce no-hover look */}
      <style>{`
        :root {
          --primary-600: #2563eb;
          --primary-700: #1d4ed8;
          --primary-800: #1e40af;
          --border: #e5e7eb;
        }
        .app { padding-right: 0 !important; }
        .app__grid { width: 100vw; max-width: 100vw; }
        .card input[type="text"],
        .card input[type="search"],
        .card input[type="number"],
        .card select,
        .card textarea {
          width: 100% !important;
          max-width: 100% !important;
          display: block;
        }
        /* Downsized buttons */
        .card button,
        .card [role="button"],
        .card .btn,
        .card .button {
          font-size: 12px !important;
          padding: 4px 8px !important;
          border-radius: 8px !important;
          line-height: 1.2 !important;
          background: var(--primary-600) !important;
          color: #fff !important;
          border: none !important;
        }
        /* No visual change on hover/active */
        .card button:hover,
        .card button:active,
        .card [role="button"]:hover,
        .card [role="button"]:active,
        .card .btn:hover,
        .card .btn:active,
        .card .button:hover,
        .card .button:active {
          background: var(--primary-600) !important;
          color: #fff !important;
        }
        /* Toolbars / chips also no-hover */
        .card .toolbar button,
        .card .toolbar [role="button"],
        .card .toolbar .btn,
        .card .toolbar .button,
        .card .qb-toolbar button,
        .card .qb-toolbar [role="button"],
        .card .qb-toolbar .btn,
        .card .qb-toolbar .button,
        .card .query-builder button,
        .card .query-builder [role="button"],
        .card .query-builder .btn,
        .card .query-builder .button,
        .card .chip,
        .card .pill,
        .card .tag {
          background: var(--primary-600) !important;
          color: #fff !important;
          border: none !important;
        }
        .card .toolbar button:hover,
        .card .qb-toolbar button:hover,
        .card .query-builder button:hover,
        .card .chip:hover,
        .card .pill:hover,
        .card .tag:hover,
        .card .toolbar button:active,
        .card .qb-toolbar button:active,
        .card .query-builder button:active {
          background: var(--primary-600) !important;
          color: #fff !important;
        }
        /* Disabled stays same color but dimmer for affordance */
        .card .toolbar button:disabled,
        .card .qb-toolbar button:disabled,
        .card .query-builder button:disabled,
        .card button[disabled],
        .card [aria-disabled="true"] {
          background: var(--primary-600) !important;
          color: #fff !important;
          opacity: .55 !important;
        }
      `}</style>

      <header className="app__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="app__title">LoTUS-BF</h1>
          <div className="app__subtitle">Location-or-Term Unified Search for Brain Functions</div>
        </div>
        <button onClick={resetLayout} style={{ padding: '4px 8px', fontSize: '12px' }}>Reset Layout</button>
      </header>

      <main className="app__grid" ref={gridRef}>
        <section
          className="card"
          style={{
            flexBasis: isTermsVisible ? `${sizes[0]}%` : 'auto',
            padding: isTermsVisible ? '12px' : '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'flex-basis 0.2s ease'
          }}
        >
          <div
            className="card__title"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isTermsVisible ? '10px' : 0
            }}
          >
            {isTermsVisible && <span>Terms</span>}
            <button
              onClick={() => setIsTermsVisible(!isTermsVisible)}
              style={{ padding: '2px 4px', fontSize: '12px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
              title={isTermsVisible ? 'Collapse' : 'Expand'}
            >
              {isTermsVisible ? <IoIosArrowBack size={16} /> : <IoIosArrowForward size={16} />}
            </button>
          </div>
          {isTermsVisible && <Terms onPickTerm={handlePickTerm} query={query} />}
        </section>

        {isTermsVisible && <div className="resizer" aria-label="Resize left/middle" onMouseDown={(e) => startDrag(0, e)} />}

        <section className="card card--stack" style={{ flexBasis: `${sizes[1]}%` }}>
          <QueryBuilder query={query} setQuery={setQuery} />
          <div className="divider" />
          <Studies query={query} />
        </section>

        <div className="resizer" aria-label="Resize middle/right" onMouseDown={(e) => startDrag(1, e)} />

        <section className="card" style={{ flexBasis: `${sizes[2]}%` }}>
          <NiiViewer query={query} />
        </section>
      </main>
    </div>
  )
}
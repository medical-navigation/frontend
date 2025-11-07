import { useEffect } from 'react'

export default function ZoomControls() {
  useEffect(() => {
    // Здесь можно подключить к Leaflet через события, если нужна синхронизация
  }, [])

  return (
    <div className="zoom-controls">
      <button className="zoom-btn" data-action="in"><span className="zoom-symbol">+</span></button>
      <button className="zoom-btn" data-action="out"><span className="zoom-symbol">-</span></button>
    </div>
  )
}

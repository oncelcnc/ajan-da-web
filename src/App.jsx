import { useState, useEffect } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

const API = "http://127.0.0.1:8000";

// --- YENİ PDF TASARIMLARI ---
function TemplateBingo({ visual }) {
  const marked = visual?.bingo?.marked_cells || [];
  return (
    <div className="bingo-container">
      <div className="tpl-header">🎯 YILLIK BİNGO</div>
      <div className="bingo-grid">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className={`bingo-cell ${marked.includes(i) ? "active" : ""}`}>
            {marked.includes(i) ? "X" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateTicket({ visual, ocr }) {
  const rating = visual?.rating?.rating || 0;
  return (
    <div className="ticket-card">
      <div className="ticket-top">MOVIE NIGHT 🎟️</div>
      <div className="stars">{"★".repeat(rating)}{"☆".repeat(5-rating)}</div>
      <p className="ticket-text">{ocr?.split('\n')[0] || "Film Adı..."}</p>
    </div>
  );
}

function TemplateReading({ visual }) {
  const count = visual?.shelf?.marked_count || 0;
  return (
    <div className="reading-wrap">
      <div className="tpl-header">📚 OKUMA TAKİBİ</div>
      <div className="shelf">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className={`book ${i < count ? "filled" : ""}`} 
               style={{height: 40 + (i%5)*8 + "px"}}></div>
        ))}
      </div>
    </div>
  );
}

// --- ANA UYGULAMA MANTIĞI ---
export default function App() {
  const [step, setStep] = useState("home");
  const [pages, setPages] = useState([]);
  const [currentSerial, setCurrentSerial] = useState("SN12345"); // Örnek

  const handleUpload = async () => {
    const photo = await Camera.getPhoto({ quality: 90, resultType: CameraResultType.Base64, source: CameraSource.Camera });
    const res = await fetch(`data:image/jpeg;base64,${photo.base64String}`);
    const blob = await res.blob();
    const form = new FormData();
    form.append("file", blob);
    
    const response = await fetch(`${API}/upload?serial_no=${currentSerial}`, { method: "POST", body: form });
    if(response.ok) loadHistory();
  };

  const loadHistory = async () => {
    const res = await fetch(`${API}/history?serial_no=${currentSerial}`);
    const data = await res.json();
    setPages(data);
  };

  useEffect(() => { loadHistory(); }, []);

  return (
    <div className="app-container">
      <button onClick={handleUpload} className="btn-main">📸 SAYFA YÜKLE</button>
      <div className="pages-list">
        {pages.map(p => (
          <div key={p.page_no} className="page-item">
            <div className="image-preview"><img src={`${API}${p.image_url}`} /></div>
            <div className="digital-view">
              {p.template_data.visual?.bingo && <TemplateBingo visual={p.template_data.visual} />}
              {p.template_data.visual?.rating && <TemplateTicket visual={p.template_data.visual} ocr={p.template_data.ocr} />}
              {p.template_data.visual?.shelf && <TemplateReading visual={p.template_data.visual} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- STİLLER ---
const styles = `
  .bingo-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; background: #fff; padding: 10px; border: 2px solid #2d4a3e; }
  .bingo-cell { aspect-ratio: 1; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; }
  .bingo-cell.active { background: #c4956a; color: white; }
  .ticket-card { background: #1a1512; color: #fff; padding: 20px; border-radius: 12px; text-align: center; }
  .stars { color: #c4956a; font-size: 24px; }
  .shelf { display: flex; align-items: flex-end; gap: 4px; border-bottom: 4px solid #8b6f5c; }
  .book { width: 18px; background: #eee; border: 1px solid #ccc; }
  .book.filled { background: #2d4a3e; }
`;
const styleEl = document.createElement("style"); styleEl.textContent = styles; document.head.appendChild(styleEl);
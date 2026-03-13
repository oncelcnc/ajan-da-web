import { useState, useEffect, useRef } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

const API = "https://ajan-da-backend-production.up.railway.app";

// ─── Şablon bileşenleri ───────────────────────────────────────────────

function TemplateTodo({ data, empty }) {
  const items = data?.items || [];
  return (
    <div className="template-todo">
      <div className="tpl-header">✅ To-Do List</div>
      {empty ? (
        <div className="tpl-empty-hint">Sayfayı fotoğraflayınca to-do listesi buraya gelecek</div>
      ) : items.length === 0 ? (
        <div className="tpl-empty-hint">İçerik bulunamadı</div>
      ) : (
        <ul className="tpl-todo-list">
          {items.map((item, i) => (
            <li key={i} className={`tpl-todo-item ${item.done ? "done" : ""}`}>
              <span className="tpl-checkbox">{item.done ? "☑" : "☐"}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TemplateDaily({ data, empty }) {
  if (empty) return (
    <div className="template-daily">
      <div className="tpl-header">📅 Günlük Plan</div>
      <div className="tpl-empty-hint">Sayfayı fotoğraflayınca günlük planın buraya gelecek</div>
    </div>
  );
  return (
    <div className="template-daily">
      <div className="tpl-header">📅 Günlük Plan</div>
      {data?.date && <div className="tpl-date">{data.date}</div>}
      {data?.priorities?.length > 0 && (
        <div className="tpl-section">
          <div className="tpl-section-title">Öncelikler</div>
          {data.priorities.map((p, i) => (
            <div key={i} className="tpl-priority-item">
              <span className="tpl-num">{i + 1}</span> {p}
            </div>
          ))}
        </div>
      )}
      {data?.schedule?.length > 0 && (
        <div className="tpl-section">
          <div className="tpl-section-title">Program</div>
          {data.schedule.map((s, i) => (
            <div key={i} className="tpl-schedule-item">{s}</div>
          ))}
        </div>
      )}
      {data?.notes?.length > 0 && (
        <div className="tpl-section">
          <div className="tpl-section-title">Notlar</div>
          <div className="tpl-notes-text">{data.notes.join("\n")}</div>
        </div>
      )}
    </div>
  );
}

function TemplateGoals({ data, empty }) {
  const goals = empty ? [] : Object.entries(data || {}).filter(([k]) => k.startsWith("goal_")).map(([, v]) => v).filter(Boolean);
  return (
    <div className="template-goals">
      <div className="tpl-header">🎯 Hedefler</div>
      {empty ? (
        <div className="tpl-empty-hint">Hedefleriniz fotoğraflandıktan sonra burada görünecek</div>
      ) : goals.length === 0 ? (
        <div className="tpl-empty-hint">Hedef bulunamadı</div>
      ) : (
        <div className="tpl-goals-list">
          {goals.map((g, i) => (
            <div key={i} className="tpl-goal-item">
              <span className="tpl-goal-num">{i + 1}</span>
              <span>{g}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateShopping({ data, empty }) {
  const items = data?.items || [];
  return (
    <div className="template-shopping">
      <div className="tpl-header">🛒 Alışveriş Listesi</div>
      {empty ? (
        <div className="tpl-empty-hint">Alışveriş listeniz burada görünecek</div>
      ) : items.length === 0 ? (
        <div className="tpl-empty-hint">Liste boş</div>
      ) : (
        <ul className="tpl-todo-list">
          {items.map((item, i) => (
            <li key={i} className={`tpl-todo-item ${item.done ? "done" : ""}`}>
              <span className="tpl-checkbox">{item.done ? "☑" : "☐"}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TemplateHabit({ data, empty }) {
  const habits = data?.habits || [];
  return (
    <div className="template-habit">
      <div className="tpl-header">🔥 Alışkanlık Takibi</div>
      {empty ? (
        <div className="tpl-empty-hint">Alışkanlıklarınız burada takip edilecek</div>
      ) : habits.length === 0 ? (
        <div className="tpl-empty-hint">Alışkanlık bulunamadı</div>
      ) : (
        <div className="tpl-habit-list">
          {habits.map((h, i) => (
            <div key={i} className="tpl-habit-item">
              <span className={`tpl-habit-check ${h.completed ? "done" : ""}`}>{h.completed ? "✓" : "○"}</span>
              <span>{h.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateGratitude({ data, empty }) {
  const entries = data?.entries || [];
  return (
    <div className="template-gratitude">
      <div className="tpl-header">🌸 Şükran Günlüğü</div>
      {empty ? (
        <div className="tpl-empty-hint">Şükran notlarınız burada görünecek</div>
      ) : entries.length === 0 ? (
        <div className="tpl-empty-hint">Not bulunamadı</div>
      ) : (
        <div className="tpl-gratitude-list">
          {entries.map((e, i) => (
            <div key={i} className="tpl-gratitude-item">
              <span className="tpl-heart">♥</span> {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateMood({ data, empty }) {
  const moods = ["😢", "😕", "😐", "🙂", "😄"];
  return (
    <div className="template-mood">
      <div className="tpl-header">😊 Ruh Hali</div>
      {empty ? (
        <div className="tpl-empty-hint">Ruh haliniz kaydedilince burada görünecek</div>
      ) : (
        <>
          <div className="tpl-mood-text">{data?.mood || ""}</div>
          <div className="tpl-mood-icons">
            {moods.map((m, i) => (
              <span key={i} className="tpl-mood-icon">{m}</span>
            ))}
          </div>
          {data?.notes && <div className="tpl-notes-text">{data.notes}</div>}
        </>
      )}
    </div>
  );
}

function TemplateWater({ data, empty }) {
  const glasses = empty ? 0 : (data?.glasses || 0);
  const target = empty ? 8 : (data?.target || 8);
  return (
    <div className="template-water">
      <div className="tpl-header">💧 Su Takibi</div>
      <div className="tpl-water-glasses">
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} className={`tpl-glass ${i < glasses ? "filled" : ""}`}>💧</span>
        ))}
      </div>
      <div className="tpl-water-count">{glasses} / {target} bardak</div>
      {empty && <div className="tpl-empty-hint">Fotoğraflandıktan sonra güncellenir</div>}
    </div>
  );
}

function TemplateWeekly({ data, empty }) {
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  return (
    <div className="template-weekly">
      <div className="tpl-header">📅 Haftalık Plan</div>
      {empty ? (
        <div className="tpl-empty-hint">Haftalık planınız burada görünecek</div>
      ) : (
        <>
          {data?.week && <div className="tpl-date">{data.week}</div>}
          <div className="tpl-week-grid">
            {days.map((d) => (
              <div key={d} className="tpl-week-day">
                <div className="tpl-week-day-name">{d}</div>
              </div>
            ))}
          </div>
          {data?.achievements?.length > 0 && (
            <div className="tpl-section">
              <div className="tpl-section-title">Başarılar</div>
              {data.achievements.map((a, i) => <div key={i} className="tpl-item">✓ {a}</div>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TemplateNotes({ data, empty }) {
  return (
    <div className="template-notes">
      <div className="tpl-header">📝 Notlar</div>
      {empty ? (
        <div className="tpl-lines">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="tpl-line" />)}
        </div>
      ) : (
        <div className="tpl-notes-text">{data?.content || ""}</div>
      )}
    </div>
  );
}

function TemplateMonthly({ data, empty }) {
  const markedDays = data?.marked_days || [];
  return (
    <div className="template-monthly">
      <div className="tpl-header">🗓 Aylık Takvim</div>
      {data?.month && <div className="tpl-date">{data.month}</div>}
      <div className="tpl-month-grid">
        {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map(d => (
          <div key={d} className="tpl-month-header">{d}</div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => {
          const day = i + 1;
          const isMarked = day <= 31 && markedDays.includes(day);
          return (
            <div key={i} className={"tpl-month-day" + (isMarked ? " marked" : "")}>
              {day <= 31 ? day : ""}
            </div>
          );
        })}
      </div>
      {empty && <div className="tpl-empty-hint">Fotoğraflandıktan sonra dolacak</div>}
    </div>
  );
}

function TemplateCover({ data, empty, themeColor }) {
  return (
    <div className="template-cover" style={{ background: themeColor || "#2d4a3e" }}>
      <div className="tpl-cover-title">{data?.title || "MANIFEST"}</div>
      {data?.subtitle && <div className="tpl-cover-subtitle">{data.subtitle}</div>}
      {data?.date_range && <div className="tpl-cover-date">{data.date_range}</div>}
      {empty && <div className="tpl-cover-hint">Kapak sayfası</div>}
    </div>
  );
}

function PageTemplate({ type, data, empty, themeColor }) {
  const props = { data, empty, themeColor };
  switch (type) {
    case "todo":      return <TemplateTodo {...props} />;
    case "daily":     return <TemplateDaily {...props} />;
    case "goals":     return <TemplateGoals {...props} />;
    case "shopping":  return <TemplateShopping {...props} />;
    case "habit":     return <TemplateHabit {...props} />;
    case "gratitude": return <TemplateGratitude {...props} />;
    case "mood":      return <TemplateMood {...props} />;
    case "water":     return <TemplateWater {...props} />;
    case "weekly":    return <TemplateWeekly {...props} />;
    case "monthly":   return <TemplateMonthly {...props} />;
    case "cover":     return <TemplateCover {...props} />;
    default:          return <TemplateNotes {...props} />;
  }
}

// ─── Confirm Modal ────────────────────────────────────────────────────

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="overlay-screen">
      <div className="overlay-icon">⚠️</div>
      <div className="overlay-title">Sayfa Zaten Kayıtlı</div>
      <div className="overlay-desc">Bu sayfa daha önce fotoğraflanmış. Üzerine yazmak istiyor musun?</div>
      <button className="btn-overlay-confirm" onClick={onConfirm}>✓ Üzerine Yaz</button>
      <button className="btn-overlay-cancel" onClick={onCancel}>İptal</button>
    </div>
  );
}

// ─── Ana uygulama ──────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState("home");
  const [journals, setJournals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ajanda_journals") || "[]"); } catch { return []; }
  });
  const [current, setCurrent] = useState(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState([]);
  const [stepOverlay, setStepOverlay] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [confirmData, setConfirmData] = useState(null); // { form, qr }
  const isNative = !!window.Capacitor?.isNativePlatform?.();

  const saveJournals = (list) => {
    setJournals(list);
    localStorage.setItem("ajanda_journals", JSON.stringify(list));
  };

  const scanQR = async () => {
    if (!isNative) return null;
    await BarcodeScanner.requestPermissions();
    const result = await BarcodeScanner.scan();
    return result?.barcodes?.[0]?.rawValue || null;
  };

  const takePhoto = async () => {
    if (isNative) {
      const photo = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        correctOrientation: true,
      });
      const res = await fetch(`data:image/jpeg;base64,${photo.base64String}`);
      return await res.blob();
    } else {
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => resolve(e.target.files[0]);
        input.click();
      });
    }
  };

  const handleActivate = async () => {
    setError("");
    if (!pin || pin.length < 4) { setError("PIN en az 4 karakter olmalı"); return; }
    setLoading(true);
    try {
      let res;
      if (isNative) {
        setStepOverlay({ icon: "📷", title: "Kapak QR'ını Tara", desc: "Ajandanın kapağındaki QR kodu lens ile okut" });
        const qr = await scanQR();
        setStepOverlay(null);
        if (!qr) { setError("QR okunamadı"); setLoading(false); return; }
        res = await fetch(`${API}/activate_qr?qr=${encodeURIComponent(qr)}&pin=${pin}`, { method: "POST" });
      } else {
        setStepOverlay({ icon: "📸", title: "Kapak Fotoğrafı", desc: "Ajandanın kapağını QR kodu görünecek şekilde fotoğraflayın" });
        const blob = await takePhoto();
        setStepOverlay(null);
        if (!blob) { setLoading(false); return; }
        const form = new FormData();
        form.append("file", blob, "cover.jpg");
        res = await fetch(`${API}/activate?pin=${pin}`, { method: "POST", body: form });
      }
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Hata"); setLoading(false); return; }

      const journal = {
        serial_no: data.serial_no,
        theme_id: data.theme_id,
        theme_name: data.theme_name,
        theme_color: data.theme_color,
        pin,
        template: data.template,
      };
      const updated = [journal, ...journals.filter(j => j.serial_no !== journal.serial_no)];
      saveJournals(updated);
      setCurrent(journal);
      await loadPages(journal);
      setStep("dashboard");
    } catch (e) {
      setError("Bağlantı hatası");
    }
    setLoading(false);
  };

  const handleLogin = async (journal) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/login?serial_no=${journal.serial_no}&pin=${journal.pin}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Hata"); setLoading(false); return; }
      const updated = { ...journal, template: data.template, theme_color: data.theme_color };
      setCurrent(updated);
      await loadPages(updated);
      setStep("dashboard");
    } catch { setError("Bağlantı hatası"); }
    setLoading(false);
  };

  const loadPages = async (journal) => {
    try {
      const res = await fetch(`${API}/history?serial_no=${journal.serial_no}`);
      const data = await res.json();
      setPages(data.notes || []);
    } catch {}
  };

  const doUpload = async (form, qr, force = false) => {
    const url = qr
      ? `${API}/upload?serial_no=${current.serial_no}&qr_hint=${encodeURIComponent(qr)}${force ? "&force=true" : ""}`
      : `${API}/upload?serial_no=${current.serial_no}${force ? "&force=true" : ""}`;
    return await fetch(url, { method: "POST", body: form });
  };

  const handleUploadPage = async () => {
    if (!current) return;
    setError("");
    setLoading(true);
    try {
      let qr = null;
      let blob = null;

      if (isNative) {
        setStepOverlay({ icon: "📷", title: "Sayfa QR'ını Tara", desc: "Sayfanın köşesindeki QR kodu okut" });
        qr = await scanQR();
        setStepOverlay(null);
        if (!qr) { setError("QR okunamadı"); setLoading(false); return; }

        setStepOverlay({ icon: "📸", title: "Sayfayı Fotoğrafla", desc: "Sayfanın tamamını net şekilde fotoğraflayın" });
        blob = await takePhoto();
        setStepOverlay(null);
        if (!blob) { setLoading(false); return; }
      } else {
        setStepOverlay({ icon: "📸", title: "Sayfa Fotoğrafı", desc: "QR kodu görünecek şekilde sayfayı seçin" });
        blob = await takePhoto();
        setStepOverlay(null);
        if (!blob) { setLoading(false); return; }
      }

      const form = new FormData();
      form.append("file", blob, "page.jpg");

      const res = await doUpload(form, qr, false);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Confirm modal göster
          setLoading(false);
          setConfirmData({ form, qr });
          return;
        }
        setError(data.detail || "Hata");
        setLoading(false);
        return;
      }

      await loadPages(current);
    } catch (e) {
      setError("Yükleme hatası");
    }
    setLoading(false);
  };

  const handleConfirmOverwrite = async () => {
    if (!confirmData) return;
    setConfirmData(null);
    setLoading(true);
    try {
      const res = await doUpload(confirmData.form, confirmData.qr, true);
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Hata"); }
      else { await loadPages(current); }
    } catch { setError("Yükleme hatası"); }
    setLoading(false);
  };

  const renderPageCard = (pageData) => {
    const tplType = pageData.template_type || pageData.template?.type || "notes";
    const tplData = pageData.template_data;
    const isEmpty = pageData.is_empty || !tplData;
    return (
      <div
        key={pageData.page_no}
        className={`page-card ${isEmpty ? "empty" : "filled"}`}
        onClick={() => setActivePage(pageData)}
      >
        <div className="page-card-header">
          <span className="page-card-num">Sayfa {pageData.page_no}</span>
          <span className="page-card-title">{pageData.template?.title || tplType}</span>
          {!isEmpty && <span className="page-card-badge">✓</span>}
        </div>
        <div className="page-card-preview">
          <PageTemplate
            type={tplType}
            data={tplData}
            empty={isEmpty}
            themeColor={current?.theme_color}
          />
        </div>
      </div>
    );
  };

  const renderAllPages = () => {
    const template = current?.template || {};
    const filledMap = {};
    pages.forEach(p => { filledMap[p.page_no] = p; });

    const allPages = Object.entries(template).map(([pageNo, tpl]) => {
      const no = parseInt(pageNo);
      const filled = filledMap[no];
      if (filled) return { ...filled, template: tpl };
      return { page_no: no, template: tpl, template_type: tpl.type, template_data: null, is_empty: true, image_url: null };
    });

    allPages.sort((a, b) => a.page_no - b.page_no);
    return allPages.map(renderPageCard);
  };

  // ─── UI ───

  if (confirmData) {
    return <ConfirmModal onConfirm={handleConfirmOverwrite} onCancel={() => setConfirmData(null)} />;
  }

  if (stepOverlay) {
    return (
      <div className="overlay-screen">
        <div className="overlay-icon">{stepOverlay.icon}</div>
        <div className="overlay-title">{stepOverlay.title}</div>
        <div className="overlay-desc">{stepOverlay.desc}</div>
        <div className="spinner" />
      </div>
    );
  }

  if (activePage) {
    const tplType = activePage.template_type || activePage.template?.type || "notes";
    return (
      <div className="screen detail-screen" style={{ "--theme": current?.theme_color || "#2d4a3e" }}>
        <div className="detail-header">
          <button className="back-btn" onClick={() => setActivePage(null)}>← Geri</button>
          <span className="detail-title">{activePage.template?.title || `Sayfa ${activePage.page_no}`}</span>
          <span className="detail-page-no">#{activePage.page_no}</span>
        </div>
        {activePage.image_url && (
          <div className="detail-image-wrap">
            <img src={`${API}${activePage.image_url}`} alt="sayfa" className="detail-image" />
          </div>
        )}
        <div className="detail-template">
          <PageTemplate
            type={tplType}
            data={activePage.template_data}
            empty={activePage.is_empty}
            themeColor={current?.theme_color}
          />
        </div>
        {activePage.is_empty && (
          <button className="btn-primary" onClick={() => { setActivePage(null); handleUploadPage(); }}>
            📸 Bu Sayfayı Fotoğrafla
          </button>
        )}
      </div>
    );
  }

  if (step === "dashboard" && current) {
    return (
      <div className="screen dashboard-screen" style={{ "--theme": current.theme_color || "#2d4a3e" }}>
        <div className="dash-header">
          <div className="dash-theme-badge" style={{ background: current.theme_color }}>
            {current.theme_name}
          </div>
          <div className="dash-serial">#{current.serial_no}</div>
          <button className="dash-logout" onClick={() => { setCurrent(null); setStep("home"); }}>↩</button>
        </div>

        <div className="dash-stats">
          <div className="stat-item">
            <span className="stat-num">{pages.length}</span>
            <span className="stat-label">Fotoğraflanan</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{Object.keys(current.template || {}).length}</span>
            <span className="stat-label">Toplam Sayfa</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">
              {Object.keys(current.template || {}).length > 0
                ? Math.round(pages.length / Object.keys(current.template).length * 100)
                : 0}%
            </span>
            <span className="stat-label">Doluluk</span>
          </div>
        </div>

        <button className="btn-upload" onClick={handleUploadPage} disabled={loading}>
          {loading ? "⏳ Yükleniyor..." : "📸 Sayfa Fotoğrafla"}
        </button>

        {error && <div className="error-msg">{error}</div>}

        <div className="pages-grid">
          {renderAllPages()}
        </div>
      </div>
    );
  }

  if (step === "activate") {
    return (
      <div className="screen activate-screen">
        <button className="back-btn" onClick={() => setStep("home")}>← Geri</button>
        <div className="activate-icon">📒</div>
        <h2>Ajanda Aktive Et</h2>
        <p>Kapak QR'ını okutarak ajandanı sisteme ekle</p>
        <input
          className="pin-input"
          type="password"
          inputMode="numeric"
          placeholder="PIN oluştur (min 4 karakter)"
          value={pin}
          onChange={e => setPin(e.target.value)}
          maxLength={8}
        />
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={handleActivate} disabled={loading}>
          {loading ? "⏳..." : isNative ? "📷 QR Tara & Aktive Et" : "📸 Kapak Fotoğrafı Yükle"}
        </button>
      </div>
    );
  }

  return (
    <div className="screen home-screen">
      <div className="home-logo">
        <span className="logo-ajan">AJAN</span><span className="logo-da">-DA</span>
      </div>
      <div className="home-tagline">Ajandanı dijitalleştir</div>

      {journals.length > 0 && (
        <div className="journals-list">
          <div className="journals-title">Ajandalarım</div>
          {journals.map(j => (
            <button key={j.serial_no} className="journal-item" onClick={() => handleLogin(j)}>
              <span className="journal-dot" style={{ background: j.theme_color }} />
              <span className="journal-name">{j.theme_name}</span>
              <span className="journal-serial">#{j.serial_no}</span>
              <span className="journal-arrow">→</span>
            </button>
          ))}
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      <button className="btn-primary" onClick={() => setStep("activate")}>
        + Yeni Ajanda Ekle
      </button>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --theme: #2d4a3e; --cream: #faf8f5; --ink: #1a1512; --warm: #8b6f5c; --accent: #c4956a; --border: #e2d9ce; --soft: #f0ebe3; --red: #e05c4b; --green: #4caf50; }
  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); min-height: 100vh; }
  .screen { min-height: 100vh; padding: 24px 20px; max-width: 480px; margin: 0 auto; }
  .home-screen { display: flex; flex-direction: column; align-items: center; padding-top: 80px; gap: 20px; }
  .home-logo { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; }
  .logo-ajan { color: var(--ink); }
  .logo-da { color: var(--accent); }
  .home-tagline { color: var(--warm); font-size: 16px; margin-top: -12px; }
  .journals-list { width: 100%; display: flex; flex-direction: column; gap: 8px; margin: 8px 0; }
  .journals-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 4px; }
  .journal-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; border: 1.5px solid var(--border); border-radius: 12px; background: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: all 0.2s; text-align: left; }
  .journal-item:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(139,111,92,0.1); }
  .journal-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .journal-name { flex: 1; font-weight: 600; }
  .journal-serial { color: var(--warm); font-size: 12px; }
  .journal-arrow { color: var(--warm); }
  .activate-screen { display: flex; flex-direction: column; align-items: center; padding-top: 40px; gap: 16px; }
  .activate-icon { font-size: 60px; margin: 16px 0; }
  .activate-screen h2 { font-family: 'Playfair Display', serif; font-size: 28px; }
  .activate-screen p { color: var(--warm); text-align: center; font-size: 14px; }
  .pin-input { width: 100%; padding: 14px 16px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 18px; font-family: 'DM Sans', sans-serif; text-align: center; letter-spacing: 4px; outline: none; transition: border-color 0.2s; }
  .pin-input:focus { border-color: var(--accent); }
  .btn-primary { width: 100%; padding: 16px; background: var(--ink); color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover:not(:disabled) { background: var(--accent); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .back-btn { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--warm); cursor: pointer; padding: 0; margin-bottom: 16px; display: block; }
  .error-msg { width: 100%; padding: 12px 16px; background: #ffeaea; border: 1px solid #ffcdd2; border-radius: 10px; color: var(--red); font-size: 13px; text-align: center; }
  .dashboard-screen { padding-top: 0; }
  .dash-header { display: flex; align-items: center; gap: 12px; padding: 16px 0 12px; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
  .dash-theme-badge { padding: 4px 12px; border-radius: 20px; color: white; font-size: 13px; font-weight: 600; }
  .dash-serial { flex: 1; color: var(--warm); font-size: 13px; }
  .dash-logout { background: none; border: none; font-size: 20px; cursor: pointer; }
  .dash-stats { display: flex; gap: 12px; margin-bottom: 16px; }
  .stat-item { flex: 1; text-align: center; padding: 12px; background: white; border-radius: 12px; border: 1px solid var(--border); }
  .stat-num { display: block; font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--accent); }
  .stat-label { font-size: 11px; color: var(--warm); }
  .btn-upload { width: 100%; padding: 14px; background: var(--theme); color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 16px; transition: all 0.2s; }
  .btn-upload:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .btn-upload:disabled { opacity: 0.6; }
  .pages-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-bottom: 24px; }
  .page-card { border-radius: 12px; border: 1.5px solid var(--border); background: white; overflow: hidden; cursor: pointer; transition: all 0.2s; }
  .page-card:hover { border-color: var(--theme); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .page-card.empty { opacity: 0.7; }
  .page-card-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; background: var(--soft); border-bottom: 1px solid var(--border); }
  .page-card-num { font-size: 10px; font-weight: 700; color: var(--warm); }
  .page-card-title { flex: 1; font-size: 11px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .page-card-badge { font-size: 10px; color: var(--green); }
  .page-card-preview { padding: 8px; min-height: 80px; max-height: 140px; overflow: hidden; font-size: 0.75em; }
  .detail-screen { display: flex; flex-direction: column; gap: 16px; }
  .detail-header { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .detail-header .back-btn { margin-bottom: 0; }
  .detail-title { flex: 1; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; }
  .detail-page-no { color: var(--warm); font-size: 13px; }
  .detail-image-wrap { border-radius: 12px; overflow: hidden; }
  .detail-image { width: 100%; display: block; }
  .detail-template { background: white; border-radius: 12px; border: 1px solid var(--border); padding: 16px; }
  .tpl-header { font-weight: 700; font-size: 13px; margin-bottom: 8px; color: var(--ink); border-bottom: 2px solid var(--accent); padding-bottom: 4px; }
  .tpl-empty-hint { font-size: 11px; color: var(--warm); font-style: italic; }
  .tpl-section { margin-top: 8px; }
  .tpl-section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 4px; }
  .tpl-date { font-size: 12px; font-weight: 600; color: var(--accent); margin-bottom: 6px; }
  .tpl-notes-text { font-size: 12px; line-height: 1.6; color: var(--ink); white-space: pre-wrap; }
  .tpl-todo-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .tpl-todo-item { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; line-height: 1.4; }
  .tpl-todo-item.done { opacity: 0.5; text-decoration: line-through; }
  .tpl-checkbox { flex-shrink: 0; }
  .tpl-priority-item { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 3px; }
  .tpl-num { width: 18px; height: 18px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .tpl-schedule-item { font-size: 11px; color: var(--warm); border-left: 2px solid var(--border); padding-left: 6px; margin-bottom: 2px; }
  .tpl-goals-list { display: flex; flex-direction: column; gap: 6px; }
  .tpl-goal-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; }
  .tpl-goal-num { width: 20px; height: 20px; border-radius: 4px; background: var(--ink); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .tpl-habit-list { display: flex; flex-direction: column; gap: 4px; }
  .tpl-habit-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .tpl-habit-check { font-size: 14px; }
  .tpl-habit-check.done { color: var(--green); }
  .tpl-gratitude-list { display: flex; flex-direction: column; gap: 6px; }
  .tpl-gratitude-item { font-size: 12px; display: flex; align-items: flex-start; gap: 6px; }
  .tpl-heart { color: #e91e63; }
  .tpl-mood-text { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
  .tpl-mood-icons { display: flex; gap: 8px; font-size: 20px; }
  .tpl-water-glasses { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
  .tpl-glass { font-size: 16px; opacity: 0.3; }
  .tpl-glass.filled { opacity: 1; }
  .tpl-water-count { font-size: 12px; color: var(--warm); }
  .tpl-week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin: 8px 0; }
  .tpl-week-day { text-align: center; }
  .tpl-week-day-name { font-size: 9px; color: var(--warm); font-weight: 600; }
  .tpl-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin: 8px 0; }
  .tpl-month-header { font-size: 8px; color: var(--warm); font-weight: 600; text-align: center; padding: 2px; }
  .tpl-month-day { font-size: 9px; text-align: center; padding: 2px; border: 1px solid var(--border); min-height: 16px; border-radius: 2px; }
  .tpl-month-day.marked { background: #ffeb3b; font-weight: 700; color: var(--ink); border-color: #f9a825; }
  .tpl-lines { display: flex; flex-direction: column; gap: 8px; }
  .tpl-line { height: 1px; background: var(--border); }
  .tpl-cover { border-radius: 8px; padding: 20px; color: white; min-height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
  .tpl-cover-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; text-align: center; }
  .tpl-cover-subtitle { font-size: 11px; opacity: 0.8; margin-top: 4px; }
  .tpl-cover-date { font-size: 10px; opacity: 0.6; margin-top: 4px; }
  .tpl-cover-hint { font-size: 11px; opacity: 0.7; margin-top: 8px; }
  .tpl-item { font-size: 12px; margin-bottom: 3px; }
  .overlay-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: rgba(26,21,18,0.95); color: white; padding: 40px; }
  .overlay-icon { font-size: 64px; }
  .overlay-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; text-align: center; }
  .overlay-desc { font-size: 14px; opacity: 0.7; text-align: center; line-height: 1.6; }
  .btn-overlay-confirm { width: 100%; max-width: 280px; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px; }
  .btn-overlay-cancel { width: 100%; max-width: 280px; padding: 14px; background: rgba(255,255,255,0.15); color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 16px; cursor: pointer; }
  .spinner { width: 40px; height: 40px; margin-top: 16px; border: 3px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);

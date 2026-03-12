import React, { useState, useEffect, useRef } from 'react';
import { Camera, Lock, LogOut, Search, BarChart2, BookOpen, FileText, Image, ChevronRight, Plus } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import './App.css';

const API = 'https://ajan-da-backend-production.up.railway.app';

// ─────────────────────────────────────────────
// Dinamik tema
// ─────────────────────────────────────────────
function applyTheme(theme) {
  if (!theme) return;
  document.documentElement.style.setProperty('--bg', theme.bg);
  document.documentElement.style.setProperty('--card', theme.card);
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--text', theme.text);
  document.documentElement.style.setProperty('--line', theme.page_line_color);
}

// ─────────────────────────────────────────────
// Capacitor kamera — direkt lens, galeri yok
// ─────────────────────────────────────────────
const isNative = () => !!(window.Capacitor?.isNativePlatform?.());

async function takePhoto() {
  const { BarcodeScanner, BarcodeFormat } = await import('@capacitor-mlkit/barcode-scanning');
  
  await BarcodeScanner.requestPermissions();
  
  const { barcodes } = await BarcodeScanner.scan({
    formats: [BarcodeFormat.QrCode]
  });
  
  if (barcodes.length === 0) throw new Error('QR bulunamadı');
  
  return barcodes[0].rawValue; // QR içeriğini direkt döndür
}

// ─────────────────────────────────────────────
// Sayfa içeriği
// ─────────────────────────────────────────────
const PageContent = ({ item }) => {
  const [viewMode, setViewMode] = useState('image');

  if (!item.text && !item.image) {
    return <span style={{ opacity: 0.2, fontSize: 13 }}>— boş —</span>;
  }

  return (
    <div className="page-content-wrap">
      {item.text && item.image && (
        <div className="toggle-row">
          <button onClick={() => setViewMode('image')} className={`toggle-btn ${viewMode === 'image' ? 'active' : ''}`}>
            <Image size={10} /> Resim
          </button>
          <button onClick={() => setViewMode('text')} className={`toggle-btn ${viewMode === 'text' ? 'active' : ''}`}>
            <FileText size={10} /> Metin
          </button>
        </div>
      )}
      <div className="page-body">
        {(viewMode === 'image' || !item.text) && item.image && (
          <img src={`${API}${item.image}`} alt={`Sayfa ${item.page}`} className="page-img"
            onError={() => setViewMode('text')} />
        )}
        {(viewMode === 'text' || !item.image) && item.text && (
          <div className="handwriting-text">{item.text}</div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Flipbook
// ─────────────────────────────────────────────
const DijitalAjanda = ({ theme, history, targetPage, isSearching }) => {
  const bookRef = useRef();

  const pagesArr = isSearching
    ? history
    : Array.from({ length: theme?.total_pages || 30 }, (_, i) => {
        const note = history.find(n => parseInt(n.page) === i + 1);
        return note ? { text: note.text, page: i + 1, image: note.image } : { text: '', page: i + 1, image: null };
      });

  useEffect(() => {
    if (targetPage > 0 && bookRef.current) {
      setTimeout(() => {
        try { bookRef.current.pageFlip().turnToPage(isSearching ? 1 : parseInt(targetPage)); } catch {}
      }, 400);
    }
  }, [targetPage, history, isSearching]);

  return (
    <div className="flipbook-wrap">
      <HTMLFlipBook width={480} height={620} size="fixed" showCover={true} ref={bookRef} className="notebook-shadow">
        <div className="page cover-page" data-density="hard" style={{ background: theme?.cover_color || '#2d6a4f' }}>
          <div className="cover-inner">
            <div className="cover-year">2026</div>
            <h1 className="cover-title">{theme?.name || 'AJANDA'}</h1>
            <div className="cover-deco" />
          </div>
        </div>
        {pagesArr.map((item, i) => (
          <div key={i} className="page leaf-page">
            <div className="leaf-inner">
              <div className="leaf-header" style={{ borderColor: theme?.page_line_color }}>
                <span>Ref: #{202600 + (item.page || i)}</span>
                <span>SAYFA {item.page}</span>
              </div>
              <PageContent item={item} />
            </div>
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

// ─────────────────────────────────────────────
// İstatistik
// ─────────────────────────────────────────────
const StatsPanel = ({ serialNo, theme }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/stats?serial_no=${serialNo}`).then(r => r.json()).then(setStats).catch(() => {});
  }, [serialNo]);

  if (!stats) return <div className="stats-panel loading">Yükleniyor...</div>;

  return (
    <div className="stats-panel">
      <h3 className="stats-title"><BarChart2 size={16} /> İstatistikler</h3>
      <div className="stats-bar-wrap">
        <div className="stats-bar-track">
          <div className="stats-bar-fill" style={{ width: `${stats.fill_rate}%`, background: theme?.accent }} />
        </div>
        <span className="stats-pct">{stats.fill_rate}%</span>
      </div>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-val" style={{ color: theme?.accent }}>{stats.filled_pages}</span>
          <span className="stat-lbl">Dolu</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">{stats.empty_pages}</span>
          <span className="stat-lbl">Boş</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">{stats.total_pages}</span>
          <span className="stat-lbl">Toplam</span>
        </div>
      </div>
      {stats.last_note_date && <p className="stats-last">Son not: {stats.last_note_date.slice(0, 10)}</p>}
      {stats.recent_pages.length > 0 && <p className="stats-last">Son sayfalar: {stats.recent_pages.join(', ')}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Ana uygulama
// ─────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState('home');
  const [journals, setJournals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ajan_journals') || '[]'); } catch { return []; }
  });
  const [activeJournal, setActiveJournal] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetPage, setTargetPage] = useState(0);
  const [activateFile, setActivateFile] = useState(null);
  const [activatePreview, setActivatePreview] = useState(null);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState(false);
  const fileBuffer = useRef(null);
  const coverInputRef = useRef(null);
  const pageInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ajan_journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    if (activeJournal?.theme) applyTheme(activeJournal.theme);
  }, [activeJournal]);

  const loadData = async (sn) => {
    try {
      const res = await fetch(`${API}/history?serial_no=${sn}`);
      setHistory(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (step === 'dashboard' && activeJournal) loadData(activeJournal.serial_no);
  }, [step, activeJournal]);

  // ── Kapak QR — mobilde direkt lens, webde input
  const handleCoverBtn = async () => {
    if (isNative()) {
      try {
        const file = await takePhoto();
        setActivateFile(file);
        setActivatePreview(URL.createObjectURL(file));
        setPinValue('');
        setStep('activate');
      } catch (e) {
        coverInputRef.current?.click();
      }
    } else {
      coverInputRef.current?.click();
    }
  };

  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActivateFile(file);
    setActivatePreview(URL.createObjectURL(file));
    setPinValue('');
    setStep('activate');
  };

  // ── Aktivasyon
  const handleActivate = async () => {
    if (!activateFile || pinValue.length !== 4) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', activateFile);
    try {
      const res = await fetch(`${API}/activate?pin=${pinValue}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.status === 401) {
        setPinError(true);
        setTimeout(() => { setPinValue(''); setPinError(false); }, 800);
        setLoading(false); return;
      }
      if (!res.ok) { alert(data.detail || 'Hata!'); setLoading(false); return; }
      const journal = { serial_no: data.serial_no, theme_id: data.theme_id, theme: data.theme };
      setActiveJournal(journal);
      setJournals(prev => prev.find(j => j.serial_no === data.serial_no) ? prev : [...prev, journal]);
      setPinValue(''); setActivateFile(null); setActivatePreview(null);
      setStep('dashboard');
    } catch { alert('Sunucuya bağlanılamadı.'); }
    setLoading(false);
  };

  const handleSelectJournal = (j) => { setActiveJournal(j); setPinValue(''); setStep('pin_existing'); };

  const handleExistingPin = async (pin) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/login?serial_no=${activeJournal.serial_no}&pin=${pin}`, { method: 'POST' });
      if (res.status === 401) {
        setPinError(true);
        setTimeout(() => { setPinValue(''); setPinError(false); }, 800);
        setLoading(false); return;
      }
      const data = await res.json();
      const updated = { ...activeJournal, theme: data.theme };
      setActiveJournal(updated);
      setJournals(prev => prev.map(j => j.serial_no === updated.serial_no ? updated : j));
      setStep('dashboard');
    } catch { alert('Sunucuya bağlanılamadı.'); }
    setLoading(false);
  };

  // ── Sayfa yükle — mobilde direkt lens
  const handleUploadBtn = async () => {
    if (isNative()) {
      try {
        const file = await takePhoto();
        fileBuffer.current = file;
        await doUpload(file, false);
      } catch (e) {
        pageInputRef.current?.click();
      }
    } else {
      pageInputRef.current?.click();
    }
  };

  const handlePageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileBuffer.current = file;
    await doUpload(file, false);
  };

  const doUpload = async (file, force) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/upload?serial_no=${activeJournal.serial_no}&force=${force}`,
        { method: 'POST', body: formData });
      if (res.status === 422) {
        alert('SAYFADA QR BULUNAMADI!\n\nLütfen sayfa QR kodu görünecek şekilde fotoğraf çekin.');
        setLoading(false); return;
      }
      if (res.status === 409) {
        const data = await res.json();
        setLoading(false);
        if (window.confirm(`Sayfa ${data.page} dolu! Eski not silinsin mi?\n\nMevcut: "${data.existing_text}"`)) {
          await doUpload(fileBuffer.current, true);
        }
        return;
      }
      if (!res.ok) throw new Error('Yükleme başarısız!');
      await loadData(activeJournal.serial_no);
      const result = await res.json();
      setTargetPage(parseInt(result.page));
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const filteredHistory = history.filter(item =>
    item.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.page?.toString().includes(searchTerm)
  );

  const theme = activeJournal?.theme;

  // ── PIN klavyesi
  const PinPad = ({ onComplete }) => (
    <div className="pin-wrap" style={{ background: theme?.bg || '#f4f1ea' }}>
      <div className="pin-card" style={{ background: theme?.card || '#fff' }}>
        <Lock className="pin-icon" size={44} style={{ color: pinError ? '#ef4444' : theme?.accent }} />
        <h2 className="pin-title" style={{ color: pinError ? '#ef4444' : undefined }}>
          {pinError ? 'HATALI ŞİFRE!' : 'Giriş Şifresi'}
        </h2>
        <div className="pin-dots">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`pin-dot ${pinValue.length > i ? 'filled' : ''} ${pinError ? 'error' : ''}`}
              style={pinValue.length > i && !pinError ? { background: theme?.accent, borderColor: theme?.accent } : {}} />
          ))}
        </div>
        <div className="pin-grid">
          {[1,2,3,4,5,6,7,8,9,'C',0,'←'].map(btn => (
            <button key={btn} className={`pin-key ${pinError ? 'error' : ''}`}
              onClick={() => {
                setPinError(false);
                if (btn === 'C') { setPinValue(''); return; }
                if (btn === '←') { setPinValue(p => p.slice(0, -1)); return; }
                const np = pinValue + btn;
                if (np.length <= 4) { setPinValue(np); if (np.length === 4) onComplete(np); }
              }}>{btn}</button>
          ))}
        </div>
        <button className="pin-back" onClick={() => { setStep('home'); setPinValue(''); }}>← Geri</button>
      </div>
    </div>
  );

  // ── EKRANLAR

  if (step === 'home') return (
    <div className="home-screen">
      <div className="home-card">
        <h1 className="home-logo">AJAN-DA</h1>
        <p className="home-sub">Fiziksel ajandanı dijitalleştir</p>
        <button className="home-btn primary" onClick={handleCoverBtn}>
          <Plus size={18} /> Kapak QR ile Aç
        </button>
        {/* Web fallback input */}
        <input ref={coverInputRef} type="file" accept="image/*" capture="environment"
          className="hidden" onChange={handleCoverFile} />
        {journals.length > 0 && (
          <div className="journal-list">
            <p className="journal-list-title">Kayıtlı Ajandalar</p>
            {journals.map(j => (
              <button key={j.serial_no} className="journal-item" onClick={() => handleSelectJournal(j)}>
                <BookOpen size={16} style={{ color: j.theme?.accent }} />
                <span className="journal-item-name">{j.theme?.name || j.theme_id}</span>
                <span className="journal-item-sn">SN{j.serial_no}</span>
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (step === 'activate') return (
    <div className="home-screen">
      <div className="home-card activate-card">
        <h2 className="activate-title">Ajanda Aktivasyonu</h2>
        {activatePreview && <img src={activatePreview} alt="kapak" className="activate-preview" />}
        <p className="activate-hint">4 haneli PIN belirleyin / girin</p>
        <div className="pin-dots inline-dots">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`pin-dot ${pinValue.length > i ? 'filled' : ''} ${pinError ? 'error' : ''}`} />
          ))}
        </div>
        <div className="pin-grid compact">
          {[1,2,3,4,5,6,7,8,9,'C',0,'←'].map(btn => (
            <button key={btn} className={`pin-key ${pinError ? 'error' : ''}`}
              onClick={() => {
                setPinError(false);
                if (btn === 'C') { setPinValue(''); return; }
                if (btn === '←') { setPinValue(p => p.slice(0, -1)); return; }
                const np = pinValue + btn;
                if (np.length <= 4) setPinValue(np);
              }}>{btn}</button>
          ))}
        </div>
        {pinValue.length === 4 && (
          <button className="home-btn primary mt-4" onClick={handleActivate}>Devam Et →</button>
        )}
        <button className="pin-back" onClick={() => setStep('home')}>← Geri</button>
        {pinError && <p className="text-red-500 text-sm mt-2">Hatalı şifre!</p>}
      </div>
      {loading && <div className="loading-overlay">QR OKUNUYOR...</div>}
    </div>
  );

  if (step === 'pin_existing') return <PinPad onComplete={handleExistingPin} />;

  return (
    <div className="dashboard" style={{ background: theme?.bg, color: theme?.text }}>
      <nav className="dash-nav" style={{ borderColor: theme?.page_line_color }}>
        <div className="dash-nav-left">
          <span className="dash-logo">AJAN-DA</span>
          <span className="dash-theme-name" style={{ color: theme?.accent }}>{theme?.name}</span>
          <span className="dash-sn">SN{activeJournal?.serial_no}</span>
        </div>
        <button className="dash-logout" onClick={() => { setStep('home'); setActiveJournal(null); setHistory([]); }}>
          <LogOut size={15} /> Çıkış
        </button>
      </nav>
      <main className="dash-main">
        <DijitalAjanda theme={theme} history={searchTerm ? filteredHistory : history}
          targetPage={targetPage} isSearching={searchTerm.length > 0} />
        <div className="dash-panel">
          <div className="dash-card" style={{ background: theme?.card }}>
            <button className="upload-zone" onClick={handleUploadBtn}>
              <Camera size={36} style={{ opacity: 0.4 }} />
              <span className="upload-label">Sayfa Yükle</span>
            </button>
            {/* Web fallback input */}
            <input ref={pageInputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={handlePageFile} />
            <button className="pdf-btn" style={{ background: theme?.accent }}
              onClick={() => window.open(`${API}/export-pdf?serial_no=${activeJournal.serial_no}`)}>
              PDF
            </button>
          </div>
          <div className="dash-card" style={{ background: theme?.card }}>
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Sayfalarda ara..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} className="search-input" />
            </div>
            {searchTerm && (
              <div className="search-results">
                {filteredHistory.map((item, i) => (
                  <button key={i} className="search-chip"
                    style={{ background: theme?.accent + '22', color: theme?.accent }}
                    onClick={() => { setSearchTerm(''); setTargetPage(parseInt(item.page)); }}>
                    SF {item.page}
                  </button>
                ))}
                {filteredHistory.length === 0 && <span className="no-result">Sonuç bulunamadı</span>}
              </div>
            )}
            <StatsPanel serialNo={activeJournal.serial_no} theme={theme} />
          </div>
        </div>
      </main>
      {loading && <div className="loading-overlay">ANALİZ EDİLİYOR...</div>}
    </div>
  );
}
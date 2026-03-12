import React, { useState, useEffect, useRef } from 'react';
import { Camera, Lock, LogOut, Download, Search, FileText, Image } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import './App.css';

const THEMES = {
  MANIFEST: { id: 'MANIFEST', name: 'Manifest', bg: 'bg-[#f4f1ea]', card: 'bg-white', accent: 'bg-emerald-800', text: 'text-stone-800', font: 'font-serif', pin: '1234' },
  FERDI: { id: 'FERDI', name: 'Ferdi Tayfur', bg: 'bg-zinc-950', card: 'bg-zinc-900', accent: 'bg-orange-600', text: 'text-orange-100', font: 'font-mono', pin: '1982' },
  CICIKUS: { id: 'CICIKUS', name: 'Cici Kuş', bg: 'bg-pink-50', card: 'bg-white', accent: 'bg-pink-400', text: 'text-pink-600', font: 'font-sans', pin: '2024' }
};

// Sayfa içeriği: resim varsa resmi göster, yoksa metni göster
const PageContent = ({ item }) => {
  const [viewMode, setViewMode] = useState('image'); // 'image' | 'text'

  if (!item.text && !item.image) {
    return <span className="opacity-20 text-sm">— boş —</span>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Mod değiştirme butonu - sadece her ikisi de varsa göster */}
      {item.text && item.image && (
        <div className="flex gap-2 mb-3 justify-end">
          <button
            onClick={() => setViewMode('image')}
            className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border transition-all ${viewMode === 'image' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'opacity-30 border-gray-300'}`}
          >
            <Image size={10} /> Resim
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border transition-all ${viewMode === 'text' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'opacity-30 border-gray-300'}`}
          >
            <FileText size={10} /> Metin
          </button>
        </div>
      )}

      {/* İçerik */}
      <div className="flex-1 overflow-hidden">
        {/* Resim göster */}
        {(viewMode === 'image' || !item.text) && item.image && (
          <img
            src={`http://127.0.0.1:8000${item.image}`}
            alt={`Sayfa ${item.page}`}
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              setViewMode('text');
            }}
          />
        )}

        {/* Metin göster */}
        {(viewMode === 'text' || !item.image) && item.text && (
          <div className="handwriting-text text-xl leading-[30px] italic text-blue-900 h-full overflow-auto">
            {item.text}
          </div>
        )}
      </div>
    </div>
  );
};

const DijitalAjanda = ({ theme, history, targetPage, isSearching }) => {
  const bookRef = useRef();
  
  const pagesArr = isSearching 
    ? history 
    : Array.from({ length: 30 }, (_, i) => {
        const note = history.find(n => parseInt(n.page) === i + 1);
        return note ? { text: note.text, page: i + 1, image: note.image } : { text: "", page: i + 1, image: null };
      });

  useEffect(() => {
    if (targetPage > 0 && bookRef.current) {
      setTimeout(() => {
        try {
          const pageFlip = bookRef.current.pageFlip();
          pageFlip.turnToPage(isSearching ? 1 : parseInt(targetPage));
        } catch (e) {}
      }, 400);
    }
  }, [targetPage, history, isSearching]);

  return (
    <div className="flex justify-center items-center w-full py-10">
      <HTMLFlipBook width={500} height={650} size="fixed" showCover={true} ref={bookRef} className="notebook-shadow">
        <div className="page cover-page" data-density="hard">
          <div className="cover-design text-center border-4 border-double border-amber-200 p-8 m-4">
            <h1 className="text-4xl font-bold uppercase">{isSearching ? "ARAMA" : theme.name}</h1>
            <p className="mt-4 opacity-50 text-sm">{isSearching ? "BULUNANLAR" : "2026 AJANDA"}</p>
          </div>
        </div>
        {pagesArr.map((item, i) => (
          <div key={i} className="page leaf-page relative">
            <div className="spiral-rings-effect"></div>
            <div className="leaf-inner p-10 h-full flex flex-col">
              <div className="flex justify-between opacity-30 text-[10px] mb-4 border-b border-red-200">
                <span>Ref: #{202600 + (item.page || i)}</span>
                <span>SAYFA {item.page}</span>
              </div>
              <div className="flex-1 min-h-0">
                <PageContent item={item} />
              </div>
            </div>
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

function App() {
  const [step, setStep] = useState('activation'); 
  const [inputValue, setInputValue] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [activeTheme, setActiveTheme] = useState(THEMES.MANIFEST);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetPage, setTargetPage] = useState(0);
  const [pinError, setPinError] = useState(false);
  const fileBuffer = useRef(null);

  const loadData = async () => {
    if (step !== 'dashboard') return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/history?theme=${activeTheme.id}`);
      setHistory(await res.json());
    } catch (err) {}
  };

  useEffect(() => { loadData(); }, [activeTheme, step]);

  const handleActivate = () => {
    const code = inputValue.toUpperCase();
    if (code.includes('FERDI')) setActiveTheme(THEMES.FERDI);
    else if (code.includes('CICI')) setActiveTheme(THEMES.CICIKUS);
    else setActiveTheme(THEMES.MANIFEST);
    setStep('pin');
  };

  const handleImageUpload = async (e, force = false) => {
    let file = force ? fileBuffer.current : e.target.files[0];
    if (!file) return;
    if (!force) fileBuffer.current = file;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://127.0.0.1:8000/upload?theme=${activeTheme.id}&force=${force}`, { method: 'POST', body: formData });
      
      if (res.status === 422) {
        setLoading(false);
        alert("SAYFADA AJANDANIZA AİT QR BULUNAMADI!\n\nLütfen sayfanızın fotoğrafını sayfa içerisindeki qr kod gözükecek şekilde yükleyin.");
        return;
      }

      if (res.status === 409) {
        const data = await res.json();
        setLoading(false);
        if (window.confirm(`Sayfa ${data.page} dolu! Eski not silinsin mi?\n\nMevcut: "${data.existing_text}"`)) {
            return handleImageUpload(null, true);
        }
        return;
      }

      if (!res.ok) throw new Error("Yükleme başarısız!");
      await loadData();
      const result = await res.json();
      setTargetPage(parseInt(result.page));
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const filteredHistory = history.filter(item => 
    item.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.page.toString().includes(searchTerm)
  );

  if (step === 'activation') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-white text-center">
        <h1 className="text-4xl font-black mb-8 italic uppercase">AJAN-DA</h1>
        <input type="text" value={inputValue} onChange={(e)=>setInputValue(e.target.value)} placeholder="KOD" className="w-full bg-black/20 rounded-xl px-4 py-4 mb-4 text-center font-bold outline-none uppercase" />
        <button onClick={handleActivate} className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-500 transition-all">GİRİŞ</button>
      </div>
    </div>
  );

  if (step === 'pin') return (
    <div className={`min-h-screen ${activeTheme.bg} flex items-center justify-center`}>
      <div className={`w-full max-w-sm ${activeTheme.card} p-10 rounded-[40px] shadow-2xl text-center border-2 ${pinError ? 'border-red-500 animate-shake' : 'border-black/5'}`}>
        <Lock className={`mx-auto mb-6 ${pinError ? 'text-red-500' : 'opacity-20'}`} size={48} />
        <h2 className={`mb-2 font-bold uppercase tracking-widest ${pinError ? 'text-red-500' : 'opacity-50'}`}>
          {pinError ? 'HATALI ŞİFRE!' : 'Giriş Şifresi'}
        </h2>
        <div className="flex justify-center gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pinValue.length > i ? (pinError ? 'bg-red-500 border-red-500' : 'bg-current border-current') : 'bg-transparent opacity-20'}`} />
            ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "←"].map((btn) => (
            <button key={btn} onClick={() => {
                setPinError(false);
                if (btn === "C") setPinValue('');
                else if (btn === "←") setPinValue(pinValue.slice(0, -1));
                else {
                  const newPin = pinValue + btn;
                  if (newPin.length <= 4) {
                    setPinValue(newPin);
                    if (newPin.length === 4) {
                      if (newPin === activeTheme.pin) setStep('dashboard');
                      else {
                        setPinError(true);
                        setTimeout(() => { setPinValue(''); setPinError(false); }, 800);
                      }
                    }
                  }
                }
              }} className={`h-16 rounded-2xl flex items-center justify-center text-xl font-bold border transition-all active:scale-95 ${pinError ? 'border-red-500 text-red-500' : 'hover:bg-black/5'}`}>
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${activeTheme.bg} ${activeTheme.text} ${activeTheme.font} flex flex-col`}>
      <nav className="p-6 border-b flex justify-between items-center bg-white/5 backdrop-blur-md sticky top-0 z-[100]">
        <span className="text-2xl font-black italic uppercase">AJAN-DA // {activeTheme.name}</span>
        <button onClick={() => {setStep('activation'); setPinValue('');}} className="opacity-50 underline flex items-center gap-1"><LogOut size={16}/> Çıkış</button>
      </nav>
      <main className="flex-1">
        <DijitalAjanda 
          theme={activeTheme} 
          history={searchTerm ? filteredHistory : history} 
          targetPage={targetPage}
          isSearching={searchTerm.length > 0}
        />
        <div className="container mx-auto grid md:grid-cols-2 gap-8 p-10">
          <div className={`${activeTheme.card} p-8 rounded-3xl shadow-xl flex items-center gap-6`}>
            <label className="flex-1 border-4 border-dashed rounded-2xl p-6 text-center hover:bg-black/5 cursor-pointer block">
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              <Camera className="mx-auto mb-2 opacity-50" size={40} />
              <p className="font-bold text-xs uppercase">Yükle</p>
            </label>
            <button onClick={() => window.open(`http://127.0.0.1:8000/export-pdf?theme=${activeTheme.id}`)} className="bg-red-600 text-white h-full px-8 rounded-2xl font-bold">PDF</button>
          </div>
          <div className={`${activeTheme.card} p-8 rounded-3xl shadow-xl`}>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 opacity-30" size={18} />
              <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/5 rounded-xl py-3 pl-10 outline-none" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filteredHistory.map((item, i) => (
                <button key={i} onClick={() => { setSearchTerm(''); setTargetPage(parseInt(item.page)); }} className="bg-black/10 px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap uppercase">SF {item.page}</button>
              ))}
            </div>
          </div>
        </div>
      </main>
      {loading && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] text-white">ANALİZ EDİLİYOR...</div>}
    </div>
  );
}

export default App;
import { useState, useEffect, useRef } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

const API = "https://ajan-da-backend-production.up.railway.app";

// ─── YARDIMCI ────────────────────────────────────────────────────────
const Empty = ({ msg }) => <div className="tpl-empty-hint">{msg || "Fotoğraflandıktan sonra görünecek"}</div>;
const TplHeader = ({ icon, title }) => <div className="tpl-header">{icon} {title}</div>;

// ─── ŞABLON BİLEŞENLERİ ──────────────────────────────────────────────

// Kapak
function TemplateCover({ data, empty, themeColor }) {
  return (
    <div className="tpl-cover" style={{ background: themeColor || "#2d4a3e" }}>
      <div className="tpl-cover-title">{data?.title || "AJANDA"}</div>
      {data?.subtitle && <div className="tpl-cover-sub">{data.subtitle}</div>}
      {data?.date_range && <div className="tpl-cover-date">{data.date_range}</div>}
      {empty && <div className="tpl-cover-hint">Kapak sayfası</div>}
    </div>
  );
}

// Bingo Izgarası (yıllık / aylık)
function TemplateBingo({ data, empty, title }) {
  const cells = data?.cells || [];
  return (
    <div className="tpl-bingo">
      <TplHeader icon="🎲" title={title || "Bingo"} />
      {empty ? <Empty /> : (
        <div className="tpl-bingo-grid">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`tpl-bingo-cell ${cells[i]?.checked ? "checked" : ""}`}>
              <span>{cells[i]?.text || ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Vision Board
function TemplateVisionBoard({ data, empty }) {
  const boxes = data?.boxes || [];
  return (
    <div className="tpl-vision">
      <TplHeader icon="🎯" title="Vision Board" />
      {empty ? <Empty /> : (
        <div className="tpl-vision-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="tpl-vision-box">
              {boxes[i] && <span>{boxes[i]}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Önemli Günler (12 ay)
function TemplateOnemliGunler({ data, empty }) {
  const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  return (
    <div className="tpl-onemli">
      <TplHeader icon="📅" title="Önemli Günler" />
      {empty ? <Empty /> : (
        <div className="tpl-onemli-grid">
          {months.map((m, i) => (
            <div key={i} className="tpl-onemli-month">
              <div className="tpl-onemli-month-name">{m}</div>
              <div className="tpl-onemli-content">{data?.[m.toLowerCase()] || ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Mutluluk Sayacı / Mood Calendar
function TemplateMutlulukSayaci({ data, empty }) {
  const moodEmojis = { "harika": "😄", "iyi": "🙂", "orta": "😐", "kotu": "😕", "berbat": "😢" };
  const days = data?.days || {};
  return (
    <div className="tpl-mood-cal">
      <TplHeader icon="😊" title="Mutluluk Planlayıcısı" />
      {data?.month && <div className="tpl-date">{data.month}</div>}
      {empty ? <Empty /> : (
        <div className="tpl-mood-grid">
          {["Paz","Sal","Çar","Per","Cum","Cmt","Paz"].map(d => (
            <div key={d} className="tpl-month-header">{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i + 1;
            const mood = day <= 31 ? days[day] : null;
            return (
              <div key={i} className={`tpl-mood-cell ${mood || ""}`}>
                {day <= 31 && <span className="tpl-mood-day">{day}</span>}
                {mood && <span className="tpl-mood-emoji">{moodEmojis[mood] || mood}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Kendime Mektup
function TemplateKendimeMektup({ data, empty }) {
  return (
    <div className="tpl-letter">
      <TplHeader icon="✉️" title="Kendime Mektup" />
      {empty ? (
        <div className="tpl-letter-lines">
          {Array.from({ length: 18 }).map((_, i) => <div key={i} className="tpl-line" />)}
        </div>
      ) : (
        <div className="tpl-notes-text">{data?.content || ""}</div>
      )}
    </div>
  );
}

// Aylık Takvim Grid
function TemplateMonthly({ data, empty }) {
  const markedDays = data?.marked_days || [];
  const days = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
  return (
    <div className="tpl-monthly">
      <TplHeader icon="🗓" title="Aylık Takvim" />
      {data?.month && <div className="tpl-date">{data.month}</div>}
      <div className="tpl-month-grid">
        {days.map(d => <div key={d} className="tpl-month-header">{d}</div>)}
        {Array.from({ length: 35 }).map((_, i) => {
          const day = i + 1;
          const marked = !empty && day <= 31 && markedDays.includes(day);
          return (
            <div key={i} className={`tpl-month-day ${marked ? "marked" : ""}`}>
              {day <= 31 ? day : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Aylık Planlayıcı (takvim + todo + notlar)
function TemplateAylikPlanlayici({ data, empty }) {
  return (
    <div className="tpl-aylik-planlayici">
      <TplHeader icon="📋" title="Aylık Planlayıcı" />
      {empty ? <Empty /> : (
        <>
          <TemplateMonthly data={data?.calendar} empty={false} />
          <div className="tpl-row" style={{marginTop:8}}>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Yapılacaklar</div>
              {(data?.todo || []).map((t, i) => <div key={i} className="tpl-todo-item"><span>☐</span> {t}</div>)}
            </div>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Notlar</div>
              <div className="tpl-notes-text">{data?.notes || ""}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Aylık Ders Planı (31 gün grid)
function TemplateDersPlani({ data, empty }) {
  const days = data?.days || {};
  return (
    <div className="tpl-ders">
      <TplHeader icon="📚" title="Aylık Ders Planı" />
      {empty ? <Empty /> : (
        <div className="tpl-ders-grid">
          {Array.from({ length: 31 }).map((_, i) => (
            <div key={i} className="tpl-ders-day">
              <div className="tpl-ders-day-num">GÜN {i+1}</div>
              <div className="tpl-ders-content">{days[i+1] || ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Film-Dizi Takip (tablo)
function TemplateFilmDizi({ data, empty }) {
  const items = data?.items || [];
  return (
    <div className="tpl-film">
      <TplHeader icon="🎬" title="Film-Dizi Takip" />
      {empty ? <Empty /> : (
        <table className="tpl-table">
          <thead>
            <tr><th>☐</th><th>Tür</th><th>Film/Dizi</th><th>⭐</th></tr>
          </thead>
          <tbody>
            {items.length === 0
              ? Array.from({length: 8}).map((_, i) => (
                  <tr key={i}><td>☐</td><td></td><td></td><td>☆☆☆☆☆</td></tr>
                ))
              : items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.done ? "☑" : "☐"}</td>
                    <td>{it.genre || ""}</td>
                    <td>{it.name || ""}</td>
                    <td>{"★".repeat(it.rating || 0)}{"☆".repeat(5-(it.rating||0))}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      )}
    </div>
  );
}

// Bu Ayın Filmleri (film şeridi)
function TemplateFilmSerit({ data, empty }) {
  return (
    <div className="tpl-filmserit">
      <TplHeader icon="🎥" title="Bu Ayın Filmleri" />
      {empty ? <Empty /> : (
        <div className="tpl-filmserit-grid">
          {Array.from({length:16}).map((_, i) => (
            <div key={i} className="tpl-film-frame">{data?.items?.[i] || ""}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Spor Planı (30 gün)
function TemplateSpor({ data, empty }) {
  const days = data?.days || {};
  return (
    <div className="tpl-spor">
      <TplHeader icon="🏃" title="Spor Planı" />
      {data?.date && <div className="tpl-date">{data.date}</div>}
      {empty ? <Empty /> : (
        <div className="tpl-spor-grid">
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} className="tpl-spor-cell">
              <div className="tpl-spor-num">GÜN {i+1}</div>
              <div className="tpl-spor-content">{days[i+1] || ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Okuma Takip (numaralı liste)
function TemplateOkumaTakip({ data, empty }) {
  const books = data?.books || [];
  return (
    <div className="tpl-okuma">
      <TplHeader icon="📖" title="Okuma Takip" />
      {empty ? <Empty /> : (
        <div className="tpl-okuma-cols">
          <div className="tpl-okuma-col">
            {Array.from({length:25}).map((_, i) => (
              <div key={i} className="tpl-okuma-item">
                <span className="tpl-okuma-num">{i+1}</span>
                <span className="tpl-okuma-line">{books[i] || ""}</span>
              </div>
            ))}
          </div>
          <div className="tpl-okuma-col">
            {Array.from({length:25}).map((_, i) => (
              <div key={i} className="tpl-okuma-item">
                <span className="tpl-okuma-num">{i+26}</span>
                <span className="tpl-okuma-line">{books[i+25] || ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Okuma Takip Tablo (tarih/kitap/yazar)
function TemplateOkumaTablo({ data, empty }) {
  const rows = data?.rows || [];
  return (
    <div className="tpl-okuma-tablo">
      <TplHeader icon="📖" title="Okuma Takip" />
      {empty ? <Empty /> : (
        <table className="tpl-table">
          <thead><tr><th>Tarih</th><th>Kitap</th><th>Yazar</th></tr></thead>
          <tbody>
            {rows.length === 0
              ? Array.from({length:10}).map((_, i) => <tr key={i}><td></td><td></td><td></td></tr>)
              : rows.map((r, i) => <tr key={i}><td>{r.date}</td><td>{r.book}</td><td>{r.author}</td></tr>)
            }
          </tbody>
        </table>
      )}
    </div>
  );
}

// Kitap Rafı
function TemplateKitapRafi({ data, empty }) {
  return (
    <div className="tpl-kitapraf">
      <TplHeader icon="📚" title="Kitap Okuma Takibi" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-kitapraf-shelves">
            {Array.from({length:3}).map((_, shelf) => (
              <div key={shelf} className="tpl-shelf">
                {Array.from({length:8}).map((_, b) => (
                  <div key={b} className={`tpl-book ${data?.books?.[shelf*8+b] ? "filled" : ""}`}>
                    {data?.books?.[shelf*8+b] || ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {data?.start && <div className="tpl-date">Başlangıç: {data.start}</div>}
          {data?.end && <div className="tpl-date">Bitiş: {data.end}</div>}
        </>
      )}
    </div>
  );
}

// Şifre Takip
function TemplateSifreTakip({ data, empty }) {
  const entries = data?.entries || [];
  return (
    <div className="tpl-sifre">
      <TplHeader icon="🔐" title="Şifrelerim" />
      {empty ? <Empty /> : (
        <div className="tpl-sifre-grid">
          {(entries.length === 0 ? Array.from({length:8}).map(() => ({})) : entries).map((e, i) => (
            <div key={i} className="tpl-sifre-card">
              <div className="tpl-sifre-site">{e.website || "Web site:"}</div>
              <div className="tpl-sifre-user">{e.username ? `👤 ${e.username}` : "Kullanıcı adı:"}</div>
              <div className="tpl-sifre-pass">{e.password ? "🔑 ••••••" : "Şifre:"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Egzersiz Takip (yıllık ızgara)
function TemplateEgzersizTakip({ data, empty }) {
  const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Ekt","Kas","Ara"];
  const grid = data?.grid || {};
  return (
    <div className="tpl-egzersiz">
      <TplHeader icon="💪" title="Egzersiz Takibi" />
      {empty ? <Empty /> : (
        <div className="tpl-egzersiz-grid">
          <div className="tpl-eg-row tpl-eg-header">
            <div className="tpl-eg-day"></div>
            {months.map(m => <div key={m} className="tpl-eg-month">{m}</div>)}
          </div>
          {Array.from({length:31}).map((_, d) => (
            <div key={d} className="tpl-eg-row">
              <div className="tpl-eg-day">{String(d+1).padStart(2,'0')}</div>
              {months.map((m, mi) => (
                <div key={mi} className={`tpl-eg-cell ${grid[`${d+1}-${mi+1}`] ? "done" : ""}`}>
                  {grid[`${d+1}-${mi+1}`] ? "○" : "○"}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Alışkanlık Takip (daire/spiral)
function TemplateAliskanlik({ data, empty }) {
  const habits = data?.habits || [];
  return (
    <div className="tpl-aliskanlik">
      <TplHeader icon="🔥" title="Alışkanlık Takibi" />
      {data?.month && <div className="tpl-date">{data.month}</div>}
      {empty ? <Empty /> : (
        <>
          <div className="tpl-habit-list">
            {habits.map((h, i) => (
              <div key={i} className="tpl-habit-item">
                <span className={`tpl-habit-check ${h.completed ? "done" : ""}`}>{h.completed ? "✓" : "○"}</span>
                <span>{h.name}</span>
                {h.days_done?.length > 0 && <span className="tpl-habit-days">({h.days_done.length} gün)</span>}
              </div>
            ))}
          </div>
          {data?.notes && <div className="tpl-notes-text" style={{marginTop:8}}>{data.notes}</div>}
        </>
      )}
    </div>
  );
}

// Bütçe Takip
function TemplateButce({ data, empty }) {
  const expenses = data?.expenses || [];
  const income = data?.income || [];
  return (
    <div className="tpl-butce">
      <TplHeader icon="💰" title="Aylık Bütçe Takip" />
      {(
        <>
          {data?.goals?.length > 0 && (
            <div className="tpl-section">
              <div className="tpl-section-title">Finansal Hedefler</div>
              {data.goals.map((g, i) => <div key={i} className="tpl-item">{i+1}. {g}</div>)}
            </div>
          )}
          <div className="tpl-row" style={{gap:8, marginTop:8}}>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Harcamalar</div>
              <table className="tpl-table">
                <thead><tr><th>Tarih</th><th>Tür</th><th>₺</th></tr></thead>
                <tbody>{expenses.map((e,i) => <tr key={i}><td>{e.date}</td><td>{e.type}</td><td>{e.amount}</td></tr>)}</tbody>
              </table>
            </div>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Gelir</div>
              <table className="tpl-table">
                <thead><tr><th>Tarih</th><th>Tür</th><th>₺</th></tr></thead>
                <tbody>{income.map((e,i) => <tr key={i}><td>{e.date}</td><td>{e.type}</td><td>{e.amount}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Aylık Gözlem
function TemplateAylikGozlem({ data, empty }) {
  return (
    <div className="tpl-gozlem">
      <TplHeader icon="🔍" title="Aylık Gözlem" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-row" style={{gap:12}}>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Minnettar Olduklarım</div>
              {(data?.grateful || []).map((g,i) => <div key={i} className="tpl-item">○ {g}</div>)}
            </div>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Bu Ay İçin Puanım</div>
              <div style={{fontSize:18}}>{"★".repeat(data?.score||0)}{"☆".repeat(5-(data?.score||0))}</div>
            </div>
          </div>
          <div className="tpl-row" style={{gap:12, marginTop:8}}>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Bu Ay Nasıldı?</div>
              <div className="tpl-notes-text">{data?.how_was_it || ""}</div>
            </div>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Geliştirmelerim</div>
              {(data?.improvements || []).map((g,i) => <div key={i} className="tpl-item">{g}</div>)}
            </div>
          </div>
          {data?.intentions && (
            <div className="tpl-section" style={{marginTop:8}}>
              <div className="tpl-section-title">Gelecek Ay Niyetlerim</div>
              <div className="tpl-notes-text">{data.intentions}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Aylık Şükran (31 satır)
function TemplateAylikSukran({ data, empty }) {
  const entries = data?.entries || [];
  return (
    <div className="tpl-aylik-sukran">
      <TplHeader icon="🌸" title="Aylık Şükran Sayfam" />
      {empty ? <Empty /> : (
        <div className="tpl-sukran-list">
          {Array.from({length:31}).map((_, i) => (
            <div key={i} className="tpl-sukran-item">
              <span className="tpl-sukran-num">{i+1}</span>
              <span className="tpl-sukran-text">{entries[i] || ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Regl Takibi
function TemplateRegl({ data, empty }) {
  const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Ekt","Kas","Ara"];
  const grid = data?.grid || {};
  return (
    <div className="tpl-regl">
      <TplHeader icon="🌸" title="Regl Takibi" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-eg-grid" style={{fontSize:"0.65em"}}>
            <div className="tpl-eg-row tpl-eg-header">
              <div className="tpl-eg-day"></div>
              {months.map(m => <div key={m} className="tpl-eg-month">{m}</div>)}
            </div>
            {Array.from({length:31}).map((_, d) => (
              <div key={d} className="tpl-eg-row">
                <div className="tpl-eg-day">{String(d+1).padStart(2,'0')}</div>
                {months.map((m, mi) => (
                  <div key={mi} className={`tpl-eg-cell ${grid[`${d+1}-${mi+1}`] || ""}`}></div>
                ))}
              </div>
            ))}
          </div>
          {data?.notes && <div className="tpl-notes-text" style={{marginTop:6}}>{data.notes}</div>}
        </>
      )}
    </div>
  );
}

// Duygudurum Takibi (yıllık)
function TemplateDuygudurum({ data, empty }) {
  const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Ekt","Kas","Ara"];
  const moodColors = { harika: "#4caf50", neseli: "#8bc34a", normal: "#ffc107", mutsuz: "#ff5722" };
  const grid = data?.grid || {};
  return (
    <div className="tpl-duygu">
      <TplHeader icon="😊" title="Duygudurum Takibi" />
      {empty ? <Empty /> : (
        <div className="tpl-eg-grid" style={{fontSize:"0.65em"}}>
          <div className="tpl-eg-row tpl-eg-header">
            <div className="tpl-eg-day"></div>
            {months.map(m => <div key={m} className="tpl-eg-month">{m}</div>)}
          </div>
          {Array.from({length:31}).map((_, d) => (
            <div key={d} className="tpl-eg-row">
              <div className="tpl-eg-day">{String(d+1).padStart(2,'0')}</div>
              {months.map((m, mi) => {
                const mood = grid[`${d+1}-${mi+1}`];
                return (
                  <div key={mi} className="tpl-eg-cell"
                    style={{background: mood ? moodColors[mood] || "#ddd" : "transparent"}}>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Haftalık Dikey (2 sayfa — Pzt/Sal/Çar + highlight)
function TemplateHaftalikDikey({ data, empty }) {
  const days = [
    {key:"monday",   short:"PAZ", weekend:false},
    {key:"tuesday",  short:"SAL", weekend:false},
    {key:"wednesday",short:"ÇAR", weekend:false},
    {key:"thursday", short:"PER", weekend:false},
    {key:"friday",   short:"CUM", weekend:false},
    {key:"saturday", short:"CMT", weekend:true},
    {key:"sunday",   short:"PAZ", weekend:true},
  ];
  const hours = ["7:00","9:00","11:00","13:00","15:00"];
  const getItems = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string" && val.trim()) return [val];
    return [];
  };
  return (
    <div className="tpl-hw">
      <div className="tpl-hw-title">
        {data?.week ? `HAFTALIK PLAN — ${data.week}` : "HAFTALIK PLAN"}
      </div>
      <div className="tpl-hw-grid">
        {days.map(d => (
          <div key={d.key} className={`tpl-hw-head ${d.weekend?"wknd":""}`}>{d.short}</div>
        ))}
        {hours.map((h, hi) => days.map(d => {
          const items = getItems(data?.[d.key]);
          // Her saat dilimine bir item yerleştir
          const item = !empty && items[hi] ? items[hi] : null;
          return (
            <div key={d.key+h} className="tpl-hw-cell">
              <span className="tpl-hw-hour">{h}</span>
              {item && <div className="tpl-hw-entry">{item}</div>}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// Haftalık Plan — PDF'teki gibi 7 sütun x saat dilimleri
// Şablon yazıları (gün adları, saatler) her zaman görünür
// OCR el yazısı verileri de üstüne eklenir
function TemplateHaftalikTekli1({ data, empty }) {
  const days = [
    {key:"monday",   short:"PAZ", weekend:false},
    {key:"tuesday",  short:"SAL", weekend:false},
    {key:"wednesday",short:"ÇAR", weekend:false},
    {key:"thursday", short:"PER", weekend:false},
    {key:"friday",   short:"CUM", weekend:false},
    {key:"saturday", short:"CMT", weekend:true},
    {key:"sunday",   short:"PAZ", weekend:true},
  ];
  const hours = ["7:00","9:00","11:00","13:00","15:00"];
  const getItems = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string" && val.trim()) return val.split(/[\n,]+/).filter(Boolean);
    return [];
  };
  return (
    <div className="tpl-hw">
      <div className="tpl-hw-title">
        {data?.week ? `HAFTALIK PLAN — ${data.week}` : "HAFTALIK PLAN"}
      </div>
      <div className="tpl-hw-grid">
        {/* Gün başlıkları — şablon yazısı, her zaman görünür */}
        {days.map(d => (
          <div key={d.key} className={`tpl-hw-head ${d.weekend?"wknd":""}`}>{d.short}</div>
        ))}
        {/* Saat dilimleri — şablon çizgisi + el yazısı */}
        {hours.map((h, hi) => days.map(d => {
          const items = getItems(data?.[d.key]);
          return (
            <div key={d.key+h} className="tpl-hw-cell">
              <span className="tpl-hw-hour">{h}</span>
              {/* El yazısı sadece ilk saat diliminde göster */}
              {!empty && hi === 0 && items.map((item, i) => (
                <div key={i} className="tpl-hw-entry">{item}</div>
              ))}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// Haftalık Tekli-2 (günler + alışkanlıklar)
function TemplateHaftalikTekli2({ data, empty }) {
  const days = [
    {key:"monday",   label:"Pazartesi"},
    {key:"tuesday",  label:"Salı"},
    {key:"wednesday",label:"Çarşamba"},
    {key:"thursday", label:"Perşembe"},
    {key:"friday",   label:"Cuma"},
    {key:"saturday", label:"Cumartesi"},
    {key:"sunday",   label:"Pazar"},
  ];
  return (
    <div className="tpl-haftalik-tekli2">
      <TplHeader icon="2️⃣" title="Haftalık" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-tekli2-days">
            {days.map(d => (
              <div key={d.key} className="tpl-tekli2-day">
                <div className="tpl-day-name">{d.label}</div>
                {(data?.[d.key] || []).map((item, i) => <div key={i} className="tpl-item">○ {item}</div>)}
              </div>
            ))}
          </div>
          {data?.habits?.length > 0 && (
            <div className="tpl-section" style={{marginTop:8}}>
              <div className="tpl-section-title">Alışkanlıklar</div>
              {data.habits.map((h, i) => (
                <div key={i} className="tpl-habit-item">
                  <span>{h.name}</span>
                  <div className="tpl-habit-dots">
                    {Array.from({length:7}).map((_, d) => (
                      <span key={d} className={`tpl-habit-dot ${h.days?.[d] ? "done" : ""}`}>○</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Haftalık Kapanış
function TemplateHaftalikKapanis({ data, empty }) {
  return (
    <div className="tpl-kapanis">
      <TplHeader icon="📊" title="Haftalık Kapanış" />
      {data?.date && <div className="tpl-date">{data.date}</div>}
      {empty ? <Empty /> : (
        <>
          <div className="tpl-section-title">Geçen Haftanın Analizi</div>
          <div className="tpl-row" style={{gap:6}}>
            {[["energy_down","Enerji Düşüren"],["proud","Gurur Duyulan"],["release","Bırakılan"]].map(([k,l]) => (
              <div key={k} style={{flex:1, background:"#fce4ec", borderRadius:8, padding:6}}>
                <div className="tpl-section-title">{l}</div>
                <div className="tpl-notes-text">{data?.[k] || ""}</div>
              </div>
            ))}
          </div>
          <div className="tpl-section-title" style={{marginTop:8}}>Haftanın 3 Ana Dersi</div>
          <div className="tpl-row" style={{gap:6}}>
            {[["lesson_rel","İlişkilerde"],["lesson_work","İşte/Okulda"],["lesson_self","Kendimle"]].map(([k,l]) => (
              <div key={k} style={{flex:1, background:"#e0f7fa", borderRadius:8, padding:6}}>
                <div className="tpl-section-title">{l}</div>
                <div className="tpl-notes-text">{data?.[k] || ""}</div>
              </div>
            ))}
          </div>
          {data?.next_intent && (
            <div className="tpl-section" style={{marginTop:8}}>
              <div className="tpl-section-title">Gelecek Hafta Niyeti</div>
              <div className="tpl-notes-text">{data.next_intent}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Yemek Planı
function TemplateYemekPlani({ data, empty }) {
  const days = [
    {key:"monday",  label:"Pazartesi"},{key:"tuesday",   label:"Salı"},
    {key:"wednesday",label:"Çarşamba"},{key:"thursday",  label:"Perşembe"},
    {key:"friday",  label:"Cuma"},    {key:"saturday",   label:"Cumartesi"},
    {key:"sunday",  label:"Pazar"},
  ];
  return (
    <div className="tpl-yemek">
      <TplHeader icon="🍽️" title="Haftalık Yemek Planı" />
      {empty ? <Empty /> : (
        <div className="tpl-yemek-grid">
          {days.map(d => (
            <div key={d.key} className="tpl-yemek-day">
              <div className="tpl-day-name">{d.label}</div>
              <div className="tpl-day-content">{data?.[d.key] || ""}</div>
            </div>
          ))}
          {data?.shopping?.length > 0 && (
            <div className="tpl-yemek-day">
              <div className="tpl-day-name">🛒 Alışveriş</div>
              {data.shopping.map((s,i) => <div key={i} className="tpl-item">○ {s}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Günlük Çizgili
function TemplateGunlukCizgili({ data, empty }) {
  return (
    <div className="tpl-gunluk-cizgili">
      <TplHeader icon="📝" title="Günlük" />
      {data?.date && <div className="tpl-date">{data.date}</div>}
      {empty ? (
        <>
          <div className="tpl-row" style={{gap:8, marginBottom:8}}>
            <div style={{flex:1, border:"1px solid #e2d9ce", borderRadius:8, padding:8, minHeight:60}}>
              <div className="tpl-section-title">Öncelikler</div>
            </div>
            <div style={{flex:1, border:"1px solid #e2d9ce", borderRadius:8, padding:8, minHeight:60}}>
              <div className="tpl-section-title">Notlar</div>
            </div>
          </div>
          <div className="tpl-lines">
            {Array.from({length:14}).map((_,i) => <div key={i} className="tpl-line" />)}
          </div>
        </>
      ) : (
        <>
          <div className="tpl-row" style={{gap:8, marginBottom:8}}>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Öncelikler</div>
              {(data?.priorities || []).map((p,i) => <div key={i} className="tpl-priority-item"><span className="tpl-num">{i+1}</span>{p}</div>)}
            </div>
            <div style={{flex:1}}>
              <div className="tpl-section-title">Notlar</div>
              <div className="tpl-notes-text">{data?.notes || ""}</div>
            </div>
          </div>
          <div className="tpl-notes-text">{data?.content || ""}</div>
        </>
      )}
    </div>
  );
}

// Baş Planlayıcı (saatli)
function TemplateBasPlanlayici({ data, empty }) {
  const hours = ["6:00","7:00","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
  const schedule = data?.schedule || {};
  return (
    <div className="tpl-bas">
      <div className="tpl-row" style={{gap:4}}>
        {data?.day && <span className="tpl-section-title">GÜN: {data.day}</span>}
        {data?.date && <span className="tpl-section-title">TARİH: {data.date}</span>}
      </div>
      {empty ? <Empty /> : (
        <div className="tpl-row" style={{gap:8, alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            {hours.map(h => (
              <div key={h} className="tpl-schedule-item">
                <span className="tpl-hour">{h}</span>
                <span>{schedule[h] || ""}</span>
              </div>
            ))}
          </div>
          <div style={{flex:1}}>
            <div className="tpl-section-title">YAPILACAKLAR</div>
            {(data?.todo || []).map((t,i) => <div key={i} className="tpl-item">☐ {t}</div>)}
            <div className="tpl-section-title" style={{marginTop:8}}>NOTLAR</div>
            <div className="tpl-notes-text">{data?.notes || ""}</div>
            {data?.mood && <div style={{marginTop:8}}>MOD: {data.mood}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// Günlük Şükran
function TemplateGunlukSukran({ data, empty }) {
  return (
    <div className="tpl-gunluk-sukran">
      <TplHeader icon="🌟" title="Günlük Şükran Sayfam" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-row" style={{gap:8}}>
            <div style={{flex:1, background:"#e3f2fd", borderRadius:8, padding:8}}>
              <div className="tpl-section-title">Bugünün Olumlaması</div>
              <div className="tpl-notes-text">{data?.affirmation || ""}</div>
            </div>
            <div style={{flex:1, background:"#e3f2fd", borderRadius:8, padding:8}}>
              <div className="tpl-section-title">Bugünün Öncelikleri</div>
              {(data?.priorities || []).map((p,i) => <div key={i} className="tpl-item">{i+1}. {p}</div>)}
            </div>
          </div>
          <div style={{background:"#e3f2fd", borderRadius:8, padding:8, margin:"8px 0"}}>
            <div className="tpl-section-title">Bugün Minnettar Olduğum Şeyler</div>
            <div className="tpl-notes-text">{data?.grateful || ""}</div>
          </div>
          <div style={{background:"#e3f2fd", borderRadius:8, padding:8}}>
            <div className="tpl-section-title">Sabırsızlıkla Beklediğim Şeyler</div>
            <div className="tpl-notes-text">{data?.looking_fwd || ""}</div>
          </div>
        </>
      )}
    </div>
  );
}

// Notlar (genel)
function TemplateNotes({ data, empty }) {
  return (
    <div className="tpl-notes">
      <TplHeader icon="📝" title="Notlar" />
      {empty ? (
        <div className="tpl-lines">{Array.from({length:14}).map((_,i) => <div key={i} className="tpl-line" />)}</div>
      ) : (
        <div className="tpl-notes-text">{data?.content || ""}</div>
      )}
    </div>
  );
}

// ─── ANA ROUTER ──────────────────────────────────────────────────────
function PageTemplate({ type, data, empty, themeColor }) {
  const props = { data, empty, themeColor };
  switch(type) {
    case "cover":           return <TemplateCover {...props} />;
    case "yillik_bingo":    return <TemplateBingo {...props} title="Yıllık Bingo" />;
    case "aylik_bingo":     return <TemplateBingo {...props} title="Aylık Bingo" />;
    case "bingo_grid":      return <TemplateBingo {...props} />;
    case "vision_board":
    case "vision_boxes":    return <TemplateVisionBoard {...props} />;
    case "onemli_gunler":   return <TemplateOnemliGunler {...props} />;
    case "mutluluk_sayaci":
    case "mood_calendar":   return <TemplateMutlulukSayaci {...props} />;
    case "kendime_mektup":
    case "letter":          return <TemplateKendimeMektup {...props} />;
    case "monthly":
    case "aylik_takvim":
    case "monthly_grid":    return <TemplateMonthly {...props} />;
    case "aylik_planlayici":return <TemplateAylikPlanlayici {...props} />;
    case "ders_plani":
    case "daily_grid_31":   return <TemplateDersPlani {...props} />;
    case "film_dizi_plani":
    case "film_table":      return <TemplateFilmDizi {...props} />;
    case "film_dizi_takip":
    case "film_strip":      return <TemplateFilmSerit {...props} />;
    case "spor_plani":
    case "sport_grid_30":   return <TemplateSpor {...props} />;
    case "okuma_takip":
    case "numbered_list_50":return <TemplateOkumaTakip {...props} />;
    case "okuma_takip_2":
    case "reading_table":   return <TemplateOkumaTablo {...props} />;
    case "okuma_takip_3":
    case "book_shelves":    return <TemplateKitapRafi {...props} />;
    case "sifre_takip":
    case "password_list":   return <TemplateSifreTakip {...props} />;
    case "egzersiz_takip":
    case "habit_year_grid": return <TemplateEgzersizTakip {...props} />;
    case "aliskanlik":
    case "habit_circle":    return <TemplateAliskanlik {...props} />;
    case "butce_takip":
    case "budget_table":    return <TemplateButce {...props} />;
    case "aylik_gozlem":    return <TemplateAylikGozlem {...props} />;
    case "aylik_sukran":
    case "numbered_list_31":return <TemplateAylikSukran {...props} />;
    case "regl_takibi":
    case "period_grid":     return <TemplateRegl {...props} />;
    case "duygudurum_takibi":
    case "mood_grid":       return <TemplateDuygudurum {...props} />;
    case "haftalik_yatay":
    case "haftalik_yatay_2":
    case "haftalik_dikey":
    case "day_col":
    case "day_notes":       return <TemplateHaftalikDikey {...props} />;
    case "haftalik_tekli1":
    case "day_box":         return <TemplateHaftalikTekli1 {...props} />;
    case "haftalik_tekli2":
    case "day_bullets":     return <TemplateHaftalikTekli2 {...props} />;
    case "haftalik_kapanisi":return <TemplateHaftalikKapanis {...props} />;
    case "yemek_plan":
    case "meal_box":        return <TemplateYemekPlani {...props} />;
    case "gunluk_cizgili":
    case "lined_notes":     return <TemplateGunlukCizgili {...props} />;
    case "bas_planlayici":
    case "schedule":        return <TemplateBasPlanlayici {...props} />;
    case "gunluk_sukran":   return <TemplateGunlukSukran {...props} />;
    default:                return <TemplateNotes {...props} />;
  }
}

// Çok bölgeli sayfa
function RegionComponent({ regionId, region, onSave }) {
  return (
    <PageTemplate type={region.type} data={region.data} empty={!region.data} />
  );
}

function EditablePageView({ activePage, tplType, data, empty, themeColor, onSave }) {
  if (!data) return <PageTemplate type={tplType} data={data} empty={true} themeColor={themeColor} />;

  // Haftalik: regions'daki günleri düz data'ya map et
  const haftalikTypes = ["haftalik_dikey","haftalik_yatay","haftalik_yatay_2","haftalik_tekli1","haftalik_tekli2","haftalik_kapanisi","yemek_plan"];
  if (data.regions && haftalikTypes.includes(tplType)) {
    const r = data.regions;
    const getVal = (region) => {
      if (!region) return "";
      const items = region.data?.items;
      const content = region.data?.content;
      if (Array.isArray(items) && items.length > 0) return items;
      if (content) return content;
      return "";
    };
    const mapped = {
      week:      r.header?.data?.title || r.header?.data?.subtitle || "",
      monday:    getVal(r.monday),
      tuesday:   getVal(r.tuesday),
      wednesday: getVal(r.wednesday),
      thursday:  getVal(r.thursday),
      friday:    getVal(r.friday),
      saturday:  getVal(r.saturday),
      sunday:    getVal(r.sunday),
      notes:     getVal(r.notes),
      // Haftalık kapanış için
      energy_down:  getVal(r.energy_down),
      proud:        getVal(r.proud),
      release:      getVal(r.release),
      lesson_rel:   getVal(r.lesson_rel),
      lesson_work:  getVal(r.lesson_work),
      lesson_self:  getVal(r.lesson_self),
      next_intent:  getVal(r.next_intent),
    };
    return <PageTemplate type={tplType} data={mapped} empty={false} themeColor={themeColor} />;
  }

  // Çok bölgeli — her bölgeyi ayrı göster
  if (data.regions && Object.keys(data.regions).length > 1) {
    return (
      <div className="multi-region">
        {Object.entries(data.regions).map(([rid, region]) => (
          <div key={rid} className="region-block">
            <div className="region-label">{region.label}</div>
            <PageTemplate type={region.type} data={region.data} empty={!region.data} themeColor={themeColor} />
          </div>
        ))}
      </div>
    );
  }
  if (data.regions) {
    const [rid, region] = Object.entries(data.regions)[0];
    return <PageTemplate type={region.type} data={region.data} empty={!region.data} themeColor={themeColor} />;
  }
  return <PageTemplate type={tplType} data={data} empty={empty} themeColor={themeColor} />;
}

// ─── OCR TEXT EDITOR ─────────────────────────────────────────────────
function OcrTextEditor({ tplType, data, onSave }) {
  const dayKeys = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const dayLabels = {
    monday:"Pazartesi", tuesday:"Salı", wednesday:"Çarşamba",
    thursday:"Perşembe", friday:"Cuma", saturday:"Cumartesi", sunday:"Pazar"
  };
  const haftalikTypes = ["haftalik_tekli1","haftalik_dikey","haftalik_tekli2",
    "haftalik_yatay","haftalik_yatay_2","yemek_plan"];

  // Regions'dan ham OCR metnini çıkar
  const getRawOcr = () => {
    if (!data?.regions) return data?.ocr_text || "";
    return Object.values(data.regions)
      .map(r => r.ocr_text || "")
      .filter(Boolean)
      .join(" | ");
  };

  // Regions'dan gün bazlı değerleri çıkar
  const getDayVal = (key) => {
    if (!data?.regions) return data?.[key] || "";
    const region = data.regions[key];
    if (!region) return "";
    const items = region.data?.items;
    const content = region.data?.content;
    if (Array.isArray(items) && items.length > 0) return items.join(", ");
    return content || "";
  };

  const [vals, setVals] = useState(() => {
    const init = {};
    if (haftalikTypes.includes(tplType)) {
      dayKeys.forEach(d => { init[d] = getDayVal(d); });
    } else {
      init["_ocr"] = getRawOcr();
    }
    return init;
  });

  const save = (key, val) => {
    setVals(prev => ({...prev, [key]: val}));
    onSave(key, "content", val);
  };

  if (haftalikTypes.includes(tplType)) {
    return (
      <div className="ocr-editor">
        {dayKeys.map(d => (
          <div key={d} className="ocr-field">
            <label className="ocr-label">{dayLabels[d]}</label>
            <input
              className="ocr-input"
              value={vals[d] || ""}
              onChange={e => save(d, e.target.value)}
              placeholder="El yazısı..."
            />
          </div>
        ))}
      </div>
    );
  }

  // Diğer sayfalar — ham OCR + region bazlı alanlar
  const regionEntries = data?.regions
    ? Object.entries(data.regions).filter(([,r]) => r.ocr_text?.trim())
    : [];

  if (regionEntries.length > 0) {
    return (
      <div className="ocr-editor">
        {regionEntries.map(([rid, region]) => (
          <div key={rid} className="ocr-field">
            <label className="ocr-label">{region.label}</label>
            <textarea
              className="ocr-textarea"
              value={vals[rid] !== undefined ? vals[rid] : (region.ocr_text || "")}
              onChange={e => save(rid, e.target.value)}
              rows={2}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ocr-editor">
      <textarea
        className="ocr-textarea"
        value={vals["_ocr"] || ""}
        onChange={e => save("_ocr", e.target.value)}
        rows={4}
        placeholder="El yazısı içeriği..."
      />
    </div>
  );
}

// ─── CONFIRM MODAL ───────────────────────────────────────────────────
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

// ─── ANA UYGULAMA ────────────────────────────────────────────────────
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
  const [confirmData, setConfirmData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ajanda_bookmarks") || "{}"); } catch { return {}; }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [filterMode, setFilterMode] = useState("all"); // all | filled | empty | bookmarked
  const [flipDir, setFlipDir] = useState(null); // "left" | "right"
  const [isFlipping, setIsFlipping] = useState(false);
  const touchStartX = useRef(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "1");
  const [activeTab, setActiveTab] = useState("pages"); // pages | stats | chat | settings
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [labelPickerPage, setLabelPickerPage] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const isNative = !!window.Capacitor?.isNativePlatform?.();

  useEffect(() => { setEditData(null); }, [activePage?.page_no]);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode ? "1" : "0");
  }, [darkMode]);

  // Streak ve rapor yükle
  const loadStreak = async (sno) => {
    try {
      const r = await fetch(`${API}/streak/${sno}`);
      const d = await r.json();
      setStreakData(d);
    } catch {}
  };

  const loadYearlyReport = async (sno) => {
    try {
      const r = await fetch(`${API}/yearly_report/${sno}`);
      const d = await r.json();
      setYearlyReport(d);
    } catch {}
  };

  const loadPremiumStatus = async (sno) => {
    try {
      const r = await fetch(`${API}/premium/status/${sno}`);
      const d = await r.json();
      setIsPremium(d.is_premium);
    } catch {}
  };

  // AI Chat
  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API}/ai/chat/${current.serial_no}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ messages: newMessages })
      });
      const d = await res.json();
      const reply = d.reply || "Yanıt alınamadı";
      setChatMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Bağlantı hatası." }]);
    }
    setChatLoading(false);
  };

  // AI Özet
  const getAiSummary = async () => {
    if (!current || aiLoading) return;
    setAiLoading(true);
    try {
      const r = await fetch(`${API}/ai/summary/${current.serial_no}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({})
      });
      const d = await r.json();
      setAiSummary(d);
    } catch { setAiSummary({ summary: "Özet alınamadı.", topics: [], habits: [], motivation: "" }); }
    setAiLoading(false);
  };

  // Sayfa etiket
  const setPageLabel = async (pageNo, color, stamp) => {
    if (!current) return;
    await fetch(`${API}/page/${current.serial_no}/${pageNo}/label`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ color, stamp })
    });
    setLabelPickerPage(null);
  };

  // Sayfa paylaş
  const sharePage = async (pageNo) => {
    if (!current) return;
    try {
      const r = await fetch(`${API}/share/${current.serial_no}/${pageNo}`, { method: "POST" });
      const d = await r.json();
      setShareUrl(`${window.location.origin}/shared/${d.share_token}`);
    } catch { alert("Paylaşım linki oluşturulamadı"); }
  };

  // Arama fonksiyonu
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = pages.filter(p => {
      const ocr = (p.ocr_text || "").toLowerCase();
      const title = (p.template?.title || "").toLowerCase();
      return ocr.includes(q) || title.includes(q);
    });
    setSearchResults(results);
  }, [searchQuery, pages]);

  const toggleBookmark = (pageNo) => {
    const key = `${current?.serial_no}_${pageNo}`;
    const updated = { ...bookmarks };
    if (updated[key]) delete updated[key];
    else updated[key] = true;
    setBookmarks(updated);
    localStorage.setItem("ajanda_bookmarks", JSON.stringify(updated));
  };

  const isBookmarked = (pageNo) => !!bookmarks[`${current?.serial_no}_${pageNo}`];

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
        quality: 85, resultType: CameraResultType.Base64,
        source: CameraSource.Camera, correctOrientation: true,
      });
      const res = await fetch(`data:image/jpeg;base64,${photo.base64String}`);
      return await res.blob();
    } else {
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file"; input.accept = "image/*";
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
        setStepOverlay({ icon: "📷", title: "Kapak QR'ını Tara", desc: "Ajandanın kapağındaki QR kodu okut" });
        const qr = await scanQR();
        setStepOverlay(null);
        if (!qr) { setError("QR okunamadı"); setLoading(false); return; }
        res = await fetch(`${API}/activate_qr?qr=${encodeURIComponent(qr)}&pin=${pin}`, { method: "POST" });
      } else {
        setStepOverlay({ icon: "📸", title: "Kapak Fotoğrafı", desc: "QR kodu görünecek şekilde fotoğraflayın" });
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
        serial_no: data.serial_no, theme_id: data.theme_id,
        theme_name: data.theme_name, theme_color: data.theme_color,
        pin, template: data.template,
      };
      const updated = [journal, ...journals.filter(j => j.serial_no !== journal.serial_no)];
      saveJournals(updated);
      setCurrent(journal);
      await loadPages(journal);
      setStep("dashboard");
    } catch { setError("Bağlantı hatası"); }
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
      loadStreak(updated.serial_no);
      loadYearlyReport(updated.serial_no);
      loadPremiumStatus(updated.serial_no);
      setStep("dashboard");
    } catch { setError("Bağlantı hatası"); }
    setLoading(false);
  };

  const loadPages = async (journal) => {
    try {
      const res = await fetch(`${API}/history?serial_no=${journal.serial_no}`);
      if (!res.ok) return;
      const data = await res.json();
      setPages(data.notes || []);
    } catch(e) { console.error("loadPages error", e); }
  };

  const doUpload = async (form, qr, force = false) => {
    const url = qr
      ? `${API}/upload?serial_no=${current.serial_no}&qr_hint=${encodeURIComponent(qr)}${force ? "&force=true" : ""}`
      : `${API}/upload?serial_no=${current.serial_no}${force ? "&force=true" : ""}`;
    return await fetch(url, { method: "POST", body: form });
  };

  const handleUploadPage = async () => {
    if (!current) return;
    setError(""); setLoading(true);
    try {
      let qr = null, blob = null;
      if (isNative) {
        setStepOverlay({ icon: "📷", title: "Sayfa QR'ını Tara", desc: "Sayfanın köşesindeki QR kodu okut" });
        qr = await scanQR();
        setStepOverlay(null);
        if (!qr) { setError("QR okunamadı"); setLoading(false); return; }
        setStepOverlay({ icon: "📸", title: "Sayfayı Fotoğrafla", desc: "Sayfanın tamamını net fotoğraflayın" });
        blob = await takePhoto();
        setStepOverlay(null);
        if (!blob) { setLoading(false); return; }
      } else {
        setStepOverlay({ icon: "📸", title: "Sayfa Fotoğrafı", desc: "QR kodu görünecek şekilde seçin" });
        blob = await takePhoto();
        setStepOverlay(null);
        if (!blob) { setLoading(false); return; }
      }
      const form = new FormData();
      form.append("file", blob, "page.jpg");
      const res = await doUpload(form, qr, false);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) { setLoading(false); setConfirmData({ form, qr }); return; }
        setError(data.detail || "Hata"); setLoading(false); return;
      }
      await loadPages(current);
      setError("✓ Sayfa kaydedildi!");
      setTimeout(() => setError(""), 2000);
    } catch { setError("Yükleme hatası"); }
    setLoading(false);
  };

  const handleConfirmOverwrite = async () => {
    if (!confirmData) return;
    setConfirmData(null); setLoading(true);
    try {
      const res = await doUpload(confirmData.form, confirmData.qr, true);
      const data = await res.json();
      if (!res.ok) setError(data.detail || "Hata");
      else await loadPages(current);
    } catch { setError("Yükleme hatası"); }
    setLoading(false);
  };

  const handleSaveEdit = async (regionId, field, value) => {
    if (!activePage || !current) return;
    const updated = JSON.parse(JSON.stringify(editData || activePage.template_data || {}));
    if (regionId && updated.regions?.[regionId]) {
      updated.regions[regionId].data[field] = value;
    } else {
      updated[field] = value;
    }
    setEditData(updated);
    try {
      await fetch(`${API}/page/${current.serial_no}/${activePage.page_no}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_data: updated })
      });
      setPages(prev => prev.map(p => p.page_no === activePage.page_no ? { ...p, template_data: updated } : p));
    } catch(e) { console.error("Save error", e); }
  };

  const mapHaftalikData = (tplType, tplData) => {
    if (!tplData?.regions) return tplData;
    const r = tplData.regions;
    const getVal = (region) => {
      if (!region) return "";
      const items = region.data?.items;
      const content = region.data?.content;
      if (Array.isArray(items) && items.length > 0) return items;
      if (content) return content;
      return "";
    };
    const haftalikTypes = ["haftalik_dikey","haftalik_yatay","haftalik_yatay_2",
      "haftalik_tekli1","haftalik_tekli2","haftalik_kapanisi","yemek_plan"];
    if (haftalikTypes.includes(tplType)) {
      return {
        week: r.header?.data?.title || r.header?.data?.subtitle || "",
        month: r.header?.data?.title || "",
        monday: getVal(r.monday), tuesday: getVal(r.tuesday),
        wednesday: getVal(r.wednesday), thursday: getVal(r.thursday),
        friday: getVal(r.friday), saturday: getVal(r.saturday),
        sunday: getVal(r.sunday), notes: getVal(r.notes),
        energy_down: getVal(r.energy_down), proud: getVal(r.proud),
        release: getVal(r.release), lesson_rel: getVal(r.lesson_rel),
        lesson_work: getVal(r.lesson_work), lesson_self: getVal(r.lesson_self),
        next_intent: getVal(r.next_intent),
      };
    }
    // Diğer şablonlar için regions'ı düz objeye çevir
    const mapped = { design_id: tplData.design_id, title: tplData.title };
    Object.entries(r).forEach(([rid, region]) => {
      if (region.data) {
        const items = region.data.items;
        const content = region.data.content;
        mapped[rid] = (Array.isArray(items) && items.length > 0) ? items : (content || "");
        // region'ın tüm data alanlarını da ekle
        Object.assign(mapped, region.data);
      }
    });
    return mapped;
  };

  const renderPageCard = (pageData) => {
    const regions = pageData.template?.regions;
    const firstRegion = regions?.[0];
    const tplType = pageData.template_type
      || pageData.template?.design_id
      || (pageData.template_data?.design_id)
      || (pageData.template_data?.regions ? "multi" : firstRegion?.type || "notes");
    const rawData = pageData.template_data;
    const tplData = mapHaftalikData(tplType, rawData);
    const isEmpty = pageData.is_empty || !rawData;
    return (
      <div key={pageData.page_no}
        className={`page-card ${isEmpty ? "empty" : "filled"}`}
        onClick={() => setActivePage(pageData)}>
        <div className="page-card-header">
          <span className="page-card-num">Sayfa {pageData.page_no}</span>
          <span className="page-card-title">{pageData.template?.title || tplType}</span>
          {!isEmpty && <span className="page-card-badge">✓</span>}
        </div>
        <div className="page-card-preview">
          <PageTemplate type={tplType} data={tplData} empty={isEmpty} themeColor={current?.theme_color} />
        </div>
      </div>
    );
  };

  const renderAllPages = () => {
    const template = current?.template || {};
    const filledMap = {};
    pages.forEach(p => { filledMap[p.page_no] = p; });

    // Template varsa tüm sayfaları göster
    if (Object.keys(template).length > 0) {
      const allPages = Object.entries(template).map(([pageNo, tpl]) => {
        const no = parseInt(pageNo);
        const filled = filledMap[no];
        // design_id varsa onu kullan (yeni format), yoksa regions'dan al
        const tplType = tpl.design_id || tpl.regions?.[0]?.type || tpl.type || "notes";
        if (filled) return { ...filled, template: { ...tpl, title: tpl.title || filled.template?.title } };
        return { page_no: no, template: tpl, template_type: tplType, template_data: null, is_empty: true, image_url: null };
      });
      allPages.sort((a, b) => a.page_no - b.page_no);
      return allPages.map(renderPageCard);
    }

    // Template yoksa sadece fotoğraflananları göster
    return pages.map(p => renderPageCard(p));
  };

  // ─── UI ──────────────────────────────────────────────────────────

  if (confirmData) return <ConfirmModal onConfirm={handleConfirmOverwrite} onCancel={() => setConfirmData(null)} />;

  // Etiket picker
  if (labelPickerPage !== null) {
    const COLORS = ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#3498db","#9b59b6","#1abc9c","#95a5a6"];
    const STAMPS = ["⭐","💡","✅","❤️","🔥","📌","⚠️","🎯","💪","📚","💰","🎨"];
    return (
      <div className="overlay-screen" onClick={() => setLabelPickerPage(null)}>
        <div className="label-picker" onClick={e => e.stopPropagation()}>
          <div className="label-picker-title">Sayfa {labelPickerPage} — Etiket</div>
          <div className="label-picker-section">Renk</div>
          <div className="label-colors">
            {COLORS.map(c => (
              <button key={c} className="label-color-btn"
                style={{background: c}}
                onClick={() => setPageLabel(labelPickerPage, c, null)} />
            ))}
            <button className="label-color-btn" style={{background:"transparent", border:"2px dashed #aaa"}}
              onClick={() => setPageLabel(labelPickerPage, null, null)}>✕</button>
          </div>
          <div className="label-picker-section">Damga</div>
          <div className="label-stamps">
            {STAMPS.map(s => (
              <button key={s} className="label-stamp-btn"
                onClick={() => setPageLabel(labelPickerPage, null, s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Paylaşım modal
  if (shareUrl) {
    return (
      <div className="overlay-screen" onClick={() => setShareUrl(null)}>
        <div className="share-modal" onClick={e => e.stopPropagation()}>
          <div className="share-modal-title">📤 Sayfa Paylaş</div>
          <div className="share-url">{shareUrl}</div>
          <button className="share-copy-btn" onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Kopyalandı!"); }}>
            📋 Linki Kopyala
          </button>
          <button className="share-close" onClick={() => setShareUrl(null)}>Kapat</button>
        </div>
      </div>
    );
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
    // Tüm sayfa listesi
    const allPagesForDetail = (() => {
      const template = current?.template || {};
      const filledMap = {};
      pages.forEach(p => { filledMap[p.page_no] = p; });
      if (Object.keys(template).length > 0) {
        return Object.entries(template).map(([pageNo, tpl]) => {
          const no = parseInt(pageNo);
          const filled = filledMap[no];
          if (filled) return { ...filled, template: tpl };
          return { page_no: no, template: tpl, template_type: tpl.design_id || "notes", template_data: null, is_empty: true, image_url: null };
        }).sort((a, b) => a.page_no - b.page_no);
      }
      return pages;
    })();

    const curIdx = allPagesForDetail.findIndex(p => p.page_no === activePage.page_no);

    // Swipe desteği
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > 50) {
        if (dx < 0) goTo(curIdx + 1, "right");
        else goTo(curIdx - 1, "left");
      }
    };
    const tplType = activePage.template_data?.design_id
      || activePage.template?.design_id
      || (activePage.template_type !== "multi" && activePage.template_type !== "notes" ? activePage.template_type : null)
      || "notes";
    const bookmarked = isBookmarked(activePage.page_no);

    const goTo = (idx, dir) => {
      if (idx >= 0 && idx < allPagesForDetail.length && !isFlipping) {
        setFlipDir(dir || (idx > curIdx ? "right" : "left"));
        setIsFlipping(true);
        setTimeout(() => {
          setActivePage(allPagesForDetail[idx]);
          setIsFlipping(false);
          setFlipDir(null);
        }, 400);
      }
    };

    return (
      <div className="detail-flip-screen" style={{"--tc": current?.theme_color || "#8b2500"}}>

        {/* Header */}
        <div className="df-header">
          <button className="df-back" onClick={() => setActivePage(null)}>←</button>
          <div className="df-header-center">
            <div className="df-page-title">{activePage.template?.title || `Sayfa ${activePage.page_no}`}</div>
            <div className="df-page-meta">{curIdx + 1} / {allPagesForDetail.length}</div>
          </div>
          <div className="df-header-actions">
            <button className={`df-action-btn ${bookmarked ? "active" : ""}`}
              onClick={() => toggleBookmark(activePage.page_no)} title="Yer imi">
              {bookmarked ? "🔖" : "📎"}
            </button>
            <button className="df-action-btn" onClick={() => setLabelPickerPage(activePage.page_no)} title="Etiket">
              🏷️
            </button>
            {!activePage.is_empty && (
              <button className="df-action-btn" onClick={() => sharePage(activePage.page_no)} title="Paylaş">
                📤
              </button>
            )}
            {activePage.is_empty && (
              <button className="df-action-btn df-photo-btn"
                onClick={() => { setActivePage(null); handleUploadPage(); }}>
                📸
              </button>
            )}
          </div>
        </div>

        {/* Sayfa içeriği */}
        <div className={`df-content ${isFlipping ? `flip-anim-${flipDir}` : ""}`}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {activePage.image_url ? (
            <div className="df-photo-wrap">
              <img src={`${API}${activePage.image_url}`} alt="sayfa" className="df-photo" />
            </div>
          ) : (
            <div className="df-empty-page">
              <div className="df-empty-lines">
                {Array.from({length: 20}).map((_,i) => <div key={i} className="df-empty-line" />)}
              </div>
              <div className="df-empty-hint">
                <span className="df-empty-icon">{activePage.template?.icon || "📄"}</span>
                <span>Bu sayfa henüz fotoğraflanmadı</span>
                <button className="df-photo-cta" onClick={() => { setActivePage(null); handleUploadPage(); }}>
                  📸 Fotoğrafla
                </button>
              </div>
            </div>
          )}

          {/* OCR text */}
          {!activePage.is_empty && activePage.ocr_text && (
            <div className="df-ocr">
              <div className="df-ocr-label">✏️ El Yazısı Notları</div>
              <OcrTextEditor
                tplType={tplType}
                data={editData || activePage.template_data}
                onSave={handleSaveEdit}
              />
            </div>
          )}
        </div>

        {/* Sayfa çevirme okları */}
        {curIdx > 0 && (
          <button className="df-nav df-nav-prev" onClick={() => goTo(curIdx - 1, "left")}>‹</button>
        )}
        {curIdx < allPagesForDetail.length - 1 && (
          <button className="df-nav df-nav-next" onClick={() => goTo(curIdx + 1, "right")}>›</button>
        )}

        {/* Alt thumbnail şeridi */}
        <div className="df-thumbstrip">
          {allPagesForDetail.map((p, i) => {
            const isActive = p.page_no === activePage.page_no;
            const bm = isBookmarked(p.page_no);
            return (
              <div
                key={p.page_no}
                className={`df-thumb ${isActive ? "active" : ""} ${!p.is_empty ? "filled" : ""}`}
                onClick={() => goTo(i, i > curIdx ? "right" : "left")}
              >
                {!p.is_empty && p.image_url ? (
                  <img src={`${API}${p.image_url}`} alt="" className="df-thumb-img" />
                ) : (
                  <div className="df-thumb-empty">{p.template?.icon || "📄"}</div>
                )}
                <div className="df-thumb-num">{p.page_no}</div>
                {bm && <div className="df-thumb-bm">🔖</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === "dashboard" && current) {
    const allPagesList = (() => {
      const template = current?.template || {};
      const filledMap = {};
      pages.forEach(p => { filledMap[p.page_no] = p; });
      if (Object.keys(template).length > 0) {
        return Object.entries(template).map(([pageNo, tpl]) => {
          const no = parseInt(pageNo);
          const filled = filledMap[no];
          const tplType = tpl.design_id || tpl.type || "notes";
          if (filled) return { ...filled, template: tpl };
          return { page_no: no, template: tpl, template_type: tplType, template_data: null, is_empty: true, image_url: null };
        }).sort((a, b) => a.page_no - b.page_no);
      }
      return pages;
    })();

    return (
      <div className="journal-app" style={{ "--tc": current.theme_color || "#8b2500" }}>
        {/* Keten kapak şeridi */}
        <div className="journal-cover-strip">
          <div className="journal-cover-texture" />
          <div className="journal-cover-content">
            <div className="journal-brand">AJAN<span>-DA</span></div>
            <div className="journal-theme-name">{current.theme_name}</div>
            <div className="journal-serial">№ {current.serial_no}</div>
          </div>
          <div className="journal-cover-actions">
            <button className="jc-btn" onClick={handleUploadPage} disabled={loading}>
              {loading ? "⏳" : "📸"}
            </button>
            <button className="jc-btn" onClick={() => { setCurrent(null); setStep("home"); }}>↩</button>
          </div>
        </div>

        {error && <div className="error-msg" style={{margin:"0 16px 8px"}}>{error}</div>}

        {/* Arama + Filtre */}
        <div className="journal-toolbar">
          <div className={`search-bar ${searchOpen ? "open" : ""}`}>
            <button className="search-toggle" onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}>
              🔍
            </button>
            {searchOpen && (
              <input
                className="search-input"
                autoFocus
                placeholder="Sayfalar içinde ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            )}
            {searchQuery && <span className="search-count">{searchResults.length} sayfa</span>}
          </div>
          <div className="filter-tabs">
            {[["all","Tümü"],["filled","✓"],["empty","○"],["bookmarked","🔖"]].map(([f,l]) => (
              <button key={f} className={`filter-tab ${filterMode===f?"active":""}`}
                onClick={() => setFilterMode(f)}>{l}</button>
            ))}
          </div>
        </div>

        {/* Spiral bağlayıcı */}
        <div className="spiral-strip">
          {Array.from({length: 18}).map((_, i) => <div key={i} className="spiral-ring" />)}
        </div>

        {/* Flip Book — yan yana sayfalar */}
        <div className="flipbook-container">
          <div className="flipbook-pages">
            {allPagesList
              .filter(p => {
                if (searchQuery && searchResults.length > 0) {
                  return searchResults.some(r => r.page_no === p.page_no);
                }
                if (filterMode === "filled") return !p.is_empty;
                if (filterMode === "empty") return p.is_empty;
                if (filterMode === "bookmarked") return isBookmarked(p.page_no);
                return true;
              })
              .map((pageData, idx) => {
              const tplType = pageData.template_type || pageData.template?.design_id || "notes";
              const icon = pageData.template?.icon || "📄";
              const title = pageData.template?.title || `Sayfa ${pageData.page_no}`;
              const isFilled = !pageData.is_empty && pageData.image_url;
              const bm = isBookmarked(pageData.page_no);
              const isSearchHit = searchQuery && searchResults.some(r => r.page_no === pageData.page_no);
              return (
                <div
                  key={pageData.page_no}
                  className={`flip-page ${isFilled ? "filled" : "empty"} ${isSearchHit ? "search-hit" : ""}`}
                  onClick={() => setActivePage(pageData)}
                  style={{"--delay": `${idx * 0.03}s`}}
                >
                  <div className="flip-page-margin" />
                  <div className="flip-page-inner">
                    <div className="flip-page-num">{pageData.page_no}</div>
                    {bm && <div className="flip-page-bm">🔖</div>}
                    {isFilled ? (
                      <div className="flip-page-photo">
                        <img src={`${API}${pageData.image_url}`} alt="" />
                        <div className="flip-page-filled-badge">✓</div>
                      </div>
                    ) : (
                      <div className="flip-page-empty-icon">{icon}</div>
                    )}
                    <div className="flip-page-title">{title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="journal-footer">
          <span>{pages.length} / {Object.keys(current.template || {}).length || "?"} sayfa fotoğraflandı</span>
          {streakData?.current_streak > 0 && (
            <span className="streak-badge">🔥 {streakData.current_streak} gün</span>
          )}
          {isPremium && <span className="premium-badge">⭐ Premium</span>}
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          {[
            {id:"pages", icon:"📖", label:"Sayfalar"},
            {id:"stats", icon:"📊", label:"İstatistik"},
            {id:"chat",  icon:"🤖", label:"AI"},
            {id:"settings", icon:"⚙️", label:"Ayarlar"},
          ].map(t => (
            <button key={t.id} className={`bnav-btn ${activeTab===t.id?"active":""}`}
              onClick={() => setActiveTab(t.id)}>
              <span className="bnav-icon">{t.icon}</span>
              <span className="bnav-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab içerikleri */}
        {activeTab === "stats" && (
          <div className="tab-panel">
            {/* Streak */}
            {streakData && (
              <div className="stats-card">
                <div className="stats-card-title">🔥 Streak</div>
                <div className="stats-row">
                  <div className="stats-num-block">
                    <div className="stats-big">{streakData.current_streak}</div>
                    <div className="stats-sub">Güncel</div>
                  </div>
                  <div className="stats-num-block">
                    <div className="stats-big">{streakData.longest_streak}</div>
                    <div className="stats-sub">En uzun</div>
                  </div>
                  <div className="stats-num-block">
                    <div className="stats-big">{streakData.total_active_days}</div>
                    <div className="stats-sub">Toplam gün</div>
                  </div>
                </div>
                {/* Heatmap */}
                <div className="heatmap">
                  {Array.from({length:52}).map((_,wi) => (
                    <div key={wi} className="heatmap-col">
                      {Array.from({length:7}).map((_,di) => {
                        const dayOffset = wi*7 + di;
                        const d = new Date();
                        d.setDate(d.getDate() - (363 - dayOffset));
                        const key = d.toISOString().split("T")[0];
                        const hit = streakData.heatmap?.find(h => h.day === key);
                        return (
                          <div key={di} className={`heatmap-cell ${hit ? "active" : ""}`}
                            title={key} />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yıllık Rapor */}
            {yearlyReport && !yearlyReport.error && (
              <div className="stats-card wrapped-card">
                <div className="stats-card-title">🎉 Yıllık Özet</div>
                <div className="stats-row">
                  <div className="stats-num-block">
                    <div className="stats-big">{yearlyReport.total_pages}</div>
                    <div className="stats-sub">Sayfa</div>
                  </div>
                  <div className="stats-num-block">
                    <div className="stats-big">{yearlyReport.months_active}</div>
                    <div className="stats-sub">Aktif Ay</div>
                  </div>
                </div>
                <div className="wrapped-most">
                  En çok: <strong>{yearlyReport.most_used_template?.replace(/_/g,' ')}</strong>
                </div>
                {yearlyReport.top_words?.length > 0 && (
                  <div className="wrapped-words">
                    {yearlyReport.top_words.map((w,i) => (
                      <span key={i} className="word-chip">{w.word}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Özet butonu */}
            <div className="stats-card">
              <div className="stats-card-title">🤖 AI Analizi</div>
              {aiSummary ? (
                <>
                  <p className="ai-summary-text">{aiSummary.summary}</p>
                  {aiSummary.motivation && (
                    <div className="ai-motivation">💪 {aiSummary.motivation}</div>
                  )}
                  {aiSummary.topics?.length > 0 && (
                    <div className="wrapped-words">
                      {aiSummary.topics.map((t,i) => <span key={i} className="word-chip">{t}</span>)}
                    </div>
                  )}
                </>
              ) : (
                <button className="ai-btn" onClick={getAiSummary} disabled={aiLoading}>
                  {aiLoading ? "⏳ Analiz ediliyor..." : "✨ Ajandamı Analiz Et"}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="tab-panel chat-panel">
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">🤖</div>
                  <div>Ajandan hakkında soru sor</div>
                  <div className="chat-suggestions">
                    {["Bu haftaki planlarım?","Hangi alışkanlıklarım var?","Bu ayki bütçem?"].map(s => (
                      <button key={s} className="chat-suggestion" onClick={() => {setChatInput(s);}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((m,i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {m.content}
                </div>
              ))}
              {chatLoading && <div className="chat-msg assistant chat-typing">✍️ yazıyor...</div>}
            </div>
            <div className="chat-input-row">
              <input
                className="chat-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                placeholder="Ajandana sor..."
              />
              <button className="chat-send" onClick={sendChatMessage} disabled={chatLoading}>→</button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-panel settings-panel">
            <div className="settings-section">
              <div className="settings-title">Görünüm</div>
              <div className="settings-row">
                <span>Karanlık Mod</span>
                <button className={`toggle-btn ${darkMode?"on":""}`} onClick={() => setDarkMode(!darkMode)}>
                  <div className="toggle-knob" />
                </button>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-title">Premium</div>
              {isPremium ? (
                <div className="premium-active">
                  ⭐ Premium aktif
                </div>
              ) : (
                <div className="premium-card">
                  <div className="premium-title">AJAN-DA Premium</div>
                  <div className="premium-features">
                    {["Sınırsız ajanda","AI özet & analiz","Google Takvim sync","Yedekleme","Gelişmiş istatistikler","Şablon marketi"].map(f => (
                      <div key={f} className="premium-feature">✓ {f}</div>
                    ))}
                  </div>
                  <button className="premium-btn" onClick={() => alert("Stripe entegrasyonu yakında!")}>
                    ⭐ Premium'a Geç — ₺99/ay
                  </button>
                </div>
              )}
            </div>

            <div className="settings-section">
              <div className="settings-title">Ajanda</div>
              <div className="settings-row" onClick={() => { setCurrent(null); setStep("home"); }} style={{cursor:"pointer"}}>
                <span>Çıkış Yap</span>
                <span>↩</span>
              </div>
              <div className="settings-row" onClick={() => { loadStreak(current.serial_no); loadYearlyReport(current.serial_no); }} style={{cursor:"pointer"}}>
                <span>Verileri Yenile</span>
                <span>🔄</span>
              </div>
            </div>
          </div>
        )}
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
        <input className="pin-input" type="password" inputMode="numeric"
          placeholder="PIN oluştur (min 4 karakter)" value={pin}
          onChange={e => setPin(e.target.value)} maxLength={8} />
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={handleActivate} disabled={loading}>
          {loading ? "⏳..." : isNative ? "📷 QR Tara & Aktive Et" : "📸 Kapak Fotoğrafı Yükle"}
        </button>
      </div>
    );
  }

  return (
    <div className="home-shelf">
      {/* Raf üstü */}
      <div className="shelf-header">
        <div className="shelf-logo">AJAN<span>-DA</span></div>
        <div className="shelf-tagline">dijital ajanda sistemi</div>
      </div>

      {/* Ajanda rafı */}
      <div className="shelf-rack">
        <div className="shelf-wood" />
        {journals.length === 0 ? (
          <div className="shelf-empty">Henüz ajanda yok</div>
        ) : (
          journals.map((j, i) => (
            <button
              key={j.serial_no}
              className="shelf-book"
              onClick={() => handleLogin(j)}
              style={{ "--bc": j.theme_color || "#8b2500", "--delay": `${i * 0.08}s` }}
            >
              <div className="shelf-book-spine">
                <div className="shelf-book-texture" />
                <div className="shelf-book-title">{j.theme_name}</div>
                <div className="shelf-book-serial">{j.serial_no}</div>
              </div>
            </button>
          ))
        )}
        {/* Yeni ajanda ekle butonu — kitap gibi */}
        <button className="shelf-book shelf-book-new" onClick={() => setStep("activate")}>
          <div className="shelf-book-spine">
            <div className="shelf-book-plus">+</div>
            <div className="shelf-book-title">Yeni</div>
          </div>
        </button>
      </div>

      {error && <div className="error-msg" style={{margin:"16px"}}>{error}</div>}
      {loading && <div className="shelf-loading">Yükleniyor...</div>}
    </div>
  );
}

// ─── STİLLER ─────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #f5f0e8;
    --paper: #faf7f2;
    --ink: #1c1410;
    --warm: #7a6655;
    --accent: #c4956a;
    --border: #ddd5c4;
    --soft: #ede8de;
    --linen: #e8e0d0;
    --red: #c0392b;
    --green: #5a8a5a;
    --tc: #8b2500;
  }

  body {
    font-family: 'Jost', sans-serif;
    background: var(--cream);
    color: var(--ink);
    min-height: 100vh;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23f5f0e8'/%3E%3Ccircle cx='1' cy='1' r='0.5' fill='%23e8e0d0' opacity='0.4'/%3E%3C/svg%3E");
  }

  /* ─── HOME SHELF ─────────────────────────────────── */
  .home-shelf {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    overflow: hidden;
  }

  .shelf-header {
    width: 100%;
    padding: 48px 24px 32px;
    text-align: center;
    background: linear-gradient(180deg, #1c1410 0%, #2d1f15 100%);
    position: relative;
    overflow: hidden;
  }
  .shelf-header::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Crect width='6' height='6' fill='none'/%3E%3Cline x1='0' y1='3' x2='6' y2='3' stroke='%23ffffff' stroke-width='0.3' opacity='0.04'/%3E%3Cline x1='3' y1='0' x2='3' y2='6' stroke='%23ffffff' stroke-width='0.3' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .shelf-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 4px;
    position: relative;
    z-index: 1;
  }
  .shelf-logo span { color: #f5f0e8; opacity: 0.7; }
  .shelf-tagline {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(245,240,232,0.4);
    margin-top: 6px;
    position: relative;
    z-index: 1;
  }

  .shelf-rack {
    width: 100%;
    max-width: 480px;
    display: flex;
    align-items: flex-end;
    gap: 6px;
    padding: 32px 20px 0;
    position: relative;
    min-height: 200px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .shelf-wood {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 18px;
    background: linear-gradient(180deg, #8b6f4e 0%, #6b4f2e 60%, #4a3520 100%);
    border-radius: 2px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .shelf-wood::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(0,0,0,0.06) 8px, rgba(0,0,0,0.06) 9px);
    border-radius: 2px;
  }

  .shelf-book {
    width: 52px;
    height: 150px;
    border: none;
    cursor: pointer;
    border-radius: 2px 6px 6px 2px;
    position: relative;
    margin-bottom: 18px;
    transform-origin: bottom center;
    animation: bookAppear 0.4s ease var(--delay, 0s) both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .shelf-book:hover {
    transform: translateY(-12px) rotateZ(-1deg);
    box-shadow: 4px 8px 24px rgba(0,0,0,0.25);
    z-index: 10;
  }
  @keyframes bookAppear {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .shelf-book-spine {
    width: 100%;
    height: 100%;
    background: var(--bc, #8b2500);
    border-radius: 2px 6px 6px 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 10px 4px;
    position: relative;
    overflow: hidden;
  }
  /* Keten doku */
  .shelf-book-spine::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='none'/%3E%3Cline x1='0' y1='2' x2='4' y2='2' stroke='%23ffffff' stroke-width='0.5' opacity='0.08'/%3E%3Cline x1='2' y1='0' x2='2' y2='4' stroke='%23ffffff' stroke-width='0.5' opacity='0.08'/%3E%3C/svg%3E");
  }
  .shelf-book-spine::after {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: rgba(0,0,0,0.2);
  }

  .shelf-book-texture { display: none; }
  .shelf-book-title {
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.9);
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    position: relative;
    z-index: 1;
    max-height: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .shelf-book-serial {
    font-size: 7px;
    color: rgba(255,255,255,0.5);
    position: relative;
    z-index: 1;
    font-variant-numeric: tabular-nums;
  }
  .shelf-book-new .shelf-book-spine { background: rgba(0,0,0,0.12); border: 2px dashed rgba(0,0,0,0.2); }
  .shelf-book-plus { font-size: 22px; color: rgba(0,0,0,0.3); position: relative; z-index: 1; }
  .shelf-book-new .shelf-book-title { color: rgba(0,0,0,0.35); }
  .shelf-empty { font-size: 13px; color: var(--warm); margin-bottom: 24px; }
  .shelf-loading { font-size: 13px; color: var(--warm); padding: 16px; }

  /* ─── JOURNAL APP (dashboard) ────────────────────── */
  .journal-app {
    min-height: 100vh;
    background: var(--cream);
    display: flex;
    flex-direction: column;
  }

  .journal-cover-strip {
    background: var(--tc, #8b2500);
    padding: 0;
    position: relative;
    overflow: hidden;
    min-height: 110px;
    display: flex;
    align-items: center;
  }
  /* Keten doku overlay */
  .journal-cover-texture {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Crect width='6' height='6' fill='none'/%3E%3Cline x1='0' y1='3' x2='6' y2='3' stroke='%23ffffff' stroke-width='0.8' opacity='0.07'/%3E%3Cline x1='3' y1='0' x2='3' y2='6' stroke='%23ffffff' stroke-width='0.8' opacity='0.07'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .journal-cover-content {
    flex: 1;
    padding: 20px 20px;
    position: relative;
    z-index: 1;
  }
  .journal-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 600;
    color: rgba(255,255,255,0.95);
    letter-spacing: 3px;
  }
  .journal-brand span { opacity: 0.6; }
  .journal-theme-name {
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    margin-top: 2px;
  }
  .journal-serial {
    font-family: 'Cormorant Garamond', serif;
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    margin-top: 4px;
    font-style: italic;
  }

  .journal-cover-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    position: relative;
    z-index: 1;
  }
  .jc-btn {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
    backdrop-filter: blur(4px);
  }
  .jc-btn:hover { background: rgba(255,255,255,0.25); }
  .jc-btn:disabled { opacity: 0.5; }

  /* Spiral bağlayıcı */
  .spiral-strip {
    display: flex;
    gap: 0;
    background: #2a2a2a;
    padding: 0 12px;
    overflow: hidden;
    height: 22px;
    align-items: center;
    justify-content: space-around;
  }
  .spiral-ring {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 3px solid #555;
    background: #333;
    flex-shrink: 0;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05);
  }

  /* ─── FLIP BOOK ───────────────────────────────────── */
  .flipbook-container {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 16px 12px 8px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .flipbook-container::-webkit-scrollbar { height: 4px; }
  .flipbook-container::-webkit-scrollbar-track { background: var(--linen); }
  .flipbook-container::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

  .flipbook-pages {
    display: flex;
    gap: 8px;
    padding: 4px 4px 16px;
    width: max-content;
  }

  .flip-page {
    width: 120px;
    height: 170px;
    background: var(--paper);
    border-radius: 1px 4px 4px 1px;
    cursor: pointer;
    position: relative;
    scroll-snap-align: start;
    animation: pageSlideIn 0.3s ease var(--delay, 0s) both;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 1px 2px 6px rgba(0,0,0,0.12), 2px 4px 12px rgba(0,0,0,0.06);
    flex-shrink: 0;
    display: flex;
    overflow: hidden;
  }
  .flip-page:hover {
    transform: translateY(-4px) rotateZ(0.5deg);
    box-shadow: 2px 8px 20px rgba(0,0,0,0.18);
    z-index: 5;
  }
  .flip-page.filled { background: white; }
  @keyframes pageSlideIn {
    from { opacity: 0; transform: translateX(16px) rotateZ(2deg); }
    to { opacity: 1; transform: translateX(0) rotateZ(0deg); }
  }

  .flip-page-margin {
    width: 8px;
    height: 100%;
    background: linear-gradient(90deg, #e8ddd0 0%, #f0e8de 100%);
    flex-shrink: 0;
    border-right: 1px solid #d4c8b8;
  }

  .flip-page-inner {
    flex: 1;
    padding: 8px 6px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
  }

  .flip-page-num {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 8px;
    color: var(--accent);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .flip-page-photo {
    width: 100%;
    flex: 1;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    margin-top: 4px;
  }
  .flip-page-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .flip-page-filled-badge {
    position: absolute;
    top: 4px; right: 4px;
    width: 14px; height: 14px;
    background: var(--green);
    border-radius: 50%;
    color: white;
    font-size: 8px;
    display: flex; align-items: center; justify-content: center;
  }

  .flip-page-empty-icon {
    font-size: 28px;
    margin-top: 16px;
    opacity: 0.35;
  }

  .flip-page-title {
    font-size: 7.5px;
    color: var(--warm);
    text-align: center;
    font-weight: 500;
    letter-spacing: 0.3px;
    line-height: 1.3;
    width: 100%;
    margin-top: auto;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  /* Çizgili kağıt efekti boş sayfalarda */
  .flip-page.empty .flip-page-inner::before {
    content: '';
    position: absolute;
    top: 28px; left: 10px; right: 6px;
    height: calc(100% - 44px);
    background: repeating-linear-gradient(
      180deg,
      transparent 0px, transparent 10px,
      rgba(180,160,140,0.15) 10px, rgba(180,160,140,0.15) 11px
    );
    pointer-events: none;
  }

  .journal-footer {
    padding: 8px 16px 12px;
    font-size: 11px;
    color: var(--warm);
    text-align: center;
    letter-spacing: 0.5px;
  }

  /* ─── DETAIL SCREEN ───────────────────────────────── */
  .screen { min-height: 100vh; padding: 24px 20px; max-width: 480px; margin: 0 auto; }
  .detail-screen {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--paper);
    min-height: 100vh;
    padding: 0;
  }
  .detail-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 12px;
    background: var(--tc, var(--ink));
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .detail-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Cline x1='0' y1='3' x2='6' y2='3' stroke='%23ffffff' stroke-width='0.8' opacity='0.07'/%3E%3Cline x1='3' y1='0' x2='3' y2='6' stroke='%23ffffff' stroke-width='0.8' opacity='0.07'/%3E%3C/svg%3E");
  }
  .detail-header .back-btn {
    margin-bottom: 0;
    color: rgba(255,255,255,0.8);
    position: relative;
    z-index: 1;
    font-size: 13px;
  }
  .detail-title {
    flex: 1;
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    color: white;
    position: relative;
    z-index: 1;
  }
  .detail-page-no {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    font-style: italic;
    font-family: 'Cormorant Garamond', serif;
    position: relative;
    z-index: 1;
  }
  .detail-image-wrap {
    margin: 16px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .detail-image { width: 100%; display: block; }
  .detail-template {
    background: white;
    margin: 0 16px;
    border-radius: 4px;
    border: 1px solid var(--border);
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .detail-ocr {
    background: white;
    margin: 0 16px 16px;
    border-radius: 4px;
    border: 1px solid var(--border);
    padding: 16px;
  }
  .detail-ocr-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--warm);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
  }
  .detail-template-label { font-size: 10px; font-weight: 600; color: var(--warm); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }

  /* ─── ACTIVATE SCREEN ────────────────────────────── */
  .activate-screen {
    display: flex; flex-direction: column; align-items: center;
    padding: 40px 24px; gap: 16px; min-height: 100vh;
    background: var(--cream);
  }
  .activate-icon { font-size: 56px; margin: 16px 0; }
  .activate-screen h2 { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 600; }
  .activate-screen p { color: var(--warm); text-align: center; font-size: 14px; line-height: 1.6; }
  .pin-input {
    width: 100%; padding: 14px 16px;
    border: 1.5px solid var(--border); border-radius: 4px;
    font-size: 20px; font-family: 'Jost', sans-serif;
    text-align: center; letter-spacing: 6px; outline: none;
    background: white;
  }
  .pin-input:focus { border-color: var(--accent); }

  /* ─── BUTTONS ─────────────────────────────────────── */
  .btn-primary {
    width: calc(100% - 32px); margin: 0 16px 16px;
    padding: 14px; background: var(--ink);
    color: white; border: none; border-radius: 4px;
    font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 500;
    cursor: pointer; letter-spacing: 1px; transition: all 0.2s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--accent); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .back-btn {
    background: none; border: none; font-family: 'Jost', sans-serif;
    font-size: 13px; color: var(--warm); cursor: pointer;
    padding: 0; margin-bottom: 16px; display: block;
  }

  /* ─── OVERLAYS ────────────────────────────────────── */
  .overlay-screen {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px;
    background: rgba(28,20,16,0.97); color: white; padding: 40px;
  }
  .overlay-icon { font-size: 56px; }
  .overlay-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; text-align: center; }
  .overlay-desc { font-size: 14px; opacity: 0.6; text-align: center; line-height: 1.6; }
  .btn-overlay-confirm {
    width: 100%; max-width: 280px; padding: 14px;
    background: var(--accent); color: white; border: none; border-radius: 4px;
    font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer;
  }
  .btn-overlay-cancel {
    width: 100%; max-width: 280px; padding: 14px;
    background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 15px; cursor: pointer;
  }
  .spinner {
    width: 36px; height: 36px; margin-top: 16px;
    border: 2px solid rgba(255,255,255,0.15);
    border-top-color: var(--accent);
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── COMMON ──────────────────────────────────────── */
  .error-msg {
    padding: 10px 14px; background: #fef0ef;
    border: 1px solid #f5c6c4; border-radius: 4px;
    color: var(--red); font-size: 12px; text-align: center;
  }

  /* OCR editor */
  .ocr-editor { display: flex; flex-direction: column; gap: 10px; }
  .ocr-field { display: flex; flex-direction: column; gap: 3px; }
  .ocr-label { font-size: 10px; font-weight: 600; color: var(--accent); letter-spacing: 0.5px; }
  .ocr-input {
    border: 1px solid var(--border); border-radius: 3px;
    padding: 7px 10px; font-size: 13px;
    font-family: 'Jost', sans-serif; outline: none; background: var(--paper);
  }
  .ocr-input:focus { border-color: var(--accent); background: white; }
  .ocr-textarea {
    border: 1px solid var(--border); border-radius: 3px;
    padding: 7px 10px; font-size: 13px;
    font-family: 'Jost', sans-serif; outline: none; resize: vertical; background: var(--paper);
  }
  .ocr-textarea:focus { border-color: var(--accent); background: white; }

  /* Template styles (küçültülmüş) */
  .tpl-header { font-weight: 600; font-size: 11px; margin-bottom: 5px; color: var(--ink); border-bottom: 1.5px solid var(--accent); padding-bottom: 2px; }
  .tpl-empty-hint { font-size: 9px; color: var(--warm); font-style: italic; }
  .tpl-section { margin-top: 5px; }
  .tpl-section-title { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--warm); margin-bottom: 2px; }
  .tpl-date { font-size: 10px; font-weight: 600; color: var(--accent); margin-bottom: 3px; }
  .tpl-notes-text { font-size: 10px; line-height: 1.5; color: var(--ink); white-space: pre-wrap; }
  .tpl-item { font-size: 9px; margin-bottom: 1px; }
  .tpl-row { display: flex; gap: 5px; }
  .tpl-lines { display: flex; flex-direction: column; gap: 7px; }
  .tpl-line { height: 1px; background: var(--border); }
  .tpl-priority-item { display: flex; align-items: center; gap: 3px; font-size: 10px; margin-bottom: 2px; }
  .tpl-num { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; flex-shrink: 0; }
  .tpl-highlights { font-size: 9px; background: var(--soft); border-radius: 4px; padding: 3px 6px; margin-bottom: 4px; }
  .tpl-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin: 3px 0; }
  .tpl-month-header { font-size: 7px; color: var(--warm); font-weight: 600; text-align: center; }
  .tpl-month-day { font-size: 7px; text-align: center; padding: 1px; border: 1px solid var(--border); min-height: 12px; border-radius: 1px; }
  .tpl-month-day.marked { background: #ffeb3b; font-weight: 700; }
  .tpl-mood-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
  .tpl-mood-cell { font-size: 7px; text-align: center; padding: 1px; border: 1px solid var(--border); min-height: 14px; border-radius: 1px; display: flex; flex-direction: column; align-items: center; }
  .tpl-mood-day { font-size: 6px; color: var(--warm); }
  .tpl-mood-emoji { font-size: 7px; }
  .tpl-bingo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
  .tpl-bingo-cell { border: 1px solid var(--border); border-radius: 3px; padding: 3px; min-height: 20px; font-size: 8px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .tpl-bingo-cell.checked { background: var(--accent); color: white; }
  .tpl-vision-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
  .tpl-vision-box { border: 1px solid var(--border); border-radius: 6px; min-height: 30px; padding: 3px; font-size: 8px; display: flex; align-items: center; justify-content: center; }
  .tpl-onemli-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
  .tpl-onemli-month { border: 1px solid var(--border); border-radius: 4px; padding: 3px; }
  .tpl-onemli-month-name { font-size: 7px; font-weight: 700; color: var(--accent); }
  .tpl-onemli-content { font-size: 7px; }
  .tpl-table { width: 100%; border-collapse: collapse; font-size: 8px; }
  .tpl-table th { background: var(--soft); font-weight: 700; padding: 2px 3px; border: 1px solid var(--border); }
  .tpl-table td { padding: 1px 3px; border: 1px solid var(--border); }
  .tpl-okuma-cols { display: flex; gap: 6px; }
  .tpl-okuma-col { flex: 1; }
  .tpl-okuma-item { display: flex; gap: 3px; margin-bottom: 1px; }
  .tpl-okuma-num { font-size: 8px; font-weight: 700; color: var(--accent); min-width: 14px; }
  .tpl-okuma-line { font-size: 8px; flex: 1; border-bottom: 1px dashed var(--border); }
  .tpl-ders-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; }
  .tpl-ders-day { border: 1px solid var(--border); border-radius: 2px; }
  .tpl-ders-day-num { font-size: 6px; font-weight: 700; background: var(--soft); padding: 1px; text-align: center; }
  .tpl-ders-content { font-size: 7px; padding: 1px; min-height: 18px; }
  .tpl-spor-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; }
  .tpl-spor-cell { border: 1px solid var(--border); border-radius: 2px; }
  .tpl-spor-num { font-size: 6px; font-weight: 700; background: #c8d8b0; padding: 1px; text-align: center; }
  .tpl-spor-content { font-size: 7px; padding: 1px; min-height: 16px; }
  .tpl-sifre-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .tpl-sifre-card { border: 1px solid var(--border); border-radius: 4px; padding: 3px; }
  .tpl-sifre-site { font-size: 8px; font-weight: 700; color: var(--accent); }
  .tpl-sifre-user, .tpl-sifre-pass { font-size: 7px; color: var(--warm); }
  .tpl-eg-grid { overflow-x: auto; }
  .tpl-eg-row { display: flex; align-items: center; }
  .tpl-eg-header .tpl-eg-month { font-size: 6px; font-weight: 700; color: var(--warm); }
  .tpl-eg-day { width: 16px; font-size: 6px; color: var(--warm); flex-shrink: 0; }
  .tpl-eg-month { width: 16px; text-align: center; flex-shrink: 0; }
  .tpl-eg-cell { width: 16px; height: 8px; border: 1px solid var(--border); flex-shrink: 0; }
  .tpl-eg-cell.done { background: var(--accent); }
  .tpl-habit-list { display: flex; flex-direction: column; gap: 3px; }
  .tpl-habit-item { display: flex; align-items: center; gap: 5px; font-size: 10px; }
  .tpl-habit-check { font-size: 10px; } .tpl-habit-check.done { color: var(--green); }
  .tpl-habit-placeholder { color: var(--border); }
  .tpl-habit-days { font-size: 8px; color: var(--warm); }
  .tpl-habit-dots { display: flex; gap: 1px; margin-left: auto; }
  .tpl-habit-dot { font-size: 7px; } .tpl-habit-dot.done { color: var(--green); }
  .tpl-haftalik-days { display: flex; flex-direction: column; gap: 3px; }
  .tpl-day-block { border-left: 2px solid var(--accent); padding-left: 5px; }
  .tpl-day-name { font-size: 8px; font-weight: 700; color: var(--accent); margin-bottom: 1px; }
  .tpl-day-content { font-size: 9px; color: var(--ink); }
  .tpl-tekli-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .tpl-tekli-box { border: 1px solid var(--border); border-radius: 4px; padding: 3px; min-height: 26px; }
  .tpl-tekli2-days { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .tpl-tekli2-day { border: 1px solid var(--border); border-radius: 4px; padding: 3px; }
  .tpl-schedule-item { display: flex; gap: 5px; font-size: 9px; border-bottom: 1px solid var(--border); padding: 1px 0; }
  .tpl-hour { font-weight: 600; color: var(--warm); min-width: 32px; flex-shrink: 0; }
  .tpl-sukran-list { display: flex; flex-direction: column; gap: 1px; }
  .tpl-sukran-item { display: flex; gap: 3px; font-size: 9px; border-bottom: 1px solid var(--border); padding: 1px 0; }
  .tpl-sukran-num { font-weight: 700; color: var(--accent); min-width: 12px; }
  .tpl-sukran-text { flex: 1; }
  .tpl-filmserit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; }
  .tpl-film-frame { border: 1px solid #1a1512; min-height: 18px; font-size: 7px; display: flex; align-items: center; justify-content: center; }
  .tpl-kitapraf-shelves { display: flex; flex-direction: column; gap: 6px; }
  .tpl-shelf { display: flex; gap: 1px; border-bottom: 2px solid #5d4037; padding-bottom: 1px; }
  .tpl-book { width: 14px; min-height: 26px; border: 1px solid var(--border); border-radius: 1px; font-size: 6px; display: flex; align-items: flex-end; justify-content: center; }
  .tpl-book.filled { background: var(--accent); color: white; }
  .tpl-yemek-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .tpl-yemek-day { border: 1px solid var(--border); border-radius: 4px; padding: 3px; }
  .tpl-cover { border-radius: 6px; padding: 12px; color: white; min-height: 60px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
  .tpl-cover-title { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 600; text-align: center; }
  .tpl-cover-sub, .tpl-cover-date { font-size: 9px; opacity: 0.7; margin-top: 2px; }
  .tpl-cover-hint { font-size: 9px; opacity: 0.6; margin-top: 6px; }
  .tpl-letter-lines { display: flex; flex-direction: column; gap: 8px; margin-top: 5px; }
  .tpl-hw { font-size: 0.7em; }
  .tpl-hw-title { background: var(--tc, #8b2500); color: white; font-size: 8px; font-weight: 700; text-align: center; padding: 3px; margin-bottom: 2px; border-radius: 2px; letter-spacing: 1px; }
  .tpl-hw-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid var(--border); }
  .tpl-hw-head { font-size: 6px; font-weight: 700; text-align: center; padding: 2px 1px; background: var(--soft); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); letter-spacing: 0.5px; }
  .tpl-hw-head.wknd { background: var(--tc, #8b2500); color: white; }
  .tpl-hw-cell { min-height: 16px; border-right: 1px solid #ede8de; border-bottom: 1px solid #ede8de; padding: 1px 2px; }
  .tpl-hw-hour { font-size: 5px; color: var(--accent); display: block; opacity: 0.7; }
  .tpl-hw-entry { font-size: 6px; color: var(--ink); line-height: 1.2; font-weight: 500; }
  .tpl-hd-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin-top: 3px; border: 1px solid var(--border); }
  .tpl-hd-col { display: flex; flex-direction: column; }
  .tpl-hd-header { font-size: 7px; font-weight: 700; text-align: center; padding: 2px 1px; background: var(--soft); color: var(--ink); border-bottom: 1px solid var(--border); }
  .tpl-hd-header.weekend { background: #1a1512; color: white; }
  .tpl-hd-body { flex: 1; min-height: 50px; padding: 2px; border-right: 1px solid var(--border); }
  .tpl-hd-item { font-size: 7px; color: var(--ink); line-height: 1.3; margin-bottom: 1px; }
  .multi-region { display: flex; flex-direction: column; gap: 4px; }

  /* ─── TOOLBAR (arama + filtre) ───────────────────── */
  .journal-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0,0,0,0.06);
    gap: 8px;
  }
  .search-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    max-width: 220px;
  }
  .search-toggle {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.15s;
  }
  .search-toggle:hover { background: rgba(0,0,0,0.08); }
  .search-input {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 12px;
    font-family: 'Jost', sans-serif;
    outline: none;
    background: white;
    animation: fadeIn 0.2s ease;
  }
  .search-input:focus { border-color: var(--accent); }
  .search-count {
    font-size: 10px;
    color: var(--accent);
    font-weight: 600;
    white-space: nowrap;
  }
  @keyframes fadeIn { from { opacity: 0; transform: scaleX(0.8); } to { opacity: 1; transform: scaleX(1); } }

  .filter-tabs { display: flex; gap: 2px; }
  .filter-tab {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: white;
    font-size: 10px;
    font-family: 'Jost', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--warm);
  }
  .filter-tab.active {
    background: var(--tc, #8b2500);
    border-color: var(--tc, #8b2500);
    color: white;
  }

  .flip-page.search-hit {
    box-shadow: 0 0 0 2px var(--accent), 2px 4px 12px rgba(0,0,0,0.12);
  }
  .flip-page-bm {
    position: absolute;
    top: 12px;
    left: 10px;
    font-size: 8px;
    z-index: 2;
  }

  /* ─── DETAIL FLIP SCREEN ─────────────────────────── */
  .detail-flip-screen {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--paper);
    position: relative;
  }

  .df-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: var(--tc, #8b2500);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .df-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Cline x1='0' y1='3' x2='6' y2='3' stroke='%23fff' stroke-width='0.8' opacity='0.07'/%3E%3Cline x1='3' y1='0' x2='3' y2='6' stroke='%23fff' stroke-width='0.8' opacity='0.07'/%3E%3C/svg%3E");
    pointer-events: none;
  }
  .df-back {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    border-radius: 50%;
    width: 32px; height: 32px;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    position: relative; z-index: 1;
    transition: background 0.15s;
  }
  .df-back:hover { background: rgba(255,255,255,0.25); }
  .df-header-center {
    flex: 1;
    position: relative; z-index: 1;
  }
  .df-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-weight: 600;
    color: white;
    line-height: 1.2;
  }
  .df-page-meta {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    font-style: italic;
    margin-top: 1px;
  }
  .df-header-actions {
    display: flex; gap: 6px;
    position: relative; z-index: 1;
  }
  .df-action-btn {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    border-radius: 50%;
    width: 32px; height: 32px;
    font-size: 14px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .df-action-btn:hover { background: rgba(255,255,255,0.25); }
  .df-action-btn.active { background: rgba(255,255,255,0.3); }
  .df-photo-btn { background: rgba(255,255,255,0.2); }

  .df-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 12px 8px;
  }

  .df-photo-wrap {
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    max-height: 55vh;
  }
  .df-photo {
    max-width: 100%;
    max-height: 55vh;
    width: auto;
    height: auto;
    display: block;
    object-fit: contain;
    border-radius: 6px;
  }

  .df-empty-page {
    background: white;
    border-radius: 6px;
    border: 1px solid var(--border);
    min-height: 280px;
    position: relative;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .df-empty-lines {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .df-empty-line {
    height: 1px;
    background: rgba(180,160,140,0.2);
  }
  .df-empty-hint {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--warm);
    font-size: 13px;
  }
  .df-empty-icon { font-size: 36px; opacity: 0.4; }
  .df-photo-cta {
    padding: 8px 18px;
    background: var(--tc, #8b2500);
    color: white;
    border: none;
    border-radius: 20px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    cursor: pointer;
    margin-top: 4px;
    transition: opacity 0.2s;
  }
  .df-photo-cta:hover { opacity: 0.85; }

  .df-ocr {
    background: white;
    border-radius: 6px;
    border: 1px solid var(--border);
    padding: 14px;
    margin-bottom: 10px;
  }
  .df-ocr-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--warm);
    margin-bottom: 10px;
  }

  /* Sayfa çevirme okları */
  .df-nav {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    width: 36px; height: 52px;
    background: rgba(255,255,255,0.9);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 22px;
    color: var(--ink);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    z-index: 50;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
  }
  .df-nav:hover {
    background: var(--tc, #8b2500);
    color: white;
    border-color: transparent;
  }
  .df-nav-prev { left: 4px; }
  .df-nav-next { right: 4px; }

  /* Alt thumbnail şeridi */
  .df-thumbstrip {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    padding: 8px 10px;
    background: #1c1410;
    flex-shrink: 0;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .df-thumbstrip::-webkit-scrollbar { height: 2px; }
  .df-thumbstrip::-webkit-scrollbar-thumb { background: var(--accent); }

  .df-thumb {
    width: 44px;
    height: 60px;
    border-radius: 2px;
    background: #2d2420;
    border: 1.5px solid #3d3430;
    cursor: pointer;
    flex-shrink: 0;
    scroll-snap-align: center;
    position: relative;
    overflow: hidden;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .df-thumb:hover { border-color: var(--accent); transform: translateY(-2px); }
  .df-thumb.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }
  .df-thumb.filled { background: #2d2420; }
  .df-thumb-img { width: 100%; height: 100%; object-fit: cover; }
  .df-thumb-empty { font-size: 16px; opacity: 0.3; }
  .df-thumb-num {
    position: absolute;
    bottom: 2px; right: 3px;
    font-size: 7px;
    color: rgba(255,255,255,0.4);
    font-variant-numeric: tabular-nums;
  }
  .df-thumb-bm {
    position: absolute;
    top: 1px; left: 2px;
    font-size: 8px;
  }

  /* ─── SAYFA ÇEVİRME ANİMASYONU ──────────────────── */
  .df-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 12px 8px;
    perspective: 1200px;
    transform-style: preserve-3d;
  }

  /* Sağa çevirme (ileri sayfa) */
  @keyframes flipRight {
    0%   { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
    40%  { transform: perspective(1200px) rotateY(-90deg) scaleX(0.8); opacity: 0.3; }
    41%  { transform: perspective(1200px) rotateY(90deg) scaleX(0.8); opacity: 0.3; }
    100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
  }

  /* Sola çevirme (geri sayfa) */
  @keyframes flipLeft {
    0%   { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
    40%  { transform: perspective(1200px) rotateY(90deg) scaleX(0.8); opacity: 0.3; }
    41%  { transform: perspective(1200px) rotateY(-90deg) scaleX(0.8); opacity: 0.3; }
    100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
  }

  .flip-anim-right { animation: flipRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

  /* ─── DARK MODE ──────────────────────────────────── */
  body.dark { --cream: #1a1612; --paper: #221e1a; --ink: #f0ebe3; --warm: #a89880; --border: #3d3530; --soft: #2d2820; --linen: #2a2520; }
  body.dark .shelf-book-new .shelf-book-spine { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); }
  body.dark .df-nav { background: rgba(30,26,22,0.95); color: var(--ink); border-color: var(--border); }
  body.dark .ocr-input, body.dark .ocr-textarea, body.dark .search-input, body.dark .chat-input { background: var(--soft); color: var(--ink); border-color: var(--border); }
  body.dark .filter-tab { background: var(--soft); color: var(--warm); border-color: var(--border); }
  body.dark .flip-page { background: #2a2520; }
  body.dark .flip-page.filled { background: #1e1a16; }
  body.dark .df-empty-page, body.dark .df-ocr { background: var(--paper); }

  /* ─── BOTTOM NAV ─────────────────────────────────── */
  .bottom-nav {
    display: flex;
    background: var(--ink);
    border-top: 1px solid rgba(255,255,255,0.08);
    position: sticky;
    bottom: 0;
    z-index: 100;
  }
  .bnav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 4px 8px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
  }
  .bnav-icon { font-size: 18px; }
  .bnav-label { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 0.3px; font-family: "Jost", sans-serif; }
  .bnav-btn.active .bnav-label { color: var(--accent); }
  .bnav-btn.active .bnav-icon { transform: translateY(-2px); }

  /* ─── TAB PANELS ─────────────────────────────────── */
  .tab-panel {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeIn 0.2s ease;
  }

  /* ─── STATS ──────────────────────────────────────── */
  .stats-card {
    background: white;
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 14px;
  }
  body.dark .stats-card { background: var(--soft); }
  .stats-card-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--warm);
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .stats-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .stats-num-block { flex: 1; text-align: center; }
  .stats-big { font-family: "Cormorant Garamond", serif; font-size: 32px; font-weight: 600; color: var(--tc, #8b2500); line-height: 1; }
  .stats-sub { font-size: 10px; color: var(--warm); margin-top: 2px; }

  /* Heatmap */
  .heatmap { display: flex; gap: 2px; overflow-x: auto; padding: 4px 0; }
  .heatmap-col { display: flex; flex-direction: column; gap: 2px; }
  .heatmap-cell { width: 9px; height: 9px; border-radius: 1px; background: var(--border); transition: background 0.2s; }
  .heatmap-cell.active { background: var(--tc, #8b2500); }

  /* Streak badge */
  .streak-badge { font-size: 11px; color: #e67e22; font-weight: 600; }
  .premium-badge { font-size: 11px; color: gold; font-weight: 600; }

  /* Wrapped */
  .wrapped-card { background: linear-gradient(135deg, var(--tc, #8b2500) 0%, #c4956a 100%); color: white; }
  .wrapped-card .stats-card-title { color: rgba(255,255,255,0.7); }
  .wrapped-card .stats-big { color: white; }
  .wrapped-card .stats-sub { color: rgba(255,255,255,0.6); }
  .wrapped-most { font-size: 12px; color: rgba(255,255,255,0.8); margin-bottom: 8px; text-align: center; }
  .wrapped-words { display: flex; flex-wrap: wrap; gap: 4px; }
  .word-chip { padding: 3px 8px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 11px; color: white; }
  .wrapped-card .word-chip { background: rgba(255,255,255,0.2); color: white; }

  /* AI */
  .ai-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #1a1512 0%, #3d2d20 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-family: "Jost", sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.2s;
    letter-spacing: 0.5px;
  }
  .ai-btn:disabled { opacity: 0.6; }
  .ai-summary-text { font-size: 13px; line-height: 1.7; color: var(--ink); margin-bottom: 8px; }
  .ai-motivation { font-size: 12px; color: var(--accent); font-style: italic; margin-bottom: 8px; }

  /* ─── CHAT ───────────────────────────────────────── */
  .chat-panel { padding: 0; }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 200px;
  }
  .chat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px;
    color: var(--warm);
    text-align: center;
    font-size: 13px;
  }
  .chat-empty-icon { font-size: 40px; }
  .chat-suggestions { display: flex; flex-direction: column; gap: 4px; width: 100%; margin-top: 8px; }
  .chat-suggestion {
    padding: 8px 12px;
    background: var(--soft);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-family: "Jost", sans-serif;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    color: var(--ink);
    transition: all 0.15s;
  }
  .chat-suggestion:hover { border-color: var(--accent); }
  .chat-msg {
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.6;
    max-width: 88%;
    animation: fadeIn 0.2s ease;
  }
  .chat-msg.user { background: var(--tc, #8b2500); color: white; align-self: flex-end; border-radius: 12px 12px 2px 12px; }
  .chat-msg.assistant { background: var(--soft); color: var(--ink); align-self: flex-start; border-radius: 12px 12px 12px 2px; }
  .chat-typing { opacity: 0.6; }
  .chat-input-row {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid var(--border);
    background: var(--paper);
  }
  .chat-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-family: "Jost", sans-serif;
    font-size: 13px;
    outline: none;
    background: white;
  }
  body.dark .chat-input { background: var(--soft); }
  .chat-input:focus { border-color: var(--accent); }
  .chat-send {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--tc, #8b2500);
    color: white;
    border: none;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  .chat-send:disabled { opacity: 0.5; }

  /* ─── SETTINGS ───────────────────────────────────── */
  .settings-panel { gap: 0; padding: 0; }
  .settings-section { padding: 12px 14px; border-bottom: 1px solid var(--border); }
  .settings-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 10px; }
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; }
  .toggle-btn {
    width: 44px; height: 24px;
    border-radius: 12px;
    background: var(--border);
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    padding: 0;
  }
  .toggle-btn.on { background: var(--tc, #8b2500); }
  .toggle-knob {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 3px; left: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  .toggle-btn.on .toggle-knob { transform: translateX(20px); }

  /* Premium */
  .premium-card { background: linear-gradient(135deg, #1a1512 0%, #3d2820 100%); border-radius: 8px; padding: 16px; color: white; }
  .premium-title { font-family: "Cormorant Garamond", serif; font-size: 20px; font-weight: 600; margin-bottom: 10px; color: var(--accent); }
  .premium-features { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
  .premium-feature { font-size: 12px; color: rgba(255,255,255,0.8); }
  .premium-btn { width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 6px; font-family: "Jost", sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }
  .premium-active { font-size: 14px; color: var(--accent); font-weight: 600; padding: 8px 0; }

  /* ─── LABEL PICKER ───────────────────────────────── */
  .label-picker {
    background: var(--paper);
    border-radius: 16px;
    padding: 20px;
    width: 90%;
    max-width: 340px;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .label-picker-title { font-family: "Cormorant Garamond", serif; font-size: 18px; font-weight: 600; margin-bottom: 14px; text-align: center; }
  .label-picker-section { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 8px; margin-top: 12px; }
  .label-colors { display: flex; gap: 8px; flex-wrap: wrap; }
  .label-color-btn { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.15s; }
  .label-color-btn:hover { transform: scale(1.2); }
  .label-stamps { display: flex; gap: 6px; flex-wrap: wrap; }
  .label-stamp-btn { font-size: 22px; background: none; border: 1px solid var(--border); border-radius: 8px; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .label-stamp-btn:hover { background: var(--soft); border-color: var(--accent); }

  /* ─── SHARE MODAL ────────────────────────────────── */
  .share-modal { background: var(--paper); border-radius: 16px; padding: 20px; width: 90%; max-width: 340px; animation: slideUp 0.25s ease; text-align: center; }
  .share-modal-title { font-family: "Cormorant Garamond", serif; font-size: 20px; font-weight: 600; margin-bottom: 14px; }
  .share-url { background: var(--soft); border-radius: 6px; padding: 10px; font-size: 11px; word-break: break-all; color: var(--warm); margin-bottom: 12px; border: 1px solid var(--border); }
  .share-copy-btn { width: 100%; padding: 12px; background: var(--ink); color: white; border: none; border-radius: 6px; font-family: "Jost", sans-serif; font-size: 14px; cursor: pointer; margin-bottom: 8px; }
  .share-close { width: 100%; padding: 10px; background: none; border: 1px solid var(--border); border-radius: 6px; font-family: "Jost", sans-serif; font-size: 13px; cursor: pointer; color: var(--warm); }
  .flip-anim-left  { animation: flipLeft  0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

  /* Sayfa kenarı gölgesi animasyon sırasında */
  .flip-anim-right::after,
  .flip-anim-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0,0,0,0.08) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.08) 100%);
    pointer-events: none;
    opacity: 0;
    animation: shadowFade 0.4s ease forwards;
  }
  @keyframes shadowFade {
    0%, 100% { opacity: 0; }
    40%, 60%  { opacity: 1; }
  }

  /* Thumbnail aktif geçiş */
  .df-thumb { transition: all 0.15s ease; }
  .df-thumb.active { animation: thumbPulse 0.3s ease; }
  @keyframes thumbPulse {
    0%   { transform: translateY(0) scale(1); }
    50%  { transform: translateY(-4px) scale(1.05); }
    100% { transform: translateY(-2px) scale(1); }
  }

  .region-block { border: 1px solid var(--border); border-radius: 4px; padding: 4px; background: var(--soft); }
  .region-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--warm); margin-bottom: 3px; }
`;
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);
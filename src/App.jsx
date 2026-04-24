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
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{fontSize:"36px",marginBottom:"12px"}}>⚠️</div>
        <div className="confirm-msg">
          <strong>Sayfa Zaten Kayıtlı</strong><br/>
          Bu sayfa daha önce fotoğraflanmış. Üzerine yazmak istiyor musun?
        </div>
        <div className="confirm-btns">
          <button className="confirm-yes" onClick={onConfirm}>✓ Üzerine Yaz</button>
          <button className="confirm-no" onClick={onCancel}>İptal</button>
        </div>
      </div>
    </div>
  );
}

// ─── ANA UYGULAMA ────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(() => {
  try {
    const saved = localStorage.getItem("ajan_current");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.serial_no) return "dashboard";
    }
    return "home";
  } catch { return "home"; }
});
  const [journals, setJournals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ajanda_journals") || "[]"); } catch { return []; }
  });
  const [current, setCurrent] = useState(() => {
    try {
      const saved = localStorage.getItem("ajan_current");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.serial_no) return parsed;
      }
      return null;
    } catch {
      localStorage.removeItem("ajan_current");
      return null;
    }
  });
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
  const [authMode, setAuthMode] = useState("landing"); // landing | login | register
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSerialNo, setRegSerialNo] = useState("");
  const [regTheme, setRegTheme] = useState("FERDI");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggedUsername, setLoggedUsername] = useState(() => localStorage.getItem("ajan_username") || "");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipOldPage, setFlipOldPage] = useState(null);
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
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Giriş yapılmışsa onboarding gösterme
    const username = localStorage.getItem("ajan_username");
    if (username) return false;
    return !localStorage.getItem("onboarding_done");
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [friendInviteUrl, setFriendInviteUrl] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendPages, setFriendPages] = useState(null);

  const [showFriends, setShowFriends] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
const [pushEnabled, setPushEnabled] = useState(() => localStorage.getItem("push_enabled") === "1");
const [notifHour, setNotifHour] = useState(() => parseInt(localStorage.getItem("notif_hour") || "20"));
const [notifMinute, setNotifMinute] = useState(() => parseInt(localStorage.getItem("notif_minute") || "0"));
const [showProfile, setShowProfile] = useState(false);
const [profileData, setProfileData] = useState(null);
const [newUsername, setNewUsername] = useState("");
const [newPassword, setNewPassword] = useState("");
const [oldPassword, setOldPassword] = useState("");
const [profileAvatar, setProfileAvatar] = useState("📓");
const [searchDateFrom, setSearchDateFrom] = useState("");
const [searchDateTo, setSearchDateTo] = useState("");
const [searchType, setSearchType] = useState("");
const [stripeLoading, setStripeLoading] = useState(false);
const [showAddJournal, setShowAddJournal] = useState(false);

const [newJournalSno, setNewJournalSno] = useState("");
const [newJournalTheme, setNewJournalTheme] = useState("");
const [newJournalPassword, setNewJournalPassword] = useState("");
 
const [lightboxImg, setLightboxImg] = useState(null);
const [appThemeColor, setAppThemeColor] = useState(() => localStorage.getItem("ajan_app_theme") || "");

const [showLibrary, setShowLibrary] = useState(() => {
  try {
    const saved = localStorage.getItem("ajan_current");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.serial_no) return false; // ajanda seçilmişse kütüphane gösterme
    }
    // Giriş yapılmış ama ajanda seçilmemişse kütüphane göster
    const username = localStorage.getItem("ajan_username");
    const journals = JSON.parse(localStorage.getItem("ajanda_journals") || "[]");
    return !!(username && journals.length > 0);
  } catch { return false; }
});
  const isNative = !!window.Capacitor?.isNativePlatform?.();

  useEffect(() => { setEditData(null); }, [activePage?.page_no]);
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get("reset");
  if (resetToken) {
    const newPass = prompt("Yeni şifrenizi girin (min 4 karakter):");
    if (newPass && newPass.length >= 4) {
      fetch(`${API}/user/reset_password`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ token: resetToken, new_password: newPass })
      }).then(r => r.json()).then(d => {
        if (d.status === "ok") alert("Şifreniz güncellendi! Giriş yapabilirsiniz.");
        else alert("Link geçersiz veya süresi dolmuş.");
      });
    }
    window.history.replaceState({}, "", window.location.pathname);
  }
}, []);
  // Sayfa yenilenince session'dan current varsa pages yükle
  useEffect(() => {
    if (current && pages.length === 0) {
      loadPages(current);
      loadStreak(current.serial_no);
      loadPremiumStatus(current.serial_no);
      loadFriends(current);
      loadYearlyReport(current.serial_no);
    }
  }, []);

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

  // PDF Export
  const exportPDF = async () => {
    if (!current || exportLoading) return;
    setExportLoading(true);
    try {
      const url = `${API}/export/pdf/${current.serial_no}?pin=${current.pin}`;
      if (isNative) {
        // Mobilde tarayıcıda aç
        const { Browser } = await import("@capacitor/browser").catch(() => ({ Browser: null }));
        if (Browser) await Browser.open({ url });
        else window.open(url, "_blank");
      } else {
        const res = await fetch(url);
        if (!res.ok) { alert("PDF oluşturulamadı"); setExportLoading(false); return; }
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `ajanda_${current.serial_no}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch { alert("PDF indirme hatası"); }
    setExportLoading(false);
  };

  // JSON Yedekleme
  const exportJSON = async () => {
    if (!current) return;
    try {
      const url = `${API}/export/json/${current.serial_no}?pin=${current.pin}`;
      if (isNative) {
        const { Browser } = await import("@capacitor/browser").catch(() => ({ Browser: null }));
        if (Browser) await Browser.open({ url });
        else window.open(url, "_blank");
      } else {
        const res = await fetch(url);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `ajanda_${current.serial_no}_backup.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch { alert("Yedekleme hatası"); }
  };

  // Push Bildirim
  const enablePushNotifications = async () => {
    setLoading(true);
    try {
      if (isNative) {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") {
          alert("Bildirim izni reddedildi");
          setLoading(false);
          return;
        }
        await LocalNotifications.schedule({
  notifications: [
    {
      title: "AJAN-DA 📓",
      body: "Bugün ajandanı güncellemeyi unutma! 📝",
      id: 2,
      schedule: {
        at: new Date(new Date().setHours(13, 12, 0, 0)),
        every: "day",
        allowWhileIdle: true,
      },
    }
  ]
});
        setPushEnabled(true); localStorage.setItem("push_enabled", "1");
        alert("Bildirimler aktif! Her gün 20:00'de hatırlatacağım.");

       
    } else {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    alert("Tarayıcınız desteklemiyor"); setLoading(false); return;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") { alert("İzin reddedildi"); setLoading(false); return; }
  
  const reg = await navigator.serviceWorker.ready;
  const VAPID_PUBLIC = "BxxxxPublicKeyxxxx"; // buraya kendi key'ini yaz
  
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC
  });
  
  // Backend'e kaydet
  await fetch(`${API}/push/subscribe/${current.serial_no}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ subscription: subscription.toJSON() })
  });
  
  setPushEnabled(true);
  localStorage.setItem("push_enabled", "1");
  alert("Bildirimler aktif! Sayfa kapalıyken de gelecek.");

}
    } catch(e) { alert("Hata: " + e.message); }
    setLoading(false);
  };
  // Kullanıcı adı/şifre ile kayıt
  const handleRegister = async () => {
    if (!regUsername || !regPassword || !regSerialNo) {
      setError("Tüm alanları doldurun"); return;
    }
    setLoading(true); setError("");
    try {
    // Eğer zaten giriş yapılmışsa, mevcut hesaba ajanda ekle
const endpoint = loggedUsername
  ? `${API}/user/add_journal/${loggedUsername}`
  : `${API}/user/register`;

const res = await fetch(endpoint, {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    username: regUsername || loggedUsername,
    password: regPassword,
    serial_no: regSerialNo,
    theme_id: regTheme,
    pin: regPassword.slice(0,6)
  })
});
      const d = await res.json();
      if (!res.ok) { setError(d.detail || "Kayıt hatası"); setLoading(false); return; }
      localStorage.setItem("ajan_username", regUsername);
      setLoggedUsername(regUsername);
      const journal = {
        serial_no: d.serial_no, theme_id: d.theme_id,
        theme_name: d.theme_name, theme_color: d.theme_color,
        pin: regPassword.slice(0,6), template: d.template,
        username: regUsername
      };
      const updated = [journal, ...journals.filter(j => j.serial_no !== journal.serial_no)];
      saveJournals(updated);
      saveCurrent(journal);
      await loadPages(journal);
      loadStreak(journal.serial_no);
      setShowLibrary(true);
      setAuthMode("landing");
    } catch { setError("Bağlantı hatası"); }
    setLoading(false);
  };

  // Kullanıcı adı/şifre ile giriş
  const handleUserLogin = async () => {
    if (!loginUsername || !loginPassword) {
      setError("Kullanıcı adı ve şifre girin"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/user/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const d = await res.json();
      if (!res.ok) { setError(d.detail || "Giriş hatası"); setLoading(false); return; }
      localStorage.setItem("ajan_username", loginUsername);
      setLoggedUsername(loginUsername);
      const journal = {
        serial_no: d.serial_no, theme_id: d.theme_id,
        theme_name: d.theme_name, theme_color: d.theme_color,
        pin: d.pin, template: d.template, username: loginUsername
      };
      const updated = [journal, ...journals.filter(j => j.serial_no !== journal.serial_no)];
      
      saveJournals(updated);
      // Kullanıcının tüm ajandalarını yükle
      try {
        const jr = await fetch(`${API}/user/journals/${loginUsername}?password=${loginPassword}`);
        const jd = await jr.json();
        if (jd.journals?.length > 0) {
          saveJournals(jd.journals);
          const updatedWithCounts = await Promise.all(jd.journals.map(async (j) => {
            try {
              const sr = await fetch(`${API}/stats?serial_no=${j.serial_no}`);
              const sd = await sr.json();
              return { ...j, page_count: sd.filled_pages || 0 };
            } catch { return j; }
          }));
          saveJournals(updatedWithCounts);
        }
      } catch {}
      await loadPages(journal);
      loadStreak(journal.serial_no);
      loadPremiumStatus(journal.serial_no);
      setAuthMode("landing");
      setShowLibrary(true);
      // saveCurrent SONDA - showLibrary true olunca render kütüphane gösterir
    } catch { setError("Bağlantı hatası"); }
    setLoading(false);
  };

  // Admin paneli
  const loadAdminData = async (key) => {
    try {
      const [dash, payments] = await Promise.all([
        fetch(`${API}/admin/dashboard?admin_key=${key}`).then(r => r.json()),
        fetch(`${API}/admin/payments?admin_key=${key}`).then(r => r.json()),
      ]);
      setAdminData({ dashboard: dash, payments });
    } catch { alert("Admin erişimi başarısız"); }
  };

  const approvePayment = async (id) => {
    await fetch(`${API}/admin/approve_payment/${id}?admin_key=${adminKey}`);
    loadAdminData(adminKey);
  };

  const rejectPayment = async (id) => {
    await fetch(`${API}/admin/reject_payment/${id}?admin_key=${adminKey}`, {method:"POST"});
    loadAdminData(adminKey);
  };

  const activatePremiumDirect = async (sno) => {
    await fetch(`${API}/admin/premium/${sno}?admin_key=${adminKey}`);
    loadAdminData(adminKey);
    alert(`${sno} için premium aktive edildi`);
  };

  // Arkadaş sistemi
  const createInvite = async () => {
    if (!current) return;
    try {
      const r = await fetch(`${API}/friend/invite/${current.serial_no}?pin=${current.pin}`, {method:"POST"});
      const d = await r.json();
      setFriendInviteUrl(d.invite_url);
    } catch { alert("Davet linki oluşturulamadı"); }
  };

  const loadFriends = async (cur) => {
    const c = cur || current;
    if (!c) return;
    try {
      const r = await fetch(`${API}/friend/list/${c.serial_no}?pin=${c.pin}`);
      const d = await r.json();
      setFriends(Array.isArray(d) ? d : []);
    } catch {}
  };

  const joinFriend = async () => {
    if (!inviteCode.trim() || !current) return;
    try {
      const r = await fetch(`${API}/friend/join/${inviteCode.trim()}`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({serial_no: current.serial_no, pin: current.pin})
      });
      const d = await r.json();
      if (d.status === "joined") { alert("Arkadaş eklendi!"); setInviteCode(""); loadFriends(); }
    } catch { alert("Katılım başarısız"); }
  };

  // Arkadaş çıkar
  const removeFriend = async (friendSno) => {
    if (!current) return;
    if (!window.confirm(`${friendSno} arkadaşlıktan çıkarılsın mı?`)) return;
    try {
      await fetch(`${API}/friend/remove/${current.serial_no}/${friendSno}?pin=${current.pin}`, {
        method: "DELETE"
      });
      loadFriends();
    } catch { alert("Hata oluştu"); }
  };

  // Onboarding tamamla
  const completeOnboarding = () => {
    localStorage.setItem("onboarding_done", "1");
    setShowOnboarding(false);
  };

  // URL'den invite code kontrol et
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inv = params.get("invite");
    if (inv) {
      setInviteCode(inv);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Havale ödeme
  const [showHavale, setShowHavale] = useState(false);
  const [havaleInfo, setHavaleInfo] = useState(null);
  const [havaleName, setHavaleName] = useState("");
  const [havaleNote, setHavaleNote] = useState("");
  const [havalePlan, setHavalePlan] = useState("monthly");
  const [havaleSubmitted, setHavaleSubmitted] = useState(false);

  const openHavale = async (plan) => {
    setHavalePlan(plan);
    setHavaleSubmitted(false);
    try {
      const r = await fetch(`${API}/payment/info`);
      const d = await r.json();
      setHavaleInfo(d);
    } catch { setHavaleInfo(null); }
    setShowHavale(true);
  };

  const submitHavale = async () => {
    if (!havaleName.trim()) { alert("Adınızı girin"); return; }
    setStripeLoading(true);
    try {
      const r = await fetch(`${API}/payment/request`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          serial_no: current.serial_no,
          plan: havalePlan,
          name: havaleName,
          note: havaleNote
        })
      });
      const d = await r.json();
      if (d.status === "pending") setHavaleSubmitted(true);
    } catch { alert("Talep gönderilemedi"); }
    setStripeLoading(false);
  };
// Profil yükle
const loadProfile = async () => {
  if (!loggedUsername) return;
  try {
    const r = await fetch(`${API}/user/profile/${loggedUsername}`);
    const d = await r.json();
    setProfileData(d);
    if (d.avatar) setProfileAvatar(d.avatar);
  } catch {}
};

// Profil güncelle
const updateProfile = async () => {
  if (!oldPassword) { alert("Mevcut şifrenizi girin"); return; }
  try {
    const res = await fetch(`${API}/user/update/${loggedUsername}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        old_password: oldPassword,
        new_username: newUsername || undefined,
        new_password: newPassword || undefined,
        avatar: profileAvatar
      })
    });
    const d = await res.json();
    if (!res.ok) { alert(d.detail || "Hata"); return; }
    if (newUsername) {
      localStorage.setItem("ajan_username", newUsername);
      setLoggedUsername(newUsername);
    }
    alert("Profil güncellendi!");
    setShowProfile(false);
    setOldPassword(""); setNewPassword(""); setNewUsername("");
  } catch { alert("Hata"); }
};

// Bildirim zamanı kaydet
const saveNotifTime = async (h, m) => {
  setNotifHour(h); setNotifMinute(m);
  localStorage.setItem("notif_hour", h);
  localStorage.setItem("notif_minute", m);
  if (!current) return;
  try {
    await fetch(`${API}/user/notification_time/${current.serial_no}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ hour: h, minute: m })
    });
    // Mevcut bildirimi iptal et, yenisini ayarla
    if (isNative && pushEnabled) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      await LocalNotifications.cancel({ notifications: [{ id: 2 }] });
      await LocalNotifications.schedule({
        notifications: [{
          title: "AJAN-DA 📓",
          body: "Bugün ajandanı güncellemeyi unutma! 📝",
          id: 2,
          schedule: {
            at: new Date(new Date().setHours(h, m, 0, 0)),
            every: "day",
            allowWhileIdle: true,
          },
        }]
      });
    }
  } catch {}
};

// Gelişmiş arama
const advancedSearch = async () => {
  if (!current) return;
  try {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (searchType) params.append("template_type", searchType);
    if (searchDateFrom) params.append("date_from", searchDateFrom);
    if (searchDateTo) params.append("date_to", searchDateTo);
    const r = await fetch(`${API}/search/${current.serial_no}?${params}`);
    const d = await r.json();
    setSearchResults(d.results || []);
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
    try {
      await fetch(`${API}/page/${current.serial_no}/${pageNo}/label`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ color, stamp })
      });
      // Local state'i hemen güncelle
      setPages(prev => prev.map(p =>
        p.page_no === pageNo
          ? { ...p, label_color: color ?? p.label_color, label_stamp: stamp ?? p.label_stamp }
          : p
      ));
      // activePage de güncelle
      if (activePage?.page_no === pageNo) {
        setActivePage(prev => ({
          ...prev,
          label_color: color ?? prev.label_color,
          label_stamp: stamp ?? prev.label_stamp
        }));
      }
    } catch { alert("Etiket kaydedilemedi"); }
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

  const saveCurrent = (journal) => {
    setCurrent(journal);
    if (journal) {
      localStorage.setItem("ajan_current", JSON.stringify(journal));
    } else {
      localStorage.removeItem("ajan_current");
    }
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
      saveCurrent(journal);
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
      saveCurrent(updated);
      await loadPages(updated);
      loadStreak(updated.serial_no);
      loadYearlyReport(updated.serial_no);
      loadPremiumStatus(updated.serial_no);
      setShowLibrary(true);
    } catch { setError("Bağlantı hatası"); }
    setLoading(false);
  };

  const loadPages = async (journal) => {
    try {
      const res = await fetch(`${API}/history?serial_no=${journal.serial_no}`);
      if (!res.ok) return;
      const data = await res.json();
      const notes = data.notes || [];
      setPages(notes);
      // En son fotoğraflanan sayfaya git
      if (notes.length > 0) {
        const lastPage = notes.reduce((max, p) => p.page_no > max.page_no ? p : max, notes[0]);
        setCurrentPageIdx(lastPage.page_no - 1);
      }
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

  // Auth ekranları
  if (authMode === "register") {
    return (
      <div className="auth-screen">
        <div className="auth-header">
          <button className="auth-back" onClick={() => { setAuthMode("landing"); setError(""); }}>← Geri</button>
          <div className="auth-logo">AJAN<span>-DA</span></div>
        </div>
        <div className="auth-body">
          <div className="auth-title">Yeni Ajanda Tanımla</div>
          <div className="auth-subtitle">Ajandanı sisteme ekle ve kullanıcı hesabı oluştur</div>

          <div className="auth-field">
            <label>Kullanıcı Adı</label>
            <input className="auth-input" placeholder="örn: ahmet_ajanda"
              value={regUsername} onChange={e => setRegUsername(e.target.value.toLowerCase())} />
          </div>
          <div className="auth-field">
            <label>Şifre</label>
            <input className="auth-input" type="password" placeholder="En az 4 karakter"
              value={regPassword} onChange={e => setRegPassword(e.target.value)} />
          </div>
          <div className="auth-field">
            <label>Ajanda Seri No</label>
            <input className="auth-input" placeholder="Kapak QR'ını okutun"
  value={regSerialNo} readOnly
  style={{cursor:"not-allowed", opacity: regSerialNo ? 1 : 0.5}} />
            <div className="auth-hint">
              <button className="auth-qr-btn" onClick={async () => {
                try {
                  if (isNative) {
                    const qr = await scanQR();
                    if (qr) {
                      const m = qr.match(/AJANDA-([A-Z0-9]+)-SN([A-Z0-9]+)/i);
                      if (m) { setRegTheme(m[1].toUpperCase()); setRegSerialNo(m[2]); }
                      else setRegSerialNo(qr);
                    }
                  } else {
                    const blob = await takePhoto();
                    if (!blob) return;
                    const form = new FormData();
                    form.append("file", blob, "cover.jpg");
                    const res = await fetch(`${API}/activate?pin=temp`, {method:"POST", body:form});
                    const d = await res.json();
                    if (d.serial_no) { setRegSerialNo(d.serial_no); setRegTheme(d.theme_id || "FERDI"); }
                    else if (d.detail) setError(d.detail);
                  }
                } catch(e) { setError("QR okunamadı"); }
              }}>📷 Kapak QR'ını Okut</button>
              {regSerialNo && <span style={{color:"#edbc73", fontSize:11}}>✓ {regSerialNo} {regTheme && `(${regTheme})`}</span>}
            </div>
          </div>


          {error && <div className="error-msg">{error}</div>}
          <button className="auth-btn" onClick={handleRegister} disabled={loading}>
            {loading ? "⏳ Kaydediliyor..." : "Ajandamı Oluştur →"}
          </button>
          <button className="auth-switch" onClick={() => { setAuthMode("login"); setError(""); }}>
            Zaten hesabın var mı? Giriş yap
          </button>
        </div>
      </div>
    );
  }

  if (authMode === "login") {
    return (
      <div className="auth-screen">
        <div className="auth-header">
          <button className="auth-back" onClick={() => { setAuthMode("landing"); setError(""); }}>← Geri</button>
          <div className="auth-logo">AJAN<span>-DA</span></div>
        </div>
        <div className="auth-body">
          <div className="auth-title">Giriş Yap</div>
          <div className="auth-subtitle">Kullanıcı adın ve şifrenle giriş yap</div>

          <div className="auth-field">
            <label>Kullanıcı Adı</label>
            <input className="auth-input" placeholder="Kullanıcı adın"
              value={loginUsername} onChange={e => setLoginUsername(e.target.value.toLowerCase())}
              onKeyDown={e => e.key === "Enter" && handleUserLogin()} />
          </div>
          <div className="auth-field">
            <label>Şifre</label>
            <input className="auth-input" type="password" placeholder="Şifren"
              value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUserLogin()} />
          </div>

          {error && <div className="error-msg">{error}</div>}
          <button className="auth-btn" onClick={handleUserLogin} disabled={loading}>
            {loading ? "⏳ Giriş yapılıyor..." : "Giriş Yap →"}
          </button>
          <button className="auth-switch" onClick={() => { setAuthMode("register"); setError(""); }}>
            Yeni ajanda tanımlamak ister misin?
          </button>
          <button className="auth-switch" onClick={async () => {
  const email = prompt("E-posta adresinizi girin:");
  if (!email) return;
  const res = await fetch(`${API}/user/forgot_password`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email })
  });
  alert("Şifre sıfırlama linki e-postanıza gönderildi.");
}}>
  Şifremi Unuttum
</button>
        </div>
      </div>
    );
  }

  // Onboarding
  if (showOnboarding) {
    const steps = [
      { icon: "📖", title: "Hoş Geldin!", desc: "Fiziksel ajandanı dijitalleştir. Sayfalarını fotoğrafla, notlarına her yerden eriş.", action: "Başla" },
      { icon: "🔍", title: "Ajandanı Aktive Et", desc: "Ajandanın kapağındaki QR kodu okut. Bu işlemi sadece bir kez yapman yeterli.", action: "Anladım" },
      { icon: "📸", title: "Sayfa Fotoğrafla", desc: "Her sayfanın köşesinde QR kod var. Sayfayı fotoğrafla, sistem otomatik kaydeder.", action: "Anladım" },
      { icon: "✨", title: "Dijital Ajandan Hazır!", desc: "Sayfaları ara, AI ile analiz et, arkadaşlarınla paylaş. Hadi başlayalım!", action: "ŞAHANE 🎉" },

    ];
    const s = steps[onboardingStep];
    return (
      <div className="onboarding-screen">
        <div className="onboarding-dots">
          {steps.map((_,i) => <div key={i} className={`ob-dot ${i===onboardingStep?"active":""}`} />)}
        </div>
        <div className="onboarding-content">
          <div className="ob-icon">{s.icon}</div>
          <div className="ob-title">{s.title}</div>
          <div className="ob-desc">{s.desc}</div>
        </div>
        <div className="onboarding-actions">
          <button className="ob-btn-primary" onClick={() => {
            if (onboardingStep < steps.length - 1) setOnboardingStep(onboardingStep + 1);
            else completeOnboarding();
          }}>{s.action}</button>
          <button className="ob-btn-skip" onClick={completeOnboarding}>Atla</button>
        </div>
      </div>
    );
  }
// Kütüphane ekranı
if (showLibrary) {
  return (
    <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"48px 24px 24px", background:"linear-gradient(180deg,#f8f5f0,#f0ece5)", textAlign:"center", position:"relative"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:40, color:"#edbc73", letterSpacing:4}}>AJAN<span style={{opacity:0.5}}>-DA</span></div>
        <div style={{fontSize:11, letterSpacing:3, textTransform:"uppercase", color:"rgba(28,20,16,0.35)", marginTop:6}}>Ajandalarım</div>
        {loggedUsername && <div style={{fontSize:12, color:"rgba(28,20,16,0.4)", marginTop:4}}>@{loggedUsername}</div>}
      </div>

      {/* Raf */}
      <div style={{flex:1, padding:"32px 20px", display:"flex", flexDirection:"column", gap:12}}>
        {journals.map((j, idx) => (
          <button key={j.serial_no}
            onClick={async () => {
              setLoading(true);
              saveCurrent(j);
              await loadPages(j);
              loadStreak(j.serial_no);
              loadPremiumStatus(j.serial_no);
              setShowLibrary(false);
              setStep("dashboard");
              setLoading(false);
            }}
            style={{
              display:"flex", alignItems:"center", gap:16,
              padding:"16px 20px",
              background:"rgba(0,0,0,0.03)",
              border:`1px solid ${j.theme_color || "#8b2500"}40`,
              borderLeft:`4px solid ${j.theme_color || "#8b2500"}`,
              borderRadius:8,
              cursor:"pointer",
              textAlign:"left",
              transition:"all 0.2s",
              animation:`fadeIn 0.3s ease ${idx*0.08}s both`
            }}>
            {/* Kitap ikonu */}
            <div style={{
              width:48, height:64,
              background: j.theme_color || "#8b2500",
              borderRadius:"2px 6px 6px 2px",
              flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"3px 4px 12px rgba(0,0,0,0.3)",
              position:"relative",
              overflow:"hidden"
            }}>
              <div style={{position:"absolute", left:0, top:0, bottom:0, width:6, background:"rgba(0,0,0,0.2)"}} />
              <span style={{fontSize:18, position:"relative", zIndex:1}}>📓</span>
            </div>
            {/* Bilgi */}
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"var(--text)", fontWeight:600}}>
                {j.theme_name || j.theme_id}
              </div>
              <div style={{fontSize:11, color:"rgba(28,20,16,0.4)", marginTop:2}}>
                №{j.serial_no}
              </div>
              {j.page_count > 0 && (
                <div style={{fontSize:11, color:j.theme_color || "#c4956a", marginTop:4}}>
                  {j.page_count} sayfa fotoğraflandı
                </div>
              )}
            </div>
            <span style={{color:"rgba(28,20,16,0.35)", fontSize:18}}>→</span>
          </button>
        ))}

        {/* Yeni ajanda ekle butonu */}
        <button onClick={() => { setShowLibrary(false); setShowAddJournal(true); }}
          style={{
            display:"flex", alignItems:"center", gap:16,
            padding:"16px 20px",
            background:"rgba(0,0,0,0.02)",
            border:"1px dashed rgba(0,0,0,0.12)",
            borderRadius:8, cursor:"pointer", textAlign:"left",
            marginTop:8
          }}>
          <div style={{width:48, height:64, background:"rgba(0,0,0,0.04)", borderRadius:"2px 6px 6px 2px",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:24}}>
            +
          </div>
          <div style={{color:"rgba(28,20,16,0.4)", fontSize:14}}>Yeni Ajanda Ekle</div>
        </button>
      </div>

      {/* Çıkış */}
      <div style={{padding:"16px 20px", borderTop:"1px solid rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex", gap:12}}>
  <button onClick={() => { setShowLibrary(false); setAuthMode("landing"); }}
    style={{background:"none", border:"none", color:"rgba(28,20,16,0.35)", fontFamily:"'Montserrat',sans-serif", fontSize:13, cursor:"pointer"}}>
    ← Ana Sayfa
  </button>
  <button onClick={() => { 
    saveCurrent(null); 
    setJournals([]); 
    setLoggedUsername(""); 
    localStorage.clear(); 
    setShowLibrary(false); 
    setAuthMode("landing"); 
  }}
    style={{background:"none", border:"none", color:"#e74c3c", fontFamily:"'Montserrat',sans-serif", fontSize:13, cursor:"pointer"}}>
    Hesabımdan Çık
  </button>
</div>
      </div>
    </div>
  );
}
  // Admin paneli
  if (showAdmin) {
    return (
      <div className="admin-screen">
        <div className="admin-header">
          <button className="admin-back" onClick={() => setShowAdmin(false)}>← Geri</button>
          <div className="admin-title">⚙️ Admin Paneli</div>
        </div>

        {!adminData ? (
          <div className="admin-login">
            <div className="admin-login-icon">🔐</div>
            <input className="admin-key-input" type="password" placeholder="Admin şifresi"
              value={adminKey} onChange={e => setAdminKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadAdminData(adminKey)} />
            <button className="admin-btn" onClick={() => loadAdminData(adminKey)}>Giriş</button>
          </div>
        ) : (
          <>
            {/* Admin tabs */}
            <div className="admin-tabs">
              {[["dashboard","📊 Özet"],["payments","💳 Ödemeler"],["journals","📖 Ajandalar"]].map(([t,l]) => (
                <button key={t} className={`admin-tab ${adminTab===t?"active":""}`} onClick={() => setAdminTab(t)}>{l}</button>
              ))}
            </div>

            {adminTab === "dashboard" && adminData.dashboard && (
              <div className="admin-content">
                <div className="admin-stats">
                  {[
                    ["📖", adminData.dashboard.stats?.total_journals, "Ajanda"],
                    ["⭐", adminData.dashboard.stats?.premium_count, "Premium"],
                    ["📸", adminData.dashboard.stats?.total_pages, "Sayfa"],
                    ["📅", adminData.dashboard.stats?.today_pages, "Bugün"],
                    ["💳", adminData.dashboard.stats?.pending_payments, "Bekleyen"],
                  ].map(([icon,val,label]) => (
                    <div key={label} className="admin-stat-card">
                      <div className="admin-stat-icon">{icon}</div>
                      <div className="admin-stat-num">{val || 0}</div>
                      <div className="admin-stat-label">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="admin-section-title">Son Ajandalar</div>
                {adminData.dashboard.journals?.map(j => (
                  <div key={j.serial_no} className="admin-journal-row">
                    <div className="ajr-info">
                      <span className="ajr-sno">#{j.serial_no}</span>
                      <span className="ajr-theme">{j.theme_id}</span>
                      {j.premium ? <span className="ajr-premium">⭐</span> : null}
                    </div>
                    <div className="ajr-meta">
                      <span>{j.page_count} sayfa</span>
                      {!j.premium && (
                        <button className="ajr-btn" onClick={() => activatePremiumDirect(j.serial_no)}>Premium Aktive</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "payments" && (
              <div className="admin-content">
                {(!adminData.payments || adminData.payments.length === 0) ? (
                  <div className="admin-empty">Bekleyen ödeme yok</div>
                ) : adminData.payments.map(p => (
                  <div key={p.id} className={`admin-payment-card ${p.status}`}>
                    <div className="apc-top">
                      <span className="apc-sno">#{p.serial_no}</span>
                      <span className="apc-plan">{p.plan === "monthly" ? "Aylık ₺99" : "Yıllık ₺830"}</span>
                      <span className={`apc-status ${p.status}`}>{p.status === "pending" ? "⏳ Bekliyor" : p.status === "approved" ? "✅ Onaylandı" : "❌ Reddedildi"}</span>
                    </div>
                    <div className="apc-name">{p.name}</div>
                    <div className="apc-date">{p.created_at?.slice(0,16)}</div>
                    {p.status === "pending" && (
                      <div className="apc-actions">
                        <button className="apc-approve" onClick={() => approvePayment(p.id)}>✓ Onayla</button>
                        <button className="apc-reject" onClick={() => rejectPayment(p.id)}>✕ Reddet</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {adminTab === "journals" && (
              <div className="admin-content">
                {adminData.dashboard.journals?.map(j => (
                  <div key={j.serial_no} className="admin-journal-row">
                    <div className="ajr-info">
                      <span className="ajr-sno">#{j.serial_no}</span>
                      <span className="ajr-theme">{j.theme_id}</span>
                      {j.premium ? <span className="ajr-premium">⭐</span> : null}
                    </div>
                    <div className="ajr-meta">
                      <span>{j.page_count || 0} sayfa</span>
                      <a className="ajr-btn" href={`${API}/export/pdf/${j.serial_no}?pin=${j.pin}`} target="_blank">PDF</a>
                      <a className="ajr-btn" href={`${API}/qr/generate/${j.serial_no}?theme_id=${j.theme_id}&admin_key=${adminKey}`} target="_blank">QR</a>
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
// Profil modal
if (showProfile) {
  const AVATARS = ["📓","📚","✏️","🎯","🌟","💡","🔥","🎨","🌸","🦋","🎪","🏆"];
  return (
    <div className="overlay-screen" style={{padding:"20px"}} onClick={() => setShowProfile(false)}>
      <div className="havale-modal" onClick={e => e.stopPropagation()}>
        <div className="havale-title">👤 Profil</div>
        {profileData && (
          <div style={{textAlign:"center", padding:"8px 0"}}>
            <div style={{fontSize:48}}>{profileAvatar}</div>
            <div style={{color:"var(--accent)", fontSize:16, fontWeight:600}}>@{profileData.username}</div>
            <div style={{fontSize:11, color:"var(--warm)", marginTop:4}}>{profileData.page_count} sayfa · {profileData.theme_id}</div>
          </div>
        )}
        <div className="havale-form-label">Avatar Seç</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
          {["📓","📚","✏️","🎯","🌟","💡","🔥","🎨","🌸","🦋","🎪","🏆"].map(a => (
            <button key={a} onClick={() => setProfileAvatar(a)}
              style={{fontSize:24, background: profileAvatar===a ? "var(--soft)" : "none",
                border: profileAvatar===a ? "2px solid var(--accent)" : "2px solid transparent",
                borderRadius:8, width:40, height:40, cursor:"pointer"}}>
              {a}
            </button>
          ))}
        </div>
        <div className="havale-form-label">Yeni Kullanıcı Adı (opsiyonel)</div>
        <input className="havale-input" placeholder={loggedUsername}
          value={newUsername} onChange={e => setNewUsername(e.target.value.toLowerCase())} />
        <div className="havale-form-label">Yeni Şifre (opsiyonel)</div>
        <input className="havale-input" type="password" placeholder="Boş bırakırsan değişmez"
          value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <div className="havale-form-label">Mevcut Şifre *</div>
        <input className="havale-input" type="password" placeholder="Doğrulama için gerekli"
          value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
        <button className="havale-btn" onClick={updateProfile}>Güncelle</button>
        <button className="havale-cancel" onClick={() => setShowProfile(false)}>İptal</button>
      </div>
    </div>
  );
}
// Arkadaş sayfaları
if (friendPages) {
  return (
    <div className="detail-flip-screen" style={{"--tc": "#37474f"}}>
      <div className="df-header">
        <button className="df-back" onClick={() => setFriendPages(null)}>←</button>
        <div className="df-header-center">
          <div className="df-page-title">#{friendPages.serial_no}</div>
          <div className="df-page-meta">{friendPages.pages.length} fotoğraflanan sayfa</div>
        </div>
      </div>
      <div className="df-content">
        {friendPages.pages.map(p => (
          <div key={p.page_no} style={{marginBottom:16}}>
            <div style={{fontSize:11, color:"var(--warm)", marginBottom:6, fontWeight:600}}>
              Sayfa {p.page_no} · {p.template_type?.replace(/_/g," ")}
            </div>
            <div className="df-photo-wrap">
              <img src={`${API}${p.image_url}`} alt="" className="df-photo" />
            </div>
          </div>
        ))}
      </div>
      <div className="df-thumbstrip">
        {friendPages.pages.map(p => (
          <div key={p.page_no} className="df-thumb filled">
            <img src={`${API}${p.image_url}`} alt="" className="df-thumb-img" />
            <div className="df-thumb-num">{p.page_no}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Yeni ajanda ekle modal
if (showAddJournal) {
  return (
    <div className="overlay-screen" style={{padding:"20px"}}>
      <div className="havale-modal">
        <div className="havale-title">📒 Yeni Ajanda Ekle</div>
        <div className="havale-desc">Kapağın QR'ını okutarak yeni ajandanı ekle</div>

        <button className="auth-qr-btn" style={{alignSelf:"flex-start", padding:"10px 16px", fontSize:13}} onClick={async () => {
          try {
            if (isNative) {
              const qr = await scanQR();
              if (qr) {
                const m = qr.match(/^AJANDA-([A-Z]+)-SN([A-Z0-9]+)$/i);
                if (m) { setNewJournalTheme(m[1].toUpperCase()); setNewJournalSno(m[2].toUpperCase()); }
                else alert("Geçersiz QR format. Kapağ QR'ını okutun.");
              }
            } else {
              const blob = await takePhoto();
              if (!blob) return;
              const form = new FormData();
              form.append("file", blob, "cover.jpg");
              const res = await fetch(`${API}/activate?pin=temp`, {method:"POST", body:form});
              const d = await res.json();
              if (d.serial_no && d.theme_id) { setNewJournalSno(d.serial_no); setNewJournalTheme(d.theme_id); }
              else if (d.serial_no && !d.theme_id) alert("Tema okunamadı. Lütfen tekrar deneyin.");
              else alert(d.detail || "QR okunamadı");
            }
          } catch(e) { alert("QR okunamadı: " + e.message); }
        }}>📷 Kapağ QR'ını Okut</button>

        {newJournalSno && (
          <div style={{fontSize:13, color:"var(--accent)", padding:"6px 0"}}>
            ✓ {newJournalSno} {newJournalTheme && `(${newJournalTheme})`}
          </div>
        )}

        {newJournalSno && newJournalTheme && (
  <div style={{fontSize:13, color:"var(--accent)", padding:"8px 0"}}>
    ✓ Ajanda bulundu. Mevcut hesabına eklenecek.
  </div>
)}

        <button className="havale-btn"
disabled={!newJournalSno || !newJournalTheme || loading}
          onClick={async () => {
            if (!newJournalSno || !loggedUsername) return;
            setLoading(true);
            try {
              const res = await fetch(`${API}/user/add_journal/${loggedUsername}`, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
  serial_no: newJournalSno,
  theme_id: newJournalTheme
})
              });
              const d = await res.json();
              if (!res.ok) { alert(d.detail || "Hata"); setLoading(false); return; }
              const newJournal = {
                serial_no: newJournalSno,
                theme_id: d.theme_id || newJournalTheme,
                theme_name: d.theme_name || newJournalTheme,
                theme_color: d.theme_color || "#8b2500",
                pin: newJournalPassword,
                template: d.template || {},
                username: loggedUsername
              };
              saveJournals([...journals.filter(j => j.serial_no !== newJournalSno), newJournal]);
              setShowAddJournal(false);
setNewJournalSno(""); setNewJournalTheme("");
              setShowLibrary(true);
              alert("Ajanda eklendi!");
            } catch { alert("Hata"); }
            setLoading(false);
          }}>
          {loading ? "⏳ Ekleniyor..." : "Ajandayi Ekle →"}
        </button>
        <button className="havale-cancel" onClick={() => {
          setShowAddJournal(false);
setNewJournalSno(""); setNewJournalTheme("");
          setShowLibrary(true);
        }}>İptal</button>
      </div>
    </div>
  );
}
  if (showHavale) {
    return (
      <div className="overlay-screen" style={{padding:"20px"}}>
        <div className="havale-modal">
          {havaleSubmitted ? (
            <>
              <div className="havale-success-icon">✅</div>
              <div className="havale-title">Talebiniz Alındı!</div>
              <div className="havale-desc">
                Havaleyi yaptıktan sonra 24 saat içinde premium aktive edilecek.
                Seri no: <strong>{current?.serial_no}</strong>
              </div>
              <button className="havale-btn" onClick={() => setShowHavale(false)}>Tamam</button>
            </>
          ) : (
            <>
              <div className="havale-title">
                {havalePlan === "monthly" ? "Aylık ₺99" : "Yıllık ₺830"} — Havale ile Öde
              </div>

              {havaleInfo && (
                <div className="havale-bilgi">
                  <div className="havale-bilgi-row">
                    <span className="hb-label">Banka</span>
                    <span className="hb-val">{havaleInfo.banka}</span>
                  </div>
                  <div className="havale-bilgi-row">
                    <span className="hb-label">Ad Soyad</span>
                    <span className="hb-val">{havaleInfo.ad_soyad}</span>
                  </div>
                  <div className="havale-bilgi-row iban">
                    <span className="hb-label">IBAN</span>
                    <span className="hb-val">{havaleInfo.iban}</span>
                    <button className="hb-copy" onClick={() => { navigator.clipboard.writeText(havaleInfo.iban); alert("IBAN kopyalandı"); }}>📋</button>
                  </div>
                  <div className="havale-bilgi-row">
                    <span className="hb-label">Tutar</span>
                    <span className="hb-val">₺{havalePlan === "monthly" ? havaleInfo.fiyat_aylik : havaleInfo.fiyat_yillik}</span>
                  </div>
                  <div className="havale-aciklama">
                    ⚠️ Havale açıklamasına seri numaranızı yazın: <strong>{current?.serial_no}</strong>
                  </div>
                </div>
              )}

              <div className="havale-form">
                <div className="havale-form-label">Adınız Soyadınız</div>
                <input className="havale-input" placeholder="Havaleyi yapan kişinin adı"
                  value={havaleName} onChange={e => setHavaleName(e.target.value)} />
                <div className="havale-form-label" style={{marginTop:8}}>Not (opsiyonel)</div>
                <input className="havale-input" placeholder="Eklemek istediğiniz bir not"
                  value={havaleNote} onChange={e => setHavaleNote(e.target.value)} />
              </div>

              <button className="havale-btn" onClick={submitHavale} disabled={stripeLoading}>
                {stripeLoading ? "⏳ Gönderiliyor..." : "✓ Havaleyi Yaptım, Onay Bekleyorum"}
              </button>
              <button className="havale-cancel" onClick={() => setShowHavale(false)}>İptal</button>
            </>
          )}
        </div>
      </div>
    );
  }

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
        const d = dir || (idx > curIdx ? "right" : "left");
        setFlipDir(d);
        setFlipOldPage(activePage); // mevcut sayfayı kaydet
        setIsFlipping(true);
        // Yarısında yeni sayfayı göster
        setTimeout(() => {
          setActivePage(allPagesForDetail[idx]);
        }, 350);
        setTimeout(() => {
          setIsFlipping(false);
          setFlipDir(null);
          setFlipOldPage(null);
        }, 700);
      }
    };

    return (
      <div className="detail-flip-screen" style={{"--tc": current?.theme_color || "#8b2500"}}>

        {/* Header */}
        <div className="df-header">
          <button className="df-back" onClick={() => setActivePage(null)}>←</button>
          <div className="df-header-center">
            <div className="df-page-title">{activePage.template?.title || `Sayfa ${activePage.page_no}`}</div>
            <div className="df-page-meta">
              {curIdx + 1} / {allPagesForDetail.length}
              {activePage.label_stamp && <span style={{marginLeft:6}}>{activePage.label_stamp}</span>}
              {activePage.label_color && <span className="df-label-dot" style={{background: activePage.label_color}} />}
            </div>
          </div>
          <div className="df-header-actions">
            <button className={`df-action-btn ${bookmarked ? "active" : ""}`}
              onClick={() => toggleBookmark(activePage.page_no)} title="Favoriler">
              {bookmarked ? "❤️" : "🤍"}
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

        {/* Sayfa içeriği — defter sayfası */}
        <div className="df-book-area">
          {/* Kıvrılan eski sayfa */}
          {isFlipping && flipOldPage && (
            <div className={`df-page-flipping df-flip-${flipDir}`}>
              {flipOldPage.image_url ? (
                <img src={`${API}${flipOldPage.image_url}`} alt="" className="df-flip-img" />
              ) : (
                <div className="df-flip-empty">{flipOldPage.template?.icon || "📄"}</div>
              )}
            </div>
          )}

          {/* Mevcut sayfa (altta) */}
          <div className={`df-content ${isFlipping ? "df-page-reveal" : ""}`}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {activePage.image_url ? (
            <div className="df-photo-wrap" onClick={() => setLightboxImg(`${API}${activePage.image_url}`)}>
              <img src={`${API}${activePage.image_url}`} alt="sayfa" className="df-photo" />
              <div className="df-photo-zoom-hint">🔍 Büyütmek için tıkla</div>
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

          {/* OCR / El yazısı transkripsiyon */}
          {!activePage.is_empty && (
            <div className="df-ocr-card">
              <div className="df-ocr-header">
                <span className="df-ocr-title">📝 Sayfada Yazanlar</span>
                {activePage.image_url && (
                  <button className="df-ocr-ai-btn" onClick={async () => {
                    setAiLoading(true);
                    try {
                      const res = await fetch(`${API}/ai/ocr?serial_no=${current.serial_no}&page_no=${activePage.page_no}`, { method: "POST" });
                      if (!res.ok) {
                        const errText = await res.text();
                        setError(`OCR hatası (${res.status}): ${errText}`);
                        setAiLoading(false);
                        return;
                      }
                      const data = await res.json();
                      if (data.ocr_text) {
                        setEditData(prev => ({ ...prev, _ai_ocr: data.ocr_text, _ai_ocr_editing: false }));
                        setPages(prev => prev.map(p => p.page_no === activePage.page_no ? { ...p, ocr_text: data.ocr_text } : p));
                        setActivePage(prev => ({ ...prev, ocr_text: data.ocr_text }));
                      }
                    } catch(e) { console.error(e); setError("AI OCR bağlantı hatası: " + e.message); }
                    setAiLoading(false);
                  }} disabled={aiLoading}>
                    {aiLoading ? "⏳ Okunuyor..." : (activePage.ocr_text ? "🔄 Tekrar Oku" : "🤖 AI ile Oku")}
                  </button>
                )}
              </div>
              
              {/* OCR sonucu — düzenlenebilir */}
              {(activePage.ocr_text || editData?._ai_ocr) && (
                <div className="df-ocr-result">
                  {editData?._ai_ocr_editing ? (
                    <>
                      <textarea 
                        className="df-ocr-edit-area"
                        value={editData?._ai_ocr_text ?? activePage.ocr_text ?? ""}
                        onChange={e => setEditData(prev => ({ ...prev, _ai_ocr_text: e.target.value }))}
                        rows={6}
                      />
                      <div className="df-ocr-edit-btns">
                        <button className="df-ocr-save-btn" onClick={async () => {
                          const txt = editData?._ai_ocr_text ?? activePage.ocr_text;
                          try {
                            await fetch(`${API}/ai/ocr/save?serial_no=${current.serial_no}&page_no=${activePage.page_no}&text=${encodeURIComponent(txt)}`, { method: "POST" });
                            setPages(prev => prev.map(p => p.page_no === activePage.page_no ? { ...p, ocr_text: txt } : p));
                            setActivePage(prev => ({ ...prev, ocr_text: txt }));
                            setEditData(prev => ({ ...prev, _ai_ocr_editing: false, _ai_ocr: null }));
                          } catch(e) { setError("Kaydetme hatası"); }
                        }}>✓ Kaydet</button>
                        <button className="df-ocr-cancel-btn" onClick={() => {
                          setEditData(prev => ({ ...prev, _ai_ocr_editing: false, _ai_ocr_text: undefined }));
                        }}>İptal</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="df-ocr-result-text">{editData?._ai_ocr || activePage.ocr_text}</div>
                      <button className="df-ocr-edit-trigger" onClick={() => {
                        setEditData(prev => ({ ...prev, _ai_ocr_editing: true, _ai_ocr_text: editData?._ai_ocr || activePage.ocr_text }));
                      }}>✏️ Düzelt</button>
                    </>
                  )}
                </div>
              )}

              {!activePage.ocr_text && !editData?._ai_ocr && (
                <div className="df-ocr-empty">Yazı okunmadı. "AI ile Oku" butonuna tıklayarak el yazısını okutabilirsin.</div>
              )}
            </div>
          )}
        </div>
        </div>{/* df-book-area end */}

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
                {bm && <div className="df-thumb-bm">❤️</div>}
              </div>
            );
          })}
        </div>

        {/* Lightbox */}
        {lightboxImg && (
          <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
            <button className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
            <img src={lightboxImg} alt="büyük görünüm" className="lightbox-img" onClick={e => e.stopPropagation()} />
          </div>
        )}
      </div>
    );
  }

  if (current && step === "dashboard") {
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
      <div className="journal-app" style={{ "--tc": appThemeColor || current.theme_color || "#8b2500" }}>
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
            <button className="jc-btn" onClick={() => {
  saveCurrent(null);
  setShowLibrary(true);
}}>↩</button>
          </div>
        </div>

        {/* Top nav tabs */}
        <div className="top-nav">
          {[
            {id:"pages",   icon:"📖", label:"Sayfalar"},
            {id:"stats",   icon:"📊", label:"İstatistik"},
            {id:"chat",    icon:"🤖", label:"AI"},
            {id:"friends", icon:"👥", label:"Arkadaş"},
            {id:"settings",icon:"⚙️", label:"Ayarlar"},
          ].map(t => (
            <button key={t.id} className={`tnav-btn ${activeTab===t.id?"active":""}`}
              onClick={() => setActiveTab(t.id)}>
              <span className="tnav-icon">{t.icon}</span>
              <span className="tnav-label">{t.label}</span>
            </button>
          ))}
        </div>

        {error && <div className="error-msg" style={{margin:"0 16px 8px"}}>{error}</div>}

        {/* ═══ PAGES TAB ═══ */}
        {activeTab === "pages" && (
          <>
            {/* Arama + Filtre */}
            <div className="journal-toolbar">
              <div className={`search-bar ${searchOpen ? "open" : ""}`}>
                <button className="search-toggle" onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}>
                  {searchOpen ? "✕" : "🔎"}
                </button>
         {searchOpen && (
      <div style={{display:"flex", flexDirection:"column", gap:4, flex:1}}>
        <div style={{display:"flex", gap:6}}>
          <input className="search-input" autoFocus
            placeholder="Sayfalar içinde ara..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); advancedSearch(); }} />
          <select className="search-input" style={{width:"auto", padding:"5px 8px", flex:"0 0 auto"}}
            value={searchType} onChange={e => { setSearchType(e.target.value); advancedSearch(); }}>
            <option value="">Tüm tipler</option>
            <option value="haftalik_dikey">Haftalık</option>
            <option value="aylik_takvim">Aylık</option>
            <option value="bas_planlayici">Günlük</option>
            <option value="aliskanlik">Alışkanlık</option>
            <option value="notes">Notlar</option>
          </select>
        </div>
        <div style={{display:"flex", gap:6}}>
          <input type="date" className="search-input" style={{flex:1, fontSize:11}}
            value={searchDateFrom}
            onChange={e => { setSearchDateFrom(e.target.value); advancedSearch(); }} />
          <input type="date" className="search-input" style={{flex:1, fontSize:11}}
            value={searchDateTo}
            onChange={e => { setSearchDateTo(e.target.value); advancedSearch(); }} />
        </div>
      </div>
    )}
                {searchQuery && <span className="search-count">{searchResults.length} sayfa</span>}
              </div>
              <div className="filter-tabs">
                {[["all","Tümü","Tüm sayfalar"],["filled","✓ Dolu","Dolu sayfalar"],["empty","○ Boş","Boş sayfalar"],["bookmarked","❤️","Favoriler"]].map(([f,l,tip]) => (
                  <button key={f} className={`filter-tab ${filterMode===f?"active":""}`}
                    title={tip} onClick={() => setFilterMode(f)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Flip Book */}
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
                  const labelColor = pageData.label_color;
                  const labelStamp = pageData.label_stamp;
                  return (
                    <div
                      key={pageData.page_no}
                      className={`flip-page ${isFilled ? "filled" : "empty"} ${isSearchHit ? "search-hit" : ""}`}
                      onClick={() => setActivePage(pageData)}
                      style={{"--delay": `${idx * 0.03}s`, ...(labelColor ? {"--label-color": labelColor} : {})}}
                    >
                      {labelColor && <div className="flip-page-label-bar" style={{background: labelColor}} />}
                      <div className="flip-page-margin" />
                      <div className="flip-page-inner">
                        <div className="flip-page-num">{pageData.page_no}</div>
                        {bm && <div className="flip-page-bm">❤️</div>}
                        {labelStamp && <div className="flip-page-stamp">{labelStamp}</div>}
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
          </>
        )}

        {/* ═══ OTHER TABS — hemen menünün altında ═══ */}
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

        {activeTab === "friends" && (
          <div className="tab-panel">
            <div className="friends-header">
              <div className="friends-title">👥 Arkadaşlar</div>
              <button className="friends-invite-btn" onClick={() => { createInvite(); loadFriends(); }}>
                + Davet Et
              </button>
            </div>

            {friendInviteUrl && (
              <div className="invite-card">
                <div className="invite-label">Davet Linki</div>
                <div className="invite-url">{friendInviteUrl}</div>
                <button className="invite-copy" onClick={() => { navigator.clipboard.writeText(friendInviteUrl); alert("Kopyalandı!"); }}>
                  📋 Kopyala
                </button>
              </div>
            )}

            <div className="join-card">
              <div className="join-label">Davet Koduna Katıl</div>
              <div className="join-row">
                <input className="join-input" placeholder="Davet kodu gir..."
                  value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
                <button className="join-btn" onClick={joinFriend}>Katıl</button>
              </div>
            </div>

            <div className="friends-section-title">Arkadaşlarım</div>
            {friends.length === 0 ? (
              <div className="friends-empty">
                <div style={{fontSize:36}}>👥</div>
                <div>Henüz arkadaş yok</div>
                <div style={{fontSize:12, color:"var(--warm)"}}>Davet linki oluştur ve paylaş</div>
              </div>
            ) : friends.map(f => (
              <div key={f.friend_serial_no} className="friend-card">
                <div className="fc-avatar">📓</div>
                <div className="fc-info">
                  <div className="fc-sno">#{f.friend_serial_no}</div>
                  <div className="fc-meta">{f.theme_id} • {f.page_count} sayfa</div>
                </div>
                <button className="fc-view" onClick={async () => {
  try {
    const r = await fetch(`${API}/friend/pages/${f.friend_serial_no}?serial_no=${current.serial_no}&pin=${current.pin}`);
    const d = await r.json();
    if (d.pages?.length > 0) {
      setFriendPages({ serial_no: f.friend_serial_no, pages: d.pages });
    } else {
      alert("Bu arkadaş henüz sayfa eklememiş");
    }
  } catch { alert("Hata"); }
}}>Gör</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-panel settings-panel">

            {/* Görünüm */}
            <div className="settings-section">
              <div className="settings-title">Görünüm</div>
              <div className="settings-row">
                <span>Karanlık Mod</span>
                <button className={`toggle-btn ${darkMode?"on":""}`} onClick={() => setDarkMode(!darkMode)}>
                  <div className="toggle-knob" />
                </button>
              </div>
            </div>

            {/* Premium */}
            <div className="settings-section">
              <div className="settings-title">Premium</div>
              {isPremium ? (
                <div className="premium-active-card">
                  <div className="premium-active-icon">⭐</div>
                  <div>
                    <div className="premium-active-title">Premium Aktif</div>
                    <div className="premium-active-sub">Tüm özelliklere erişimin var</div>
                  </div>
                </div>
              ) : (
                <div className="premium-card">
                  <div className="premium-title">AJAN-DA Premium</div>
                  <div className="premium-features">
                    {["Sınırsız ajanda","AI özet & analiz","Google Takvim sync","PDF & JSON yedekleme","Gelişmiş istatistikler","Şablon marketi"].map(f => (
                      <div key={f} className="premium-feature">✓ {f}</div>
                    ))}
                  </div>
                  <div className="premium-plans">
                    <button className="premium-plan-btn" onClick={() => openHavale("monthly")}>
                      <div className="pplan-period">Aylık</div>
                      <div className="pplan-price">₺99</div>
                    </button>
                    <button className="premium-plan-btn featured" onClick={() => openHavale("yearly")}>
                      <div className="pplan-badge">%30 İndirim</div>
                      <div className="pplan-period">Yıllık</div>
                      <div className="pplan-price">₺830</div>
                    </button>
                  </div>
                </div>
              )}
            </div>


            {/* Tema Rengi */}
            <div className="settings-section">
              <div className="settings-title">Tema Rengi</div>
              <div className="settings-hint" style={{marginBottom:8}}>Kapak ve arayüz rengini değiştir</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {["#8b2500","#1a5c3a","#1a3a6b","#6b1a5c","#4a3728","#2d2d2d","#c4956a","#e85d5d","#5d8de8","#edbc73","#6ec87a","#dfe7e9"].map(c => (
                  <button key={c} onClick={() => { setAppThemeColor(c); localStorage.setItem("ajan_app_theme", c); }}
                    style={{
                      width:36, height:36, borderRadius:"50%", background:c,
                      border: (appThemeColor || current.theme_color) === c ? "3px solid var(--text)" : "2px solid var(--border)",
                      cursor:"pointer", transition:"all 0.2s",
                      boxShadow: (appThemeColor || current.theme_color) === c ? "0 0 0 2px var(--accent-glow)" : "none"
                    }} />
                ))}
              </div>
              {appThemeColor && (
                <button className="settings-action-btn" style={{marginTop:8}}
                  onClick={() => { setAppThemeColor(""); localStorage.removeItem("ajan_app_theme"); }}>
                  ↩ Varsayılan Renge Dön
                </button>
              )}
            </div>

            {/* Dışa Aktar */}
            <div className="settings-section">
              <div className="settings-title">Dışa Aktar</div>
              <button className="settings-action-btn" onClick={exportPDF} disabled={exportLoading}>
                {exportLoading ? "⏳ PDF oluşturuluyor..." : "📄 PDF Olarak İndir"}
              </button>
              <button className="settings-action-btn" onClick={exportJSON} style={{marginTop:6}}>
                💾 JSON Yedekleme
              </button>
            </div>

            {/* Profil */}
<div className="settings-section">
  <div className="settings-title">Profil</div>
  <div className="settings-row clickable" onClick={() => { loadProfile(); setShowProfile(true); }}>
    <span>👤 Profili Düzenle</span>
    <span>→</span>
  </div>
  {loggedUsername && (
    <div style={{fontSize:12, color:"var(--warm)", padding:"4px 0"}}>@{loggedUsername}</div>
  )}
</div>

{/* Bildirimler */}
<div className="settings-section">
  <div className="settings-title">Bildirimler</div>
  <div className="settings-row">
    <span>Günlük Hatırlatıcı</span>
    <button className={`toggle-btn ${pushEnabled?"on":""}`}
      onClick={pushEnabled ? () => setPushEnabled(false) : enablePushNotifications}>
      <div className="toggle-knob" />
    </button>
  </div>
  {pushEnabled && (
    <div className="settings-row" style={{flexDirection:"column", alignItems:"flex-start", gap:6}}>
      <div style={{fontSize:11, color:"var(--warm)"}}>Bildirim Saati</div>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <select style={{padding:"6px 10px", borderRadius:6, border:"1px solid var(--border)", fontFamily:"'Montserrat',sans-serif", fontSize:13, background:"white"}}
          value={notifHour} onChange={e => saveNotifTime(parseInt(e.target.value), notifMinute)}>
          {Array.from({length:18}, (_,i) => i+6).map(h => (
            <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>
          ))}
        </select>
        <span style={{fontSize:12, color:"var(--warm)"}}>her gün</span>
      </div>
    </div>
  )}
  <div className="settings-hint">Her gün ajanda yazmadığında hatırlatır</div>
</div>

            {/* Ajanda */}
            {/* Hesap */}
<div className="settings-section">
  <div className="settings-title">Hesap</div>

  {/* E-posta */}
  <div style={{padding:"8px 0"}}>
    <div style={{fontSize:11, color:"var(--warm)", marginBottom:6}}>E-posta (haftalık özet için)</div>
    <EmailSaver serialNo={current.serial_no} api={API} />
  </div>
<div className="settings-row clickable" onClick={() => setShowAddJournal(true)}>
  <span>📒 Yeni Ajanda Ekle</span>
  <span>+</span>
</div>
  <div className="settings-row clickable" onClick={() => { loadStreak(current.serial_no); loadYearlyReport(current.serial_no); }}>
    <span>Verileri Yenile</span>
    <span>🔄</span>
  </div>
  <div className="settings-row clickable" onClick={() => { saveCurrent(null); setActiveTab("pages"); setShowLibrary(true); }}>
  <span style={{color:"#e74c3c"}}>Çıkış Yap</span>
    <span>↩</span>
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
        <button className="back-btn" onClick={() => { setStep("home"); setAuthMode("landing"); }}>← Geri</button>
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

  // Current varsa ama showLibrary true ise kütüphane göster (return null yapma)
  if (current && step !== "dashboard" && !showLibrary) {
    setStep("dashboard");
  }

  return (
    <div className="app-landing">

      {/* NAV */}
      <nav className="al-nav">
        <div className="al-nav-logo">AJAN<span>-DA</span></div>
        <div className="al-nav-links">
          <a href="#ozellikler">Özellikler</a>
          <a href="#temalar">Temalar</a>
          <a href="#fiyatlar">Fiyatlar</a>
          {current
            ? <button className="al-nav-cta" onClick={() => setStep("dashboard")}>Panele Gir →</button>
            : loggedUsername 
  ? <button className="al-nav-cta" onClick={() => setShowLibrary(true)}>Panele Gir →</button>
  : <button className="al-nav-cta" onClick={() => setAuthMode("login")}>Giriş Yap →</button>
          }
        </div>
      </nav>

      {/* HERO */}
      <section className="al-hero">
        <div className="al-hero-bg" />
        <div className="al-hero-texture" />
        <div className="al-hero-content">
          <div className="al-badge">✦ Yeni Nesil Ajanda Deneyimi</div>
          <h1 className="al-h1">Kağıt ajandanı<br/><span>dijitalleştir</span></h1>
          <p className="al-p">Kağıda yazdıklarını dijitale taşı. QR kodlu ajandanı fotoğrafla, notlarına her yerden eriş. AI ile analiz et.</p>
          {current ? (
  <div className="al-btns">
    <button className="al-btn-primary" onClick={() => setStep("dashboard")}>
      📖 Panele Gir →
    </button>
    <button className="al-btn-secondary" onClick={() => { saveCurrent(null); setShowLibrary(true); }}>
      Ajandalarım
    </button>
  </div>
) : loggedUsername && journals.length > 0 ? (
  <div className="al-btns">
    <button className="al-btn-primary" onClick={() => setShowLibrary(true)}>
      📚 Ajandalarıma Git →
    </button>
    <button className="al-btn-secondary" onClick={() => { localStorage.clear(); setLoggedUsername(""); setAuthMode("login"); }}>
      Farklı Hesapla Giriş
    </button>
  </div>
) : (
  <div className="al-btns">
    <button className="al-btn-primary" onClick={() => setAuthMode("login")}>
      Giriş Yap →
    </button>
    <button className="al-btn-secondary" onClick={() => setAuthMode("register")}>
      📒 Yeni Ajanda Tanımla
    </button>
  </div>
)} 
          {!current && journals.length > 0 && (
            <div className="al-saved">
              <div className="al-saved-label">Kayıtlı ajandalarım</div>
              {journals.map(j => (
                <button key={j.serial_no} className="al-saved-item" onClick={() => handleLogin(j)}>
                  <span className="al-saved-dot" style={{background: j.theme_color}} />
                  <span>{j.username || j.theme_name} · №{j.serial_no}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          )}
          {error && <div className="error-msg" style={{marginTop:12}}>{error}</div>}
        </div>
        <div className="al-hero-visual">
          <div className="al-mockup">
            <div className="al-mockup-spine" />
            <div className="al-mockup-content">
              <div className="al-mockup-logo">AJAN-DA</div>
              <div className="al-mockup-sub">Kişisel Ajanda · 2025</div>
              <div className="al-mockup-divider" />
              <div className="al-mockup-pages">
                {Array.from({length:8}).map((_,i) => <div key={i} className="al-mockup-line" />)}
              </div>
            </div>
            <div className="al-mockup-qr">📱</div>
            <div className="al-scan-ring" />
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section className="al-section al-features" id="ozellikler">
        <div className="al-tag">✦ Özellikler</div>
        <h2 className="al-section-title">Her şey bir arada</h2>
        <p className="al-section-sub">Ajandanı daha akıllı kullanmak için ihtiyacın olan her şey</p>
        <div className="al-features-grid">
          {[
            {icon:"📸", title:"Fotoğraf ile Kaydet", desc:"Sayfayı fotoğrafla, QR kod otomatik okunur. OCR ile el yazın metne dönüşür."},
            {icon:"🤖", title:"AI Analiz", desc:"Ajandanı AI ile analiz et. Alışkanlıklarını bul, haftalık özetler al."},
            {icon:"📖", title:"Flip Book Arayüzü", desc:"Gerçek bir ajanda gibi sayfa çevir. Arama yap, yer imi koy."},
            {icon:"📊", title:"İstatistikler", desc:"Streak takibi, yıllık heatmap, en çok kullandığın şablonlar."},
            {icon:"👥", title:"Arkadaş Sistemi", desc:"Ajandanı arkadaşlarınla paylaş, birbirinin sayfalarını gör."},
            {icon:"🔒", title:"Güvenli & Özel", desc:"PIN korumalı. İstediğin zaman PDF veya JSON olarak indir."},
          ].map(f => (
            <div key={f.title} className="al-feature-card">
              <div className="al-feature-icon">{f.icon}</div>
              <div className="al-feature-title">{f.title}</div>
              <div className="al-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="al-section al-how" id="nasil-calisir">
        <div className="al-tag">✦ Nasıl Çalışır?</div>
        <h2 className="al-section-title">3 adımda başla</h2>
        <div className="al-steps">
          {[
            {n:"1", title:"Ajandanı Al", desc:"QR kodlu AJAN-DA ajandalarından birini seç."},
            {n:"2", title:"Kapağı Okut", desc:"Uygulamayı aç, kapak QR'ını okut ve sisteme ekle."},
            {n:"3", title:"Sayfaları Fotoğrafla", desc:"Doldurduğun sayfaları fotoğrafla, otomatik kaydedilir."},
            {n:"✦", title:"Keyfini Çıkar", desc:"Notlarını ara, AI ile analiz et, paylaş."},
          ].map(s => (
            <div key={s.n} className="al-step">
              <div className="al-step-num">{s.n}</div>
              <div className="al-step-title">{s.title}</div>
              <div className="al-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TEMALAR */}
      <section className="al-section al-themes" id="temalar">
        <div className="al-tag">✦ Temalar</div>
        <h2 className="al-section-title">Kişiliğine uygun ajanda</h2>
        <p className="al-section-sub">Her tema farklı sayfa tasarımları ve renk paleti ile gelir</p>
        <div className="al-themes-grid">
          {[
            {name:"Ferdi", pages:479, color:"#8b2500"},
{name:"Manifest", pages:430, color:"#2d4a3e"},
{name:"Günlük", pages:433, color:"#5c6bc0"},
{name:"Takip", pages:203, color:"#c62828"},
{name:"Mini", pages:141, color:"#f57c00"},
{name:"Cici Kuş", pages:398, color:"#c2185b"},
{name:"Nokta", pages:254, color:"#1a237e"},
{name:"Öğrenci", pages:344, color:"#00695c"},
{name:"İş", pages:372, color:"#37474f"},
{name:"Wellness", pages:250, color:"#558b2f"},
          ].map(t => (
            <div key={t.name} className="al-theme-book" style={{background: t.color}}>
              <div className="al-theme-spine" />
              <div className="al-theme-content">
                <div className="al-theme-name">{t.name}</div>
                <div className="al-theme-pages">{t.pages} sayfa</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FİYATLAR */}
      <section className="al-section al-pricing" id="fiyatlar">
        <div className="al-tag">✦ Fiyatlar</div>
        <h2 className="al-section-title">Basit ve şeffaf</h2>
        <div className="al-pricing-grid">
          <div className="al-pricing-card">
            <div className="al-pricing-name">Ücretsiz</div>
            <div className="al-pricing-price">₺0</div>
            <div className="al-pricing-period">sonsuza kadar</div>
            {["1 ajanda","Fotoğraf yükleme","OCR metin okuma","Temel arama","Flip book arayüzü"].map(f => (
              <div key={f} className="al-pricing-feature">✓ {f}</div>
            ))}
            <button className="al-pricing-btn al-pricing-outline" onClick={() => setAuthMode("register")}>Başla →</button>
          </div>
          <div className="al-pricing-card al-pricing-featured">
            <div className="al-pricing-badge">En Popüler</div>
            <div className="al-pricing-name">Premium</div>
            <div className="al-pricing-price">₺99<span>/ay</span></div>
            <div className="al-pricing-period">veya ₺830/yıl (%30 indirim)</div>
            {["Sınırsız ajanda","AI özet & analiz","PDF & JSON yedekleme","Gelişmiş istatistikler","Arkadaş sistemi"].map(f => (
              <div key={f} className="al-pricing-feature">✓ {f}</div>
            ))}
            <button className="al-pricing-btn al-pricing-solid" onClick={() => setAuthMode("register")}>Premium'a Geç →</button>
          </div>
        </div>
        <p className="al-pricing-note">💳 Havale ile ödeme · 7 gün iade garantisi</p>
      </section>

      {/* SSS */}
      <section className="al-section al-faq">
        <div className="al-tag">✦ Sıkça Sorulan Sorular</div>
        <h2 className="al-section-title">Aklındaki sorular</h2>
        <div className="al-faq-list">
          {[
            {q:"Ajandalar nereden temin edilir?", a:"AJAN-DA ajandaları özel QR kodlarla üretilmektedir. Sipariş için bizimle iletişime geçebilirsiniz."},
            {q:"Mevcut ajandamı kullanabilir miyim?", a:"QR sticker yapıştırarak mevcut ajandanızı da sisteme ekleyebilirsiniz."},
            {q:"Fotoğraflarım güvende mi?", a:"Tüm verileriniz PIN korumalıdır. İstediğiniz zaman PDF veya JSON olarak indirebilirsiniz."},
            {q:"Ödeme nasıl yapılır?", a:"Havale/EFT ile ödeme kabul edilir. 24 saat içinde premium aktive edilir."},
          ].map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="al-cta">
        <div className="al-cta-bg" />
        <div className="al-cta-content">
          <h2 className="al-cta-title">Ajandanı dijitalleştir</h2>
          <p className="al-cta-sub">Ücretsiz başla, istediğin zaman premium'a geç.</p>
          <button className="al-btn-primary" onClick={() => setAuthMode("register")}>Hemen Başla →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="al-footer">
        <div className="al-footer-logo">AJAN-DA</div>
        <div className="al-footer-links">
          <a href="#">Gizlilik</a>
          <a href="#">Koşullar</a>
          <a href="mailto:info@sociozk.com">İletişim</a>
        </div>
        <div className="al-footer-copy">© 2025 AJAN-DA</div>
      </footer>

      <button className="admin-access-btn" onClick={() => setShowAdmin(true)}>⚙️</button>
    </div>
  );
}
function EmailSaver({ serialNo, api }) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!email || !email.includes("@")) { alert("Geçerli e-posta girin"); return; }
    setLoading(true);
    try {
      await fetch(`${api}/email/welcome/${serialNo}`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email })
      });
      setSaved(true);
    } catch { alert("Hata"); }
    setLoading(false);
  };

  if (saved) return (
    <div style={{fontSize:12, color:"var(--green)"}}>✓ {email} kaydedildi</div>
  );

  return (
    <div style={{display:"flex", gap:6}}>
      <input
        style={{flex:1, padding:"8px 10px", border:"1px solid var(--border)",
          borderRadius:6, fontFamily:"'Montserrat',sans-serif", fontSize:13, outline:"none"}}
        placeholder="ornek@email.com"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && save()}
      />
      <button
        style={{padding:"8px 14px", background:"var(--tc,#8b2500)", color:"var(--text)",
          border:"none", borderRadius:6, fontFamily:"'Montserrat',sans-serif", fontSize:13, cursor:"pointer"}}
        onClick={save} disabled={loading}>
        {loading ? "⏳" : "Kaydet"}
      </button>
    </div>
  );
}
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`al-faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="al-faq-q">{q}<span className="al-faq-arrow">{open ? "↑" : "↓"}</span></div>
      {open && <div className="al-faq-a">{a}</div>}
    </div>
  );
}

// ─── STİLLER ─────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f8f5f0;
    --surface: #ffffff;
    --surface2: #f0ece5;
    --surface3: #dfe7e9;
    --card: #ffffff;
    --border: rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.12);
    --text: #1c1410;
    --text2: rgba(28,20,16,0.6);
    --text3: rgba(28,20,16,0.35);
    --accent: #edbc73;
    --accent2: #d4a050;
    --accent-glow: rgba(237,188,115,0.15);
    --green: #6ec87a;
    --red: #e85d5d;
    --cream: #f5f2ed;
    --paper: #faf8f5;
    --ink: #1c1410;
    --warm: #8a7e72;
    --soft: #f0ece5;
    --linen: #e8e0d0;
    --tc: #8b2500;
    --radius: 14px;
    --radius-sm: 8px;
    --radius-xs: 6px;
    --shadow: 0 4px 24px rgba(0,0,0,0.06);
    --shadow-lg: 0 12px 48px rgba(0,0,0,0.1);
  }

  body {
    font-family: 'Montserrat', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
  @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes scanPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.4} }
  @keyframes thumbPulse { 0%{transform:translateY(0) scale(1);} 50%{transform:translateY(-4px) scale(1.05);} 100%{transform:translateY(-2px) scale(1);} }

  /* ═══════════════════════════════════════════════════════
     LIGHTBOX
     ═══════════════════════════════════════════════════════ */
  .lightbox-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(16px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
    cursor: zoom-out;
  }
  .lightbox-close {
    position: absolute; top: 16px; right: 16px;
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    color: white; font-size: 18px;
    cursor: pointer; z-index: 10;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .lightbox-close:hover { background: rgba(255,255,255,0.2); }
  .lightbox-img {
    max-width: 95vw; max-height: 90vh;
    object-fit: contain;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    cursor: default;
    animation: scaleIn 0.3s ease;
  }

  /* ═══════════════════════════════════════════════════════
     APP LANDING PAGE
     ═══════════════════════════════════════════════════════ */
  .app-landing { min-height:100vh; background:#f8f5f0; overflow-x:hidden; color:#1c1410; }

  .al-nav { position:sticky; top:0; z-index:100; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; background:rgba(248,245,240,0.95); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); }
  .al-nav-logo { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:400; color:var(--accent); letter-spacing:2px; }
  .al-nav-logo span { color:var(--text3); }
  .al-nav-links { display:flex; align-items:center; gap:16px; }
  .al-nav-links a { font-size:14px; color:var(--text2); text-decoration:none; letter-spacing:0.5px; }
  .al-nav-cta { padding:12px 24px; background:var(--accent); color:var(--bg); border:none; border-radius:var(--radius-sm); font-family:'Montserrat',sans-serif; font-size:15px; font-weight:600; cursor:pointer; white-space:nowrap; }

  .al-hero { min-height:100vh; display:flex; align-items:center; justify-content:space-between; padding:60px 20px 40px; position:relative; overflow:hidden; gap:20px; }
  .al-hero-bg { position:absolute; inset:0; background:linear-gradient(145deg,#f8f5f0 0%,#f0ece5 40%,#f8f5f0 100%); }
  .al-hero-texture { position:absolute; inset:0; background-image:radial-gradient(circle at 20% 30%, rgba(237,188,115,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(223,231,233,0.15) 0%, transparent 50%); pointer-events:none; }
  .al-hero-content { position:relative; z-index:2; flex:1; display:flex; flex-direction:column; gap:16px; }
  .al-badge { display:inline-block; padding:8px 18px; background:var(--accent-glow); border:1px solid rgba(237,188,115,0.3); border-radius:24px; font-size:13px; letter-spacing:2px; text-transform:uppercase; color:var(--accent); align-self:flex-start; font-weight:600; }
  .al-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,8vw,56px); font-weight:400; line-height:1.1; color:var(--text); }
  .al-h1 span { color:#edbc73; font-style:italic; }
  .al-p { font-size:16px; line-height:1.8; color:var(--text2); max-width:360px; }
  .al-btns { display:flex; gap:10px; flex-wrap:wrap; }
  .al-btn-primary { padding:16px 36px; background:var(--accent); color:var(--bg); border:none; border-radius:var(--radius-sm); font-family:'Montserrat',sans-serif; font-size:16px; font-weight:600; cursor:pointer; letter-spacing:0.5px; transition:all 0.2s; text-decoration:none; display:inline-block; }
  .al-btn-primary:hover { background:var(--accent2); transform:translateY(-1px); }
  .al-btn-secondary { padding:16px 36px; border:1px solid var(--border2); color:var(--text2); border-radius:var(--radius-sm); font-size:16px; text-decoration:none; transition:all 0.2s; }
  .al-btn-secondary:hover { border-color:var(--accent); color:var(--accent); }
  .al-saved { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
  .al-saved-label { font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--text3); font-weight:600; }
  .al-saved-item { display:flex; align-items:center; gap:10px; padding:14px 18px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer; font-family:'Montserrat',sans-serif; font-size:15px; color:var(--text); text-align:left; transition:all 0.2s; }
  .al-saved-item:hover { background:var(--surface2); border-color:var(--accent); transform:translateX(4px); }
  .al-saved-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }

  .al-hero-visual { position:relative; z-index:2; flex-shrink:0; }
  .al-mockup { width:110px; height:160px; position:relative; filter:drop-shadow(0 16px 40px rgba(0,0,0,0.5)); }
  .al-mockup-spine { position:absolute; left:0; top:0; bottom:0; width:12px; background:rgba(0,0,0,0.3); border-radius:3px 0 0 3px; }
  .al-mockup-content { position:absolute; left:12px; top:0; right:0; bottom:0; background:var(--accent); border-radius:0 6px 6px 0; overflow:hidden; padding:12px 8px; display:flex; flex-direction:column; gap:4px; }
  .al-mockup-content::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.1), transparent); }
  .al-mockup-logo { font-family:'Cormorant Garamond',serif; font-size:10px; color:rgba(255,255,255,0.95); letter-spacing:2px; position:relative; z-index:1; }
  .al-mockup-sub { font-size:6px; letter-spacing:1px; color:rgba(255,255,255,0.4); text-transform:uppercase; position:relative; z-index:1; }
  .al-mockup-divider { height:1px; background:rgba(255,255,255,0.2); margin:4px 0; position:relative; z-index:1; }
  .al-mockup-pages { display:flex; flex-direction:column; gap:5px; flex:1; position:relative; z-index:1; }
  .al-mockup-line { height:1px; background:rgba(255,255,255,0.12); }
  .al-mockup-qr { position:absolute; bottom:8px; right:8px; width:24px; height:24px; background:white; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:12px; z-index:2; }
  .al-scan-ring { position:absolute; bottom:4px; right:4px; width:32px; height:32px; border-radius:5px; border:2px solid var(--accent); animation:scanPulse 2s ease-in-out infinite; z-index:3; }

  .al-section { padding:70px 20px; }
  .al-tag { font-size:13px; letter-spacing:3px; text-transform:uppercase; color:var(--accent); margin-bottom:10px; font-weight:600; }
  .al-section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(26px,5vw,40px); font-weight:400; margin-bottom:12px; line-height:1.2; }
  .al-section-sub { font-size:16px; color:var(--text2); line-height:1.8; margin-bottom:40px; }

  .al-features { background:#f8f5f0; }
  .al-features-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .al-feature-card { padding:24px; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border); transition:all 0.25s; }
  .al-feature-card:hover { transform:translateY(-3px); box-shadow:0 8px 32px rgba(0,0,0,0.08); border-color:var(--accent); }
  .al-feature-icon { font-size:36px; margin-bottom:12px; }
  .al-feature-title { font-size:16px; font-weight:600; margin-bottom:8px; color:var(--text); }
  .al-feature-desc { font-size:14px; color:var(--text2); line-height:1.7; }

  .al-how { background:#dfe7e9; }
  .al-steps { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-top:32px; }
  .al-step { text-align:center; }
  .al-step-num { width:56px; height:56px; border-radius:50%; background:var(--accent); color:var(--bg); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:24px; margin:0 auto 12px; }
  .al-step-title { font-size:16px; font-weight:600; margin-bottom:8px; color:var(--text); }
  .al-step-desc { font-size:14px; color:var(--text2); line-height:1.7; }

  .al-themes { background:#f8f5f0; }
  .al-themes-grid { display:flex; gap:10px; overflow-x:auto; padding:4px 0 16px; margin-top:32px; scroll-snap-type:x mandatory; }
  .al-themes-grid::-webkit-scrollbar { display:none; }
  .al-theme-book { width:80px; height:130px; border-radius:3px var(--radius-xs) var(--radius-xs) 3px; flex-shrink:0; scroll-snap-align:center; position:relative; transition:all 0.25s; box-shadow:var(--shadow); cursor:pointer; }
  .al-theme-book:hover { transform:translateY(-8px); box-shadow:var(--shadow-lg); }
  .al-theme-spine { position:absolute; left:0; top:0; bottom:0; width:8px; background:rgba(0,0,0,0.25); border-radius:3px 0 0 3px; }
  .al-theme-content { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; }
  .al-theme-name { font-size:9px; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.95); writing-mode:vertical-rl; transform:rotate(180deg); font-weight:700; }
  .al-theme-pages { font-size:6px; color:rgba(255,255,255,0.4); }

  .al-pricing { background:#dfe7e9; }
  .al-pricing-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:32px; }
  .al-pricing-card { padding:28px; border-radius:var(--radius); border:1px solid var(--border); display:flex; flex-direction:column; gap:8px; background:var(--card); }
  .al-pricing-featured { background:linear-gradient(145deg,#faf8f5,#f0ece5); border-color:var(--accent); }
  .al-pricing-badge { display:inline-block; padding:5px 14px; background:var(--accent); border-radius:12px; font-size:11px; color:var(--bg); align-self:flex-start; font-weight:700; }
  .al-pricing-name { font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--text2); }
  .al-pricing-price { font-family:'Cormorant Garamond',serif; font-size:42px; line-height:1; color:var(--text); }
  .al-pricing-price span { font-size:14px; font-family:'Montserrat',sans-serif; font-weight:400; }
  .al-pricing-period { font-size:12px; color:var(--text3); }
  .al-pricing-featured .al-pricing-period { color:var(--text3); }
  .al-pricing-feature { font-size:14px; color:var(--text2); }
  .al-pricing-featured .al-pricing-feature { color:var(--text2); }
  .al-pricing-feature::before { content:"✓ "; color:var(--accent); font-weight:700; }
  .al-pricing-btn { width:100%; padding:14px; border-radius:var(--radius-sm); font-family:'Montserrat',sans-serif; font-size:15px; font-weight:600; cursor:pointer; border:none; margin-top:8px; transition:all 0.2s; }
  .al-pricing-outline { background:var(--surface2); border:1px solid var(--border); color:var(--text); }
  .al-pricing-solid { background:var(--accent); color:var(--bg); }
  .al-pricing-note { font-size:13px; color:var(--text3); margin-top:12px; }

  .al-faq { background:#f8f5f0; }
  .al-faq-list { display:flex; flex-direction:column; margin-top:24px; }
  .al-faq-item { border-bottom:1px solid var(--border); padding:20px 0; cursor:pointer; }
  .al-faq-q { font-size:17px; font-weight:500; display:flex; justify-content:space-between; align-items:center; gap:8px; }
  .al-faq-arrow { color:var(--accent); font-size:16px; flex-shrink:0; }
  .al-faq-a { font-size:15px; color:var(--text2); line-height:1.8; margin-top:12px; }

  .al-cta { padding:70px 20px; position:relative; overflow:hidden; text-align:center; }
  .al-cta-bg { position:absolute; inset:0; background:linear-gradient(145deg,#edbc73 0%,#d4a050 100%); }
  .al-cta-content { position:relative; z-index:1; }
  .al-cta-title { font-family:'Cormorant Garamond',serif; font-size:clamp(26px,6vw,44px); color:var(--text); margin-bottom:12px; }
  .al-cta-sub { font-size:17px; color:var(--text2); margin-bottom:24px; }

  .al-footer { background:var(--surface); color:var(--text3); padding:28px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-top:1px solid var(--border); }
  .al-footer-logo { font-family:'Cormorant Garamond',serif; font-size:22px; color:var(--accent); letter-spacing:2px; }
  .al-footer-links { display:flex; gap:16px; }
  .al-footer-links a { font-size:14px; color:var(--text3); text-decoration:none; }
  .al-footer-copy { font-size:12px; }

  /* ═══════════════════════════════════════════════════════
     LANDING HOME (Ana ekran)
     ═══════════════════════════════════════════════════════ */
  .landing-home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8f5f0;
    position: relative;
  }

  .lh-hero {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 60px 24px 32px;
    position: relative;
    min-height: 100vh;
    overflow: hidden;
  }

  .lh-hero-bg {
    position: absolute; inset: 0;
    background: linear-gradient(145deg, #f8f5f0 0%, #f0ece5 50%, #f8f5f0 100%);
  }
  .lh-hero-texture {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle at 25% 35%, rgba(237,188,115,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 65%, rgba(223,231,233,0.12) 0%, transparent 50%);
    pointer-events: none;
  }

  .lh-hero-content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    gap: 14px;
    max-width: 320px;
    flex: 1;
  }

  .lh-badge {
    display: inline-block;
    padding: 5px 14px;
    background: var(--accent-glow);
    border: 1px solid rgba(237,188,115,0.3);
    border-radius: 24px;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--accent);
    align-self: flex-start;
    font-weight: 600;
  }

  .lh-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 400;
    color: white;
    letter-spacing: 3px;
    line-height: 1;
  }
  .lh-logo span { color: var(--accent); }

  .lh-tagline {
    font-size: 16px;
    color: var(--text2);
    letter-spacing: 1px;
    margin-top: -8px;
  }

  .lh-desc {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text3);
    max-width: 340px;
  }

  .lh-journals { display: flex; flex-direction: column; gap: 8px; }
  .lh-journals-label {
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text3);
    font-weight: 600;
  }
  .lh-journals-list { display: flex; flex-direction: column; gap: 6px; }
  .lh-journal-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: 'Montserrat', sans-serif;
    text-align: left;
    transition: all 0.25s;
    animation: fadeIn 0.3s ease var(--delay, 0s) both;
  }
  .lh-journal-btn:hover {
    background: var(--surface2);
    border-color: var(--accent);
    transform: translateX(4px);
  }
  .lhj-color {
    width: 6px; height: 36px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .lhj-info { flex: 1; }
  .lhj-name { font-size: 16px; font-weight: 500; color: white; }
  .lhj-serial { font-size: 12px; color: var(--text3); margin-top: 2px; font-variant-numeric: tabular-nums; }
  .lhj-arrow { color: var(--text3); font-size: 16px; }

  .lh-cta {
    display: flex; align-items: center; justify-content: center;
    gap: 8px;
    padding: 18px 32px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Montserrat', sans-serif;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.25s;
    align-self: stretch;
  }
  .lh-cta:hover { background: var(--accent2); transform:translateY(-1px); }
  .lh-loading { color: var(--text3); font-size: 20px; text-align: center; }

  .lh-mockup {
    position: relative; z-index: 2;
    display: flex; align-items: center; justify-content: center;
    padding-left: 20px;
  }
  .lh-book {
    width: 120px; height: 180px;
    position: relative;
    filter: drop-shadow(0 20px 48px rgba(0,0,0,0.6));
  }
  .lh-book-spine { position:absolute; left:0; top:0; bottom:0; width:14px; background:rgba(0,0,0,0.4); border-radius:3px 0 0 3px; }
  .lh-book-cover { position:absolute; left:14px; top:0; right:0; bottom:0; background:var(--accent); border-radius:0 8px 8px 0; overflow:hidden; display:flex; flex-direction:column; padding:14px 10px 10px; gap:6px; }
  .lh-book-cover::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.12), transparent); }
  .lh-book-logo { font-family:'Cormorant Garamond',serif; font-size:11px; color:rgba(255,255,255,0.95); letter-spacing:2px; position:relative; z-index:1; }
  .lh-book-lines { display:flex; flex-direction:column; gap:5px; flex:1; position:relative; z-index:1; }
  .lh-book-line { height:1px; background:rgba(255,255,255,0.15); }
  .lh-book-qr { position:absolute; bottom:10px; right:10px; width:28px; height:28px; background:white; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:14px; z-index:2; }
  .lh-book-pulse { position:absolute; bottom:6px; right:6px; width:36px; height:36px; border-radius:6px; border:2px solid var(--accent2); animation:scanPulse 2s ease-in-out infinite; z-index:3; }

  .lh-features {
    display: flex; gap: 8px; padding: 14px 16px;
    background: var(--surface);
    overflow-x: auto; flex-shrink: 0;
    border-top: 1px solid var(--border);
  }
  .lh-features::-webkit-scrollbar { display: none; }
  .lh-feature-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 24px;
    white-space: nowrap;
    font-size: 14px; font-weight: 500;
    color: var(--text2);
    flex-shrink: 0;
  }

  /* ═══════════════════════════════════════════════════════
     HOME SHELF
     ═══════════════════════════════════════════════════════ */
  .home-shelf {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    background: var(--bg);
  }

  .shelf-header {
    width: 100%; padding: 48px 24px 32px;
    text-align: center;
    background: linear-gradient(180deg, #f0ece5 0%, var(--bg) 100%);
    position: relative; overflow: hidden;
  }
  .shelf-header::after { content:''; position:absolute; inset:0; background-image:radial-gradient(circle at 50% 0%, rgba(237,188,115,0.1), transparent 60%); pointer-events:none; }

  .shelf-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px;
    color: var(--accent);
    letter-spacing: 4px;
    position: relative; z-index: 1;
  }
  .shelf-logo span { color: var(--text); opacity: 0.5; }
  .shelf-tagline { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--text3); margin-top:6px; position:relative; z-index:1; font-weight:500; }

  .shelf-rack {
    width: 100%; max-width: 480px;
    display: flex; align-items: flex-end; gap: 8px;
    padding: 32px 20px 0; position: relative;
    min-height: 200px; flex-wrap: wrap; justify-content: center;
  }

  .shelf-wood {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 16px;
    background: linear-gradient(180deg, #dfe7e9 0%, #f0ece5 100%);
    border-radius: 3px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    border-top: 1px solid var(--border2);
  }
  .shelf-wood::before { display:none; }

  .shelf-book {
    width: 56px; height: 150px;
    border: none; cursor: pointer;
    border-radius: 3px var(--radius-xs) var(--radius-xs) 3px;
    position: relative; margin-bottom: 16px;
    transform-origin: bottom center;
    animation: bookAppear 0.4s ease var(--delay, 0s) both;
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .shelf-book:hover {
    transform: translateY(-14px) rotateZ(-1.5deg);
    box-shadow: 4px 8px 28px rgba(0,0,0,0.35);
    z-index: 10;
  }
  @keyframes bookAppear { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  .shelf-book-spine {
    width: 100%; height: 100%;
    background: var(--bc, var(--accent));
    border-radius: 3px var(--radius-xs) var(--radius-xs) 3px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: space-between;
    padding: 10px 4px; position: relative; overflow: hidden;
  }
  .shelf-book-spine::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.12), transparent); }
  .shelf-book-spine::after { content:''; position:absolute; left:0; top:0; bottom:0; width:6px; background:rgba(0,0,0,0.25); }

  .shelf-book-texture { display: none; }
  .shelf-book-title {
    font-size: 8px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(255,255,255,0.9);
    writing-mode: vertical-rl; text-orientation: mixed;
    transform: rotate(180deg);
    position: relative; z-index: 1;
    max-height: 90px; overflow: hidden;
  }
  .shelf-book-serial { font-size:7px; color:rgba(255,255,255,0.5); position:relative; z-index:1; font-variant-numeric:tabular-nums; }
  .shelf-book-new .shelf-book-spine { background:var(--surface2); border:2px dashed var(--border2); }
  .shelf-book-plus { font-size:22px; color:var(--text3); position:relative; z-index:1; }
  .shelf-book-new .shelf-book-title { color:var(--text3); }
  .shelf-empty { font-size:13px; color:var(--text2); margin-bottom:24px; }
  .shelf-loading { font-size:13px; color:var(--text2); padding:16px; }

  /* ═══════════════════════════════════════════════════════
     JOURNAL APP (Dashboard) — BOX TASARIM
     ═══════════════════════════════════════════════════════ */
  .journal-app {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
  }

  .journal-cover-strip {
    background: var(--tc, var(--accent));
    padding: 0;
    position: relative; overflow: hidden;
    min-height: 100px;
    display: flex; align-items: center;
  }
  .journal-cover-texture {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
    pointer-events: none;
  }

  .journal-cover-content { flex:1; padding:20px; position:relative; z-index:1; }
  .journal-brand { font-family:'Cormorant Garamond',serif; font-size:30px; color:rgba(255,255,255,0.95); letter-spacing:2px; }
  .journal-brand span { opacity:0.5; }
  .journal-theme-name { font-size:14px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.7); margin-top:2px; font-weight:500; }
  .journal-serial { font-family:'Cormorant Garamond',serif; font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px; font-style:italic; }

  .journal-cover-actions { display:flex; flex-direction:column; gap:8px; padding:16px; position:relative; z-index:1; }
  .jc-btn {
    width: 48px; height: 48px;
    border-radius: var(--radius-xs);
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    color: white; font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }
  .jc-btn:hover { background:rgba(255,255,255,0.22); }
  .jc-btn:disabled { opacity:0.5; }

  /* Spiral → Minimal divider */
  .spiral-strip {
    display: none;
  }
  .spiral-ring { display: none; }

  /* ═══════════════════════════════════════════════════════
     FLIPBOOK → BOX GRID
     ═══════════════════════════════════════════════════════ */
  .flipbook-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    scroll-snap-type: none;
    -webkit-overflow-scrolling: touch;
  }
  .flipbook-container::-webkit-scrollbar { width: 3px; }
  .flipbook-container::-webkit-scrollbar-track { background: transparent; }
  .flipbook-container::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 4px; }

  .flipbook-pages {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    width: 100%;
    padding: 0;
  }

  @media (min-width: 500px) {
    .flipbook-pages { grid-template-columns: repeat(4, 1fr); }
  }

  .flip-page {
    width: 100%;
    aspect-ratio: 3/4;
    height: auto;
    background: #fdfcfa;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    animation: scaleIn 0.3s ease var(--delay, 0s) both;
    transition: all 0.25s;
    box-shadow: 2px 3px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.06);
    scroll-snap-align: none;
  }
  .flip-page:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 4px 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(237,188,115,0.15);
    border-color: var(--accent);
    z-index: 5;
  }
  .flip-page:active { transform: scale(0.97); }
  .flip-page.filled { background: var(--card); }
  .flip-page.search-hit { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); }
  @keyframes pageSlideIn {
    from { opacity:0; transform:scale(0.9); }
    to { opacity:1; transform:scale(1); }
  }

  .flip-page-label-bar {
    height: 3px;
    width: 100%;
    flex-shrink: 0;
    border-radius: var(--radius) var(--radius) 0 0;
  }

  .flip-page-margin { display: none; }

  .flip-page-inner {
    flex: 1;
    padding: 10px 8px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
  }

  .flip-page-num {
    position: absolute;
    top: 6px; right: 8px;
    font-size: 11px;
    color: var(--accent);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .flip-page-bm { position:absolute; top:4px; left:6px; font-size:10px; }
  .flip-page-stamp { position:absolute; bottom:4px; right:6px; font-size:12px; }

  .flip-page-photo {
    width: 100%;
    flex: 1;
    border-radius: var(--radius-xs);
    overflow: hidden;
    position: relative;
    margin-top: 2px;
  }
  .flip-page-photo img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .flip-page-filled-badge {
    position: absolute;
    top: 4px; right: 4px;
    width: 16px; height: 16px;
    background: var(--green);
    border-radius: 50%;
    color: white; font-size: 9px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }

  .flip-page-empty-icon {
    font-size: 32px;
    margin-top: 12px;
    opacity: 0.25;
    filter: grayscale(0.3);
  }

  .flip-page-title {
    font-size: 11px;
    color: var(--text2);
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

  .flip-page.empty .flip-page-inner::before { display: none; }

  .journal-footer {
    padding: 12px 16px 16px;
    font-size: 13px;
    color: var(--text3);
    text-align: center;
    letter-spacing: 0.5px;
    border-top: 1px solid var(--border);
  }

  /* ═══════════════════════════════════════════════════════
     TOOLBAR & SEARCH
     ═══════════════════════════════════════════════════════ */
  .journal-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .search-bar { display:flex; align-items:center; gap:6px; flex:1; }
  .search-bar.open { flex-basis:100%; }
  .search-toggle { background:var(--surface2); border:1px solid var(--border); color:var(--text2); width:42px; height:42px; border-radius:var(--radius-xs); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:all 0.2s; }
  .search-toggle:hover { border-color:var(--accent); color:var(--accent); }
  .search-input { flex:1; padding:10px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-xs); color:var(--text); font-family:'Montserrat',sans-serif; font-size:15px; outline:none; transition:border-color 0.2s; }
  .search-input:focus { border-color:var(--accent); }
  .search-input option { background:var(--surface); }
  .search-count { font-size:10px; color:var(--accent); font-weight:600; white-space:nowrap; }

  .filter-tabs { display:flex; gap:4px; }
  .filter-tab {
    padding:8px 16px; border:1px solid var(--border);
    background:var(--surface2); border-radius:var(--radius-xs);
    font-size:14px; color:var(--text2); cursor:pointer;
    font-family:'Montserrat',sans-serif; font-weight:500;
    transition:all 0.2s;
  }
  .filter-tab.active { background:var(--accent); color:var(--bg); border-color:var(--accent); }
  .filter-tab:hover { border-color:var(--accent); }

  /* ═══════════════════════════════════════════════════════
     DETAIL FLIP SCREEN
     ═══════════════════════════════════════════════════════ */
  .screen { min-height:100vh; padding:24px 20px; max-width:480px; margin:0 auto; }

  .detail-flip-screen {
    display: flex; flex-direction: column;
    background: var(--bg);
    min-height: 100vh;
    position: relative;
  }

  .df-header {
    display: flex; align-items: center;
    padding: 12px 16px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }
  .df-back { background:none; border:none; color:var(--text2); font-size:18px; cursor:pointer; padding:4px; transition:color 0.2s; }
  .df-back:hover { color:var(--accent); }
  .df-header-center { flex:1; }
  .df-page-title { font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--text); }
  .df-page-meta { font-size:12px; color:var(--text3); margin-top:2px; display:flex; align-items:center; gap:6px; }
  .df-label-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }

  .df-header-actions { display:flex; gap:6px; }
  .df-action-btn {
    width:42px; height:42px;
    border-radius:var(--radius-xs);
    background:var(--surface2);
    border:1px solid var(--border);
    color:var(--text2); font-size:14px;
    cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all 0.2s;
  }
  .df-action-btn:hover { border-color:var(--accent); color:var(--accent); }
  .df-action-btn.active { background:var(--accent-glow); border-color:var(--accent); }
  .df-photo-btn { background:var(--accent); border-color:var(--accent); color:var(--bg); }

  .df-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow-y: auto;
    gap: 16px;
    perspective: 1200px;
    transform-style: preserve-3d;
  }

  .df-photo-wrap {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    cursor: zoom-in;
    position: relative;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .df-photo-wrap:hover { transform: scale(1.02); box-shadow: var(--shadow-lg); }
  .df-photo-wrap:hover .df-photo-zoom-hint { opacity: 1; }
  .df-photo-zoom-hint {
    position: absolute;
    bottom: 10px; right: 10px;
    padding: 6px 12px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    border-radius: 20px;
    font-size: 11px;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .df-photo {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    display: block;
  }

  .df-empty-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--surface);
    border-radius: var(--radius);
    padding: 32px;
    border: 1px solid var(--border);
    position: relative;
  }
  .df-empty-lines { display:none; }
  .df-empty-line { display:none; }
  .df-empty-hint {
    display: flex; flex-direction: column;
    align-items: center; gap: 12px;
    text-align: center;
    color: var(--text3);
    font-size: 13px;
  }
  .df-empty-icon { font-size: 44px; opacity: 0.3; }
  .df-photo-cta {
    padding: 12px 24px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .df-photo-cta:hover { background:var(--accent2); }

  /* OCR */
  .df-ocr-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 16px;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .df-ocr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .df-ocr-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }
  .df-ocr-ai-btn {
    padding: 7px 14px;
    background: var(--accent-glow);
    border: 1px solid rgba(237,188,115,0.35);
    border-radius: 20px;
    color: var(--accent);
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .df-ocr-ai-btn:hover { background: rgba(237,188,115,0.3); border-color: var(--accent); }
  .df-ocr-ai-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .df-ocr-result {
    background: var(--surface2);
    border: 1px solid rgba(237,188,115,0.15);
    border-radius: var(--radius-sm);
    padding: 14px;
    animation: fadeIn 0.3s ease;
  }
  .df-ocr-result-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .df-ocr-result-text {
    font-size: 13px;
    color: var(--text);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .df-ocr-existing {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px;
  }

  .df-ocr-empty {
    font-size: 12px;
    color: var(--text3);
    text-align: center;
    padding: 12px;
    line-height: 1.7;
  }

  .df-ocr-edit-area {
    width: 100%;
    padding: 12px;
    background: var(--surface);
    border: 1px solid var(--accent);
    border-radius: var(--radius-xs);
    color: var(--text);
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    line-height: 1.8;
    outline: none;
    resize: vertical;
    min-height: 100px;
  }
  .df-ocr-edit-btns {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .df-ocr-save-btn {
    flex: 1;
    padding: 10px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: var(--radius-xs);
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .df-ocr-save-btn:hover { background: var(--accent2); }
  .df-ocr-cancel-btn {
    padding: 10px 16px;
    background: var(--surface);
    color: var(--text2);
    border: 1px solid var(--border);
    border-radius: var(--radius-xs);
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    cursor: pointer;
  }
  .df-ocr-edit-trigger {
    margin-top: 8px;
    padding: 6px 14px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 20px;
    color: var(--text3);
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    align-self: flex-start;
  }
  .df-ocr-edit-trigger:hover { border-color: var(--accent); color: var(--accent); }

  .df-ocr {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 16px;
    border: 1px solid var(--border);
  }
  .df-ocr-label {
    font-size: 12px; font-weight: 600;
    color: var(--accent);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }

  /* Sayfa çevirme okları */
  .df-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px; height: 44px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text2);
    font-size: 20px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
    transition: all 0.2s;
    box-shadow: var(--shadow);
  }
  .df-nav:hover { border-color:var(--accent); color:var(--accent); background:var(--surface2); }
  .df-nav-prev { left: 8px; }
  .df-nav-next { right: 8px; }

  /* Thumbnail strip */
  .df-thumbstrip {
    display: flex;
    gap: 6px;
    padding: 10px 12px;
    overflow-x: auto;
    background: var(--surface);
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }
  .df-thumbstrip::-webkit-scrollbar { display: none; }

  .df-thumb {
    width: 44px; height: 56px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;
    border: 2px solid transparent;
    background: var(--surface2);
    position: relative;
    transition: all 0.15s;
  }
  .df-thumb.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); animation: thumbPulse 0.3s ease; }
  .df-thumb.filled { }
  .df-thumb-img { width:100%; height:100%; object-fit:cover; }
  .df-thumb-empty { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:14px; opacity:0.3; }
  .df-thumb-num { position:absolute; bottom:2px; right:3px; font-size:7px; color:var(--text3); font-weight:600; }
  .df-thumb-bm { position:absolute; top:1px; left:2px; font-size:7px; }

  .flip-anim-right, .flip-anim-left { /* disabled, using new system */ }

  /* ═══════════════════════════════════════════════════════
     DEFTER SAYFA ÇEVİRME
     ═══════════════════════════════════════════════════════ */
  .df-book-area {
    flex: 1;
    position: relative;
    overflow: hidden;
    perspective: 1800px;
  }

  /* Kıvrılan eski sayfa — üstte */
  .df-page-flipping {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: #fdfcfa;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    backface-visibility: hidden;
    box-shadow: -4px 0 16px rgba(0,0,0,0.1);
  }

  .df-page-flipping::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to left, rgba(0,0,0,0.06) 0%, transparent 15%);
    pointer-events: none;
  }

  .df-flip-img {
    max-width: 260px;
    max-height: 340px;
    object-fit: cover;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }

  .df-flip-empty {
    font-size: 48px;
    opacity: 0.3;
  }

  /* Sağa geçiş: sayfa sağ kenarından sola kıvrılır (ileri) */
  .df-flip-right {
    transform-origin: left center;
    animation: bookPageRight 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  /* Sola geçiş: sayfa sol kenarından sağa kıvrılır (geri) */
  .df-flip-left {
    transform-origin: right center;
    animation: bookPageLeft 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  @keyframes bookPageRight {
    0% {
      transform: rotateY(0deg);
      box-shadow: -4px 0 16px rgba(0,0,0,0.1);
    }
    40% {
      transform: rotateY(-55deg) skewY(2deg);
      box-shadow: -12px 0 30px rgba(0,0,0,0.15);
    }
    70% {
      transform: rotateY(-120deg) skewY(1deg);
      box-shadow: -8px 0 20px rgba(0,0,0,0.08);
      opacity: 0.7;
    }
    100% {
      transform: rotateY(-180deg);
      box-shadow: none;
      opacity: 0;
    }
  }

  @keyframes bookPageLeft {
    0% {
      transform: rotateY(0deg);
      box-shadow: 4px 0 16px rgba(0,0,0,0.1);
    }
    40% {
      transform: rotateY(55deg) skewY(-2deg);
      box-shadow: 12px 0 30px rgba(0,0,0,0.15);
    }
    70% {
      transform: rotateY(120deg) skewY(-1deg);
      box-shadow: 8px 0 20px rgba(0,0,0,0.08);
      opacity: 0.7;
    }
    100% {
      transform: rotateY(180deg);
      box-shadow: none;
      opacity: 0;
    }
  }

  /* Yeni sayfa alttan ortaya çıkar */
  .df-page-reveal {
    animation: pageReveal 0.7s ease forwards;
  }

  @keyframes pageReveal {
    0% { opacity: 0.5; transform: scale(0.97); }
    40% { opacity: 0.7; }
    100% { opacity: 1; transform: scale(1); }
  }

  .df-page-flipping::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 20px;
    background: linear-gradient(to right, rgba(0,0,0,0.08), transparent);
    z-index: 1;
    pointer-events: none;
  }
  .df-flip-right::before { left: 0; }
  .df-flip-left::before { right: 0; background: linear-gradient(to left, rgba(0,0,0,0.08), transparent); }

  .flip-anim-right::after, .flip-anim-left::after { display: none; }
  @keyframes shadowFade { 0%, 100% { opacity: 0; } 40%, 60% { opacity: 1; } }

  /* ═══════════════════════════════════════════════════════
     DETAIL SCREEN (eski)
     ═══════════════════════════════════════════════════════ */
  .detail-screen { display:flex; flex-direction:column; gap:16px; background:var(--bg); min-height:100vh; padding:0; }
  .detail-header { display:flex; align-items:center; gap:12px; padding:14px 16px; background:var(--tc, var(--surface)); position:relative; overflow:hidden; }
  .detail-header::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.08), transparent); }
  .detail-header .back-btn { margin-bottom:0; color:rgba(255,255,255,0.8); position:relative; z-index:1; font-size:13px; }
  .detail-title { flex:1; font-family:'Cormorant Garamond',serif; font-size:18px; color:var(--text); position:relative; z-index:1; }
  .detail-page-no { font-size:11px; color:rgba(255,255,255,0.5); font-style:italic; font-family:'Cormorant Garamond',serif; position:relative; z-index:1; }

  .page-photo-container { padding:12px 16px; }
  .page-photo { width:100%; border-radius:var(--radius); box-shadow:var(--shadow); }
  .empty-page-photo { padding:40px; text-align:center; color:var(--text3); font-size:13px; background:var(--surface); border-radius:var(--radius); margin:12px 16px; border:1px solid var(--border); }

  /* ═══════════════════════════════════════════════════════
     TOP NAV TABS
     ═══════════════════════════════════════════════════════ */
  .top-nav {
    display: flex;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .tnav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 12px 4px 10px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-family: 'Montserrat', sans-serif;
    transition: all 0.2s;
  }
  .tnav-btn:hover { background: var(--surface2); }
  .tnav-btn.active { border-bottom-color: var(--accent); background: var(--accent-glow); }
  .tnav-icon { font-size: 20px; transition: transform 0.2s; }
  .tnav-label { font-size: 11px; color: var(--text3); font-weight: 500; letter-spacing: 0.5px; }
  .tnav-btn.active .tnav-icon { transform: scale(1.1); }
  .tnav-btn.active .tnav-label { color: var(--accent); font-weight: 700; }

  .bottom-tabs { display: none; }
  .bottom-tab { display: none; }

  /* ═══════════════════════════════════════════════════════
     TABS CONTENT
     ═══════════════════════════════════════════════════════ */
  .tab-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .stat-card {
    padding: 16px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }
  .stat-card-title { font-size: 11px; color: var(--text3); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .stat-card-value { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: var(--accent); }
  .stat-card-sub { font-size: 11px; color: var(--text3); margin-top: 4px; }

  .streak-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; background:var(--accent-glow); border:1px solid rgba(237,188,115,0.3); border-radius:16px; font-size:11px; color:var(--accent); font-weight:600; }

  /* ═══════════════════════════════════════════════════════
     SETTINGS
     ═══════════════════════════════════════════════════════ */
  .settings-section { margin-bottom: 16px; }
  .settings-title { font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--text); margin-bottom:16px; }
  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: var(--surface);
    border-radius: var(--radius-sm);
    margin-bottom: 6px;
    font-size: 13px;
    border: 1px solid var(--border);
  }
  .settings-label { font-weight: 500; color: var(--text); font-size:15px; }
  .settings-value { color: var(--text2); font-size: 12px; }

  .settings-action-btn {
    width:100%; padding:14px 18px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-sm); font-family:'Montserrat',sans-serif;
    font-size:13px; cursor:pointer; text-align:left;
    color:var(--text); transition:all 0.2s;
    display:flex; align-items:center; gap:10px;
  }
  .settings-action-btn:hover { border-color:var(--accent); background:var(--surface2); }
  .settings-action-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .settings-hint { font-size:11px; color:var(--text3); margin-top:4px; padding:0 2px; }
  .settings-row.clickable { cursor:pointer; }
  .settings-row.clickable:hover { border-color:var(--accent); }

  /* ═══════════════════════════════════════════════════════
     CHAT
     ═══════════════════════════════════════════════════════ */
  .chat-container { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
  .chat-msg {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    line-height: 1.6;
    animation: fadeIn 0.2s ease;
  }
  .chat-msg.user {
    align-self: flex-end;
    background: var(--accent);
    color: var(--bg);
    border-bottom-right-radius: 3px;
  }
  .chat-msg.ai {
    align-self: flex-start;
    background: #f0ece5;
    color: var(--text);
    border: 1px solid var(--border);
    border-bottom-left-radius: 3px;
  }
  .chat-input-bar {
    display: flex; gap: 8px;
    padding: 10px 16px;
    background: var(--surface);
    border-top: 1px solid var(--border);
  }
  .chat-input {
    flex: 1;
    padding: 10px 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    outline: none;
  }
  .chat-input:focus { border-color: var(--accent); }
  .chat-send {
    padding: 10px 20px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .chat-send:hover { background: var(--accent2); }
  .chat-send:disabled { opacity: 0.5; }

  /* ═══════════════════════════════════════════════════════
     AUTH SCREENS
     ═══════════════════════════════════════════════════════ */
  .auth-screen {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
  }
  .auth-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .auth-back {
    background: none; border: none;
    color: var(--text2);
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    cursor: pointer;
  }
  .auth-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; color: var(--accent);
    letter-spacing: 2px;
  }
  .auth-logo span { color: var(--text3); }

  .auth-body {
    flex: 1;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .auth-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; color: var(--text);
  }
  .auth-subtitle { font-size:15px; color:var(--text3); line-height:1.6; margin-top:-8px; }
  .auth-field { display:flex; flex-direction:column; gap:6px; }
  .auth-field label { font-size:11px; font-weight:600; color:var(--text3); letter-spacing:0.5px; text-transform:uppercase; }
  .auth-input {
    padding:12px 14px;
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:var(--radius-sm);
    color:var(--text);
    font-family:'Montserrat',sans-serif;
    font-size:15px; outline:none;
    transition:border-color 0.2s;
  }
  .auth-input:focus { border-color:var(--accent); background:var(--surface2); }
  .auth-input option { background:var(--surface); }
  .auth-hint { font-size:11px; color:var(--text3); display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .auth-qr-btn { padding:6px 12px; background:var(--accent-glow); border:1px solid rgba(237,188,115,0.35); border-radius:var(--radius-xs); color:var(--accent); font-family:'Montserrat',sans-serif; font-size:11px; cursor:pointer; font-weight:600; }
  .auth-btn {
    padding:16px;
    background:var(--accent);
    color:var(--bg); border:none;
    border-radius:var(--radius-sm);
    font-family:'Montserrat',sans-serif;
    font-size:17px; font-weight:600;
    cursor:pointer; letter-spacing:0.5px;
    transition:all 0.2s;
    margin-top:4px;
  }
  .auth-btn:hover:not(:disabled) { background:var(--accent2); }
  .auth-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .auth-switch { background:none; border:none; color:var(--text3); font-family:'Montserrat',sans-serif; font-size:12px; cursor:pointer; text-align:center; padding:8px; transition:color 0.2s; }
  .auth-switch:hover { color:var(--accent); }

  /* ═══════════════════════════════════════════════════════
     ONBOARDING
     ═══════════════════════════════════════════════════════ */
  .onboarding-screen {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 48px;
    position: relative;
  }
  .onboarding-dots { display:flex; gap:8px; }
  .ob-dot { width:8px; height:8px; border-radius:50%; background:var(--surface2); transition:all 0.3s; }
  .ob-dot.active { background:var(--accent); width:24px; border-radius:4px; }
  .onboarding-content { text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; max-width:300px; }
  .ob-icon { font-size:64px; animation:scaleIn 0.4s ease; }
  .ob-title { font-family:'Cormorant Garamond',serif; font-size:28px; color:var(--text); }
  .ob-desc { font-size:16px; color:var(--text2); line-height:1.8; }
  .onboarding-actions { display:flex; flex-direction:column; gap:10px; width:100%; max-width:280px; }
  .ob-btn-primary {
    padding:18px 36px;
    background:var(--accent);
    color:var(--bg); border:none;
    border-radius:var(--radius-sm);
    font-family:'Montserrat',sans-serif;
    font-size:18px; font-weight:600;
    cursor:pointer;
    transition:all 0.2s;
  }
  .ob-btn-primary:hover { background:var(--accent2); }
  .ob-btn-skip { background:none; border:none; color:var(--text3); font-family:'Montserrat',sans-serif; font-size:13px; cursor:pointer; }

  /* ═══════════════════════════════════════════════════════
     OVERLAYS & MODALS
     ═══════════════════════════════════════════════════════ */
  .step-overlay, .overlay-screen {
    position: fixed; inset: 0; z-index: 999;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 16px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(16px);
    color: white;
    animation: fadeIn 0.2s ease;
  }
  .overlay-icon { font-size: 44px; }
  .overlay-title { font-family:'Cormorant Garamond',serif; font-size:20px; }
  .overlay-desc { font-size:13px; color:var(--text2); }
  .spinner { width:32px; height:32px; border:3px solid var(--surface2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  .confirm-overlay {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    animation: fadeIn 0.2s ease;
  }
  .confirm-box {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 28px;
    max-width: 320px;
    text-align: center;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
  }
  .confirm-msg { font-size:14px; color:var(--text); margin-bottom:20px; line-height:1.6; }
  .confirm-btns { display:flex; gap:10px; }
  .confirm-yes {
    flex:1; padding:12px;
    background:var(--accent); color:var(--bg);
    border:none; border-radius:var(--radius-xs);
    font-family:'Montserrat',sans-serif;
    font-size:14px; font-weight:600;
    cursor:pointer;
  }
  .confirm-no {
    flex:1; padding:12px;
    background:var(--surface2); color:var(--text);
    border:1px solid var(--border); border-radius:var(--radius-xs);
    font-family:'Montserrat',sans-serif;
    font-size:14px;
    cursor:pointer;
  }

  .error-msg {
    padding: 10px 14px;
    background: rgba(232,93,93,0.12);
    border: 1px solid rgba(232,93,93,0.25);
    border-radius: var(--radius-xs);
    color: var(--red);
    font-size: 12px;
    animation: fadeIn 0.2s ease;
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--text2);
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 12px;
    transition: color 0.2s;
  }
  .back-btn:hover { color: var(--accent); }

  /* ═══════════════════════════════════════════════════════
     PREMIUM & PAYMENTS
     ═══════════════════════════════════════════════════════ */
  .havale-cancel {
    width:100%; padding:10px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-sm); font-family:'Montserrat',sans-serif;
    font-size:13px; cursor:pointer; color:var(--text2);
  }

  .premium-plans { display:flex; gap:8px; margin-top:12px; }
  .premium-plan-btn {
    flex:1; padding:14px 10px;
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:var(--radius-sm); color:var(--text);
    cursor:pointer; position:relative;
    transition:all 0.2s; font-family:'Montserrat',sans-serif;
  }
  .premium-plan-btn:hover { background:var(--surface2); border-color:var(--accent); }
  .premium-plan-btn.featured { border-color:var(--accent); background:var(--accent-glow); }
  .pplan-period { font-size:11px; color:var(--text3); margin-bottom:2px; }
  .pplan-price { font-family:'Cormorant Garamond',serif; font-size:22px; color:var(--text); }
  .pplan-badge {
    position:absolute; top:-8px; left:50%; transform:translateX(-50%);
    background:var(--accent); color:var(--bg);
    font-size:9px; font-weight:700; padding:3px 8px;
    border-radius:12px; white-space:nowrap;
  }
  .premium-active-card {
    display:flex; align-items:center; gap:14px;
    padding:14px; background:var(--surface);
    border-radius:var(--radius-sm); border:1px solid var(--border);
  }
  .premium-active-icon { font-size:28px; }
  .premium-active-title { font-size:14px; font-weight:600; color:var(--accent); }
  .premium-active-sub { font-size:11px; color:var(--text3); margin-top:2px; }

  /* ═══════════════════════════════════════════════════════
     TEMPLATE STYLES
     ═══════════════════════════════════════════════════════ */
  .tpl-header { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600; padding:10px 14px; background:var(--surface); border-radius:var(--radius-sm); margin-bottom:10px; border:1px solid var(--border); color:var(--text); }
  .tpl-empty-hint { padding:16px; text-align:center; color:var(--text3); font-size:12px; font-style:italic; }

  .tpl-cover {
    background: var(--tc, var(--accent));
    min-height: 240px;
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    gap: 8px;
  }
  .tpl-cover::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.1), transparent); }
  .tpl-cover-title { font-family:'Cormorant Garamond',serif; font-size:24px; color:rgba(255,255,255,0.95); letter-spacing:3px; text-transform:uppercase; position:relative; z-index:1; }
  .tpl-cover-sub { font-size:10px; color:rgba(255,255,255,0.5); letter-spacing:2px; position:relative; z-index:1; }
  .tpl-cover-serial { font-family:'Cormorant Garamond',serif; font-size:12px; color:rgba(255,255,255,0.3); position:relative; z-index:1; font-style:italic; margin-top:8px; }

  .tpl-section { margin-bottom:10px; }
  .tpl-section-title { font-size:12px; font-weight:600; color:var(--accent); letter-spacing:0.5px; padding:6px 0; border-bottom:1px solid var(--border); margin-bottom:8px; }
  .tpl-list-item { padding:8px 12px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-xs); margin-bottom:4px; font-size:12px; color:var(--text); }

  .tpl-bingo-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; padding:4px; }
  .tpl-bingo-cell { aspect-ratio:1; border:1px solid var(--border); border-radius:var(--radius-xs); display:flex; align-items:center; justify-content:center; font-size:10px; text-align:center; padding:3px; background:var(--surface); color:var(--text2); }

  .tpl-vision-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  .tpl-vision-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; text-align:center; }
  .tpl-vision-icon { font-size:24px; margin-bottom:6px; }
  .tpl-vision-text { font-size:11px; color:var(--text2); line-height:1.5; }

  .tpl-count-wrap { display:flex; align-items:center; gap:10px; padding:10px; }
  .tpl-count-val { font-family:'Cormorant Garamond',serif; font-size:32px; color:var(--accent); }
  .tpl-progress-bar { flex:1; height:6px; background:var(--surface2); border-radius:3px; overflow:hidden; }
  .tpl-progress-fill { height:100%; background:var(--accent); border-radius:3px; transition:width 0.3s; }

  .tpl-monthly { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
  .tpl-monthly-cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:var(--radius-xs); font-size:10px; color:var(--text2); background:var(--surface); }
  .tpl-monthly-cell.header { font-weight:700; color:var(--accent); background:transparent; font-size:9px; }
  .tpl-monthly-cell.filled { background:var(--accent-glow); color:var(--accent); font-weight:600; }

  .tpl-table { width:100%; border-collapse:separate; border-spacing:0 3px; }
  .tpl-table th { font-size:10px; color:var(--text3); font-weight:600; text-align:left; padding:6px 8px; text-transform:uppercase; letter-spacing:0.5px; }
  .tpl-table td { font-size:11px; padding:8px; background:var(--surface); color:var(--text); }
  .tpl-table tr:first-child td:first-child { border-radius:var(--radius-xs) 0 0 var(--radius-xs); }
  .tpl-table tr:first-child td:last-child { border-radius:0 var(--radius-xs) var(--radius-xs) 0; }

  .tpl-film-row { display:flex; align-items:center; gap:10px; padding:8px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:6px; }
  .tpl-film-poster { width:32px; height:44px; border-radius:4px; background:var(--surface2); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .tpl-film-info { flex:1; }
  .tpl-film-name { font-size:12px; font-weight:600; color:var(--text); }
  .tpl-film-meta { font-size:10px; color:var(--text3); }
  .tpl-film-stars { color:var(--accent); font-size:11px; }

  .tpl-sport-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  .tpl-sport-card { padding:10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); text-align:center; }
  .tpl-sport-icon { font-size:20px; margin-bottom:4px; }
  .tpl-sport-label { font-size:10px; color:var(--text3); }
  .tpl-sport-val { font-size:14px; font-weight:600; color:var(--text); }

  .tpl-book-shelf { display:flex; gap:6px; flex-wrap:wrap; }
  .tpl-book-item { width:40px; height:56px; border-radius:2px 4px 4px 2px; display:flex; align-items:center; justify-content:center; position:relative; }
  .tpl-book-spine { position:absolute; left:0; top:0; bottom:0; width:4px; background:rgba(0,0,0,0.25); border-radius:2px 0 0 2px; }
  .tpl-book-title { font-size:6px; writing-mode:vertical-rl; transform:rotate(180deg); color:rgba(255,255,255,0.8); font-weight:600; letter-spacing:0.5px; position:relative; z-index:1; max-height:40px; overflow:hidden; }

  .tpl-password-row { display:flex; gap:8px; align-items:center; padding:6px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-xs); margin-bottom:4px; font-family:monospace; font-size:11px; color:var(--text); }
  .tpl-password-site { font-weight:600; min-width:60px; color:var(--accent); }

  .tpl-habit-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
  .tpl-habit-cell { aspect-ratio:1; border-radius:var(--radius-xs); display:flex; align-items:center; justify-content:center; font-size:11px; }
  .tpl-habit-header { font-size:8px; font-weight:700; color:var(--text3); text-transform:uppercase; }
  .tpl-habit-done { background:var(--accent-glow); color:var(--accent); }
  .tpl-habit-miss { background:var(--surface); color:var(--text3); }

  .tpl-budget-row { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-xs); margin-bottom:4px; }
  .tpl-budget-cat { font-size:12px; font-weight:500; color:var(--text); }
  .tpl-budget-val { font-size:12px; font-weight:600; }
  .tpl-budget-income { color:var(--green); }
  .tpl-budget-expense { color:var(--red); }
  .tpl-budget-total { font-family:'Cormorant Garamond',serif; font-size:20px; padding:10px; text-align:center; }

  .tpl-regl-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
  .tpl-regl-cell { aspect-ratio:1; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; background:var(--surface); }
  .tpl-regl-active { background:rgba(232,93,93,0.15); color:var(--red); font-weight:700; }

  .tpl-mood-row { display:flex; align-items:center; gap:8px; padding:8px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-xs); margin-bottom:4px; }
  .tpl-mood-emoji { font-size:20px; }
  .tpl-mood-text { font-size:11px; color:var(--text2); flex:1; }
  .tpl-mood-date { font-size:10px; color:var(--text3); }

  .tpl-weekly-header { display:flex; gap:0; }
  .tpl-weekly-header span { flex:1; text-align:center; font-size:10px; font-weight:700; color:var(--accent); padding:6px 0; letter-spacing:0.5px; }
  .tpl-weekly-grid { display:flex; gap:0; }
  .tpl-weekly-day { flex:1; min-height:80px; border:1px solid var(--border); padding:4px; font-size:9px; color:var(--text2); line-height:1.4; background:var(--surface); }

  .tpl-meal-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  .tpl-meal-card { padding:10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); }
  .tpl-meal-time { font-size:10px; font-weight:700; color:var(--accent); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px; }
  .tpl-meal-content { font-size:11px; color:var(--text2); line-height:1.6; }

  .tpl-lined { padding:10px; }
  .tpl-lined-line { border-bottom:1px solid var(--border); padding:6px 0; font-size:12px; color:var(--text); min-height:24px; line-height:1.6; }

  .tpl-daily-section { padding:10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:8px; }
  .tpl-daily-label { font-size:10px; font-weight:700; color:var(--accent); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px; }
  .tpl-daily-content { font-size:12px; color:var(--text); line-height:1.6; }

  .tpl-sukran-item { padding:10px 12px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:6px; font-size:12px; color:var(--text); }
  .tpl-sukran-item::before { content:"✦ "; color:var(--accent); font-weight:700; }

  .tpl-exercise-row { display:flex; align-items:center; gap:8px; padding:8px 10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-xs); margin-bottom:4px; }
  .tpl-exercise-icon { font-size:16px; }
  .tpl-exercise-name { flex:1; font-size:12px; font-weight:500; color:var(--text); }
  .tpl-exercise-detail { font-size:10px; color:var(--text3); }

  /* Share / Export buttons */
  .share-container { padding:16px; display:flex; flex-direction:column; gap:10px; }
  .share-btn {
    padding:12px 16px;
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:var(--radius-sm);
    font-family:'Montserrat',sans-serif;
    font-size:13px; color:var(--text);
    cursor:pointer; display:flex;
    align-items:center; gap:10px;
    transition:all 0.2s;
  }
  .share-btn:hover { border-color:var(--accent); background:var(--surface2); }

  /* Label picker */
  .label-picker-overlay {
    position: fixed; inset: 0; z-index: 900;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  .label-picker-sheet {
    background: var(--surface);
    border-radius: var(--radius) var(--radius) 0 0;
    padding: 24px;
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--border);
    border-bottom: none;
  }
  .label-picker-title { font-family:'Cormorant Garamond',serif; font-size:18px; color:var(--text); margin-bottom:16px; }
  .label-colors { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .label-color-btn {
    width:36px; height:36px;
    border-radius:50%;
    border:2px solid transparent;
    cursor:pointer;
    transition:all 0.2s;
  }
  .label-color-btn:hover { transform:scale(1.15); }
  .label-color-btn.active { border-color:var(--text); box-shadow:0 0 0 3px var(--accent-glow); }
  .label-stamps { display:flex; gap:6px; flex-wrap:wrap; }
  .label-stamp-btn {
    width:40px; height:40px;
    border-radius:var(--radius-xs);
    background:var(--surface2);
    border:1px solid var(--border);
    font-size:18px;
    cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all 0.2s;
  }
  .label-stamp-btn:hover { background:var(--surface); border-color:var(--accent); }
  .label-stamp-btn.active { border-color:var(--accent); background:var(--accent-glow); }

  /* OCR Editor */
  .ocr-editor { padding:0; }
  .ocr-raw { padding:10px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-xs); font-size:12px; color:var(--text); white-space:pre-wrap; line-height:1.6; margin-bottom:10px; }
  .ocr-field { margin-bottom:8px; }
  .ocr-field-label { font-size:10px; font-weight:600; color:var(--accent); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px; }
  .ocr-field-input {
    width:100%; padding:8px 10px;
    background:var(--surface2);
    border:1px solid var(--border);
    border-radius:var(--radius-xs);
    color:var(--text);
    font-family:'Montserrat',sans-serif;
    font-size:12px; outline:none;
  }
  .ocr-field-input:focus { border-color:var(--accent); }
  .ocr-field-textarea {
    width:100%; padding:8px 10px;
    background:var(--surface2);
    border:1px solid var(--border);
    border-radius:var(--radius-xs);
    color:var(--text);
    font-family:'Montserrat',sans-serif;
    font-size:12px; outline:none;
    resize:vertical; min-height:60px;
  }
  .ocr-field-textarea:focus { border-color:var(--accent); }

  /* Admin */
  .admin-overlay {
    position: fixed; inset: 0; z-index: 800;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  .admin-panel {
    background: var(--surface);
    border-radius: var(--radius);
    width: 95%; max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
  }
  .admin-header { padding:16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); }
  .admin-title { font-family:'Cormorant Garamond',serif; font-size:18px; color:var(--accent); }
  .admin-close { background:none; border:none; color:var(--text3); font-size:20px; cursor:pointer; }
  .admin-tabs { display:flex; border-bottom:1px solid var(--border); }
  .admin-tab { flex:1; padding:10px; text-align:center; background:none; border:none; color:var(--text3); font-family:'Montserrat',sans-serif; font-size:12px; cursor:pointer; font-weight:500; transition:all 0.2s; }
  .admin-tab.active { color:var(--accent); border-bottom:2px solid var(--accent); }
  .admin-body { padding:16px; }
  .admin-stat { padding:12px; background:var(--surface2); border-radius:var(--radius-xs); margin-bottom:8px; display:flex; justify-content:space-between; border:1px solid var(--border); }
  .admin-stat-label { font-size:12px; color:var(--text2); }
  .admin-stat-val { font-size:16px; font-weight:700; color:var(--accent); }

  /* Profile modal */
  .profile-overlay {
    position:fixed; inset:0; z-index:850;
    background:rgba(0,0,0,0.7);
    backdrop-filter:blur(12px);
    display:flex; align-items:center; justify-content:center;
    animation:fadeIn 0.2s ease;
  }
  .profile-panel {
    background:var(--surface);
    border-radius:var(--radius);
    padding:24px;
    width:90%; max-width:380px;
    border:1px solid var(--border);
    box-shadow:var(--shadow-lg);
  }
  .profile-title { font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--text); margin-bottom:16px; }

  /* Email saver */
  .email-saver { padding:16px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); margin:12px 16px; }
  .email-saver-title { font-size:13px; font-weight:600; color:var(--text); margin-bottom:8px; }

  /* Friends */
  .friend-overlay {
    position:fixed; inset:0; z-index:800;
    background:rgba(0,0,0,0.7);
    backdrop-filter:blur(12px);
    display:flex; align-items:flex-end; justify-content:center;
    animation:fadeIn 0.2s ease;
  }
  .friend-panel {
    background:var(--surface);
    border-radius:var(--radius) var(--radius) 0 0;
    padding:24px;
    width:100%; max-width:400px;
    max-height:80vh; overflow-y:auto;
    border:1px solid var(--border);
    border-bottom:none;
  }

  /* Activate */
  .activate-screen { min-height:100vh; background:var(--bg); padding:0; display:flex; flex-direction:column; }
  .activate-header { padding:16px 20px; display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--border); background:var(--surface); }

  /* Share modal */
  .share-overlay {
    position:fixed; inset:0; z-index:900;
    background:rgba(0,0,0,0.7);
    backdrop-filter:blur(12px);
    display:flex; align-items:center; justify-content:center;
    animation:fadeIn 0.2s ease;
  }
  .share-panel {
    background:var(--surface);
    border-radius:var(--radius);
    padding:24px; width:90%; max-width:360px;
    text-align:center;
    border:1px solid var(--border);
    box-shadow:var(--shadow-lg);
  }
  .share-close { background:none; border:none; color:var(--text3); font-size:18px; cursor:pointer; position:absolute; top:12px; right:12px; }

  /* Add journal modal */
  .add-journal-overlay {
    position:fixed; inset:0; z-index:800;
    background:rgba(0,0,0,0.7);
    backdrop-filter:blur(12px);
    display:flex; align-items:center; justify-content:center;
    animation:fadeIn 0.2s ease;
  }
  .add-journal-panel {
    background:var(--surface);
    border-radius:var(--radius);
    padding:24px; width:90%; max-width:380px;
    border:1px solid var(--border);
    box-shadow:var(--shadow-lg);
  }


  /* ═══════════════════════════════════════════════════════
     ADMIN PANEL — DÜZGÜN
     ═══════════════════════════════════════════════════════ */
  .admin-screen { min-height:100vh; background:var(--bg); display:flex; flex-direction:column; }
  .admin-header { display:flex; align-items:center; gap:16px; padding:16px 20px; border-bottom:1px solid var(--border); background:var(--surface); }
  .admin-back { background:none; border:none; color:var(--text2); font-family:'Montserrat',sans-serif; font-size:14px; cursor:pointer; }
  .admin-title { font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--accent); }
  .admin-login { display:flex; flex-direction:column; align-items:center; gap:16px; padding:48px 24px; }
  .admin-login-icon { font-size:48px; }
  .admin-key-input { width:100%; max-width:280px; padding:12px 16px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-family:'Montserrat',sans-serif; font-size:15px; text-align:center; outline:none; }
  .admin-key-input:focus { border-color:var(--accent); }
  .admin-btn { padding:12px 32px; background:var(--accent); color:var(--bg); border:none; border-radius:var(--radius-sm); font-family:'Montserrat',sans-serif; font-size:14px; font-weight:600; cursor:pointer; }
  .admin-tabs { display:flex; border-bottom:1px solid var(--border); background:var(--surface); }
  .admin-tab { flex:1; padding:12px 8px; text-align:center; background:none; border:none; border-bottom:2px solid transparent; color:var(--text3); font-family:'Montserrat',sans-serif; font-size:12px; cursor:pointer; font-weight:500; transition:all 0.2s; }
  .admin-tab.active { color:var(--accent); border-bottom-color:var(--accent); background:var(--accent-glow); }
  .admin-content { padding:16px; display:flex; flex-direction:column; gap:12px; flex:1; overflow-y:auto; }
  .admin-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
  .admin-stat-card { padding:14px 10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); text-align:center; }
  .admin-stat-icon { font-size:20px; margin-bottom:4px; }
  .admin-stat-num { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:700; color:var(--accent); }
  .admin-stat-label { font-size:10px; color:var(--text3); margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }
  .admin-section-title { font-family:'Cormorant Garamond',serif; font-size:16px; color:var(--text); margin:8px 0; }
  .admin-journal-row { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:6px; }
  .ajr-info { display:flex; align-items:center; gap:8px; }
  .ajr-sno { font-size:13px; font-weight:600; color:var(--text); font-variant-numeric:tabular-nums; }
  .ajr-theme { font-size:11px; color:var(--text2); background:var(--surface2); padding:2px 8px; border-radius:12px; }
  .ajr-premium { font-size:14px; }
  .ajr-meta { display:flex; align-items:center; gap:8px; font-size:11px; color:var(--text3); }
  .ajr-btn { padding:5px 12px; background:var(--accent); color:var(--bg); border:none; border-radius:var(--radius-xs); font-family:'Montserrat',sans-serif; font-size:10px; font-weight:600; cursor:pointer; }
  .admin-empty { text-align:center; padding:24px; color:var(--text3); font-size:13px; }
  .admin-payment-card { padding:14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:8px; display:flex; flex-direction:column; gap:6px; }
  .admin-payment-card.pending { border-left:3px solid var(--accent); }
  .admin-payment-card.approved { border-left:3px solid var(--green); }
  .admin-payment-card.rejected { border-left:3px solid var(--red); }
  .apc-top { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .apc-sno { font-weight:600; font-size:13px; color:var(--text); }
  .apc-plan { font-size:11px; color:var(--text2); background:var(--surface2); padding:2px 8px; border-radius:12px; }
  .apc-status { font-size:11px; font-weight:600; }
  .apc-status.pending { color:var(--accent); }
  .apc-status.approved { color:var(--green); }
  .apc-status.rejected { color:var(--red); }
  .apc-name { font-size:12px; color:var(--text2); }
  .apc-date { font-size:10px; color:var(--text3); }
  .apc-actions { display:flex; gap:8px; margin-top:4px; }
  .apc-approve { padding:8px 16px; background:var(--green); color:white; border:none; border-radius:var(--radius-xs); font-family:'Montserrat',sans-serif; font-size:12px; font-weight:600; cursor:pointer; }
  .apc-reject { padding:8px 16px; background:var(--surface2); color:var(--red); border:1px solid var(--red); border-radius:var(--radius-xs); font-family:'Montserrat',sans-serif; font-size:12px; cursor:pointer; }
  .admin-access-btn { position:fixed; bottom:16px; right:16px; width:40px; height:40px; border-radius:50%; background:var(--surface); border:1px solid var(--border); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:50; box-shadow:var(--shadow); }


  /* Tab panels fill space */
  .tab-panel {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    -webkit-overflow-scrolling: touch;
  }
  .tab-panel.chat-panel {
    padding: 0;
    gap: 0;
  }
  .tab-panel.settings-panel {
    padding: 16px;
  }
  .friends-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .friends-title { font-family:'Cormorant Garamond',serif; font-size:18px; color:var(--text); }
  .friend-card { display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:6px; cursor:pointer; transition:all 0.2s; }
  .friend-card:hover { border-color:var(--accent); }
  .stats-card {
    padding: 16px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }
  .stats-card-title { font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 10px; letter-spacing: 0.5px; }
  .stats-row { display: flex; gap: 12px; margin-bottom: 10px; }
  .stats-num-block { flex: 1; text-align: center; padding: 10px 6px; background: var(--surface2); border-radius: var(--radius-xs); }
  .stats-big { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: var(--accent); line-height: 1; }
  .stats-sub { font-size: 9px; color: var(--text3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .heatmap { display: flex; gap: 2px; overflow-x: auto; padding: 4px 0; }
  .heatmap::-webkit-scrollbar { display: none; }
  .heatmap-col { display: flex; flex-direction: column; gap: 2px; }
  .heatmap-cell { width: 8px; height: 8px; border-radius: 2px; background: var(--surface2); }
  .heatmap-cell.active { background: var(--accent); }
  .wrapped-card { background: var(--surface); }

  /* Toggle button */
  .toggle-btn { width:44px; height:24px; border-radius:12px; border:none; background:var(--surface2); position:relative; cursor:pointer; transition:background 0.2s; }
  .toggle-btn.on { background:var(--accent); }
  .toggle-knob { width:20px; height:20px; border-radius:50%; background:white; position:absolute; top:2px; left:2px; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
  .toggle-btn.on .toggle-knob { left:22px; }

  /* Premium badge */
  .premium-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; background:var(--accent-glow); border:1px solid rgba(237,188,115,0.3); border-radius:12px; font-size:10px; color:var(--accent); font-weight:600; }

  /* Havale modal */
  .havale-modal { background:var(--surface); border-radius:var(--radius); padding:24px; width:90%; max-width:380px; display:flex; flex-direction:column; gap:12px; border:1px solid var(--border); box-shadow:var(--shadow-lg); }
  .havale-title { font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--text); }
  .havale-desc { font-size:13px; color:var(--text2); line-height:1.6; }
  .havale-info { padding:12px; background:var(--surface2); border-radius:var(--radius-xs); font-size:12px; color:var(--text); line-height:1.6; }
  .havale-btn { padding:12px; background:var(--accent); color:var(--bg); border:none; border-radius:var(--radius-sm); font-family:'Montserrat',sans-serif; font-size:14px; font-weight:600; cursor:pointer; }
  .havale-btn:disabled { opacity:0.5; cursor:not-allowed; }

  .region-block { border:1px solid var(--border); border-radius:var(--radius-xs); padding:6px; background:var(--surface); }
  .region-label { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--text3); margin-bottom:3px; }
`;
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);
import { useState, useEffect, useRef } from "react";

const API = "https://ajan-da-backend-production.up.railway.app";

// ─── LOGO SVG COMPONENT ─────────────────────────────────────────────
function AjandaLogo({ size = 32, light = false, className = "" }) {
  const w = size * 3.2;
  return (
    <svg className={className} width={w} height={size} viewBox="0 0 160 50" fill="none" style={{display:"block"}}>
      <rect x="2" y="8" width="28" height="34" rx="3" fill={light ? "rgba(255,255,255,0.2)" : "#edbc73"} />
      <rect x="6" y="12" width="20" height="26" rx="2" fill={light ? "rgba(255,255,255,0.35)" : "#f8f5f0"} />
      <line x1="10" y1="18" x2="22" y2="18" stroke={light ? "rgba(255,255,255,0.3)" : "#dfe7e9"} strokeWidth="1.5"/>
      <line x1="10" y1="22" x2="22" y2="22" stroke={light ? "rgba(255,255,255,0.3)" : "#dfe7e9"} strokeWidth="1.5"/>
      <line x1="10" y1="26" x2="18" y2="26" stroke={light ? "rgba(255,255,255,0.3)" : "#dfe7e9"} strokeWidth="1.5"/>
      <circle cx="22" cy="32" r="4" fill={light ? "rgba(255,255,255,0.5)" : "#edbc73"} />
      <text x="38" y="35" fontFamily="'Cormorant Garamond',serif" fontSize="28" fontWeight="700" letterSpacing="2" fill={light?"#fff":"#2c2c2c"}>AJAN</text>
      <text x="108" y="35" fontFamily="'Cormorant Garamond',serif" fontSize="28" fontWeight="400" letterSpacing="2" fill={light?"rgba(255,255,255,0.5)":"#999"}>-DA</text>
    </svg>
  );
}

// ─── YARDIMCI ────────────────────────────────────────────────────────
const Empty = ({ msg }) => <div className="tpl-empty-hint">{msg || "Fotoğraflandıktan sonra görünecek"}</div>;
const TplHeader = ({ icon, title }) => <div className="tpl-header">{icon} {title}</div>;

// ─── ŞABLON BİLEŞENLERİ ──────────────────────────────────────────────

function TemplateCover({ data, empty, themeColor }) {
  return (
    <div className="tpl-cover" style={{ background: themeColor || "#edbc73" }}>
      <div className="tpl-cover-title">{data?.title || "AJANDA"}</div>
      {data?.subtitle && <div className="tpl-cover-sub">{data.subtitle}</div>}
      {data?.date_range && <div className="tpl-cover-date">{data.date_range}</div>}
      {empty && <div className="tpl-cover-hint">Kapak sayfası</div>}
    </div>
  );
}

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

function TemplateFilmDizi({ data, empty }) {
  const items = data?.items || [];
  return (
    <div className="tpl-film">
      <TplHeader icon="🎬" title="Film-Dizi Takip" />
      {empty ? <Empty /> : (
        <table className="tpl-table">
          <thead><tr><th>☐</th><th>Tür</th><th>Film/Dizi</th><th>⭐</th></tr></thead>
          <tbody>
            {items.length === 0
              ? Array.from({length: 8}).map((_, i) => (<tr key={i}><td>☐</td><td></td><td></td><td>☆☆☆☆☆</td></tr>))
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
                <div key={mi} className={`tpl-eg-cell ${grid[`${d+1}-${mi+1}`] ? "done" : ""}`}>○</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

function TemplateButce({ data, empty }) {
  const expenses = data?.expenses || [];
  const income = data?.income || [];
  return (
    <div className="tpl-butce">
      <TplHeader icon="💰" title="Aylık Bütçe Takip" />
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
    </div>
  );
}

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
                return <div key={mi} className="tpl-eg-cell" style={{background: mood ? moodColors[mood] || "#ddd" : "transparent"}} />;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateHaftalikDikey({ data, empty }) {
  const days = [
    {key:"monday",short:"PAZ",weekend:false},{key:"tuesday",short:"SAL",weekend:false},
    {key:"wednesday",short:"ÇAR",weekend:false},{key:"thursday",short:"PER",weekend:false},
    {key:"friday",short:"CUM",weekend:false},{key:"saturday",short:"CMT",weekend:true},
    {key:"sunday",short:"PAZ",weekend:true},
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
      <div className="tpl-hw-title">{data?.week ? `HAFTALIK PLAN — ${data.week}` : "HAFTALIK PLAN"}</div>
      <div className="tpl-hw-grid">
        {days.map(d => (<div key={d.key} className={`tpl-hw-head ${d.weekend?"wknd":""}`}>{d.short}</div>))}
        {hours.map((h, hi) => days.map(d => {
          const items = getItems(data?.[d.key]);
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

function TemplateHaftalikTekli1({ data, empty }) {
  const days = [
    {key:"monday",short:"PAZ",weekend:false},{key:"tuesday",short:"SAL",weekend:false},
    {key:"wednesday",short:"ÇAR",weekend:false},{key:"thursday",short:"PER",weekend:false},
    {key:"friday",short:"CUM",weekend:false},{key:"saturday",short:"CMT",weekend:true},
    {key:"sunday",short:"PAZ",weekend:true},
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
      <div className="tpl-hw-title">{data?.week ? `HAFTALIK PLAN — ${data.week}` : "HAFTALIK PLAN"}</div>
      <div className="tpl-hw-grid">
        {days.map(d => (<div key={d.key} className={`tpl-hw-head ${d.weekend?"wknd":""}`}>{d.short}</div>))}
        {hours.map((h, hi) => days.map(d => {
          const items = getItems(data?.[d.key]);
          return (
            <div key={d.key+h} className="tpl-hw-cell">
              <span className="tpl-hw-hour">{h}</span>
              {!empty && hi === 0 && items.map((item, i) => (<div key={i} className="tpl-hw-entry">{item}</div>))}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

function TemplateHaftalikTekli2({ data, empty }) {
  const days = [
    {key:"monday",label:"Pazartesi"},{key:"tuesday",label:"Salı"},{key:"wednesday",label:"Çarşamba"},
    {key:"thursday",label:"Perşembe"},{key:"friday",label:"Cuma"},{key:"saturday",label:"Cumartesi"},
    {key:"sunday",label:"Pazar"},
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

function TemplateYemekPlani({ data, empty }) {
  const days = [
    {key:"monday",label:"Pazartesi"},{key:"tuesday",label:"Salı"},{key:"wednesday",label:"Çarşamba"},
    {key:"thursday",label:"Perşembe"},{key:"friday",label:"Cuma"},{key:"saturday",label:"Cumartesi"},
    {key:"sunday",label:"Pazar"},
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

function TemplateGunlukCizgili({ data, empty }) {
  return (
    <div className="tpl-gunluk-cizgili">
      <TplHeader icon="📝" title="Günlük" />
      {data?.date && <div className="tpl-date">{data.date}</div>}
      {empty ? (
        <>
          <div className="tpl-row" style={{gap:8, marginBottom:8}}>
            <div style={{flex:1, border:"1px solid var(--border)", borderRadius:8, padding:8, minHeight:60}}>
              <div className="tpl-section-title">Öncelikler</div>
            </div>
            <div style={{flex:1, border:"1px solid var(--border)", borderRadius:8, padding:8, minHeight:60}}>
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

function TemplateGunlukSukran({ data, empty }) {
  return (
    <div className="tpl-gunluk-sukran">
      <TplHeader icon="🌟" title="Günlük Şükran Sayfam" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-row" style={{gap:8}}>
            <div style={{flex:1, background:"var(--mint)", borderRadius:8, padding:8}}>
              <div className="tpl-section-title">Bugünün Olumlaması</div>
              <div className="tpl-notes-text">{data?.affirmation || ""}</div>
            </div>
            <div style={{flex:1, background:"var(--mint)", borderRadius:8, padding:8}}>
              <div className="tpl-section-title">Bugünün Öncelikleri</div>
              {(data?.priorities || []).map((p,i) => <div key={i} className="tpl-item">{i+1}. {p}</div>)}
            </div>
          </div>
          <div style={{background:"var(--mint)", borderRadius:8, padding:8, margin:"8px 0"}}>
            <div className="tpl-section-title">Bugün Minnettar Olduğum Şeyler</div>
            <div className="tpl-notes-text">{data?.grateful || ""}</div>
          </div>
          <div style={{background:"var(--mint)", borderRadius:8, padding:8}}>
            <div className="tpl-section-title">Sabırsızlıkla Beklediğim Şeyler</div>
            <div className="tpl-notes-text">{data?.looking_fwd || ""}</div>
          </div>
        </>
      )}
    </div>
  );
}

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

// ─── PAGE TEMPLATE ROUTER ────────────────────────────────────────────
function PageTemplate({ type, data, empty, themeColor }) {
  const props = { data, empty, themeColor };
  switch(type) {
    case "cover": return <TemplateCover {...props} />;
    case "yillik_bingo": return <TemplateBingo {...props} title="Yıllık Bingo" />;
    case "aylik_bingo": return <TemplateBingo {...props} title="Aylık Bingo" />;
    case "bingo_grid": return <TemplateBingo {...props} />;
    case "vision_board": case "vision_boxes": return <TemplateVisionBoard {...props} />;
    case "onemli_gunler": return <TemplateOnemliGunler {...props} />;
    case "mutluluk_sayaci": case "mood_calendar": return <TemplateMutlulukSayaci {...props} />;
    case "kendime_mektup": case "letter": return <TemplateKendimeMektup {...props} />;
    case "monthly": case "aylik_takvim": case "monthly_grid": return <TemplateMonthly {...props} />;
    case "aylik_planlayici": return <TemplateAylikPlanlayici {...props} />;
    case "ders_plani": case "daily_grid_31": return <TemplateDersPlani {...props} />;
    case "film_dizi_plani": case "film_table": return <TemplateFilmDizi {...props} />;
    case "film_dizi_takip": case "film_strip": return <TemplateFilmSerit {...props} />;
    case "spor_plani": case "sport_grid_30": return <TemplateSpor {...props} />;
    case "okuma_takip": case "numbered_list_50": return <TemplateOkumaTakip {...props} />;
    case "okuma_takip_2": case "reading_table": return <TemplateOkumaTablo {...props} />;
    case "okuma_takip_3": case "book_shelves": return <TemplateKitapRafi {...props} />;
    case "sifre_takip": case "password_list": return <TemplateSifreTakip {...props} />;
    case "egzersiz_takip": case "habit_year_grid": return <TemplateEgzersizTakip {...props} />;
    case "aliskanlik": case "habit_circle": return <TemplateAliskanlik {...props} />;
    case "butce_takip": case "budget_table": return <TemplateButce {...props} />;
    case "aylik_gozlem": return <TemplateAylikGozlem {...props} />;
    case "aylik_sukran": case "numbered_list_31": return <TemplateAylikSukran {...props} />;
    case "regl_takibi": case "period_grid": return <TemplateRegl {...props} />;
    case "duygudurum_takibi": case "mood_grid": return <TemplateDuygudurum {...props} />;
    case "haftalik_yatay": case "haftalik_yatay_2": case "haftalik_dikey": case "day_col": case "day_notes": return <TemplateHaftalikDikey {...props} />;
    case "haftalik_tekli1": case "day_box": return <TemplateHaftalikTekli1 {...props} />;
    case "haftalik_tekli2": case "day_bullets": return <TemplateHaftalikTekli2 {...props} />;
    case "haftalik_kapanisi": return <TemplateHaftalikKapanis {...props} />;
    case "yemek_plan": case "meal_box": return <TemplateYemekPlani {...props} />;
    case "gunluk_cizgili": case "lined_notes": return <TemplateGunlukCizgili {...props} />;
    case "bas_planlayici": case "schedule": return <TemplateBasPlanlayici {...props} />;
    case "gunluk_sukran": return <TemplateGunlukSukran {...props} />;
    default: return <TemplateNotes {...props} />;
  }
}

function EditablePageView({ activePage, tplType, data, empty, themeColor, onSave }) {
  if (!data) return <PageTemplate type={tplType} data={data} empty={true} themeColor={themeColor} />;
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
      week: r.header?.data?.title || r.header?.data?.subtitle || "",
      monday: getVal(r.monday), tuesday: getVal(r.tuesday), wednesday: getVal(r.wednesday),
      thursday: getVal(r.thursday), friday: getVal(r.friday), saturday: getVal(r.saturday),
      sunday: getVal(r.sunday), notes: getVal(r.notes),
      energy_down: getVal(r.energy_down), proud: getVal(r.proud), release: getVal(r.release),
      lesson_rel: getVal(r.lesson_rel), lesson_work: getVal(r.lesson_work),
      lesson_self: getVal(r.lesson_self), next_intent: getVal(r.next_intent),
    };
    return <PageTemplate type={tplType} data={mapped} empty={false} themeColor={themeColor} />;
  }
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
  const dayLabels = {monday:"Pazartesi",tuesday:"Salı",wednesday:"Çarşamba",thursday:"Perşembe",friday:"Cuma",saturday:"Cumartesi",sunday:"Pazar"};
  const haftalikTypes = ["haftalik_tekli1","haftalik_dikey","haftalik_tekli2","haftalik_yatay","haftalik_yatay_2","yemek_plan"];
  const getRawOcr = () => {
    if (!data?.regions) return data?.ocr_text || "";
    return Object.values(data.regions).map(r => r.ocr_text || "").filter(Boolean).join(" | ");
  };
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
    if (haftalikTypes.includes(tplType)) { dayKeys.forEach(d => { init[d] = getDayVal(d); }); }
    else { init["_ocr"] = getRawOcr(); }
    return init;
  });
  const save = (key, val) => { setVals(prev => ({...prev, [key]: val})); onSave(key, "content", val); };
  if (haftalikTypes.includes(tplType)) {
    return (
      <div className="ocr-editor">
        {dayKeys.map(d => (
          <div key={d} className="ocr-field">
            <label className="ocr-label">{dayLabels[d]}</label>
            <input className="ocr-input" value={vals[d] || ""} onChange={e => save(d, e.target.value)} placeholder="El yazısı..." />
          </div>
        ))}
      </div>
    );
  }
  const regionEntries = data?.regions ? Object.entries(data.regions).filter(([,r]) => r.ocr_text?.trim()) : [];
  if (regionEntries.length > 0) {
    return (
      <div className="ocr-editor">
        {regionEntries.map(([rid, region]) => (
          <div key={rid} className="ocr-field">
            <label className="ocr-label">{region.label}</label>
            <textarea className="ocr-textarea" value={vals[rid] !== undefined ? vals[rid] : (region.ocr_text || "")} onChange={e => save(rid, e.target.value)} rows={2} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="ocr-editor">
      <textarea className="ocr-textarea" value={vals["_ocr"] || ""} onChange={e => save("_ocr", e.target.value)} rows={4} placeholder="El yazısı içeriği..." />
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

// ─── EMAIL SAVER ─────────────────────────────────────────────────────
function EmailSaver({ serialNo, api }) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const save = async () => {
    if (!email || !email.includes("@")) { alert("Geçerli e-posta girin"); return; }
    setLoading(true);
    try { await fetch(`${api}/email/welcome/${serialNo}`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email }) }); setSaved(true); } catch { alert("Hata"); }
    setLoading(false);
  };
  if (saved) return <div style={{fontSize:12, color:"var(--green)"}}>✓ {email} kaydedildi</div>;
  return (
    <div style={{display:"flex", gap:6}}>
      <input style={{flex:1, padding:"8px 10px", border:"1px solid var(--border)", borderRadius:6, fontFamily:"'Montserrat',sans-serif", fontSize:13, outline:"none"}} placeholder="ornek@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} />
      <button style={{padding:"8px 14px", background:"var(--gold)", color:"white", border:"none", borderRadius:6, fontFamily:"'Montserrat',sans-serif", fontSize:13, cursor:"pointer"}} onClick={save} disabled={loading}>{loading ? "⏳" : "Kaydet"}</button>
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

// ─── ANA UYGULAMA ────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(() => {
    try { const saved = localStorage.getItem("ajan_current"); if (saved) { const parsed = JSON.parse(saved); if (parsed && parsed.serial_no) return "dashboard"; } return "home"; } catch { return "home"; }
  });
  const [journals, setJournals] = useState(() => { try { return JSON.parse(localStorage.getItem("ajanda_journals") || "[]"); } catch { return []; } });
  const [current, setCurrent] = useState(() => { try { const saved = localStorage.getItem("ajan_current"); if (saved) { const parsed = JSON.parse(saved); if (parsed && parsed.serial_no) return parsed; } return null; } catch { localStorage.removeItem("ajan_current"); return null; } });
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState([]);
  const [stepOverlay, setStepOverlay] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => { try { return JSON.parse(localStorage.getItem("ajanda_bookmarks") || "{}"); } catch { return {}; } });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [flipDir, setFlipDir] = useState(null);
  const [authMode, setAuthMode] = useState("landing");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSerialNo, setRegSerialNo] = useState("");
  const [regTheme, setRegTheme] = useState("FERDI");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggedUsername, setLoggedUsername] = useState(() => localStorage.getItem("ajan_username") || "");
  const [isFlipping, setIsFlipping] = useState(false);
  const touchStartX = useRef(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "1");
  const [activeTab, setActiveTab] = useState("pages");
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
  // CX: Giriş yapıldıysa onboarding gösterme
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboarding_done") && !localStorage.getItem("ajan_current"));
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
  const [searchType, setSearchType] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [newJournalSno, setNewJournalSno] = useState("");
  const [newJournalTheme, setNewJournalTheme] = useState("");
  const [newJournalPassword, setNewJournalPassword] = useState("");
  // CX: Kişiselleştirilebilir kapak rengi
  const [userColor, setUserColor] = useState(() => localStorage.getItem("ajan_user_color") || "");
  const [showLibrary, setShowLibrary] = useState(() => {
    try { const saved = localStorage.getItem("ajan_current"); if (saved) { const parsed = JSON.parse(saved); if (parsed && parsed.serial_no) return false; } const username = localStorage.getItem("ajan_username"); const journals = JSON.parse(localStorage.getItem("ajanda_journals") || "[]"); return !!(username && journals.length > 0); } catch { return false; }
  });
  const isNative = !!window.Capacitor?.isNativePlatform?.();
  const scrollRef = useRef(null);

  // CX: Tema rengi - kişiselleştirilebilir
  const themeColor = userColor || current?.theme_color || "#edbc73";

  useEffect(() => { setEditData(null); }, [activePage?.page_no]);
  useEffect(() => { if (current && pages.length === 0) { loadPages(current); loadStreak(current.serial_no); loadPremiumStatus(current.serial_no); loadFriends(current); loadYearlyReport(current.serial_no); } }, []);
  useEffect(() => { document.body.classList.toggle("dark", darkMode); localStorage.setItem("darkMode", darkMode ? "1" : "0"); }, [darkMode]);

  // CX: Giriş yapıldıktan sonra en son eklenen sayfaya scroll
  useEffect(() => {
    if (scrollRef.current && pages.length > 0 && step === "dashboard") {
      const lastFilledIdx = pages.reduce((acc, p, i) => !p.is_empty ? i : acc, 0);
      if (lastFilledIdx > 0) {
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, lastFilledIdx * 140 - 40);
        }, 300);
      }
    }
  }, [pages, step]);

  // Renk kaydet
  useEffect(() => { if (userColor) localStorage.setItem("ajan_user_color", userColor); }, [userColor]);

  // Arama - CX: sadece dolu sayfalarda çalışacak
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = pages.filter(p => {
      if (p.is_empty) return false; // CX: boş sayfaları gösterme
      const ocr = (p.ocr_text || "").toLowerCase();
      const title = (p.template?.title || "").toLowerCase();
      return ocr.includes(q) || title.includes(q);
    });
    setSearchResults(results);
  }, [searchQuery, pages]);

  const loadStreak = async (sno) => { try { const r = await fetch(`${API}/streak/${sno}`); const d = await r.json(); setStreakData(d); } catch {} };
  const loadYearlyReport = async (sno) => { try { const r = await fetch(`${API}/yearly_report/${sno}`); const d = await r.json(); setYearlyReport(d); } catch {} };
  const loadPremiumStatus = async (sno) => { try { const r = await fetch(`${API}/premium/status/${sno}`); const d = await r.json(); setIsPremium(d.is_premium); } catch {} };
  const loadFriends = async (cur) => { const c = cur || current; if (!c) return; try { const r = await fetch(`${API}/friend/list/${c.serial_no}?pin=${c.pin}`); const d = await r.json(); setFriends(Array.isArray(d) ? d : []); } catch {} };
  const loadProfile = async () => { if (!loggedUsername) return; try { const r = await fetch(`${API}/user/profile/${loggedUsername}`); const d = await r.json(); setProfileData(d); if (d.avatar) setProfileAvatar(d.avatar); } catch {} };

  const toggleBookmark = (pageNo) => { const key = `${current?.serial_no}_${pageNo}`; const updated = { ...bookmarks }; if (updated[key]) delete updated[key]; else updated[key] = true; setBookmarks(updated); localStorage.setItem("ajanda_bookmarks", JSON.stringify(updated)); };
  const isBookmarked = (pageNo) => !!bookmarks[`${current?.serial_no}_${pageNo}`];
  const saveJournals = (list) => { setJournals(list); localStorage.setItem("ajanda_journals", JSON.stringify(list)); };
  const saveCurrent = (journal) => { setCurrent(journal); if (journal) localStorage.setItem("ajan_current", JSON.stringify(journal)); else localStorage.removeItem("ajan_current"); };

  const takePhoto = async () => {
    if (isNative) {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({ quality: 85, resultType: CameraResultType.Base64, source: CameraSource.Camera, correctOrientation: true });
      const res = await fetch(`data:image/jpeg;base64,${photo.base64String}`);
      return await res.blob();
    } else {
      return new Promise((resolve) => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = (e) => resolve(e.target.files[0]); input.click(); });
    }
  };

  const scanQR = async () => {
    if (!isNative) return null;
    const { BarcodeScanner } = await import("@capacitor-mlkit/barcode-scanning");
    await BarcodeScanner.requestPermissions();
    const result = await BarcodeScanner.scan();
    return result?.barcodes?.[0]?.rawValue || null;
  };

  const loadPages = async (journal) => { try { const res = await fetch(`${API}/history?serial_no=${journal.serial_no}`); if (!res.ok) return; const data = await res.json(); setPages(data.notes || []); } catch(e) { console.error("loadPages error", e); } };

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
        setStepOverlay({ icon: "📷", title: "Sayfa QR'ını Tara", desc: "Sayfanın sağ üst köşesindeki QR kodu okut" });
        qr = await scanQR();
        setStepOverlay(null);
        if (!qr) { setError("QR okunamadı"); setLoading(false); return; }
        setStepOverlay({ icon: "📸", title: "Sayfayı Fotoğrafla", desc: "Sayfanın tamamını net fotoğraflayın" });
        blob = await takePhoto();
        setStepOverlay(null);
        if (!blob) { setLoading(false); return; }
      } else {
        setStepOverlay({ icon: "📸", title: "Sayfa Fotoğrafı", desc: "QR kodu sağ üst köşede görünecek şekilde seçin" });
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
    try { const res = await doUpload(confirmData.form, confirmData.qr, true); const data = await res.json(); if (!res.ok) setError(data.detail || "Hata"); else await loadPages(current); } catch { setError("Yükleme hatası"); }
    setLoading(false);
  };

  const handleSaveEdit = async (regionId, field, value) => {
    if (!activePage || !current) return;
    const updated = JSON.parse(JSON.stringify(editData || activePage.template_data || {}));
    if (regionId && updated.regions?.[regionId]) { updated.regions[regionId].data[field] = value; } else { updated[field] = value; }
    setEditData(updated);
    try { await fetch(`${API}/page/${current.serial_no}/${activePage.page_no}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ template_data: updated }) }); setPages(prev => prev.map(p => p.page_no === activePage.page_no ? { ...p, template_data: updated } : p)); } catch(e) { console.error("Save error", e); }
  };

  // Auth handlers
  const handleRegister = async () => {
    if (!regUsername || !regPassword || !regSerialNo) { setError("Tüm alanları doldurun"); return; }
    setLoading(true); setError("");
    try {
      const endpoint = loggedUsername ? `${API}/user/add_journal/${loggedUsername}` : `${API}/user/register`;
      const res = await fetch(endpoint, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username: regUsername || loggedUsername, password: regPassword, serial_no: regSerialNo, theme_id: regTheme, pin: regPassword.slice(0,6) }) });
      const d = await res.json();
      if (!res.ok) { setError(d.detail || "Kayıt hatası"); setLoading(false); return; }
      localStorage.setItem("ajan_username", regUsername); setLoggedUsername(regUsername);
      const journal = { serial_no: d.serial_no, theme_id: d.theme_id, theme_name: d.theme_name, theme_color: d.theme_color, pin: regPassword.slice(0,6), template: d.template, username: regUsername };
      const updated = [journal, ...journals.filter(j => j.serial_no !== journal.serial_no)];
      saveJournals(updated); saveCurrent(journal);
      await loadPages(journal); loadStreak(journal.serial_no);
      setShowLibrary(true); setAuthMode("landing");
    } catch { setError("Bağlantı hatası"); }
    setLoading(false);
  };

  const handleUserLogin = async () => {
    if (!loginUsername || !loginPassword) { setError("Kullanıcı adı ve şifre girin"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/user/login`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username: loginUsername, password: loginPassword }) });
      const d = await res.json();
      if (!res.ok) { setError(d.detail || "Giriş hatası"); setLoading(false); return; }
      localStorage.setItem("ajan_username", loginUsername); setLoggedUsername(loginUsername);
      const journal = { serial_no: d.serial_no, theme_id: d.theme_id, theme_name: d.theme_name, theme_color: d.theme_color, pin: d.pin, template: d.template, username: loginUsername };
      const updated = [journal, ...journals.filter(j => j.serial_no !== journal.serial_no)];
      saveJournals(updated);
      try { const jr = await fetch(`${API}/user/journals/${loginUsername}?password=${loginPassword}`); const jd = await jr.json(); if (jd.journals?.length > 0) saveJournals(jd.journals); } catch {}
      await loadPages(journal); loadStreak(journal.serial_no); loadPremiumStatus(journal.serial_no);
      setAuthMode("landing"); setShowLibrary(true);
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
      saveCurrent(updated); await loadPages(updated); loadStreak(updated.serial_no); loadYearlyReport(updated.serial_no); loadPremiumStatus(updated.serial_no); setShowLibrary(true);
    } catch { setError("Bağlantı hatası"); }
    setLoading(false);
  };

  // AI Chat
  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages); setChatInput(""); setChatLoading(true);
    try { const res = await fetch(`${API}/ai/chat/${current.serial_no}`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ messages: newMessages }) }); const d = await res.json(); setChatMessages([...newMessages, { role: "assistant", content: d.reply || "Yanıt alınamadı" }]); } catch { setChatMessages([...newMessages, { role: "assistant", content: "Bağlantı hatası." }]); }
    setChatLoading(false);
  };

  const getAiSummary = async () => {
    if (!current || aiLoading) return;
    setAiLoading(true);
    try { const r = await fetch(`${API}/ai/summary/${current.serial_no}`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({}) }); const d = await r.json(); setAiSummary(d); } catch { setAiSummary({ summary: "Özet alınamadı.", topics: [], habits: [], motivation: "" }); }
    setAiLoading(false);
  };

  const setPageLabel = async (pageNo, color, stamp) => {
    if (!current) return;
    try { await fetch(`${API}/page/${current.serial_no}/${pageNo}/label`, { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ color, stamp }) }); setPages(prev => prev.map(p => p.page_no === pageNo ? { ...p, label_color: color ?? p.label_color, label_stamp: stamp ?? p.label_stamp } : p)); if (activePage?.page_no === pageNo) setActivePage(prev => ({ ...prev, label_color: color ?? prev.label_color, label_stamp: stamp ?? prev.label_stamp })); } catch { alert("Etiket kaydedilemedi"); }
    setLabelPickerPage(null);
  };

  const sharePage = async (pageNo) => {
    if (!current) return;
    try { const r = await fetch(`${API}/share/${current.serial_no}/${pageNo}`, { method: "POST" }); const d = await r.json(); setShareUrl(`${window.location.origin}/shared/${d.share_token}`); } catch { alert("Paylaşım linki oluşturulamadı"); }
  };

  const exportPDF = async () => {
    if (!current || exportLoading) return;
    setExportLoading(true);
    try {
      const url = `${API}/export/pdf/${current.serial_no}?pin=${current.pin}`;
      const res = await fetch(url);
      if (!res.ok) { alert("PDF oluşturulamadı"); setExportLoading(false); return; }
      const blob = await res.blob();
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `ajanda_${current.serial_no}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch { alert("PDF indirme hatası"); }
    setExportLoading(false);
  };

  const exportJSON = async () => {
    if (!current) return;
    try { const res = await fetch(`${API}/export/json/${current.serial_no}?pin=${current.pin}`); const blob = await res.blob(); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `ajanda_${current.serial_no}_backup.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); } catch { alert("Yedekleme hatası"); }
  };

  const enablePushNotifications = async () => {
    setLoading(true);
    try {
      if (isNative) {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") { alert("Bildirim izni reddedildi"); setLoading(false); return; }
        await LocalNotifications.schedule({ notifications: [{ title: "AJAN-DA 📓", body: "Bugün ajandanı güncellemeyi unutma! 📝", id: 2, schedule: { at: new Date(new Date().setHours(notifHour, notifMinute, 0, 0)), every: "day", allowWhileIdle: true } }] });
        setPushEnabled(true); localStorage.setItem("push_enabled", "1");
        alert("Bildirimler aktif!");
      } else {
        if (!("Notification" in window)) { alert("Tarayıcınız desteklemiyor"); setLoading(false); return; }
        const permission = await Notification.requestPermission();
        if (permission !== "granted") { alert("İzin reddedildi"); setLoading(false); return; }
        setPushEnabled(true); localStorage.setItem("push_enabled", "1");
        alert("Bildirimler aktif!");
      }
    } catch(e) { alert("Hata: " + e.message); }
    setLoading(false);
  };

  const updateProfile = async () => {
    if (!oldPassword) { alert("Mevcut şifrenizi girin"); return; }
    try { const res = await fetch(`${API}/user/update/${loggedUsername}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ old_password: oldPassword, new_username: newUsername || undefined, new_password: newPassword || undefined, avatar: profileAvatar }) }); const d = await res.json(); if (!res.ok) { alert(d.detail || "Hata"); return; } if (newUsername) { localStorage.setItem("ajan_username", newUsername); setLoggedUsername(newUsername); } alert("Profil güncellendi!"); setShowProfile(false); setOldPassword(""); setNewPassword(""); setNewUsername(""); } catch { alert("Hata"); }
  };

  const createInvite = async () => { if (!current) return; try { const r = await fetch(`${API}/friend/invite/${current.serial_no}?pin=${current.pin}`, {method:"POST"}); const d = await r.json(); setFriendInviteUrl(d.invite_url); } catch { alert("Davet linki oluşturulamadı"); } };
  const joinFriend = async () => { if (!inviteCode.trim() || !current) return; try { const r = await fetch(`${API}/friend/join/${inviteCode.trim()}`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({serial_no: current.serial_no, pin: current.pin}) }); const d = await r.json(); if (d.status === "joined") { alert("Arkadaş eklendi!"); setInviteCode(""); loadFriends(); } } catch { alert("Katılım başarısız"); } };

  const completeOnboarding = () => { localStorage.setItem("onboarding_done", "1"); setShowOnboarding(false); };

  const mapHaftalikData = (tplType, tplData) => {
    if (!tplData?.regions) return tplData;
    const r = tplData.regions;
    const getVal = (region) => { if (!region) return ""; const items = region.data?.items; const content = region.data?.content; if (Array.isArray(items) && items.length > 0) return items; if (content) return content; return ""; };
    const haftalikTypes = ["haftalik_dikey","haftalik_yatay","haftalik_yatay_2","haftalik_tekli1","haftalik_tekli2","haftalik_kapanisi","yemek_plan"];
    if (haftalikTypes.includes(tplType)) {
      return { week: r.header?.data?.title || r.header?.data?.subtitle || "", month: r.header?.data?.title || "", monday: getVal(r.monday), tuesday: getVal(r.tuesday), wednesday: getVal(r.wednesday), thursday: getVal(r.thursday), friday: getVal(r.friday), saturday: getVal(r.saturday), sunday: getVal(r.sunday), notes: getVal(r.notes), energy_down: getVal(r.energy_down), proud: getVal(r.proud), release: getVal(r.release), lesson_rel: getVal(r.lesson_rel), lesson_work: getVal(r.lesson_work), lesson_self: getVal(r.lesson_self), next_intent: getVal(r.next_intent) };
    }
    const mapped = { design_id: tplData.design_id, title: tplData.title };
    Object.entries(r).forEach(([rid, region]) => { if (region.data) { const items = region.data.items; const content = region.data.content; mapped[rid] = (Array.isArray(items) && items.length > 0) ? items : (content || ""); Object.assign(mapped, region.data); } });
    return mapped;
  };

  // ─── RENDER HELPERS ────────────────────────────────────────────────

  const renderPageCard = (pageData, idx) => {
    const tplType = pageData.template_type || pageData.template?.design_id || (pageData.template_data?.design_id) || "notes";
    const rawData = pageData.template_data;
    const tplData = mapHaftalikData(tplType, rawData);
    const isEmpty = pageData.is_empty || !rawData;
    const bm = isBookmarked(pageData.page_no);
    const isCover = tplType === "cover";
    return (
      <div key={pageData.page_no}
        className={`page-card ${isEmpty ? "empty" : "filled"} ${isCover ? "cover-card" : ""}`}
        style={{"--delay": `${(idx||0) * 0.03}s`}}
        onClick={() => setActivePage(pageData)}>
        {/* CX: Kağıt dokusu - kapak hariç */}
        {!isCover && <div className="paper-grain" />}
        {/* CX: Sayfa kıvrımı - kapak hariç */}
        {!isCover && <div className="page-curl-effect" />}
        {/* CX: Sol margin çizgisi */}
        {!isCover && <div className="page-margin-line" />}
        {/* CX: Bombeli iç gölge - kapak hariç */}
        {!isCover && <div className="page-inner-shadow" />}
        {/* Etiketler */}
        {pageData.label_color && <div className="flip-page-label-bar" style={{background: pageData.label_color}} />}
        <div className="page-card-inner">
          {/* CX: Favori = KALP ikonu */}
          <button className={`fav-heart ${bm ? "active" : ""}`} onClick={e => { e.stopPropagation(); toggleBookmark(pageData.page_no); }} title="Favorilere ekle">
            {bm ? "❤️" : "🤍"}
          </button>
          {/* CX: Dolu badge - el yazısı tik */}
          {!isEmpty && <span className="filled-check" title="Dolu sayfa">✓</span>}
          {pageData.label_stamp && <div className="page-stamp">{pageData.label_stamp}</div>}
          <div className="page-card-preview">
            <PageTemplate type={tplType} data={tplData} empty={isEmpty} themeColor={themeColor} />
          </div>
        </div>
        {/* CX: Sayfa numarası açıklama kısmında (içinde değil) */}
        <div className="page-card-footer">
          <span className="pcf-num">{pageData.page_no}</span>
          <span className="pcf-title">{pageData.template?.title || tplType}</span>
        </div>
        {/* CX: AI sparkle on filled pages */}
        {!isEmpty && <div className="ai-sparkle-badge" title="AI ile analiz et">✦</div>}
      </div>
    );
  };

  const getAllPages = () => {
    const template = current?.template || {};
    const filledMap = {};
    pages.forEach(p => { filledMap[p.page_no] = p; });
    if (Object.keys(template).length > 0) {
      return Object.entries(template).map(([pageNo, tpl]) => {
        const no = parseInt(pageNo);
        const filled = filledMap[no];
        const tplType = tpl.design_id || tpl.regions?.[0]?.type || tpl.type || "notes";
        if (filled) return { ...filled, template: { ...tpl, title: tpl.title || filled.template?.title } };
        return { page_no: no, template: tpl, template_type: tplType, template_data: null, is_empty: true, image_url: null };
      }).sort((a, b) => a.page_no - b.page_no);
    }
    return pages;
  };

  // ─── UI RENDERS ────────────────────────────────────────────────────

  // Auth screens
  if (authMode === "register") {
    return (
      <div className="auth-screen">
        <div className="auth-header">
          <button className="auth-back" onClick={() => { setAuthMode("landing"); setError(""); }}>← Geri</button>
          <AjandaLogo size={24} light />
        </div>
        <div className="auth-body">
          <div className="auth-title">Yeni Ajanda Tanımla</div>
          <div className="auth-subtitle">Ajandanı sisteme ekle ve kullanıcı hesabı oluştur</div>
          <div className="auth-field"><label>Kullanıcı Adı</label><input className="auth-input" placeholder="örn: ahmet_ajanda" value={regUsername} onChange={e => setRegUsername(e.target.value.toLowerCase())} /></div>
          <div className="auth-field"><label>Şifre</label><input className="auth-input" type="password" placeholder="En az 4 karakter" value={regPassword} onChange={e => setRegPassword(e.target.value)} /></div>
          <div className="auth-field">
            <label>Ajanda Seri No</label>
            <input className="auth-input" placeholder="Kapak QR'ını okutun" value={regSerialNo} readOnly style={{cursor:"not-allowed", opacity: regSerialNo ? 1 : 0.5}} />
            <div className="auth-hint">
              <button className="auth-qr-btn" onClick={async () => { try { const blob = await takePhoto(); if (!blob) return; const form = new FormData(); form.append("file", blob, "cover.jpg"); const res = await fetch(`${API}/activate?pin=temp`, {method:"POST", body:form}); const d = await res.json(); if (d.serial_no) { setRegSerialNo(d.serial_no); setRegTheme(d.theme_id || "FERDI"); } else if (d.detail) setError(d.detail); } catch(e) { setError("QR okunamadı"); } }}>📷 Kapak QR'ını Okut</button>
              {regSerialNo && <span style={{color:"var(--gold)", fontSize:11}}>✓ {regSerialNo} {regTheme && `(${regTheme})`}</span>}
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="auth-btn" onClick={handleRegister} disabled={loading}>{loading ? "⏳ Kaydediliyor..." : "Ajandamı Oluştur →"}</button>
          <button className="auth-switch" onClick={() => { setAuthMode("login"); setError(""); }}>Zaten hesabın var mı? Giriş yap</button>
        </div>
      </div>
    );
  }

  if (authMode === "login") {
    return (
      <div className="auth-screen">
        <div className="auth-header">
          <button className="auth-back" onClick={() => { setAuthMode("landing"); setError(""); }}>← Geri</button>
          <AjandaLogo size={24} light />
        </div>
        <div className="auth-body">
          <div className="auth-title">Giriş Yap</div>
          <div className="auth-subtitle">Kullanıcı adın ve şifrenle giriş yap</div>
          <div className="auth-field"><label>Kullanıcı Adı</label><input className="auth-input" placeholder="Kullanıcı adın" value={loginUsername} onChange={e => setLoginUsername(e.target.value.toLowerCase())} onKeyDown={e => e.key === "Enter" && handleUserLogin()} /></div>
          <div className="auth-field"><label>Şifre</label><input className="auth-input" type="password" placeholder="Şifren" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleUserLogin()} /></div>
          {error && <div className="error-msg">{error}</div>}
          <button className="auth-btn" onClick={handleUserLogin} disabled={loading}>{loading ? "⏳ Giriş yapılıyor..." : "Giriş Yap →"}</button>
          <button className="auth-switch" onClick={() => { setAuthMode("register"); setError(""); }}>Yeni ajanda tanımlamak ister misin?</button>
        </div>
      </div>
    );
  }

  // Onboarding - CX: Giriş yapıldıysa gösterme
  if (showOnboarding && !current) {
    const steps = [
      { icon: "📒", title: "Hoş Geldin!", desc: "Fiziksel ajandanı dijitalleştir. Sayfalarını fotoğrafla, notlarına her yerden eriş.", action: "Başla" },
      { icon: "📷", title: "QR ile Aktive Et", desc: "Ajandanın iç kapağındaki QR kodu okut. Her sayfanın sağ üst köşesinde de QR var.", action: "Anladım" },
      { icon: "📸", title: "Sayfa Fotoğrafla", desc: "Sayfayı fotoğrafla, sistem otomatik kaydeder. El yazın dijitale dönüşür.", action: "Anladım" },
      { icon: "✦", title: "AI ile Analiz Et", desc: "Ajandanı yapay zeka ile analiz et. Alışkanlıklarını bul, öneriler al. Şahane!", action: "Başlayalım!" },
    ];
    const s = steps[onboardingStep];
    return (
      <div className="onboarding-screen">
        <div className="onboarding-dots">{steps.map((_,i) => <div key={i} className={`ob-dot ${i===onboardingStep?"active":""}`} />)}</div>
        <div className="onboarding-content">
          <div className="ob-icon">{s.icon}</div>
          <div className="ob-title">{s.title}</div>
          <div className="ob-desc">{s.desc}</div>
        </div>
        <div className="onboarding-actions">
          <button className="ob-btn-primary" onClick={() => { if (onboardingStep < steps.length - 1) setOnboardingStep(onboardingStep + 1); else completeOnboarding(); }}>{s.action}</button>
          <button className="ob-btn-skip" onClick={completeOnboarding}>Atla</button>
        </div>
      </div>
    );
  }

  // Kütüphane - CX: Web'den girince kitaplık görüntüsü
  if (showLibrary) {
    return (
      <div className="library-screen">
        <div className="library-header">
          <AjandaLogo size={36} light />
          <div className="library-subtitle">Ajandalarım</div>
          {loggedUsername && <div className="library-user">@{loggedUsername}</div>}
        </div>
        <div className="library-shelves">
          {journals.map((j, idx) => (
            <button key={j.serial_no} className="library-book" style={{"--bc": j.theme_color || "#edbc73", animationDelay: `${idx*0.08}s`}} onClick={async () => { setLoading(true); saveCurrent(j); await loadPages(j); loadStreak(j.serial_no); loadPremiumStatus(j.serial_no); setShowLibrary(false); setStep("dashboard"); setLoading(false); }}>
              <div className="lb-spine" />
              <div className="lb-cover"><div className="lb-texture" /><span className="lb-emoji">📓</span></div>
              <div className="lb-info"><div className="lb-name">{j.theme_name || j.theme_id}</div><div className="lb-serial">№{j.serial_no}</div></div>
              <span className="lb-arrow">→</span>
            </button>
          ))}
          <button className="library-book add-book" onClick={() => { setShowLibrary(false); setShowAddJournal(true); }}>
            <div className="lb-cover add-cover"><span style={{fontSize:28}}>+</span></div>
            <div className="lb-info"><div className="lb-name" style={{opacity:0.5}}>Yeni Ajanda Ekle</div></div>
          </button>
        </div>
        <div className="library-footer">
          <button className="lib-btn" onClick={() => { setShowLibrary(false); setAuthMode("landing"); }}>← Ana Sayfa</button>
          <button className="lib-btn danger" onClick={() => { saveCurrent(null); setJournals([]); setLoggedUsername(""); localStorage.clear(); setShowLibrary(false); setAuthMode("landing"); }}>Çıkış Yap</button>
        </div>
      </div>
    );
  }

  if (confirmData) return <ConfirmModal onConfirm={handleConfirmOverwrite} onCancel={() => setConfirmData(null)} />;
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

  // ─── SAYFA DETAY ──────────────────────────────────────────────────
  if (activePage) {
    const allPagesForDetail = getAllPages();
    const curIdx = allPagesForDetail.findIndex(p => p.page_no === activePage.page_no);
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 50) { if (dx < 0) goTo(curIdx + 1, "right"); else goTo(curIdx - 1, "left"); } };
    const tplType = activePage.template_data?.design_id || activePage.template?.design_id || activePage.template_type || "notes";
    const bookmarked = isBookmarked(activePage.page_no);
    const goTo = (idx, dir) => {
      if (idx >= 0 && idx < allPagesForDetail.length && !isFlipping) {
        setFlipDir(dir || (idx > curIdx ? "right" : "left"));
        setIsFlipping(true);
        setTimeout(() => { setActivePage(allPagesForDetail[idx]); setIsFlipping(false); setFlipDir(null); }, 400);
      }
    };

    return (
      <div className="detail-flip-screen" style={{"--tc": themeColor}}>
        <div className="df-header">
          <button className="df-back" onClick={() => setActivePage(null)}>←</button>
          <div className="df-header-center">
            <AjandaLogo size={20} light />
            <div className="df-page-meta">Koleksiyon: Klasik · {curIdx + 1} / {allPagesForDetail.length}</div>
          </div>
          <div className="df-header-actions">
            <button className={`df-action-btn ${bookmarked ? "active" : ""}`} onClick={() => toggleBookmark(activePage.page_no)} title="Favorilere ekle">{bookmarked ? "❤️" : "🤍"}</button>
            <button className="df-action-btn" onClick={() => setLabelPickerPage(activePage.page_no)} title="Etiket">🏷️</button>
            {!activePage.is_empty && <button className="df-action-btn" onClick={() => sharePage(activePage.page_no)} title="Paylaş">📤</button>}
          </div>
        </div>
        <div className={`df-content ${isFlipping ? `flip-anim-${flipDir}` : ""}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {activePage.image_url ? (
            <div className="df-photo-wrap"><img src={`${API}${activePage.image_url}`} alt="sayfa" className="df-photo" /></div>
          ) : (
            <div className="df-empty-page">
              <div className="paper-grain" />
              <div className="df-empty-lines">{Array.from({length: 20}).map((_,i) => <div key={i} className="df-empty-line" />)}</div>
              <div className="df-empty-hint">
                <span className="df-empty-icon">{activePage.template?.icon || "📄"}</span>
                <span>Bu sayfa henüz fotoğraflanmadı</span>
                <button className="df-photo-cta" onClick={() => { setActivePage(null); handleUploadPage(); }}>📸 Fotoğrafla</button>
              </div>
            </div>
          )}
          {!activePage.is_empty && activePage.ocr_text && (
            <div className="df-ocr">
              <div className="df-ocr-label">✏️ El Yazısı Notları</div>
              <OcrTextEditor tplType={tplType} data={editData || activePage.template_data} onSave={handleSaveEdit} />
            </div>
          )}
        </div>
        {/* CX: AI Analiz butonu her sayfanın altında */}
        <div className="df-ai-bar">
          <button className="df-ai-btn" onClick={getAiSummary} disabled={aiLoading}>
            <span className="ai-star">✦</span> {aiLoading ? "Analiz ediliyor..." : "Bu Sayfayı AI ile Analiz Et"}
          </button>
        </div>
        {curIdx > 0 && <button className="df-nav df-nav-prev" onClick={() => goTo(curIdx - 1, "left")}>‹</button>}
        {curIdx < allPagesForDetail.length - 1 && <button className="df-nav df-nav-next" onClick={() => goTo(curIdx + 1, "right")}>›</button>}
        <div className="df-thumbstrip">
          {allPagesForDetail.map((p, i) => (
            <div key={p.page_no} className={`df-thumb ${p.page_no === activePage.page_no ? "active" : ""} ${!p.is_empty ? "filled" : ""}`} onClick={() => goTo(i, i > curIdx ? "right" : "left")}>
              {!p.is_empty && p.image_url ? <img src={`${API}${p.image_url}`} alt="" className="df-thumb-img" /> : <div className="df-thumb-empty">{p.template?.icon || "📄"}</div>}
              <div className="df-thumb-num">{p.page_no}</div>
              {isBookmarked(p.page_no) && <div className="df-thumb-bm">❤️</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────
  if (current && step === "dashboard") {
    const allPagesList = getAllPages();
    return (
      <div className="journal-app" style={{"--tc": themeColor}}>
        {/* CX: Kapak şeridi - logo + koleksiyon + kişiselleştirilebilir renk */}
        <div className="journal-cover-strip">
          <div className="journal-cover-texture" />
          <div className="journal-cover-content">
            <AjandaLogo size={28} light />
            <div className="journal-meta">
              <span className="journal-collection">Koleksiyon: {current.theme_name || "Klasik"}</span>
              <span className="journal-serial">№ {current.serial_no}</span>
            </div>
          </div>
          <div className="journal-cover-actions">
            {/* CX: Büyük, dikkat çekici kamera butonu */}
            <button className="jc-btn camera-main" onClick={handleUploadPage} disabled={loading} title="Sayfa Fotoğrafla">{loading ? "⏳" : "📸"}</button>
            <button className="jc-btn" onClick={() => { saveCurrent(null); setShowLibrary(true); }} title="Kütüphane">📚</button>
          </div>
        </div>
        {/* CX: Kişiselleştirilebilir renk seçici */}
        <div className="color-picker-strip">
          {["#edbc73","#dfe7e9","#c2185b","#5c6bc0","#558b2f","#37474f","#8b2500","#f57c00","#00695c","#1a237e"].map(c => (
            <button key={c} className={`color-pick ${themeColor===c?"active":""}`} style={{background:c}} onClick={() => setUserColor(c)} />
          ))}
        </div>

        {error && <div className="error-msg" style={{margin:"0 16px 8px"}}>{error}</div>}

        {/* CX: Arama + Filtre - daha büyük butonlar, tooltip'li */}
        <div className="journal-toolbar">
          <div className={`search-bar ${searchOpen ? "open" : ""}`}>
            <button className="search-toggle" onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }} title="Sayfalarımda ara">🔍</button>
            {searchOpen && <input className="search-input" autoFocus placeholder="Dolu sayfalarda ara..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />}
            {searchQuery && <span className="search-count">{searchResults.length} sonuç</span>}
          </div>
          <div className="filter-tabs">
            {[["all","Tümü"],["filled","✓ Dolu"],["empty","○ Boş"],["bookmarked","❤️"]].map(([f,l]) => (
              <button key={f} className={`filter-tab ${filterMode===f?"active":""}`} onClick={() => setFilterMode(f)} title={f==="bookmarked"?"Favoriler":l}>{l}</button>
            ))}
          </div>
        </div>

        {/* CX: Flip Book - kağıt hissiyatlı kartlar */}
        <div className="flipbook-container" ref={scrollRef}>
          <div className="flipbook-pages">
            {allPagesList
              .filter(p => {
                if (searchQuery && searchResults.length > 0) return searchResults.some(r => r.page_no === p.page_no);
                if (filterMode === "filled") return !p.is_empty;
                if (filterMode === "empty") return p.is_empty;
                if (filterMode === "bookmarked") return isBookmarked(p.page_no);
                return true;
              })
              .map((pageData, idx) => renderPageCard(pageData, idx))}
          </div>
        </div>

        {/* CX: AI vurgusu güçlü banner */}
        <div className="ai-banner">
          <div className="ai-banner-inner" onClick={() => setActiveTab("chat")}>
            <span className="ai-star-big">✦</span>
            <div><div className="ai-banner-title">AI Asistan</div><div className="ai-banner-sub">Ajandanı analiz et, öneriler al</div></div>
            <span className="ai-arrow">→</span>
          </div>
        </div>

        <div className="journal-footer">
          <span>{pages.length} / {Object.keys(current.template || {}).length || "?"} sayfa</span>
          {streakData?.current_streak > 0 && <span className="streak-badge">🔥 {streakData.current_streak} gün</span>}
          {isPremium && <span className="premium-badge">⭐ Premium</span>}
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          {[{id:"pages",icon:"📖",label:"Sayfalar"},{id:"stats",icon:"📊",label:"İstatistik"},{id:"chat",icon:"✦",label:"AI Asistan"},{id:"friends",icon:"👥",label:"Arkadaş"},{id:"settings",icon:"⚙️",label:"Ayarlar"}].map(t => (
            <button key={t.id} className={`bnav-btn ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>
              <span className="bnav-icon">{t.icon}</span>
              <span className="bnav-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === "stats" && (
          <div className="tab-panel">
            {streakData && (
              <div className="stats-card">
                <div className="stats-card-title">🔥 Streak</div>
                <div className="stats-row">
                  <div className="stats-num-block"><div className="stats-big">{streakData.current_streak}</div><div className="stats-sub">Güncel</div></div>
                  <div className="stats-num-block"><div className="stats-big">{streakData.longest_streak}</div><div className="stats-sub">En uzun</div></div>
                  <div className="stats-num-block"><div className="stats-big">{streakData.total_active_days}</div><div className="stats-sub">Toplam gün</div></div>
                </div>
                <div className="heatmap">
                  {Array.from({length:52}).map((_,wi) => (
                    <div key={wi} className="heatmap-col">
                      {Array.from({length:7}).map((_,di) => {
                        const dayOffset = wi*7 + di;
                        const d = new Date(); d.setDate(d.getDate() - (363 - dayOffset));
                        const key = d.toISOString().split("T")[0];
                        const hit = streakData.heatmap?.find(h => h.day === key);
                        return <div key={di} className={`heatmap-cell ${hit ? "active" : ""}`} title={key} />;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {yearlyReport && !yearlyReport.error && (
              <div className="stats-card wrapped-card">
                <div className="stats-card-title">🎉 Yıllık Özet</div>
                <div className="stats-row">
                  <div className="stats-num-block"><div className="stats-big">{yearlyReport.total_pages}</div><div className="stats-sub">Sayfa</div></div>
                  <div className="stats-num-block"><div className="stats-big">{yearlyReport.months_active}</div><div className="stats-sub">Aktif Ay</div></div>
                </div>
                <div className="wrapped-most">En çok: <strong>{yearlyReport.most_used_template?.replace(/_/g,' ')}</strong></div>
                {yearlyReport.top_words?.length > 0 && <div className="wrapped-words">{yearlyReport.top_words.map((w,i) => <span key={i} className="word-chip">{w.word}</span>)}</div>}
              </div>
            )}
            <div className="stats-card">
              <div className="stats-card-title">✦ AI Analizi</div>
              {aiSummary ? (
                <>
                  <p className="ai-summary-text">{aiSummary.summary}</p>
                  {aiSummary.motivation && <div className="ai-motivation">💪 {aiSummary.motivation}</div>}
                  {aiSummary.topics?.length > 0 && <div className="wrapped-words">{aiSummary.topics.map((t,i) => <span key={i} className="word-chip">{t}</span>)}</div>}
                </>
              ) : (
                <button className="ai-btn" onClick={getAiSummary} disabled={aiLoading}>{aiLoading ? "⏳ Analiz ediliyor..." : "✦ Ajandamı Analiz Et"}</button>
              )}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="tab-panel chat-panel">
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">✦</div>
                  <div>Ajandan hakkında soru sor</div>
                  <div className="chat-suggestions">
                    {["Bu haftaki planlarım?","Hangi alışkanlıklarım var?","Bu ayki bütçem?","Bana şablon öner"].map(s => (
                      <button key={s} className="chat-suggestion" onClick={() => setChatInput(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((m,i) => <div key={i} className={`chat-msg ${m.role}`}>{m.content}</div>)}
              {chatLoading && <div className="chat-msg assistant chat-typing">✦ düşünüyor...</div>}
            </div>
            <div className="chat-input-row">
              <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChatMessage()} placeholder="Ajandana sor..." />
              <button className="chat-send" onClick={sendChatMessage} disabled={chatLoading}>→</button>
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="tab-panel">
            <div className="friends-header"><div className="friends-title">👥 Arkadaşlar</div><button className="friends-invite-btn" onClick={() => { createInvite(); loadFriends(); }}>+ Davet Et</button></div>
            {friendInviteUrl && <div className="invite-card"><div className="invite-label">Davet Linki</div><div className="invite-url">{friendInviteUrl}</div><button className="invite-copy" onClick={() => { navigator.clipboard.writeText(friendInviteUrl); alert("Kopyalandı!"); }}>📋 Kopyala</button></div>}
            <div className="join-card"><div className="join-label">Davet Koduna Katıl</div><div className="join-row"><input className="join-input" placeholder="Davet kodu gir..." value={inviteCode} onChange={e => setInviteCode(e.target.value)} /><button className="join-btn" onClick={joinFriend}>Katıl</button></div></div>
            <div className="friends-section-title">Arkadaşlarım</div>
            {friends.length === 0 ? <div className="friends-empty"><div style={{fontSize:36}}>👥</div><div>Henüz arkadaş yok</div></div> : friends.map(f => (
              <div key={f.friend_serial_no} className="friend-card"><div className="fc-avatar">📓</div><div className="fc-info"><div className="fc-sno">#{f.friend_serial_no}</div><div className="fc-meta">{f.theme_id} • {f.page_count} sayfa</div></div></div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-panel settings-panel">
            <div className="settings-section">
              <div className="settings-title">Görünüm</div>
              <div className="settings-row"><span>Karanlık Mod</span><button className={`toggle-btn ${darkMode?"on":""}`} onClick={() => setDarkMode(!darkMode)}><div className="toggle-knob" /></button></div>
            </div>
            <div className="settings-section">
              <div className="settings-title">Premium</div>
              {isPremium ? <div className="premium-active-card"><div className="premium-active-icon">⭐</div><div><div className="premium-active-title">Premium Aktif</div><div className="premium-active-sub">Tüm özelliklere erişimin var</div></div></div> : (
                <div className="premium-card">
                  <div className="premium-title">AJAN-DA Premium</div>
                  <div className="premium-features">{["Sınırsız ajanda","AI özet & analiz","PDF & JSON yedekleme","Gelişmiş istatistikler","Şablon önerileri"].map(f => <div key={f} className="premium-feature">✓ {f}</div>)}</div>
                </div>
              )}
            </div>
            <div className="settings-section">
              <div className="settings-title">Dışa Aktar</div>
              <button className="settings-action-btn" onClick={exportPDF} disabled={exportLoading}>{exportLoading ? "⏳ PDF oluşturuluyor..." : "📄 PDF Olarak İndir"}</button>
              <button className="settings-action-btn" onClick={exportJSON} style={{marginTop:6}}>💾 JSON Yedekleme</button>
            </div>
            <div className="settings-section">
              <div className="settings-title">Bildirimler</div>
              <div className="settings-row"><span>Günlük Hatırlatıcı</span><button className={`toggle-btn ${pushEnabled?"on":""}`} onClick={pushEnabled ? () => setPushEnabled(false) : enablePushNotifications}><div className="toggle-knob" /></button></div>
              <div className="settings-hint">Her gün ajanda yazmadığında hatırlatır</div>
            </div>
            <div className="settings-section">
              <div className="settings-title">Hesap</div>
              <div style={{padding:"8px 0"}}><div style={{fontSize:11, color:"var(--warm)", marginBottom:6}}>E-posta (haftalık özet için)</div><EmailSaver serialNo={current.serial_no} api={API} /></div>
              <div className="settings-row clickable" onClick={() => { loadProfile(); setShowProfile(true); }}><span>👤 Profili Düzenle</span><span>→</span></div>
              <div className="settings-row clickable" onClick={() => setShowAddJournal(true)}><span>📒 Yeni Ajanda Ekle</span><span>+</span></div>
              <div className="settings-row clickable" onClick={() => { saveCurrent(null); setActiveTab("pages"); setShowLibrary(true); }}><span style={{color:"#e74c3c"}}>Çıkış Yap</span><span>↩</span></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (current && step !== "dashboard" && !showLibrary) { setStep("dashboard"); }

  // ─── LANDING PAGE ─────────────────────────────────────────────────
  return (
    <div className="app-landing">
      <nav className="al-nav">
        <AjandaLogo size={22} />
        <div className="al-nav-links">
          <a href="#ozellikler">Özellikler</a>
          <a href="#fiyatlar">Fiyatlar</a>
          {loggedUsername ? <button className="al-nav-cta" onClick={() => setShowLibrary(true)}>Panele Gir →</button> : <button className="al-nav-cta" onClick={() => setAuthMode("login")}>Giriş Yap →</button>}
        </div>
      </nav>

      <section className="al-hero">
        <div className="al-hero-bg" />
        <div className="al-hero-texture" />
        <div className="al-hero-content">
          <div className="al-badge">✦ Yeni Nesil Ajanda Deneyimi</div>
          <h1 className="al-h1">Fiziksel ajandanı<br/><span>dijitalleştir</span></h1>
          <p className="al-p">Kağıda yazdıklarını dijitale taşı. QR kodlu ajandanı fotoğrafla, notlarına her yerden eriş. AI ile analiz et.</p>
          <div className="al-btns">
            <button className="al-btn-primary" onClick={() => setAuthMode("login")}>Giriş Yap →</button>
            <button className="al-btn-secondary" onClick={() => setAuthMode("register")}>📒 Yeni Ajanda Tanımla</button>
          </div>
          {error && <div className="error-msg" style={{marginTop:12}}>{error}</div>}
        </div>
        <div className="al-hero-visual">
          <div className="al-mockup">
            <div className="al-mockup-spine" />
            <div className="al-mockup-content"><AjandaLogo size={10} light /><div className="al-mockup-divider" /><div className="al-mockup-pages">{Array.from({length:8}).map((_,i) => <div key={i} className="al-mockup-line" />)}</div></div>
            <div className="al-mockup-qr">📱</div>
            <div className="al-scan-ring" />
          </div>
        </div>
      </section>

      <section className="al-section al-features" id="ozellikler">
        <div className="al-tag">✦ Özellikler</div>
        <h2 className="al-section-title">Her şey bir arada</h2>
        <div className="al-features-grid">
          {[
            {icon:"📸", title:"Fotoğraf ile Kaydet", desc:"Sayfayı fotoğrafla, QR kod otomatik okunur. OCR ile el yazın metne dönüşür."},
            {icon:"✦", title:"AI Analiz", desc:"Ajandanı AI ile analiz et. Alışkanlıklarını bul, haftalık özetler al, şablon önerileri."},
            {icon:"📖", title:"Defter Hissiyatı", desc:"Gerçek bir defter gibi sayfa çevir. Kağıt dokusu, oval köşeler, nostaljik his."},
            {icon:"📊", title:"İstatistikler", desc:"Streak takibi, yıllık heatmap, en çok kullandığın şablonlar."},
            {icon:"👥", title:"Arkadaş Sistemi", desc:"Ajandanı arkadaşlarınla paylaş, birbirinin sayfalarını gör."},
            {icon:"🔒", title:"Güvenli & Özel", desc:"PIN korumalı. İstediğin zaman PDF veya JSON olarak indir."},
          ].map(f => (
            <div key={f.title} className="al-feature-card"><div className="al-feature-icon">{f.icon}</div><div className="al-feature-title">{f.title}</div><div className="al-feature-desc">{f.desc}</div></div>
          ))}
        </div>
      </section>

      <section className="al-section al-pricing" id="fiyatlar">
        <div className="al-tag">✦ Fiyatlar</div>
        <h2 className="al-section-title">Basit ve şeffaf</h2>
        <div className="al-pricing-grid">
          <div className="al-pricing-card">
            <div className="al-pricing-name">Ücretsiz</div>
            <div className="al-pricing-price">₺0</div>
            {["1 ajanda","Fotoğraf yükleme","OCR metin okuma","Temel arama"].map(f => <div key={f} className="al-pricing-feature">✓ {f}</div>)}
            <button className="al-pricing-btn al-pricing-outline" onClick={() => setAuthMode("register")}>Başla →</button>
          </div>
          <div className="al-pricing-card al-pricing-featured">
            <div className="al-pricing-badge">En Popüler</div>
            <div className="al-pricing-name">Premium</div>
            <div className="al-pricing-price">₺99<span>/ay</span></div>
            {["Sınırsız ajanda","AI analiz & öneriler","PDF yedekleme","Gelişmiş istatistik","Arkadaş sistemi"].map(f => <div key={f} className="al-pricing-feature">✓ {f}</div>)}
            <button className="al-pricing-btn al-pricing-solid" onClick={() => setAuthMode("register")}>Premium'a Geç →</button>
          </div>
        </div>
      </section>

      <section className="al-cta">
        <div className="al-cta-bg" />
        <div className="al-cta-content">
          <h2 className="al-cta-title">Ajandanı dijitalleştir</h2>
          <p className="al-cta-sub">Ücretsiz başla, istediğin zaman premium'a geç.</p>
          <button className="al-btn-primary" onClick={() => setAuthMode("register")}>Hemen Başla →</button>
        </div>
      </section>

      <footer className="al-footer">
        <AjandaLogo size={18} />
        <div className="al-footer-links"><a href="mailto:info@sociozk.com">İletişim</a></div>
        <div className="al-footer-copy">© 2025 AJAN-DA</div>
      </footer>
    </div>
  );
}

// ─── STİLLER — CX RAPORU GÜNCELLEMELERİYLE ─────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #f8f5f0;
    --paper: #fffdf8;
    --ink: #2c2c2c;
    --warm: #8a7e72;
    --gold: #edbc73;
    --mint: #dfe7e9;
    --border: #e8e2d8;
    --soft: #f0ebe3;
    --green: #7ab87a;
    --red: #c0392b;
    --tc: #edbc73;
    --radius: 14px;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    background: var(--cream);
    color: var(--ink);
    min-height: 100vh;
    /* CX: kağıt grain dokusu */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
  }

  body.dark { --cream: #1a1816; --paper: #242220; --ink: #f0ebe3; --warm: #a89880; --border: #3d3530; --soft: #2d2820; --mint: #2d3838; }

  /* ─── KAĞIT EFEKTLERI (CX Raporu) ────────────── */
  .paper-grain {
    position: absolute; inset: 0; border-radius: var(--radius); pointer-events: none; opacity: 0.4;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E");
  }
  .page-curl-effect {
    position: absolute; bottom: 0; right: 0; width: 20px; height: 20px;
    background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%);
    border-radius: 0 0 var(--radius) 0; pointer-events: none;
  }
  .page-margin-line {
    position: absolute; left: 18px; top: 24px; bottom: 24px; width: 1px;
    background: rgba(210,170,150,0.25); pointer-events: none;
  }
  /* CX: İç gölge - bombeli his */
  .page-inner-shadow {
    position: absolute; inset: 0; border-radius: var(--radius); pointer-events: none;
    box-shadow: inset 3px 0 8px rgba(0,0,0,0.04), inset -2px 0 6px rgba(0,0,0,0.03), inset 0 2px 4px rgba(0,0,0,0.02);
  }

  /* ─── AUTH SCREENS ───────────────────────────── */
  .auth-screen { min-height: 100vh; background: #1c1410; display: flex; flex-direction: column; }
  .auth-header { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .auth-back { background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.6); border-radius: 6px; padding: 6px 12px; font-family: "Montserrat",sans-serif; font-size: 13px; cursor: pointer; }
  .auth-body { flex: 1; padding: 32px 24px; display: flex; flex-direction: column; gap: 16px; max-width: 400px; width: 100%; margin: 0 auto; }
  .auth-title { font-family: "Cormorant Garamond",serif; font-size: 28px; font-weight: 600; color: white; }
  .auth-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-top: -8px; }
  .auth-field { display: flex; flex-direction: column; gap: 6px; }
  .auth-field label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 0.5px; text-transform: uppercase; }
  .auth-input { padding: 12px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: white; font-family: "Montserrat",sans-serif; font-size: 15px; outline: none; }
  .auth-input:focus { border-color: var(--gold); }
  .auth-hint { font-size: 11px; color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .auth-qr-btn { padding: 6px 12px; background: rgba(237,188,115,0.2); border: 1px solid rgba(237,188,115,0.4); border-radius: 6px; color: var(--gold); font-family: "Montserrat",sans-serif; font-size: 12px; cursor: pointer; }
  .auth-btn { padding: 14px; background: var(--gold); color: white; border: none; border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: 0.5px; transition: all 0.2s; }
  .auth-btn:hover:not(:disabled) { background: white; color: var(--ink); }
  .auth-btn:disabled { opacity: 0.5; }
  .auth-switch { background: none; border: none; color: rgba(255,255,255,0.3); font-family: "Montserrat",sans-serif; font-size: 12px; cursor: pointer; text-align: center; padding: 8px; }

  /* ─── ONBOARDING ─────────────────────────────── */
  .onboarding-screen { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(160deg, #1c1410 0%, #3d2010 50%, #1c1410 100%); color: white; position: relative; }
  .onboarding-dots { display: flex; justify-content: center; gap: 8px; padding: 60px 0 0; }
  .ob-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.2); transition: all 0.3s; }
  .ob-dot.active { background: var(--gold); width: 24px; border-radius: 4px; }
  .onboarding-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 32px; text-align: center; }
  .ob-icon { font-size: 72px; margin-bottom: 24px; animation: obFloat 3s ease-in-out infinite; }
  @keyframes obFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .ob-title { font-family: "Cormorant Garamond",serif; font-size: 28px; font-weight: 600; margin-bottom: 16px; }
  .ob-desc { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.6); max-width: 280px; }
  .onboarding-actions { padding: 32px; display: flex; flex-direction: column; gap: 10px; }
  .ob-btn-primary { padding: 16px; background: var(--gold); color: white; border: none; border-radius: 12px; font-family: "Montserrat",sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; }
  .ob-btn-skip { padding: 12px; background: none; border: none; color: rgba(255,255,255,0.3); font-family: "Montserrat",sans-serif; font-size: 13px; cursor: pointer; }

  /* ─── LIBRARY ────────────────────────────────── */
  .library-screen { min-height: 100vh; background: #1c1410; display: flex; flex-direction: column; }
  .library-header { padding: 48px 24px 24px; text-align: center; background: linear-gradient(180deg,#1c1410,#2d1f15); }
  .library-subtitle { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-top: 8px; }
  .library-user { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }
  .library-shelves { flex: 1; padding: 32px 20px; display: flex; flex-direction: column; gap: 12px; }
  .library-book { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid var(--bc); border-radius: 8px; cursor: pointer; text-align: left; font-family: "Montserrat",sans-serif; transition: all 0.2s; animation: fadeIn 0.3s ease both; }
  .library-book:hover { background: rgba(255,255,255,0.1); }
  .lb-spine { display: none; }
  .lb-cover { width: 48px; height: 64px; background: var(--bc); border-radius: 2px 6px 6px 2px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 3px 4px 12px rgba(0,0,0,0.3); position: relative; overflow: hidden; }
  .lb-texture { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cline x1='0' y1='2' x2='4' y2='2' stroke='%23fff' stroke-width='0.5' opacity='0.08'/%3E%3C/svg%3E"); }
  .lb-emoji { font-size: 18px; position: relative; z-index: 1; }
  .lb-info { flex: 1; }
  .lb-name { font-family: "Cormorant Garamond",serif; font-size: 18px; color: white; font-weight: 600; }
  .lb-serial { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
  .lb-arrow { color: rgba(255,255,255,0.3); font-size: 18px; }
  .add-book { border-style: dashed; border-color: rgba(255,255,255,0.15); }
  .add-cover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.3); }
  .library-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 12px; }
  .lib-btn { background: none; border: none; color: rgba(255,255,255,0.3); font-family: "Montserrat",sans-serif; font-size: 13px; cursor: pointer; }
  .lib-btn.danger { color: #e74c3c; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* ─── JOURNAL APP (dashboard) ────────────────── */
  .journal-app { min-height: 100vh; background: var(--cream); display: flex; flex-direction: column; }

  .journal-cover-strip { background: var(--tc); padding: 0; position: relative; overflow: hidden; min-height: 90px; display: flex; align-items: center; }
  .journal-cover-texture { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cline x1='0' y1='4' x2='8' y2='4' stroke='%23fff' stroke-width='0.6' opacity='0.1'/%3E%3Cline x1='4' y1='0' x2='4' y2='8' stroke='%23fff' stroke-width='0.6' opacity='0.1'/%3E%3C/svg%3E"); pointer-events: none; }
  .journal-cover-content { flex: 1; padding: 16px 16px; position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; }
  .journal-meta { display: flex; flex-direction: column; gap: 1px; }
  .journal-collection { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 500; }
  .journal-serial { font-family: "Cormorant Garamond",serif; font-size: 11px; color: rgba(255,255,255,0.4); font-style: italic; }
  .journal-cover-actions { display: flex; gap: 8px; padding: 12px 16px; position: relative; z-index: 1; }
  /* CX: Büyük kamera butonu */
  .jc-btn { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.3); color: white; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .jc-btn:hover { background: rgba(255,255,255,0.3); }
  .jc-btn.camera-main { width: 52px; height: 52px; background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.5); font-size: 22px; }

  /* CX: Renk seçici */
  .color-picker-strip { display: flex; justify-content: center; gap: 8px; padding: 6px 16px 10px; background: rgba(0,0,0,0.03); }
  .color-pick { width: 18px; height: 18px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
  .color-pick.active { border-color: var(--ink); transform: scale(1.3); box-shadow: 0 0 0 2px rgba(0,0,0,0.1); }

  /* ─── TOOLBAR ────────────────────────────────── */
  .journal-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--paper); border-bottom: 1px solid var(--border); gap: 8px; }
  .search-bar { display: flex; align-items: center; gap: 6px; flex: 1; max-width: 200px; }
  .search-toggle { background: none; border: none; font-size: 18px; cursor: pointer; padding: 6px; border-radius: 8px; }
  .search-input { flex: 1; border: 1.5px solid var(--border); border-radius: 20px; padding: 6px 14px; font-size: 12px; font-family: "Montserrat",sans-serif; outline: none; background: white; }
  .search-input:focus { border-color: var(--gold); }
  .search-count { font-size: 10px; color: var(--gold); font-weight: 600; }
  /* CX: Daha büyük filtre butonları */
  .filter-tabs { display: flex; gap: 4px; }
  .filter-tab { padding: 6px 12px; border: 1.5px solid var(--border); border-radius: 20px; background: white; font-size: 11px; font-family: "Montserrat",sans-serif; font-weight: 600; cursor: pointer; color: var(--warm); transition: all 0.15s; white-space: nowrap; }
  .filter-tab.active { background: var(--gold); border-color: var(--gold); color: white; }

  /* ─── FLIPBOOK ───────────────────────────────── */
  .flipbook-container { flex: 1; overflow-x: auto; overflow-y: hidden; padding: 16px 12px 8px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .flipbook-container::-webkit-scrollbar { height: 3px; }
  .flipbook-container::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }
  .flipbook-pages { display: flex; gap: 12px; padding: 4px 8px 20px; width: max-content; }

  /* CX: Kağıt hissiyatlı sayfa kartları */
  .page-card {
    width: 130px; height: 190px; background: var(--paper);
    /* CX: Oval köşeler */
    border-radius: var(--radius);
    cursor: pointer; position: relative; scroll-snap-align: start; flex-shrink: 0;
    animation: cardAppear 0.4s ease var(--delay, 0s) both;
    transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s;
    /* CX: Katmanlı gölge - ambient occlusion */
    box-shadow: 1px 2px 8px rgba(0,0,0,0.08), 3px 6px 20px rgba(0,0,0,0.06), inset -2px 0 6px rgba(0,0,0,0.03);
    overflow: hidden; display: flex; flex-direction: column;
  }
  .page-card:hover { transform: translateY(-6px) rotate(-0.5deg); box-shadow: 2px 8px 24px rgba(0,0,0,0.14), 4px 12px 32px rgba(0,0,0,0.08); z-index: 5; }
  .page-card.filled { background: white; }
  .page-card.cover-card { border-radius: 6px; }
  @keyframes cardAppear { from { opacity: 0; transform: translateY(16px) rotate(1deg); } to { opacity: 1; transform: translateY(0) rotate(0deg); } }

  .page-card-inner { flex: 1; padding: 6px; position: relative; overflow: hidden; }
  /* CX: Favori = KALP */
  .fav-heart { position: absolute; top: 4px; left: 4px; z-index: 3; background: none; border: none; font-size: 14px; cursor: pointer; padding: 2px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1)); transition: transform 0.2s; }
  .fav-heart:hover { transform: scale(1.3); }
  .fav-heart.active { animation: heartPop 0.3s ease; }
  @keyframes heartPop { 50% { transform: scale(1.5); } }
  /* CX: El yazısı tik */
  .filled-check { position: absolute; top: 4px; right: 4px; z-index: 3; font-size: 14px; color: var(--green); font-weight: 700; font-family: "Cormorant Garamond",serif; font-style: italic; }
  .page-stamp { position: absolute; top: 18px; right: 4px; font-size: 12px; z-index: 2; }
  .page-card-preview { transform: scale(0.42); transform-origin: top left; width: 238%; height: 238%; pointer-events: none; }

  /* CX: Sayfa numarası açıklama kısmında */
  .page-card-footer { padding: 3px 6px; display: flex; align-items: center; gap: 4px; background: linear-gradient(transparent, var(--paper)); }
  .pcf-num { font-family: "Cormorant Garamond",serif; font-size: 11px; font-weight: 700; color: var(--gold); min-width: 16px; }
  .pcf-title { font-size: 7px; color: var(--warm); font-weight: 500; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .flip-page-label-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: var(--radius) var(--radius) 0 0; z-index: 3; }

  /* CX: AI sparkle her sayfada */
  .ai-sparkle-badge { position: absolute; bottom: 24px; right: 4px; font-size: 11px; color: var(--gold); animation: sparkleFloat 2s ease-in-out infinite; }
  @keyframes sparkleFloat { 0%,100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(-2px); opacity: 1; } }

  /* ─── AI BANNER (CX: güçlü vurgu) ────────────── */
  .ai-banner { padding: 0 14px 8px; }
  .ai-banner-inner { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: linear-gradient(135deg, var(--ink) 0%, #3d3530 100%); border-radius: 14px; cursor: pointer; transition: transform 0.2s; }
  .ai-banner-inner:hover { transform: translateY(-2px); }
  .ai-star-big { font-size: 24px; color: var(--gold); }
  .ai-banner-title { font-size: 13px; font-weight: 700; color: white; }
  .ai-banner-sub { font-size: 11px; color: rgba(255,255,255,0.5); }
  .ai-arrow { font-size: 18px; color: var(--gold); margin-left: auto; }

  .journal-footer { padding: 8px 16px 12px; font-size: 11px; color: var(--warm); text-align: center; }
  .streak-badge { font-size: 11px; color: #e67e22; font-weight: 600; margin-left: 8px; }
  .premium-badge { font-size: 11px; color: gold; font-weight: 600; margin-left: 8px; }

  /* ─── BOTTOM NAV ─────────────────────────────── */
  .bottom-nav { display: flex; background: var(--paper); border-top: 1px solid var(--border); position: sticky; bottom: 0; z-index: 100; }
  .bnav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 4px 8px; background: none; border: none; cursor: pointer; font-family: "Montserrat",sans-serif; }
  .bnav-icon { font-size: 18px; transition: transform 0.2s; }
  .bnav-label { font-size: 9px; color: var(--warm); letter-spacing: 0.3px; font-weight: 500; }
  .bnav-btn.active .bnav-label { color: var(--gold); font-weight: 700; }
  .bnav-btn.active .bnav-icon { transform: translateY(-2px); }

  /* ─── DETAIL SCREEN ──────────────────────────── */
  .detail-flip-screen { display: flex; flex-direction: column; min-height: 100vh; background: var(--cream); position: relative; }
  .df-header { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--tc); position: relative; overflow: hidden; flex-shrink: 0; }
  .df-header::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Cline x1='0' y1='3' x2='6' y2='3' stroke='%23fff' stroke-width='0.8' opacity='0.07'/%3E%3Cline x1='3' y1='0' x2='3' y2='6' stroke='%23fff' stroke-width='0.8' opacity='0.07'/%3E%3C/svg%3E"); pointer-events: none; }
  .df-back { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 50%; width: 34px; height: 34px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; z-index: 1; }
  .df-header-center { flex: 1; position: relative; z-index: 1; }
  .df-page-meta { font-size: 10px; color: rgba(255,255,255,0.5); font-style: italic; margin-top: 2px; }
  .df-header-actions { display: flex; gap: 6px; position: relative; z-index: 1; }
  .df-action-btn { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 50%; width: 34px; height: 34px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .df-action-btn:hover { background: rgba(255,255,255,0.25); }
  .df-action-btn.active { background: rgba(255,255,255,0.3); }

  .df-content { flex: 1; overflow-y: auto; padding: 12px 12px 8px; perspective: 1200px; }
  @keyframes flipRight { 0%{transform:perspective(1200px) rotateY(0);opacity:1} 40%{transform:perspective(1200px) rotateY(-90deg) scaleX(.8);opacity:.3} 41%{transform:perspective(1200px) rotateY(90deg) scaleX(.8);opacity:.3} 100%{transform:perspective(1200px) rotateY(0);opacity:1} }
  @keyframes flipLeft { 0%{transform:perspective(1200px) rotateY(0);opacity:1} 40%{transform:perspective(1200px) rotateY(90deg) scaleX(.8);opacity:.3} 41%{transform:perspective(1200px) rotateY(-90deg) scaleX(.8);opacity:.3} 100%{transform:perspective(1200px) rotateY(0);opacity:1} }
  .flip-anim-right { animation: flipRight 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
  .flip-anim-left { animation: flipLeft 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

  .df-photo-wrap { border-radius: var(--radius); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); margin-bottom: 10px; max-height: 55vh; display: flex; justify-content: center; }
  .df-photo { max-width: 100%; max-height: 55vh; object-fit: contain; border-radius: var(--radius); }

  .df-empty-page { background: var(--paper); border-radius: var(--radius); border: 1px solid var(--border); min-height: 280px; position: relative; overflow: hidden; margin-bottom: 10px; }
  .df-empty-lines { padding: 20px 16px; display: flex; flex-direction: column; gap: 18px; }
  .df-empty-line { height: 1px; background: rgba(180,160,140,0.15); }
  .df-empty-hint { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--warm); font-size: 13px; }
  .df-empty-icon { font-size: 36px; opacity: 0.3; }
  .df-photo-cta { padding: 10px 20px; background: var(--gold); color: white; border: none; border-radius: 24px; font-family: "Montserrat",sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }

  .df-ocr { background: white; border-radius: var(--radius); border: 1px solid var(--border); padding: 14px; margin-bottom: 10px; }
  .df-ocr-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--warm); margin-bottom: 10px; }

  /* CX: AI analiz butonu her sayfanın altında */
  .df-ai-bar { padding: 8px 12px; border-top: 1px solid var(--border); background: var(--paper); }
  .df-ai-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, var(--ink), #3d3530); color: white; border: none; border-radius: 12px; font-family: "Montserrat",sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .ai-star { color: var(--gold); font-size: 16px; }

  .df-nav { position: fixed; top: 50%; transform: translateY(-50%); width: 38px; height: 54px; background: rgba(255,255,255,0.95); border: 1px solid var(--border); border-radius: 8px; font-size: 22px; color: var(--ink); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 12px rgba(0,0,0,0.1); z-index: 50; transition: all 0.2s; }
  .df-nav:hover { background: var(--gold); color: white; border-color: transparent; }
  .df-nav-prev { left: 4px; }
  .df-nav-next { right: 4px; }

  .df-thumbstrip { display: flex; gap: 4px; overflow-x: auto; padding: 8px 10px; background: var(--ink); flex-shrink: 0; }
  .df-thumbstrip::-webkit-scrollbar { display: none; }
  .df-thumb { width: 40px; height: 54px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); cursor: pointer; flex-shrink: 0; position: relative; overflow: hidden; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .df-thumb.active { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
  .df-thumb-img { width: 100%; height: 100%; object-fit: cover; }
  .df-thumb-empty { font-size: 16px; opacity: 0.3; }
  .df-thumb-num { position: absolute; bottom: 2px; right: 3px; font-size: 7px; color: rgba(255,255,255,0.4); }
  .df-thumb-bm { position: absolute; top: 1px; left: 2px; font-size: 7px; }

  /* ─── TAB PANELS ─────────────────────────────── */
  .tab-panel { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; animation: fadeIn 0.2s ease; }
  .stats-card { background: white; border-radius: var(--radius); border: 1px solid var(--border); padding: 14px; }
  body.dark .stats-card { background: var(--soft); }
  .stats-card-title { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: var(--warm); text-transform: uppercase; margin-bottom: 12px; }
  .stats-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .stats-num-block { flex: 1; text-align: center; }
  .stats-big { font-family: "Cormorant Garamond",serif; font-size: 32px; font-weight: 600; color: var(--gold); line-height: 1; }
  .stats-sub { font-size: 10px; color: var(--warm); margin-top: 2px; }
  .heatmap { display: flex; gap: 2px; overflow-x: auto; padding: 4px 0; }
  .heatmap-col { display: flex; flex-direction: column; gap: 2px; }
  .heatmap-cell { width: 9px; height: 9px; border-radius: 1px; background: var(--border); }
  .heatmap-cell.active { background: var(--gold); }
  .wrapped-card { background: linear-gradient(135deg, var(--ink) 0%, #3d3530 100%); color: white; }
  .wrapped-card .stats-card-title { color: rgba(255,255,255,0.7); }
  .wrapped-card .stats-big { color: white; }
  .wrapped-card .stats-sub { color: rgba(255,255,255,0.6); }
  .wrapped-most { font-size: 12px; color: rgba(255,255,255,0.8); margin-bottom: 8px; text-align: center; }
  .wrapped-words { display: flex; flex-wrap: wrap; gap: 4px; }
  .word-chip { padding: 3px 8px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 11px; color: white; }
  .ai-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #1a1512, #3d2d20); color: white; border: none; border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 14px; cursor: pointer; letter-spacing: 0.5px; }
  .ai-btn:disabled { opacity: 0.6; }
  .ai-summary-text { font-size: 13px; line-height: 1.7; margin-bottom: 8px; }
  .ai-motivation { font-size: 12px; color: var(--gold); font-style: italic; margin-bottom: 8px; }

  /* ─── CHAT ───────────────────────────────────── */
  .chat-panel { padding: 0; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; min-height: 200px; }
  .chat-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; color: var(--warm); text-align: center; font-size: 13px; }
  .chat-empty-icon { font-size: 40px; color: var(--gold); }
  .chat-suggestions { display: flex; flex-direction: column; gap: 4px; width: 100%; margin-top: 8px; }
  .chat-suggestion { padding: 8px 12px; background: var(--soft); border: 1px solid var(--border); border-radius: 20px; font-family: "Montserrat",sans-serif; font-size: 12px; cursor: pointer; text-align: left; color: var(--ink); }
  .chat-msg { padding: 10px 12px; border-radius: 14px; font-size: 13px; line-height: 1.6; max-width: 88%; }
  .chat-msg.user { background: var(--gold); color: white; align-self: flex-end; border-radius: 14px 14px 2px 14px; }
  .chat-msg.assistant { background: var(--soft); color: var(--ink); align-self: flex-start; border-radius: 14px 14px 14px 2px; }
  .chat-typing { opacity: 0.6; }
  .chat-input-row { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--border); background: var(--paper); }
  .chat-input { flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 20px; font-family: "Montserrat",sans-serif; font-size: 13px; outline: none; background: white; }
  .chat-input:focus { border-color: var(--gold); }
  .chat-send { width: 40px; height: 40px; border-radius: 50%; background: var(--gold); color: white; border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .chat-send:disabled { opacity: 0.5; }

  /* ─── SETTINGS ───────────────────────────────── */
  .settings-panel { gap: 0; padding: 0; }
  .settings-section { padding: 12px 14px; border-bottom: 1px solid var(--border); }
  .settings-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 10px; }
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; }
  .settings-row.clickable { cursor: pointer; }
  .settings-row.clickable:hover { color: var(--gold); }
  .toggle-btn { width: 44px; height: 24px; border-radius: 12px; background: var(--border); border: none; cursor: pointer; position: relative; transition: background 0.2s; padding: 0; }
  .toggle-btn.on { background: var(--gold); }
  .toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 3px; left: 3px; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
  .toggle-btn.on .toggle-knob { transform: translateX(20px); }
  .premium-card { background: linear-gradient(135deg, #1a1512, #3d2820); border-radius: 10px; padding: 16px; color: white; }
  .premium-title { font-family: "Cormorant Garamond",serif; font-size: 20px; font-weight: 600; margin-bottom: 10px; color: var(--gold); }
  .premium-features { display: flex; flex-direction: column; gap: 4px; }
  .premium-feature { font-size: 12px; color: rgba(255,255,255,0.8); }
  .premium-active-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: linear-gradient(135deg, #1a1512, #3d2820); border-radius: 10px; color: white; }
  .premium-active-icon { font-size: 28px; }
  .premium-active-title { font-size: 14px; font-weight: 600; color: var(--gold); }
  .premium-active-sub { font-size: 11px; color: rgba(255,255,255,0.5); }
  .settings-action-btn { width: 100%; padding: 12px 14px; background: var(--soft); border: 1px solid var(--border); border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 13px; cursor: pointer; text-align: left; color: var(--ink); }
  .settings-action-btn:hover { border-color: var(--gold); }
  .settings-hint { font-size: 11px; color: var(--warm); margin-top: 4px; }

  /* ─── FRIENDS ────────────────────────────────── */
  .friends-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .friends-title { font-family: "Cormorant Garamond",serif; font-size: 20px; font-weight: 600; }
  .friends-invite-btn { padding: 8px 14px; background: var(--gold); color: white; border: none; border-radius: 20px; font-family: "Montserrat",sans-serif; font-size: 12px; cursor: pointer; }
  .invite-card { background: white; border-radius: 10px; border: 1px solid var(--border); padding: 12px; display: flex; flex-direction: column; gap: 6px; }
  .invite-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); }
  .invite-url { font-size: 11px; background: var(--soft); padding: 6px 8px; border-radius: 6px; word-break: break-all; }
  .invite-copy { padding: 6px 12px; background: var(--ink); color: white; border: none; border-radius: 6px; font-family: "Montserrat",sans-serif; font-size: 12px; cursor: pointer; align-self: flex-start; }
  .join-card { background: white; border-radius: 10px; border: 1px solid var(--border); padding: 12px; }
  .join-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 8px; }
  .join-row { display: flex; gap: 8px; }
  .join-input { flex: 1; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 13px; outline: none; }
  .join-btn { padding: 8px 16px; background: var(--gold); color: white; border: none; border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 13px; cursor: pointer; }
  .friends-section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin: 12px 0 6px; }
  .friends-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px; color: var(--warm); text-align: center; }
  .friend-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 10px; border: 1px solid var(--border); }
  .fc-avatar { font-size: 28px; }
  .fc-info { flex: 1; }
  .fc-sno { font-size: 14px; font-weight: 600; }
  .fc-meta { font-size: 11px; color: var(--warm); margin-top: 2px; }

  /* ─── OVERLAYS ────────────────────────────────── */
  .overlay-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: rgba(28,20,16,0.97); color: white; padding: 40px; }
  .overlay-icon { font-size: 56px; }
  .overlay-title { font-family: "Cormorant Garamond",serif; font-size: 26px; font-weight: 600; text-align: center; }
  .overlay-desc { font-size: 14px; opacity: 0.6; text-align: center; line-height: 1.6; }
  .btn-overlay-confirm { width: 100%; max-width: 280px; padding: 14px; background: var(--gold); color: white; border: none; border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 15px; cursor: pointer; }
  .btn-overlay-cancel { width: 100%; max-width: 280px; padding: 14px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 15px; cursor: pointer; }
  .spinner { width: 36px; height: 36px; margin-top: 16px; border: 2px solid rgba(255,255,255,0.15); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg { padding: 10px 14px; background: #fef0ef; border: 1px solid #f5c6c4; border-radius: 6px; color: var(--red); font-size: 12px; text-align: center; }

  /* ─── OCR EDITOR ──────────────────────────────── */
  .ocr-editor { display: flex; flex-direction: column; gap: 10px; }
  .ocr-field { display: flex; flex-direction: column; gap: 3px; }
  .ocr-label { font-size: 10px; font-weight: 600; color: var(--gold); letter-spacing: 0.5px; }
  .ocr-input { border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-size: 13px; font-family: "Montserrat",sans-serif; outline: none; background: var(--paper); }
  .ocr-input:focus { border-color: var(--gold); }
  .ocr-textarea { border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-size: 13px; font-family: "Montserrat",sans-serif; outline: none; resize: vertical; background: var(--paper); }
  .ocr-textarea:focus { border-color: var(--gold); }

  /* ─── TEMPLATE STYLES ────────────────────────── */
  .tpl-header { font-weight: 600; font-size: 11px; margin-bottom: 5px; color: var(--ink); border-bottom: 1.5px solid var(--gold); padding-bottom: 2px; }
  .tpl-empty-hint { font-size: 9px; color: var(--warm); font-style: italic; }
  .tpl-section { margin-top: 5px; }
  .tpl-section-title { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--warm); margin-bottom: 2px; }
  .tpl-date { font-size: 10px; font-weight: 600; color: var(--gold); margin-bottom: 3px; }
  .tpl-notes-text { font-size: 10px; line-height: 1.5; color: var(--ink); white-space: pre-wrap; }
  .tpl-item { font-size: 9px; margin-bottom: 1px; }
  .tpl-row { display: flex; gap: 5px; }
  .tpl-lines { display: flex; flex-direction: column; gap: 7px; }
  .tpl-line { height: 1px; background: var(--border); }
  .tpl-priority-item { display: flex; align-items: center; gap: 3px; font-size: 10px; margin-bottom: 2px; }
  .tpl-num { width: 14px; height: 14px; border-radius: 50%; background: var(--gold); color: white; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; flex-shrink: 0; }
  .tpl-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin: 3px 0; }
  .tpl-month-header { font-size: 7px; color: var(--warm); font-weight: 600; text-align: center; }
  .tpl-month-day { font-size: 7px; text-align: center; padding: 1px; border: 1px solid var(--border); min-height: 12px; border-radius: 2px; }
  .tpl-month-day.marked { background: var(--gold); font-weight: 700; color: white; }
  .tpl-mood-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
  .tpl-mood-cell { font-size: 7px; text-align: center; padding: 1px; border: 1px solid var(--border); min-height: 14px; border-radius: 2px; display: flex; flex-direction: column; align-items: center; }
  .tpl-mood-day { font-size: 6px; color: var(--warm); }
  .tpl-mood-emoji { font-size: 7px; }
  .tpl-bingo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
  .tpl-bingo-cell { border: 1px solid var(--border); border-radius: 4px; padding: 3px; min-height: 20px; font-size: 8px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .tpl-bingo-cell.checked { background: var(--gold); color: white; }
  .tpl-vision-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
  .tpl-vision-box { border: 1px solid var(--border); border-radius: 8px; min-height: 30px; padding: 3px; font-size: 8px; display: flex; align-items: center; justify-content: center; }
  .tpl-onemli-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
  .tpl-onemli-month { border: 1px solid var(--border); border-radius: 6px; padding: 3px; }
  .tpl-onemli-month-name { font-size: 7px; font-weight: 700; color: var(--gold); }
  .tpl-onemli-content { font-size: 7px; }
  .tpl-table { width: 100%; border-collapse: collapse; font-size: 8px; }
  .tpl-table th { background: var(--mint); font-weight: 700; padding: 2px 3px; border: 1px solid var(--border); }
  .tpl-table td { padding: 1px 3px; border: 1px solid var(--border); }
  .tpl-okuma-cols { display: flex; gap: 6px; }
  .tpl-okuma-col { flex: 1; }
  .tpl-okuma-item { display: flex; gap: 3px; margin-bottom: 1px; }
  .tpl-okuma-num { font-size: 8px; font-weight: 700; color: var(--gold); min-width: 14px; }
  .tpl-okuma-line { font-size: 8px; flex: 1; border-bottom: 1px dashed var(--border); }
  .tpl-ders-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; }
  .tpl-ders-day { border: 1px solid var(--border); border-radius: 3px; }
  .tpl-ders-day-num { font-size: 6px; font-weight: 700; background: var(--mint); padding: 1px; text-align: center; }
  .tpl-ders-content { font-size: 7px; padding: 1px; min-height: 18px; }
  .tpl-spor-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; }
  .tpl-spor-cell { border: 1px solid var(--border); border-radius: 3px; }
  .tpl-spor-num { font-size: 6px; font-weight: 700; background: var(--mint); padding: 1px; text-align: center; }
  .tpl-spor-content { font-size: 7px; padding: 1px; min-height: 16px; }
  .tpl-sifre-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .tpl-sifre-card { border: 1px solid var(--border); border-radius: 6px; padding: 3px; }
  .tpl-sifre-site { font-size: 8px; font-weight: 700; color: var(--gold); }
  .tpl-sifre-user, .tpl-sifre-pass { font-size: 7px; color: var(--warm); }
  .tpl-eg-grid { overflow-x: auto; }
  .tpl-eg-row { display: flex; align-items: center; }
  .tpl-eg-header .tpl-eg-month { font-size: 6px; font-weight: 700; color: var(--warm); }
  .tpl-eg-day { width: 16px; font-size: 6px; color: var(--warm); flex-shrink: 0; }
  .tpl-eg-month { width: 16px; text-align: center; flex-shrink: 0; }
  .tpl-eg-cell { width: 16px; height: 8px; border: 1px solid var(--border); flex-shrink: 0; }
  .tpl-eg-cell.done { background: var(--gold); }
  .tpl-habit-list { display: flex; flex-direction: column; gap: 3px; }
  .tpl-habit-item { display: flex; align-items: center; gap: 5px; font-size: 10px; }
  .tpl-habit-check { font-size: 10px; } .tpl-habit-check.done { color: var(--green); }
  .tpl-habit-days { font-size: 8px; color: var(--warm); }
  .tpl-habit-dots { display: flex; gap: 1px; margin-left: auto; }
  .tpl-habit-dot { font-size: 7px; } .tpl-habit-dot.done { color: var(--green); }
  .tpl-tekli2-days { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .tpl-tekli2-day { border: 1px solid var(--border); border-radius: 6px; padding: 3px; }
  .tpl-day-name { font-size: 8px; font-weight: 700; color: var(--gold); margin-bottom: 1px; }
  .tpl-day-content { font-size: 9px; }
  .tpl-schedule-item { display: flex; gap: 5px; font-size: 9px; border-bottom: 1px solid var(--border); padding: 1px 0; }
  .tpl-hour { font-weight: 600; color: var(--warm); min-width: 32px; flex-shrink: 0; }
  .tpl-sukran-list { display: flex; flex-direction: column; gap: 1px; }
  .tpl-sukran-item { display: flex; gap: 3px; font-size: 9px; border-bottom: 1px solid var(--border); padding: 1px 0; }
  .tpl-sukran-num { font-weight: 700; color: var(--gold); min-width: 12px; }
  .tpl-sukran-text { flex: 1; }
  .tpl-filmserit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; }
  .tpl-film-frame { border: 1px solid #1a1512; min-height: 18px; font-size: 7px; display: flex; align-items: center; justify-content: center; }
  .tpl-kitapraf-shelves { display: flex; flex-direction: column; gap: 6px; }
  .tpl-shelf { display: flex; gap: 1px; border-bottom: 2px solid #5d4037; padding-bottom: 1px; }
  .tpl-book { width: 14px; min-height: 26px; border: 1px solid var(--border); border-radius: 1px; font-size: 6px; display: flex; align-items: flex-end; justify-content: center; }
  .tpl-book.filled { background: var(--gold); color: white; }
  .tpl-yemek-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .tpl-yemek-day { border: 1px solid var(--border); border-radius: 6px; padding: 3px; }
  .tpl-cover { border-radius: var(--radius); padding: 12px; color: white; min-height: 60px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
  .tpl-cover-title { font-family: "Cormorant Garamond",serif; font-size: 14px; font-weight: 600; text-align: center; }
  .tpl-cover-sub, .tpl-cover-date { font-size: 9px; opacity: 0.7; margin-top: 2px; }
  .tpl-cover-hint { font-size: 9px; opacity: 0.6; margin-top: 6px; }
  .tpl-letter-lines { display: flex; flex-direction: column; gap: 8px; margin-top: 5px; }
  .tpl-hw { font-size: 0.7em; }
  .tpl-hw-title { background: var(--tc); color: white; font-size: 8px; font-weight: 700; text-align: center; padding: 3px; margin-bottom: 2px; border-radius: 3px; letter-spacing: 1px; }
  .tpl-hw-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid var(--border); }
  .tpl-hw-head { font-size: 6px; font-weight: 700; text-align: center; padding: 2px 1px; background: var(--mint); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .tpl-hw-head.wknd { background: var(--gold); color: white; }
  .tpl-hw-cell { min-height: 16px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1px 2px; }
  .tpl-hw-hour { font-size: 5px; color: var(--gold); display: block; opacity: 0.7; }
  .tpl-hw-entry { font-size: 6px; color: var(--ink); line-height: 1.2; font-weight: 500; }
  .multi-region { display: flex; flex-direction: column; gap: 4px; }
  .region-block { border: 1px solid var(--border); border-radius: 6px; padding: 4px; background: var(--soft); }
  .region-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--warm); margin-bottom: 3px; }

  /* ─── LANDING PAGE ───────────────────────────── */
  .app-landing { min-height: 100vh; background: var(--cream); overflow-x: hidden; }
  .al-nav { position: sticky; top: 0; z-index: 100; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; background: rgba(248,245,240,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
  .al-nav-links { display: flex; align-items: center; gap: 16px; }
  .al-nav-links a { font-size: 12px; color: var(--warm); text-decoration: none; }
  .al-nav-cta { padding: 8px 16px; background: var(--gold); color: white; border: none; border-radius: 6px; font-family: "Montserrat",sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; }

  .al-hero { min-height: 80vh; display: flex; align-items: center; justify-content: space-between; padding: 60px 20px 40px; position: relative; overflow: hidden; gap: 20px; }
  .al-hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #1c1410, #3d2010 40%, #1c1410); }
  .al-hero-texture { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Cline x1='0' y1='3' x2='6' y2='3' stroke='%23fff' stroke-width='0.5' opacity='0.04'/%3E%3Cline x1='3' y1='0' x2='3' y2='6' stroke='%23fff' stroke-width='0.5' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; }
  .al-hero-content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; gap: 16px; }
  .al-badge { display: inline-block; padding: 4px 12px; background: rgba(237,188,115,0.15); border: 1px solid rgba(237,188,115,0.3); border-radius: 20px; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold); align-self: flex-start; }
  .al-h1 { font-family: "Cormorant Garamond",serif; font-size: clamp(36px,8vw,60px); font-weight: 600; line-height: 1.1; color: white; }
  .al-h1 span { color: var(--gold); font-style: italic; }
  .al-p { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.55); max-width: 280px; }
  .al-btns { display: flex; gap: 10px; flex-wrap: wrap; }
  .al-btn-primary { padding: 14px 24px; background: var(--gold); color: white; border: none; border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .al-btn-primary:hover { background: white; color: var(--ink); }
  .al-btn-secondary { padding: 14px 24px; border: 1px solid rgba(255,255,255,0.2); background: none; color: rgba(255,255,255,0.7); border-radius: 8px; font-size: 14px; font-family: "Montserrat",sans-serif; cursor: pointer; }
  .al-hero-visual { position: relative; z-index: 2; flex-shrink: 0; }
  .al-mockup { width: 110px; height: 160px; position: relative; filter: drop-shadow(0 16px 40px rgba(0,0,0,0.5)); }
  .al-mockup-spine { position: absolute; left: 0; top: 0; bottom: 0; width: 12px; background: rgba(0,0,0,0.3); border-radius: 3px 0 0 3px; }
  .al-mockup-content { position: absolute; left: 12px; top: 0; right: 0; bottom: 0; background: var(--gold); border-radius: 0 8px 8px 0; overflow: hidden; padding: 12px 8px; display: flex; flex-direction: column; gap: 4px; }
  .al-mockup-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 4px 0; }
  .al-mockup-pages { display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .al-mockup-line { height: 1px; background: rgba(255,255,255,0.1); }
  .al-mockup-qr { position: absolute; bottom: 8px; right: 8px; width: 24px; height: 24px; background: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 2; }
  .al-scan-ring { position: absolute; bottom: 4px; right: 4px; width: 32px; height: 32px; border-radius: 6px; border: 2px solid var(--gold); animation: scanPulse 2s ease-in-out infinite; z-index: 3; }
  @keyframes scanPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.4} }

  .al-section { padding: 70px 20px; }
  .al-tag { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
  .al-section-title { font-family: "Cormorant Garamond",serif; font-size: clamp(28px,5vw,42px); font-weight: 600; margin-bottom: 20px; }
  .al-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .al-feature-card { padding: 18px; background: white; border-radius: var(--radius); border: 1px solid var(--border); transition: all 0.2s; }
  .al-feature-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .al-feature-icon { font-size: 24px; margin-bottom: 8px; }
  .al-feature-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .al-feature-desc { font-size: 11px; color: var(--warm); line-height: 1.6; }

  .al-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .al-pricing-card { padding: 20px; border-radius: var(--radius); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; background: white; }
  .al-pricing-featured { background: var(--ink); color: white; border-color: var(--ink); }
  .al-pricing-badge { display: inline-block; padding: 2px 8px; background: var(--gold); border-radius: 10px; font-size: 9px; color: white; font-weight: 700; align-self: flex-start; }
  .al-pricing-name { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .al-pricing-price { font-family: "Cormorant Garamond",serif; font-size: 36px; font-weight: 600; line-height: 1; }
  .al-pricing-price span { font-size: 14px; font-family: "Montserrat",sans-serif; font-weight: 400; }
  .al-pricing-feature { font-size: 11px; color: var(--warm); }
  .al-pricing-featured .al-pricing-feature { color: rgba(255,255,255,0.7); }
  .al-pricing-btn { width: 100%; padding: 11px; border-radius: 8px; font-family: "Montserrat",sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border: none; margin-top: 8px; }
  .al-pricing-outline { background: none; border: 1px solid var(--border); color: var(--ink); }
  .al-pricing-solid { background: var(--gold); color: white; }

  .al-cta { padding: 70px 20px; position: relative; overflow: hidden; text-align: center; }
  .al-cta-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #1c1410, #3d2010); }
  .al-cta-content { position: relative; z-index: 1; }
  .al-cta-title { font-family: "Cormorant Garamond",serif; font-size: clamp(28px,6vw,48px); font-weight: 600; color: white; margin-bottom: 12px; }
  .al-cta-sub { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 24px; }

  .al-footer { background: var(--ink); color: rgba(255,255,255,0.4); padding: 28px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .al-footer-links { display: flex; gap: 16px; }
  .al-footer-links a { font-size: 11px; color: rgba(255,255,255,0.3); text-decoration: none; }
  .al-footer-copy { font-size: 10px; }

  /* ─── DARK MODE OVERRIDES ────────────────────── */
  body.dark .df-nav { background: rgba(30,26,22,0.95); color: var(--ink); border-color: var(--border); }
  body.dark .ocr-input, body.dark .ocr-textarea, body.dark .search-input, body.dark .chat-input { background: var(--soft); color: var(--ink); border-color: var(--border); }
  body.dark .filter-tab { background: var(--soft); color: var(--warm); border-color: var(--border); }
  body.dark .page-card { background: #2a2520; }
  body.dark .page-card.filled { background: #1e1a16; }
  body.dark .df-empty-page, body.dark .df-ocr { background: var(--paper); }
  body.dark .invite-card, body.dark .join-card, body.dark .friend-card { background: var(--soft); }
`;
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);
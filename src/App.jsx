import { useState, useEffect } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

const API = "https://ajan-da-backend-production.up.railway.app";
// App.jsx içinde bileşenlerin üst kısmına ekle
const SketchOverlay = ({ vectorData }) => {
  if (!vectorData) return null;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 10, opacity: 0.9
    }}>
      <svg 
        viewBox={vectorData.viewBox}
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{ __html: vectorData.svg_content }}
      />
    </div>
  );
};
const handleCapture = async () => {
  const image = await Camera.getPhoto({
    quality: 90, resultType: CameraResultType.Base64, source: CameraSource.Camera
  });

  const formData = new FormData();
  const res_blob = await fetch(`data:image/jpeg;base64,${image.base64String}`);
  const blob = await res_blob.blob();
  formData.append("file", blob, "user_sketch.jpg");

  // Backend'e gönder ve vektörü al
  const response = await fetch(`${API}/vectorize-sketch`, { method: "POST", body: formData });
  const vectorData = await response.json();

  // Bu veriyi state'e kaydet, SketchOverlay bunu ekrana basacak
  setNotes(prev => ({ ...prev, current_vector: vectorData }));
};
// ─── YARDIMCI ────────────────────────────────────────────────────────
const Empty = ({ msg }) => <div className="tpl-empty-hint">{msg || "Fotoğraflandıktan sonra görünecek"}</div>;
const TplHeader = ({ icon, title }) => <div className="tpl-header">{icon} {title}</div>;

// ─── ŞABLON BİLEŞENLERİ ──────────────────────────────────────────────

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
  const moodEmojis = { harika: "😄", iyi: "🙂", orta: "😐", kotu: "😕", berbat: "😢" };
  const days = data?.days || {};
  return (
    <div className="tpl-mood-cal">
      <TplHeader icon="😊" title="Mutluluk Planlayıcısı" />
      {data?.month && <div className="tpl-date">{data.month}</div>}
      {empty ? <Empty /> : (
        <div className="tpl-mood-grid">
          {["Paz","Sal","Çar","Per","Cum","Cmt","Paz"].map((d, i) => (
            <div key={i} className="tpl-month-header">{d}</div>
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
          const marked = day <= 31 && markedDays.includes(day);
          return (
            <div key={i} className={`tpl-month-day ${marked ? "marked" : ""}`}>
              {day <= 31 ? day : ""}
            </div>
          );
        })}
      </div>
      {empty && <Empty />}
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
          <div className="tpl-row" style={{ marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Yapılacaklar</div>
              {(data?.todo || []).map((t, i) => <div key={i} className="tpl-item">☐ {t}</div>)}
            </div>
            <div style={{ flex: 1 }}>
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
              <div className="tpl-ders-day-num">GÜN {i + 1}</div>
              <div className="tpl-ders-content">{days[i + 1] || ""}</div>
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
          <thead>
            <tr><th>☐</th><th>Tür</th><th>Film/Dizi</th><th>⭐</th></tr>
          </thead>
          <tbody>
            {items.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td>☐</td><td></td><td></td><td>☆☆☆☆☆</td></tr>
                ))
              : items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.done ? "☑" : "☐"}</td>
                    <td>{it.genre || ""}</td>
                    <td>{it.name || ""}</td>
                    <td>{"★".repeat(it.rating || 0)}{"☆".repeat(5 - (it.rating || 0))}</td>
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
          {Array.from({ length: 16 }).map((_, i) => (
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
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="tpl-spor-cell">
              <div className="tpl-spor-num">GÜN {i + 1}</div>
              <div className="tpl-spor-content">{days[i + 1] || ""}</div>
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
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="tpl-okuma-item">
                <span className="tpl-okuma-num">{i + 1}</span>
                <span className="tpl-okuma-line">{books[i] || ""}</span>
              </div>
            ))}
          </div>
          <div className="tpl-okuma-col">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="tpl-okuma-item">
                <span className="tpl-okuma-num">{i + 26}</span>
                <span className="tpl-okuma-line">{books[i + 25] || ""}</span>
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
              ? Array.from({ length: 10 }).map((_, i) => <tr key={i}><td></td><td></td><td></td></tr>)
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
            {Array.from({ length: 3 }).map((_, shelf) => (
              <div key={shelf} className="tpl-shelf">
                {Array.from({ length: 8 }).map((_, b) => (
                  <div key={b} className={`tpl-book ${data?.books?.[shelf * 8 + b] ? "filled" : ""}`}>
                    {data?.books?.[shelf * 8 + b] || ""}
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
          {(entries.length === 0 ? Array.from({ length: 8 }).map(() => ({})) : entries).map((e, i) => (
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
        <div className="tpl-eg-grid">
          <div className="tpl-eg-row tpl-eg-header">
            <div className="tpl-eg-day"></div>
            {months.map(m => <div key={m} className="tpl-eg-month">{m}</div>)}
          </div>
          {Array.from({ length: 31 }).map((_, d) => (
            <div key={d} className="tpl-eg-row">
              <div className="tpl-eg-day">{String(d + 1).padStart(2, '0')}</div>
              {months.map((m, mi) => (
                <div key={mi} className={`tpl-eg-cell ${grid[`${d + 1}-${mi + 1}`] ? "done" : ""}`}></div>
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
          {data?.notes && <div className="tpl-notes-text" style={{ marginTop: 8 }}>{data.notes}</div>}
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
      {empty ? <Empty /> : (
        <>
          {data?.goals?.length > 0 && (
            <div className="tpl-section">
              <div className="tpl-section-title">Finansal Hedefler</div>
              {data.goals.map((g, i) => <div key={i} className="tpl-item">{i + 1}. {g}</div>)}
            </div>
          )}
          <div className="tpl-row" style={{ gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Harcamalar</div>
              <table className="tpl-table">
                <thead><tr><th>Tarih</th><th>Tür</th><th>₺</th></tr></thead>
                <tbody>{expenses.map((e, i) => <tr key={i}><td>{e.date}</td><td>{e.type}</td><td>{e.amount}</td></tr>)}</tbody>
              </table>
            </div>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Gelir</div>
              <table className="tpl-table">
                <thead><tr><th>Tarih</th><th>Tür</th><th>₺</th></tr></thead>
                <tbody>{income.map((e, i) => <tr key={i}><td>{e.date}</td><td>{e.type}</td><td>{e.amount}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TemplateAylikGozlem({ data, empty }) {
  return (
    <div className="tpl-gozlem">
      <TplHeader icon="🔍" title="Aylık Gözlem" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Minnettar Olduklarım</div>
              {(data?.grateful || []).map((g, i) => <div key={i} className="tpl-item">○ {g}</div>)}
            </div>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Bu Ay İçin Puanım</div>
              <div style={{ fontSize: 18 }}>{"★".repeat(data?.score || 0)}{"☆".repeat(5 - (data?.score || 0))}</div>
            </div>
          </div>
          <div className="tpl-row" style={{ gap: 12, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Bu Ay Nasıldı?</div>
              <div className="tpl-notes-text">{data?.how_was_it || ""}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Geliştirmelerim</div>
              {(data?.improvements || []).map((g, i) => <div key={i} className="tpl-item">{g}</div>)}
            </div>
          </div>
          {data?.intentions && (
            <div className="tpl-section" style={{ marginTop: 8 }}>
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
          {Array.from({ length: 31 }).map((_, i) => (
            <div key={i} className="tpl-sukran-item">
              <span className="tpl-sukran-num">{i + 1}</span>
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
        <div className="tpl-eg-grid" style={{ fontSize: "0.65em" }}>
          <div className="tpl-eg-row tpl-eg-header">
            <div className="tpl-eg-day"></div>
            {months.map(m => <div key={m} className="tpl-eg-month">{m}</div>)}
          </div>
          {Array.from({ length: 31 }).map((_, d) => (
            <div key={d} className="tpl-eg-row">
              <div className="tpl-eg-day">{String(d + 1).padStart(2, '0')}</div>
              {months.map((m, mi) => (
                <div key={mi} className={`tpl-eg-cell ${grid[`${d + 1}-${mi + 1}`] || ""}`}></div>
              ))}
            </div>
          ))}
          {data?.notes && <div className="tpl-notes-text" style={{ marginTop: 6 }}>{data.notes}</div>}
        </div>
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
        <div className="tpl-eg-grid" style={{ fontSize: "0.65em" }}>
          <div className="tpl-eg-row tpl-eg-header">
            <div className="tpl-eg-day"></div>
            {months.map(m => <div key={m} className="tpl-eg-month">{m}</div>)}
          </div>
          {Array.from({ length: 31 }).map((_, d) => (
            <div key={d} className="tpl-eg-row">
              <div className="tpl-eg-day">{String(d + 1).padStart(2, '0')}</div>
              {months.map((m, mi) => {
                const mood = grid[`${d + 1}-${mi + 1}`];
                return (
                  <div key={mi} className="tpl-eg-cell"
                    style={{ background: mood ? moodColors[mood] || "#ddd" : "transparent" }}>
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

function TemplateHaftalikDikey({ data, empty }) {
  const dayKeys = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const dayLabels = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
  return (
    <div className="tpl-haftalik-dikey">
      <TplHeader icon="↔️" title="Haftalık Plan" />
      {data?.month && <div className="tpl-date">{data.month}</div>}
      {data?.highlights && <div className="tpl-highlights">{data.highlights}</div>}
      {empty ? <Empty /> : (
        <div className="tpl-haftalik-days">
          {dayKeys.map((d, i) => data?.[d] !== undefined ? (
            <div key={d} className="tpl-day-block">
              <div className="tpl-day-name">{dayLabels[i]}</div>
              <div className="tpl-day-content">{data[d] || ""}</div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}

function TemplateHaftalikTekli1({ data, empty }) {
  const days = [
    { key: "monday", label: "Pazartesi" }, { key: "tuesday", label: "Salı" },
    { key: "wednesday", label: "Çarşamba" }, { key: "thursday", label: "Perşembe" },
    { key: "friday", label: "Cuma" }, { key: "saturday", label: "Cumartesi" },
    { key: "sunday", label: "Pazar" },
  ];
  return (
    <div className="tpl-haftalik-tekli">
      <TplHeader icon="1️⃣" title="Haftalık" />
      {data?.month && <div className="tpl-date">{data.month}</div>}
      {empty ? <Empty /> : (
        <div className="tpl-tekli-grid">
          {days.map(d => (
            <div key={d.key} className="tpl-tekli-box">
              <div className="tpl-day-name">{d.label}</div>
              <div className="tpl-day-content">{data?.[d.key] || ""}</div>
            </div>
          ))}
          {data?.notes && (
            <div className="tpl-tekli-box">
              <div className="tpl-day-name">Notlar</div>
              <div className="tpl-day-content">{data.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TemplateHaftalikTekli2({ data, empty }) {
  const days = [
    { key: "monday", label: "Pazartesi" }, { key: "tuesday", label: "Salı" },
    { key: "wednesday", label: "Çarşamba" }, { key: "thursday", label: "Perşembe" },
    { key: "friday", label: "Cuma" }, { key: "saturday", label: "Cumartesi" },
    { key: "sunday", label: "Pazar" },
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
            <div className="tpl-section" style={{ marginTop: 8 }}>
              <div className="tpl-section-title">Alışkanlıklar</div>
              {data.habits.map((h, i) => (
                <div key={i} className="tpl-habit-item">
                  <span>{h.name}</span>
                  <div className="tpl-habit-dots">
                    {Array.from({ length: 7 }).map((_, d) => (
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
          <div className="tpl-row" style={{ gap: 6 }}>
            {[["energy_down","Enerji Düşüren"],["proud","Gurur Duyulan"],["release","Bırakılan"]].map(([k, l]) => (
              <div key={k} style={{ flex: 1, background: "#fce4ec", borderRadius: 8, padding: 6 }}>
                <div className="tpl-section-title">{l}</div>
                <div className="tpl-notes-text">{data?.[k] || ""}</div>
              </div>
            ))}
          </div>
          <div className="tpl-section-title" style={{ marginTop: 8 }}>Haftanın 3 Ana Dersi</div>
          <div className="tpl-row" style={{ gap: 6 }}>
            {[["lesson_rel","İlişkilerde"],["lesson_work","İşte/Okulda"],["lesson_self","Kendimle"]].map(([k, l]) => (
              <div key={k} style={{ flex: 1, background: "#e0f7fa", borderRadius: 8, padding: 6 }}>
                <div className="tpl-section-title">{l}</div>
                <div className="tpl-notes-text">{data?.[k] || ""}</div>
              </div>
            ))}
          </div>
          {data?.next_intent && (
            <div className="tpl-section" style={{ marginTop: 8 }}>
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
    { key: "monday", label: "Pazartesi" }, { key: "tuesday", label: "Salı" },
    { key: "wednesday", label: "Çarşamba" }, { key: "thursday", label: "Perşembe" },
    { key: "friday", label: "Cuma" }, { key: "saturday", label: "Cumartesi" },
    { key: "sunday", label: "Pazar" },
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
              {data.shopping.map((s, i) => <div key={i} className="tpl-item">○ {s}</div>)}
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
          <div className="tpl-row" style={{ gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, border: "1px solid #e2d9ce", borderRadius: 8, padding: 8, minHeight: 60 }}>
              <div className="tpl-section-title">Öncelikler</div>
            </div>
            <div style={{ flex: 1, border: "1px solid #e2d9ce", borderRadius: 8, padding: 8, minHeight: 60 }}>
              <div className="tpl-section-title">Notlar</div>
            </div>
          </div>
          <div className="tpl-lines">
            {Array.from({ length: 14 }).map((_, i) => <div key={i} className="tpl-line" />)}
          </div>
        </>
      ) : (
        <>
          <div className="tpl-row" style={{ gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="tpl-section-title">Öncelikler</div>
              {(data?.priorities || []).map((p, i) => (
                <div key={i} className="tpl-priority-item">
                  <span className="tpl-num">{i + 1}</span>{p}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
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
      <div className="tpl-row" style={{ gap: 4 }}>
        {data?.day && <span className="tpl-section-title">GÜN: {data.day}</span>}
        {data?.date && <span className="tpl-section-title">TARİH: {data.date}</span>}
      </div>
      {empty ? <Empty /> : (
        <div className="tpl-row" style={{ gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {hours.map(h => (
              <div key={h} className="tpl-schedule-item">
                <span className="tpl-hour">{h}</span>
                <span>{schedule[h] || ""}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div className="tpl-section-title">YAPILACAKLAR</div>
            {(data?.todo || []).map((t, i) => <div key={i} className="tpl-item">☐ {t}</div>)}
            <div className="tpl-section-title" style={{ marginTop: 8 }}>NOTLAR</div>
            <div className="tpl-notes-text">{data?.notes || ""}</div>
            {data?.mood && <div style={{ marginTop: 8 }}>MOD: {data.mood}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
// Şablon bileşeninin içinde (örneğin TemplateNotes)
function VectorLayer({ svgData }) {
  if (!svgData) return null;
  
  return (
    <svg 
      viewBox={`0 0 ${svgData.width} ${svgData.height}`}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', // Altındaki butonlara tıklanabilsin
        zIndex: 10
      }}
      dangerouslySetInnerHTML={{ __html: svgData.svg_content }}
    />
  );
}
function TemplateGunlukSukran({ data, empty }) {
  return (
    <div className="tpl-gunluk-sukran">
      <TplHeader icon="🌟" title="Günlük Şükran Sayfam" />
      {empty ? <Empty /> : (
        <>
          <div className="tpl-row" style={{ gap: 8 }}>
            <div style={{ flex: 1, background: "#e3f2fd", borderRadius: 8, padding: 8 }}>
              <div className="tpl-section-title">Bugünün Olumlaması</div>
              <div className="tpl-notes-text">{data?.affirmation || ""}</div>
            </div>
            <div style={{ flex: 1, background: "#e3f2fd", borderRadius: 8, padding: 8 }}>
              <div className="tpl-section-title">Bugünün Öncelikleri</div>
              {(data?.priorities || []).map((p, i) => <div key={i} className="tpl-item">{i + 1}. {p}</div>)}
            </div>
          </div>
          <div style={{ background: "#e3f2fd", borderRadius: 8, padding: 8, margin: "8px 0" }}>
            <div className="tpl-section-title">Bugün Minnettar Olduğum Şeyler</div>
            <div className="tpl-notes-text">{data?.grateful || ""}</div>
          </div>
          <div style={{ background: "#e3f2fd", borderRadius: 8, padding: 8 }}>
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
        <div className="tpl-lines">{Array.from({ length: 14 }).map((_, i) => <div key={i} className="tpl-line" />)}</div>
      ) : (
        <div className="tpl-notes-text">{data?.content || ""}</div>
      )}
    </div>
  );
  
}

// ─── ANA ROUTER ──────────────────────────────────────────────────────
function PageTemplate({ type, data, empty, themeColor }) {
  const props = { data, empty, themeColor };
  switch (type) {
    case "cover":                        return <TemplateCover {...props} />;
    case "yillik_bingo":                 return <TemplateBingo {...props} title="Yıllık Bingo" />;
    case "aylik_bingo":                  return <TemplateBingo {...props} title="Aylık Bingo" />;
    case "bingo_grid":                   return <TemplateBingo {...props} />;
    case "vision_board":
    case "vision_boxes":                 return <TemplateVisionBoard {...props} />;
    case "onemli_gunler":                return <TemplateOnemliGunler {...props} />;
    case "mutluluk_sayaci":
    case "mood_calendar":                return <TemplateMutlulukSayaci {...props} />;
    case "kendime_mektup":
    case "letter":                       return <TemplateKendimeMektup {...props} />;
    case "monthly":
    case "aylik_takvim":
    case "monthly_grid":                 return <TemplateMonthly {...props} />;
    case "aylik_planlayici":             return <TemplateAylikPlanlayici {...props} />;
    case "ders_plani":
    case "daily_grid_31":                return <TemplateDersPlani {...props} />;
    case "film_dizi_plani":
    case "film_table":                   return <TemplateFilmDizi {...props} />;
    case "film_dizi_takip":
    case "film_strip":                   return <TemplateFilmSerit {...props} />;
    case "spor_plani":
    case "sport_grid_30":                return <TemplateSpor {...props} />;
    case "okuma_takip":
    case "numbered_list_50":             return <TemplateOkumaTakip {...props} />;
    case "okuma_takip_2":
    case "reading_table":                return <TemplateOkumaTablo {...props} />;
    case "okuma_takip_3":
    case "book_shelves":                 return <TemplateKitapRafi {...props} />;
    case "sifre_takip":
    case "password_list":                return <TemplateSifreTakip {...props} />;
    case "egzersiz_takip":
    case "habit_year_grid":              return <TemplateEgzersizTakip {...props} />;
    case "aliskanlik":
    case "habit_circle":                 return <TemplateAliskanlik {...props} />;
    case "butce_takip":
    case "budget_table":                 return <TemplateButce {...props} />;
    case "aylik_gozlem":                 return <TemplateAylikGozlem {...props} />;
    case "aylik_sukran":
    case "numbered_list_31":             return <TemplateAylikSukran {...props} />;
    case "regl_takibi":
    case "period_grid":                  return <TemplateRegl {...props} />;
    case "duygudurum_takibi":
    case "mood_grid":                    return <TemplateDuygudurum {...props} />;
    case "haftalik_yatay":
    case "haftalik_yatay_2":
    case "haftalik_dikey":
    case "day_col":
    case "day_notes":                    return <TemplateHaftalikDikey {...props} />;
    case "haftalik_tekli1":
    case "day_box":                      return <TemplateHaftalikTekli1 {...props} />;
    case "haftalik_tekli2":
    case "day_bullets":                  return <TemplateHaftalikTekli2 {...props} />;
    case "haftalik_kapanisi":            return <TemplateHaftalikKapanis {...props} />;
    case "yemek_plan":
    case "meal_box":                     return <TemplateYemekPlani {...props} />;
    case "gunluk_cizgili":
    case "lined_notes":                  return <TemplateGunlukCizgili {...props} />;
    case "bas_planlayici":
    case "schedule":                     return <TemplateBasPlanlayici {...props} />;
    case "gunluk_sukran":                return <TemplateGunlukSukran {...props} />;
    default:                             return <TemplateNotes {...props} />;
  }
}

function EditablePageView({ tplType, data, empty, themeColor }) {
  if (!data) return <PageTemplate type={tplType} data={data} empty={true} themeColor={themeColor} />;
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
  const isNative = !!window.Capacitor?.isNativePlatform?.();

  useEffect(() => { setEditData(null); }, [activePage?.page_no]);

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

  const renderPageCard = (pageData) => {
    const regions = pageData.template?.regions;
    const firstRegion = regions?.[0];
    const tplType = pageData.template_type || firstRegion?.type || "notes";
    const tplData = pageData.template_data;
    const isEmpty = pageData.is_empty || !tplData;
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
    const filledMap = {};
    pages.forEach(p => { filledMap[p.page_no] = p; });
    return pages.map(p => renderPageCard(p));
  };

  // ─── UI ──────────────────────────────────────────────────────────

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

  if (activePage) {
    const firstActive = activePage.template?.regions?.[0];
    const tplType = activePage.template_type || firstActive?.type || "notes";
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
        <div className="original-photo-section">
  <img src={currentPhotoUrl} alt="Orijinal" style={{ width: '100%' }} />
</div>

<hr style={{ margin: '20px 0', border: '1px solid #ddd' }} />

{/* İSTEDİĞİN YENİ ALAN: Vektörel Çizim */}
<div className="vector-drawing-section" style={{ 
  background: '#fff', 
  border: '1px dashed #2d4a3e', 
  borderRadius: '8px',
  padding: '10px',
  minHeight: '200px'
}}>
  <h4 style={{ color: '#2d4a3e', marginTop: 0 }}>Vektörel Çizim Görünümü</h4>
  
  {pageData.vector ? (
    <svg 
      viewBox={pageData.vector.viewBox}
      style={{ width: '100%', height: 'auto' }}
      dangerouslySetInnerHTML={{ __html: pageData.vector.svg_content }}
    />
  ) : (
    <div style={{ color: '#888', textAlign: 'center', paddingTop: '80px' }}>
      Vektörel çizim oluşturuluyor veya henüz yüklenmedi...
    </div>
  )}
</div>
        <div className="detail-template">
          <EditablePageView
            tplType={tplType}
            data={editData || activePage.template_data}
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
          <div className="dash-theme-badge" style={{ background: current.theme_color || "#2d4a3e" }}>{current.theme_name}</div>
          <div className="dash-serial">#{current.serial_no}</div>
          <button className="dash-logout" onClick={() => { setCurrent(null); setStep("home"); }}>↩</button>
        </div>
        <div className="dash-stats">
          <div className="stat-item">
            <span className="stat-num">{pages.length}</span>
            <span className="stat-label">Fotoğraflanan</span>
          </div>
        </div>
        <button className="btn-upload" onClick={handleUploadPage} disabled={loading}>
          {loading ? "⏳ Yükleniyor..." : "📸 Sayfa Fotoğrafla"}
        </button>
        {error && <div className="error-msg">{error}</div>}
        <div className="pages-grid">{renderAllPages()}</div>
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
    <div className="screen home-screen">
      <div className="home-logo"><span className="logo-ajan">AJAN</span><span className="logo-da">-DA</span></div>
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
      <button className="btn-primary" onClick={() => setStep("activate")}>+ Yeni Ajanda Ekle</button>
    </div>
  );
}

// ─── STİLLER ─────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --theme: #2d4a3e; --cream: #faf8f5; --ink: #1a1512; --warm: #8b6f5c; --accent: #c4956a; --border: #e2d9ce; --soft: #f0ebe3; --red: #e05c4b; --green: #4caf50; }
  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); min-height: 100vh; }
  .screen { min-height: 100vh; padding: 24px 20px; max-width: 480px; margin: 0 auto; }
  .home-screen { display: flex; flex-direction: column; align-items: center; padding-top: 80px; gap: 20px; }
  .home-logo { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; }
  .logo-ajan { color: var(--ink); } .logo-da { color: var(--accent); }
  .home-tagline { color: var(--warm); font-size: 16px; margin-top: -12px; }
  .journals-list { width: 100%; display: flex; flex-direction: column; gap: 8px; }
  .journals-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 4px; }
  .journal-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; border: 1.5px solid var(--border); border-radius: 12px; background: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: all 0.2s; text-align: left; }
  .journal-item:hover { border-color: var(--accent); }
  .journal-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .journal-name { flex: 1; font-weight: 600; } .journal-serial { color: var(--warm); font-size: 12px; } .journal-arrow { color: var(--warm); }
  .activate-screen { display: flex; flex-direction: column; align-items: center; padding-top: 40px; gap: 16px; }
  .activate-icon { font-size: 60px; margin: 16px 0; }
  .activate-screen h2 { font-family: 'Playfair Display', serif; font-size: 28px; }
  .activate-screen p { color: var(--warm); text-align: center; font-size: 14px; }
  .pin-input { width: 100%; padding: 14px 16px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 18px; font-family: 'DM Sans', sans-serif; text-align: center; letter-spacing: 4px; outline: none; }
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
  .btn-upload:hover:not(:disabled) { opacity: 0.9; } .btn-upload:disabled { opacity: 0.6; }
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
  .detail-image-wrap { border-radius: 12px; overflow: hidden; } .detail-image { width: 100%; display: block; }
  .detail-template { background: white; border-radius: 12px; border: 1px solid var(--border); padding: 16px; }
  .multi-region { display: flex; flex-direction: column; gap: 6px; }
  .region-block { border: 1px solid var(--border); border-radius: 6px; padding: 6px; background: var(--soft); }
  .region-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 4px; }
  .overlay-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: rgba(26,21,18,0.95); color: white; padding: 40px; }
  .overlay-icon { font-size: 64px; } .overlay-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; text-align: center; }
  .overlay-desc { font-size: 14px; opacity: 0.7; text-align: center; line-height: 1.6; }
  .btn-overlay-confirm { width: 100%; max-width: 280px; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px; }
  .btn-overlay-cancel { width: 100%; max-width: 280px; padding: 14px; background: rgba(255,255,255,0.15); color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 16px; cursor: pointer; }
  .spinner { width: 40px; height: 40px; margin-top: 16px; border: 3px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .tpl-header { font-weight: 700; font-size: 12px; margin-bottom: 6px; color: var(--ink); border-bottom: 2px solid var(--accent); padding-bottom: 3px; }
  .tpl-empty-hint { font-size: 10px; color: var(--warm); font-style: italic; }
  .tpl-section { margin-top: 6px; }
  .tpl-section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--warm); margin-bottom: 3px; }
  .tpl-date { font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
  .tpl-notes-text { font-size: 11px; line-height: 1.5; color: var(--ink); white-space: pre-wrap; }
  .tpl-item { font-size: 10px; margin-bottom: 2px; }
  .tpl-row { display: flex; gap: 6px; }
  .tpl-lines { display: flex; flex-direction: column; gap: 8px; }
  .tpl-line { height: 1px; background: var(--border); }
  .tpl-priority-item { display: flex; align-items: center; gap: 4px; font-size: 11px; margin-bottom: 2px; }
  .tpl-num { width: 16px; height: 16px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; flex-shrink: 0; }
  .tpl-highlights { font-size: 10px; background: var(--soft); border-radius: 6px; padding: 4px 8px; margin-bottom: 6px; color: var(--warm); }
  .tpl-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin: 4px 0; }
  .tpl-month-header { font-size: 8px; color: var(--warm); font-weight: 600; text-align: center; padding: 1px; }
  .tpl-month-day { font-size: 8px; text-align: center; padding: 2px; border: 1px solid var(--border); min-height: 14px; border-radius: 2px; }
  .tpl-month-day.marked { background: #ffeb3b; font-weight: 700; border-color: #f9a825; }
  .tpl-mood-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin: 4px 0; }
  .tpl-mood-cell { font-size: 8px; text-align: center; padding: 2px; border: 1px solid var(--border); min-height: 18px; border-radius: 2px; display: flex; flex-direction: column; align-items: center; }
  .tpl-mood-day { font-size: 7px; color: var(--warm); } .tpl-mood-emoji { font-size: 9px; }
  .tpl-bingo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
  .tpl-bingo-cell { border: 1px solid var(--border); border-radius: 4px; padding: 4px; min-height: 24px; font-size: 9px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .tpl-bingo-cell.checked { background: var(--accent); color: white; }
  .tpl-vision-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
  .tpl-vision-box { border: 1.5px solid var(--border); border-radius: 8px; min-height: 36px; padding: 4px; font-size: 9px; display: flex; align-items: center; justify-content: center; }
  .tpl-onemli-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
  .tpl-onemli-month { border: 1px solid var(--border); border-radius: 6px; padding: 4px; }
  .tpl-onemli-month-name { font-size: 8px; font-weight: 700; color: var(--accent); margin-bottom: 2px; }
  .tpl-onemli-content { font-size: 8px; color: var(--ink); }
  .tpl-table { width: 100%; border-collapse: collapse; font-size: 9px; }
  .tpl-table th { background: var(--soft); font-weight: 700; padding: 3px 4px; border: 1px solid var(--border); }
  .tpl-table td { padding: 2px 4px; border: 1px solid var(--border); }
  .tpl-okuma-cols { display: flex; gap: 8px; }
  .tpl-okuma-col { flex: 1; }
  .tpl-okuma-item { display: flex; gap: 4px; margin-bottom: 2px; }
  .tpl-okuma-num { font-size: 9px; font-weight: 700; color: var(--accent); min-width: 16px; }
  .tpl-okuma-line { font-size: 9px; flex: 1; border-bottom: 1px dashed var(--border); }
  .tpl-ders-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; }
  .tpl-ders-day { border: 1px solid var(--border); border-radius: 4px; }
  .tpl-ders-day-num { font-size: 7px; font-weight: 700; background: var(--soft); padding: 2px; text-align: center; }
  .tpl-ders-content { font-size: 8px; padding: 2px; min-height: 24px; }
  .tpl-spor-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; }
  .tpl-spor-cell { border: 1px solid var(--border); border-radius: 4px; }
  .tpl-spor-num { font-size: 7px; font-weight: 700; background: #c8d8b0; padding: 1px 2px; text-align: center; }
  .tpl-spor-content { font-size: 8px; padding: 2px; min-height: 20px; }
  .tpl-sifre-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .tpl-sifre-card { border: 1px solid var(--border); border-radius: 6px; padding: 4px; }
  .tpl-sifre-site { font-size: 9px; font-weight: 700; color: var(--accent); }
  .tpl-sifre-user, .tpl-sifre-pass { font-size: 8px; color: var(--warm); }
  .tpl-eg-grid { overflow-x: auto; }
  .tpl-eg-row { display: flex; align-items: center; }
  .tpl-eg-header .tpl-eg-month { font-size: 7px; font-weight: 700; color: var(--warm); }
  .tpl-eg-day { width: 18px; font-size: 7px; color: var(--warm); flex-shrink: 0; }
  .tpl-eg-month { width: 18px; text-align: center; flex-shrink: 0; }
  .tpl-eg-cell { width: 18px; height: 10px; border: 1px solid var(--border); flex-shrink: 0; }
  .tpl-eg-cell.done { background: var(--accent); }
  .tpl-habit-list { display: flex; flex-direction: column; gap: 4px; }
  .tpl-habit-item { display: flex; align-items: center; gap: 6px; font-size: 11px; }
  .tpl-habit-check { font-size: 12px; } .tpl-habit-check.done { color: var(--green); }
  .tpl-habit-days { font-size: 9px; color: var(--warm); }
  .tpl-habit-dots { display: flex; gap: 2px; margin-left: auto; }
  .tpl-habit-dot { font-size: 8px; } .tpl-habit-dot.done { color: var(--green); }
  .tpl-haftalik-days { display: flex; flex-direction: column; gap: 4px; }
  .tpl-day-block { border-left: 3px solid var(--accent); padding-left: 6px; }
  .tpl-day-name { font-size: 9px; font-weight: 700; color: var(--accent); margin-bottom: 2px; }
  .tpl-day-content { font-size: 10px; color: var(--ink); }
  .tpl-tekli-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .tpl-tekli-box { border: 1px solid var(--border); border-radius: 6px; padding: 4px; min-height: 32px; }
  .tpl-tekli2-days { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .tpl-tekli2-day { border: 1px solid var(--border); border-radius: 6px; padding: 4px; }
  .tpl-schedule-item { display: flex; gap: 6px; font-size: 10px; border-bottom: 1px solid var(--border); padding: 1px 0; }
  .tpl-hour { font-weight: 600; color: var(--warm); min-width: 36px; flex-shrink: 0; }
  .tpl-sukran-list { display: flex; flex-direction: column; gap: 2px; }
  .tpl-sukran-item { display: flex; gap: 4px; font-size: 10px; border-bottom: 1px solid var(--border); padding: 1px 0; }
  .tpl-sukran-num { font-weight: 700; color: var(--accent); min-width: 14px; }
  .tpl-sukran-text { flex: 1; }
  .tpl-filmserit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
  .tpl-film-frame { border: 2px solid #1a1512; min-height: 24px; font-size: 8px; display: flex; align-items: center; justify-content: center; }
  .tpl-kitapraf-shelves { display: flex; flex-direction: column; gap: 8px; }
  .tpl-shelf { display: flex; gap: 2px; border-bottom: 3px solid #5d4037; padding-bottom: 2px; }
  .tpl-book { width: 18px; min-height: 32px; border: 1px solid var(--border); border-radius: 2px; font-size: 7px; display: flex; align-items: flex-end; justify-content: center; }
  .tpl-book.filled { background: var(--accent); color: white; }
  .tpl-yemek-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .tpl-yemek-day { border: 1px solid var(--border); border-radius: 6px; padding: 4px; }
  .tpl-cover { border-radius: 8px; padding: 16px; color: white; min-height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
  .tpl-cover-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; text-align: center; }
  .tpl-cover-sub { font-size: 10px; opacity: 0.8; margin-top: 4px; }
  .tpl-cover-date { font-size: 9px; opacity: 0.6; margin-top: 4px; }
  .tpl-cover-hint { font-size: 10px; opacity: 0.7; margin-top: 8px; }
  .tpl-letter-lines { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
`;

const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);
import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import axios from 'axios';
import './Ajanda.css';

const Ajanda = ({ theme }) => {
  const [pages, setPages] = useState(Array(30).fill(""));
  const bookRef = useRef();

  useEffect(() => {
    const fetchNotes = async () => {
      const res = await axios.get(`http://127.0.0.1:8000/history?theme=${theme}`);
      const newPages = Array(30).fill("");
      res.data.forEach(n => {
        const p = parseInt(n.page);
        if (p >= 1 && p <= 30) newPages[p - 1] += (newPages[p - 1] ? "\n" : "") + n.text;
      });
      setPages(newPages);
    };
    fetchNotes();
  }, [theme]);

  return (
    <div className="ajanda-wrapper">
      <HTMLFlipBook width={400} height={550} showCover={true} ref={bookRef}>
        {/* ÖN KAPAK */}
        <div className="page cover" data-density="hard">
          <div className="cover-content">
            <h1>{theme}</h1>
            <p>2026 GÜNCESİ</p>
          </div>
        </div>

        {/* 30 ADET SAYFA */}
        {pages.map((txt, i) => (
          <div key={i} className="page sheet">
            <div className="spiral-rings"></div>
            <div className="sheet-inner">
              <span className="pg-num">{i + 1}</span>
              <div className="writing-font">{txt}</div>
            </div>
          </div>
        ))}
      </HTMLFlipBook>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => bookRef.current.pageFlip().flipPrev()}>Önceki Sayfa</button>
        <button onClick={() => bookRef.current.pageFlip().flipNext()}>Sonraki Sayfa</button>
      </div>
    </div>
  );
};

export default Ajanda;
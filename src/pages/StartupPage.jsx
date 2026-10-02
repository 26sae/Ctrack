import React, { useState } from 'react';
import { SLIDES } from '../constants';

function StartupPage({ onNavigate }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      onNavigate('register');
    } else {
      setSlide((s) => s + 1);
    }
  };

  return (
    <div className="onboard page-full">
      <div className="ob-slides" style={{ transform: `translateX(-${slide * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <div key={i} className={`ob-slide ob-slide-${i}`}>
            <div className="blob blob1" />
            <div className="blob blob2" />
            <div className="ob-top" style={{ zIndex: 1 }}>
              {!isLast ? (
                <button className="ob-skip" onClick={() => onNavigate('login')}>
                  Skip
                </button>
              ) : (
                <div />
              )}
            </div>
            <div className="ob-illus" style={{ zIndex: 1 }}>
              <div className="ob-illus-ring">{s.icon}</div>
            </div>
            <div style={{ zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 24px 0' }}>
              <div className="ob-text">
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
              </div>
              <div className="ob-bottom">
                <div className="ob-dots">
                  {SLIDES.map((_, di) => (
                    <div key={di} className={`ob-dot ${di === slide ? 'on' : ''}`} />
                  ))}
                </div>
                <button className="ob-btn" onClick={next}>
                  {isLast ? 'Get Started' : 'Next'}
                </button>
                {isLast && (
                  <p className="ob-sub">
                    Already have an account?{' '}
                    <span onClick={() => onNavigate('login')}>Sign in</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StartupPage;

import React from 'react';

function SubHeader({ title, onBack }) {
  return (
    <div className="sub-hdr">
      <button className="sub-back" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12 4L6 10L12 16"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1>{title}</h1>
    </div>
  );
}

export default SubHeader;

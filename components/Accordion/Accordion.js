'use client';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function Accordion({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <strong>{label}</strong>
        {open ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

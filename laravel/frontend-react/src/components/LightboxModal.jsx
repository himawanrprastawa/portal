import React from 'react';
import { X, Download, Image as ImageIcon } from 'lucide-react';

export default function LightboxModal({ show, onClose, title, subtitle, imageUrl }) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-dark text-white">
          {/* Header */}
          <div className="modal-header border-secondary border-opacity-50 py-2.5 px-3">
            <div className="d-flex align-items-center gap-2">
              <ImageIcon size={18} className="text-primary" />
              <div>
                <h6 className="modal-title mb-0 fw-bold small text-truncate" style={{ maxWidth: '300px' }}>
                  {title || 'Pratinjau Berkas'}
                </h6>
                <small className="text-secondary" style={{ fontSize: '0.7rem' }}>{subtitle}</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {imageUrl && (
                <a href={imageUrl} download="bukti_dokumen.png" className="btn btn-sm btn-outline-light py-1 px-2 text-xs">
                  <Download size={14} className="me-1" />
                  Unduh
                </a>
              )}
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-3 text-center bg-black d-flex align-items-center justify-content-center" style={{ minHeight: '300px', maxHeight: '75vh', overflow: 'auto' }}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Document Preview" 
                className="img-fluid rounded-2 shadow-sm"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            ) : (
              <div className="text-secondary p-5">
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <p className="small mb-0">Tidak ada gambar pratinjau</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-secondary border-opacity-50 py-2 px-3 justify-content-between">
            <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Klik tombol tutup atau latar belakang untuk kembali.</small>
            <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


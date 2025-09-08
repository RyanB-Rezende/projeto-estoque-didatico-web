import React from 'react';

// Dialogo simples de confirmação reutilizável
// Props:
//  - title: string opcional
//  - message: string ou ReactNode
//  - confirmLabel / cancelLabel
//  - onConfirm / onCancel
export default function ConfirmDialog({
  title = 'Confirmação',
  message = 'Tem certeza?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center'}}
      data-testid="confirm-dialog"
    >
      <div className="card shadow" style={{minWidth:'300px', maxWidth:'420px'}}>
        <div className="card-header py-2" style={{background:'#dc3545', color:'#fff'}}>
          <strong id="confirm-title" className="small">{title}</strong>
        </div>
        <div className="card-body py-3 small">
          {message}
        </div>
        <div className="card-footer py-2 d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light btn-sm" onClick={onCancel} aria-label="Cancelar remoção">{cancelLabel}</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm} aria-label="Confirmar remoção">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {title && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{title}</h2>
                        <button
                            onClick={onClose}
                            className="btn-ghost"
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                fontSize: '18px',
                                padding: 0
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

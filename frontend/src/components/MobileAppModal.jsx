import React from 'react'
import Modal from 'react-modal'

Modal.setAppElement('#root')

export default function MobileAppModal({ isOpen, onRequestClose }){
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} overlayClassName="modal-overlay" className="card" contentLabel="Get Mobile App">
      <h3 className="text-lg font-semibold mb-3">Get the Mobile App</h3>
      <p className="text-sm text-gray-600">We're building mobile apps — this is a placeholder. You can download the app here when available or scan the QR code.</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="bg-gray-100 rounded p-4">[QR]</div>
        <div className="flex flex-col gap-2">
          <a className="btn-primary px-3 py-2" href="#" onClick={(e)=>{ e.preventDefault(); alert('App download not available yet'); }}>Download for iOS</a>
          <a className="btn-primary px-3 py-2" href="#" onClick={(e)=>{ e.preventDefault(); alert('App download not available yet'); }}>Download for Android</a>
        </div>
      </div>
      <div className="mt-4 text-right"><button onClick={onRequestClose} className="px-3 py-1 border rounded">Close</button></div>
    </Modal>
  )
}

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/notes.css'

export default function Notes() {
  const { user, token } = useAuth()
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('app_notes')
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes)
      setNotes(parsed)
      if (parsed.length > 0) {
        setSelectedNote(parsed[0].id)
        setNoteTitle(parsed[0].title)
        setNoteContent(parsed[0].content)
      }
    }
  }, [])

  // Save notes to localStorage
  const saveNotes = (updatedNotes) => {
    localStorage.setItem('app_notes', JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    const updated = [newNote, ...notes]
    saveNotes(updated)
    setSelectedNote(newNote.id)
    setNoteTitle(newNote.title)
    setNoteContent(newNote.content)
  }

  const selectNote = (noteId) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setSelectedNote(noteId)
      setNoteTitle(note.title)
      setNoteContent(note.content)
    }
  }

  const saveCurrentNote = () => {
    if (!selectedNote) return
    const updated = notes.map(n => 
      n.id === selectedNote 
        ? { ...n, title: noteTitle || 'Untitled Note', content: noteContent }
        : n
    )
    saveNotes(updated)
  }

  const deleteNote = (noteId) => {
    const updated = notes.filter(n => n.id !== noteId)
    saveNotes(updated)
    if (selectedNote === noteId) {
      if (updated.length > 0) {
        setSelectedNote(updated[0].id)
        setNoteTitle(updated[0].title)
        setNoteContent(updated[0].content)
      } else {
        setSelectedNote(null)
        setNoteTitle('')
        setNoteContent('')
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="notes-container">
      {/* Left Sidebar */}
      <aside className="notes-sidebar">
        <h2 className="notes-title">My Notes</h2>
        <button className="new-note-btn" onClick={createNewNote}>
          New Note
        </button>

        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-notes">No notes yet. Create one!</div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                className={`note-item ${selectedNote === note.id ? 'active' : ''}`}
                onClick={() => selectNote(note.id)}
              >
                <div className="note-item-header">
                  <h3 className="note-item-title">{note.title}</h3>
                  <span className="note-date">{formatDate(note.createdAt)}</span>
                </div>
                <span className="note-status">{note.status}</span>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right Editor */}
      <main className="notes-editor">
        {selectedNote ? (
          <>
            <div className="editor-header">
              <input
                type="text"
                className="editor-title-input"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title..."
              />
              <span className="editor-status">{notes.find(n => n.id === selectedNote)?.status || 'active'}</span>
            </div>

            <div className="editor-toolbar">
              <button className="toolbar-btn" title="Bold"><strong>B</strong></button>
              <button className="toolbar-btn" title="Italic"><em>I</em></button>
              <button className="toolbar-btn" title="Underline"><u>U</u></button>
              <button className="toolbar-btn" title="Strikethrough"><s>S</s></button>
              <button className="toolbar-btn" title="List">List</button>
            </div>

            <textarea
              className="editor-textarea"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start writing your thoughts..."
            />

            <div className="editor-footer">
              <button
                className="delete-btn"
                onClick={() => deleteNote(selectedNote)}
              >
                Delete
              </button>
              <button
                className="save-btn"
                onClick={saveCurrentNote}
              >
                Save Note
              </button>
            </div>
          </>
        ) : (
          <div className="editor-empty">
            <p>Select a note or create a new one to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}

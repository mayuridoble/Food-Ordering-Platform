import { NotebookPen, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'

const NOTES_KEY = 'yumkart_notes'

function NotesPage() {
  const [text, setText] = useState('')
  const [notes, setNotes] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
      setNotes(Array.isArray(saved) ? saved : [])
    } catch {
      setNotes([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  }, [notes])

  const noteCount = useMemo(() => notes.length, [notes])

  const addNote = () => {
    const value = text.trim()
    if (!value) return
    setNotes((prev) => [{ id: Date.now(), text: value }, ...prev])
    setText('')
  }

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-6 w-6 text-orange-500" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quick Notes</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm text-slate-600">
          Save delivery instructions, favorite combos, or reminders. ({noteCount} notes)
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a quick note..."
            className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-300"
          />
          <Button type="button" className="h-11 rounded-xl px-5" onClick={addNote}>
            Add note
          </Button>
        </div>
      </div>

      {notes.length ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm text-slate-700">{note.text}</p>
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No notes yet. Add your first quick note.
        </div>
      )}
    </section>
  )
}

export default NotesPage

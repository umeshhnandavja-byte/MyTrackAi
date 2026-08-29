"use client"

import { useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link2, Maximize2, Minimize2, MoreHorizontal, Palette, Pin, Plus, Save, StickyNote, Trash2, X, ImagePlus, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useBoardState, updateBoardState, loadBoard, BoardNote } from '@/lib/board-store'

type Point = { x: number; y: number }

export function DetectiveBoard() {
  const state = useBoardState()
  const { notes, positions, sizes, connections, customColors, customFontColors } = state

  const [selected, setSelected] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState({ title: '', text: '' })
  const [connectMode, setConnectMode] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [expanded, setExpanded] = useState(false)
  const [resizing, setResizing] = useState<{ id: number; start: Point; size: Point } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const fontColorInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadBoard()
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 900;
      scrollContainerRef.current.scrollTop = 900;
    }
  }, [])

  const points = useMemo(() => Object.fromEntries(notes.map((note) => [note.id, positions[note.id] ?? { x: note.x, y: note.y }])), [notes, positions]) as Record<number, Point>
  
  const getSize = (id: number) => sizes[id] ?? { x: 240, y: notes.find(n => n.id === id)?.imageUrl ? 220 : 180 };

  const canvasSize = 3000;

  const paths = connections.flatMap(([from, to]) => { 
    const a = points[from]; 
    const b = points[to]; 
    if (!a || !b) return [];
    
    const sizeA = getSize(from);
    const sizeB = getSize(to);
    
    const startX = a.x + sizeA.x;
    const startY = a.y + sizeA.y / 2;
    const endX = b.x;
    const endY = b.y + sizeB.y / 2;
    
    const cp1X = startX + Math.max(50, Math.abs(endX - startX) / 2);
    const cp1Y = startY;
    const cp2X = endX - Math.max(50, Math.abs(endX - startX) / 2);
    const cp2Y = endY;
    
    return [`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`];
  })
  
  const distance = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
  const [pinch, setPinch] = useState<{ distance: number; zoom: number } | null>(null)
  
  const zoomIn = () => setZoom((value) => Math.min(2.5, value + 0.1))
  const zoomOut = () => setZoom((value) => Math.max(0.5, value - 0.1))
  
  const selectNote = (id: number) => { 
    if (connectMode && selected !== null && selected !== id) { 
      const exists = connections.some(([a, b]) => (a === selected && b === id) || (a === id && b === selected));
      const newConnections = exists
        ? connections.filter(([a, b]) => !((a === selected && b === id) || (a === id && b === selected)))
        : [...connections, [selected, id] as [number, number]];
      
      updateBoardState({ connections: newConnections });
      setSelected(null); 
      return 
    }
    setSelected(id) 
  }
  
  const addNote = () => { 
    const id = Math.max(0, ...notes.map((note) => note.id)) + 1; 
    const note: BoardNote = { id, title: 'New note', text: 'Add your idea here.', tone: 'yellow', x: 1100 + notes.length * 34, y: 1100 + notes.length * 24 }; 
    const newNotes = [...notes, note];
    updateBoardState({ notes: newNotes });
    setSelected(id); 
    setEditing(id); 
    setDraft({ title: note.title, text: note.text }) 
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const id = Math.max(0, ...notes.map(n => n.id)) + 1;
      const newNotes = [...notes, {
        id,
        title: file.name.substring(0, 20),
        text: 'Uploaded image reference',
        tone: 'paper',
        x: 1150 + (notes.length * 10),
        y: 1150 + (notes.length * 10),
        imageUrl: url
      }];
      updateBoardState({ notes: newNotes });
      setSelected(id);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
  
  const deleteNote = () => { 
    const id = editing ?? selected; 
    if (id === null || id === undefined) return; 
    const newNotes = notes.filter((note) => note.id !== id);
    const newConnections = connections.filter(([a, b]) => a !== id && b !== id);
    updateBoardState({ notes: newNotes, connections: newConnections });
    setEditing(null); 
    setSelected(null) 
  }
  
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-zinc-950 px-5 py-6 shadow-2xl sm:px-8">
      <div className="pointer-events-none absolute inset-0 board-dots opacity-60" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"><Pin className="size-3" /> Board / 01</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-semibold tracking-tight">Planning Board</h2>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200">Beta</span>
          </div>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Move notes freely and connect as many ideas as you need.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setExpanded(!expanded)}>{expanded ? <Minimize2 /> : <Maximize2 />}</Button>
          <Button variant="outline" size="icon"><MoreHorizontal /></Button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        onWheel={(event) => { if (event.ctrlKey || event.metaKey) { event.preventDefault(); setZoom((value) => Math.min(2.5, Math.max(0.5, value - event.deltaY * 0.002))) } }} 
        onTouchStart={(event) => event.touches.length === 2 && setPinch({ distance: distance(event.touches), zoom })} 
        onTouchMove={(event) => { if (event.touches.length === 2 && pinch) { event.preventDefault(); setZoom(Math.min(2.5, Math.max(0.5, pinch.zoom * distance(event.touches) / pinch.distance))) } }} 
        onTouchEnd={() => setPinch(null)} 
        className={cn('relative mt-8 min-h-[420px] overflow-auto rounded-xl border border-border/40 bg-background/20', expanded && 'min-h-[calc(100vh-12rem)]')} 
        style={{ height: expanded ? 'calc(100vh - 12rem)' : 640 }}
      >
        <div className="relative board-dots" style={{ width: canvasSize * zoom, height: canvasSize * zoom, touchAction: 'none' }}>
          <div className="absolute left-0 top-0" style={{ width: canvasSize, height: canvasSize, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            <svg className="pointer-events-none absolute inset-0 overflow-visible" width="100%" height="100%" aria-hidden="true">
              {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="oklch(.62 0 0)" strokeDasharray="9 10" strokeLinecap="round" strokeWidth="3" />)}
            </svg>
            
            {notes.map((note, index) => { 
              const point = points[note.id]; 
              const size = getSize(note.id); 
              
              return (
                <motion.div 
                  key={note.id} 
                  onPan={(event, info) => {
                    const newPositions = {
                      ...positions,
                      [note.id]: {
                        x: (positions[note.id]?.x ?? note.x) + info.delta.x / zoom,
                        y: (positions[note.id]?.y ?? note.y) + info.delta.y / zoom
                      }
                    };
                    updateBoardState({ positions: newPositions });
                  }} 
                  onClick={() => selectNote(note.id)} 
                  onDoubleClick={() => { setEditing(note.id); setDraft({ title: note.title, text: note.text }) }} 
                  className={cn(
                    'absolute z-10 cursor-grab active:cursor-grabbing overflow-hidden rounded-sm border shadow-2xl text-left', 
                    note.imageUrl ? 'rounded-lg bg-card/80 backdrop-blur-xl' : 'p-5',
                    note.tone === 'yellow' && !note.imageUrl ? 'border-[#b8a94d]/40 bg-[#c9bd61] text-zinc-950' : 
                    note.tone === 'blue' && !note.imageUrl ? 'border-sky-300/40 bg-sky-400 text-slate-950' : 
                    note.tone === 'green' && !note.imageUrl ? 'border-emerald-300/40 bg-emerald-400 text-emerald-950' : 
                    'border-border bg-card/90 text-foreground',
                    selected === note.id && 'ring-2 ring-foreground'
                  )} 
                  style={{ 
                    left: point.x, 
                    top: point.y, 
                    width: size.x, 
                    height: size.y, 
                    ...(customColors[note.id] ? { backgroundColor: customColors[note.id] } : {}),
                    ...(customFontColors[note.id] ? { color: customFontColors[note.id] } : {})
                  }}
                >
                  {note.imageUrl ? (
                    <>
                      <img src={note.imageUrl} alt={note.title} draggable={false} className="h-full w-full object-cover pointer-events-none" style={{ height: 'calc(100% - 64px)' }} />
                      <div className="absolute bottom-0 left-0 w-full h-[64px] border-t border-border/50 bg-card/90 p-3 backdrop-blur-md">
                        <p className="truncate text-sm font-semibold">{note.title}</p>
                        <p className="truncate mt-0.5 text-xs text-muted-foreground" style={customFontColors[note.id] ? { color: 'inherit', opacity: 0.8 } : {}}>{note.text}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="mb-5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ opacity: 0.6 }}><StickyNote className="size-3" /> {String(index + 1).padStart(2, '0')}</span>
                      <span className="block font-mono text-sm font-semibold">{note.title}</span>
                      <span className="mt-3 block whitespace-pre-line text-xs leading-5" style={{ opacity: 0.75 }}>{note.text}</span>
                    </>
                  )}
                  
                  <span 
                    onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setResizing({ id: note.id, start: { x: event.clientX, y: event.clientY }, size }) }} 
                    onPointerMove={(event) => { 
                      if (resizing?.id === note.id) {
                        const newSizes = {
                          ...sizes,
                          [note.id]: { 
                            x: Math.max(150, resizing.size.x + (event.clientX - resizing.start.x) / zoom), 
                            y: Math.max(150, resizing.size.y + (event.clientY - resizing.start.y) / zoom) 
                          }
                        };
                        updateBoardState({ sizes: newSizes });
                      } 
                    }} 
                    onPointerUp={(event) => { event.currentTarget.releasePointerCapture(event.pointerId); setResizing(null) }} 
                    className="absolute bottom-1 right-1 size-4 cursor-se-resize rounded-sm bg-foreground/30" 
                  />
                </motion.div> 
              )
            })}
          </div>
          
          <div className="fixed bottom-4 left-1/2 z-[60] flex h-12 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 scale-100 items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card/90 p-1.5 shadow-2xl backdrop-blur-2xl">
            <Button size="sm" variant="ghost" onClick={addNote}><Plus className="mr-1.5 size-4" />Note</Button>
            
            <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}><ImagePlus className="mr-1.5 size-4" />Image</Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            
            <div className="mx-1 h-6 w-px bg-border/60" />
            
            <Button size="sm" variant={connectMode ? 'secondary' : 'ghost'} onClick={() => { setConnectMode(!connectMode); setSelected(null) }}><Link2 className="mr-1.5 size-4" />{connectMode ? 'Done' : 'Connect'}</Button>
            <Button size="sm" variant="ghost" onClick={zoomOut}>−</Button>
            <span className="min-w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button size="sm" variant="ghost" onClick={zoomIn}>+</Button>
            
            <div className="relative">
              <Button size="sm" variant="ghost" onClick={() => selected !== null && colorInputRef.current?.click()} className={selected === null ? 'opacity-50 cursor-not-allowed' : ''}>
                <Palette className="mr-1.5 size-4" />Bg Color
              </Button>
              <input 
                type="color" 
                ref={colorInputRef} 
                className="sr-only" 
                value={selected !== null ? customColors[selected] ?? '#c9bd61' : '#c9bd61'} 
                onChange={(event) => { 
                  if (selected !== null) { 
                    const newColors = { ...customColors, [selected]: event.target.value };
                    const newNotes = notes.map(n => n.id === selected ? { ...n, tone: 'custom' } : n);
                    updateBoardState({ customColors: newColors, notes: newNotes });
                  } 
                }} 
              />
            </div>

            <div className="relative">
              <Button size="sm" variant="ghost" onClick={() => selected !== null && fontColorInputRef.current?.click()} className={selected === null ? 'opacity-50 cursor-not-allowed' : ''}>
                <Type className="mr-1.5 size-4" />Text
              </Button>
              <input 
                type="color" 
                ref={fontColorInputRef} 
                className="sr-only" 
                value={selected !== null ? customFontColors[selected] ?? '#000000' : '#000000'} 
                onChange={(event) => { 
                  if (selected !== null) { 
                    const newFontColors = { ...customFontColors, [selected]: event.target.value };
                    updateBoardState({ customFontColors: newFontColors });
                  } 
                }} 
              />
            </div>
            
            {selected !== null && <Button size="sm" variant="ghost" className="text-destructive" onClick={deleteNote}><Trash2 className="mr-1.5 size-4" />Delete</Button>}
          </div>
        </div>
      </div>
      
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit note</DialogTitle>
            <DialogDescription>Update this note without leaving the board.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
            <textarea value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={deleteNote}><Trash2 className="mr-1.5 size-4" />Delete note</Button>
            <Button onClick={() => { 
              if (editing !== null) {
                const newNotes = notes.map((note) => note.id === editing ? { ...note, title: draft.title || 'Untitled note', text: draft.text || 'No description yet.' } : note);
                updateBoardState({ notes: newNotes });
              }
              setEditing(null); 
            }}><Save className="mr-1.5 size-4" />Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const PlanningBoard = DetectiveBoard
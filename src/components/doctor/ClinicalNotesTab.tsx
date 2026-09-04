import { useState } from "react";
import { format } from "date-fns";
import { NotebookPen, Trash2, Save, Plus, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinicalNotes } from "@/hooks/useClinicalNotes";

const CATEGORIES = ["general", "diagnosis", "follow-up", "observation", "treatment", "referral"];

export function ClinicalNotesTab({ patientId }: { patientId: string }) {
  const { notes, isLoading, addNote, updateNote, deleteNote } = useClinicalNotes(patientId);

  const [note, setNote] = useState("");
  const [category, setCategory] = useState("general");
  const [visitDate, setVisitDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    addNote.mutate(
      { note: note.trim(), category, visit_date: visitDate },
      { onSuccess: () => setNote("") },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <NotebookPen className="h-4 w-4 text-primary" /> New clinical note
              <Badge variant="secondary" className="ml-auto gap-1 text-[10px]">
                <Lock className="h-3 w-3" /> Private to you
              </Badge>
            </div>
            <Textarea
              rows={4}
              placeholder="Observations, differential diagnosis, plan for next visit…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Visit date</Label>
                <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={addNote.isPending || !note.trim()}>
                  <Plus className="mr-1 h-4 w-4" /> Save note
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No clinical notes yet for this patient.</p>
      ) : (
        notes.map((n) => (
          <Card key={n.id} className="shadow-sm">
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">{n.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  Visit {format(new Date(n.visit_date), "dd MMM yyyy")}
                </span>
                <div className="ml-auto flex gap-1">
                  {editingId === n.id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        updateNote.mutate(
                          { id: n.id, note: editText, category: n.category },
                          { onSuccess: () => setEditingId(null) },
                        );
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(n.id); setEditText(n.note); }}>
                      <NotebookPen className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteNote.mutate(n.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {editingId === n.id ? (
                <Textarea rows={4} value={editText} onChange={(e) => setEditText(e.target.value)} />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-foreground">{n.note}</p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default ClinicalNotesTab;

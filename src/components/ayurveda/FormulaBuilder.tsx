import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AyurvedicFormula, AyurvedicFormulaElements } from '@/types/ayurveda';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface FormulaBuilderProps {
  formulas: AyurvedicFormula[];
  onChange: (formulas: AyurvedicFormula[]) => void;
}

const BODY_PARTS = [
  'Toe No. 0', 'Toe No. 1', 'Toe No. 2', 'Toe No. 3', 'Toe No. 4',
  'Right Thumb', 'Left Thumb', 'Right Index', 'Left Index',
  'Right Middle', 'Left Middle', 'Right Ring', 'Left Ring',
  'Right Small', 'Left Small', 'Both Index', 'Both Middle',
  'Both Ring', 'Both Small', 'Both Thumbs', 'All Toes', 'All Fingers'
];

const JOINTS = [
  'V jt.', 'P jt.', 'K jt.', 'Spm', 'None'
];

const COLORS = [
  'None', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'White', 'Orange'
];

export const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ formulas, onChange }) => {
  const [bodyPart, setBodyPart] = useState('');
  const [joint, setJoint] = useState('');
  const [color, setColor] = useState('None');
  
  // Track state of each digit 0-9: 0 = neutral, 1 = tonify (up), -1 = sedate (down)
  const [elementsState, setElementsState] = useState<Record<number, number>>({});

  const toggleElementState = (num: number) => {
    setElementsState(prev => {
      const current = prev[num] || 0;
      let next = 0;
      if (current === 0) next = 1;      // Tonify
      else if (current === 1) next = -1; // Sedate
      else next = 0;                    // Neutral
      return { ...prev, [num]: next };
    });
  };

  const generateElementsString = (tonify: number[], sedate: number[]) => {
    const parts = [];
    if (sedate.length > 0) parts.push(`${sedate.join(', ')} ↓`);
    if (tonify.length > 0) parts.push(`${tonify.join(', ')} ↑`);
    return parts.join(' , ');
  };

  const handleAdd = () => {
    if (!bodyPart) return;

    const tonify = Object.keys(elementsState).map(Number).filter(k => elementsState[k] === 1).sort();
    const sedate = Object.keys(elementsState).map(Number).filter(k => elementsState[k] === -1).sort();

    const newFormula: AyurvedicFormula = {
      body_part: bodyPart,
      joint: joint === 'None' ? undefined : joint,
      elements: (tonify.length > 0 || sedate.length > 0) ? { tonify, sedate } : undefined,
      color_applied: color !== 'None' ? `${color} colour` : undefined
    };

    onChange([...formulas, newFormula]);
    
    // Reset builder
    setBodyPart('');
    setJoint('');
    setColor('None');
    setElementsState({});
  };

  const handleRemove = (index: number) => {
    onChange(formulas.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Treatment Formulas</CardTitle>
        <CardDescription>Construct custom Ayurvedic Acupressure formulas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Builder Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50">
          <div className="space-y-2">
            <Label>Body Part</Label>
            <div className="flex flex-col gap-2">
               <Select value={bodyPart} onValueChange={setBodyPart}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Part" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_PARTS.map(part => (
                    <SelectItem key={part} value={part}>{part}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                placeholder="Or type custom part..." 
                value={bodyPart} 
                onChange={(e) => setBodyPart(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Joint</Label>
            <Select value={joint} onValueChange={setJoint}>
              <SelectTrigger>
                <SelectValue placeholder="Select Joint" />
              </SelectTrigger>
              <SelectContent>
                {JOINTS.map(j => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color Application</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select Color" />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-4">
            <Label>Elements (Click to Tonify ↑ / Sedate ↓)</Label>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const state = elementsState[num] || 0;
                return (
                  <Button
                    key={num}
                    type="button"
                    variant={state === 1 ? 'default' : state === -1 ? 'destructive' : 'outline'}
                    className="w-12 h-12 text-lg font-bold"
                    onClick={() => toggleElementState(num)}
                  >
                    {num}
                    {state === 1 && <ArrowUp className="w-3 h-3 ml-1" />}
                    {state === -1 && <ArrowDown className="w-3 h-3 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-4 flex justify-end mt-2">
             <Button type="button" onClick={handleAdd} disabled={!bodyPart} className="gap-2">
                <Plus className="w-4 h-4" /> Add Formula
             </Button>
          </div>
        </div>

        {/* List Section */}
        {formulas.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base">Current Protocol</Label>
            <div className="space-y-2">
              {formulas.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-md shadow-sm bg-white">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{i + 1}.</span>
                    <div>
                      <span className="font-medium">{f.body_part}</span>
                      {f.joint && <span className="ml-1 text-slate-600">{f.joint}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {f.elements && (f.elements.tonify.length > 0 || f.elements.sedate.length > 0) && (
                      <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                        {generateElementsString(f.elements.tonify, f.elements.sedate)}
                      </span>
                    )}
                    {f.color_applied && (
                      <span className="text-sm italic">{f.color_applied}</span>
                    )}
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Undo } from 'lucide-react';
import { AyurvedicDiagram, DiagramMarker } from '@/types/ayurveda';

interface InteractiveDiagramProps {
  diagram: AyurvedicDiagram;
  onChange: (diagram: AyurvedicDiagram) => void;
  readonly?: boolean;
}

const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Orange', hex: '#F97316' },
];

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ 
  diagram, 
  onChange,
  readonly = false
}) => {
  const [activeColor, setActiveColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Defaults if no URL provided
  const placeholderImage = diagram.diagram_type === 'hand' 
    ? 'https://images.unsplash.com/photo-1544367567-0f2fcb046e71?w=800&q=80' // Using an unsplash hand as placeholder
    : diagram.diagram_type === 'foot'
      ? 'https://images.unsplash.com/photo-1519766400364-8824efac02b7?w=800&q=80' // Foot placeholder
      : '';

  const getRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    
    const coords = getRelativeCoords(e);
    if (!coords) return;

    const newMarker: DiagramMarker = {
      id: Math.random().toString(36).substr(2, 9),
      x: coords.x,
      y: coords.y,
      color: activeColor,
    };

    onChange({
      ...diagram,
      markers: [...(diagram.markers || []), newMarker]
    });
  };

  const handleUndo = () => {
    if (!diagram.markers || diagram.markers.length === 0) return;
    const newMarkers = [...diagram.markers];
    newMarkers.pop();
    onChange({ ...diagram, markers: newMarkers });
  };

  const clearAll = () => {
    onChange({ ...diagram, markers: [] });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd upload to Supabase storage. 
      // For demonstration we'll use a local object URL.
      const url = URL.createObjectURL(file);
      onChange({ ...diagram, image_url: url });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="capitalize">{diagram.diagram_type} Diagram Editor</CardTitle>
        <CardDescription>
          {readonly ? "View applied treatment points" : "Click on the image to place colored markers"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {!readonly && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3 bg-slate-50 border rounded-md">
            <div className="flex items-center gap-3">
              <Label>Marker Color:</Label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${activeColor === c.hex ? 'border-slate-800 scale-110' : 'border-transparent shadow-sm hover:scale-105'} transition-all`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setActiveColor(c.hex)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleUndo} disabled={!diagram.markers?.length}>
                <Undo className="w-4 h-4 mr-2" /> Undo
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearAll} disabled={!diagram.markers?.length}>
                <Trash2 className="w-4 h-4 mr-2" /> Clear All
              </Button>
               <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Custom Map
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Diagram Area */}
        <div 
          ref={containerRef}
          className={`relative border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-slate-100 min-h-[400px] flex items-center justify-center ${!readonly ? 'cursor-crosshair' : ''}`}
          onClick={handleContainerClick}
        >
          {(diagram.image_url || placeholderImage) ? (
            <img 
              src={diagram.image_url || placeholderImage} 
              alt={`${diagram.diagram_type} map`} 
              className="max-w-full h-auto max-h-[600px] object-contain select-none"
              draggable="false"
            />
          ) : (
            <p className="text-slate-500">No image available.</p>
          )}

          {/* Render Markers */}
          {diagram.markers?.map(marker => (
            <div
              key={marker.id}
              className="absolute w-4 h-4 rounded-full border border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                backgroundColor: marker.color,
                zIndex: 10
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

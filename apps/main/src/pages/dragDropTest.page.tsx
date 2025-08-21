import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, Typography, Button } from '@taskflow/ui';
import { useTheme } from '../hooks';

// Portal component for dragging
const Portal = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === "undefined") return null;
  const portalRoot = document.body;
  return createPortal(children, portalRoot);
};

interface DraggableBox {
  id: string;
  content: string;
  color: string;
}

interface DropZone {
  id: string;
  name: string;
  color: string;
  items: DraggableBox[];
}

export const DragDropTestPage: React.FC = () => {
  const { theme } = useTheme();
  const [dropZones, setDropZones] = useState<DropZone[]>([
    {
      id: 'zone1',
      name: 'Red Zone',
      color: 'bg-red-100 border-red-300',
      items: []
    },
    {
      id: 'zone2', 
      name: 'Blue Zone',
      color: 'bg-blue-100 border-blue-300',
      items: []
    },
    {
      id: 'zone3',
      name: 'Green Zone', 
      color: 'bg-green-100 border-green-300',
      items: []
    },
    {
      id: 'zone4',
      name: 'Yellow Zone',
      color: 'bg-yellow-100 border-yellow-300', 
      items: []
    }
  ]);

  // Update zone colors when theme changes
  useEffect(() => {
    setDropZones(prev => prev.map(zone => {
      const baseColor = zone.name.toLowerCase().replace(' zone', '');
      const newColor = theme === 'dark' 
        ? `bg-${baseColor}-900/30 border-${baseColor}-600`
        : `bg-${baseColor}-100 border-${baseColor}-300`;
      
      return { ...zone, color: newColor };
    }));
  }, [theme]);

  const [draggableBoxes, setDraggableBoxes] = useState<DraggableBox[]>([
    {
      id: 'box1',
      content: 'Drag Me!',
      color: 'bg-purple-500 text-white'
    },
    {
      id: 'box2', 
      content: 'Drag Me Too!',
      color: 'bg-indigo-500 text-white'
    },
    {
      id: 'box3',
      content: 'And Me!',
      color: 'bg-pink-500 text-white'
    }
  ]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    console.log('Drag ended:', { source, destination });

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle dropping from draggable boxes to drop zones
    if (source.droppableId === 'draggable-boxes' && destination.droppableId.startsWith('zone')) {
      const boxToMove = draggableBoxes[source.index];
      const targetZoneId = destination.droppableId;

      // Remove from draggable boxes
      const newDraggableBoxes = draggableBoxes.filter((_, index) => index !== source.index);
      setDraggableBoxes(newDraggableBoxes);

      // Add to target zone
      setDropZones(prev => prev.map(zone => {
        if (zone.id === targetZoneId) {
          return {
            ...zone,
            items: [...zone.items, boxToMove]
          };
        }
        return zone;
      }));
    }

    // Handle moving between drop zones
    if (source.droppableId.startsWith('zone') && destination.droppableId.startsWith('zone')) {
      const sourceZoneId = source.droppableId;
      const destZoneId = destination.droppableId;

      setDropZones(prev => {
        const sourceZone = prev.find(zone => zone.id === sourceZoneId);
        const destZone = prev.find(zone => zone.id === destZoneId);

        if (!sourceZone || !destZone) return prev;

        const itemToMove = sourceZone.items[source.index];
        const newSourceItems = sourceZone.items.filter((_, index) => index !== source.index);
        const newDestItems = [...destZone.items];
        newDestItems.splice(destination.index, 0, itemToMove);

        return prev.map(zone => {
          if (zone.id === sourceZoneId) {
            return { ...zone, items: newSourceItems };
          }
          if (zone.id === destZoneId) {
            return { ...zone, items: newDestItems };
          }
          return zone;
        });
      });
    }

    // Handle moving back to draggable boxes area
    if (source.droppableId.startsWith('zone') && destination.droppableId === 'draggable-boxes') {
      const sourceZoneId = source.droppableId;
      const boxToMove = dropZones.find(zone => zone.id === sourceZoneId)?.items[source.index];

      if (boxToMove) {
        // Remove from source zone
        setDropZones(prev => prev.map(zone => {
          if (zone.id === sourceZoneId) {
            return {
              ...zone,
              items: zone.items.filter((_, index) => index !== source.index)
            };
          }
          return zone;
        }));

        // Add back to draggable boxes
        setDraggableBoxes(prev => [...prev, boxToMove]);
      }
    }
  };

  const resetTest = () => {
    setDropZones(prev => prev.map(zone => ({ ...zone, items: [] })));
    setDraggableBoxes([
      {
        id: 'box1',
        content: 'Drag Me!',
        color: 'bg-purple-500 text-white'
      },
      {
        id: 'box2', 
        content: 'Drag Me Too!',
        color: 'bg-indigo-500 text-white'
      },
      {
        id: 'box3',
        content: 'And Me!',
        color: 'bg-pink-500 text-white'
      }
    ]);
  };

  return (
         <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Typography variant="h1" className="mb-4">
            Drag & Drop Test Page
          </Typography>
          <Typography variant="body-medium" className="mb-4">
            Test drag and drop functionality by moving colored boxes between the zones below.
          </Typography>
          <Button onClick={resetTest} variant="outline">
            Reset Test
          </Button>
        </div>

        <DragDropContext 
          onDragEnd={handleDragEnd}
          onDragStart={(result) => {
            console.log('Drag started:', result);
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Draggable Boxes Area */}
            <div>
              <Typography variant="h3" className="mb-4">
                Draggable Boxes
              </Typography>
              <Droppable droppableId="draggable-boxes">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                                         className={`p-4 rounded-lg border-2 border-dashed ${
                       snapshot.isDraggingOver 
                         ? theme === 'dark' ? 'border-purple-400 bg-purple-900/30' : 'border-purple-400 bg-purple-100'
                         : theme === 'dark' ? 'border-gray-300 bg-gray-800' : 'border-gray-300 bg-white'
                     }`}
                  >
                                         {draggableBoxes.map((box, index) => (
                       <Draggable key={box.id} draggableId={box.id} index={index}>
                         {(provided, snapshot) => {
                           const child = (
                             <div
                               ref={provided.innerRef}
                               {...provided.draggableProps}
                               {...provided.dragHandleProps}
                               className={`mb-3 p-4 rounded-lg cursor-move transition-all ${
                                 snapshot.isDragging ? 'opacity-50 scale-95 rotate-2' : ''
                               } ${box.color}`}
                               style={{
                                 ...provided.draggableProps.style,
                                 userSelect: 'none',
                               }}
                             >
                               <Typography variant="body-medium" className="font-semibold">
                                 {box.content}
                               </Typography>
                             </div>
                           );

                           // 🚀 Move dragging item to body to avoid weird positioning
                           if (snapshot.isDragging) {
                             return <Portal>{child}</Portal>;
                           }
                           return child;
                         }}
                       </Draggable>
                     ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Drop Zones */}
            <div>
              <Typography variant="h3" className="mb-4">
                Drop Zones
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                {dropZones.map((zone) => (
                  <Droppable key={zone.id} droppableId={zone.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                                                 className={`p-4 rounded-lg border-2 min-h-[200px] transition-all ${
                           snapshot.isDraggingOver 
                             ? theme === 'dark' ? 'border-purple-400 bg-purple-900/30 scale-105' : 'border-purple-400 bg-purple-100 scale-105'
                             : zone.color
                         }`}
                      >
                        <Typography variant="body-medium" className="font-semibold mb-3">
                          {zone.name}
                        </Typography>
                        
                                                 {zone.items.map((item, index) => (
                           <Draggable key={item.id} draggableId={item.id} index={index}>
                             {(provided, snapshot) => {
                               const child = (
                                 <div
                                   ref={provided.innerRef}
                                   {...provided.draggableProps}
                                   {...provided.dragHandleProps}
                                   className={`mb-2 p-3 rounded cursor-move transition-all ${
                                     snapshot.isDragging ? 'opacity-50 scale-95 rotate-2' : ''
                                   } ${item.color}`}
                                   style={{
                                     ...provided.draggableProps.style,
                                     userSelect: 'none',
                                   }}
                                 >
                                   <Typography variant="body-small" className="font-medium">
                                     {item.content}
                                   </Typography>
                                 </div>
                               );

                               // 🚀 Move dragging item to body to avoid weird positioning
                               if (snapshot.isDragging) {
                                 return <Portal>{child}</Portal>;
                               }
                               return child;
                             }}
                           </Draggable>
                         ))}
                        
                        {provided.placeholder}
                        
                                                 {zone.items.length === 0 && (
                           <div className={`flex items-center justify-center h-20 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                             <Typography variant="body-small">
                               Drop here
                             </Typography>
                           </div>
                         )}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </div>
        </DragDropContext>

                 {/* Instructions */}
         <div className={`mt-8 p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <Typography variant="h4" className="mb-4">
            How to Test:
          </Typography>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <Typography variant="body-medium">
                Drag colored boxes from the left area to any of the 4 colored zones
              </Typography>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <Typography variant="body-medium">
                Move boxes between different zones
              </Typography>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <Typography variant="body-medium">
                Drag boxes back to the original area
              </Typography>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <Typography variant="body-medium">
                Use the "Reset Test" button to start over
              </Typography>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

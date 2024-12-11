// TwoListDnD.tsx

import React from 'react';
import styled from '@emotion/styled';
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
} from '@hello-pangea/dnd';
import { Resource } from '@medplum/fhirtypes';

interface ListContainerProps {
  isDraggingOver?: boolean;
  height: string;
}

const ListContainer = styled.div<ListContainerProps>`
  background-color: ${(props) => (props.isDraggingOver ? '#d3d3d3' : 'white')};
  padding: 10px;
  height: ${(props) => props.height};
  border-radius: 8px;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
  flex: 1;
  overflow-y: auto;
`;

interface ItemProps {
  isDragging: boolean;
}

const Item = styled.div<ItemProps>`
  user-select: none;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: white;
  box-shadow: ${(props) => (props.isDragging ? '0 0 10px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0, 0, 0, 0.2)')};
  opacity: ${(props) => (props.isDragging ? 0.8 : 1)};
  transition:
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

// Initial items for List A

export const DragAndDropResources = ({
  resources,
  resourceListHeight,
  dropList,
  dropListHeight,
  setDropList,
  renderResource,
  children,
}: {
  resources: Resource[];
  resourceListHeight: string;
  dropList: Resource[];
  dropListHeight: string;
  setDropList: React.Dispatch<React.SetStateAction<Resource[]>>;
  renderResource: (resource: Resource, list: 'resources' | 'dropList') => JSX.Element | null;
  children: (resources: JSX.Element, dropList: JSX.Element) => JSX.Element;
}) => {
  // Handler for drag end
  const handleOnDragEnd = (result: DropResult): void => {
    const { source, destination, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // If dropped in the same place, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // If dragging from List A to List B, perform copy
    if (source.droppableId === 'resources' && destination.droppableId === 'dropList') {
      // Find the dragged item from List A
      const draggedItem = resources.find((item) => item.id === draggableId);
      if (draggedItem) {
        // Optional: Prevent duplicate items in List B
        // Uncomment the following lines if you want to prevent duplicates
        /*
        if (dropList.some((item) => item.text === draggedItem.text)) {
          return; // Prevent duplicate
        }
        */

        // Create a new item for List B with a unique id
        const newItem: Resource = {
          ...draggedItem,
          id: `${draggedItem.id}-${Date.now()}`, // Ensuring unique id
        };
        // Insert the new item into List B at the destination index
        const newListB = Array.from(dropList);
        newListB.splice(destination.index, 0, newItem);
        setDropList(newListB);
      }
    }
    // Handle reordering within List B
    else if (source.droppableId === 'dropList' && destination.droppableId === 'dropList') {
      const reorderedList = Array.from(dropList);
      const [movedItem] = reorderedList.splice(source.index, 1);
      reorderedList.splice(destination.index, 0, movedItem);
      setDropList(reorderedList);
    }
    // Optionally, handle dragging from List B back to List A or other scenarios
  };

  const dragableListA = (
    <Droppable droppableId="resources" isDropDisabled={true}>
      {(provided: DroppableProvided, snapshot) => (
        <ListContainer
          height={resourceListHeight}
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDraggingOver={snapshot.isDraggingOver}
        >
          {resources.map((item: Resource, index: number) => (
            <Draggable key={item.id} draggableId={item.id!} index={index}>
              {(provided: DraggableProvided, snapshot) => (
                <Item
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  isDragging={snapshot.isDragging}
                >
                  {renderResource(item, 'resources')}
                </Item>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </ListContainer>
      )}
    </Droppable>
  );

  const dragableListB = (
    <Droppable droppableId="dropList">
      {(provided: DroppableProvided, snapshot) => (
        <ListContainer
          height={dropListHeight}
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDraggingOver={snapshot.isDraggingOver}
        >
          {dropList.map((item: Resource, index: number) => (
            <Draggable key={item.id} draggableId={item.id!} index={index}>
              {(provided: DraggableProvided, snapshot) => (
                <Item
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  isDragging={snapshot.isDragging}
                >
                  {renderResource(item, 'dropList')}
                </Item>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </ListContainer>
      )}
    </Droppable>
  );

  return <DragDropContext onDragEnd={handleOnDragEnd}>{children(dragableListA, dragableListB)}</DragDropContext>;
};

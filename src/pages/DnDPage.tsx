import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { IconGripVertical } from '@tabler/icons-react';
import { Table } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import classes from './DnDPage.module.css';
import { Document, ResourceName, SearchControl, useMedplumNavigate, useMedplumProfile, } from '@medplum/react';

const data1 = [
  { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
  { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
  { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
  { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
  { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
];

const data2 = [
  { position: 6, mass: 12.011, symbol: 'C1', name: 'Carbon' },
  { position: 7, mass: 14.007, symbol: 'N1', name: 'Nitrogen' },
  { position: 39, mass: 88.906, symbol: 'Y1', name: 'Yttrium' },
  { position: 56, mass: 137.33, symbol: 'B1', name: 'Barium' },
  { position: 58, mass: 140.12, symbol: 'C1', name: 'Cerium' },
];

const DnDPage: React.FC = () => {
  const [state, handlers] = useListState(data1);

  const items1 = state.map((item, index) => (
    <Draggable key={item.symbol} index={index} draggableId={item.symbol}>
      {(provided) => (
        <Table.Tr className={classes.item} ref={provided.innerRef} {...provided.draggableProps}>
          <Table.Td>
            <div className={classes.dragHandle} {...provided.dragHandleProps}>
              <IconGripVertical size={18} stroke={1.5} />
            </div>
          </Table.Td>
          <Table.Td w={80}>{item.position}</Table.Td>
          <Table.Td w={120}>{item.name}</Table.Td>
          <Table.Td w={80}>{item.symbol}</Table.Td>
          <Table.Td>{item.mass}</Table.Td>
        </Table.Tr>
      )}
    </Draggable>
  ));

  const [state2, handlers2] = useListState(data2);

  const items2 = state2.map((item, index) => (
    <Draggable key={item.symbol} index={index} draggableId={item.symbol}>
      {(provided) => (
        <Table.Tr className={classes.item} ref={provided.innerRef} {...provided.draggableProps}>
          <Table.Td>
            <div className={classes.dragHandle} {...provided.dragHandleProps}>
              <IconGripVertical size={18} stroke={1.5} />
            </div>
          </Table.Td>
          <Table.Td w={80}>{item.position}</Table.Td>
          <Table.Td w={120}>{item.name}</Table.Td>
          <Table.Td w={80}>{item.symbol}</Table.Td>
          <Table.Td>{item.mass}</Table.Td>
        </Table.Tr>
      )}
    </Draggable>
  ));

  return (
    <Document>
    <Table.ScrollContainer minWidth={420}>
      <DragDropContext
        onDragEnd={({ destination, source }) =>
          handlers.reorder({ from: source.index, to: destination?.index || 0 })
        }
      >
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40} />
              <Table.Th w={80}>Position</Table.Th>
              <Table.Th w={120}>Name</Table.Th>
              <Table.Th w={40}>Symbol</Table.Th>
              <Table.Th>Mass</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Droppable droppableId="dnd-list" direction="vertical">
            {(provided) => (
              <Table.Tbody {...provided.droppableProps} ref={provided.innerRef}>
                {items1}
                {provided.placeholder}
              </Table.Tbody>
            )}
          </Droppable>
        </Table>
        </DragDropContext>

        <DragDropContext
          onDragEnd={({ destination, source }) =>
            handlers2.reorder({ from: source.index, to: destination?.index || 0 })
          }
        >
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40} />
              <Table.Th w={80}>Position</Table.Th>
              <Table.Th w={120}>Name</Table.Th>
              <Table.Th w={40}>Symbol</Table.Th>
              <Table.Th>Mass</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Droppable droppableId="dnd-list" direction="vertical">
            {(provided) => (
              <Table.Tbody {...provided.droppableProps} ref={provided.innerRef}>
                {items2}
                {provided.placeholder}
              </Table.Tbody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>
    </Table.ScrollContainer>
    </Document>
  );
};

export default DnDPage;
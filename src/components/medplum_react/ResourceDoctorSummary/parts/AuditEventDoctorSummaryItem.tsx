import { ScrollArea } from '@mantine/core';
import { AuditEvent } from '@medplum/fhirtypes';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';

export const AuditEventDoctorSummaryItem = (props: DoctorSummaryItemProps<AuditEvent>): JSX.Element => {
  return (
    <DoctorSummaryItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
      <ScrollArea>
        <pre>{props.resource.outcomeDesc}</pre>
      </ScrollArea>
    </DoctorSummaryItem>
  );
};

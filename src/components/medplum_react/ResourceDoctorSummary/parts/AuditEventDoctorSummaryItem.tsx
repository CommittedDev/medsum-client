import { ScrollArea } from '@mantine/core';
import { AuditEvent } from '@medplum/fhirtypes';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';
import { ResourceAiSummary } from './ResourceAiSummary';

export const AuditEventDoctorSummaryItem = (props: DoctorSummaryItemProps<AuditEvent>): JSX.Element => {
  const { ...restProps } = props;
  return (
    <DoctorSummaryItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
      <ScrollArea>
        <pre>{props.resource.outcomeDesc}</pre>
        {props.resource && props.patientId && (
          <ResourceAiSummary resource={props.resource} patientId={props.patientId!} />
        )}
      </ScrollArea>
    </DoctorSummaryItem>
  );
};

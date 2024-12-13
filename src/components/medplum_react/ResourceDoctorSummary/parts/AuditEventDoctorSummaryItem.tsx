import { ScrollArea } from '@mantine/core';
import { AuditEvent } from '@medplum/fhirtypes';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';
import { ResourceAiSummary, ShowType } from './ResourceAiSummary';
import { useState } from 'react';

export const AuditEventDoctorSummaryItem = (props: DoctorSummaryItemProps<AuditEvent>): JSX.Element => {
  const { ...restProps } = props;
  const [showType, setShowType] = useState<ShowType>('full');

  if (showType === 'onlySummary') {
    return (
      <ResourceAiSummary
        resource={props.resource}
        patientId={props.patientId!}
        setShowType={setShowType}
        showType={showType}
      />
    );
  }
  return (
    <DoctorSummaryItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
      <ScrollArea>
        <pre>{props.resource.outcomeDesc}</pre>
        {props.resource && props.patientId && (
          <ResourceAiSummary
            resource={props.resource}
            patientId={props.patientId!}
            setShowType={setShowType}
            showType={showType}
          />
        )}
      </ScrollArea>
    </DoctorSummaryItem>
  );
};

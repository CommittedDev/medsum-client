import { DiagnosticReport } from '@medplum/fhirtypes';
import { DiagnosticReportDisplay } from '../../DiagnosticReportDisplay/DiagnosticReportDisplay';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';
import { ResourceAiSummary } from './ResourceAiSummary';

export const DiagnosticReportDoctorSummaryItem = (props: DoctorSummaryItemProps<DiagnosticReport>): JSX.Element => {
  return (
    <DoctorSummaryItem
      resource={props.resource}
      padding={true}
      popupMenuItems={props.popupMenuItems}
      setShowType={props.setShowType}
      showType={props.showType}
    >
      <DiagnosticReportDisplay
        value={props.resource}
        patientId={props.patientId}
        showType={props.showType}
        setShowType={props.setShowType}
      />
      {/* <ResourceAiSummary is inside the DiagnosticReportDisplay component */}
    </DoctorSummaryItem>
  );
};

import { DiagnosticReport } from '@medplum/fhirtypes';
import { DiagnosticReportDisplay } from '../../DiagnosticReportDisplay/DiagnosticReportDisplay';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';

export const DiagnosticReportDoctorSummaryItem = (props: DoctorSummaryItemProps<DiagnosticReport>): JSX.Element => {
  return (
    <DoctorSummaryItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
      <DiagnosticReportDisplay value={props.resource} />
    </DoctorSummaryItem>
  );
};

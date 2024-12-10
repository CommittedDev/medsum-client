import { useParams } from 'react-router-dom';
import { PatientDoctorSummary } from './medplum_react';

/*
 * The PatientTimeline component displays relevant events related to the patient
 */
export function DoctorSummary(): JSX.Element {
  const { id } = useParams();
  return <PatientDoctorSummary patient={{ reference: `Patient/${id}` }} id={id || 'MISSING_ID'} />;
}

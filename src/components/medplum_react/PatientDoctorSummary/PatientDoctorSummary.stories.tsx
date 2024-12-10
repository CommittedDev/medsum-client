import { HomerSimpson } from '@medplum/mock';
import { Meta } from '@storybook/react';
import { PatientDoctorSummary } from './PatientDoctorSummary';

export default {
  title: 'Medplum/PatientDoctorSummary',
  component: PatientDoctorSummary,
} as Meta;

export const Patient = (): JSX.Element => <PatientDoctorSummary patient={HomerSimpson} />;

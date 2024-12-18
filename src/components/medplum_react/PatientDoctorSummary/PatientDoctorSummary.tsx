import { createReference, MedplumClient, ProfileResource } from '@medplum/core';
import { Attachment, Patient, Reference, ResourceType } from '@medplum/fhirtypes';
import { useCallback } from 'react';
import { ResourceDoctorSummary } from '../ResourceDoctorSummary/ResourceDoctorSummary';
import { ResourceDoctorSummaryProps } from '../ResourceDoctorSummary/ResourceDoctorSummary.types';

export interface PatientDoctorSummaryProps extends Pick<ResourceDoctorSummaryProps<Patient>, 'getMenu'> {
  readonly patient: Patient | Reference<Patient>;
  readonly id: string;
}

export function PatientDoctorSummary(props: PatientDoctorSummaryProps): JSX.Element {
  const { patient, id, ...rest } = props;

  const loadDoctorSummaryResources = useCallback((medplum: MedplumClient, resourceType: ResourceType, id: string) => {
    const ref = `${resourceType}/${id}`;
    const _count = 100;
    return Promise.allSettled([
      medplum.readHistory('Patient', id),
      medplum.search('Communication', { subject: ref, _count }),
      medplum.search('Device', { patient: ref, _count }),
      medplum.search('DeviceRequest', { patient: ref, _count }),
      medplum.search('DiagnosticReport', { subject: ref, _count }),
      medplum.search('Media', { subject: ref, _count }),
      medplum.search('ServiceRequest', { subject: ref, _count }),
      medplum.search('Task', { subject: ref, _count }),
    ]);
  }, []);

  return (
    <>
      <ResourceDoctorSummary
        patientId={id}
        value={patient}
        loadDoctorSummaryResources={loadDoctorSummaryResources}
        createCommunication={(resource: Patient, sender: ProfileResource, text: string) => ({
          resourceType: 'Communication',
          status: 'completed',
          subject: createReference(resource),
          sender: createReference(sender),
          sent: new Date().toISOString(),
          payload: [{ contentString: text }],
        })}
        createMedia={(resource: Patient, operator: ProfileResource, content: Attachment) => ({
          resourceType: 'Media',
          status: 'completed',
          subject: createReference(resource),
          operator: createReference(operator),
          issued: new Date().toISOString(),
          content,
        })}
        {...rest}
      />
    </>
  );
}

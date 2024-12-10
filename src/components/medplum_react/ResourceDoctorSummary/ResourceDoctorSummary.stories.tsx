import { createReference, MedplumClient, ProfileResource } from '@medplum/core';
import { Attachment, Bundle, Encounter, ResourceType } from '@medplum/fhirtypes';
import { HomerEncounter } from '@medplum/mock';
import { Meta } from '@storybook/react';
import { Document } from '../Document/Document';
import { ResourceDoctorSummary } from './ResourceDoctorSummary';

export default {
  title: 'Medplum/ResourceDoctorSummary',
  component: ResourceDoctorSummary,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ResourceDoctorSummary
      value={HomerEncounter}
      loadDoctorSummaryResources={(
        medplum: MedplumClient,
        resourceType: ResourceType,
        id: string
      ): Promise<PromiseSettledResult<Bundle>[]> => {
        return Promise.allSettled([
          medplum.readHistory(resourceType, id),
          medplum.search('Communication', 'encounter=' + resourceType + '/' + id),
          medplum.search('Media', 'encounter=' + resourceType + '/' + id),
        ]);
      }}
    />
  </Document>
);

export const WithComments = (): JSX.Element => (
  <Document>
    <ResourceDoctorSummary
      value={HomerEncounter}
      loadDoctorSummaryResources={(
        medplum: MedplumClient,
        resourceType: ResourceType,
        id: string
      ): Promise<PromiseSettledResult<Bundle>[]> => {
        return Promise.allSettled([
          medplum.readHistory(resourceType, id),
          medplum.search('Communication', 'encounter=' + resourceType + '/' + id),
          medplum.search('Media', 'encounter=' + resourceType + '/' + id),
        ]);
      }}
      createCommunication={(resource: Encounter, sender: ProfileResource, text: string) => ({
        resourceType: 'Communication',
        status: 'completed',
        encounter: createReference(resource),
        subject: (resource as Encounter).subject,
        sender: createReference(sender),
        payload: [{ contentString: text }],
      })}
      createMedia={(resource: Encounter, operator: ProfileResource, content: Attachment) => ({
        resourceType: 'Media',
        status: 'completed',
        encounter: createReference(resource),
        subject: (resource as Encounter).subject,
        operator: createReference(operator),
        content,
      })}
    />
  </Document>
);

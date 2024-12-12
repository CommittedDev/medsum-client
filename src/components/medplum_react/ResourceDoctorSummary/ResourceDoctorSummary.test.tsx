import { createReference, MedplumClient, ProfileResource } from '@medplum/core';
import { Attachment, Bundle, Encounter, Resource, ResourceType } from '@medplum/fhirtypes';
import { HomerEncounter, MockClient } from '@medplum/mock';
import { act, fireEvent, render, screen, waitFor } from '../test-utils/render';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { ResourceDoctorSummary } from './ResourceDoctorSummary';
import { ResourceDoctorSummaryProps } from './ResourceDoctorSummary.types';

const medplum = new MockClient();

async function loadDoctorSummaryResources(
  medplum: MedplumClient,
  resourceType: ResourceType,
  id: string
): Promise<PromiseSettledResult<Bundle>[]> {
  return Promise.allSettled([
    medplum.readHistory(resourceType, id),
    medplum.search('Communication', 'encounter=' + resourceType + '/' + id),
    medplum.search('Media', 'encounter=' + resourceType + '/' + id),
  ]);
}

describe('ResourceDoctorSummary', () => {
  async function setup<T extends Resource>(args: ResourceDoctorSummaryProps<T>): Promise<void> {
    await act(async () => {
      render(
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>
            <ResourceDoctorSummary {...args} />
          </MedplumProvider>
        </MemoryRouter>
      );
    });
  }

  test('Renders reference', async () => {
    await setup({
      patientId: 'reference-test',
      value: createReference(HomerEncounter),
      loadDoctorSummaryResources,
    });

    await waitFor(() => screen.getAllByTestId('doctorSummary-item'));

    const items = screen.getAllByTestId('doctorSummary-item');
    expect(items).toBeDefined();
  });

  test('Renders resource', async () => {
    await setup({
      patientId: 'resource-test',
      value: HomerEncounter,
      loadDoctorSummaryResources,
    });

    await waitFor(() => screen.getAllByTestId('doctorSummary-item'));

    const items = screen.getAllByTestId('doctorSummary-item');
    expect(items).toBeDefined();
  });

  test('Create comment', async () => {
    await setup({
      patientId: 'create-comment-test',
      value: HomerEncounter,
      loadDoctorSummaryResources,
      createCommunication: (resource: Encounter, sender: ProfileResource, text: string) => ({
        resourceType: 'Communication',
        status: 'completed',
        encounter: createReference(resource),
        subject: (resource as Encounter).subject,
        sender: createReference(sender),
        payload: [{ contentString: text }],
      }),
    });

    // Wait for initial load
    await waitFor(() => screen.getAllByTestId('doctorSummary-item'));

    // Enter the comment text
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Add comment'), {
        target: { value: 'Test comment' },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByTestId('doctorSummary-form'), {
        target: { text: 'Test comment' },
      });
    });

    // Wait for new comment
    await waitFor(() => screen.getAllByTestId('doctorSummary-item'));

    const items = screen.getAllByTestId('doctorSummary-item');
    expect(items).toBeDefined();
  });

  test('Upload media', async () => {
    await setup({
      patientId: 'upload-media-test',
      value: HomerEncounter,
      loadDoctorSummaryResources,
      createCommunication: jest.fn(),
      createMedia: (resource: Encounter, operator: ProfileResource, content: Attachment) => ({
        resourceType: 'Media',
        status: 'completed',
        encounter: createReference(resource),
        subject: (resource as Encounter).subject,
        operator: createReference(operator),
        content,
      }),
    });

    // Wait for initial load
    await waitFor(() => screen.getAllByTestId('doctorSummary-item'));

    // Upload the file
    await act(async () => {
      const files = [new File(['hello'], 'hello.txt', { type: 'text/plain' })];
      fireEvent.change(screen.getByTestId('upload-file-input'), {
        target: { files },
      });
    });

    // Wait for new comment
    await waitFor(() => screen.getAllByTestId('doctorSummary-item'));

    const items = screen.getAllByTestId('doctorSummary-item');
    expect(items).toBeDefined();
  });
});

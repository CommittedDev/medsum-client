import { ActionIcon, Center, Group, Loader, Menu, Modal, TextInput } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import { ProfileResource, createReference, getReferenceString, normalizeErrorString } from '@medplum/core';
import { Attachment, Bundle, OperationOutcome, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import { IconCheck, IconCloudUpload, IconEdit, IconFileAlert, IconMessage, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AttachmentButton } from '../AttachmentButton/AttachmentButton';
import { Form } from '../Form/Form';
import { Panel } from '../Panel/Panel';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { ResourceTable } from '../ResourceTable/ResourceTable';
import { DoctorSummaryItem } from '../DoctorSummary/DoctorSummary';
import { sortByDateAndPriority } from '../utils/date';
import { DragAndDropResources } from 'src/components/DragAndDropResources/DragAndDropResources';
import { usePersistStateGetInitialValue, usePersistStateOnValueChange } from '../utils/use_persist';
import { ResourceDoctorSummaryProps } from './ResourceDoctorSummary.types';
import { ResourceDoctorSummaryHelper } from './ResourceDoctorSummary.helpers';
import { AuditEventDoctorSummaryItem } from './parts/AuditEventDoctorSummaryItem';
import { CommunicationDoctorSummaryItem } from './parts/CommunicationDoctorSummaryItem';
import { DiagnosticReportDoctorSummaryItem } from './parts/DiagnosticReportDoctorSummaryItem';
import { MediaDoctorSummaryItem } from './parts/MediaDoctorSummaryItem';
import { HistoryDoctorSummaryItem } from './parts/HistoryDoctorSummaryItem';
import { ResourceTableInlineEditing } from '../ResourceTableInlineEditing/ResourceTableInlineEditing';
import { EditPage } from './parts/EditPage';

export function ResourceDoctorSummary<T extends Resource>(props: ResourceDoctorSummaryProps<T>): JSX.Element {
  const medplum = useMedplum();
  const sender = medplum.getProfile() as ProfileResource;
  const inputRef = useRef<HTMLInputElement>(null);
  const resource = useResource(props.value);
  const persistKey = `doctor-summary-${props.id}`;
  const [editingResource, setEditingResource] = useState<{
    resourceType: ResourceType;
    id: string;
    item: Resource;
  } | null>(null);
  const initialValue = usePersistStateGetInitialValue<Resource[]>({ key: persistKey, currentValue: [] });
  const [history, setHistory] = useState<Bundle>();
  const [selectedItems, setSelectedItemsItems] = useState<Resource[]>(initialValue);
  usePersistStateOnValueChange({
    key: persistKey,
    updateValue: selectedItems,
  });
  const [items, setItems] = useState<Resource[]>([]);
  const loadDoctorSummaryResources = props.loadDoctorSummaryResources;

  const itemsRef = useRef<Resource[]>(items);
  itemsRef.current = items;

  /**
   * Sorts and sets the items.
   *
   * Sorting is primarily a function of meta.lastUpdated, but there are special cases.
   * When displaying connected resources, for example a Communication in the context of an Encounter,
   * the Communication.sent time is used rather than Communication.meta.lastUpdated.
   *
   * Other examples of special cases:
   * - DiagnosticReport.issued
   * - Media.issued
   * - Observation.issued
   * - DocumentReference.date
   *
   * See "sortByDateAndPriority()" for more details.
   */
  const sortAndSetItems = useCallback(
    (newItems: Resource[]): void => {
      sortByDateAndPriority(newItems, resource);
      newItems.reverse();
      setItems(newItems);
    },
    [resource]
  );

  /**
   * Handles a batch request response.
   * @param batchResponse - The batch response.
   */
  const handleBatchResponse = useCallback(
    (batchResponse: PromiseSettledResult<Bundle>[]): void => {
      const newItems = [];

      for (const settledResult of batchResponse) {
        if (settledResult.status !== 'fulfilled') {
          // User may not have access to all resource types
          continue;
        }

        const bundle = settledResult.value;
        if (bundle.type === 'history') {
          setHistory(bundle);
        }

        if (bundle.entry) {
          for (const entry of bundle.entry) {
            newItems.push(entry.resource as Resource);
          }
        }
      }

      sortAndSetItems(newItems);
    },
    [sortAndSetItems]
  );

  /**
   * Adds an array of resources to the timeline.
   * @param resource - Resource to add.
   */
  const addResource = useCallback(
    (resource: Resource): void => sortAndSetItems([...itemsRef.current, resource]),
    [sortAndSetItems]
  );

  /**
   * Loads the timeline.
   */
  const loadDoctorSummary = useCallback(() => {
    let resourceType: ResourceType;
    let id: string;
    if ('resourceType' in props.value) {
      resourceType = props.value.resourceType;
      id = props.value.id as string;
    } else {
      [resourceType, id] = props.value.reference?.split('/') as [ResourceType, string];
    }
    loadDoctorSummaryResources(medplum, resourceType, id).then(handleBatchResponse).catch(console.error);
  }, [medplum, props.value, loadDoctorSummaryResources, handleBatchResponse]);

  useEffect(() => loadDoctorSummary(), [loadDoctorSummary]);

  /**
   * Adds a Communication resource to the timeline.
   * @param contentString - The comment content.
   */
  function createComment(contentString: string): void {
    if (!resource || !props.createCommunication) {
      // Encounter not loaded yet
      return;
    }
    medplum
      .createResource(props.createCommunication(resource, sender, contentString))
      .then((result) => addResource(result))
      .catch(console.error);
  }

  /**
   * Adds a Media resource to the timeline.
   * @param attachment - The media attachment.
   */
  function createMedia(attachment: Attachment): void {
    if (!resource || !props.createMedia) {
      // Encounter not loaded yet
      return;
    }
    medplum
      .createResource(props.createMedia(resource, sender, attachment))
      .then((result) => addResource(result))
      .then(() =>
        updateNotification({
          id: 'upload-notification',
          color: 'teal',
          title: 'Upload complete',
          message: '',
          icon: <IconCheck size={16} />,
          autoClose: 2000,
        })
      )
      .catch((reason) =>
        updateNotification({
          id: 'upload-notification',
          color: 'red',
          title: 'Upload error',
          message: normalizeErrorString(reason),
          icon: <IconFileAlert size={16} />,
          autoClose: 2000,
        })
      );
  }

  function onUploadStart(): void {
    showNotification({
      id: 'upload-notification',
      loading: true,
      title: 'Initializing upload...',
      message: 'Please wait...',
      autoClose: false,
      withCloseButton: false,
    });
  }

  function onUploadProgress(e: ProgressEvent): void {
    updateNotification({
      id: 'upload-notification',
      loading: true,
      title: 'Uploading...',
      message: ResourceDoctorSummaryHelper.getProgressMessage(e),
      autoClose: false,
      withCloseButton: false,
    });
  }

  function onUploadError(outcome: OperationOutcome): void {
    updateNotification({
      id: 'upload-notification',
      color: 'red',
      title: 'Upload error',
      message: normalizeErrorString(outcome),
      icon: <IconFileAlert size={16} />,
      autoClose: 2000,
    });
  }

  useEffect(() => {}, [selectedItems]);

  if (!resource) {
    return (
      <Center style={{ width: '100%', height: '100%' }}>
        <Loader />
      </Center>
    );
  }

  const renderItem = (item: Resource, list: 'resources' | 'dropList') => {
    if (!item) {
      // TODO: Handle null history items for deleted versions.
      return null;
    }
    const key = `${item.resourceType}/${item.id}/${item.meta?.versionId}`;
    const menu = props.getMenu ? (
      props.getMenu({
        primaryResource: resource,
        currentResource: item,
        reloadDoctorSummary: loadDoctorSummary,
      })
    ) : list == 'dropList' && item.id ? (
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconEdit size={14} />}
          onClick={() => setEditingResource({ resourceType: item.resourceType, id: item.id!, item: item })}
          aria-label={`Edit ${getReferenceString(item)}`}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          leftSection={<IconX size={14} />}
          onClick={() => {
            setSelectedItemsItems((prev) => prev.filter((e) => e.id !== item.id));
            setEditingResource(null);
          }}
          aria-label={`Delete ${getReferenceString(item)}`}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    ) : undefined;
    if (item.resourceType === resource.resourceType && item.id === resource.id) {
      return <HistoryDoctorSummaryItem key={key} history={history as Bundle} resource={item} popupMenuItems={menu} />;
    }
    switch (item.resourceType) {
      case 'AuditEvent':
        return <AuditEventDoctorSummaryItem key={key} resource={item} popupMenuItems={menu} />;
      case 'Communication':
        return <CommunicationDoctorSummaryItem key={key} resource={item} popupMenuItems={menu} />;
      case 'DiagnosticReport':
        return <DiagnosticReportDoctorSummaryItem key={key} resource={item} popupMenuItems={menu} />;
      case 'Media':
        return <MediaDoctorSummaryItem key={key} resource={item} popupMenuItems={menu} />;
      default:
        return (
          <DoctorSummaryItem key={key} resource={item} padding={true} popupMenuItems={menu}>
            {list == 'dropList' ? (
              <ResourceTableInlineEditing value={item} ignoreMissingValues={true} />
            ) : (
              <ResourceTable value={item} ignoreMissingValues={true} />
            )}
          </DoctorSummaryItem>
        );
    }
  };

  const renderResourcesHeader = () => {
    return (
      <>
        {props.createCommunication && (
          <div className="py-4">
            <Form
              testid="doctorSummary-form"
              onSubmit={(formData: Record<string, string>) => {
                createComment(formData.text);

                const input = inputRef.current;
                if (input) {
                  input.value = '';
                  input.focus();
                }
              }}
            >
              <Group gap="xs" wrap="nowrap" style={{ width: '100%' }}>
                <ResourceAvatar value={sender} />
                <TextInput
                  name="text"
                  ref={inputRef}
                  placeholder="Add comment"
                  style={{ width: '100%', maxWidth: 300 }}
                />
                <ActionIcon type="submit" radius="xl" color="blue" variant="filled">
                  <IconMessage size={16} />
                </ActionIcon>
                <AttachmentButton
                  securityContext={createReference(resource)}
                  onUpload={createMedia}
                  onUploadStart={onUploadStart}
                  onUploadProgress={onUploadProgress}
                  onUploadError={onUploadError}
                >
                  {(props) => (
                    <ActionIcon {...props} radius="xl" color="blue" variant="filled">
                      <IconCloudUpload size={16} />
                    </ActionIcon>
                  )}
                </AttachmentButton>
              </Group>
            </Form>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <DragAndDropResources
        resources={items}
        resourceListHeight={'calc(100vh - 200px)'}
        dropListHeight={'calc(100vh - 200px)'}
        dropList={selectedItems}
        setDropList={setSelectedItemsItems}
        renderResource={(resource: Resource, list: 'resources' | 'dropList') => {
          return (
            <div>
              {resource?.resourceType}
              {renderItem(resource, list)}
            </div>
          );
        }}
      >
        {(resources, dropList) => {
          return (
            <div className="flex flex-row gap-2">
              <div className="flex-1 w-1/2">
                <h3>Doctor Summary</h3>
                {dropList}
              </div>
              <div className="flex-1 w-1/2">
                <h3>Resources</h3>
                {renderResourcesHeader()}
                {resources}
              </div>
            </div>
          );
        }}
      </DragAndDropResources>
      <Modal
        opened={!!editingResource}
        onClose={() => setEditingResource(null)}
        title={editingResource ? `Edit ${getReferenceString(editingResource!.item)}` : ''}
        size="lg"
      >
        {editingResource && (
          <EditPage
            id={editingResource.id}
            resourceType={editingResource.resourceType}
            value={editingResource.item}
            onSave={(updatedValue) => {
              setSelectedItemsItems((prev) => prev.map((item) => (item.id === updatedValue.id ? updatedValue : item)));
              setEditingResource(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

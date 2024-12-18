import { ActionIcon, Center, Group, Loader, LoadingOverlay, Modal, TextInput } from '@mantine/core';
import { notifications, showNotification, updateNotification } from '@mantine/notifications';
import { ProfileResource, createReference, getReferenceString, normalizeErrorString } from '@medplum/core';
import { Attachment, Bundle, OperationOutcome, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import {
  IconArrowLeft,
  IconCheck,
  IconCloudUpload,
  IconEye,
  IconFileAlert,
  IconMessage,
  IconPencil,
  IconPrinter,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ResourceTable } from '../ResourceTable/ResourceTable';
import { DoctorSummaryItem } from '../DoctorSummary/DoctorSummary';
import { sortByDateAndPriority } from '../utils/date';
import { DragAndDropResources } from 'src/components/DragAndDropResources/DragAndDropResources';
import { readPersistStateGetInitialValue, usePersistStateOnValueChange } from '../utils/use_persist';
import { ResourceDoctorSummaryProps } from './ResourceDoctorSummary.types';
import { ResourceDoctorSummaryHelper } from './ResourceDoctorSummary.helpers';
import { AuditEventDoctorSummaryItem } from './parts/AuditEventDoctorSummaryItem';
import { CommunicationDoctorSummaryItem } from './parts/CommunicationDoctorSummaryItem';
import { DiagnosticReportDoctorSummaryItem } from './parts/DiagnosticReportDoctorSummaryItem';
import { MediaDoctorSummaryItem } from './parts/MediaDoctorSummaryItem';
import { HistoryDoctorSummaryItem } from './parts/HistoryDoctorSummaryItem';
import { EditPage } from './parts/EditPage';
import { useReactToPrint } from 'react-to-print';
import { DateUtils } from './date.utils';
import { DoctorSummaryTemplates, IResourceTemplateItem, ITemplate } from './parts/DoctorSummaryTemplates';
import { randomId } from '@mantine/hooks';
import { getDoctorSummaryPersistKey } from './parts/utils';
import { ShowType } from './parts/ResourceAiSummary';
import { ResourcesAiSummary } from './parts/ResourcesAiSummary';
import { Form } from '../Form/Form';
import { Panel } from '../Panel/Panel';
import { AttachmentButton } from '../AttachmentButton/AttachmentButton';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';

export function ResourceDoctorSummary<T extends Resource>(props: ResourceDoctorSummaryProps<T>): JSX.Element {
  const [resetCounter, setResetCounter] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const medplum = useMedplum();
  const [isReady, setIsReady] = useState(false);
  const printTargetRef = useRef<HTMLDivElement>();
  const reactToPrintFn = useReactToPrint({ contentRef: printTargetRef as any });
  const [printPdf, setPrintPdf] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate>();
  const sender = medplum.getProfile() as ProfileResource;
  const inputRef = useRef<HTMLInputElement>(null);
  const resource = useResource(props.value);
  const persistKey = getDoctorSummaryPersistKey(props.patientId, selectedTemplate?.id || '');
  const [editingResource, setEditingResource] = useState<{
    resourceType: ResourceType;
    id: string;
    item: Resource;
  } | null>(null);
  const initialValue = readPersistStateGetInitialValue<Resource[]>({ key: persistKey, currentValue: [] });
  const [history, setHistory] = useState<Bundle>();
  const [selectedItems, setSelectedItems] = useState<Resource[]>(initialValue);
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
      const uniqueItems = newItems.filter((item, index, self) => {
        return self.findIndex((t) => t.id === item.id) === index;
      });
      setItems(uniqueItems);
      console.log({ newItems });
      setIsReady(true);
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

  const renderItem = (item: Resource, list: 'resources' | 'dropList' | 'viewMode') => {
    // if (list == 'dropList') {
    //   if (item.resourceType == 'Media') {
    //     return item.content.url ? (
    //       <ResourceAiMediaSummary
    //         resource={item}
    //         patientId={props.patientId!}
    //         setShowType={() => {}}
    //         showType={'onlySummary'}
    //         url={item.content.url}
    //       />
    //     ) : null;
    //   }
    //   return (
    //     <ResourceAiSummary
    //       resource={item}
    //       patientId={props.patientId!}
    //       setShowType={() => {}}
    //       showType={'onlySummary'}
    //     />
    //   );
    // }
    return (
      <Item
        {...props}
        key={item.id}
        resource={resource}
        item={item}
        list={'resources'}
        history={history as any}
        patientId={props.patientId}
      />
    );
  };

  const onPrint = () => {
    setPrintPdf(true);
  };

  const getTemplateInitialValue = (template: ITemplate) => {
    const counterPerItemsType: { [resourceType: string]: number } = {};
    const initialSelectedItems: Resource[] = [];
    template.template.items.forEach((item) => {
      if (item.type == 'resource') {
        const templateItem = item as IResourceTemplateItem;
        counterPerItemsType[templateItem.resourceType] = counterPerItemsType[templateItem.resourceType] || 0;
        if (counterPerItemsType[templateItem.resourceType] < templateItem.count) {
          const resourceToAdd = items.find((resource) => resource.resourceType == templateItem.resourceType);
          if (resourceToAdd) {
            initialSelectedItems.push(resourceToAdd);
            counterPerItemsType[templateItem.resourceType]++;
          }
        }
      }
    });
    return initialSelectedItems;
  };

  const resetChanges = (template: ITemplate) => {
    setEditingResource(null);
    const initialSelectedItems = getTemplateInitialValue(template);
    setSelectedItems(initialSelectedItems);
    setSelectedTemplate(template);
    setResetCounter((prev) => prev + 1);
  };

  const onTemplateChange = (template: ITemplate) => {
    setEditingResource(null);
    const persistKey = getDoctorSummaryPersistKey(props.patientId, template.id);
    const persistValue = readPersistStateGetInitialValue({ key: persistKey, currentValue: [] });
    if (persistValue && persistValue.length > 0) {
      setSelectedItems(persistValue);
      setSelectedTemplate(template);
    } else {
      const initialSelectedItems = getTemplateInitialValue(template);
      setSelectedItems(initialSelectedItems);
      setSelectedTemplate(template);
    }
  };

  useLayoutEffect(() => {
    if (printPdf) {
      setTimeout(() => {
        reactToPrintFn();
        setTimeout(() => {
          setPrintPdf(false);
        }, 500);
      }, 500);
    }
  }, [printPdf]);

  if (!isReady) {
    return <LoadingOverlay visible={true} />;
  }

  const itemWidth = printPdf ? '200mm' : 'calc(50vw - 120px)';
  return (
    <>
      <div className="flex flex-col w-full hiddenTheChild">
        <DragAndDropResources
          resources={items}
          resourceListHeight={'calc(100vh - 155px)'} // DORON
          dropListHeight={'auto'}
          dropList={selectedItems}
          itemWidth={printPdf ? '200mm' : 'calc(50vw - 120px)'}
          setDropList={setSelectedItems}
          renderResource={(resource: Resource, list: 'resources' | 'dropList', isDragging) => {
            return (
              <div
                className={`overflow-hidden flex-1 border border-[#EDEDED] rounded-md p-2 flex mb-4 ResourceDoctorSummary-${list} `}
              >
                <div className="flex flex-row gap-2 ps-4 relative flex-1  ">
                  <div className={`w-[2px] ${getResourceClassNames(resource)} absolute top-0 bottom-0 start-0`} />
                  {/* <p>DEBUG: {resource.resourceType}</p> */}
                  <div
                    style={{
                      maxWidth: printPdf ? '200mm' : 'calc(50vw - 140px)',
                      width: printPdf ? '200mm' : 'calc(50vw - 140px)',
                    }}
                    className={`flex-1 flex-col gap-2 overflow-hidden`}
                  >
                    {renderItem(resource, list)}
                  </div>
                  {list == 'resources' && !isDragging && (
                    <div className="absolute end-6 top-2">
                      <ActionIcon
                        radius={'xl'}
                        onClick={() => {
                          setSelectedItems((prev) => [
                            {
                              ...resource,
                              id: `${resource.id}-${randomId()}`, // Ensuring unique id
                            },
                            ...prev,
                          ]);
                        }}
                      >
                        <IconArrowLeft />
                      </ActionIcon>
                    </div>
                  )}
                  {list == 'dropList' && !printPdf && !isDragging && (
                    <div className="absolute end-6 top-2">
                      <ActionIcon
                        color="#EEEEEE"
                        radius={'xl'}
                        className="p-1"
                        onClick={() => {
                          setSelectedItems((prev) => prev.filter((e) => e.id !== resource.id));
                          setEditingResource(null);
                        }}
                        aria-label={`Delete ${getReferenceString(resource)}`}
                      >
                        <IconTrash color="#AEAEAE" />
                      </ActionIcon>
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        >
          {(resources, dropList) => {
            return (
              <div className="w-[calc(100vw-100px)] flex flex-row gap-4">
                {/*
                  ---------------------------------------------------------------
                  | >מידע רפואי
                  --------------------------------------------------------------
                */}
                <div className="w-[50%] flex flex-col gap-2 rounded-md ">
                  <div className="flex flex-row justify-between items-center h-8">
                    <p>מידע רפואי</p>
                  </div>
                  <div className="w-full bg-white p-2 rounded-md">
                    {props.createCommunication && (
                      <div className='ps-2 pe-10'>
                        <Form
                        testid="timeline-form"
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
                    {resources}
                  </div>
                </div>
                {/*
                  ---------------------------------------------------------------
                  | >מכתב שחרור
                  --------------------------------------------------------------
                */}
                <div className="flex-1 flex flex-col gap-2 rounded-md" dir='rtl'>
                  <div className="flex flex-row justify-between items-center h-8">
                    <div className="flex flex-row gap-2 items-center"  dir='rtl'>
                      <p>מכתב שחרור</p>
                      <DoctorSummaryTemplates patientId={props.patientId} onTemplateChange={onTemplateChange} />
                    </div>
                    <div className="flex flex-row gap-2">
                      {selectedTemplate && !editMode && (
                        <ActionIcon variant="transparent" onClick={() => resetChanges(selectedTemplate)}>
                          <IconRefresh />
                        </ActionIcon>
                      )}
                      {!editMode && (
                        <ActionIcon variant="transparent" onClick={onPrint}>
                          <IconPrinter />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        onClick={() => {
                          setEditMode(!editMode);
                        }}
                      >
                        {editMode ? <IconEye /> : <IconPencil />}
                      </ActionIcon>
                    </div>
                  </div>
                  <div
                    ref={printTargetRef as any}
                    className={
                      printPdf
                        ? 'flex-1 w-full bg-white p-6 rounded-md'
                        : 'flex-1 w-full bg-white p-6 rounded-md overflow-y-auto max-h-[calc(100vh-138px)]'
                    }
                  >
                    {selectedTemplate ? (
                      <div className="flex flex-col gap-2 pt-4"  dir='rtl'>
                        <div className="flex flex-row justify-between items-center">
                          <img src={selectedTemplate.template.image} alt="logo" className="h-10" />
                          <p className="text-[21px]">{selectedTemplate.template.title}</p>
                          <p className="text-[14px] text-[#888888]">{DateUtils.formatDate(new Date())}</p>
                        </div>
                        {editMode ? (
                          dropList
                        ) : (
                          <ResourcesAiSummary
                            key={selectedItems.map((item, index) => item.id || index).join('ss') + selectedItems.length}
                            patientId={props.patientId!}
                            resources={selectedItems}
                            persistKeySuffix={resetCounter.toString()}
                          />
                        )}
                      </div>
                    ) : (
                      <p>בחר תבנית</p>
                    )}
                  </div>
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
                setSelectedItems((prev) => prev.map((item) => (item.id === updatedValue.id ? updatedValue : item)));
                setEditingResource(null);
              }}
            />
          )}
        </Modal>
      </div>
      <LoadingOverlay visible={printPdf} overlayProps={{ blur: 10 }} />
    </>
  );
}

const getResourceClassNames = (resource: Resource) => {
  const blueGradientResources: ResourceType[] = [
    'Observation',
    'MedicationRequest',
    'MedicationStatement',
    'Condition',
    'AllergyIntolerance',
    'Immunization',
    'Procedure',
    'DiagnosticReport',
  ];
  const yellowGradientResources: ResourceType[] = [
    'Patient',
    'Practitioner',
    'Organization',
    'Location',
    'PractitionerRole',
    'CareTeam',
    'RelatedPerson',
    'Device',
    'Specimen',
  ];
  const orangeGradientResources: ResourceType[] = [
    'ImagingStudy',
    'DocumentReference',
    'QuestionnaireResponse',
    'Questionnaire',
    'CarePlan',
    'CareTeam',
    'Medication',
    'MedicationAdministration',
    'MedicationDispense',
    'MedicationStatement',
    'Immunization',
    'Procedure',
    'DiagnosticReport',
    'Observation',
    'Condition',
    'AllergyIntolerance',
    'DocumentReference',
    'QuestionnaireResponse',
    'Questionnaire',
    'CarePlan',
    'CareTeam',
    'Medication',
    'MedicationAdministration',
    'MedicationDispense',
    'MedicationStatement',
    'Immunization',
    'Procedure',
    'DiagnosticReport',
    'Observation',
    'Condition',
    'AllergyIntolerance',
  ];
  if (blueGradientResources.includes(resource.resourceType)) {
    return 'blue-gradient';
  } else if (yellowGradientResources.includes(resource.resourceType)) {
    return 'yellow-gradient';
  } else if (orangeGradientResources.includes(resource.resourceType)) {
    return 'orange-gradient';
  }
  return 'green-gradient';
};

interface IItemProps {
  resource: Resource;
  item: Resource;
  list: 'resources' | 'dropList' | 'viewMode';
  history: Bundle | undefined;
  patientId: string;
}
const Item = (props: IItemProps) => {
  const [_showType, _setShowType] = useState<ShowType>(props.list == 'dropList' ? 'onlySummary' : 'onlySummary');

  const showType = props.list == 'dropList' ? _showType : 'full';
  const setShowType = (showType: ShowType) => {
    if (props.list == 'dropList') {
      _setShowType(showType);
    }
  };

  const { item, list, resource, history } = props;
  if (!item) {
    // TODO: Handle null history items for deleted versions.
    return null;
  }
  const key = `${item.resourceType}/${item.id}/${item.meta?.versionId}`;
  const menu = undefined;
  if (item.resourceType === resource.resourceType && item.id === resource.id) {
    return (
      <HistoryDoctorSummaryItem
        key={key}
        history={history as Bundle}
        resource={item}
        popupMenuItems={menu}
        patientId={props.patientId}
        showType={showType}
        setShowType={setShowType}
      />
    );
  }
  // return <p>{`${item.resourceType}`}</p>;
  switch (item.resourceType) {
    case 'AuditEvent':
      return (
        <AuditEventDoctorSummaryItem
          key={key}
          resource={item}
          popupMenuItems={menu}
          patientId={props.patientId}
          showType={showType}
          setShowType={setShowType}
        />
      );
    case 'Communication':
      return (
        <CommunicationDoctorSummaryItem
          key={key}
          resource={item}
          popupMenuItems={menu}
          patientId={props.patientId}
          showType={showType}
          setShowType={setShowType}
        />
      );
    case 'DiagnosticReport':
      return (
        <>
          {/* {props.patientId ? 'props.patientId' + props.patientId : 'MISSINGT props.patientId '} */}
          <DiagnosticReportDoctorSummaryItem
            key={key}
            resource={item}
            popupMenuItems={menu}
            patientId={props.patientId}
            showType={showType}
            setShowType={setShowType}
          />
        </>
      );
    case 'Media':
      return (
        <MediaDoctorSummaryItem
          key={key}
          resource={item}
          popupMenuItems={menu}
          patientId={props.patientId}
          showType={showType}
          setShowType={setShowType}
        />
      );
    default:
      return (
        <DoctorSummaryItem
          key={key}
          resource={item}
          padding={true}
          popupMenuItems={menu}
          patientId={props.patientId}
          showType={showType}
          setShowType={setShowType}
        >
          <ResourceTable
            value={item}
            ignoreMissingValues={true}
            patientId={props.patientId}
            showType={showType}
            setShowType={setShowType}
          />
        </DoctorSummaryItem>
      );
  }
};

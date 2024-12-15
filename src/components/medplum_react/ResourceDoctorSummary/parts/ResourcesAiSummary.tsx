import { Button, Loader, Text, Textarea, Tooltip } from '@mantine/core';
import { Editor, EditorState } from 'draft-js';
import { useEffect, useRef, useState } from 'react';
import { readPersistStateGetInitialValue, usePersistStateOnValueChange } from '../../utils/use_persist';
import { useClickOutside } from '@mantine/hooks';
import { getDoctorSummaryPersistKey } from './utils';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
import { isReference, MedplumClient } from '@medplum/core';
import { useMedplum } from '@medplum/react-hooks';
import { MyEditor } from '../RichText';
import { Media, Resource } from '@medplum/fhirtypes';

const FILE_SERVER_URL = 'http://192.168.1.28:5000/upload';
const FILE_2_TEXT_RESPONSE_TO_SUBJECT_SERVER_URL =
  'http://192.168.1.28:3000/api/v1/prediction/24c53c52-49e9-4e4b-93ba-4a2367392643';
const FILE_2_TEXT_RESPONSE_TO_SUMMARY_SERVER_URL =
  'http://192.168.1.28:3000/api/v1/prediction/516bd946-a74a-4df1-93cf-b0e41bda2122';
const AI_SERVER_URL = 'http://192.168.1.28:3000/api/v1/prediction/1a4536da-f42f-4ecf-9939-65d53a5e5cd0';
interface IResourceAiSummary {
  value: string;
}

export type ShowType = 'onlySummary' | 'full';

export const ResourcesAiSummary = ({
  patientId,
  resources,
  persistKeySuffix,
}: {
  patientId: string;
  resources: { [key: string]: any }[];
  persistKeySuffix?: string;
}) => {
  const [dataCounter, setDataCounter] = useState(0);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [allData, setAllData] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const ref = useClickOutside(() => setEditing(false));
  const medplum = useMedplum();
  const resourcesIds = resources
    .map((resource, index) => {
      return resource.id || index.toString();
    })
    .join('');
  const persistKey = `${getDoctorSummaryPersistKey(patientId, '')}-s-${resourcesIds}-${persistKeySuffix || ''}`;
  const lastPersistKey = useRef(persistKey);
  const initialValue = readPersistStateGetInitialValue<IResourceAiSummary>({
    key: persistKey,
    currentValue: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<string | undefined>(initialValue);

  usePersistStateOnValueChange({
    key: persistKey,
    updateValue: summary,
  });

  const fetchData = () => {
    async function query() {
      const fullData = await Promise.all(
        resources.map(async (resource) => {
          let cloneResource = JSON.parse(JSON.stringify(resource));
          if ((cloneResource as Resource).resourceType == 'Media') {
            const isValidFile =
              ((cloneResource as Media).content &&
                (cloneResource as Media).content.url &&
                (cloneResource as Media).content?.contentType?.startsWith('image/')) ||
              (cloneResource as Media).content?.contentType == 'application/pdf';

            if (isValidFile) {
              const value = await getOCR(
                (cloneResource as Media).content.url!,
                (cloneResource as Media).content?.contentType!
              );
              if (value && value.Image_2_Text) {
                // Execute both requests in parallel
                const [subjectFromImage, summaryFromImage] = await Promise.all([
                  getSubjectFromImage2Text(value.Image_2_Text),
                  getSummaryFromImage2Text(value.Image_2_Text),
                ]);
                cloneResource = {
                  info: `This data is based on ${(cloneResource as Media).content?.contentType}`,
                  imageToText: value.Image_2_Text,
                  imageSubject: subjectFromImage?.text,
                  imageSummary: summaryFromImage?.text,
                };
              }
            }
          }
          const allKeys = Object.keys(cloneResource);
          const updatedEntries = await Promise.all(
            allKeys.map(async (key) => {
              const updatedValue = await readReferences(medplum, cloneResource[key]);
              return [key, updatedValue];
            })
          );
          // Reconstruct cloneResource with updated keys
          cloneResource = Object.fromEntries(updatedEntries);
          return cloneResource;
        })
      );

      if (fullData.length == 0) {
        return { text: 'נא להוסיף פרטי מטופל' };
      }
      const response = await fetch(
        // AI_URL
        AI_SERVER_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: JSON.stringify(fullData),
          }),
        }
      );
      const result = await response.json();
      setAllData(fullData);
      return result;
    }

    setLoading(true);

    query()
      .then((response) => {
        const isValid = response.text && response.text.length > 0;
        console.log('Fetch ResourceWithAiSummary', response);
        if (isValid) {
          setSummary(response.text);
        } else {
          setSummary('הגיע שגיאה מהשרת ai');
        }
      })
      .catch((e) => {
        console.log('Fetch ResourceWithAiSummary', e);
        setSummary('הגיע שגיאה מהשרת ai');
      })
      .finally(() => {
        setLoading(false);
        setDataCounter((prev) => prev + 1);
      });
  };

  const renderValue = () => {
    if (!summary) {
      return null;
    }
    return (
      <Tooltip label="לחץ כפול לעריכת המסמך" opened={(editing || resources.length == 0) ? false : undefined}>
        <div
          ref={ref}
          dir="rtl"
          onDoubleClick={
            editing
              ? undefined
              : () => {
                  setEditing(true);
                }
          }
          className="text-start flex justify-start items-start w-full flex-1 p-2"
        >
          <MyEditor
            key={dataCounter.toString()}
            initialValue={summary}
            onChanged={(val) => {
              setSummary(val);
            }}
            editMode={editing}
          />
        </div>
      </Tooltip>
    );
  };

  useEffect(() => {
    if (!initialValue || lastPersistKey.current != persistKey) {
      lastPersistKey.current = persistKey;
      fetchData();
    }
  }, [persistKey]);

  return (
    <div className="ResourceAiSummary min-h-[400px] mt-6" dir="rtl">
      {loading && (
        <div className="flex flex-1 flex-col gap-4 items-center pt-12 justify-center">
          <p className="text-xl">מסכם מידע רפואי</p>
          <Loader />
        </div>
      )}
      {summary && renderValue()}
      {/* <Editor editorState={editorState} onChange={setEditorState} /> */}
      {/* {JSON.stringify(allData)} */}
      {/* <GptAi patientId={patientId} resource={resource} persistKeySuffix={persistKeySuffix} /> */}
    </div>
  );
};

const readReferences = async (medplum: MedplumClient, value: any) => {
  try {
    if (!value) return value;
    if (Array.isArray(value)) {
      const valuesFromServer = await Promise.all(
        value.map(async (v) => {
          if (isReference(v)) {
            const response = await medplum.readReference(v);
            return {
              ...v,
              reference: response,
            };
          }
          return v;
        })
      );
      return valuesFromServer;
    } else if (typeof value === 'object' && value !== null) {
      const entries: any = await Promise.all(
        Object.entries(value).map(async ([key, val]) => {
          const updatedVal = await readReferences(medplum, val);
          return [key, updatedVal];
        })
      );
      return Object.fromEntries(entries);
    } else if (isReference(value)) {
      const response = await medplum.readReference(value);
      return {
        ...value,
        reference: response,
      };
    }

    return value;
  } catch (error) {
    return value;
  }
};

const getOCR = async (fileUrl: string, contentType: string) => {
  try {
    // Step 1: Fetch the file
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Content-Type': contentType,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob(); // Convert to Blob
    // Step 2: Create a local file (in the browser, this will trigger a download)
    const file = new File([blob], 'downloaded-file', { type: blob.type });

    // Step 3: Prepare FormData for uploading the file
    const formData = new FormData();
    formData.append('file', file); // Attach the file to the FormData object

    // Step 4: Make POST request to upload the file
    const res = await fetch(FILE_SERVER_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json(); // Parse response as JSON
    console.log('File uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

const getSubjectFromImage2Text = async (text: string) => {
  try {
    const response = await fetch(
      // AI_URL
      FILE_2_TEXT_RESPONSE_TO_SUBJECT_SERVER_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: text,
        }),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
};

const getSummaryFromImage2Text = async (text: string) => {
  try {
    const response = await fetch(
      // AI_URL
      FILE_2_TEXT_RESPONSE_TO_SUMMARY_SERVER_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: text,
        }),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
};

import { Button, Loader, Text, Textarea } from '@mantine/core';
import {Editor, EditorState} from 'draft-js';

import { useEffect, useState } from 'react';
import { readPersistStateGetInitialValue, usePersistStateOnValueChange } from '../../utils/use_persist';
import { useClickOutside } from '@mantine/hooks';
import { getDoctorSummaryPersistKey } from '../parts/utils';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
import { isReference, MedplumClient } from '@medplum/core';
import { useMedplum } from '@medplum/react-hooks';
import { MyEditor } from '../RichText';
interface IResourceAiSummary {
  value: string;
}

export type ShowType = 'onlySummary' | 'full';

const persistData = false;




export const ResourceAiSummary = ({
  patientId,
  resource,
  persistKeySuffix,
  showType,
  setShowType,
}: {
  patientId: string;
  resource: { [key: string]: any };
  persistKeySuffix?: string;
  showType: ShowType;
  setShowType: (type: ShowType) => void;
}) => {
  return null;
}
export const ResourceAiMediaSummary = ({
  patientId,
  resource,
  persistKeySuffix,
  showType,
  setShowType,
}: {
  patientId: string;
  resource: { [key: string]: any };
  persistKeySuffix?: string;
  showType: ShowType;
  setShowType: (type: ShowType) => void;
}) => {
  return null;
}

// export const ResourceAiSummary = ({
//   patientId,
//   resource,
//   persistKeySuffix,
//   showType,
//   setShowType,
// }: {
//   patientId: string;
//   resource: { [key: string]: any };
//   persistKeySuffix?: string;
//   showType: ShowType;
//   setShowType: (type: ShowType) => void;
// }) => {
//   const [allData, setAllData] = useState<any>(null);
//   const [editing, setEditing] = useState(false);

//   const ref = useClickOutside(() => setEditing(false));
//   const medplum = useMedplum();
//   const persistKey = `${getDoctorSummaryPersistKey(patientId, '')}-summary-${resource.id}-${persistKeySuffix || ''}`;
//   const initialValue = readPersistStateGetInitialValue<IResourceAiSummary>({
//     key: persistKey,
//     currentValue: undefined,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | undefined>(undefined);
//   const [summary, setSummary] = useState<IResourceAiSummary | undefined>(initialValue);

//   // usePersistStateOnValueChange({
//   //   key: persistKey,
//   //   updateValue: summary,
//   // });

//   const fetchData = () => {
//     async function query() {
//       const cloneResource = JSON.parse(JSON.stringify(resource));

//       const allKeys = Object.keys(cloneResource);
//       for (const key of allKeys) {
//         cloneResource[key] = await readReferences(medplum, cloneResource[key]);
//       }
//       (window as any).requests = (window as any).requests || {};
//       (window as any).requests[cloneResource.id] = cloneResource;
//       // const response = await fetch(
//       //   'https://talkingapps.onrender.com/api/v1/prediction/f0e9c9d1-a62a-49c5-94e7-8382e43127f5',
//       //   {
//       //     method: 'POST',
//       //     headers: {
//       //       'Content-Type': 'application/json',
//       //     },
//       //     body: JSON.stringify({ resource }),
//       //   }
//       // );
//       // const result = await response.json();
//       // return result;
//       setAllData(cloneResource);
//       return {
//         success: false,
//       };
//     }

//     setLoading(true);

//     query()
//       .then((response) => {
//         const isValid = response.success == true;
//         console.log('Fetch ResourceWithAiSummary', response);
//         if (isValid) {
//           setSummary({
//             value: 'הגיע תשובה מהשרת ai',
//           });
//         } else {
//           setSummary({
//             value: 'הגיע שגיאה מהשרת ai',
//           });
//         }
//       })
//       .catch((e) => {
//         console.log('Fetch ResourceWithAiSummary', e);
//         setSummary({
//           value: 'הגיע שגיאה מהשרת ai',
//         });
//       })
//       .finally(() => {
//         setLoading(false);
//         setShowType('onlySummary');
//       });
//   };

//   const renderValue = () => {
//     if (!summary || !summary.value) {
//       return null;
//     }
//     if (editing) {
//       return (
//         <Textarea ref={ref} value={summary.value} onChange={(e) => setSummary({ value: e.currentTarget.value })} />
//       );
//     }
//     return (
//       <div
//         dir="rtl"
//         onDoubleClick={() => {
//           setEditing(true);
//         }}
//         className="text-start flex justify-start items-start w-full flex-1 p-2"
//       >
//         <Text className="text-start flex justify-start items-start">{summary.value}</Text>
//       </div>
//     );
//   };

//   useEffect(() => {
//     if (!initialValue) {
//       fetchData();
//     }
//   }, []);

//   return (
//     <div className="ResourceAiSummary">
//       {loading && <Loader />}
//       {summary?.value && renderValue()}
//       {/* {JSON.stringify(allData)} */}
//       {/* <GptAi patientId={patientId} resource={resource} persistKeySuffix={persistKeySuffix} /> */}
//     </div>
//   );
// };

// export const ResourceAiMediaSummary = ({
//   patientId,
//   resource,
//   url,
//   showType,
//   setShowType,
// }: {
//   patientId: string;
//   resource: { [key: string]: any };
//   url: string;
//   showType: ShowType;
//   setShowType: (type: ShowType) => void;
// }) => {
//   const [editing, setEditing] = useState(false);
//   const ref = useClickOutside(() => setEditing(false));
//   const persistKey = `${getDoctorSummaryPersistKey(patientId, '')}-summary-media-${resource.id}`;
//   const initialValue = readPersistStateGetInitialValue<IResourceAiSummary>({
//     key: persistKey,
//     currentValue: undefined,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | undefined>(undefined);
//   const [summary, setSummary] = useState<IResourceAiSummary | undefined>(initialValue);

//   usePersistStateOnValueChange({
//     key: persistKey,
//     updateValue: summary,
//   });

//   const fetchData = () => {
//     async function query() {
//       const response = await fetch(
//         'https://talkingapps.onrender.com/api/v1/prediction/f0e9c9d1-a62a-49c5-94e7-8382e43127f5',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ resource }),
//         }
//       );
//       const result = await response.json();
//       return result;
//     }

//     setLoading(true);

//     query()
//       .then((response) => {
//         const isValid = response.success == true;
//         console.log('Fetch ResourceWithAiSummary', response);
//         if (isValid) {
//           setSummary({
//             value: 'הגיע תשובה מהשרת ai imageUrl',
//           });
//         } else {
//           setSummary({
//             value: 'הגיע שגיאה מהשרת ai imageUrl',
//           });
//         }
//       })
//       .catch((e) => {
//         console.log('Fetch ResourceWithAiSummary', e);
//         setSummary({
//           value: 'הגיע שגיאה מהשרת ai imageUrl',
//         });
//       })
//       .finally(() => {
//         setLoading(false);
//         setShowType('onlySummary');
//       });
//   };

//   const renderValue = () => {
//     if (!summary || !summary.value) {
//       return null;
//     }
//     if (editing) {
//       return (
//         <Textarea ref={ref} value={summary.value} onChange={(e) => setSummary({ value: e.currentTarget.value })} />
//       );
//     }
//     return (
//       <Button
//         onDoubleClick={() => {
//           setEditing(true);
//         }}
//         variant="transparent"
//         className="p-0 flex resourceAiSummaryEditButton"
//         fullWidth
//       >
//         <div className="text-start flex justify-start items-start w-full flex-1">
//           <Text className="text-start flex justify-start items-start">{summary.value}</Text>
//         </div>
//       </Button>
//     );
//   };

//   useEffect(() => {
//     if (!initialValue) {
//       fetchData();
//     }
//   }, []);

//   return (
//     <div className="ResourceAiSummary">
//       {loading && <Loader />}
//       {summary?.value && renderValue()}
//     </div>
//   );
// };

const readReferences = async (medplum: MedplumClient, value: any) => {
  try {
    if (!value) return value;
    if (Array.isArray(value)) {
      const valuesFromServer = await Promise.allSettled(
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
      return valuesFromServer
        .filter((outcome) => outcome.status === 'fulfilled')
        .map((outcome) => (outcome as PromiseFulfilledResult<any>).value);
    } else if (typeof value == 'object' && (value as any).reference && isReference(value)) {
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

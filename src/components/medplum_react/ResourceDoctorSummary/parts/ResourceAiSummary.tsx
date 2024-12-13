import { Button, Loader, Text, Textarea } from '@mantine/core';
import { Resource } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';
import { readPersistStateGetInitialValue, usePersistStateOnValueChange } from '../../utils/use_persist';
import { ITemplate } from '../parts/DoctorSummaryTemplates';
import { useClickOutside } from '@mantine/hooks';
import { getDoctorSummaryPersistKey } from '../parts/utils';
import { AskAi } from '../aiPRovider';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
import { set } from 'date-fns';
import { Tiptap } from './TipTap';
interface IResourceAiSummary {
  value: string;
}

export const ResourceAiSummary = ({
  patientId,
  resource,
  persistKeySuffix,
}: {
  patientId: string;
  resource: { [key: string]: any };
  persistKeySuffix?: string;
}) => {
  const [editing, setEditing] = useState(false);

  const ref = useClickOutside(() => setEditing(false));
  const persistKey = `${getDoctorSummaryPersistKey(patientId, '')}-summary-${resource.id}-${persistKeySuffix || ''}`;
  const initialValue = readPersistStateGetInitialValue<IResourceAiSummary>({
    key: persistKey,
    currentValue: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<IResourceAiSummary | undefined>(initialValue);

  usePersistStateOnValueChange({
    key: persistKey,
    updateValue: summary,
  });

  const fetchData = () => {
    async function query() {
      const response = await fetch(
        'https://talkingapps.onrender.com/api/v1/prediction/f0e9c9d1-a62a-49c5-94e7-8382e43127f5',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resource }),
        }
      );
      const result = await response.json();
      return result;
    }

    setLoading(true);

    query()
      .then((response) => {
        const isValid = response.success == true;
        console.log('Fetch ResourceWithAiSummary', response);
        if (isValid) {
          setSummary({
            value: 'הגיע תשובה מהשרת ai',
          });
        } else {
          setSummary({
            value: 'הגיע שגיאה מהשרת ai',
          });
        }
      })
      .catch((e) => {
        console.log('Fetch ResourceWithAiSummary', e);
        setSummary({
          value: 'הגיע שגיאה מהשרת ai',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderValue = () => {
    if (!summary || !summary.value) {
      return null;
    }
    if (editing) {
      return (
        <Textarea ref={ref} value={summary.value} onChange={(e) => setSummary({ value: e.currentTarget.value })} />
      );
    }
    return (
      <Button
        onDoubleClick={() => {
          setEditing(true);
        }}
        variant="transparent"
        className="p-0 flex resourceAiSummaryEditButton"
        fullWidth
      >
        <div className="text-start flex justify-start items-start w-full flex-1">
          <Text className="text-start flex justify-start items-start">{summary.value}</Text>
        </div>
      </Button>
    );
  };

  useEffect(() => {
    if (!initialValue) {
      fetchData();
    }
  }, []);

  return (
    <div className="ResourceAiSummary">
      {loading && <Loader />}
      {summary?.value && renderValue()}
      {/* <GptAi patientId={patientId} resource={resource} persistKeySuffix={persistKeySuffix} /> */}
    </div>
  );
};

export const ResourceAiMediaSummary = ({
  patientId,
  resource,
  imageUrl,
}: {
  patientId: string;
  resource: { [key: string]: any };
  imageUrl: string;
}) => {
  const [editing, setEditing] = useState(false);
  const ref = useClickOutside(() => setEditing(false));
  const persistKey = `${getDoctorSummaryPersistKey(patientId, '')}-summary-media-${resource.id}`;
  const initialValue = readPersistStateGetInitialValue<IResourceAiSummary>({
    key: persistKey,
    currentValue: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<IResourceAiSummary | undefined>(initialValue);

  usePersistStateOnValueChange({
    key: persistKey,
    updateValue: summary,
  });

  const fetchData = () => {
    async function query() {
      const response = await fetch(
        'https://talkingapps.onrender.com/api/v1/prediction/f0e9c9d1-a62a-49c5-94e7-8382e43127f5',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resource }),
        }
      );
      const result = await response.json();
      return result;
    }

    setLoading(true);

    query()
      .then((response) => {
        const isValid = response.success == true;
        console.log('Fetch ResourceWithAiSummary', response);
        if (isValid) {
          setSummary({
            value: 'הגיע תשובה מהשרת ai imageUrl',
          });
        } else {
          setSummary({
            value: 'הגיע שגיאה מהשרת ai imageUrl',
          });
        }
      })
      .catch((e) => {
        console.log('Fetch ResourceWithAiSummary', e);
        setSummary({
          value: 'הגיע שגיאה מהשרת ai imageUrl',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderValue = () => {
    if (!summary || !summary.value) {
      return null;
    }
    if (editing) {
      return (
        <Textarea ref={ref} value={summary.value} onChange={(e) => setSummary({ value: e.currentTarget.value })} />
      );
    }
    return (
      <Button
        onDoubleClick={() => {
          setEditing(true);
        }}
        variant="transparent"
        className="p-0 flex resourceAiSummaryEditButton"
        fullWidth
      >
        <div className="text-start flex justify-start items-start w-full flex-1">
          <Text className="text-start flex justify-start items-start">{summary.value}</Text>
        </div>
      </Button>
    );
  };

  useEffect(() => {
    if (!initialValue) {
      fetchData();
    }
  }, []);

  return (
    <div className="ResourceAiSummary">
      {loading && <Loader />}
      {summary?.value && renderValue()}
    </div>
  );
};

export const GptAi = ({
  patientId,
  resource,
  persistKeySuffix,
}: {
  patientId: string;
  resource: { [key: string]: any };
  persistKeySuffix?: string;
}) => {
  const persistKey = `${getDoctorSummaryPersistKey(patientId, '')}-summary-g-${resource.id}-${persistKeySuffix || ''}`;
  const initialValue = readPersistStateGetInitialValue<IResourceAiSummary>({
    key: persistKey,
    currentValue: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<any>(initialValue);

  usePersistStateOnValueChange({
    key: persistKey,
    updateValue: summary,
  });

  const fetchData = async () => {
    setLoading(true);
    const response = await AskAi.summaryResource(resource);
    debugger;
    console.log('Fetch ResourceWithAiSummary', response);
    setSummary(response);
    setLoading(false);
  };

  // useEffect(() => {
  //   if (!initialValue) {
  //     fetchData();
  //   }
  // }, []);

  return (
    <div className="ResourceAiSummaryGpt">
      {summary ? (
        <Tiptap content={summary} />
      ) : (
        <Button loading={loading} onClick={fetchData}>
          summary with chatGpt
        </Button>
      )}
    </div>
  );
};

import { Loader, Tabs } from '@mantine/core';
import { getReferenceString } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { useResource } from '@medplum/react';
import { Fragment } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { PatientHeader } from './PatientHeader';
import { Icon, IconBolt, IconHome, IconProps, IconUser } from '@tabler/icons-react';

export function PatientPage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams();
  const patient = useResource<Patient>({ reference: `Patient/${id}` });
  if (!patient) {
    return <Loader />;
  }

  const renderTab = ({
    active,
    value,
    Icon,
    disabled,
  }: {
    active: boolean;
    value: string;
    Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
    disabled: boolean;
  }) => {
    return (
      <Tabs.Tab
        value={value}
        className="p-0 flex items-end flex-col border-0 hover:bg-transparent disabled:opacity-100"
        disabled={disabled}
      >
        <div
          className={`${active ? 'bg-white' : 'bg-transparent'}  w-[calc(60px-10px)] h-10 flex items-center justify-center rounded-r-full pe-2`}
        >
          <Icon color={active ? '#21AEFF' : '#92A8D3'} />
        </div>
      </Tabs.Tab>
    );
  };
  console.log({ patient });
  return (
    <Fragment key={getReferenceString(patient)}>
      <div className="flex flex-row">
        <Tabs
          onChange={(t) => navigate(`./${t}`)}
          orientation="vertical"
          defaultValue={'summary'}
          className="h-[100vh] bg-transparent rounded-e-[20px]"
          variant="unstyled"
        >
          <Tabs.List className="w-[60px] gap-4 py-4 bg-[#22365E] rounded-e-[20px]  border-0">
            <div className="w-full  items-center justify-center flex">
              <div className="bg-[#21AEFF] rounded-full w-[35px] h-[35px] flex items-center justify-center">
                <IconUser color="white" />
              </div>
            </div>
            {renderTab({ active: false, value: 'overview', Icon: IconHome, disabled: true })}
            {renderTab({ active: true, value: 'summary', Icon: IconBolt, disabled: true })}
          </Tabs.List>
        </Tabs>
        <div className="p-4 flex flex-col gap-4 w-full bg-[#f7f9fa]">
          <PatientHeader patient={patient} />
          <Outlet />
        </div>
      </div>
    </Fragment>
  );
}

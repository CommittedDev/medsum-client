import { Media } from '@medplum/fhirtypes';
import { AttachmentDisplay } from '../../AttachmentDisplay/AttachmentDisplay';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';
import { ResourceAiMediaSummary, ResourceAiSummary } from './ResourceAiSummary';

export const MediaDoctorSummaryItem = (props: DoctorSummaryItemProps<Media>): JSX.Element => {
  const contentType = props.resource.content?.contentType;
  const padding =
    contentType &&
    !contentType.startsWith('image/') &&
    !contentType.startsWith('video/') &&
    contentType !== 'application/pdf';
  return (
    <DoctorSummaryItem
      resource={props.resource}
      padding={!!padding}
      popupMenuItems={props.popupMenuItems}
      showType={props.showType}
      setShowType={props.setShowType}
    >
      <div className={`media-${props.showType}`}>
        <AttachmentDisplay value={props.resource.content} />
      </div>
      {/* {props.resource.content.url && props.resource.content.contentType?.startsWith('image/') && props.patientId && (
        <ResourceAiMediaSummary
          patientId={props.patientId!}
          imageUrl={props.resource.content.url!}
          resource={props.resource}
          showType={props.showType}
          setShowType={props.setShowType}
        />
      )} */}
    </DoctorSummaryItem>
  );
};

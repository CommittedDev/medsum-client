export interface LogoProps {
  readonly size: number;
  readonly fill?: string;
}

export function Logo(props: LogoProps): JSX.Element {
  return (
   <img src='CommittedLogoSmall.png' style={{width: props.size || 32}}/>
  );
}

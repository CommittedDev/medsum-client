import { Anchor, Button, Stack, Text, Title } from '@mantine/core';
import { Document } from '@medplum/react';
import { Link } from 'react-router-dom';

export function LandingPage(): JSX.Element {
  return (
    <div className='mt-[150px]'>
      <Stack align="center">
        <img src='committedLogo.png'/>
        <Title order={2}> ברוכים הבאים</Title>

        <Button component={Link} to="/signin">
          כניסה
        </Button>
      </Stack>
    </div>
  );
}

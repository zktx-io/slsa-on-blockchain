import { useEffect, useRef, useState } from 'react';

import { Box, Flex, Spinner, Text } from '@radix-ui/themes';
import queryString from 'query-string';

export const Loading = () => {
  const initialized = useRef<boolean>(false);
  const [state, setState] = useState<string>('Loading....');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (window.location.search) {
        const { q: uid } = queryString.parse(window.location.search) as {
          q: string;
        };
        fetch('https://read-jx4b2hndxq-uc.a.run.app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid }),
        })
          .then((res) => {
            res
              .json()
              .then((data) => {
                console.log(data);
              })
              .catch((e) => {
                setError(true);
                setState(`${e}`);
              });
          })
          .catch((e) => {
            setError(true);
            setState(`${e}`);
          });
      } else {
        setError(true);
        setState('Query params error');
      }
    }
  }, []);
  return (
    <>
      <Flex
        gap="3"
        direction="column"
        align="center"
        justify="center"
        height="100vh"
      >
        <Box>{!error && <Spinner size="3" />}</Box>
        <Box>
          <Text>{state}</Text>
        </Box>
      </Flex>
    </>
  );
};

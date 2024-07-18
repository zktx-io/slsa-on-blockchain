import { useEffect, useRef, useState } from 'react';

import { fromB64 } from '@mysten/sui/utils';
import { Box, Flex, Spinner, Text } from '@radix-ui/themes';
import { gunzipSync } from 'fflate';
import queryString from 'query-string';
import { useSetRecoilState } from 'recoil';
import { extract as gzip } from 'tar-stream';

import { STATE } from '../recoil';

export const Loading = () => {
  const initialized = useRef<boolean>(false);
  const setState = useSetRecoilState(STATE);

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const unzip = async (
    base64string: string,
  ): Promise<{ [fileName: string]: Uint8Array }> => {
    return new Promise((resolve, reject) => {
      try {
        const decompressedData = gunzipSync(fromB64(base64string));
        const extract = gzip();
        const files: { [fileName: string]: Uint8Array } = {};
        extract.on('entry', (header, stream, next) => {
          const chunks: Uint8Array[] = [];
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('end', () => {
            const fileData = new Uint8Array(
              chunks.reduce(
                (acc, chunk) => acc.concat(Array.from(chunk)),
                [] as number[],
              ),
            );
            files[header.name] = fileData;
            next();
          });
          stream.resume();
        });
        extract.on('finish', () => {
          resolve(files);
        });
        extract.end(decompressedData);
      } catch (error) {
        reject(error);
      }
    });
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (window.location.search) {
        const { q: uid } = queryString.parse(window.location.search) as {
          q: string;
        };
        const fetchData = async () => {
          try {
            setMessage('Initializing ....');
            const res1 = await fetch('https://read-jx4b2hndxq-uc.a.run.app', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uid }),
            });
            const data = await res1.json();

            setMessage('Loading Data ....');
            const res2 = await fetch(
              'https://download-jx4b2hndxq-uc.a.run.app',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: uid }),
              },
            );
            const gzip = await res2.text();
            const files = await unzip(gzip);
            setState({
              uid,
              files,
              data,
            });
          } catch (e) {
            setError(true);
            setMessage(`${e}`);
          }
        };

        fetchData();
      } else {
        setError(true);
        setMessage('Query params error');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex
      gap="3"
      direction="column"
      align="center"
      justify="center"
      height="100vh"
    >
      <Box>{!error && <Spinner size="3" />}</Box>
      <Box>
        <Text>{message}</Text>
      </Box>
    </Flex>
  );
};

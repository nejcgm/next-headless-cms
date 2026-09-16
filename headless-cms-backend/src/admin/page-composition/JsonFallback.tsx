import { useEffect, useState } from 'react';
import { Box, Button, JSONInput, Typography } from '@strapi/design-system';
import type { CompositionNode } from '../../page-composition/types';
import { convertPageBlocks } from '../../page-composition/convert-section-children';
import { validatePageBlocks } from '../../page-composition/validate';
import { ErrorMessage } from './ErrorMessage';

type Props = {
  tree: CompositionNode[];
  tenant?: string;
  disabled?: boolean;
  onApply: (next: CompositionNode[]) => string | null;
};

export function JsonFallback({ tree, tenant, disabled, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => JSON.stringify(tree, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDraft(JSON.stringify(tree, null, 2));
      setError(null);
    }
  }, [tree, open]);

  return (
    <Box paddingTop={4}>
      <Button variant="tertiary" size="S" onClick={() => setOpen((value) => !value)}>
        {open ? 'Hide technical JSON' : 'Technical JSON (advanced)'}
      </Button>
      {open && (
        <Box paddingTop={3}>
          <Typography variant="pi" textColor="neutral600">
            Same page body as the tree above. Invalid JSON or disallowed nests are not saved.
          </Typography>
          <Box paddingTop={2}>
            <JSONInput
              aria-label="Technical JSON fallback"
              disabled={disabled}
              minHeight="20rem"
              maxHeight="40rem"
              value={draft}
              onChange={(value: string) => {
                setDraft(value);
                setError(null);
              }}
            />
          </Box>
          <ErrorMessage>{error}</ErrorMessage>
          <Box paddingTop={2}>
            <Button
              size="S"
              disabled={disabled}
              onClick={() => {
                try {
                  const parsed = JSON.parse(draft);
                  const converted = convertPageBlocks(parsed);
                  const result = validatePageBlocks(converted, tenant);
                  if (!result.ok) {
                    setError(result.message);
                    return;
                  }
                  const applyError = onApply(converted);
                  if (applyError) {
                    setError(applyError);
                    return;
                  }
                  setError(null);
                } catch {
                  setError('Invalid JSON');
                }
              }}
            >
              Apply JSON
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

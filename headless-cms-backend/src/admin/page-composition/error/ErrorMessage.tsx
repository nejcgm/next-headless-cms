import { Box, Typography } from '@strapi/design-system';

type Props = {
  children: string | null | undefined;
};

export function ErrorMessage({ children }: Props) {
  if (!children) return null;

  return (
    <Box paddingTop={1}>
      <Typography variant="pi" textColor="danger600">
        {children}
      </Typography>
    </Box>
  );
}

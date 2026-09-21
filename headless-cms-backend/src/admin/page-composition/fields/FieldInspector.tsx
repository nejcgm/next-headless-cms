import { useState, type ChangeEvent } from 'react';
import {
  Box,
  Checkbox,
  Combobox,
  ComboboxOption,
  Field,
  Flex,
  JSONInput,
  NumberInput,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Textarea,
  Typography,
} from '@strapi/design-system';
import type { CompositionNode } from '../../../page-composition/types';
import { ErrorMessage } from '../error/ErrorMessage';
import { FIELD_GROUP_ORDER, fieldsFor, titleForGroup, type FieldDef } from './field-catalog';

const COLOR_TOKENS = [
  'primary',
  'secondary',
  'accent',
  'background',
  'foreground',
  'muted',
  'border',
  'text-primary',
];

const COLOR_FIELD_NAMES = new Set(['color', 'backgroundColor', 'borderColor']);

function ColorFieldControl({
  label,
  required,
  value,
  disabled,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: unknown;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  const [filterValue, setFilterValue] = useState('');
  const [open, setOpen] = useState(false);
  const filterText = filterValue ?? '';
  const isHexLike = filterText.trim().startsWith('#');
  const filtered = filterText
    ? COLOR_TOKENS.filter((token) => token.toLowerCase().includes(filterText.toLowerCase()))
    : COLOR_TOKENS;

  return (
    <Field.Root required={required}>
      <Field.Label>{label}</Field.Label>
      <Combobox
        size="S"
        disabled={disabled}
        value={value == null ? undefined : String(value)}
        filterValue={filterText}
        onFilterValueChange={(next) => setFilterValue(next == null ? '' : String(next))}
        open={isHexLike ? false : open}
        onOpenChange={setOpen}
        onChange={(next: string | number | undefined) => onChange(next ?? null)}
        onClear={required ? undefined : () => onChange(null)}
        allowCustomValue
        placeholder="Pick a theme color or type a hex code"
      >
        {filtered.map((token) => (
          <ComboboxOption key={token} value={token}>
            {token}
          </ComboboxOption>
        ))}
      </Combobox>
    </Field.Root>
  );
}

function JsonFieldControl({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: unknown;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  const stringify = (v: unknown) =>
    typeof v === 'object' || typeof v === 'boolean' || typeof v === 'number'
      ? JSON.stringify(v, null, 2)
      : ((v as string | undefined) ?? '');
  const [draft, setDraft] = useState(() => stringify(value));
  const [error, setError] = useState<string | null>(null);

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <JSONInput
        disabled={disabled}
        value={draft}
        minHeight="6rem"
        maxHeight="14rem"
        onChange={(next: string) => {
          setDraft(next);
          try {
            onChange(next.trim() === '' ? null : JSON.parse(next));
            setError(null);
          } catch {
            setError('Invalid JSON — not applied until it parses.');
          }
        }}
      />
      <ErrorMessage>{error}</ErrorMessage>
    </Field.Root>
  );
}

const SEARCHABLE_ENUM_THRESHOLD = 20;

function SearchableEnumControl({
  label,
  required,
  options,
  value,
  disabled,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: string[];
  value: unknown;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  const [filterValue, setFilterValue] = useState('');
  const filterText = filterValue ?? '';
  const filtered = filterText
    ? options.filter((option) => option.toLowerCase().includes(filterText.toLowerCase()))
    : options;

  return (
    <Field.Root required={required}>
      <Field.Label>{label}</Field.Label>
      <Combobox
        size="S"
        disabled={disabled}
        value={value == null ? undefined : String(value)}
        filterValue={filterText}
        onFilterValueChange={(next) => setFilterValue(next == null ? '' : String(next))}
        onChange={(next: string | number | undefined) => onChange(next ?? null)}
        onClear={required ? undefined : () => onChange(null)}
        noOptionsMessage={() => 'No matches'}
      >
        {filtered.map((option) => (
          <ComboboxOption key={option} value={option}>
            {option}
          </ComboboxOption>
        ))}
      </Combobox>
    </Field.Root>
  );
}

type Props = {
  node: CompositionNode | null;
  disabled?: boolean;
  onChange: (patch: Record<string, unknown>) => void;
};

function FieldControl({
  field,
  value,
  disabled,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  if (COLOR_FIELD_NAMES.has(field.name)) {
    return (
      <ColorFieldControl
        label={field.label}
        required={field.required}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <Field.Root name={field.name}>
        <Checkbox
          disabled={disabled}
          checked={Boolean(value)}
          onCheckedChange={(checked: boolean) => onChange(Boolean(checked))}
        >
          {field.label}
        </Checkbox>
      </Field.Root>
    );
  }

  if (field.type === 'enumeration' && field.enum) {
    if (field.enum.length > SEARCHABLE_ENUM_THRESHOLD) {
      return (
        <SearchableEnumControl
          label={field.label}
          required={field.required}
          options={field.enum}
          value={value}
          disabled={disabled}
          onChange={onChange}
        />
      );
    }

    return (
      <Field.Root name={field.name} required={field.required}>
        <Field.Label>{field.label}</Field.Label>
        <SingleSelect
          size="S"
          disabled={disabled}
          value={value == null ? undefined : String(value)}
          onChange={(next: string | number) => onChange(next)}
          onClear={field.required ? undefined : () => onChange(null)}
        >
          {field.enum.map((option) => (
            <SingleSelectOption key={option} value={option}>
              {option}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      </Field.Root>
    );
  }

  if (field.type === 'json' || field.type === 'component') {
    return <JsonFieldControl label={field.label} value={value} disabled={disabled} onChange={onChange} />;
  }

  if (field.type === 'text') {
    return (
      <Field.Root name={field.name}>
        <Field.Label>{field.label}</Field.Label>
        <Textarea
          disabled={disabled}
          value={value == null ? '' : String(value)}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        />
      </Field.Root>
    );
  }

  if (field.type === 'integer' || field.type === 'decimal' || field.type === 'float') {
    return (
      <Field.Root name={field.name}>
        <Field.Label>{field.label}</Field.Label>
        <NumberInput
          size="S"
          disabled={disabled}
          value={typeof value === 'number' ? value : undefined}
          step={field.type === 'integer' ? 1 : 0.01}
          onValueChange={(next: number | undefined) => onChange(next ?? null)}
        />
      </Field.Root>
    );
  }

  return (
    <Field.Root name={field.name}>
      <Field.Label>{field.label}</Field.Label>
      <TextInput
        size="S"
        disabled={disabled}
        value={value == null ? '' : String(value)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
    </Field.Root>
  );
}

function FieldGroup({ title, fields, node, disabled, onChange }: {
  title: string;
  fields: FieldDef[];
  node: CompositionNode;
  disabled?: boolean;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  if (fields.length === 0) return null;

  return (
    <Box paddingBottom={2}>
      <Typography variant="sigma" textColor="neutral500" paddingBottom={1}>
        {title}
      </Typography>
      <Flex direction="column" alignItems="stretch" gap={2} paddingTop={1}>
        {fields.map((field) => (
          <FieldControl
            key={`${node.id ?? node.__temp_key__ ?? ''}:${field.name}`}
            field={field}
            value={node[field.name]}
            disabled={disabled}
            onChange={(value) => onChange({ [field.name]: value })}
          />
        ))}
      </Flex>
    </Box>
  );
}

export function FieldInspector({ node, disabled, onChange }: Props) {
  if (!node) {
    return (
      <Typography variant="omega" textColor="neutral600">
        Select a block to edit its fields.
      </Typography>
    );
  }

  const fields = fieldsFor(node.__component);

  return (
    <Box>
      <Box background="neutral0" paddingBottom={2} style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <Typography variant="delta">Fields</Typography>
      </Box>
      {FIELD_GROUP_ORDER.map((group) => (
        <FieldGroup
          key={group}
          title={titleForGroup(group)}
          fields={fields.filter((f) => f.group === group)}
          node={node}
          disabled={disabled}
          onChange={onChange}
        />
      ))}
      {fields.length === 0 && (
        <Typography variant="pi" textColor="neutral500">
          This block has no editable fields.
        </Typography>
      )}
    </Box>
  );
}

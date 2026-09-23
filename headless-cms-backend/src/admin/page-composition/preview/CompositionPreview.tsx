import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, Button, Flex, Typography } from '@strapi/design-system';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import type { CompositionNode } from '../../../page-composition/types';
import { clickContentManagerAction } from './content-manager-actions';

const COMPOSE_PREVIEW_MESSAGE = 'cms-compose-preview';
const COMPOSE_PREVIEW_READY = 'cms-compose-preview-ready';
const MIN_FRAME_WIDTH = 320;

function documentIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/api::page\.page\/([^/]+)/);
  const id = match?.[1];
  if (!id || id === 'create') return null;
  return id;
}

export function CompositionPreview({
  blocks,
  disabled,
}: {
  blocks: CompositionNode[];
  disabled?: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const frameBoxRef = useRef<HTMLDivElement | null>(null);
  const { get } = useFetchClient();
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'unavailable'>('loading');
  const [frameWidth, setFrameWidth] = useState<number | null>(null);
  const [liveWidth, setLiveWidth] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const id = documentIdFromLocation();
    setDocumentId(id);
    if (!id) {
      setStatus('empty');
      return undefined;
    }

    let cancelled = false;
    void get<{ data?: { url?: string } }>('/content-manager/preview/url/api::page.page', {
      params: { documentId: id, status: 'draft' },
    })
      .then(({ data }) => {
        const rawUrl = data?.data?.url;
        if (!rawUrl) throw new Error('preview url missing');
        const url = new URL(rawUrl);
        url.searchParams.set('compose', '1');
        if (!cancelled) {
          setPreviewUrl(url.toString());
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, [get]);

  useEffect(() => {
    if (status !== 'ready' || !previewUrl) return undefined;
    const frame = frameRef.current;
    if (!frame?.contentWindow) return undefined;

    let targetOrigin: string;
    try {
      targetOrigin = new URL(previewUrl).origin;
    } catch {
      return undefined;
    }

    const send = () => {
      const secret = new URL(previewUrl).searchParams.get('secret') ?? '';
      frame.contentWindow?.postMessage(
        { type: COMPOSE_PREVIEW_MESSAGE, blocks, secret },
        targetOrigin
      );
    };

    const onReady = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) return;
      if (event.data?.type !== COMPOSE_PREVIEW_READY) return;
      send();
    };

    const timer = window.setTimeout(send, 300);
    window.addEventListener('message', onReady);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('message', onReady);
    };
  }, [blocks, previewUrl, status]);

  useEffect(() => {
    const box = frameBoxRef.current;
    if (!box) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setLiveWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [status, previewUrl]);

  const onResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = frameBoxRef.current;
    const bounds = box?.parentElement;
    if (!box || !bounds) return;
    event.preventDefault();
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = box.getBoundingClientRect().width;
    const max = bounds.getBoundingClientRect().width;
    const handle = event.currentTarget;
    handle.setPointerCapture(pointerId);
    setDragging(true);

    const onMove = (move: PointerEvent) => {
      const next = Math.round(startWidth + (move.clientX - startX));
      setFrameWidth(Math.max(MIN_FRAME_WIDTH, Math.min(max, next)));
    };
    const finish = () => {
      setDragging(false);
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      const frame = frameRef.current;
      if (!frame) return;
      const height = frame.offsetHeight;
      frame.style.height = `${Math.max(0, height - 1)}px`;
      requestAnimationFrame(() => {
        frame.style.height = '';
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  };

  return (
    <Box
      className="compose-preview"
      style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 0 }}
    >
      <Flex justifyContent="space-between" alignItems="center" paddingBottom={2}>
        <Typography variant="delta">Preview</Typography>
        <Flex gap={2}>
          <Button size="S" variant="tertiary" disabled={disabled || !documentId} onClick={() => clickContentManagerAction('Save')}>
            Save
          </Button>
          <Button size="S" variant="default" disabled={disabled || !documentId} onClick={() => clickContentManagerAction('Publish')}>
            Publish
          </Button>
        </Flex>
      </Flex>
      {status === 'empty' ? (
        <Typography variant="omega" textColor="neutral600">
          Save this page once to see a preview.
        </Typography>
      ) : null}
      {status === 'unavailable' ? (
        <Typography variant="omega" textColor="danger600">
          Preview is unavailable. You can keep editing the tree and fields.
        </Typography>
      ) : null}
      {status === 'loading' ? (
        <Typography variant="omega" textColor="neutral600">
          Loading preview…
        </Typography>
      ) : null}
      {status === 'ready' && previewUrl ? (
        <div style={{ flex: '1 1 auto', minHeight: 0, minWidth: 0, display: 'flex' }}>
          <div
            ref={frameBoxRef}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: frameWidth ?? '100%',
              maxWidth: '100%',
              height: '100%',
              minHeight: 0,
            }}
          >
            {liveWidth > 0 ? (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  padding: '0 6px',
                  borderRadius: 4,
                  border: '1px solid var(--color-neutral200, #dcdce4)',
                  background: 'var(--color-neutral0, #fff)',
                  color: 'var(--color-neutral600, #666687)',
                  fontSize: 11,
                  lineHeight: '18px',
                  fontVariantNumeric: 'tabular-nums',
                  pointerEvents: 'none',
                }}
              >
                {liveWidth}px
              </span>
            ) : null}
            <iframe
              ref={frameRef}
              title="Page preview"
              src={previewUrl}
              style={{
                width: '100%',
                flex: '1 1 auto',
                minHeight: 0,
                border: '1px solid black',
                background: 'white',
                pointerEvents: dragging ? 'none' : undefined,
              }}
            />
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize preview width"
              aria-valuemin={MIN_FRAME_WIDTH}
              aria-valuenow={liveWidth}
              title="Drag to resize. Double-click to fill the column."
              onPointerDown={onResizePointerDown}
              onDoubleClick={() => setFrameWidth(null)}
              style={{
                position: 'absolute',
                top: 0,
                right: -6,
                width: 12,
                height: '100%',
                cursor: 'ew-resize',
                touchAction: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 4,
                  width: 4,
                  height: 28,
                  transform: 'translateY(-50%)',
                  borderRadius: 2,
                  background: 'var(--color-neutral400, #a5a5ba)',
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </Box>
  );
}

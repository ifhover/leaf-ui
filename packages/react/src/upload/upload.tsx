import { CloudUpload, RotateCw, Upload as UploadIcon, X } from 'lucide-react';
import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Button } from '../button';
import { type FileItem, FileList } from '../filelist';
import { fileName } from '../filelist/model';
import { FieldScope, useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue } from '../shared/field';
import { useText } from '../shared/use-text';
import { acceptsFile, type UploadRequest, type UploadResult, uploadRequest } from './request';

export interface UploadFile extends FileItem {
  uid: string;
  response?: unknown;
}
export interface UploadChangeInfo {
  file?: UploadFile;
  reason: 'add' | 'progress' | 'success' | 'error' | 'remove' | 'cancel';
}
export interface UploadRejection {
  file: File;
  reason: 'type' | 'size' | 'count' | 'validation';
  message: string;
}
export interface UploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  fileList?: readonly UploadFile[];
  defaultFileList?: readonly UploadFile[];
  onChange?: (files: UploadFile[], info: UploadChangeInfo) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  drag?: boolean;
  maxCount?: number;
  maxSize?: number;
  beforeUpload?: (file: File) => boolean | File | Promise<boolean | File>;
  onReject?: (rejections: readonly UploadRejection[]) => void;
  action?: string | ((file: File) => string | Promise<string>);
  method?: 'POST' | 'PUT';
  headers?: Readonly<Record<string, string>>;
  data?: Readonly<Record<string, string | Blob>>;
  withCredentials?: boolean;
  fieldName?: string;
  // biome-ignore lint/suspicious/noConfusingVoidType: Custom transports may finish via callbacks without returning a result.
  customRequest?: (request: UploadRequest) => Promise<UploadResult | void>;
  onRemove?: (file: UploadFile) => boolean | void | Promise<boolean> | Promise<void>;
  showFileList?: boolean;
  hint?: ReactNode;
  children?: ReactNode;
  name?: string;
  form?: string;
  required?: boolean;
  autoUpload?: boolean;
  concurrency?: number;
  directory?: boolean;
  paste?: boolean;
  listType?: 'text' | 'picture' | 'picture-card';
}
export interface UploadHandle {
  upload: (uid?: string) => void;
  abort: (uid?: string) => void;
  focus: () => void;
}
export const Upload = forwardRef<UploadHandle, UploadProps>(function Upload(
  {
    fileList,
    defaultFileList = [],
    onChange,
    accept,
    multiple = false,
    disabled: disabledProp,
    drag = false,
    maxCount,
    maxSize,
    beforeUpload,
    onReject,
    action,
    method = 'POST',
    headers,
    data,
    withCredentials = false,
    fieldName = 'file',
    customRequest,
    onRemove,
    showFileList = true,
    hint,
    children,
    name,
    form,
    required,
    autoUpload = true,
    concurrency = 3,
    directory,
    paste,
    listType = 'text',
    id: idProp,
    className,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    ...props
  }: UploadProps,
  ref,
) {
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
  const t = useText();
  const id = useId();
  const count = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const waiting = useRef(new Map<string, UploadFile>());
  const generation = useRef(0);
  const [internal, setInternal] = useState<readonly UploadFile[]>(defaultFileList);
  const [dragging, setDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<readonly UploadRejection[]>([]);
  const current = fileList ?? internal;
  // biome-ignore lint/correctness/useExhaustiveDependencies: The form prop can reassign the input to another native form.
  useEffect(() => {
    const owner = input.current?.form;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        generation.current++;
        for (const job of jobs.current.values()) job.abort();
        jobs.current.clear();
        waiting.current.clear();
        if (fileList === undefined) {
          setInternal(defaultFileList);
          latest.current.current = defaultFileList;
        }
        setErrors([]);
        setValidating(false);
      });
    const serialize = (event: FormDataEvent) => {
      if (!name || disabled) return;
      for (const file of latest.current.current) {
        if (file.originFile) event.formData.append(name, file.originFile, file.name);
        else if (file.url) event.formData.append(name, file.url);
      }
    };
    owner?.addEventListener('reset', reset);
    owner?.addEventListener('formdata', serialize);
    return () => {
      owner?.removeEventListener('reset', reset);
      owner?.removeEventListener('formdata', serialize);
    };
  }, [fileList, defaultFileList, form, name, disabled]);
  const latest = useRef({
    current,
    fileList,
    onChange,
    action,
    customRequest,
    method,
    headers,
    data,
    withCredentials,
    fieldName,
  });
  latest.current = {
    current,
    fileList,
    onChange,
    action,
    customRequest,
    method,
    headers,
    data,
    withCredentials,
    fieldName,
  };
  const jobs = useRef(new Map<string, AbortController>());
  const urls = useRef(new Map<string, string>());
  const mounted = useRef(true);
  const serial = useRef(Promise.resolve());
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const job of jobs.current.values()) job.abort();
      jobs.current.clear();
      for (const url of urls.current.values()) URL.revokeObjectURL(url);
      urls.current.clear();
    };
  }, []);
  useEffect(() => {
    const present = new Set(current.map((file) => file.uid));
    for (const [uid, job] of jobs.current)
      if (!present.has(uid)) {
        job.abort();
        jobs.current.delete(uid);
      }
    for (const [uid, url] of urls.current)
      if (!present.has(uid)) {
        URL.revokeObjectURL(url);
        urls.current.delete(uid);
      }
  }, [current]);
  const commit = (next: UploadFile[], info: UploadChangeInfo) => {
    if (!mounted.current) return;
    latest.current.current = next;
    if (latest.current.fileList === undefined) setInternal(next);
    latest.current.onChange?.(next, info);
  };
  const update = (uid: string, values: Partial<UploadFile>, reason: UploadChangeInfo['reason']) => {
    const file = latest.current.current.find((file) => file.uid === uid);
    if (!file) return;
    const next = { ...file, ...values };
    commit(
      latest.current.current.map((file) => (file.uid === uid ? next : file)),
      { file: next, reason },
    );
  };
  const start = async (file: UploadFile) => {
    if (
      disabled ||
      !file.originFile ||
      jobs.current.has(file.uid) ||
      !mounted.current ||
      !latest.current.current.some((item) => item.uid === file.uid)
    )
      return;
    if (jobs.current.size >= Math.max(1, Math.floor(concurrency))) {
      waiting.current.set(file.uid, file);
      return;
    }
    waiting.current.delete(file.uid);
    const config = latest.current;
    if (!config.action && !config.customRequest) return;
    const request = new AbortController();
    jobs.current.set(file.uid, request);
    update(file.uid, { status: 'uploading', percent: 0, error: undefined }, 'progress');
    const progress = (percent: number) => {
      if (
        !request.signal.aborted &&
        jobs.current.get(file.uid) === request &&
        Number.isFinite(percent)
      )
        update(file.uid, { percent: Math.max(0, Math.min(99, percent)) }, 'progress');
    };
    try {
      let result: UploadResult | undefined;
      if (config.customRequest)
        result =
          (await config.customRequest({
            file: file.originFile,
            signal: request.signal,
            onProgress: progress,
          })) || undefined;
      else {
        const address =
          typeof config.action === 'function'
            ? await config.action(file.originFile)
            : config.action;
        if (request.signal.aborted) return;
        if (!address) throw new Error(t('上传地址不能为空', 'Upload URL cannot be empty'));
        result = await uploadRequest({
          file: file.originFile,
          signal: request.signal,
          onProgress: progress,
          action: address,
          method: config.method,
          headers: config.headers,
          data: config.data,
          withCredentials: config.withCredentials,
          fieldName: config.fieldName,
        });
      }
      if (!request.signal.aborted && jobs.current.get(file.uid) === request)
        update(
          file.uid,
          {
            status: 'done',
            percent: 100,
            response: result?.response,
            ...(result?.url ? { url: result.url } : {}),
            ...(result?.name ? { name: result.name } : {}),
          },
          'success',
        );
    } catch (reason) {
      if (!request.signal.aborted && jobs.current.get(file.uid) === request)
        update(
          file.uid,
          {
            status: 'error',
            error: reason instanceof Error ? reason.message : t('上传失败', 'Upload failed'),
          },
          'error',
        );
    } finally {
      if (jobs.current.get(file.uid) === request) jobs.current.delete(file.uid);
      const next = waiting.current.values().next().value;
      if (next) void start(next);
    }
  };
  useImperativeHandle(ref, () => ({
    upload: (uid) => {
      for (const file of latest.current.current)
        if (
          (!uid || file.uid === uid) &&
          ['ready', 'error', 'cancelled'].includes(file.status ?? 'ready')
        )
          void start(file);
    },
    abort: (uid) => {
      for (const [key, job] of jobs.current)
        if (!uid || key === uid) {
          job.abort();
          jobs.current.delete(key);
          update(key, { status: 'cancelled' }, 'cancel');
        }
      if (uid) waiting.current.delete(uid);
      else waiting.current.clear();
    },
    focus: () => trigger.current?.focus(),
  }));
  const addFiles = (files: readonly File[]) => {
    if (disabled || !files.length) return;
    const batchGeneration = generation.current;
    serial.current = serial.current
      .then(async () => {
        if (!mounted.current || batchGeneration !== generation.current) return;
        setValidating(true);
        setErrors([]);
        const rejected: UploadRejection[] = [];
        const accepted: UploadFile[] = [];
        for (const original of files) {
          let file = original;
          const reject = (reason: UploadRejection['reason'], message: string) =>
            rejected.push({ file: original, reason, message });
          if (!multiple && accepted.length > 0) {
            reject('count', t('每次只能选择一个文件', 'Choose one file at a time'));
            continue;
          }
          if (!acceptsFile(file, accept)) {
            reject('type', t('文件格式不支持', 'File type is not accepted'));
            continue;
          }
          if (maxSize !== undefined && file.size > maxSize) {
            reject('size', t('文件超过大小限制', 'File exceeds the size limit'));
            continue;
          }
          if (
            maxCount !== undefined &&
            latest.current.current.length + accepted.length >= maxCount
          ) {
            reject('count', t('文件数量达到上限', 'File count limit reached'));
            continue;
          }
          try {
            const result = await beforeUpload?.(file);
            if (!mounted.current || batchGeneration !== generation.current) return;
            if (result === false) {
              reject('validation', t('文件未通过校验', 'File validation failed'));
              continue;
            }
            if (result instanceof File) file = result;
          } catch (reason) {
            reject(
              'validation',
              reason instanceof Error
                ? reason.message
                : t('文件未通过校验', 'File validation failed'),
            );
            continue;
          }
          if (!mounted.current || batchGeneration !== generation.current) return;
          const uid = `${id}-${++count.current}`;
          let url: string | undefined;
          if (/^(image|video|audio)\//.test(file.type)) {
            url = URL.createObjectURL(file);
            urls.current.set(uid, url);
          }
          accepted.push({
            uid,
            name: file.name,
            size: file.size,
            type: file.type,
            originFile: file,
            status: 'ready',
            url,
          });
        }
        if (!mounted.current || batchGeneration !== generation.current) return;
        if (accepted.length) {
          commit([...latest.current.current, ...accepted], {
            file: accepted.at(-1),
            reason: 'add',
          });
          if (autoUpload) for (const file of accepted) void start(file);
        }
        setErrors(rejected);
        setValidating(false);
        if (rejected.length) onReject?.(rejected);
      })
      .catch((reason) => {
        if (mounted.current) {
          setValidating(false);
          setErrors([{ file: files[0] as File, reason: 'validation', message: String(reason) }]);
        }
      });
  };
  const remove = async (file: FileItem) => {
    if (disabled) return;
    const entry = latest.current.current.find((item) => item.uid === file.uid);
    if (!entry || (await onRemove?.(entry)) === false || !mounted.current) return;
    jobs.current.get(entry.uid)?.abort();
    jobs.current.delete(entry.uid);
    waiting.current.delete(entry.uid);
    const url = urls.current.get(entry.uid);
    if (url) {
      URL.revokeObjectURL(url);
      urls.current.delete(entry.uid);
    }
    commit(
      latest.current.current.filter((item) => item.uid !== entry.uid),
      { file: entry, reason: 'remove' },
    );
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drop handling augments the keyboard-accessible choose-file button inside this surface.
    <div
      {...props}
      className={classes(
        'leaf-upload',
        drag && 'leaf-upload--drag',
        `leaf-upload--${listType}`,
        className,
      )}
      data-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      onPaste={(event) => {
        props.onPaste?.(event);
        if (paste && !event.defaultPrevented && !disabled && event.clipboardData.files.length) {
          event.preventDefault();
          addFiles([...event.clipboardData.files]);
        }
      }}
      onDragEnter={(event) => {
        onDragEnter?.(event);
        if (!event.defaultPrevented && !disabled) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragOver={(event) => {
        onDragOver?.(event);
        if (!event.defaultPrevented && !disabled) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(event) => {
        onDrop?.(event);
        setDragging(false);
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (!disabled) addFiles([...event.dataTransfer.files]);
      }}
    >
      <input
        ref={input}
        form={form}
        {...(directory ? { webkitdirectory: '', directory: '' } : {})}
        hidden
        type="file"
        className="leaf-upload__input"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-label={t('选择文件', 'Choose files')}
        onChange={(event) => {
          addFiles([...(event.target.files ?? [])]);
          event.target.value = '';
        }}
      />
      {drag ? (
        <button
          ref={trigger}
          id={idProp ?? field?.id}
          type="button"
          className="leaf-upload__dropzone"
          disabled={disabled || validating}
          onClick={() => input.current?.click()}
        >
          <span className="leaf-upload__symbol">
            <CloudUpload size={28} aria-hidden="true" />
          </span>
          <span className="leaf-upload__title">
            {children ?? t('点击或拖拽文件到这里', 'Click or drop files here')}
          </span>
          <span className="leaf-upload__hint">
            {hint ?? t('支持选择和拖拽上传', 'Choose files or drag them into this area')}
          </span>
        </button>
      ) : (
        <div className="leaf-upload__trigger">
          <Button
            ref={trigger}
            id={idProp ?? field?.id}
            variant="outline"
            disabled={disabled}
            loading={validating}
            startIcon={<UploadIcon size={16} />}
            onClick={() => input.current?.click()}
          >
            {children ?? t('选择文件', 'Choose files')}
          </Button>
          {hint && <span className="leaf-upload__hint">{hint}</span>}
        </div>
      )}
      <FormValue
        value={current.length ? 'selected' : ''}
        required={required ?? field?.required}
        form={form}
        disabled={disabled}
        triggerRef={trigger}
      />
      {errors.length > 0 && (
        <ul className="leaf-upload__errors" role="alert">
          {errors.map((error) => (
            <li key={`${error.file.name}-${error.file.lastModified}-${error.reason}`}>
              {error.file.name}: {error.message}
            </li>
          ))}
        </ul>
      )}
      {showFileList && current.length > 0 && (
        <FieldScope>
          <FileList
            items={current}
            listType={listType}
            disabled={disabled}
            removable
            onRemove={remove}
            renderActions={(file, actions) => (
              <>
                {file.status === 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    startIcon={<X size={15} />}
                    aria-label={`${t('取消上传', 'Cancel upload')} ${fileName(file)}`}
                    onClick={() => {
                      if (!file.uid) return;
                      jobs.current.get(file.uid)?.abort();
                      jobs.current.delete(file.uid);
                      update(file.uid, { status: 'cancelled' }, 'cancel');
                    }}
                  />
                )}
                {['error', 'cancelled', 'ready'].includes(file.status ?? '') &&
                  (action || customRequest) &&
                  file.originFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      startIcon={<RotateCw size={15} />}
                      aria-label={`${t('重新上传', 'Retry upload')} ${fileName(file)}`}
                      onClick={() => void start(file as UploadFile)}
                    />
                  )}
                {actions}
              </>
            )}
          />
        </FieldScope>
      )}
    </div>
  );
});

// Type declaration for react-dropzone
// This ensures TypeScript can find the module until the language server picks up the package types
declare module 'react-dropzone' {
  import * as React from 'react';

  export interface DropzoneState {
    isFocused: boolean;
    isDragActive: boolean;
    isDragAccept: boolean;
    isDragReject: boolean;
    acceptedFiles: File[];
    fileRejections: any[];
    rootRef: React.RefObject<HTMLElement>;
    inputRef: React.RefObject<HTMLInputElement>;
    getRootProps: <T extends Record<string, any> = {}>(props?: T) => T & Record<string, any>;
    getInputProps: <T extends Record<string, any> = {}>(props?: T) => T & Record<string, any>;
    open: () => void;
  }

  export interface DropzoneOptions {
    accept?: { [key: string]: string[] } | string[];
    minSize?: number;
    maxSize?: number;
    maxFiles?: number;
    multiple?: boolean;
    disabled?: boolean;
    onDrop?: (acceptedFiles: File[], fileRejections: any[], event: any) => void;
    onDropAccepted?: (files: File[], event: any) => void;
    onDropRejected?: (fileRejections: any[], event: any) => void;
    preventDropOnDocument?: boolean;
    noClick?: boolean;
    noKeyboard?: boolean;
    noDrag?: boolean;
    noDragEventsBubbling?: boolean;
  }

  export function useDropzone(options?: DropzoneOptions): DropzoneState;
  export default function Dropzone(props: any): React.ReactElement;
}


declare module 'react-plaid-link' {
  import React from 'react';

  export interface PlaidAccount {
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
    verification_status: string;
  }

  export interface PlaidInstitution {
    name: string;
    institution_id: string;
  }

  export interface PlaidLinkError {
    error_type: string;
    error_code: string;
    error_message: string;
    display_message: string;
  }

  export interface PlaidLinkOnSuccessMetadata {
    institution: null | PlaidInstitution;
    accounts: Array<PlaidAccount>;
    link_session_id: string;
    transfer_status?: string;
  }

  export interface PlaidLinkOnExitMetadata {
    institution: null | PlaidInstitution;
    status: null | string;
    link_session_id: string;
    request_id: string;
  }

  export type PlaidLinkOnSuccess = (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => void;
  export type PlaidLinkOnExit = (error: null | PlaidLinkError, metadata: PlaidLinkOnExitMetadata) => void;

  export interface PlaidLinkOptions {
    token: string | null;
    onSuccess: PlaidLinkOnSuccess;
    onExit?: PlaidLinkOnExit;
    onLoad?: () => void;
    onEvent?: (eventName: string, metadata: any) => void;
    receivedRedirectUri?: string;
  }

  export interface UsePlaidLinkReturn {
    error: ErrorEvent | null;
    ready: boolean;
    submit: Function;
    exit: Function;
    open: Function;
  }

  export function usePlaidLink(options: PlaidLinkOptions): UsePlaidLinkReturn;

  export const PlaidLink: React.FC<PlaidLinkOptions & {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }>;
}


export interface ServerErrorDetails {
  status: number;
  type: string;
  message: string;
}

export function getServerErrorDetails(error: any, fallback: string): ServerErrorDetails {
  const backendError = error?.error;

  return {
    status: error?.status ?? backendError?.status ?? 500,
    type: backendError?.error || backendError?.errorType || error?.name || 'INTERNAL_SERVER_ERROR',
    message: backendError?.message || error?.message || fallback
  };
}
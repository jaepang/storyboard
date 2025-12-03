/**
 * 환경 변수 검증 유틸리티
 *
 * 필수 환경 변수가 설정되어 있는지 확인하고,
 * 누락된 경우 명확한 에러 메시지를 제공합니다.
 */

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
}

type EnvKey = keyof EnvConfig;

const REQUIRED_ENV_VARS: EnvKey[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
];

/**
 * 환경 변수 검증 에러
 */
export class EnvValidationError extends Error {
  constructor(
    public missingVars: string[],
    public invalidVars: Array<{ key: string; reason: string }>
  ) {
    super(
      `Environment validation failed:\n${
        missingVars.length > 0 ? `Missing: ${missingVars.join(', ')}\n` : ''
      }${invalidVars.length > 0 ? `Invalid: ${invalidVars.map((v) => `${v.key} (${v.reason})`).join(', ')}` : ''}`
    );
    this.name = 'EnvValidationError';
  }
}

/**
 * 환경 변수가 유효한 URL인지 검증
 */
function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 환경 변수 값 검증
 */
function validateEnvValue(
  key: EnvKey,
  value: string | undefined
): { valid: boolean; reason?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, reason: 'empty or undefined' };
  }

  // URL 형식 검증
  if (key.includes('URL')) {
    if (!isValidUrl(value)) {
      return { valid: false, reason: 'invalid URL format' };
    }
  }

  // Supabase URL 특정 검증
  if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
    if (!value.includes('supabase.co')) {
      return { valid: false, reason: 'not a valid Supabase URL' };
    }
  }

  // Supabase ANON KEY 특정 검증
  if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
    if (value.length < 100) {
      return { valid: false, reason: 'anon key too short' };
    }
  }

  return { valid: true };
}

/**
 * 모든 필수 환경 변수 검증
 *
 * @throws {EnvValidationError} 누락되거나 유효하지 않은 환경 변수가 있는 경우
 */
export function validateEnv(): void {
  const missingVars: string[] = [];
  const invalidVars: Array<{ key: string; reason: string }> = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];

    if (!value) {
      missingVars.push(key);
      continue;
    }

    const validation = validateEnvValue(key, value);
    if (!validation.valid && validation.reason) {
      invalidVars.push({ key, reason: validation.reason });
    }
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    throw new EnvValidationError(missingVars, invalidVars);
  }
}

/**
 * 환경 변수 가져오기 (타입 안전)
 *
 * @throws {Error} 환경 변수가 설정되지 않은 경우
 */
export function getEnv(key: EnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

/**
 * 환경 변수 가져오기 (선택적)
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

/**
 * 개발 환경 여부 확인
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 프로덕션 환경 여부 확인
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 테스트 환경 여부 확인
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

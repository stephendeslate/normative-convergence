import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HttpException,
  HttpStatus,
  ArgumentsHost,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

const createMockArgumentsHost = (): ArgumentsHost => {
  const mockJson = vi.fn();
  const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
  const mockGetResponse = vi.fn().mockReturnValue({ status: mockStatus });
  const mockGetRequest = vi.fn().mockReturnValue({
    method: 'GET',
    url: '/test',
  });

  return {
    switchToHttp: vi.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    }),
    getArgs: vi.fn(),
    getArgByIndex: vi.fn(),
    switchToRpc: vi.fn(),
    switchToWs: vi.fn(),
    getType: vi.fn(),
  } as unknown as ArgumentsHost;
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('should handle HttpException and return correct status', () => {
    const host = createMockArgumentsHost();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    const httpCtx = host.switchToHttp();
    const response = httpCtx.getResponse();
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        path: '/test',
      }),
    );
  });

  it('should handle HttpException with object response', () => {
    const host = createMockArgumentsHost();
    const exception = new HttpException(
      { message: 'Validation failed', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    const httpCtx = host.switchToHttp();
    const response = httpCtx.getResponse();
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
      }),
    );
  });

  it('should handle unknown exceptions as 500 Internal Server Error', () => {
    const host = createMockArgumentsHost();
    const exception = new Error('Something broke');

    filter.catch(exception, host);

    const httpCtx = host.switchToHttp();
    const response = httpCtx.getResponse();
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('should include timestamp and path in response', () => {
    const host = createMockArgumentsHost();
    const exception = new HttpException('Test', HttpStatus.OK);

    filter.catch(exception, host);

    const httpCtx = host.switchToHttp();
    const response = httpCtx.getResponse();
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
        path: '/test',
      }),
    );
  });
});

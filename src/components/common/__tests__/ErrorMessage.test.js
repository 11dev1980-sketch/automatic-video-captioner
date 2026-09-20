/**
 * ErrorMessage Component Tests
 * Tests for error display component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorMessage } from '../ErrorMessage';

// Mock strings
jest.mock('../../localization', () => ({
  strings: {
    errors: {
      generic: 'Er ging iets mis. Probeer het opnieuw.',
      noInternet: 'Geen internetverbinding.',
      authFailed: 'Inloggen mislukt.',
    },
    common: {
      retry: 'Opnieuw proberen',
    },
  },
}));

describe('ErrorMessage Component', () => {
  test('should render error message correctly', () => {
    const error = 'Test error message';
    const { getByText } = render(<ErrorMessage error={error} />);
    
    expect(getByText('Test error message')).toBeTruthy();
  });

  test('should render retry button when onRetry provided', () => {
    const error = 'Test error';
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorMessage error={error} onRetry={onRetry} showRetry={true} />
    );
    
    expect(getByText('Opnieuw proberen')).toBeTruthy();
  });

  test('should not render retry button when showRetry is false', () => {
    const error = 'Test error';
    const onRetry = jest.fn();
    const { queryByText } = render(
      <ErrorMessage error={error} onRetry={onRetry} showRetry={false} />
    );
    
    expect(queryByText('Opnieuw proberen')).toBeFalsy();
  });

  test('should not render retry button when onRetry not provided', () => {
    const error = 'Test error';
    const { queryByText } = render(
      <ErrorMessage error={error} showRetry={true} />
    );
    
    expect(queryByText('Opnieuw proberen')).toBeFalsy();
  });

  test('should call onRetry when retry button is pressed', () => {
    const error = 'Test error';
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorMessage error={error} onRetry={onRetry} showRetry={true} />
    );
    
    const retryButton = getByText('Opnieuw proberen');
    fireEvent.press(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('should map error codes to user-friendly messages', () => {
    const error = { message: 'AUTH_ERROR' };
    const { getByText } = render(<ErrorMessage error={error} />);
    
    expect(getByText('Inloggen mislukt.')).toBeTruthy();
  });

  test('should handle string errors directly', () => {
    const error = 'Direct error string';
    const { getByText } = render(<ErrorMessage error={error} />);
    
    expect(getByText('Direct error string')).toBeTruthy();
  });

  test('should apply custom styles', () => {
    const error = 'Test error';
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <ErrorMessage error={error} style={customStyle} />
    );
    
    const errorContainer = getByTestId('error-message');
    expect(errorContainer.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  test('should handle null error gracefully', () => {
    const { queryByTestId } = render(<ErrorMessage error={null} />);
    
    expect(queryByTestId('error-message')).toBeFalsy();
  });

  test('should handle undefined error gracefully', () => {
    const { queryByTestId } = render(<ErrorMessage error={undefined} />);
    
    expect(queryByTestId('error-message')).toBeFalsy();
  });
});

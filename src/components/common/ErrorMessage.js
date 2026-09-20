/**
 * ErrorMessage Component - Liquid Glass Design
 * Displays user-friendly error messages with optional retry functionality
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { strings } from '../../localization';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function ErrorMessage({ error, onRetry, showRetry = false, style }) {
    // Get user-friendly error message
    const getErrorMessage = (error) => {
        if (typeof error === 'string') {
            return error;
        }
        
        if (error?.message) {
            // Map common error codes to user-friendly messages
            if (error.message.includes('AUTH_ERROR') || error.message.includes('401')) {
                return strings.errors.authFailed || 'Inloggen mislukt. Probeer het opnieuw.';
            }
            if (error.message.includes('NETWORK_ERROR') || error.message.includes('fetch')) {
                return strings.errors.noInternet;
            }
            if (error.message.includes('PERMISSION_DENIED')) {
                return strings.errors.permissionDenied;
            }
            if (error.message.includes('FILE_TOO_LARGE')) {
                return strings.errors.videoTooLarge;
            }
            if (error.message.includes('UNSUPPORTED_FORMAT')) {
                return strings.errors.unsupportedFormat;
            }
            if (error.message.includes('PROCESSING_FAILED')) {
                return strings.errors.processingFailed;
            }
            if (error.message.includes('UPLOAD_FAILED')) {
                return strings.errors.uploadFailed;
            }
            if (error.message.includes('SAVE_FAILED')) {
                return strings.errors.saveFailed;
            }
            if (error.message.includes('DELETE_FAILED')) {
                return strings.errors.deleteFailed;
            }
            if (error.message.includes('SHARE_FAILED')) {
                return strings.errors.shareFailed;
            }
            if (error.message.includes('COPY_FAILED')) {
                return strings.errors.copyFailed;
            }
            
            // Return generic error for unknown errors
            return error.message.includes('fetch') 
                ? strings.errors.noInternet 
                : strings.errors.generic;
        }
        
        return strings.errors.generic;
    };

    const errorMessage = getErrorMessage(error);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.errorContent}>
                <Ionicons 
                    name="alert-circle" 
                    size={20} 
                    color={colors.error} 
                    style={styles.icon}
                />
                <Text style={styles.errorText}>
                    {errorMessage}
                </Text>
            </View>
            
            {showRetry && onRetry && (
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name="refresh" 
                        size={16} 
                        color={colors.primary} 
                        style={styles.retryIcon}
                    />
                    <Text style={styles.retryText}>
                        {strings.common.tryAgain}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.error + '15',
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.error + '30',
        padding: layout.spacing.md,
        marginVertical: layout.spacing.sm,
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: layout.spacing.sm,
        marginTop: 2,
    },
    errorText: {
        flex: 1,
        ...typography.bodySmall,
        color: colors.error,
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: layout.spacing.sm,
        alignSelf: 'flex-start',
        paddingVertical: layout.spacing.sm,
        paddingHorizontal: layout.spacing.md,
        backgroundColor: colors.primary + '10',
        borderRadius: layout.radius.sm,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    retryIcon: {
        marginRight: layout.spacing.xs,
    },
    retryText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
});

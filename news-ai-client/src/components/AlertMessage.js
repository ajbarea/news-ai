import React, { useEffect, useState } from 'react';
import { Alert } from 'reactstrap';
import PropTypes from 'prop-types';

const AlertMessage = ({
    message,
    type = 'info',
    isVisible = true,
    onDismiss = null,
    autoDismiss = false,
    dismissTimeout = 5000,
    className = '',
    style = {}
}) => {
    const [visible, setVisible] = useState(isVisible);

    // Handle auto-dismiss functionality
    useEffect(() => {
        let timer;
        if (autoDismiss && isVisible && message) {
            timer = setTimeout(() => {
                setVisible(false);
                if (onDismiss) onDismiss();
            }, dismissTimeout);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [autoDismiss, dismissTimeout, isVisible, message, onDismiss]);

    // Reset visibility when message changes
    useEffect(() => {
        setVisible(isVisible && !!message);
    }, [isVisible, message]);

    // Don't render anything if there's no message or not visible
    if (!message || !visible) return null;

    return (
        <Alert
            color={type}
            isOpen={visible}
            toggle={onDismiss ? () => {
                setVisible(false);
                onDismiss();
            } : undefined}
            className={`mb-3 ${className}`}
            style={style}
            role="alert"
        >
            {message}
        </Alert>
    );
};

AlertMessage.propTypes = {
    message: PropTypes.string,
    type: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
    isVisible: PropTypes.bool,
    onDismiss: PropTypes.func,
    autoDismiss: PropTypes.bool,
    dismissTimeout: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object
};

export default AlertMessage;
